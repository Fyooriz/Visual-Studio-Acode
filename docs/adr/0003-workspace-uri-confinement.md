# ADR 0003: Constrain workspace document URIs

## Status
Accepted

## Context

`WorkspaceBridge` is the single WorkspaceCore owner for local document operations exposed to the WebView and AI workspace mutation boundary. Android Storage Access Framework operations use `content://` document URIs. The bridge previously accepted a caller-supplied URI for read/write/create/delete without proving that the target belonged to the currently selected workspace tree.

That violated the least-privilege filesystem requirement and could allow a compromised caller to target a content URI outside the selected workspace.

## Decision

Enforce a WorkspaceCore URI scope invariant:

- the active workspace is represented by the selected SAF tree URI;
- document and parent URIs must use the `content` scheme and the same authority;
- the target URI path must equal the selected tree path or be a descendant of it;
- `read`, `write`, `create`, `modify`, and `delete` reject out-of-scope targets before accessing `ContentResolver`;
- listing a workspace binds the selected tree URI into `WorkspaceBridge`, preserving one owner for the invariant;
- malformed, blank, cross-authority, sibling-tree, and prefix-collision URIs are denied.

The policy is implemented as a small pure-Java helper (`WorkspaceUriPolicy`) so the boundary can be unit-tested without introducing another filesystem owner.

## Alternatives considered

**Caller-side validation only — rejected.** JavaScript/UI validation is not a sufficient security boundary because the native bridge and AI mutation path must enforce the invariant independently.

**Per-call allowlist of discovered child URIs — rejected.** It is incomplete for nested folders and makes correctness depend on UI traversal state.

**Raw filesystem paths — rejected.** Android scoped-storage and SAF require URI-based access for the selected external tree; replacing it with paths would reduce compatibility and weaken the intended boundary.

## Consequences

The workspace API is slightly stricter: operations require a selected workspace scope. This is intentional. It prevents cross-workspace writes while preserving the existing SAF model and single-owner architecture.
