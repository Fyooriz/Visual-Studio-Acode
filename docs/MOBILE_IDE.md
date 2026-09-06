# Visual Studio Acode — Mobile All-in-One IDE

## Product boundary

Visual Studio Acode is implemented as a single Android application. The WebView workbench owns editor/UI state, while native adapters provide capabilities that need Android or process boundaries.

The target is not a collection of independently activated Acode plugins. Each capability has one owner and one state boundary.

## Current mobile workbench

- Code editor host with mobile keyboard behaviors.
- Smart Tab, Enter, Backspace and bracket/quote pairing.
- Snippet/completion registry with a single editor event owner.
- Local multi-file tabs and draft persistence.
- Android Storage Access Framework project-folder selection.
- Project Explorer backed by the selected SAF tree URI.
- Text-file read/write through persisted document permissions.
- Bounded native terminal execution.
- Native HTTPS API client boundary.
- Sandboxed HTML preview.
- Preview diagnostics/devtools integration.
- Problems/diagnostics panel.

## Project workspace contract

`WorkspaceBridge` owns Android document-tree access.

The Java bridge exposes:

- `openWorkspace()` — asks Android for a directory tree and requests persistable read/write access.
- `workspaceList(parentUri)` — returns a JSON array of child documents.
- `workspaceRead(uri, name, mime)` — reads a text-like project file with a 4 MiB limit.
- `workspaceWrite(uri, content)` — writes UTF-8 content with a 4 MiB limit.

The web workbench owns presentation and editor state. It does not directly access Android filesystem paths.

## Conflict policy

When an imported Acode component overlaps an existing capability, do not add a second global implementation.

1. Prefer one canonical internal platform.
2. Adapt useful algorithms/data into that platform.
3. Remove duplicate event hooks and global registrations.
4. Keep third-party code isolated under `third_party/` with provenance/license records where applicable.
5. Reject or review components that add arbitrary global DOM/runtime mutation without a clear platform contract.

## Files from the supplied archives

The supplied Acode archive includes the installed Acode runtime snapshot plus the `ace-linters` and Suger DevTool source archives. These are treated as audit/adaptation inputs.

The React snippet plugin's bundled `ace.js` was inspected and contains the Ace loader/core modules, but the file originates inside a plugin package rather than being the canonical Ace distribution for this application. It is therefore not treated as the application's editor-core dependency.

## Mobile constraints

The application must remain usable on small screens. Long-running work must not block the UI thread. Large files and external output require explicit bounds. Web content used as preview is sandboxed and must not inherit native bridge access.

## Next engineering stages

1. Replace the textarea editor host with a vendored, license-reviewed Ace distribution or another complete editor engine.
2. Connect language modes, folding, multi-cursor, search/replace and completion to the canonical editor adapter.
3. Expand Project Explorer into create/rename/delete/move and multi-root workspace operations.
4. Add formatter/linter adapters incrementally from the supplied Ace Linters source after runtime/dependency review.
5. Add Source Control, Database Studio, AI Platform and Remote adapters behind explicit permission boundaries.
6. Build release/signing and device-level instrumentation only after debug APK builds are consistently green.
