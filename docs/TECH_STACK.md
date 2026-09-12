# Visual Studio Acode Technology Baseline

## Required product stack

```text
Presentation: Flutter / Dart
Shared core: Kotlin Multiplatform / Shared Kotlin
Persistence: SQLDelight
Android native: Kotlin + JNI/C++ where justified
iOS native: Swift + Metal/AVFoundation where justified
WebView: isolated preview/devtools only
```

## Ownership

Flutter owns presentation. KMP owns shared domain/application logic. SQLDelight owns shared persistence. Native layers own platform-specific services and hardware. No layer may duplicate another layer's internal implementation.

## Compatibility baseline

- Android minimum SDK: 31.
- Current legacy Android foundation remains on the migration branch until the new presentation/core path has equivalent tests and runtime evidence.
- High-refresh UI is a performance target and must be verified with real-device frame timing; Flutter use alone is not evidence of 120 FPS.

## Interop

Use the smallest stable boundary needed by the capability:

- MethodChannel for Flutter/native commands and events.
- JSON for human-readable, low-frequency payloads where schema evolution cost is small.
- ProtoBuf for stable, high-volume or strongly versioned payloads when justified.
- JNI for native C++ calls that cannot be handled by platform Kotlin/Swift APIs.
- expect/actual for platform-specific KMP implementations.

## Security constraints

- Native bridges expose capability-specific methods only.
- Preview WebView is treated as untrusted content.
- Terminal remains blocked until OS/container isolation and resource quotas satisfy the security baseline.
- Credentials never enter source files or project exports.
