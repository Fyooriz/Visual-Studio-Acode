'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sourcePath = path.join(__dirname, '..', 'app', 'src', 'main', 'assets', 'platform', 'diagnostics.js');
const source = fs.readFileSync(sourcePath, 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context, { filename: sourcePath });

const diagnostics = context.window.VSACDiagnostics;
assert.ok(diagnostics, 'VSACDiagnostics provider must initialize');

const sameJson = (actual, expected, message) => {
  assert.equal(JSON.stringify(actual), JSON.stringify(expected), message);
};

sameJson(diagnostics.validate({
  uri: 'untitled://valid-json',
  language: 'JSON',
  content: '{"ok":true}'
}), []);

const jsonErrors = diagnostics.validate({
  uri: 'untitled://invalid-json',
  language: 'JSON',
  content: '{\n  "ok": }'
});
assert.equal(jsonErrors.length, 1);
assert.equal(jsonErrors[0].severity, 'error');
assert.match(jsonErrors[0].message, /^Invalid JSON:/);
assert.equal(jsonErrors[0].line, 2);
assert.ok(jsonErrors[0].column >= 1);
sameJson(diagnostics.list('untitled://invalid-json'), jsonErrors);

diagnostics.clear('untitled://invalid-json');
sameJson(diagnostics.list('untitled://invalid-json'), []);

const bracketErrors = diagnostics.validate({
  uri: 'untitled://broken-js',
  language: 'JavaScript',
  content: 'function x() {\n  if (true) {\n    return 1;\n  ]\n}'
});
assert.ok(bracketErrors.some((item) => item.message === "Unmatched ']'"));

sameJson(diagnostics.validate({
  uri: 'untitled://brackets-in-string',
  language: 'JavaScript',
  content: "const value = 'not a ) bracket';\nconst template = `not a } bracket`;"
}), []);

sameJson(diagnostics.validate({
  uri: 'untitled://brackets-in-comments',
  language: 'JavaScript',
  content: '// fake } bracket\n/* fake ] bracket */\nconst value = { ok: true };'
}), []);

sameJson(diagnostics.validate({
  uri: 'untitled://sql-comment',
  language: 'SQL',
  content: 'SELECT 1 -- fake ) bracket\nFROM dual;'
}), []);

const providerId = 'test-provider';
const unregister = diagnostics.register({
  id: providerId,
  languages: ['Plain Text'],
  validate() {
    return [{ severity: 'info', message: 'custom diagnostic', line: 4, column: 6 }];
  }
});
const custom = diagnostics.validate({
  uri: 'untitled://custom',
  language: 'Plain Text',
  content: 'text'
});
sameJson(custom, [{
  source: providerId,
  severity: 'info',
  message: 'custom diagnostic',
  line: 4,
  column: 6
}]);
unregister();

const throwingId = 'throwing-provider';
const unregisterThrowing = diagnostics.register({
  id: throwingId,
  languages: ['Plain Text'],
  validate() {
    throw new Error('synthetic provider failure');
  }
});
const failure = diagnostics.validate({
  uri: 'untitled://provider-failure',
  language: 'Plain Text',
  content: 'text'
});
sameJson(failure, [{
  source: throwingId,
  severity: 'error',
  message: 'Diagnostic provider failed: synthetic provider failure',
  line: 1,
  column: 1
}]);
unregisterThrowing();

console.log('Diagnostics checks passed.');
