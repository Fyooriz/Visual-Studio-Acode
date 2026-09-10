package com.fyooriz.visualstudioacode.platform;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/** Durable local audit sink for approved AI mutations; secrets/source contents are never stored. */
public final class AIAuditLog {
    private static final String PREFS = "vsac.ai.audit";
    private static final String KEY_EVENTS = "events";
    private static final int MAX_EVENTS = 256;

    public record Event(
        AIPermissionGate.Action action,
        String providerId,
        String targetScope,
        String result,
        long timestampMillis
    ) {}

    private final SharedPreferences preferences;
    private final List<Event> events = new ArrayList<>();

    public AIAuditLog(Context context) {
        Objects.requireNonNull(context, "context");
        preferences = context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        load();
    }

    public synchronized void record(
        AIPermissionGate.Action action,
        String providerId,
        String targetScope,
        String result
    ) {
        Event event = new Event(
            Objects.requireNonNull(action, "action"),
            requireNonBlank(providerId, "providerId"),
            requireNonBlank(targetScope, "targetScope"),
            requireNonBlank(result, "result"),
            System.currentTimeMillis()
        );
        events.add(event);
        while (events.size() > MAX_EVENTS) events.remove(0);
        persist();
    }

    public synchronized List<Event> snapshot() {
        return List.copyOf(events);
    }

    private void load() {
        String raw = preferences.getString(KEY_EVENTS, "[]");
        try {
            JSONArray array = new JSONArray(raw);
            synchronized (this) {
                for (int i = 0; i < array.length() && events.size() < MAX_EVENTS; i++) {
                    JSONObject item = array.optJSONObject(i);
                    if (item == null) continue;
                    String actionName = item.optString("action", "");
                    String providerId = item.optString("providerId", "");
                    String targetScope = item.optString("targetScope", "");
                    String result = item.optString("result", "");
                    if (actionName.isBlank() || providerId.isBlank() || targetScope.isBlank() || result.isBlank()) continue;
                    try {
                        events.add(new Event(
                            AIPermissionGate.Action.valueOf(actionName),
                            providerId,
                            targetScope,
                            result,
                            item.optLong("timestampMillis", 0L)
                        ));
                    } catch (IllegalArgumentException ignored) { }
                }
            }
        } catch (JSONException ignored) {
            preferences.edit().remove(KEY_EVENTS).apply();
        }
    }

    private synchronized void persist() {
        JSONArray array = new JSONArray();
        for (Event event : events) {
            JSONObject item = new JSONObject();
            try {
                item.put("action", event.action().name());
                item.put("providerId", event.providerId());
                item.put("targetScope", event.targetScope());
                item.put("result", event.result());
                item.put("timestampMillis", event.timestampMillis());
                array.put(item);
            } catch (JSONException impossible) {
                throw new IllegalStateException("Unable to serialize AI audit event", impossible);
            }
        }
        preferences.edit().putString(KEY_EVENTS, array.toString()).apply();
    }

    private static String requireNonBlank(String value, String name) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException(name + " must be non-blank");
        return value;
    }
}
