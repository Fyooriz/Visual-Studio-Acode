package com.fyooriz.visualstudioacode.platform;

import java.util.LinkedHashMap;
import java.util.Map;

/** Stable workspace state shared by editor features without plugin-global mutation. */
public final class WorkspaceModel {
    private final Map<String, DocumentModel> documents = new LinkedHashMap<>();
    private String activeDocument;

    public synchronized void upsert(DocumentModel document) {
        if (document == null || document.id() == null || document.id().isBlank()) {
            throw new IllegalArgumentException("Document id is required");
        }
        documents.put(document.id(), document);
        if (activeDocument == null) activeDocument = document.id();
    }

    public synchronized void activate(String id) {
        if (!documents.containsKey(id)) throw new IllegalArgumentException("Unknown document: " + id);
        activeDocument = id;
    }

    public synchronized DocumentModel active() {
        return activeDocument == null ? null : documents.get(activeDocument);
    }

    public synchronized Map<String, DocumentModel> snapshot() {
        return Map.copyOf(documents);
    }

    public record DocumentModel(String id, String name, String language, String uri, boolean dirty) {}
}
