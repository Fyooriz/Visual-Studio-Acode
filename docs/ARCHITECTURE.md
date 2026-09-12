# Visual Studio Acode Architecture

## Design goal

Keep the Acode-like mobile editing experience while replacing the plugin pile with a small set of internal platforms. A feature may be implemented from an audited plugin, rewritten, or adapted; the user-facing API stays stable.

## Platform map

```text
Visual Studio Acode
├── App Shell
├── Workspace Core
├── Editor Platform
├── Language Platform
├── Build & Execution
├── Web Platform
├── Developer Tools
├── Source Control
├── Database Studio
├── AI Platform
├── Remote
└── Project Tooling
```

## Integration contracts

Each platform must expose an internal interface and own its state. Plugins/features do not patch arbitrary global editor state.

```text
EditorAdapter
WorkspaceFileSystem
LanguageService
DiagnosticProvider
Formatter
Linter
TaskExecutor
TerminalBackend
PreviewServer
Debugger
SourceControl
DatabaseProvider
AIProvider
RemoteFileSystem
NativeHttpClient
```

The first implementation may be simple. The contract is what prevents future feature additions from recreating the observed Acode runtime conflicts.

### Language service lifecycle

`LanguageServiceBroker` is owned by `LanguagePlatform`. It does not bundle or launch a language server process; adapters remain responsible for their transport/runtime. The broker provides the shared lifecycle boundary: unique provider registration, a configurable maximum number of active providers, in-flight request tracking, per-request timeout enforcement, explicit cancellation, provider unregister, and shutdown cancellation.

### Terminal contract

`TerminalBackend` currently defines a one-shot command execution boundary returning a structured `TerminalResult`. Interactive terminal sessions are deliberately not exposed until an implementation can satisfy the sandbox/resource security baseline.

### Native HTTP contract

`NativeHttp` is the single outbound HTTP implementation used by the legacy WebView bridge. It accepts HTTPS only, validates the request method, rejects embedded URL credentials, blocks local/reserved network targets after DNS resolution, disables automatic redirects, bounds request/response sizes, and filters transport-level headers that must not be caller-controlled.

This is migration hardening, not a claim that the legacy WebView is fully trusted. Preview/devtools content must not receive the API bridge implicitly.

## Selected source material

### `ace-linters-2.3.4.zip`

Candidate for the lint/diagnostic foundation. Reuse is conditional on license and dependency review.

### `suger-devtool-main.zip`

Candidate for Developer Tools. Activation/fingerprinting/cloud dependencies are excluded from the target architecture; only independently justified technical functionality may be adapted.

## Conflict policy

Known conflict examples include duplicate plugin globals, duplicate editor extension compartments, DOM removal errors, missing paths and repeated fetch failures. The solution is architectural isolation plus one owner per capability, not another layer of plugin ordering.

## Security boundaries

- Terminal commands execute only through an explicit execution boundary and remain unavailable to the WebView while the terminal security gate is blocked.
- AI file modifications are permissioned and diff-first by default.
- Remote filesystem access is isolated from local workspace state.
- Secrets/tokens are stored outside source files and never injected into project exports.
- Web preview content is treated as untrusted input.
- Native HTTP is a constrained capability boundary, not a general-purpose WebView networking escape hatch.
- Automatic Android app backup is disabled until persisted data has an explicit backup/data-classification policy.

## Migration target — Flutter / KMP / native

The product technology baseline is moving from the legacy Android Java/WebView foundation to an Android-first multiplatform architecture without a big-bang rewrite.

```text
Flutter / Dart
    │
    ├── App Shell presentation
    ├── Workspace / Editor UI
    ├── Terminal / Preview / Git UI
    └── presentation state
            │
            │ MethodChannel / JSON / ProtoBuf / JNI
            ▼
Kotlin Multiplatform / Shared Kotlin
    │
    ├── shared domain and application logic
    ├── workspace/editor contracts
    ├── project state
    └── SQLDelight persistence
            │
            │ expect / actual
       ┌────┴──────────────┐
       ▼                   ▼
Android native          iOS native
Kotlin                  Swift
JNI/C++ when justified  Metal/AVFoundation when justified
```

Rules:

1. Flutter is the presentation owner; it must not duplicate shared business rules.
2. KMP is the shared core owner; platform code implements only platform-specific behavior.
3. SQLDelight is the shared persistence owner.
4. WebView is not the application shell and remains restricted to isolated preview/devtools capability.
5. JNI/C++ is not a default dependency; introduce it only for a measured native/hardware requirement.
6. Android minimum SDK target is 31 for the new product baseline.
7. The legacy Android foundation remains in place until equivalent migration slices have build/test/runtime evidence.

The detailed migration decision is recorded in `docs/ADR-0001-flutter-kmp-migration.md` and the technology constraints in `docs/TECH_STACK.md`.
