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
assert(mainActivity.includes('new ProcessBuilder("/system/bin/sh", "-c", trimmed)'), 'legacy MainActivity terminal path changed; review integration before enabling it');

console.log('Terminal policy validation passed: restricted command allowlist, shell-token guards, path guards, and bounded concurrency are present.');
console.log('NOTE: MainActivity still contains a separate legacy shell path and therefore terminal remains BLOCKED until both execution paths share one owner.');
