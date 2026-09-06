package com.fyooriz.visualstudioacode;

import com.fyooriz.visualstudioacode.platform.AIAuditLog;
import com.fyooriz.visualstudioacode.platform.AIPermissionGate;
import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public final class AIPermissionGateTest {
    @Test
    public void readAndSuggestDoNotRequireApproval() {
        assertTrue(AIPermissionGate.allowedWithoutConfirmation(AIPermissionGate.Action.READ_FILE));
        assertTrue(AIPermissionGate.allowedWithoutConfirmation(AIPermissionGate.Action.SUGGEST_CODE));
        assertTrue(AIPermissionGate.allowed(AIPermissionGate.Action.READ_FILE, false, false));
        assertTrue(AIPermissionGate.allowed(AIPermissionGate.Action.SUGGEST_CODE, false, false));
    }

    @Test
    public void mutationsRequireApproval() {
        assertFalse(AIPermissionGate.allowed(AIPermissionGate.Action.MODIFY_FILE, false, false));
        assertFalse(AIPermissionGate.allowed(AIPermissionGate.Action.CREATE_FILE, false, false));
        assertFalse(AIPermissionGate.allowed(AIPermissionGate.Action.DELETE_FILE, false, false));
        assertFalse(AIPermissionGate.allowed(AIPermissionGate.Action.EXECUTE_SHELL, false, false));
        assertFalse(AIPermissionGate.allowed(AIPermissionGate.Action.GIT_OPERATION, false, false));
    }

    @Test
    public void buildTestMayUseExplicitAutoRun() {
        assertFalse(AIPermissionGate.allowed(AIPermissionGate.Action.BUILD_TEST, false, false));
        assertTrue(AIPermissionGate.allowed(AIPermissionGate.Action.BUILD_TEST, false, true));
    }

    @Test
    public void remotePushAlwaysRequiresConfirmation() {
        assertTrue(AIPermissionGate.requiresConfirmationAlways(AIPermissionGate.Action.REMOTE_PUSH));
        assertFalse(AIPermissionGate.allowed(AIPermissionGate.Action.REMOTE_PUSH, false, true));
    }

    @Test
    public void auditLogContainsOnlyActionMetadata() {
        AIAuditLog log = new AIAuditLog();
        log.record(AIPermissionGate.Action.MODIFY_FILE, "provider", "workspace", "approved");
        assertEquals(1, log.snapshot().size());
        assertEquals(AIPermissionGate.Action.MODIFY_FILE, log.snapshot().get(0).action());
        assertEquals("workspace", log.snapshot().get(0).targetScope());
        assertTrue(log.snapshot().get(0).timestamp() != null);
    }
}
