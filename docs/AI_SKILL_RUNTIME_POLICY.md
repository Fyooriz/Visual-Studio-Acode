# AI Skill Runtime Policy

This document defines how user-supplied AI/agent skill collections are evaluated for Visual Studio Acode. It is intentionally narrower than any upstream skill framework: the product may reuse useful concepts, but no archive becomes an executable runtime merely because it was uploaded.

## Ownership

`AIPlatform` is the sole owner of AI skills, providers, prompts, tool permissions, mutation policy, and AI audit events. Skill collections must not create independent filesystem, terminal, network, Git, or Android service owners.

## Import boundary

The default pipeline is:

`archive -> inventory -> license/dependency review -> capability classification -> declarative manifest -> permission review -> sandboxed execution (future) -> tests -> verification`

Raw executable skill scripts remain outside the Android distributable until this pipeline passes.

## Supported declarative capability classes

- `prompt`: non-executable instructions/templates.
- `workflow`: ordered reasoning/task steps represented as data.
- `tool-schema`: description of an approved product tool; it grants no privilege by itself.
- `reference`: documentation, examples, checklists, or domain knowledge.
- `agent-profile`: model/provider metadata and behavioral constraints; no implicit tool authority.

Unknown classes are `REVIEW` and are not loaded by default.

## Permission model

The product-level policy is stricter than a skill document. A skill cannot grant itself permissions.

| Action | Default | Confirmation |
|---|---|---|
| Read file | Allowed | No |
| Suggest code | Allowed | No |
| Modify file | Denied until user approval | Yes |
| Create file | Denied until user approval | Yes |
| Delete file | Denied until user approval | Yes |
| Execute shell | Denied until user approval and sandbox gate | Yes |
| Build/Test | Denied until user approval unless auto-run is explicitly enabled | Yes unless enabled |
| Git operation | Denied until user approval | Yes |
| Remote push | Denied until user approval | Always |

Every approved mutation must emit a local audit event containing action class, skill/provider id, target scope, result, and timestamp. Secrets and source contents must not be copied into telemetry.

## Security rejection signals

A skill is not executable when its requested behavior requires unrestricted:

- shell/process execution;
- filesystem access outside the approved workspace/document URI;
- credential/token extraction or storage;
- network access without a declared provider boundary;
- native code loading;
- privilege escalation;
- destructive operations without an explicit product permission gate.

Presence of words such as `sudo`, `rm -rf`, `powershell`, `API key`, `token`, `exec`, or `spawn` is an audit signal, not proof of maliciousness. The implementation must inspect the actual file and requested capability before deciding.

## Licensing

Each skill package keeps its own provenance and license evidence. A top-level repository license is not assumed to cover nested code unless the source explicitly establishes that scope. Missing or ambiguous licensing yields `REVIEW`; it is never silently treated as permissive.

## Android boundary

Desktop-specific agent assumptions, unrestricted POSIX process models, and desktop filesystem paths are not portable guarantees on Android. They must be represented through Visual Studio Acode provider abstractions and verified against Android runtime constraints.

## Current uploaded source handling

`Skill.zip` is retained as audit evidence. Its 16 nested archives are catalogued individually. Duplicate collections are kept as evidence rather than duplicated into the application. Termux appears both inside `Data apk.zip` and `Skill.zip`; the duplicate is one source lineage for audit purposes, not two runtime dependencies.

## Verification

A skill capability can progress only through the project lifecycle and evidence gates. A source review is never itself product verification. `VERIFIED` requires passing build, test, runtime, and security evidence, and `DONE` additionally requires documentation and the full lifecycle criteria in the project governance command.
