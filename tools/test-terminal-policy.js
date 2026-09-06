#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const policyPath = path.join(root, 'app', 'src', 'main', 'java', 'com', 'fyooriz', 'visualstudioacode', 'TerminalPolicy.java');
const nativeTerminalPath = path.join(root, 'app', 'src', 'main', 'java', 'com', 'fyooriz', 'visualstudioacode', 'NativeTerminal.java');
const mainActivityPath = path.join(root, 'app', 'src', 'main', 'java', 'com', 'fyooriz', 'visualstudioacode', 'MainActivity.java');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const policy = fs.readFileSync(policyPath, 'utf8');
const nativeTerminal = fs.readFileSync(nativeTerminalPath, 'utf8');
const mainActivity = fs.readFileSync(mainActivityPath, 'utf8');

for (const command of ['pwd', 'ls', 'cat', 'head', 'tail', 'echo', 'mkdir', 'touch']) {
  assert(policy.includes(`\"${command}\"`), `restricted terminal must define allowlisted command: ${command}`);
}
for (const token of [';', '&&', '||', '|', '>', '<', '`', '$(', '${']) {
  assert(policy.includes(`\"${token}`), `restricted terminal must reject shell token: ${token}`);
}
assert(policy.includes('Path traversal is not allowed'), 'path traversal guard missing');
assert(policy.includes('Absolute paths are not allowed'), 'absolute path guard missing');
assert(policy.includes('Home-directory expansion is not allowed'), 'home expansion guard missing');
assert(nativeTerminal.includes('TerminalPolicy.validate'), 'NativeTerminal must enforce TerminalPolicy');
assert(nativeTerminal.includes('Executors.newFixedThreadPool(2)'), 'NativeTerminal must bound concurrent executions');
assert(nativeTerminal.includes('ProcessBuilder("/system/bin/sh", "-c", requested)'), 'NativeTerminal execution owner missing expected restricted launcher');
assert(mainActivity.includes('private NativeTerminal nativeTerminal;'), 'MainActivity must hold the single NativeTerminal owner');
assert(mainActivity.includes('nativeTerminal = new NativeTerminal(getFilesDir())'), 'MainActivity must initialize NativeTerminal');
assert(mainActivity.includes('nativeTerminal.run(command'), 'MainActivity must delegate terminal execution to NativeTerminal');
assert(!mainActivity.includes('new ProcessBuilder("/system/bin/sh", "-c", trimmed)'), 'duplicate MainActivity shell execution path must be removed');
assert(!mainActivity.includes('COMMAND_TIMEOUT_SECONDS'), 'duplicate MainActivity terminal timeout constant must be removed');
assert(mainActivity.includes('nativeTerminal.shutdown()'), 'MainActivity must shut down NativeTerminal with lifecycle');

console.log('Terminal policy validation passed: restricted command allowlist, shell-token/path guards, bounded concurrency, and single-owner integration are present.');
