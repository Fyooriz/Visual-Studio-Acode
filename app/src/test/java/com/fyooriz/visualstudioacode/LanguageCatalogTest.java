package com.fyooriz.visualstudioacode;

import com.fyooriz.visualstudioacode.platform.LanguageCatalog;
import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public final class LanguageCatalogTest {
    @Test
    public void detectsExpandedLanguagesByExtension() {
        assertEquals("Kotlin", LanguageCatalog.fromName("Main.kt"));
        assertEquals("Dart", LanguageCatalog.fromName("lib.dart"));
        assertEquals("Python", LanguageCatalog.fromName("tool.py"));
        assertEquals("C++", LanguageCatalog.fromName("engine.cpp"));
        assertEquals("C#", LanguageCatalog.fromName("Program.cs"));
        assertEquals("Go", LanguageCatalog.fromName("server.go"));
        assertEquals("Rust", LanguageCatalog.fromName("main.rs"));
        assertEquals("Swift", LanguageCatalog.fromName("App.swift"));
        assertEquals("PowerShell", LanguageCatalog.fromName("build.ps1"));
        assertEquals("GraphQL", LanguageCatalog.fromName("schema.graphql"));
        assertEquals("Vue", LanguageCatalog.fromName("App.vue"));
        assertEquals("Svelte", LanguageCatalog.fromName("App.svelte"));
        assertEquals("Dockerfile", LanguageCatalog.fromName("Dockerfile"));
        assertEquals("Makefile", LanguageCatalog.fromName("Makefile"));
    }

    @Test
    public void supportedCatalogContainsMajorLanguageFamilies() {
        assertTrue(LanguageCatalog.supported().contains("JavaScript"));
        assertTrue(LanguageCatalog.supported().contains("TypeScript"));
        assertTrue(LanguageCatalog.supported().contains("Python"));
        assertTrue(LanguageCatalog.supported().contains("Kotlin"));
        assertTrue(LanguageCatalog.supported().contains("Dart"));
        assertTrue(LanguageCatalog.supported().contains("C++"));
        assertTrue(LanguageCatalog.supported().contains("C#"));
        assertTrue(LanguageCatalog.supported().contains("Go"));
        assertTrue(LanguageCatalog.supported().contains("Rust"));
        assertTrue(LanguageCatalog.supported().contains("Swift"));
        assertTrue(LanguageCatalog.supported().contains("PHP"));
        assertTrue(LanguageCatalog.supported().contains("Ruby"));
    }
}
