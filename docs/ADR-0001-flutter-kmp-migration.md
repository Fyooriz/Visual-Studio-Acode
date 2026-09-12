# ADR-0001: Flutter + KMP migration boundary

- Status: Accepted for migration branch
- Date: 2026-09-12

## Context

The existing foundation is an Android Java/WebView application. The product target is Android-first with Flutter/Dart presentation, Kotlin Multiplatform shared core, SQLDelight persistence, and native Android/iOS boundaries.

## Decision

Migrate incrementally instead of replacing the existing application in one step.

- Flutter owns presentation, navigation, rendering and interaction state.
- KMP owns shared domain/application contracts and state.
- SQLDelight owns shared persistence schema/runtime contracts.
- Android native owns Android platform services and hardware access.
- iOS native owns iOS platform services.
- JNI/C++ is introduced only for validated native/hardware requirements.
- WebView remains an isolated capability for preview/devtools and is not the application shell.
- Cross-layer communication uses explicit contracts such as MethodChannel, JSON/ProtoBuf, or JNI; implementation internals are not shared across layers.

## Consequences

The first migration slice can be built and tested independently without destabilizing the existing Android application. Full integration remains a later slice because it requires native Flutter host wiring, KMP embedding, security review, and Android real-device verification.

## Rejected alternative

A big-bang rewrite of the Java/WebView app was rejected because it would couple migration, feature parity, security changes, and runtime changes into one untestable change set.
