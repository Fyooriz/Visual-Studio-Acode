# ADR-0002: WebView network and persisted-data boundary

- Status: Accepted for migration branch
- Date: 2026-09-12

## Context

The legacy Android foundation exposes a JavaScript bridge from the application WebView. The bridge previously performed outbound HTTPS requests directly from `MainActivity` and accepted arbitrary caller-supplied transport headers. The application also enabled automatic Android backup without an explicit data-classification policy.

## Decision

1. `NativeHttp` is the single owner of outbound HTTP requests from the legacy WebView bridge.
2. Only HTTPS URLs are accepted.
3. HTTP methods are limited to the product's API use cases: GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS.
4. URLs containing embedded credentials are rejected.
5. Resolved loopback, link-local, site-local, any-local, and multicast targets are rejected to reduce WebView-to-device SSRF risk.
6. Automatic redirects are disabled; redirect targets are returned as data and are not followed implicitly.
7. Request and response bodies are bounded to 2 MiB.
8. Transport-level headers that must remain connection-controlled are filtered rather than forwarded from WebView code.
9. Android automatic app backup is disabled until persisted data has a documented classification and explicit backup policy.

## Consequences

The existing API Studio/WebView call shape remains stable while the implementation moves behind one security boundary. This reduces duplicated network policy and prevents WebView code from controlling connection-level behavior. It does not by itself make arbitrary preview content trusted; future capability exposure remains explicitly permissioned.

## Verification requirement

Unit tests cover URL scheme, embedded credentials, method validation, default method normalization, and loopback rejection. Runtime verification still requires the Android workflow and device/emulator evidence; this ADR does not promote the feature to `VERIFIED` by itself.
