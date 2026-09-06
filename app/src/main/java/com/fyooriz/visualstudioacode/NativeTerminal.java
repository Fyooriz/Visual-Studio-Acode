package com.fyooriz.visualstudioacode;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

final class NativeTerminal {
    interface Callback {
        void onResult(int exitCode, String output);
        void onError(String message);
    }

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
            try {
                ProcessBuilder builder = new ProcessBuilder("/system/bin/sh", "-c", requested);
                builder.directory(workspace);
                Map<String, String> env = builder.environment();
                env.put("HOME", workspace.getAbsolutePath());
                env.put("PWD", workspace.getAbsolutePath());
                env.put("LANG", "C.UTF-8");
                builder.redirectErrorStream(true);
                Process process = builder.start();

                StringBuilder output = new StringBuilder();
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) output.append(line).append('\n');
                }
                int exitCode = process.waitFor();
                callback.onResult(exitCode, output.toString());
            } catch (Exception e) {
                callback.onError(e.getMessage() == null ? "Terminal execution failed" : e.getMessage());
            }
        });
    }

    void shutdown() {
        executor.shutdownNow();
    }
}
