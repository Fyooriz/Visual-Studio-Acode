package com.fyooriz.visualstudioacode.platform;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/** Stable internal contracts used by adapted plugin capabilities. */
public final class EngineContracts {
    private EngineContracts() {}

    public record Document(String uri, String languageId, String text) {}
    public record Position(int line, int character) {}
    public record Range(Position start, Position end) {}
    public record Diagnostic(Range range, int severity, String message, String source) {}
    public record Edit(Range range, String replacement) {}

    public interface LanguageService {
        CompletableFuture<List<Diagnostic>> diagnostics(Document document);
    }
    public interface Formatter {
        CompletableFuture<String> format(Document document);
    }
    public interface Linter {
        CompletableFuture<List<Diagnostic>> lint(Document document);
    }
    public interface TaskExecutor {
        CompletableFuture<Integer> execute(String command, List<String> args, String workingDirectory);
    }
    public interface TerminalBackend {
        CompletableFuture<String> start(String workingDirectory);
        CompletableFuture<Void> write(String sessionId, String input);
        CompletableFuture<Void> stop(String sessionId);
    }
    public interface SourceControl {
        CompletableFuture<String> status(String repositoryPath);
    }
    public interface DatabaseProvider {
        CompletableFuture<List<String>> databases();
    }
    public interface AIProvider {
        CompletableFuture<String> complete(String prompt);
        CompletableFuture<List<Edit>> proposeEdits(Document document, String instruction);
    }
    public interface RemoteFileSystem {
        CompletableFuture<String> read(String uri);
        CompletableFuture<Void> write(String uri, String content);
    }
}
