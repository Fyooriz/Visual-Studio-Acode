#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const javaRoot = path.join(root, 'app', 'src', 'main', 'java', 'com', 'fyooriz', 'visualstudioacode');
const policyPath = path.join(javaRoot, 'TerminalPolicy.java');
const nativeTerminalPath = path.join(javaRoot, 'NativeTerminal.java');
const mainActivityPath = path.join(javaRoot, 'MainActivity.java');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(file) {
  assert(fs.existsSync(file), `required source file is missing: ${path.relative(root, file)}`);
  return fs.readFileSync(file, 'utf8');
}

const policy = read(policyPath);
const nativeTerminal = read(nativeTerminalPath);
const mainActivity = read(mainActivityPath);

for (const command of ['pwd', 'ls', 'cat', 'head', 'tail', 'echo', 'mkdir', 'touch']) {
  assert(new RegExp(`\\"${command}\\"`).test(policy), `restricted terminal must define allowlisted command: ${command}`);
}

for (const token of [';', '&&', '||', '|', '>', '<', '`', '$(', '${']) {
  assert(policy.includes(`"${token}`), `restricted terminal must reject shell token: ${token}`);
}

for (const message of [
  'Path traversal is not allowed',
  'Absolute paths are not allowed',
  'Home-directory expansion is not allowed',
]) {
  assert(policy.includes(message), `path security guard missing: ${message}`);
}

assert(nativeTerminal.includes('TerminalPolicy.validate'), 'NativeTerminal must enforce TerminalPolicy');
assert(nativeTerminal.includes('Executors.newFixedThreadPool(2)'), 'NativeTerminal must bound concurrent executions');
assert(nativeTerminal.includes('ProcessBuilder("/system/bin/sh", "-c", requested)'), 'NativeTerminal must own the restricted process launcher');

assert(mainActivity.includes('private NativeTerminal nativeTerminal;'), 'MainActivity must hold the single NativeTerminal owner');
assert(mainActivity.includes('nativeTerminal = new NativeTerminal(getFilesDir());'), 'MainActivity must initialize NativeTerminal');
assert(mainActivity.includes('nativeTerminal.run(command,'), 'MainActivity must delegate terminal execution to NativeTerminal');
assert(mainActivity.includes('nativeTerminal.shutdown();'), 'MainActivity must shut down NativeTerminal with lifecycle');
assert(!mainActivity.includes('ProcessBuilder("/system/bin/sh", "-c", trimmed)'), 'duplicate MainActivity shell execution path must be removed');
assert(!mainActivity.includes('COMMAND_TIMEOUT_SECONDS'), 'duplicate MainActivity terminal timeout constant must be removed');
assert(!mainActivity.includes('terminalWorkspace'), 'duplicate MainActivity terminal workspace state must be removed');

console.log('Terminal policy validation passed: allowlist, shell/path guards, bounded concurrency, and single-owner integration are present.');
