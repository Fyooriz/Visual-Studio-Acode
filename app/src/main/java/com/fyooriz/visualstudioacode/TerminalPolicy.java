package com.fyooriz.visualstudioacode;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Policy gate for the built-in Android terminal.
 *
 * The default terminal is intentionally a restricted command surface. A future
 * Termux/remote provider can expose a fuller shell through the same interface
 * after its own permission and resource policy is established.
 */
final class TerminalPolicy {
    private static final Set<String> ALLOWED_COMMANDS = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList("pwd", "ls", "cat", "head", "tail", "echo", "mkdir", "touch")));

    private static final Set<String> FORBIDDEN_TOKENS = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList(";", "&&", "||", "|", ">", "<", "`", "$(", "${", "\\n")));

    private TerminalPolicy() {}

    static Result validate(String command) {
        String requested = command == null ? "" : command.trim();
        if (requested.isEmpty()) return Result.reject("Command is empty");
        for (String token : FORBIDDEN_TOKENS) {
            if (requested.contains(token)) return Result.reject("Shell operators and command substitution are disabled in the built-in terminal");
        }
        if (requested.indexOf('\'') >= 0 || requested.indexOf('"') >= 0) {
            return Result.reject("Quoted shell expressions are disabled in the built-in terminal");
        }

        String[] parts = requested.split("\\s+");
        if (parts.length == 0 || !ALLOWED_COMMANDS.contains(parts[0])) {
            return Result.reject("Command is not available in the restricted terminal");
        }

        for (int i = 1; i < parts.length; i++) {
            String part = parts[i];
            if (part.contains("..")) return Result.reject("Path traversal is not allowed");
            if (part.startsWith("/")) return Result.reject("Absolute paths are not allowed");
            if (part.startsWith("~")) return Result.reject("Home-directory expansion is not allowed");
        }
        return Result.allow();
    }

    static final class Result {
        final boolean allowed;
        final String message;

        private Result(boolean allowed, String message) {
            this.allowed = allowed;
            this.message = message;
        }

        static Result allow() { return new Result(true, ""); }
        static Result reject(String message) { return new Result(false, message); }
    }
}
