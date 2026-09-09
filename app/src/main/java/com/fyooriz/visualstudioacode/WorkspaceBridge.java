package com.fyooriz.visualstudioacode;

import android.content.Context;
import android.content.Intent;
import android.content.UriPermission;
import android.net.Uri;
import android.provider.DocumentsContract;
import android.provider.OpenableColumns;

import com.fyooriz.visualstudioacode.platform.EngineContracts;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

public final class WorkspaceBridge implements EngineContracts.WorkspaceFileSystem {
    public static final int MAX_TEXT_BYTES = 4 * 1024 * 1024;

    private final Context context;
    private volatile String workspaceTreeUri = "";

    public WorkspaceBridge(Context context) {
        this.context = context.getApplicationContext();
        restorePersistedWorkspaceScope();
    }

    public void adoptSelectedWorkspace(Uri treeUri) throws SecurityException {
        if (treeUri == null || !WorkspaceUriPolicy.isValidTreeUri(treeUri.toString())) {
            throw new SecurityException("Invalid workspace tree URI");
        }
        try {
            context.getContentResolver().takePersistableUriPermission(
                    treeUri,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        } catch (SecurityException e) {
            workspaceTreeUri = "";
            throw e;
        }
        if (!hasPersistedReadWritePermission(treeUri)) {
            workspaceTreeUri = "";
            throw new SecurityException("Workspace read/write permission was not persisted");
        }
        workspaceTreeUri = treeUri.toString();
        context.getSharedPreferences("vsac", Context.MODE_PRIVATE)
                .edit()
                .putString("workspaceTreeUri", workspaceTreeUri)
                .apply();
    }

    public String workspaceTreeUri() {
        restorePersistedWorkspaceScope();
        return workspaceTreeUri;
    }

    public boolean hasWorkspace() {
        return !workspaceTreeUri().isBlank();
    }

    public JSONArray list(String treeUriString, String parentUriString) throws Exception {
        Uri treeUri = requireConfiguredTreeUri(treeUriString);
        if (parentUriString != null && !parentUriString.isBlank()) {
            WorkspaceUriPolicy.requireWithinWorkspace(treeUri.toString(), parentUriString);
        }
        String parentDocumentId = parentUriString == null || parentUriString.isBlank()
                ? DocumentsContract.getTreeDocumentId(treeUri)
                : DocumentsContract.getDocumentId(Uri.parse(parentUriString));
        Uri childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(treeUri, parentDocumentId);
        List<JSONObject> rows = new ArrayList<>();
        try (android.database.Cursor cursor = context.getContentResolver().query(
                childrenUri,
                new String[]{
                        DocumentsContract.Document.COLUMN_DOCUMENT_ID,
                        DocumentsContract.Document.COLUMN_DISPLAY_NAME,
                        DocumentsContract.Document.COLUMN_MIME_TYPE,
                        DocumentsContract.Document.COLUMN_SIZE,
                        DocumentsContract.Document.COLUMN_LAST_MODIFIED
                },
                null,
                null,
                DocumentsContract.Document.COLUMN_DISPLAY_NAME + " COLLATE NOCASE ASC")) {
            if (cursor == null) return new JSONArray();
            while (cursor.moveToNext()) {
                String id = cursor.getString(0);
                String name = cursor.getString(1);
                String mime = cursor.getString(2);
                long size = cursor.isNull(3) ? -1L : cursor.getLong(3);
                long modified = cursor.isNull(4) ? 0L : cursor.getLong(4);
                Uri documentUri = DocumentsContract.buildDocumentUriUsingTree(treeUri, id);
                JSONObject row = new JSONObject();
                row.put("uri", documentUri.toString());
                row.put("name", name == null ? "Unnamed" : name);
                row.put("mime", mime == null ? "" : mime);
                row.put("directory", DocumentsContract.Document.MIME_TYPE_DIR.equals(mime));
                row.put("size", size);
                row.put("modified", modified);
                rows.add(row);
            }
        }
        Collections.sort(rows, Comparator.comparing((JSONObject o) -> o.optBoolean("directory"), Comparator.reverseOrder())
                .thenComparing(o -> o.optString("name"), String.CASE_INSENSITIVE_ORDER));
        JSONArray result = new JSONArray();
        for (JSONObject row : rows) result.put(row);
        return result;
    }

    public String read(String uriString) throws Exception {
        requireTarget(uriString);
        Uri uri = Uri.parse(uriString);
        try (InputStream input = context.getContentResolver().openInputStream(uri)) {
            if (input == null) throw new IOException("Unable to open workspace file");
            byte[] bytes = readLimited(input, MAX_TEXT_BYTES);
            return new String(bytes, StandardCharsets.UTF_8);
        }
    }

    @Override
    public void modify(String uriString, String content) throws Exception {
        write(uriString, content);
    }

    public void write(String uriString, String content) throws Exception {
        requireTarget(uriString);
        byte[] bytes = (content == null ? "" : content).getBytes(StandardCharsets.UTF_8);
        if (bytes.length > MAX_TEXT_BYTES) throw new IOException("Workspace file exceeds 4 MiB limit");
        Uri uri = Uri.parse(uriString);
        try (OutputStream out = context.getContentResolver().openOutputStream(uri, "wt")) {
            if (out == null) throw new IOException("Unable to open workspace output stream");
            out.write(bytes);
            out.flush();
        }
    }

    @Override
    public void create(String parentUriString, String displayName, String content) throws Exception {
        if (parentUriString == null || parentUriString.isBlank()) throw new IOException("No workspace parent selected");
        if (displayName == null || displayName.isBlank()) throw new IOException("Display name is required");
        requireTarget(parentUriString);
        Uri parentUri = Uri.parse(parentUriString);
        Uri created = DocumentsContract.createDocument(
                context.getContentResolver(), parentUri, "text/plain", displayName);
        if (created == null) throw new IOException("Unable to create workspace file");
        requireTarget(created.toString());
        write(created.toString(), content);
    }

    @Override
    public void delete(String uriString) throws Exception {
        requireTarget(uriString);
        if (!DocumentsContract.deleteDocument(context.getContentResolver(), Uri.parse(uriString))) {
            throw new IOException("Unable to delete workspace file");
        }
    }

    public String displayName(String uriString) {
        if (uriString == null || uriString.isBlank()) return "Workspace";
        Uri uri = Uri.parse(uriString);
        try (android.database.Cursor cursor = context.getContentResolver().query(
                uri,
                new String[]{OpenableColumns.DISPLAY_NAME},
                null, null, null)) {
            if (cursor != null && cursor.moveToFirst()) {
                String name = cursor.getString(0);
                if (name != null && !name.isBlank()) return name;
            }
        } catch (Exception ignored) { }
        return "Workspace";
    }

    public boolean isLikelyText(String name, String mime) {
        if (mime != null && mime.startsWith("text/")) return true;
        String lower = name == null ? "" : name.toLowerCase(Locale.ROOT);
        String[] extensions = {
                ".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx", ".html", ".htm", ".css", ".scss", ".sass", ".less",
                ".json", ".jsonc", ".xml", ".svg", ".md", ".markdown", ".txt", ".csv", ".yaml", ".yml", ".toml",
                ".py", ".java", ".kt", ".kts", ".go", ".rs", ".c", ".h", ".cc", ".cpp", ".cxx", ".hpp", ".cs",
                ".dart", ".php", ".rb", ".lua", ".r", ".swift", ".m", ".mm", ".pl", ".pm", ".ex", ".exs",
                ".hs", ".lhs", ".clj", ".cljs", ".groovy", ".gradle", ".scala", ".sc", ".fs", ".fsi", ".fsx",
                ".vb", ".vbs", ".jl", ".zig", ".nim", ".pas", ".pp", ".f", ".for", ".f77", ".f90", ".f95",
                ".f03", ".f08", ".asm", ".s", ".v", ".vh", ".sv", ".svh", ".vhd", ".vhdl", ".proto",
                ".cu", ".cuh", ".glsl", ".vert", ".frag", ".hlsl", ".wgsl", ".sol", ".tex", ".sty", ".bib",
                ".cmake", ".bzl", ".star", ".sh", ".bash", ".zsh", ".fish", ".bat", ".ps1", ".tf", ".hcl",
                ".sql", ".graphql", ".gql", ".smali", ".prisma", ".vue", ".svelte", ".properties", ".ini", ".conf", ".env"
        };
        for (String ext : extensions) if (lower.endsWith(ext)) return true;
        return lower.equals("dockerfile") || lower.equals("makefile") || lower.equals("cmakelists.txt")
                || lower.equals("build") || lower.equals("workspace") || lower.endsWith(".gitignore");
    }

    private void requireTarget(String targetUri) throws SecurityException {
        restorePersistedWorkspaceScope();
        WorkspaceUriPolicy.requireWithinWorkspace(workspaceTreeUri, targetUri);
    }

    private Uri requireConfiguredTreeUri(String requestedTreeUri) throws SecurityException {
        restorePersistedWorkspaceScope();
        if (workspaceTreeUri.isBlank()) throw new SecurityException("No workspace selected");
        if (requestedTreeUri == null || !workspaceTreeUri.equals(requestedTreeUri)) {
            throw new SecurityException("Requested workspace does not match the selected workspace");
        }
        return Uri.parse(workspaceTreeUri);
    }

    private boolean hasPersistedReadWritePermission(Uri uri) {
        boolean grantedRead = false;
        boolean grantedWrite = false;
        for (UriPermission permission : context.getContentResolver().getPersistedUriPermissions()) {
            if (uri.equals(permission.getUri())) {
                grantedRead = permission.isReadPermission();
                grantedWrite = permission.isWritePermission();
                break;
            }
        }
        return grantedRead && grantedWrite;
    }

    private void restorePersistedWorkspaceScope() {
        workspaceTreeUri = "";
        String raw = context.getSharedPreferences("vsac", Context.MODE_PRIVATE)
                .getString("workspaceTreeUri", "");
        if (raw == null || raw.isBlank()) return;
        try {
            if (!WorkspaceUriPolicy.isValidTreeUri(raw)) return;
            Uri candidate = Uri.parse(raw);
            if (hasPersistedReadWritePermission(candidate)) workspaceTreeUri = candidate.toString();
        } catch (Exception ignored) { }
    }

    private byte[] readLimited(InputStream input, int maxBytes) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int total = 0;
        int count;
        while ((count = input.read(buffer)) != -1) {
            if (count > maxBytes - total) throw new IOException("Workspace file exceeds 4 MiB limit");
            out.write(buffer, 0, count);
            total += count;
        }
        return out.toByteArray();
    }
}
