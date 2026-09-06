package com.fyooriz.visualstudioacode;

import com.fyooriz.visualstudioacode.platform.EngineContracts;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

final class NativeTerminal implements EngineContracts.TerminalBackend {
    interface Callback {
        void onResult(int exitCode, String output);
        void onError(String message);
    }

    private static final long TIMEOUT_SECONDS = 15;
    private static final int MAX_OUTPUT_BYTES = 1024 * 1024;
    private static final long POLL_MILLIS = 50;

    private final ExecutorService executor = Executors.newFixedThreadPool(2);
    private final File workspace;

    NativeTerminal(File filesDir) {
        workspace = new File(filesDir, "workspace");
        if (!workspace.isDirectory() && !workspace.mkdirs()) {
            throw new IllegalStateException("Unable to create terminal workspace");
        }
    }

    @Override
    public CompletableFuture<EngineContracts.TerminalResult> execute(String command) {
        CompletableFuture<EngineContracts.TerminalResult> future = new CompletableFuture<>();
        final String requested = command == null ? "" : command.trim();
        TerminalPolicy.Result policy = TerminalPolicy.validate(requested);
        if (!policy.allowed) {
            future.completeExceptionally(new IllegalArgumentException(policy.message));
            return future;
        }
        final String[] argv = requested.split("\\s+");
        executor.execute(() -> execute(argv, future));
        return future;
    }

    void run(String command, Callback callback) {
        execute(command).whenComplete((result, error) -> {
            if (error != null) {
                String message = error.getCause() != null && error.getCause().getMessage() != null
                        ? error.getCause().getMessage()
                        : (error.getMessage() == null ? "Terminal execution failed" : error.getMessage());
                callback.onError(message);
                return;
            }
            callback.onResult(result.exitCode(), result.output());
        });
    }

    private void execute(String[] argv, CompletableFuture<EngineContracts.TerminalResult> future) {
        Process process = null;
        try {
            ProcessBuilder builder = new ProcessBuilder(argv);
            builder.directory(workspace);
            Map<String, String> env = builder.environment();
            env.put("HOME", workspace.getAbsolutePath());
            env.put("PWD", workspace.getAbsolutePath());
            env.put("LANG", "C.UTF-8");
            builder.redirectErrorStream(true);
            process = builder.start();

            String output = collectOutputUntilExit(process);
            future.complete(new EngineContracts.TerminalResult(process.exitValue(), output));
        } catch (TerminalTimeoutException e) {
            future.completeExceptionally(e);
        } catch (Exception e) {
            future.completeExceptionally(e);
        } finally {
            if (process != null) process.destroyForcibly();
        }
    }

    private String collectOutputUntilExit(Process process)
            throws IOException, InterruptedException, TerminalTimeoutException {
        InputStream input = process.getInputStream();
        ByteArrayOutputStream output = new ByteArrayOutputStream(Math.min(MAX_OUTPUT_BYTES, 8192));
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(TIMEOUT_SECONDS);
        byte[] buffer = new byte[8192];
        boolean truncated = false;

        try (InputStream in = input) {
            while (true) {
                while (in.available() > 0) {
                    int read = in.read(buffer);
                    if (read < 0) break;
                    int remaining = MAX_OUTPUT_BYTES - output.size();
                    if (remaining > 0) {
                        output.write(buffer, 0, Math.min(read, remaining));
                        if (read > remaining) truncated = true;
                    } else {
                        truncated = true;
                    }
                }

                if (!process.isAlive()) {
                    while (in.available() > 0) {
                        int read = in.read(buffer);
                        if (read < 0) break;
                        int remaining = MAX_OUTPUT_BYTES - output.size();
                        if (remaining > 0) {
                            output.write(buffer, 0, Math.min(read, remaining));
                            if (read > remaining) truncated = true;
                        } else {
                            truncated = true;
                        }
                    }
                    break;
                }

                if (System.nanoTime() >= deadline) {
                    process.destroyForcibly();
                    process.waitFor(1, TimeUnit.SECONDS);
                    throw new TerminalTimeoutException("Command timed out after " + TIMEOUT_SECONDS + " seconds");
                }
                Thread.sleep(POLL_MILLIS);
            }
        }

        if (!process.waitFor(1, TimeUnit.SECONDS)) {
            process.destroyForcibly();
            process.waitFor(1, TimeUnit.SECONDS);
        }
        String result = output.toString(StandardCharsets.UTF_8);
        return truncated ? result + "\n[output truncated]" : result;
    }

    void shutdown() {
        executor.shutdownNow();
    }

    private static final class TerminalTimeoutException extends Exception {
        TerminalTimeoutException(String message) { super(message); }
    }
}
