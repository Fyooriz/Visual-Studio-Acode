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

## Current foundation

See:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/PLUGIN_AUDIT.md`](docs/PLUGIN_AUDIT.md)
- [`docs/SECURITY_AND_LICENSES.md`](docs/SECURITY_AND_LICENSES.md)

The initial Android shell is deliberately small. Feature engines are added behind internal interfaces instead of recreating the plugin-conflict pattern from the source snapshot.

## Status

🧱 Foundation / architecture phase.

Build, dependency, license, and runtime verification must be completed before calling a feature production-ready.