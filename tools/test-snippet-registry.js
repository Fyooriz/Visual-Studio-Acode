'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sourcePath = path.join(__dirname, '..', 'app', 'src', 'main', 'assets', 'platform', 'snippet-registry.js');
const source = fs.readFileSync(sourcePath, 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context, { filename: sourcePath });

const snippets = context.window.VSACSnippets;
assert.ok(snippets, 'VSACSnippets provider must initialize');

assert.equal(snippets.get('clg', 'JavaScript'), 'console.log(${1});');
assert.equal(snippets.get('clg', 'js'), 'console.log(${1});');
assert.equal(snippets.get('print', 'Python'), 'print(${1})');
assert.equal(snippets.get('println', 'Kotlin'), 'println(${1})');
assert.equal(snippets.get('clg', 'Python'), null);
assert.equal(snippets.get('clg', 'TypeScript'), null);
assert.equal(snippets.get('clg', 'ts'), null);
assert.equal(snippets.get('clg', 'Scala'), null);
assert.equal(snippets.get('clg', 'Plain Text'), null);
assert.deepEqual(snippets.list('Plain Text'), []);
assert.deepEqual(snippets.list('Julia', 'clg'), []);

console.log('Snippet registry checks passed.');
