package com.fyooriz.visualstudioacode;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.util.List;
import java.util.Map;

final class NativeHttp {
    private NativeHttp() {}

    static Result request(String method, String url, String headers, String body) throws Exception {
        URI uri = URI.create(url);
        String scheme = uri.getScheme();
        if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) {
            throw new IllegalArgumentException("Only http:// and https:// URLs are allowed");
        }
        HttpURLConnection connection = (HttpURLConnection) uri.toURL().openConnection();
        connection.setRequestMethod(method == null || method.isBlank() ? "GET" : method.toUpperCase());
        connection.setConnectTimeout(15000);
        connection.setReadTimeout(30000);
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
            connection.getOutputStream().write(bytes);
        }

        int code = connection.getResponseCode();
        InputStream stream = code >= 400 ? connection.getErrorStream() : connection.getInputStream();
        String responseBody = stream == null ? "" : readUtf8(stream);
        StringBuilder responseHeaders = new StringBuilder();
        for (Map.Entry<String, List<String>> entry : connection.getHeaderFields().entrySet()) {
            if (entry.getKey() == null || entry.getValue() == null) continue;
            for (String value : entry.getValue()) {
                responseHeaders.append(entry.getKey()).append(": ").append(value).append('\n');
            }
        }
        String redirect = connection.getHeaderField("Location");
        connection.disconnect();
        return new Result(code, responseHeaders.toString(), responseBody, redirect == null ? "" : redirect);
    }

    private static String readUtf8(InputStream stream) throws Exception {
        try (InputStream in = stream; ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192];
            int read;
            while ((read = in.read(buffer)) != -1) out.write(buffer, 0, read);
            return out.toString("UTF-8");
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
