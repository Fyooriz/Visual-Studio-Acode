# Contributing to Visual Studio Acode

## Architecture first

Before changing code, identify the subsystem owner. Do not create a second owner for an existing capability.

## Technology baseline

- Flutter/Dart owns presentation.
- Kotlin Multiplatform owns shared domain/application logic.
- SQLDelight owns shared persistence.
- Android Kotlin owns Android platform services.
- Swift owns iOS platform services.
- JNI/C++ is used only when a measured native/hardware requirement justifies it.
- WebView is restricted to isolated preview/devtools capabilities.

## Change workflow

1. Inspect repository, architecture, feature registry and relevant issues/PRs.
2. Choose the smallest migration or feature slice with a clear owner.
3. Keep security boundaries explicit.
4. Add or update tests for core logic and failure paths.
5. Run lint/static analysis, unit tests, integration/UI tests where applicable.
6. Verify on Android hardware before declaring a feature verified.
7. Update `FEATURE_REGISTRY` and architecture/ADR documentation.

## Permission-sensitive operations

AI-assisted work follows the project permission model: file mutation requires user approval; shell/build/test and Git operations require approval unless the permitted auto-run policy applies; remote push always requires explicit approval.

## Status vocabulary

`PLANNED → IMPLEMENTING → IMPLEMENTED → INTEGRATED → TESTED → VERIFIED`

Other valid states are `BLOCKED` and `DEPRECATED`.

Do not use `DONE` or `VERIFIED` as a synonym for compilation success.
