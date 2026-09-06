# Visual Studio Acode Feature Registry

This document is the human-readable companion to `app/src/main/assets/feature-registry.json`. The JSON registry is the machine-validated source of truth for feature status and evidence.

## Status policy

A feature may use only: `PLANNED`, `IMPLEMENTING`, `IMPLEMENTED`, `INTEGRATED`, `TESTED`, `VERIFIED`, `BLOCKED`, `DEPRECATED`.

`DONE` is not a lifecycle state. A feature is only considered done when it is designed, implemented, integrated, buildable, tested, verified, and documented.

## Current registry

| Capability | Owner | Source evidence | Status | Current evidence / blocker |
|---|---|---|---|---|
| Mobile editor | `EditorPlatform` | Acode ecosystem, `Acode-main.zip`, `vscode-main.zip`, `x.treesitter`, `jobians.lsp.client` | `IMPLEMENTED` | Build/runtime evidence still incomplete; tests partial. |
| Workspace | `WorkspaceCore` | Acode ecosystem, `Acode-main.zip`, `vscode-main.zip` | `IMPLEMENTED` | Build/runtime evidence still incomplete; tests partial. |
| LSP | `LanguagePlatform` | `ace-linters-2.3.4.zip`, `Acode-main.zip`, `vscode-main.zip`, `jobians.lsp.client` | `IMPLEMENTED` | Runtime/test evidence still incomplete. |
| Diagnostics | `LanguagePlatform` | `ace-linters-2.3.4.zip`, `vscode-main.zip` | `IMPLEMENTED` | Runtime/test evidence still incomplete. |
| Formatting | `BuildExecutionPlatform` | Prettier/Python formatter sources, Acode, VS Code | `IMPLEMENTED` | Built-in formatter coverage exists; broader formatter verification remains incomplete. |
| Terminal | `BuildExecutionPlatform` | Acode terminal/proot, `termux-app-master.zip`, code runner family | `BLOCKED` | Security gate remains failed: strong OS/container isolation and explicit CPU/memory quotas are not yet present. Termux application source is GPLv3-only; terminal-emulator components require separate license/dependency review. |
| Execution | `BuildExecutionPlatform` | code runner family, Acode, Termux | `IMPLEMENTED` | Runtime/security verification remains incomplete. |
| HTML preview | `WebPlatform` | preview plugin family, Acode, VS Code patterns | `IMPLEMENTED` | Runtime/security verification remains incomplete. |
| API Studio | `WebPlatform` | API client/REST plugin family, Acode | `IMPLEMENTED` | Runtime/test verification remains incomplete. |
| Web DevTools | `DeveloperTools` | Suger audit, Eruda source, VS Code patterns | `IMPLEMENTED` | Capability adapter exists; runtime/security verification remains incomplete. Suger activation/fingerprinting/cloud components remain excluded. |
| Git | `SourceControl` | Git-related plugin family, Acode, `vscode-main.zip` | `IMPLEMENTED` | Native Git engine verification remains incomplete. |
| Database Studio | `DatabaseStudio` | SQLite viewer/visualizer sources, VS Code patterns | `IMPLEMENTED` | SQLite-first implementation verification remains incomplete. |
| AI platform | `AIPlatform` | AI agent/copilot/provider sources, `vscode-main.zip`, `Skill.zip` | `IMPLEMENTED` | Permissioned mutation/audit implementation requires further verification; executable skills remain untrusted until review. |
| Remote workspace | `RemotePlatform` | Acode references, Acode source, `vscode-main.zip` | `PLANNED` | SSH/SFTP provider abstraction not yet implemented. |
| Android tooling | `ProjectTooling` | Acode references/source, Termux architecture evidence | `PLANNED` | Android project tooling not yet implemented. |
| Flutter tooling | `ProjectTooling` | Acode references/source, VS Code language/tooling patterns | `PLANNED` | Flutter/Dart tooling not yet implemented. |

## Source selection rules

`KEEP` means the capability belongs in the product scope; it does not authorize copying source without license review.

`MERGE` means multiple sources contribute capability to one product subsystem, preserving a single owner.

`ADAPT` means architecture or implementation ideas are reimplemented or wrapped for the Android product rather than copied as an incompatible runtime.

`REVIEW` is a source-audit decision, not a product lifecycle status. Source code remains excluded from the distributable until license, dependency, overlap, and security review are satisfied.

`REJECT` excludes a source or capability from the default product scope; useful technical ideas may still be reimplemented natively when justified.

## Uploaded source material

The repository retains all supplied source material as evidence. In addition to earlier Acode/DevTools/linter archives and governance documents, the latest upload set contains:

- `Data apk.zip` → `Acode-main.zip`, `termux-app-master.zip`, `vscode-main.zip`
- `Informasi.zip` → `Acode screenshot.zip`, `Acode.zip`
- `Skill.zip` → 16 skill/agent source archives
- `Prompt.md`
- `text.txt`

SHA-256 fingerprints for the latest upload containers are recorded in `app/src/main/assets/feature-registry.json` and cross-checked against `docs/SOURCE-MANIFEST-2026-09-06.json` by the governance validator. The detailed source-level findings are recorded in `docs/SOURCE-AUDIT-2026-09-06.md`.

Useful functionality is adapted behind the owning subsystem. Conflicting or overlapping implementations are inspected and merged/wrapped/replaced rather than blindly bundled as independent plugin runtimes.

## Current implementation boundary

The Android/WebView foundation currently covers the mobile shell/editor workspace, tabs/document state, recovery/draft state, command palette, Storage Access Framework document I/O, isolated HTML preview, native HTTPS API access, diagnostics UI, formatter foundation, and the audited terminal boundary.

The terminal remains deliberately `BLOCKED` until its security baseline is satisfied. CI build evidence is not equivalent to runtime or security verification.
