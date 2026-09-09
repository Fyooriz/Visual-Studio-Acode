package com.fyooriz.visualstudioacode;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class MainActivity extends Activity {
    private static final int REQUEST_OPEN = 4101;
    private static final int REQUEST_CREATE = 4102;
    private static final int REQUEST_WORKSPACE = 4103;
    private static final int HTTP_TIMEOUT_MILLIS = 15000;
    private static final boolean TERMINAL_SECURITY_GATE_PASSED = false;

    private WebView webView;
    private Uri currentDocumentUri;
    private String pendingSaveContent = "";
    private ExecutorService ioExecutor;
    private NativeTerminal nativeTerminal;
    private WorkspaceBridge workspaceBridge;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ioExecutor = Executors.newCachedThreadPool();
        nativeTerminal = new NativeTerminal(getFilesDir());
        workspaceBridge = new WorkspaceBridge(this);

        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(true);

        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) { return true; }
        });
        webView.setWebChromeClient(new WebChromeClient());
        webView.addJavascriptInterface(new VSACBridge(), "VSACNative");
        setContentView(webView);
        webView.loadUrl("file:///android_asset/index.html");
    }

    private void openTextFile() {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("text/*");
        startActivityForResult(intent, REQUEST_OPEN);
    }

    private void openWorkspace() {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION
                | Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION
                | Intent.FLAG_GRANT_PREFIX_URI_PERMISSION);
        startActivityForResult(intent, REQUEST_WORKSPACE);
    }

    private void createTextFile(String suggestedName, String content) {
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("text/plain");
        intent.putExtra(Intent.EXTRA_TITLE, suggestedName == null || suggestedName.isBlank() ? "untitled.txt" : suggestedName);
        pendingSaveContent = content == null ? "" : content;
        startActivityForResult(intent, REQUEST_CREATE);
    }

    private void saveToUri(Uri uri, String content) {
        try (OutputStream out = getContentResolver().openOutputStream(uri, "wt")) {
            if (out == null) throw new IOException("Unable to open output stream");
            out.write((content == null ? "" : content).getBytes(StandardCharsets.UTF_8));
            out.flush();
            currentDocumentUri = uri;
            notifySaveResult(true, "Saved");
        } catch (Exception e) {
            notifySaveResult(false, e.getMessage() == null ? "Save failed" : e.getMessage());
        }
    }

    private void notifySaveResult(boolean ok, String message) {
        if (webView == null) return;
        String payload = "window.VSAC&&window.VSAC.nativeSaveResult(" + JSONObject.quote(message) + "," + ok + ");";
        runOnUiThread(() -> webView.evaluateJavascript(payload, null));
    }

    private void notifyOpenResult(String name, String content) {
        if (webView == null) return;
        String payload = "window.VSAC&&window.VSAC.nativeOpenResult(" + JSONObject.quote(name == null ? "untitled.txt" : name) + "," + JSONObject.quote(content == null ? "" : content) + ");";
        runOnUiThread(() -> webView.evaluateJavascript(payload, null));
    }

    private void notifyOpenError(String message) {
        if (webView == null) return;
        String payload = "window.VSAC&&window.VSAC.nativeOpenError(" + JSONObject.quote(message) + ");";
        runOnUiThread(() -> webView.evaluateJavascript(payload, null));
    }

    private void notifyWorkspaceResult(String treeUri, String name) {
        if (webView == null) return;
        String payload = "window.VSAC&&window.VSAC.workspaceOpened(" + JSONObject.quote(treeUri) + "," + JSONObject.quote(name) + ");";
        runOnUiThread(() -> webView.evaluateJavascript(payload, null));
    }

    private void notifyWorkspaceError(String message) {
        if (webView == null) return;
        String payload = "window.VSAC&&window.VSAC.workspaceError(" + JSONObject.quote(message) + ");";
        runOnUiThread(() -> webView.evaluateJavascript(payload, null));
    }

    private void notifyWorkspaceReadResult(String uri, String name, String mime, String content) {
        if (webView == null) return;
        String payload = "window.VSAC&&window.VSAC.workspaceReadResult(" + JSONObject.quote(uri) + "," + JSONObject.quote(name) + "," + JSONObject.quote(mime) + "," + JSONObject.quote(content) + ");";
        runOnUiThread(() -> webView.evaluateJavascript(payload, null));
    }

    private void notifyWorkspaceWriteResult(String uri, boolean ok, String message) {
        if (webView == null) return;
        String payload = "window.VSAC&&window.VSAC.workspaceWriteResult(" + JSONObject.quote(uri) + "," + ok + "," + JSONObject.quote(message) + ");";
        runOnUiThread(() -> webView.evaluateJavascript(payload, null));
    }

    private void notifyTerminalResult(int exitCode, String output) {
        if (webView == null) return;
        String payload = "window.VSAC&&window.VSAC.nativeTerminalResult(" + exitCode + "," + JSONObject.quote(output) + ");";
        runOnUiThread(() -> webView.evaluateJavascript(payload, null));
    }

    private void notifyTerminalError(String message) {
        if (webView == null) return;
        String payload = "window.VSAC&&window.VSAC.nativeTerminalError(" + JSONObject.quote(message) + ");";
        runOnUiThread(() -> webView.evaluateJavascript(payload, null));
    }

    private void notifyApiResult(int status, String headers, String body, String redirect) {
        if (webView == null) return;
        String payload = "window.VSAC&&window.VSAC.nativeApiResult(" + status + "," + JSONObject.quote(headers == null ? "" : headers) + "," + JSONObject.quote(body == null ? "" : body) + "," + JSONObject.quote(redirect == null ? "" : redirect) + ");";
        runOnUiThread(() -> webView.evaluateJavascript(payload, null));
    }

    private void notifyApiError(String message) {
        if (webView == null) return;
        String payload = "window.VSAC&&window.VSAC.nativeApiError(" + JSONObject.quote(message) + ");";
        runOnUiThread(() -> webView.evaluateJavascript(payload, null));
    }

    private void runTerminal(String command) {
        if (!TERMINAL_SECURITY_GATE_PASSED) {
            notifyTerminalError("Terminal execution is blocked until the OS/container security baseline is verified.");
            return;
        }
        if (nativeTerminal == null) { notifyTerminalError("Terminal is not initialized"); return; }
        nativeTerminal.run(command, new NativeTerminal.Callback() {
            @Override public void onResult(int exitCode, String output) { notifyTerminalResult(exitCode, output); }
            @Override public void onError(String message) { notifyTerminalError(message); }
        });
    }

    private void httpRequest(String method, String urlString, String rawHeaders, String body) {
        if (urlString == null || !urlString.startsWith("https://")) {
            notifyApiError("Only HTTPS URLs are allowed by the native API boundary.");
            return;
        }
        ioExecutor.execute(() -> {
            HttpURLConnection connection = null;
            try {
                URL url = new URL(urlString);
                connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod(method == null || method.isBlank() ? "GET" : method.toUpperCase());
                connection.setConnectTimeout(HTTP_TIMEOUT_MILLIS);
                connection.setReadTimeout(HTTP_TIMEOUT_MILLIS);
                connection.setInstanceFollowRedirects(false);
                connection.setUseCaches(false);
                applyHeaders(connection, rawHeaders);
                boolean hasBody = body != null && !body.isEmpty() && !List.of("GET", "HEAD").contains(connection.getRequestMethod());
                if (hasBody) {
                    if (body.getBytes(StandardCharsets.UTF_8).length > 2 * 1024 * 1024) throw new IOException("Request body exceeds 2 MiB limit");
                    connection.setDoOutput(true);
                    if (connection.getRequestProperty("Content-Type") == null) connection.setRequestProperty("Content-Type", "application/json");
                    try (OutputStream out = connection.getOutputStream()) { out.write(body.getBytes(StandardCharsets.UTF_8)); }
                }
                int status = connection.getResponseCode();
                String headers = flattenHeaders(connection.getHeaderFields());
                String redirect = connection.getHeaderField("Location");
                InputStream stream = status >= 400 ? connection.getErrorStream() : connection.getInputStream();
                String response = stream == null ? "" : readLimited(stream, 2 * 1024 * 1024);
                notifyApiResult(status, headers, response, redirect);
            } catch (Exception e) {
                notifyApiError(e.getMessage() == null ? "HTTP request failed" : e.getMessage());
            } finally {
                if (connection != null) connection.disconnect();
            }
        });
    }

    private void applyHeaders(HttpURLConnection connection, String rawHeaders) {
        if (rawHeaders == null) return;
        for (String line : rawHeaders.split("\\r?\\n")) {
            int colon = line.indexOf(':');
            if (colon <= 0) continue;
            String name = line.substring(0, colon).trim();
            String value = line.substring(colon + 1).trim();
            if (!name.isEmpty()) connection.setRequestProperty(name, value);
        }
    }

    private String flattenHeaders(Map<String, List<String>> headers) {
        StringBuilder out = new StringBuilder();
        for (Map.Entry<String, List<String>> entry : headers.entrySet()) {
            if (entry.getKey() == null) continue;
            for (String value : entry.getValue()) out.append(entry.getKey()).append(": ").append(value).append('\n');
        }
        return out.toString().trim();
    }

    private String readLimited(InputStream stream, int maxBytes) throws IOException {
        byte[] buffer = new byte[8192];
        int total = 0;
        StringBuilder out = new StringBuilder();
        int count;
        while ((count = stream.read(buffer)) != -1) {
            int allowed = Math.min(count, maxBytes - total);
            if (allowed > 0) { out.append(new String(buffer, 0, allowed, StandardCharsets.UTF_8)); total += allowed; }
            if (total >= maxBytes) { out.append("\n[output truncated]"); break; }
        }
        return out.toString();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_WORKSPACE) {
            if (resultCode != RESULT_OK || data == null || data.getData() == null) {
                notifyWorkspaceError("Workspace selection cancelled");
                return;
            }
            try {
                Uri uri = data.getData();
                workspaceBridge.adoptSelectedWorkspace(uri);
                notifyWorkspaceResult(workspaceBridge.workspaceTreeUri(), workspaceBridge.displayName(uri.toString()));
            } catch (Exception e) {
                notifyWorkspaceError(e.getMessage() == null ? "Unable to open workspace" : e.getMessage());
            }
            return;
        }
        if (resultCode != RESULT_OK || data == null || data.getData() == null) {
            if (requestCode == REQUEST_OPEN) notifyOpenError("Operation cancelled");
            return;
        }
        Uri uri = data.getData();
        if (requestCode == REQUEST_OPEN) { currentDocumentUri = uri; readTextFile(uri); }
        else if (requestCode == REQUEST_CREATE) { saveToUri(uri, pendingSaveContent); pendingSaveContent = ""; }
    }

    private void readTextFile(Uri uri) {
        ioExecutor.execute(() -> {
            try (InputStream in = getContentResolver().openInputStream(uri)) {
                if (in == null) throw new IOException("Unable to open document");
                notifyOpenResult(uri.getLastPathSegment(), readLimited(in, 4 * 1024 * 1024));
            } catch (Exception e) { notifyOpenError(e.getMessage() == null ? "Open failed" : e.getMessage()); }
        });
    }

    public final class VSACBridge {
        @JavascriptInterface public void openTextFile() { runOnUiThread(MainActivity.this::openTextFile); }
        @JavascriptInterface public void openWorkspace() { runOnUiThread(MainActivity.this::openWorkspace); }
        @JavascriptInterface public String workspaceList(String parentUri) {
            try { return workspaceBridge.list(workspaceBridge.workspaceTreeUri(), parentUri).toString(); }
            catch (Exception e) { return "[]"; }
        }
        @JavascriptInterface public void workspaceRead(String uri, String name, String mime) {
            if (!workspaceBridge.hasWorkspace() || uri == null || uri.isBlank()) { notifyWorkspaceError("No workspace selected"); return; }
            if (!workspaceBridge.isLikelyText(name, mime)) { notifyWorkspaceError("Binary or unsupported file: " + name); return; }
            ioExecutor.execute(() -> {
                try { notifyWorkspaceReadResult(uri, name, mime, workspaceBridge.read(uri)); }
                catch (Exception e) { notifyWorkspaceError(e.getMessage() == null ? "Workspace read failed" : e.getMessage()); }
            });
        }
        @JavascriptInterface public void workspaceWrite(String uri, String content) {
            if (!workspaceBridge.hasWorkspace() || uri == null || uri.isBlank()) { notifyWorkspaceWriteResult(uri, false, "No workspace selected"); return; }
            ioExecutor.execute(() -> {
                try { workspaceBridge.write(uri, content); notifyWorkspaceWriteResult(uri, true, "Saved"); }
                catch (Exception e) { notifyWorkspaceWriteResult(uri, false, e.getMessage() == null ? "Workspace write failed" : e.getMessage()); }
            });
        }
        @JavascriptInterface public void saveTextFile(String content, String suggestedName) { runOnUiThread(() -> { if (currentDocumentUri != null) saveToUri(currentDocumentUri, content); else createTextFile(suggestedName, content); }); }
        @JavascriptInterface public void newTextFile() { runOnUiThread(() -> notifyOpenResult("untitled.txt", "")); }
        @JavascriptInterface public void runTerminal(String command) { runOnUiThread(() -> MainActivity.this.runTerminal(command)); }
        @JavascriptInterface public void httpRequest(String method, String url, String headers, String body) { runOnUiThread(() -> MainActivity.this.httpRequest(method, url, headers, body)); }
        @JavascriptInterface public String getAppVersion() { return "0.4.0"; }
    }

    @Override
    protected void onDestroy() {
        if (nativeTerminal != null) { nativeTerminal.shutdown(); nativeTerminal = null; }
        if (ioExecutor != null) { ioExecutor.shutdownNow(); ioExecutor = null; }
        if (webView != null) {
            webView.removeJavascriptInterface("VSACNative");
            webView.loadUrl("about:blank");
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
