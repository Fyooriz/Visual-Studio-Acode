# Visual Studio Acode Feature Registry

This document is the human-readable companion to `app/src/main/assets/feature-registry.json`. The JSON registry is the machine-validated source of truth for feature status and evidence.

## Status policy

A feature may use only: `PLANNED`, `IMPLEMENTING`, `IMPLEMENTED`, `INTEGRATED`, `TESTED`, `VERIFIED`, `BLOCKED`, `DEPRECATED`.

`DONE` is not a lifecycle state. A feature is only considered done when it is designed, implemented, integrated, buildable, tested, verified, and documented.

## Current registry

| Capability | Owner | Source evidence | Status | Current evidence / blocker |
|---|---|---|---|---|
| Mobile editor | `EditorPlatform` | Acode ecosystem, `x.treesitter`, `jobians.lsp.client` | `IMPLEMENTED` | Build/runtime evidence still incomplete; tests partial. |
| Workspace | `WorkspaceCore` | Acode ecosystem | `IMPLEMENTED` | Build/runtime evidence still incomplete; tests partial. |
| LSP | `LanguagePlatform` | `ace-linters-2.3.4.zip`, `jobians.lsp.client` | `IMPLEMENTED` | Runtime/test evidence still incomplete. |
| Diagnostics | `LanguagePlatform` | `ace-linters-2.3.4.zip` | `IMPLEMENTED` | Runtime/test evidence still incomplete. |
| Formatting | `BuildExecutionPlatform` | Prettier/Python formatter sources | `IMPLEMENTED` | Built-in formatter coverage exists; broader formatter verification remains incomplete. |
| Terminal | `BuildExecutionPlatform` | `bajrangcoder.acodex`, code runner family | `BLOCKED` | CI build passes, static security gates and JVM policy tests pass, but strong OS/container isolation and explicit CPU/memory quota enforcement are still missing. |
| Execution | `BuildExecutionPlatform` | code runner family | `IMPLEMENTED` | Runtime/security verification remains incomplete. |
| HTML preview | `WebPlatform` | preview plugin family | `IMPLEMENTED` | Runtime/security verification remains incomplete. |
| API Studio | `WebPlatform` | API client/REST plugin family | `IMPLEMENTED` | Runtime/test verification remains incomplete. |
| Web DevTools | `DeveloperTools` | `suger-devtool-main.zip`, Eruda source | `IMPLEMENTED` | Capability adapter exists; runtime/security verification remains incomplete. Suger activation/fingerprinting/cloud components remain excluded. |
| Git | `SourceControl` | Git-related plugin family | `IMPLEMENTED` | Native Git engine verification remains incomplete. |
| Database Studio | `DatabaseStudio` | SQLite viewer/visualizer sources | `IMPLEMENTED` | SQLite-first implementation verification remains incomplete. |
| AI platform | `AIPlatform` | AI agent/copilot/provider sources | `IMPLEMENTED` | Permissioned mutation/audit implementation requires further verification. |
| Remote workspace | `RemotePlatform` | Acode screenshot references | `PLANNED` | SSH/SFTP provider abstraction not yet implemented. |
| Android tooling | `ProjectTooling` | Acode screenshot references | `PLANNED` | Android project tooling not yet implemented. |
| Flutter tooling | `ProjectTooling` | Acode screenshot references | `PLANNED` | Flutter/Dart tooling not yet implemented. |

## Source selection rules

`KEEP` means the capability belongs in the product scope; it does not authorize copying source without license review.

`MERGE` means multiple sources contribute capability to one product subsystem, preserving a single owner.

`REVIEW` is a source-audit decision, not a product lifecycle status. Source code remains excluded from the distributable until license, dependency, overlap, and security review are satisfied.

`REJECT` excludes a source or capability from the default product scope; useful technical ideas may still be reimplemented natively when justified.

## Uploaded source material

The project registry explicitly retains these user-provided sources as evidence/source material:

- `Acode.zip`
- `Acode screenshot.zip`
- `ace-linters-2.3.4.zip`
- `suger-devtool-main.zip`

Governance inputs supplied separately are also retained as evidence:

- `Prompt.md`
- `text.txt`

SHA-256 fingerprints for the external uploads are recorded in `app/src/main/assets/feature-registry.json` so future audits can detect a changed source file without treating external uploads as repository implementation code.

Useful functionality is adapted behind the owning subsystem. Conflicting or overlapping implementations are inspected and merged/wrapped/replaced rather than blindly bundled as independent plugin runtimes.

## Current implementation boundary

The Android/WebView foundation currently covers the mobile shell/editor workspace, tabs/document state, recovery/draft state, command palette, Storage Access Framework document I/O, isolated HTML preview, native HTTPS API access, diagnostics UI, formatter foundation, and the audited terminal boundary.

The terminal remains deliberately `BLOCKED` until its security baseline is satisfied. CI has now produced debug APKs for the terminal-hardening and contract/unit-test commits, but build evidence is not runtime/security verification.
