package com.fyooriz.visualstudioacode;

import com.fyooriz.visualstudioacode.platform.FeatureRegistry;
import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.assertEquals;

public final class FeatureRegistryTest {
    @Test
    public void coreFeaturesUseCanonicalOwners() {
        Map<String, String> owners = new HashMap<>();
        for (FeatureRegistry.Feature feature : FeatureRegistry.core()) {
            owners.put(feature.id(), feature.owner());
        }

        assertEquals("EditorPlatform", owners.get("editor"));
        assertEquals("WorkspaceCore", owners.get("workspace"));
        assertEquals("LanguagePlatform", owners.get("diagnostics"));
        assertEquals("LanguagePlatform", owners.get("lsp"));
        assertEquals("BuildExecutionPlatform", owners.get("format"));
        assertEquals("BuildExecutionPlatform", owners.get("execution"));
        assertEquals("BuildExecutionPlatform", owners.get("terminal"));
        assertEquals("WebPlatform", owners.get("preview"));
        assertEquals("DeveloperTools", owners.get("devtools"));
        assertEquals("SourceControl", owners.get("git"));
        assertEquals("DatabaseStudio", owners.get("database"));
        assertEquals("AIPlatform", owners.get("ai"));
        assertEquals("RemotePlatform", owners.get("remote"));
        assertEquals("ProjectTooling", owners.get("project-tools"));
    }
}
