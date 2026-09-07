# ADR 0010: Treat Skill.zip as Assistant Workflow Material

- Status: Accepted
- Date: 2026-09-07

## Context

`Skill.zip` was supplied to guide the assistant's engineering workflow. It is not a runtime dependency of Visual Studio Acode and must not be copied into the distributable application merely because it contains skill or instruction material.

## Decision

The assistant may use relevant, source-supported guidance from `Skill.zip` to improve inspection, audit, implementation, testing, verification, documentation, and reporting behavior. Project code remains governed by repository architecture, security, license, and feature-registry rules.

`Skill.zip` content is not treated as project source code. Scripts, agents, prompts, or executables inside the archive are not automatically executed, bundled, or granted project privileges. Any useful technical capability discovered there must be independently audited and adapted behind the owning Visual Studio Acode subsystem.

## Conflict handling

When skill material conflicts with repository architecture or security policy, the higher-priority project governance wins for project changes. When two source implementations overlap, inspect both and adapt the strongest capability behind the existing owner instead of creating duplicate runtimes.

## Consequences

- Skill material can improve assistant workflow without becoming application attack surface.
- Repository artifacts remain the implementation source of truth.
- Third-party licensing and security gates remain mandatory for code reuse.
- Unsupported or unverified claims from skill material cannot be promoted to `TESTED` or `VERIFIED` without project evidence.
