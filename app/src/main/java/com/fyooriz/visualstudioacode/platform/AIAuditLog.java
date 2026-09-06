package com.fyooriz.visualstudioacode.platform;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/** In-process audit sink for approved AI mutations; no secrets or source contents are stored. */
public final class AIAuditLog {
    public record Event(
        AIPermissionGate.Action action,
        String providerId,
        String targetScope,
        String result,
        Instant timestamp
    ) {}

    private final List<Event> events = new ArrayList<>();

    public synchronized void record(
        AIPermissionGate.Action action,
        String providerId,
        String targetScope,
        String result
    ) {
        events.add(new Event(
            Objects.requireNonNull(action, "action"),
            requireNonBlank(providerId, "providerId"),
            requireNonBlank(targetScope, "targetScope"),
            requireNonBlank(result, "result"),
            Instant.now()
        ));
    }

    public synchronized List<Event> snapshot() {
        return List.copyOf(events);
    }

    private static String requireNonBlank(String value, String name) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException(name + " must be non-blank");
        return value;
    }
}
