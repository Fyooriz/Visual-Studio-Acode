package com.fyooriz.visualstudioacode.platform;

import java.util.Objects;

/**
 * AIPlatform mutation boundary. Providers/skills authorize here, then delegate
 * the actual filesystem operation to the WorkspaceCore-owned contract.
 */
public final class AIMutationBroker {
    private final EngineContracts.WorkspaceFileSystem workspace;
    private final AIAuditLog auditLog;
    private final String providerId;

    public AIMutationBroker(
        EngineContracts.WorkspaceFileSystem workspace,
        AIAuditLog auditLog,
        String providerId
    ) {
        this.workspace = Objects.requireNonNull(workspace, "workspace");
        this.auditLog = Objects.requireNonNull(auditLog, "auditLog");
        if (providerId == null || providerId.isBlank()) throw new IllegalArgumentException("providerId must be non-blank");
        this.providerId = providerId;
    }

    public void modifyFile(String target, String content, boolean userApproved) throws Exception {
        mutate(AIPermissionGate.Action.MODIFY_FILE, target, userApproved, () -> workspace.modify(target, content));
    }

    public void createFile(String parentUri, String displayName, String content, boolean userApproved) throws Exception {
        requireTarget(parentUri);
        if (displayName == null || displayName.isBlank()) throw new IllegalArgumentException("displayName must be non-blank");
        mutate(AIPermissionGate.Action.CREATE_FILE, parentUri, userApproved,
                () -> workspace.create(parentUri, displayName, content));
    }

    public void deleteFile(String target, boolean userApproved) throws Exception {
        mutate(AIPermissionGate.Action.DELETE_FILE, target, userApproved, () -> workspace.delete(target));
    }

    private void mutate(
        AIPermissionGate.Action action,
        String target,
        boolean userApproved,
        ThrowingMutation mutation
    ) throws Exception {
        requireTarget(target);
        if (!AIPermissionGate.allowed(action, userApproved, false)) {
            auditLog.record(action, providerId, "workspace", "denied");
            throw new SecurityException("AI mutation requires user approval: " + action);
        }
        try {
            mutation.run();
            auditLog.record(action, providerId, "workspace", "approved");
        } catch (Exception error) {
            auditLog.record(action, providerId, "workspace", "failed");
            throw error;
        }
    }

    private static void requireTarget(String target) {
        if (target == null || target.isBlank()) throw new IllegalArgumentException("target must be non-blank");
    }

    @FunctionalInterface
    private interface ThrowingMutation {
        void run() throws Exception;
    }
}
