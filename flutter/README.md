# Flutter Presentation Layer

This directory is the presentation layer of Visual Studio Acode.

## Boundary

- Flutter/Dart owns UI, navigation, rendering, interaction and presentation state.
- Shared business logic belongs to the KMP module under `../kmp`.
- Persistence belongs to SQLDelight in KMP.
- Android/iOS platform services stay at the native boundary.
- WebView is reserved for isolated preview/devtools capabilities.

## Current status

The editor shell is a presentation foundation only. Native MethodChannel handlers and production KMP integration are separate migration slices and are not claimed as verified yet.

## Local verification

```sh
flutter pub get
flutter analyze
flutter test
```

An Android APK requires Flutter's Android platform project. CI can generate the platform scaffolding in a clean checkout before building the debug APK; generated platform files are intentionally not mixed into this first migration slice.
