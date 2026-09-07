package com.fyooriz.visualstudioacode.platform;

import org.junit.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public final class LanguageServiceBrokerTest {
    private static final EngineContracts.Document DOC =
        new EngineContracts.Document("workspace://main.py", "Python", "print('x')");

    @Test
    public void enforcesActiveProviderLimitAndDuplicateRegistration() {
        LanguageServiceBroker broker = new LanguageServiceBroker(1, 1000);
        EngineContracts.LanguageService service = document -> CompletableFuture.completedFuture(List.of());

        broker.register("python", service);
        assertEquals(1, broker.activeServiceCount());

        boolean duplicateRejected = false;
        try {
            broker.register("python", service);
        } catch (IllegalStateException expected) {
            duplicateRejected = true;
        }
        assertTrue(duplicateRejected);

        boolean limitRejected = false;
        try {
            broker.register("kotlin", service);
        } catch (IllegalStateException expected) {
            limitRejected = true;
        }
        assertTrue(limitRejected);
        broker.close();
    }

    @Test
    public void tracksAndCompletesDiagnosticsRequest() throws Exception {
        LanguageServiceBroker broker = new LanguageServiceBroker(2, 1000);
        CompletableFuture<List<EngineContracts.Diagnostic>> response = new CompletableFuture<>();
        broker.register("python", document -> response);

        CompletableFuture<List<EngineContracts.Diagnostic>> request = broker.diagnostics("python", DOC);
        assertEquals(1, broker.inFlightCount());
        response.complete(List.of());

        assertTrue(request.get(1, TimeUnit.SECONDS).isEmpty());
        assertEquals(0, broker.inFlightCount());
        broker.close();
    }

    @Test
    public void supportsConcurrentRequestsFromSameLanguageService() throws Exception {
        LanguageServiceBroker broker = new LanguageServiceBroker(1, 1000);
        List<CompletableFuture<List<EngineContracts.Diagnostic>>> responses = new ArrayList<>();
        AtomicInteger calls = new AtomicInteger();
        broker.register("python", document -> {
            calls.incrementAndGet();
            CompletableFuture<List<EngineContracts.Diagnostic>> response = new CompletableFuture<>();
            responses.add(response);
            return response;
        });

        CompletableFuture<List<EngineContracts.Diagnostic>> first = broker.diagnostics("python", DOC);
        CompletableFuture<List<EngineContracts.Diagnostic>> second = broker.diagnostics("python", DOC);

        assertEquals(2, calls.get());
        assertEquals(2, broker.inFlightCount());

        responses.get(0).complete(List.of());
        assertTrue(first.get(1, TimeUnit.SECONDS).isEmpty());
        assertEquals(1, broker.inFlightCount());
        assertFalse(second.isDone());

        responses.get(1).complete(List.of());
        assertTrue(second.get(1, TimeUnit.SECONDS).isEmpty());
        assertEquals(0, broker.inFlightCount());
        broker.close();
    }

    @Test
    public void cancellationCancelsUnderlyingRequest() {
        LanguageServiceBroker broker = new LanguageServiceBroker(1, 1000);
        CompletableFuture<List<EngineContracts.Diagnostic>> response = new CompletableFuture<>();
        broker.register("python", document -> response);

        broker.diagnostics("python", DOC);
        assertTrue(broker.cancel("python"));
        assertTrue(response.isCancelled());
        assertEquals(0, broker.inFlightCount());
        assertFalse(broker.cancel("python"));
        broker.close();
    }

    @Test
    public void callerCancellationCancelsUnderlyingRequest() {
        LanguageServiceBroker broker = new LanguageServiceBroker(1, 1000);
        CompletableFuture<List<EngineContracts.Diagnostic>> response = new CompletableFuture<>();
        broker.register("python", document -> response);

        CompletableFuture<List<EngineContracts.Diagnostic>> request = broker.diagnostics("python", DOC);
        assertTrue(request.cancel(true));
        assertTrue(response.isCancelled());
        assertEquals(0, broker.inFlightCount());
        broker.close();
    }

    @Test
    public void timeoutCancelsUnderlyingRequestAndClearsTracking() throws Exception {
        LanguageServiceBroker broker = new LanguageServiceBroker(1, 25);
        CompletableFuture<List<EngineContracts.Diagnostic>> response = new CompletableFuture<>();
        broker.register("python", document -> response);

        CompletableFuture<List<EngineContracts.Diagnostic>> request = broker.diagnostics("python", DOC);

        boolean timedOut = false;
        try {
            request.get(1, TimeUnit.SECONDS);
        } catch (Exception error) {
            timedOut = error.getCause() instanceof TimeoutException || error instanceof TimeoutException;
        }
        assertTrue(timedOut);

        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(1);
        while (broker.inFlightCount() != 0 && System.nanoTime() < deadline) {
            Thread.sleep(5);
        }
        assertEquals(0, broker.inFlightCount());
        assertTrue(response.isCancelled());
        broker.close();
    }

    @Test
    public void rejectsUnknownService() {
        LanguageServiceBroker broker = new LanguageServiceBroker(1, 1000);
        CompletableFuture<List<EngineContracts.Diagnostic>> result = broker.diagnostics("missing", DOC);
        assertTrue(result.isCompletedExceptionally());
        broker.close();
    }

    @Test
    public void closeCancelsOutstandingRequestsAndProviders() {
        LanguageServiceBroker broker = new LanguageServiceBroker(1, 1000);
        CompletableFuture<List<EngineContracts.Diagnostic>> response = new CompletableFuture<>();
        broker.register("python", document -> response);

        broker.diagnostics("python", DOC);
        broker.close();

        assertTrue(response.isCancelled());
        assertEquals(0, broker.activeServiceCount());
        assertEquals(0, broker.inFlightCount());
    }
}
