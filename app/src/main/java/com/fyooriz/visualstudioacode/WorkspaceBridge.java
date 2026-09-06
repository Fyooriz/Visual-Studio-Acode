package com.fyooriz.visualstudioacode;

import android.content.Context;
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

    public WorkspaceBridge(Context context) {
        this.context = context.getApplicationContext();
    }

    public JSONArray list(String treeUriString, String parentUriString) throws Exception {
        Uri treeUri = resolveTreeUri(treeUriString);
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
        Uri parentUri = Uri.parse(parentUriString);
        Uri created = DocumentsContract.createDocument(
                context.getContentResolver(), parentUri, "text/plain", displayName);
        if (created == null) throw new IOException("Unable to create workspace file");
        write(created.toString(), content);
    }

    @Override
    public void delete(String uriString) throws Exception {
        if (uriString == null || uriString.isBlank()) throw new IOException("Workspace file URI is required");
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
                ".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx", ".html", ".htm", ".css", ".scss", ".less",
                ".json", ".xml", ".svg", ".md", ".markdown", ".txt", ".csv", ".yaml", ".yml", ".toml",
                ".py", ".java", ".kt", ".kts", ".go", ".rs", ".c", ".h", ".cc", ".cpp", ".hpp", ".cs",
                ".dart", ".php", ".rb", ".lua", ".sh", ".bash", ".zsh", ".fish", ".sql", ".tf",
                ".dockerfile", ".gradle", ".properties", ".ini", ".conf", ".env"
        };
        for (String ext : extensions) if (lower.endsWith(ext)) return true;
        return lower.equals("dockerfile") || lower.equals("makefile") || lower.endsWith(".gitignore");
    }

    private Uri resolveTreeUri(String treeUriString) throws IOException {
        if (treeUriString != null && !treeUriString.isBlank()) return Uri.parse(treeUriString);
        throw new IOException("No workspace folder selected");
    }

    private byte[] readLimited(InputStream input, int maxBytes) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int total = 0;
        int count;
        while ((count = input.read(buffer)) != -1) {
            int allowed = Math.min(count, maxBytes - total);
            if (allowed > 0) {
                out.write(buffer, 0, allowed);
                total += allowed;
            }
            if (total >= maxBytes) throw new IOException("Workspace file exceeds 4 MiB limit");
        }
        return out.toByteArray();
    }
}
