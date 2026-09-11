package fyooriz.visualstudioacode;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import com.fyooriz.visualstudioacode.WorkspaceUriPolicy;

import org.junit.Test;

public class WorkspaceUriPolicyTest {
    private static final String TREE = "content://com.example.documents/tree/primary%3AProjects";

    @Test
    public void acceptsValidTreeUri() {
        assertTrue(WorkspaceUriPolicy.isValidTreeUri(TREE));
    }

    @Test
    public void rejectsInvalidTreeUriShape() {
        assertFalse(WorkspaceUriPolicy.isValidTreeUri(
                "content://com.example.documents/document/primary%3AProjects"));
        assertFalse(WorkspaceUriPolicy.isValidTreeUri(
                "content://com.example.documents/tree/"));
        assertFalse(WorkspaceUriPolicy.isValidTreeUri(
                "content://com.example.documents/tree/primary%3AProjects?query=1"));
        assertFalse(WorkspaceUriPolicy.isValidTreeUri(
                "content://com.example.documents/tree/primary%3AProjects#fragment"));
        assertFalse(WorkspaceUriPolicy.isValidTreeUri(
                "file:///primary/Projects/tree/primary%3AProjects"));
    }

    @Test
    public void acceptsTreeAndDescendantUris() {
        assertTrue(WorkspaceUriPolicy.isWithinWorkspace(TREE, TREE));
        assertTrue(WorkspaceUriPolicy.isWithinWorkspace(
                TREE,
                TREE + "/document/primary%3AProjects%2Fdemo%2FMain.java"));
    }

    @Test
    public void rejectsSiblingTreeAndPrefixCollision() {
        assertFalse(WorkspaceUriPolicy.isWithinWorkspace(
                TREE,
                "content://com.example.documents/tree/primary%3AProjects2/document/primary%3AProjects2%2Fa.txt"));
        assertFalse(WorkspaceUriPolicy.isWithinWorkspace(
                TREE,
                "content://com.example.documents/tree/primary%3AOther/document/primary%3AOther%2Fa.txt"));
    }

    @Test
    public void rejectsDifferentAuthorityAndScheme() {
        assertFalse(WorkspaceUriPolicy.isWithinWorkspace(
                TREE,
                "content://other.documents/tree/primary%3AProjects/document/x"));
        assertFalse(WorkspaceUriPolicy.isWithinWorkspace(
                TREE,
                "file:///primary/Projects/demo.txt"));
    }

    @Test
    public void rejectsTargetQueryAndFragment() {
        assertFalse(WorkspaceUriPolicy.isWithinWorkspace(
                TREE,
                TREE + "/document/primary%3AProjects%2Fdemo%2FMain.java?query=1"));
        assertFalse(WorkspaceUriPolicy.isWithinWorkspace(
                TREE,
                TREE + "/document/primary%3AProjects%2Fdemo%2FMain.java#fragment"));
    }

    @Test
    public void rejectsBlankAndMalformedUris() {
        assertFalse(WorkspaceUriPolicy.isWithinWorkspace("", TREE));
        assertFalse(WorkspaceUriPolicy.isWithinWorkspace(TREE, ""));
        assertFalse(WorkspaceUriPolicy.isWithinWorkspace(TREE, "not a uri"));
        assertFalse(WorkspaceUriPolicy.isValidTreeUri("not a uri"));
    }

    @Test
    public void requireWithinWorkspaceThrowsForOutOfScopeTarget() {
        try {
            WorkspaceUriPolicy.requireWithinWorkspace(
                    TREE,
                    "content://com.example.documents/tree/primary%3AOther/document/x");
            fail("Expected SecurityException");
        } catch (SecurityException expected) {
            // Expected security boundary failure.
        }
    }
}
