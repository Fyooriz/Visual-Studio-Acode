package com.fyooriz.visualstudioacode;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.URI;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

final class NativeHttp {
    private static final int CONNECT_TIMEOUT_MILLIS = 10000;
    private static final int READ_TIMEOUT_MILLIS = 15000;
    private static final int MAX_BODY_BYTES = 2 * 1024 * 1024;
    private static final int MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
    private static final Set<String> ALLOWED_METHODS = Set.of("GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
    private static final Set<String> BLOCKED_HEADERS = Set.of(
            "connection", "content-length", "cookie", "cookie2", "host", "keep-alive",
            "proxy-authorization", "proxy-connection", "te", "trailer", "transfer-encoding", "upgrade"
    );

    private NativeHttp() {}

    static Result request(String method, String url, String headers, String body) throws Exception {
        URI uri = validateRequest(method, url);
        HttpURLConnection connection = (HttpURLConnection) uri.toURL().openConnection();
        connection.setRequestMethod(normalizeMethod(method));
        connection.setConnectTimeout(CONNECT_TIMEOUT_MILLIS);
        connection.setReadTimeout(READ_TIMEOUT_MILLIS);
        connection.setInstanceFollowRedirects(false);
        connection.setUseCaches(false);
        applyHeaders(connection, headers);

        String safeBody = body == null ? "" : body;
        if (!safeBody.isEmpty() && !"GET".equalsIgnoreCase(connection.getRequestMethod()) && !"HEAD".equalsIgnoreCase(connection.getRequestMethod())) {
            byte[] bytes = safeBody.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            if (bytes.length > MAX_BODY_BYTES) throw new IllegalArgumentException("Request body exceeds 2 MiB limit");
            connection.setDoOutput(true);
            if (connection.getRequestProperty("Content-Type") == null) connection.setRequestProperty("Content-Type", "application/json");
            try (java.io.OutputStream out = connection.getOutputStream()) { out.write(bytes); }
        }

        try {
            int code = connection.getResponseCode();
            InputStream stream = code >= 400 ? connection.getErrorStream() : connection.getInputStream();
            String responseBody = stream == null ? "" : readUtf8(stream);
            StringBuilder responseHeaders = new StringBuilder();
            for (Map.Entry<String, List<String>> entry : connection.getHeaderFields().entrySet()) {
                if (entry.getKey() == null || entry.getValue() == null) continue;
                for (String value : entry.getValue()) responseHeaders.append(entry.getKey()).append(": ").append(value).append('\n');
            }
            String redirect = connection.getHeaderField("Location");
            return new Result(code, responseHeaders.toString(), responseBody, redirect == null ? "" : redirect);
        } finally {
            connection.disconnect();
        }
    }

    static URI validateRequest(String method, String url) throws Exception {
        URI uri = URI.create(url == null ? "" : url);
        if (!"https".equalsIgnoreCase(uri.getScheme())) {
            throw new IllegalArgumentException("Only HTTPS URLs are allowed by the native API boundary");
        }
        if (uri.getHost() == null || uri.getHost().isBlank()) {
            throw new IllegalArgumentException("A valid HTTPS host is required");
        }
        if (uri.getUserInfo() != null) {
            throw new IllegalArgumentException("HTTPS URLs must not contain embedded credentials");
        }
        String normalizedMethod = normalizeMethod(method);
        if (!ALLOWED_METHODS.contains(normalizedMethod)) {
            throw new IllegalArgumentException("HTTP method is not allowed by the native API boundary");
        }

        // Resolve once and reject local/reserved addresses to reduce WebView-to-device SSRF risk.
        for (InetAddress address : InetAddress.getAllByName(uri.getHost())) {
            if (address.isAnyLocalAddress()
                    || address.isLoopbackAddress()
                    || address.isLinkLocalAddress()
                    || address.isSiteLocalAddress()
                    || address.isMulticastAddress()) {
                throw new IllegalArgumentException("Local or reserved network targets are blocked");
            }
        }
        return uri;
    }

    static String normalizeMethod(String method) {
        return method == null || method.isBlank() ? "GET" : method.trim().toUpperCase(Locale.ROOT);
    }

    private static void applyHeaders(HttpURLConnection connection, String rawHeaders) {
        if (rawHeaders == null || rawHeaders.isBlank()) return;
        for (String line : rawHeaders.split("\\r?\\n")) {
            int split = line.indexOf(':');
            if (split <= 0) continue;
            String name = line.substring(0, split).trim();
            String value = line.substring(split + 1).trim();
            if (name.isEmpty() || BLOCKED_HEADERS.contains(name.toLowerCase(Locale.ROOT))) continue;
            connection.setRequestProperty(name, value);
        }
    }

    private static String readUtf8(InputStream stream) throws Exception {
        try (InputStream in = stream; ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192];
            int total = 0;
            int read;
            while ((read = in.read(buffer)) != -1) {
                int allowed = Math.min(read, MAX_RESPONSE_BYTES - total);
                if (allowed <= 0) break;
                out.write(buffer, 0, allowed);
                total += allowed;
            }
            String value = out.toString("UTF-8");
            return total >= MAX_RESPONSE_BYTES ? value + "\n[response truncated]" : value;
        }
    }

    static final class Result {
        final int status;
        final String headers;
        final String body;
        final String redirect;

        Result(int status, String headers, String body, String redirect) {
            this.status = status;
            this.headers = headers;
            this.body = body;
            this.redirect = redirect;
        }
    }
}
