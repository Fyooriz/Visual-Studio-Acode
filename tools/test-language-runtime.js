#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const runtimePath = path.resolve(__dirname, '..', 'app', 'src', 'main', 'assets', 'platform', 'language-runtime.js');
const source = fs.readFileSync(runtimePath, 'utf8');

const context = {
  document: {
    addEventListener() {},
    querySelector() { return null; }
  },
  window: {},
  console,
  String,
  Object,
  Error
};
vm.runInNewContext(source, context, { filename: runtimePath });

const api = context.window.VSACLanguages;
if (!api || typeof api.detect !== 'function') throw new Error('VSACLanguages.detect is unavailable');

const cases = {
  'main.js': 'JavaScript',
  'component.jsx': 'JavaScript JSX',
  'service.ts': 'TypeScript',
  'view.tsx': 'TypeScript TSX',
  'index.html': 'HTML',
  'styles.scss': 'SCSS',
  'theme.sass': 'Sass',
  'query.sql': 'SQL',
  'tool.py': 'Python',
  'Main.java': 'Java',
  'Main.kt': 'Kotlin',
  'build.gradle': 'Gradle',
  'server.go': 'Go',
  'lib.rs': 'Rust',
  'Program.cs': 'C#',
  'app.dart': 'Dart',
  'main.swift': 'Swift',
  'script.ps1': 'PowerShell',
  'deploy.yaml': 'YAML',
  'main.tf': 'Terraform',
  'schema.graphql': 'GraphQL',
  'component.vue': 'Vue',
  'component.svelte': 'Svelte',
  'classes.smali': 'Smali',
  'schema.prisma': 'Prisma',
  'Dockerfile': 'Dockerfile',
  'Makefile': 'Makefile',
  'README': 'Plain Text',
  'unknown.xyz': 'Plain Text'
};

for (const [name, expected] of Object.entries(cases)) {
  const actual = api.detect(name);
  if (actual !== expected) {
    throw new Error(`${name}: expected ${expected}, received ${actual}`);
  }
}

console.log(`Language runtime validation passed: ${Object.keys(cases).length} filename mappings checked.`);
