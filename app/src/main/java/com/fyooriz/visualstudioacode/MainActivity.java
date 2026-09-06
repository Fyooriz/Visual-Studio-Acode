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

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;

public final class MainActivity extends Activity {
    private static final int REQUEST_OPEN = 4101;
    private static final int REQUEST_CREATE = 4102;

    private WebView webView;
    private Uri currentDocumentUri;
    private String pendingSaveContent = "";
    private NativeTerminal terminal;

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
        terminal = new NativeTerminal(getFilesDir());
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
        intent.putExtra(Intent.EXTRA_TITLE,
                suggestedName == null || suggestedName.isBlank() ? "untitled.txt" : suggestedName);
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
        String payload = "window.VSAC&&window.VSAC.nativeSaveResult(" +
                JSONObject.quote(message) + "," + ok + ");";
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
        String payload = "window.VSAC&&window.VSAC.nativeOpenError(" +
                JSONObject.quote(message == null ? "Open failed" : message) + ");";
        runOnUiThread(() -> webView.evaluateJavascript(payload, null));
    }

    private void notifyTerminalResult(int exitCode, String output) {
        if (webView == null) return;
        String payload = "window.VSAC&&window.VSAC.nativeTerminalResult(" +
                exitCode + "," + JSONObject.quote(output == null ? "" : output) + ");";
        runOnUiThread(() -> webView.evaluateJavascript(payload, null));
    }

    private void notifyTerminalError(String message) {
        if (webView == null) return;
        String payload = "window.VSAC&&window.VSAC.nativeTerminalError(" +
                JSONObject.quote(message == null ? "Terminal failed" : message) + ");";
        runOnUiThread(() -> webView.evaluateJavascript(payload, null));
    }

    private void notifyApiResult(int status, String headers, String body, String redirect) {
        if (webView == null) return;
        String payload = "window.VSAC&&window.VSAC.nativeApiResult(" +
                status + "," + JSONObject.quote(headers == null ? "" : headers) + "," +
                JSONObject.quote(body == null ? "" : body) + "," +
                JSONObject.quote(redirect == null ? "" : redirect) + ");";
        runOnUiThread(() -> webView.evaluateJavascript(payload, null));
    }

    private void notifyApiError(String message) {
        if (webView == null) return;
        String payload = "window.VSAC&&window.VSAC.nativeApiError(" +
                JSONObject.quote(message == null ? "API request failed" : message) + ");";
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
            byte[] bytes = readAll(in);
            String name = uri.getLastPathSegment();
            notifyOpenResult(name, new String(bytes, StandardCharsets.UTF_8));
        } catch (Exception e) {
            notifyOpenError(e.getMessage() == null ? "Open failed" : e.getMessage());
        }
    }

    private byte[] readAll(InputStream in) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int read;
        while ((read = in.read(buffer)) != -1) out.write(buffer, 0, read);
        return out.toByteArray();
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
        public void runTerminal(String command) {
            if (terminal == null) {
                notifyTerminalError("Terminal service unavailable");
                return;
            }
            terminal.run(command, new NativeTerminal.Callback() {
                @Override
                public void onResult(int exitCode, String output) {
                    notifyTerminalResult(exitCode, output);
                }

                @Override
                public void onError(String message) {
                    notifyTerminalError(message);
                }
            });
        }

        @JavascriptInterface
        public void httpRequest(String method, String url, String headers, String body) {
            Executors.newSingleThreadExecutor().execute(() -> {
                try {
                    NativeHttp.Result result = NativeHttp.request(method, url, headers, body);
                    notifyApiResult(result.status, result.headers, result.body, result.redirect);
                } catch (Exception e) {
                    notifyApiError(e.getMessage() == null ? "API request failed" : e.getMessage());
                }
            });
        }

        @JavascriptInterface
        public String getAppVersion() {
            return "0.3.0";
        }
    }

    @Override
    protected void onDestroy() {
        if (terminal != null) {
            terminal.shutdown();
            terminal = null;
        }
        if (webView != null) {
            webView.removeJavascriptInterface("VSACNative");
            webView.loadUrl("about:blank");
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
