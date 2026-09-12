# Visual Studio Acode Architecture

## Design goal

Keep the Acode-like mobile editing experience while replacing the plugin pile with a small set of internal platforms. A feature may be implemented from an audited plugin, rewritten, or adapted; the user-facing API stays stable.

## Platform map

```text
Visual Studio Acode
├── App Shell
│   ├── Navigation / panels
│   ├── Tabs / split editor
│   ├── Command palette
│   └── Settings
├── Workspace Core
│   ├── File system abstraction
│   ├── Project/workspace state
│   ├── Search / replace
│   └── Recent files / recovery
├── Editor Platform
│   ├── Ace-compatible editor adapter
│   ├── syntax/highlighting
│   ├── snippets / completion
│   ├── breadcrumbs
│   └── gestures / mobile input
├── Language Platform
│   ├── LSP broker
│   ├── language adapters
│   ├── diagnostics
│   └── semantic features
├── Build & Execution
│   ├── formatter broker
│   ├── linter broker
│   ├── task runner
│   └── terminal backend
├── Web Platform
│   ├── local server
│   ├── preview
│   └── web runtime bridge
├── Developer Tools
│   ├── console
│   ├── debugger
│   ├── Elements/DOM
│   ├── styles
│   ├── network
│   ├── storage
│   └── device emulation
├── Source Control
│   ├── Git engine
│   ├── diff / history
│   └── GitHub adapter
├── Database Studio
│   ├── SQLite
│   ├── SQL editor
│   └── visualizer
├── AI Platform
│   ├── provider adapters
│   ├── chat / edit / explain
│   ├── agent loop
│   └── workspace permission gate
├── Remote
│   ├── SSH
│   ├── SFTP
│   └── remote workspace adapter
└── Project Tooling
    ├── Android
    ├── Kotlin/Java/XML
    ├── Flutter/Dart
    └── templates/packages
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
```

The first implementation may be simple. The contract is what prevents future feature additions from recreating the observed Acode runtime conflicts.

### Language service lifecycle

`LanguageServiceBroker` is owned by `LanguagePlatform`. It does not bundle or launch a language server process; adapters remain responsible for their transport/runtime. The broker provides the shared lifecycle boundary: unique provider registration, a configurable maximum number of active providers, in-flight request tracking, per-request timeout enforcement, explicit cancellation, provider unregister, and shutdown cancellation.

This keeps resource policy in one owner and prevents each language adapter from inventing a separate process/request lifecycle. A provider without a reviewed runtime is not activated merely because it is listed in `LanguageCatalog`.

### Terminal contract

`TerminalBackend` currently defines a one-shot command execution boundary returning a structured `TerminalResult`. This matches the native terminal implementation available on Android today: validated argv, explicit private workspace, bounded concurrency, timeout enforcement, and output limits.

Interactive terminal sessions (`start/write/stop`) are deliberately not exposed by the current contract until a sandboxed session implementation can satisfy the same security baseline. Adding those methods prematurely would create a misleading abstraction and duplicate ownership.

## Selected source material

### `ace-linters-2.3.4.zip`

Candidate for the lint/diagnostic foundation because it is already organized as a workspace with Ace integration. Reuse is conditional on license and dependency review.

### `suger-devtool-main.zip`

Candidate for the Developer Tools feature set: JavaScript debugging, DOM inspection, CSS/computed styles, network tooling, storage/application inspection, and mobile-oriented tooling.

The source snapshot also contains activation/fingerprinting/cloud dependencies. Those parts are **not** part of the target architecture; only independently justified technical functionality may be adapted.

## Conflict policy

Known conflict examples from the uploaded runtime log include duplicate plugin globals, duplicate editor extension compartments, DOM removal errors, missing paths and repeated fetch failures. The solution is architectural isolation plus one owner per capability, not another layer of plugin ordering.

## Security boundaries

- Terminal commands execute only through an explicit execution boundary and remain unavailable to the WebView while the terminal security gate is blocked.
- AI file modifications are permissioned and diff-first by default.
- Remote filesystem access is isolated from local workspace state.
- Secrets/tokens are stored outside source files and never injected into project exports.
- Web preview content is treated as untrusted input.

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
