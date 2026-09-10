package com.fyooriz.visualstudioacode;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;

import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public final class MainActivityE2ETest {
    @Test
    public void launchLoadsEditorAndCoreControls() throws Exception {
        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            AtomicReference<String> result = new AtomicReference<>();
            evaluate(scenario, "document.title + '|' + document.querySelector('#editor').getAttribute('aria-label') + '|' + document.querySelector('#save').getAttribute('aria-label')", result);
            assertEquals("Visual Studio Acode|Code editor|Save", result.get());
        }
    }

    @Test
    public void editorMutationUpdatesDirtyState() throws Exception {
        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            evaluate(scenario, "document.querySelector('#editor').value='instrumented edit'; document.querySelector('#editor').dispatchEvent(new Event('input',{bubbles:true})); document.querySelector('#dirty').textContent", null);
            AtomicReference<String> dirty = new AtomicReference<>();
            evaluate(scenario, "document.querySelector('#dirty').textContent", dirty);
            assertEquals("Modified", dirty.get());
        }
    }

    @Test
    public void previewUsesSandboxedIframe() throws Exception {
        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            evaluate(scenario, "document.querySelector('.tab[title=\"index.html\"]').click(); document.querySelector('#run').click(); 'ok'", null);
            AtomicReference<String> sandbox = new AtomicReference<>();
            evaluate(scenario, "document.querySelector('iframe.preview-frame') && document.querySelector('iframe.preview-frame').getAttribute('sandbox')", sandbox);
            assertEquals("allow-scripts allow-forms allow-modals", sandbox.get());
        }
    }

    @Test
    public void terminalPathIsBlockedBySecurityGate() throws Exception {
        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            AtomicReference<String> terminal = new AtomicReference<>();
            evaluate(scenario, "document.querySelector('#more').click(); [...document.querySelectorAll('#command-list button')].find(b => b.textContent === 'Terminal').click(); document.querySelector('#command').value='pwd'; document.querySelector('#command-list button').click(); document.querySelector('#command-list').textContent", terminal);
            assertNotNull(terminal.get());
            assertTrue(terminal.get().contains('Native terminal unavailable.'));
        }
    }

    private static void evaluate(ActivityScenario<MainActivity> scenario, String script, AtomicReference<String> output) throws Exception {
        CountDownLatch latch = new CountDownLatch(1);
        scenario.onActivity(activity -> {
            WebView webView = findWebView(activity.getWindow().getDecorView());
            assertNotNull("Expected a WebView root", webView);
            webView.evaluateJavascript("(function(){try{return String((function(){" + script + "})());}catch(e){return 'ERROR:'+e;}})()", value -> {
                if (output != null) output.set(stripJson(value));
                latch.countDown();
            });
        });
        if (!latch.await(10, TimeUnit.SECONDS)) throw new AssertionError("WebView JavaScript evaluation timed out");
    }

    private static WebView findWebView(View root) {
        if (root instanceof WebView) return (WebView) root;
        if (!(root instanceof ViewGroup)) return null;
        ViewGroup group = (ViewGroup) root;
        for (int i = 0; i < group.getChildCount(); i++) {
            WebView found = findWebView(group.getChildAt(i));
            if (found != null) return found;
        }
        return null;
    }

    private static String stripJson(String value) {
        if (value == null) return null;
        if (value.startsWith("\"") && value.endsWith("\"")) {
            return value.substring(1, value.length() - 1)
                    .replace("\\\"", "\"")
                    .replace("\\n", "\n");
        }
        return value;
    }
}
