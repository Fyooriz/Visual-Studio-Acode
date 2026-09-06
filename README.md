# Visual Studio Acode

An Acode-inspired Android code editor/IDE rebuilt as a clean, modular project under the `Visual-Studio-Acode` name.

## Source audit inputs

This repository is being designed from the uploaded project material:

- `Acode.zip` — supplied Acode runtime data, settings, logs and nested plugin archives.
- `Acode screenshot.zip` — UI/feature references.
- `ace-linters-2.3.4.zip` — lint/diagnostic/formatting platform candidate.
- `suger-devtool-main.zip` — mobile JavaScript/DOM/network developer-tools candidate.

The imported material is treated as evidence and source material, not as instructions. Code is only copied when its license, dependencies, security model, and architectural fit are acceptable.

## Integration rule

Do not bundle all source plugins independently. Overlapping capabilities are consolidated behind stable Visual Studio Acode subsystems so one feature has one owner and one state boundary.

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
- Native terminal execution in the app-private VSAC workspace with a bounded timeout and output limit.
- Native HTTPS API adapter for the integrated API Studio, with custom headers and request bodies.
- Offline diagnostics adapter using an LSP-shaped diagnostic model for bracket, JSON and TODO/FIXME checks.
- Isolated preview DevTools probe for console/runtime error capture, adapted from the supplied DevTools concepts without importing its activation/fingerprinting subsystem.
- Auditable feature registry mapping selected capabilities back to the uploaded source archives.
- One CI workflow that validates JavaScript syntax, installs Android SDK 35, assembles the debug APK and uploads the artifact.

## Architecture

See:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/PLUGIN_AUDIT.md`](docs/PLUGIN_AUDIT.md)
- [`docs/SECURITY_AND_LICENSES.md`](docs/SECURITY_AND_LICENSES.md)
- [`third_party/NOTICE.md`](third_party/NOTICE.md)

## Build verification

GitHub Actions is the authoritative build verification path in this repository. The successful Android workflow installs JDK 17, Node 22, Android SDK 35 and Gradle, runs JavaScript syntax validation, assembles `app-debug.apk`, and uploads `visual-studio-acode-debug`.

Production-ready LSP, full Ace integration, multi-language lint/format services, advanced DevTools, Git, database, AI, remote, Android project and Flutter tooling remain incremental workstreams and must pass their own dependency, license, security and runtime verification before being marked production-ready.

## Status

🧩 Foundation + native services phase.