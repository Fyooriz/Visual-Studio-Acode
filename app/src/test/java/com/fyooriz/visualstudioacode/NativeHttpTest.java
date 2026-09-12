package com.fyooriz.visualstudioacode;

import static org.junit.Assert.assertEquals;

import java.net.URI;

import org.junit.Test;

public final class NativeHttpTest {
    @Test
    public void defaultsMissingMethodToGet() {
        assertEquals("GET", NativeHttp.normalizeMethod(null));
        assertEquals("GET", NativeHttp.normalizeMethod("  "));
    }

    @Test
    public void normalizesMethodCase() {
        assertEquals("PATCH", NativeHttp.normalizeMethod(" patch "));
    }

    @Test(expected = IllegalArgumentException.class)
    public void rejectsNonHttpsUrls() throws Exception {
        NativeHttp.validateRequest("GET", "http://example.com/api");
    }

    @Test(expected = IllegalArgumentException.class)
    public void rejectsEmbeddedCredentials() throws Exception {
        NativeHttp.validateRequest("GET", "https://user:password@example.com/api");
    }

    @Test(expected = IllegalArgumentException.class)
    public void rejectsUnsupportedHttpMethod() throws Exception {
        NativeHttp.validateRequest("TRACE", "https://localhost/api");
    }

    @Test(expected = IllegalArgumentException.class)
    public void rejectsLoopbackTargets() throws Exception {
        NativeHttp.validateRequest("GET", "https://127.0.0.1/api");
    }
}
