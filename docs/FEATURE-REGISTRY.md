# Visual Studio Acode Feature Registry

This registry converts the uploaded plugin set into product-level capabilities. It is intentionally smaller than the source plugin count.

| Capability | Source evidence | Integration mode | Status |
|---|---|---|---|
| Mobile editor | Acode settings/runtime snapshot | Rebuild in app shell | active |
| Tabs + workspace state | Acode settings | Native app state + WebView UI | active |
| Command palette | Acode workflow | Rebuild | active |
| Open/save documents | Acode workflow + Android SAF | Native bridge | active |
| Syntax/language modes | Acode language client plugins | Language adapters | planned |
| LSP | language-client plugins + `jobians.lsp.client` | One LSP broker | planned |
| Tree-sitter | `x.treesitter` | Editor adapter | review |
| Lint/diagnostics | `ace-linters-2.3.4.zip` | Unified diagnostics engine | review |
| Formatting | Prettier/Python/PHP formatter plugins | Formatter broker | planned |
| Code execution | multiple runner plugins | One execution engine | planned |
| Terminal | `bajrangcoder.acodex`, `acode.terminal` settings | Native/backend adapter | planned |
| HTML preview | multiple preview plugins | One sandboxed preview engine | active (HTML srcdoc) |
| Web DevTools | `suger-devtool-main.zip` | Capability adapter/reimplementation | review |
| Git | Git-related plugins | One Source Control engine | planned |
| GitHub | GitHub plugins | GitHub adapter | planned |
| SQLite / SQL | SQLite viewer + DB visualizer plugins | One Database Studio | planned |
| AI | ChatGPT/Acopilot/Blackbox/agent plugins | One AI provider platform | planned |
| SSH/SFTP | screenshot feature references | Remote adapter | planned |
| Markdown | Markdown plugin | Built-in renderer | planned |
| JSON visualizer | JSON visualizer plugin | Built-in viewer | planned |
| React snippets | React snippet plugins | Unified snippet provider | planned |
| Path intelligence | path/linker plugins | Built-in completion provider | planned |
| Code metrics | `code.metrics` | Optional productivity module | planned |
| WakaTime | `x.wakatime` | Opt-in integration only | planned |

## Source selection rules

`KEEP` means the capability is useful and should exist in the product. It does **not** mean source code can be copied without license review.

`MERGE` means several source plugins are represented by one product subsystem. Only one subsystem owns the user-facing behavior.

`REVIEW` means the capability is valuable but its implementation/dependencies/license/security posture still require inspection.

`REJECT` means it is not part of the default product scope; it may still inspire a native implementation when a concrete requirement exists.

## Current implementation boundary

The current Android/WebView foundation intentionally implements document state, tabs, local draft recovery, command palette, HTML preview, and Storage Access Framework document I/O. LSP, terminal execution, Git, database access, AI network providers, and advanced DevTools remain explicit adapter points until their native security and dependency contracts are implemented.
