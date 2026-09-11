package fyooriz.visualstudioacode;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;

import com.fyooriz.visualstudioacode.platform.WorkspaceModel;

import org.junit.Test;

public class WorkspaceModelTest {
    @Test
    public void firstDocumentBecomesActiveAndSnapshotIsIsolated() {
        WorkspaceModel model = new WorkspaceModel();
        WorkspaceModel.DocumentModel first = new WorkspaceModel.DocumentModel(
                "doc-1", "Main.java", "java", "content://workspace/doc-1", false);
        WorkspaceModel.DocumentModel second = new WorkspaceModel.DocumentModel(
                "doc-2", "README.md", "markdown", "content://workspace/doc-2", true);

        model.upsert(first);
        model.upsert(second);

        assertNotNull(model.active());
        assertEquals("doc-1", model.active().id());
        assertEquals(2, model.snapshot().size());
        assertTrue(model.snapshot().containsKey("doc-2"));
    }

    @Test
    public void activateSwitchesToKnownDocumentAndRejectsUnknown() {
        WorkspaceModel model = new WorkspaceModel();
        WorkspaceModel.DocumentModel first = new WorkspaceModel.DocumentModel(
                "doc-1", "Main.java", "java", "content://workspace/doc-1", false);
        WorkspaceModel.DocumentModel second = new WorkspaceModel.DocumentModel(
                "doc-2", "README.md", "markdown", "content://workspace/doc-2", false);

        model.upsert(first);
        model.upsert(second);
        model.activate("doc-2");

        assertEquals("doc-2", model.active().id());
        assertThrows(IllegalArgumentException.class, () -> model.activate("missing"));
        assertEquals("doc-2", model.active().id());
    }

    @Test
    public void upsertRejectsMissingDocumentId() {
        WorkspaceModel model = new WorkspaceModel();
        assertThrows(IllegalArgumentException.class, () -> model.upsert(null));
        assertThrows(IllegalArgumentException.class, () -> model.upsert(
                new WorkspaceModel.DocumentModel("", "file.txt", "text", "content://workspace/doc", false)));
        assertThrows(IllegalArgumentException.class, () -> model.upsert(
                new WorkspaceModel.DocumentModel("   ", "file.txt", "text", "content://workspace/doc", false)));
    }
}
