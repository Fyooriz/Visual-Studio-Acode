package com.fyooriz.visualstudioacode.platform;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * LanguagePlatform-owned lifecycle broker for language-service adapters.
 *
 * The broker deliberately does not start processes itself. Adapters own their
 * transport/runtime; this class owns registration, active-provider limits,
 * request tracking, timeout enforcement, and cancellation visibility.
 */
public final class LanguageServiceBroker implements AutoCloseable {
    private final int maxActiveServices;
    private final long requestTimeoutMillis;
    private final Map<String, EngineContracts.LanguageService> services = new ConcurrentHashMap<>();
    private final Map<String, CompletableFuture<?>> inFlight = new ConcurrentHashMap<>();

    public LanguageServiceBroker(int maxActiveServices, long requestTimeoutMillis) {
        if (maxActiveServices < 1) throw new IllegalArgumentException("maxActiveServices must be >= 1");
        if (requestTimeoutMillis < 1) throw new IllegalArgumentException("requestTimeoutMillis must be >= 1");
        this.maxActiveServices = maxActiveServices;
        this.requestTimeoutMillis = requestTimeoutMillis;
    }

    public void register(String serviceId, EngineContracts.LanguageService service) {
        requireId(serviceId);
        Objects.requireNonNull(service, "service");
        synchronized (services) {
            if (services.containsKey(serviceId)) {
                throw new IllegalStateException("Language service already registered: " + serviceId);
            }
            if (services.size() >= maxActiveServices) {
                throw new IllegalStateException("Language service active-provider limit reached");
            }
            services.put(serviceId, service);
        }
    }

    public boolean unregister(String serviceId) {
        requireId(serviceId);
        cancel(serviceId);
        return services.remove(serviceId) != null;
    }

    public int activeServiceCount() {
        return services.size();
    }

    public CompletableFuture<List<EngineContracts.Diagnostic>> diagnostics(
        String serviceId,
        EngineContracts.Document document
    ) {
        requireId(serviceId);
        Objects.requireNonNull(document, "document");
        EngineContracts.LanguageService service = services.get(serviceId);
        if (service == null) {
            return CompletableFuture.failedFuture(
                new IllegalArgumentException("Unknown language service: " + serviceId)
            );
        }
        CompletableFuture<List<EngineContracts.Diagnostic>> request;
        try {
            request = Objects.requireNonNull(service.diagnostics(document), "service diagnostics future");
        } catch (RuntimeException error) {
            return CompletableFuture.failedFuture(error);
        }
        inFlight.put(serviceId, request);
        request.whenComplete((ignored, ignoredError) -> inFlight.remove(serviceId, request));
        return request.orTimeout(requestTimeoutMillis, TimeUnit.MILLISECONDS);
    }

    public boolean cancel(String serviceId) {
        requireId(serviceId);
        CompletableFuture<?> request = inFlight.get(serviceId);
        return request != null && request.cancel(true);
    }

    public int inFlightCount() {
        return inFlight.size();
    }

    @Override
    public void close() {
        for (CompletableFuture<?> request : inFlight.values()) {
            request.cancel(true);
        }
        inFlight.clear();
        services.clear();
    }

    private static void requireId(String serviceId) {
        if (serviceId == null || serviceId.isBlank()) {
            throw new IllegalArgumentException("serviceId must be non-blank");
        }
    }
}
