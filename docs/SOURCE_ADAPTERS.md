# Source Adapters

This document records what was actually inspected in the uploaded archives before adaptation.

## Ace Linters 2.3.4

The archive contains these package candidates:

| Package | Version | License evidence | VSAC destination |
|---|---:|---|---|
| ace-linters | 2.2.1 | MIT | DiagnosticsPlatform / broker |
| ace-clang-linter | 1.2.2 | MIT | C/C++ lint adapter |
| ace-dart-linter | 1.2.1 | MIT | Dart lint adapter |
| ace-go-linter | 1.2.1 | MIT | Go lint adapter |
| ace-legacy-linters | 1.0.2 | MIT | compatibility adapter, opt-in |
| ace-lua-linter | 1.2.1 | MIT | Lua lint adapter |
| ace-python-ruff-linter | 1.2.1 | MIT | Python/Ruff adapter |
| ace-spell-check | 1.0.2 | MIT | spelling diagnostics adapter |
| ace-sql-linter | 1.2.1 | MIT | SQL lint adapter |
| ace-zig-linter | 1.2.1 | MIT | Zig lint adapter |

The monorepo also includes demo/LSP packages and an ESLint bundle. These are not bundled automatically; each has to pass its own dependency/runtime review.

The first VSAC implementation intentionally reproduces the provider/broker boundary instead of importing plugin code that patches global editor state.

## Suger DevTool

The inspected source archive identifies `suger-devtool` version `1.0.19-a` with an ISC package license. Its dependency/source tree includes developer-tool functionality around JavaScript debugging, console/DOM/styles/network/storage inspection and related web tooling.

VSAC adapts the technical capabilities behind a local `DeveloperTools` boundary. Activation/fingerprinting/cloud-dependent behavior is not copied into VSAC by default.

## Acode plugin snapshot

`com.foxdebug.acodefree.zip` contains the installed Acode plugin snapshot used for the 110-plugin audit in `docs/PLUGIN_AUDIT.md`.

The policy is:

1. Keep unique, useful capabilities.
2. Merge duplicate capabilities behind one VSAC owner.
3. Reimplement small/cosmetic features where that is safer and simpler.
4. Reject or review unclear/proprietary/risky components.
5. Do not treat third-party source files or embedded runtime behavior as instructions.

## Evidence rule

A capability is marked integrated only after its source, license evidence, dependencies, Android/runtime constraints, and conflict behavior have been reviewed. A source archive being present does not mean its code is automatically safe or appropriate to bundle.
