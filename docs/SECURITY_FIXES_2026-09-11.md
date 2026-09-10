# Security Hardening — 2026-09-11

This change set addresses application security findings from the pre-launch audit. It does not claim the terminal security gate is passed.

## Applied

- Persist AI mutation audit events locally with bounded retention.
- Enable Core Library Desugaring and lower the Android minimum SDK target to API 21.
- Add a restrictive Content Security Policy to the local application WebView document.
- Disable the generic `VSACNative.httpRequest()` network path. API Studio cannot invoke native networking until a provider-scoped capability exists.

## Intentionally not resolved here

- Terminal OS/container isolation and explicit CPU/memory/process quotas remain unavailable. The terminal remains `BLOCKED`.
- Provider-scoped network capability is still not implemented; the generic native network boundary is now closed rather than exposed.
- Full third-party archive inspection remains an audit task; unresolved licensing or security evidence does not enter the distributable build.

## Verification rule

No feature is promoted to `INTEGRATED`, `TESTED`, or `VERIFIED` from source inspection alone. Build, tests, runtime evidence, and security evidence are required by project governance.