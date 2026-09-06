# Third-party source audit

Visual Studio Acode incorporates design and adaptation work based on user-provided source archives. This file records provenance without implying that every bundled source file is redistributed.

## ace-linters 2.3.4
- Source archive: `ace-linters-2.3.4.zip`
- License evidence: MIT License, copyright Azat Alimov (2022)
- Intended use: reference/adaptation for Language Services, diagnostics, linting and formatting.
- Integration rule: do not load a second independent editor/LSP global. Adapt capabilities behind the Visual Studio Acode engine contracts.

## Suger DevTool source archive
- Source archive: `suger-devtool-main.zip`
- Intended use: reference/adaptation for developer tooling such as console, runtime errors, DOM/Elements, styles, network and debugging concepts.
- The supplied source contains an activation/license/fingerprinting subsystem and network license-server calls. Those parts are excluded from the Visual Studio Acode default architecture.

## Acode snapshot
- Source archive: `Acode.zip`
- The supplied snapshot contains Acode runtime data, settings, logs and nested plugin archives.
- Runtime log evidence includes duplicate plugin globals, extension-compartment collisions, filesystem API incompatibilities, missing paths and network fetch failures.
- Result: overlapping capabilities are consolidated rather than loaded as independent plugins.

## Screenshot archive
- Source archive: `Acode screenshot.zip`
- Used as UI/feature reference only.

Every future third-party code import must pass source/license, dependency, security and architectural-fit review before distribution.