# Visual Studio Acode

An Acode-inspired Android code editor/IDE rebuilt as a clean, modular project under the `Visual-Studio-Acode` name.

## Source audit inputs

This repository is being designed from the uploaded project material:

- `Acode.zip` — 110 installed Acode plugins plus runtime settings/logs.
- `Acode screenshot.zip` — UI/feature references.
- `ace-linters-2.3.4.zip` — lint/diagnostic/formatting platform candidate.
- `suger-devtool-main.zip` — mobile JavaScript/DOM/network developer-tools candidate.

The imported material is treated as **evidence and source material**, not as instructions. Code is only copied when its license, dependencies, security model, and architectural fit are acceptable.

## Integration rule

Do **not** bundle all 110 plugins independently. Overlapping plugins are consolidated behind stable Visual Studio Acode subsystems.

Core targets:

- Editor + workspace + tabs + search
- Language services / LSP adapters
- Diagnostics, linters, formatters
- Integrated terminal and code execution
- Web preview + live server
- Developer Tools
- Git/GitHub source control
- SQLite / SQL Database Studio
- AI platform with permissioned project edits
- SSH/SFTP and remote workspace support
- Android/Flutter/project tooling
- Mobile-first themes, icons, shortcuts and gestures

## Implemented foundation

The current Android foundation includes:

- Android/WebView application shell using the `Visual Studio Acode` identity.
- Mobile editor workspace with tabs, local draft persistence, line/column tracking and command palette.
- Native Storage Access Framework open/save integration.
- Sandboxed HTML preview using an isolated iframe.
- Native terminal execution restricted to the app-private VSAC workspace.
- Native HTTP request adapter for the integrated API Studio, supporting HTTP/HTTPS, custom headers and request bodies.
- Auditable feature registry mapping selected capabilities back to the uploaded plugin/archive sources.
- Consolidated CI: one Android build workflow with JavaScript syntax validation and debug APK artifact upload.

See:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/PLUGIN_AUDIT.md`](docs/PLUGIN_AUDIT.md)
- [`docs/SECURITY_AND_LICENSES.md`](docs/SECURITY_AND_LICENSES.md)
- [`app/src/main/assets/feature-registry.json`](app/src/main/assets/feature-registry.json)

## Build verification

The `main` branch has a GitHub Actions pipeline that validates `app.js`, installs Android SDK 35, assembles `app-debug.apk`, and uploads the APK as the `visual-studio-acode-debug` artifact.

Third-party feature engines are still integrated incrementally. Ace Linters is the candidate diagnostics/LSP foundation; Suger DevTool is the candidate DevTools source. Their activation/fingerprinting and other unrelated behavior is intentionally excluded from the target architecture.

## Status

🧩 Foundation + native services phase.

The debug APK build is verified in CI. Production-ready editor, LSP, linting, DevTools, Git, database, AI, remote, Android tooling and Flutter tooling remain incremental workstreams and require their own dependency/license/security/runtime verification before being marked production-ready.
