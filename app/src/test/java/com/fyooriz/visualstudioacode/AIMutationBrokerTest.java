package com.fyooriz.visualstudioacode;

import com.fyooriz.visualstudioacode.platform.AIAuditLog;
import com.fyooriz.visualstudioacode.platform.AIMutationBroker;
import com.fyooriz.visualstudioacode.platform.EngineContracts;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;

public final class AIMutationBrokerTest {
    @Test
    public void deniedMutationDoesNotTouchWorkspaceAndIsAudited() {
        RecordingWorkspace workspace = new RecordingWorkspace();
        AIAuditLog audit = new AIAuditLog();
        AIMutationBroker broker = new AIMutationBroker(workspace, audit, "provider");

        assertThrows(SecurityException.class, () -> broker.modifyFile("file.txt", "x", false));
        assertEquals(List.of(), workspace.operations);
        assertEquals(1, audit.snapshot().size());
        assertEquals("denied", audit.snapshot().get(0).result());
    }

    @Test
    public void approvedMutationDelegatesAndIsAudited() throws Exception {
        RecordingWorkspace workspace = new RecordingWorkspace();
        AIAuditLog audit = new AIAuditLog();
        AIMutationBroker broker = new AIMutationBroker(workspace, audit, "provider");

        broker.modifyFile("file.txt", "x", true);
        assertEquals(List.of("modify:file.txt:x"), workspace.operations);
        assertEquals("approved", audit.snapshot().get(0).result());
    }

    @Test
    public void createMutationUsesParentAndDisplayName() throws Exception {
        RecordingWorkspace workspace = new RecordingWorkspace();
        AIAuditLog audit = new AIAuditLog();
        AIMutationBroker broker = new AIMutationBroker(workspace, audit, "provider");

        broker.createFile("workspace", "new.txt", "content", true);
        assertEquals(List.of("create:workspace:new.txt:content"), workspace.operations);
        assertEquals("approved", audit.snapshot().get(0).result());
    }

    @Test
    public void failedMutationIsAuditedAndErrorPropagates() {
        RecordingWorkspace workspace = new RecordingWorkspace();
        workspace.fail = true;
        AIAuditLog audit = new AIAuditLog();
        AIMutationBroker broker = new AIMutationBroker(workspace, audit, "provider");

        assertThrows(Exception.class, () -> broker.deleteFile("file.txt", true));
        assertEquals("failed", audit.snapshot().get(0).result());
    }

    private static final class RecordingWorkspace implements EngineContracts.WorkspaceFileSystem {
        private final List<String> operations = new ArrayList<>();
        private boolean fail;

        @Override
        public void modify(String target, String content) throws Exception {
            if (fail) throw new Exception("mutation failed");
            operations.add("modify:" + target + ":" + content);
        }

        @Override
        public void create(String parentUri, String displayName, String content) throws Exception {
            if (fail) throw new Exception("mutation failed");
            operations.add("create:" + parentUri + ":" + displayName + ":" + content);
        }

        @Override
        public void delete(String target) throws Exception {
            if (fail) throw new Exception("mutation failed");
            operations.add("delete:" + target);
        }
    }
}
