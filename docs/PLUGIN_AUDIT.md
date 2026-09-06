# Plugin Audit — imported Acode ecosystem

> Source: the uploaded `Acode.zip` snapshot. This is an integration plan, not a claim that every plugin should be copied verbatim. Status is deliberately conservative.

| Plugin ID | Decision | License evidence | Reason |
|---|---|---|---|
| `acode.additional.langmodes` | **KEEP** | `MIT` | Unique capability; candidate for built-in feature or adapter. |
| `acode.api.client` | **KEEP** | `MIT` | Unique capability; candidate for built-in feature or adapter. |
| `acode.cli.plugin` | **REJECT** | `unknown` | Low-value, cosmetic, redundant, proprietary/unclear, or better rebuilt natively. |
| `acode.code.runner` | **MERGE** | `MIT` | Overlaps other runners; consolidate behind one execution API. |
| `acode.cpp.client` | **KEEP** | `unknown` | Language capability; license/source review required before copying code. |
| `acode.csharp.client` | **KEEP** | `unknown` | Language capability; license/source review required before copying code. |
| `acode.dart.client` | **KEEP** | `unknown` | Language capability; license/source review required before copying code. |
| `acode.db.visualizer` | **MERGE** | `MIT` | Overlaps other SQLite viewers. |
| `acode.devx.env` | **KEEP** | `MIT` | Useful environment-file syntax support. |
| `acode.devx.prismax` | **KEEP** | `MIT` | Useful Prisma tooling. |
| `acode.distro.manager` | **REJECT** | `MIT` | Better handled by a controlled terminal/runtime layer. |
| `acode.dockerfile.client` | **KEEP** | `unknown` | Useful language support; review before code reuse. |
| `acode.fonticons` | **MERGE** | `unknown` | Icon-stack overlap. |
| `acode.go.client` | **KEEP** | `unknown` | Language capability; review source/license before reuse. |
| `acode.icon.react` | **MERGE** | `unknown` | Icon-stack overlap. |
| `acode.iconpack` | **MERGE** | `unknown` | Icon-stack overlap. |
| `acode.java.client` | **KEEP** | `unknown` | Language capability; review source/license before reuse. |
| `acode.lua.client` | **KEEP** | `unknown` | Language capability; review source/license before reuse. |
| `acode.material.icons.advanced` | **MERGE** | `unknown` | Icon-stack overlap. |
| `acode.path.linker` | **KEEP** | `unknown` | Useful import/path navigation. |
| `acode.php.client` | **KEEP** | `unknown` | Language capability; review source/license before reuse. |
| `acode.plugin.acelivepreview` | **MERGE** | `MIT` | Consolidate with other preview/server plugins. |
| `acode.plugin.acopilot` | **MERGE** | `unknown` | Consolidate into one AI platform. |
| `acode.plugin.chatgpt` | **MERGE** | `unknown` | Consolidate into one AI platform. |
| `acode.plugin.colorpalette` | **KEEP** | `unknown` | Useful developer utility; consider native reimplementation. |
| `acode.plugin.github` | **MERGE** | `unknown` | Consolidate Git/GitHub operations. |
| `acode.plugin.gradient` | **KEEP** | `unknown` | Useful developer utility; low integration risk. |
| `acode.plugin.json_visualizer` | **KEEP** | `unknown` | Useful structured-data viewer. |
| `acode.plugin.lesscompiler` | **KEEP** | `unknown` | Useful build utility. |
| `acode.plugin.localhostpreview` | **MERGE** | `unknown` | Consolidate with other preview/server plugins. |
| `acode.plugin.loremipsum` | **REJECT** | `unknown` | Low-value utility for a default IDE bundle. |
| `acode.plugin.material_icons` | **MERGE** | `unknown` | Icon-stack overlap. |
| `acode.plugin.oceandark` | **REJECT** | `Apache-2.0` | Theme is better represented as an optional preset. |
| `acode.plugin.package.adder` | **KEEP** | `unknown` | Useful package/dependency helper. |
| `acode.plugin.phpspa` | **KEEP** | `MIT` | Useful PHP syntax support. |
| `acode.plugin.pinchtozoom` | **KEEP** | `unknown` | Useful mobile editor interaction. |
| `acode.plugin.prettier` | **KEEP** | `unknown` | Formatting platform; license/dependency review before code reuse. |
| `acode.plugin.ptmono` | **REJECT** | `unknown` | Font choice should be handled by the app theme/font layer. |
| `acode.plugin.python` | **MERGE** | `MIT` | Consolidate Python runtime/language support. |
| `acode.plugin.python2` | **MERGE** | `unknown` | Legacy Python should be an explicit runtime target, not a separate plugin. |
| `acode.plugin.react.snippet` | **KEEP** | `MIT` | Useful React/React Router productivity feature. |
| `acode.plugin.repechul.godot.colors.editor.theme` | **KEEP** | `MIT` | Useful syntax/theme preset for Godot workflows. |
| `acode.plugin.repechul.multilang.togglecomments` | **KEEP** | `MIT` | Useful editor command. |
| `acode.plugin.restapi` | **KEEP** | `unknown` | Useful API client/testing capability. |
| `acode.plugin.smali` | **KEEP** | `unknown` | Useful Android/reverse-engineering language mode. |
| `acode.plugin.snippets` | **KEEP** | `unknown` | Core productivity capability. |
| `acode.plugin.tab` | **REVIEW** | `Proprietary` | Do not bundle until rights and behavior are confirmed. |
| `acode.plugin.version.control.gitpro` | **MERGE** | `MIT` | Consolidate Git UI/backend. |
| `acode.plugin.volumncursor` | **REVIEW** | `unknown` | Nice-to-have interaction; not a core dependency. |
| `acode.prisma.highlight` | **KEEP** | `MIT` | Useful Prisma language support. |
| `acode.python.client` | **MERGE** | `unknown` | Consolidate Python LSP/runtime integration. |
| `acode.python.fmt` | **KEEP** | `MIT` | Useful Ruff formatting support. |
| `acode.runner.plugin` | **MERGE** | `MIT` | Overlaps other runners. |
| `acode.rust.client` | **KEEP** | `unknown` | Language capability; review source/license before reuse. |
| `acode.sdk.plugin` | **KEEP** | `unknown` | Useful plugin API reference, but not necessarily runtime-bundled. |
| `acode.tailwind.languageservice` | **KEEP** | `MIT` | Useful frontend language intelligence. |
| `acode.terraform.client` | **KEEP** | `unknown` | Useful infrastructure language support. |
| `acode.todo.highlighter` | **KEEP** | `unknown` | Useful task/annotation visibility. |
| `acode.typescript.client` | **KEEP** | `unknown` | Core JS/TS language capability; review source/license before reuse. |
| `acode.yaml.client` | **KEEP** | `unknown` | Useful YAML language support. |
| `ajr.minecraft_lang.mode` | **REVIEW** | `MIT` | Useful niche language mode; keep optional unless project scope needs it. |
| `almukaafih.zipfs` | **KEEP** | `MIT` | Useful archive/file-system capability. |
| `aocde.clone.repo` | **MERGE** | `unknown` | Consolidate into Source Control. |
| `app.acode.csv` | **KEEP** | `MIT` | Useful CSV language/table viewer. |
| `bajrangcoder.acode.ayumirage` | **REJECT** | `unknown` | Theme/icon preset, not core functionality. |
| `bajrangcoder.acodex` | **MERGE** | `MIT` | Terminal backend/UX should have one owner. |
| `bajrangcoder.bs.intellisense` | **KEEP** | `unknown` | Useful Bootstrap completion. |
| `bajrangcoder.git.dust` | **MERGE** | `unknown` | Git feature overlap. |
| `bajrangcoder.markdown` | **KEEP** | `unknown` | Useful Markdown preview/editing. |
| `bajrangcoder.mint` | **REJECT** | `unknown` | Theme/UI preset. |
| `bajrangcoder.path.intellize` | **KEEP** | `MIT` | Useful path intelligence. |
| `bajrangcoder.phpprettifier` | **KEEP** | `MIT` | Useful PHP formatting. |
| `bajrangcoder.react.snippets` | **KEEP** | `MIT` | Useful React snippets; merge duplicate snippet packs when loading. |
| `bajrangcoder.sweet` | **REJECT** | `MIT` | Theme/UI preset. |
| `blackbox.ai` | **MERGE** | `MIT` | Consolidate into one AI platform. |
| `code.metrics` | **KEEP** | `MIT` | Useful code-quality insight. |
| `com.acode.sqliteviewer` | **MERGE** | `MIT` | Consolidate SQLite/database tools. |
| `com.alis219.sqlite.viewer` | **MERGE** | `unknown` | Consolidate SQLite/database tools. |
| `com.alpha10.quickjsrunner` | **MERGE** | `MIT` | JavaScript execution belongs in one execution service. |
| `com.arfoxcode.runner_python_node` | **MERGE** | `MIT` | Multi-language execution overlap. |
| `com.asyncpranav.acodepets` | **REJECT** | `MIT` | Non-IDE feature; excluded from default developer bundle. |
| `com.heyitsaadin.ai_agent` | **MERGE** | `MIT` | Strong agent capability, but integrate behind a permissioned AI API. |
| `com.mesanjeet.acode.deepoceanglass` | **REVIEW** | `MIT` | UI preset; useful only as optional theme material. |
| `com.techsetuapps.instantweb.livepreviewer` | **MERGE** | `MIT` | Consolidate preview/server behavior. |
| `coswat.code.commenter` | **REJECT** | `MIT` | Native editor command should own comments. |
| `coswat.theme.breeze` | **REJECT** | `unknown` | Theme preset. |
| `cubarabara.responsive` | **REJECT** | `unknown` | UI preset/utility; reimplement only if a concrete UX requirement emerges. |
| `customcss` | **REJECT** | `unknown` | Arbitrary CSS injection is a poor default architecture; use controlled themes. |
| `customjs` | **REJECT** | `unknown` | Arbitrary JS injection is a security/maintenance liability. |
| `dev.rugved.githubmanager` | **MERGE** | `MIT` | Consolidate GitHub operations. |
| `documentsviewer` | **REJECT** | `file:LICENSE` | General document viewing is not a default IDE core feature. |
| `github.next.monaspace` | **REJECT** | `unknown` | Font preset; handle through the font/theme system. |
| `hallofcodes.rutex.coding_agent` | **MERGE** | `MIT` | Consolidate into one AI agent layer. |
| `jobians.lsp.client` | **REVIEW** | `MIT` | Strong candidate, but broker architecture should own LSP sessions. |
| `lumen.breadcrumbs` | **REVIEW** | `MIT` | Useful capability; review implementation against native editor state. |
| `mayank.plugin.vs_theme` | **REJECT** | `unknown` | Theme preset; use controlled theme system. |
| `my.icons` | **MERGE** | `unknown` | Icon-stack overlap. |
| `plugin.codicon.font` | **MERGE** | `unknown` | Icon-stack overlap. |
| `sebastianjnuwu.acode.eruda` | **REVIEW** | `Apache-2.0` | Useful web debugging reference; avoid making arbitrary injection the default. |
| `sebastianjnuwu.material.icons` | **MERGE** | `Apache-2.0` | Icon-stack overlap. |
| `sebastianjnuwu.theme.vscode` | **REJECT** | `Apache-2.0` | Theme preset, not a separate subsystem. |
| `simple.python.runner` | **MERGE** | `unknown` | Python execution overlap. |
| `su_hat_sudo_font` | **REJECT** | `unknown` | Font preset. |
| `thunder.plugin.csv_to_table.free` | **REVIEW** | `MIT` | Overlaps CSV viewer; keep one table implementation. |
| `x.always.welcome.page` | **REJECT** | `MIT` | App shell should own onboarding. |
| `x.better.appslauncher` | **REJECT** | `MIT` | App shell concern. |
| `x.better.ui` | **REJECT** | `MIT` | UI should be native to the new application. |
| `x.treesitter` | **REVIEW** | `MIT` | Strong editor-platform candidate; validate version/engine integration. |
| `x.wakatime` | **KEEP** | `unknown` | Useful optional telemetry/time tracking; opt-in only. |
| `ych.json2code` | **KEEP** | `MIT` | Useful developer productivity tool. |

## High-confidence merge buckets

- **Execution:** `acode.code.runner`, `acode.runner.plugin`, `com.arfoxcode.runner_python_node`, `simple.python.runner`, `com.alpha10.quickjsrunner` → one Execution Engine.
- **Web preview:** `acode.plugin.acelivepreview`, `acode.plugin.localhostpreview`, `com.techsetuapps.instantweb.livepreviewer` → one Web Preview Engine.
- **Database:** `acode.db.visualizer`, `com.acode.sqliteviewer`, `com.alis219.sqlite.viewer` → one Database Studio.
- **Git:** `acode.plugin.github`, `dev.rugved.githubmanager`, `aocde.clone.repo`, `bajrangcoder.git.dust`, `acode.plugin.version.control.gitpro` → one Source Control subsystem.
- **AI:** `acode.plugin.chatgpt`, `acode.plugin.acopilot`, `blackbox.ai`, `com.heyitsaadin.ai_agent`, `hallofcodes.rutex.coding_agent` → one AI Platform with provider adapters and a workspace permission gate.
- **Icons:** all icon packs → one Icon Engine.
- **Themes:** all visual themes → one Theme Engine with optional presets.

## Runtime evidence from the uploaded snapshot

The runtime log contains duplicate plugin global declarations, duplicate editor extension compartments, DOM removal errors, missing paths, and repeated fetch failures. Those are evidence that plugin stacking needs architectural consolidation rather than simply changing load order.

## External add-ons

`ace-linters-2.3.4.zip` and `suger-devtool-main.zip` are separate source archives in the uploaded bundle. They are candidates for adaptation, but are governed by their own source/license/dependency/security review.