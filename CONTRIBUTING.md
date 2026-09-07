# Contributing to Visual Studio Acode

Visual Studio Acode is an Android-first development workspace. Contributions must preserve the subsystem ownership, security gates, and evidence-based status policy described by the project governance.

## Source of truth

The repository is the implementation source of truth. Uploaded archives and reference packages are audit evidence unless their source, license, dependency graph, security model, and architectural fit have been reviewed.

`Prompt.md` and `text.txt` are governance inputs. `Skill.zip` is treated by the assistant as a skill/instruction source for the engineering workflow; it is not automatically a distributable project dependency. `Data apk.zip` and `Informasi.zip` remain project evidence containers and must not be loaded as arbitrary runtime code.

When sources overlap, inspect the actual implementations, select the strongest basis using correctness, stability, Android compatibility, integration, performance, security, and maintainability as the decision order, then adapt behind the existing owner interface. Do not create a second owner for an existing capability.

## Feature status

Use only these status values:

`PLANNED`, `IMPLEMENTING`, `IMPLEMENTED`, `INTEGRATED`, `TESTED`, `VERIFIED`, `BLOCKED`, `DEPRECATED`.

Do not label a feature `VERIFIED` unless build, test, runtime, and security evidence are all passing. `DONE` is reserved for work that is designed, implemented, integrated, buildable, tested, verified, and documented.

## Architecture rules

Subsystem ownership follows the project architecture:

`App Shell → Workspace/Filesystem → Editor/Language Services/LSP/Diagnostics/Formatting/Search → Terminal/Execution → Preview/DevTools → Git/GitHub → Database → AI → Remote → Android/Flutter → Plugin → Security`

Each capability has one internal owner and a stable contract. Providers and adapters may vary, but consumers must not depend on another subsystem's implementation internals.

## Change workflow

1. Inspect the current repository, feature registry, architecture/security documentation, and relevant issue/PR history.
2. Identify the highest-value safe change and record important architectural decisions.
3. Audit any external source for license, dependencies, overlap, conflicts, security, and performance before reuse.
4. Implement behind the owning subsystem contract.
5. Add or update unit tests and at least one real subsystem-boundary integration test when applicable.
6. Add failure-path coverage for filesystem, Git, terminal, or other stateful boundaries when applicable.
7. Run governance, security-contract, language/runtime, and feature-specific checks, then the Android JVM tests and debug build.
8. Verify runtime behavior on an Android device/emulator before claiming runtime verification.
9. Update `FEATURE-REGISTRY.md`, `feature-registry.json`, architecture/security docs, and ADRs when the change affects those contracts.
10. Report successful work, failed work, unfinished work, blockers, assumptions, and evidence explicitly.

## Security gate

A feature must remain `BLOCKED` when any required gate fails. In particular:

- Filesystem access must be least-privilege and path-confined.
- Secrets must not be written to source files, logs, telemetry, or crash reports.
- Shell execution must have command/path validation plus bounded timeout/concurrency/output and sufficient OS/runtime resource isolation before it is promoted beyond its current blocked state.
- Web preview content is untrusted and must not receive privileged native APIs.
- AI modifications require a permission gate and audit event.
- Third-party source must pass license and security review before distributable reuse.

## Validation commands

From the repository root, the CI-equivalent checks are:

```bash
node tools/validate-project-governance.js
node tools/test-security-contracts.js
node tools/test-terminal-policy.js
node tools/test-language-runtime.js
node tools/test-snippet-registry.js
node tools/test-diagnostics.js

gradle --no-daemon :app:testDebugUnitTest
gradle --no-daemon :app:assembleDebug
```

The GitHub Actions workflow is the authoritative build verification path. A green build establishes CI build evidence, not Android-device runtime verification.

## Pull requests

Keep changes narrow enough to audit. Explain the subsystem owner touched, external sources used, license/security disposition, tests run, runtime evidence, and any remaining blockers. Do not claim production readiness from a successful build alone.
