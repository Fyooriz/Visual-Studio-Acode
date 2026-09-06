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

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public final class MainActivity extends Activity {
    private static final int REQUEST_OPEN = 4101;
    private static final int REQUEST_CREATE = 4102;

    private WebView webView;
    private Uri currentDocumentUri;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

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
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return true;
            }
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

    private void createTextFile(String suggestedName, String content) {
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("text/plain");
        intent.putExtra(Intent.EXTRA_TITLE, suggestedName == null || suggestedName.isBlank() ? "untitled.txt" : suggestedName);
        pendingSaveContent = content == null ? "" : content;
        startActivityForResult(intent, REQUEST_CREATE);
    }

    private String pendingSaveContent = "";

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
        String payload = "window.VSAC&&window.VSAC.nativeSaveResult(" +
                JSONObject.quote(ok ? message : "ERROR: " + message) + "," + ok + ");";
        runOnUiThread(() -> webView.evaluateJavascript(payload, null));
    }

    private void notifyOpenResult(String name, String content) {
        if (webView == null) return;
        String payload = "window.VSAC&&window.VSAC.nativeOpenResult(" +
                JSONObject.quote(name == null ? "untitled.txt" : name) + "," +
                JSONObject.quote(content == null ? "" : content) + ");";
        runOnUiThread(() -> webView.evaluateJavascript(payload, null));
    }

    private void notifyOpenError(String message) {
        if (webView == null) return;
        String payload = "window.VSAC&&window.VSAC.nativeOpenError(" + JSONObject.quote(message) + ");";
        runOnUiThread(() -> webView.evaluateJavascript(payload, null));
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode != RESULT_OK || data == null || data.getData() == null) {
            if (requestCode == REQUEST_OPEN) notifyOpenError("Operation cancelled");
            return;
        }

        Uri uri = data.getData();
        if (requestCode == REQUEST_OPEN) {
            currentDocumentUri = uri;
            readTextFile(uri);
        } else if (requestCode == REQUEST_CREATE) {
            saveToUri(uri, pendingSaveContent);
            pendingSaveContent = "";
        }
    }

    private void readTextFile(Uri uri) {
        try (InputStream in = getContentResolver().openInputStream(uri)) {
            if (in == null) throw new IOException("Unable to open document");
            byte[] bytes = in.readAllBytes();
            String name = uri.getLastPathSegment();
            notifyOpenResult(name, new String(bytes, StandardCharsets.UTF_8));
        } catch (Exception e) {
            notifyOpenError(e.getMessage() == null ? "Open failed" : e.getMessage());
        }
    }

    public final class VSACBridge {
        @JavascriptInterface
        public void openTextFile() {
            runOnUiThread(MainActivity.this::openTextFile);
        }

        @JavascriptInterface
        public void saveTextFile(String content, String suggestedName) {
            runOnUiThread(() -> {
                if (currentDocumentUri != null) {
                    saveToUri(currentDocumentUri, content);
                } else {
                    createTextFile(suggestedName, content);
                }
            });
        }

        @JavascriptInterface
        public void newTextFile() {
            runOnUiThread(() -> notifyOpenResult("untitled.txt", ""));
        }

        @JavascriptInterface
        public String getAppVersion() {
            return "0.2.0";
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.removeJavascriptInterface("VSACNative");
            webView.loadUrl("about:blank");
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
