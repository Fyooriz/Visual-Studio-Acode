package com.fyooriz.visualstudioacode;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.util.List;
import java.util.Map;

final class NativeHttp {
    private static final int MAX_RESPONSE_BYTES = 2 * 1024 * 1024;

    private NativeHttp() {}

    static Result request(String method, String url, String headers, String body) throws Exception {
        URI uri = URI.create(url);
        String scheme = uri.getScheme();
        if (!"https".equalsIgnoreCase(scheme)) {
            throw new IllegalArgumentException("Only HTTPS URLs are allowed by the native API boundary");
        }
        HttpURLConnection connection = (HttpURLConnection) uri.toURL().openConnection();
        connection.setRequestMethod(method == null || method.isBlank() ? "GET" : method.toUpperCase());
        connection.setConnectTimeout(10000);
        connection.setReadTimeout(15000);
        connection.setInstanceFollowRedirects(false);
        connection.setUseCaches(false);

        if (headers != null && !headers.isBlank()) {
            for (String line : headers.split("\\r?\\n")) {
                int split = line.indexOf(':');
                if (split > 0) {
                    String name = line.substring(0, split).trim();
                    String value = line.substring(split + 1).trim();
                    if (!name.isEmpty()) connection.setRequestProperty(name, value);
                }
            }
        }

        String safeBody = body == null ? "" : body;
        if (!safeBody.isEmpty() && !"GET".equalsIgnoreCase(connection.getRequestMethod()) && !"HEAD".equalsIgnoreCase(connection.getRequestMethod())) {
            connection.setDoOutput(true);
            byte[] bytes = safeBody.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            if (bytes.length > MAX_RESPONSE_BYTES) throw new IllegalArgumentException("Request body is too large");
            try (java.io.OutputStream out = connection.getOutputStream()) {
                out.write(bytes);
            }
        }

        int code = connection.getResponseCode();
        InputStream stream = code >= 400 ? connection.getErrorStream() : connection.getInputStream();
        String responseBody = stream == null ? "" : readUtf8(stream);
        StringBuilder responseHeaders = new StringBuilder();
        for (Map.Entry<String, List<String>> entry : connection.getHeaderFields().entrySet()) {
            if (entry.getKey() == null || entry.getValue() == null) continue;
            for (String value : entry.getValue()) responseHeaders.append(entry.getKey()).append(": ").append(value).append('\n');
        }
        String redirect = connection.getHeaderField("Location");
        connection.disconnect();
        return new Result(code, responseHeaders.toString(), responseBody, redirect == null ? "" : redirect);
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
