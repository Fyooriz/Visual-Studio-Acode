# Source Audit — 2026-09-06

This audit records newly supplied archives before any code is copied into the Visual Studio Acode distributable. Uploaded material is evidence/source material; the repository remains the implementation source of truth.

## Decision rules

1. One capability has one Visual Studio Acode owner.
2. Useful capability from conflicting sources is adapted, merged, wrapped, or reimplemented behind that owner.
3. No source is copied into the distributable until license, dependency, overlap, security, and Android compatibility are reviewed.
4. `IMPLEMENTED`/`INTEGRATED`/`TESTED`/`VERIFIED` are product lifecycle states, not source-audit decisions.
5. A source with unresolved licensing or security constraints remains outside the distributable build.

## Newly uploaded archive set

| Container | Contents | SHA-256 | Initial disposition |
|---|---|---|---|
| `Data apk.zip` | `Acode-main.zip`, `termux-app-master.zip`, `vscode-main.zip` | `65396481fcc0700f67041fab2eee362301cb56c1322fbbdffaec8cb77c6d8ca8` | KEEP AS EVIDENCE |
| `Informasi.zip` | `Acode screenshot.zip`, `Acode.zip` | `746d36436006c6fe80ff984d32f12c3757c156bd216c234a4f1c5ca4242cceb1` | KEEP AS EVIDENCE |
| `Skill.zip` | 16 skill/agent archives | `f01eba20ad72b27325140648866a8025723f4041371b4e751b85e26fd4af449f` | KEEP AS EVIDENCE; INDIVIDUAL REVIEW REQUIRED |

## Source candidates

### Acode-main

Observed snapshot metadata:

- Acode package version: `1.13.3`.
- Root license: MIT.
- Android/Cordova architecture with editor plugins, terminal/proot, SFTP, FTP, server/webview, and filesystem-related extensions.
- Relevant existing project candidates: editor behavior, plugin boundaries, Android integration, project/workspace behavior, and mobile UX.
- The terminal and proot plugins are MIT-marked in their package metadata, but their dependency graph still requires review before reuse.

Decision: **ADAPT / MERGE**, not wholesale import. Prefer capability extraction into the existing single-owner subsystems.

### termux-app-master

Observed facts:

- `termux-app` states GPLv3-only for the application, with documented exceptions for Apache-2.0 terminal libraries and other shared components.
- The source contains separate `terminal-emulator` and `terminal-view` modules, JNI/native components, tests, and a shared library layer.
- The source demonstrates a materially stronger Android terminal architecture than a naive shell wrapper, including terminal emulation and native integration.

Security/licensing constraint:

- GPLv3-only application code must not be copied into the distributable without a deliberate license decision compatible with the product distribution.
- The existing Visual Studio Acode terminal is intentionally `BLOCKED` until strong process isolation and explicit CPU/memory quotas exist.

Decision: **ADAPT DESIGN**, and selectively evaluate separately licensed terminal-emulator components. Do not copy the GPLv3 application wholesale.

### vscode-main

Observed snapshot characteristics:

- Large TypeScript/Node-based desktop/web development architecture.
- Strong capability references for editor/language services, Git, GitHub, terminals, remote access, DevTools, diffing, search, and agent/AI workflows.
- The source includes platform-specific and desktop-oriented dependencies that cannot be assumed compatible with Android.

Decision: **EXTRACT ARCHITECTURAL PATTERNS / ADAPT**, not wholesale port. Use it as a reference for provider boundaries, editor services, Git workflows, remote abstractions, terminal UI concepts, and AI/agent governance while keeping Android-native owners.

### Skill/agent collections

The supplied skill set is highly heterogeneous. The initial inventory found examples ranging from small curated collections to repositories containing thousands of `SKILL.md` files.

Observed risk signals include instructions referencing credentials/tokens, deletion, shell/process execution, PowerShell, `sudo`, network fetches, and other privileged actions. These tokens are audit signals only; their presence does not itself prove malicious behavior.

Decision: **CATALOG / SANDBOX / REVIEW INDIVIDUALLY**. Skills become declarative, data-driven contributions first. Executable extensions require an explicit permission model, sandboxing, audit log, source/license metadata, and failure-path tests.

## Capability mapping

| Capability | Best new evidence | Action | Lifecycle impact |
|---|---|---|---|
| Editor | Acode + VS Code | Adapt architecture and UX patterns into `EditorPlatform` | No status promotion by audit alone |
| Workspace/filesystem | Acode + VS Code | Compare provider abstractions and Android URI handling | No status promotion |
| Terminal | Termux + Acode | Adapt terminal emulator/session design; retain security gate | Remains `BLOCKED` |
| Git | VS Code | Adapt Git UI/workflow/provider ideas into `SourceControl` | Remains current registry status until tested |
| Remote SSH/SFTP | VS Code + Acode | Feed `RemotePlatform` provider design | Remains `PLANNED` |
| DevTools | VS Code + existing Suger audit | Extract protocol/UI ideas without Suger activation/fingerprinting | No status promotion |
| AI/agent | VS Code + skill collections | Build permissioned skill/provider registry; no unrestricted execution | No status promotion |
| Plugin platform | Acode + skill collections | Data-driven contribution points; sandbox scripted extensions later | No status promotion |

## Why no raw merge was performed

The new archives contain overlapping subsystem implementations, multiple runtime assumptions, and materially different licensing models. Importing them directly would create duplicate owners, Android incompatibilities, a larger attack surface, and potentially incompatible licenses. The technically correct path is to preserve useful capability through targeted adapters/reimplementation while keeping the existing architecture contracts stable.

## Verification state

This document is an audit artifact, not proof of integration. Product features must still pass the repository lifecycle:

`PLANNED → IMPLEMENTING → IMPLEMENTED → INTEGRATED → TESTED → VERIFIED`

Security failure keeps the affected feature `BLOCKED`.
