package com.fyooriz.visualstudioacode.platform;

import java.util.List;

/** One owner per capability; adapted plugins must attach to these owners. */
public final class FeatureRegistry {
    private FeatureRegistry() {}

    public record Feature(String id, String owner, String status) {}

    public static List<Feature> core() {
        return List.of(
            new Feature("editor", "EditorPlatform", "active"),
            new Feature("workspace", "WorkspaceCore", "active"),
            new Feature("diagnostics", "DiagnosticsPlatform", "active"),
            new Feature("lsp", "LanguagePlatform", "adapter-ready"),
            new Feature("format", "DiagnosticsPlatform", "adapter-ready"),
            new Feature("execution", "ExecutionEngine", "native-boundary"),
            new Feature("terminal", "ExecutionEngine", "permission-gated"),
            new Feature("preview", "WebPlatform", "active"),
            new Feature("devtools", "DeveloperTools", "active-adapter"),
            new Feature("git", "SourceControl", "adapter-ready"),
            new Feature("database", "DatabaseStudio", "adapter-ready"),
            new Feature("ai", "AIPlatform", "permission-gated"),
            new Feature("remote", "RemoteWorkspace", "permission-gated"),
            new Feature("project-tools", "ProjectTooling", "adapter-ready")
        );
    }
}
