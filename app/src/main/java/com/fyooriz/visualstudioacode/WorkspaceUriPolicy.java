package com.fyooriz.visualstudioacode;

import java.net.URI;
import java.net.URISyntaxException;

/** WorkspaceCore boundary that keeps SAF document operations inside the selected tree. */
public final class WorkspaceUriPolicy {
    private WorkspaceUriPolicy() {}

    public static void requireWithinWorkspace(String workspaceTreeUri, String targetUri) throws SecurityException {
        if (!isWithinWorkspace(workspaceTreeUri, targetUri)) {
            throw new SecurityException("Workspace URI is outside the selected workspace");
        }
    }

    public static boolean isValidTreeUri(String workspaceTreeUri) {
        if (workspaceTreeUri == null || workspaceTreeUri.isBlank()) return false;
        try {
            URI tree = new URI(workspaceTreeUri);
            if (!"content".equalsIgnoreCase(tree.getScheme())) return false;
            if (tree.getRawAuthority() == null || tree.getRawAuthority().isBlank()) return false;
            if (tree.getRawQuery() != null || tree.getRawFragment() != null) return false;
            String treePath = tree.getRawPath();
            if (treePath == null || !treePath.startsWith("/tree/")) return false;
            return treePath.length() > "/tree/".length();
        } catch (URISyntaxException ignored) {
            return false;
        }
    }

    public static boolean isWithinWorkspace(String workspaceTreeUri, String targetUri) {
        if (!isValidTreeUri(workspaceTreeUri)
                || targetUri == null || targetUri.isBlank()) return false;
        try {
            URI tree = new URI(workspaceTreeUri);
            URI target = new URI(targetUri);
            if (!"content".equalsIgnoreCase(target.getScheme())) return false;
            if (target.getRawAuthority() == null || !tree.getRawAuthority().equals(target.getRawAuthority())) return false;
            String treePath = tree.getRawPath();
            String targetPath = target.getRawPath();
            if (treePath == null || targetPath == null) return false;
            if (targetPath.equals(treePath)) return true;
            return targetPath.startsWith(treePath.endsWith("/") ? treePath : treePath + "/");
        } catch (URISyntaxException ignored) {
            return false;
        }
    }
}
