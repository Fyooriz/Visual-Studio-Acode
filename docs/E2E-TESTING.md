# E2E Testing

Stage 5 testing is implemented as two layers:

- Web E2E: Playwright against `app/src/main/assets/index.html` served by a local Python HTTP server. The fixture supplies a non-privileged `VSACNative` stub so tests exercise the browser UI without granting native capabilities to the test page.
- Android instrumentation: AndroidX Test launches `MainActivity` on an emulator/device and evaluates the real WebView document. This verifies the Android shell/WebView boundary rather than replacing it with a browser-only mock.

## Approved journeys

| ID | Journey | Layer | Priority | Reliability |
|---|---|---|---|---|
| E2E-01 | Launch → editor → edit → dirty state | Web + Android | P0 | High |
| E2E-02 | Create/open document → edit → save → reopen | Android | P0 | Partial: SAF picker/device fixture still required |
| E2E-03 | Select workspace → browse tree → open file | Android | P0 | Partial: SAF picker/device fixture still required |
| E2E-04 | Workspace read/write persists | Android | P0 | Partial: real SAF workspace fixture required |
| E2E-05 | Search current document | Web | P0 | High |
| E2E-06 | Invalid search input | Web | P1 | High |
| E2E-07 | HTML → Preview → rendered output | Web + Android | P0 | High |
| E2E-08 | Preview JS error → DevTools capture | Web | P1 | High |
| E2E-09 | Terminal blocked state | Web + Android | P0 | High |
| E2E-10 | Forbidden terminal command rejected | Web + Android | P0 | High |
| E2E-11 | API Studio valid HTTPS request | Deferred | P1 | Unreliable until deterministic controlled network fixture/provider exists |
| E2E-12 | API Studio invalid URL/network error | Web | P1 | High for local validation path |
| E2E-13 | Diagnostics → Problems panel | Web | P0 | High |
| E2E-14 | Empty diagnostics state | Web | P1 | High |
| E2E-15 | Process/reload recovery | Web | P0 | High for localStorage reload; process-death recovery remains Android-device work |
| E2E-16 | Offline local editing | Web | P1 | High for editor-only path |

## Selector policy

Selectors use the following order:

1. Accessible role and accessible name.
2. Stable semantic attributes or element IDs.
3. `data-testid` only when a stable semantic selector is not available.
4. CSS classes only as a last resort.

The current UI already exposes stable accessible labels for primary controls and a semantic `#editor` field, so the first implementation does not add redundant test-only attributes.

## Fixtures and isolation

The browser fixture clears `localStorage` before each test and reloads the seeded document set. Native methods are stubbed only in the Playwright context; no host capability is exposed to the test page.

Android tests launch a fresh `MainActivity` per test. Tests do not depend on an external API, Git remote, AI provider, or terminal runtime.

## Commands

```text
npm install
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:ci
gradle --no-daemon :app:testDebugUnitTest
gradle --no-daemon :app:connectedDebugAndroidTest
```

## CI

Pull requests run both Playwright Chromium E2E and Android instrumented E2E on an API 35 emulator. Reports are uploaded as workflow artifacts.

The suite does not mark the terminal as working; it verifies the current blocked security gate. It also does not claim valid API networking, real SAF interaction, Git operations, remote development, or AI mutation until deterministic fixtures and their security contracts exist.

## Current status

`IMPLEMENTED → INTEGRATED → TESTED` is not claimed yet. The harness and CI integration are present, but verification requires a successful workflow run on GitHub and an actual Android emulator/device result. Until that evidence exists, the E2E capability remains `INTEGRATED` at most and feature claims remain bounded by the individual journey evidence above.
