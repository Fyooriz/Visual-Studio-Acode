package com.fyooriz.visualstudioacode;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

final class NativeTerminal {
    interface Callback {
        void onResult(int exitCode, String output);
        void onError(String message);
    }

    private static final long TIMEOUT_SECONDS = 15;
    private static final int MAX_OUTPUT_CHARS = 1024 * 1024;

    private final ExecutorService executor = Executors.newCachedThreadPool();
    private final java.io.File workspace;

    NativeTerminal(java.io.File filesDir) {
        workspace = new java.io.File(filesDir, "workspace");
        if (!workspace.isDirectory() && !workspace.mkdirs()) {
            throw new IllegalStateException("Unable to create terminal workspace");
        }
    }

    void run(String command, Callback callback) {
        final String requested = command == null ? "" : command.trim();
        if (requested.isEmpty()) {
            callback.onResult(0, "");
            return;
        }
        executor.execute(() -> {
            Process process = null;
            try {
                ProcessBuilder builder = new ProcessBuilder("/system/bin/sh", "-c", requested);
                builder.directory(workspace);
                Map<String, String> env = builder.environment();
                env.put("HOME", workspace.getAbsolutePath());
                env.put("PWD", workspace.getAbsolutePath());
                env.put("LANG", "C.UTF-8");
                builder.redirectErrorStream(true);
                process = builder.start();

                StringBuilder output = new StringBuilder();
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                    char[] buffer = new char[8192];
                    int read;
                    while ((read = reader.read(buffer)) != -1) {
                        int remaining = MAX_OUTPUT_CHARS - output.length();
                        if (remaining <= 0) break;
                        output.append(buffer, 0, Math.min(read, remaining));
                    }
                }

                if (!process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS)) {
                    process.destroyForcibly();
                    callback.onError("Command timed out after " + TIMEOUT_SECONDS + " seconds");
                    return;
                }

                if (output.length() >= MAX_OUTPUT_CHARS) output.append("\n[output truncated]");
                callback.onResult(process.exitValue(), output.toString());
            } catch (Exception e) {
                callback.onError(e.getMessage() == null ? "Terminal execution failed" : e.getMessage());
            } finally {
                if (process != null) process.destroy();
            }
        });
    }

    void shutdown() {
        executor.shutdownNow();
    }
}
