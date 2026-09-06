#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const nativeHttpPath = path.join(root, 'app', 'src', 'main', 'java', 'com', 'fyooriz', 'visualstudioacode', 'NativeHttp.java');
const mainActivityPath = path.join(root, 'app', 'src', 'main', 'java', 'com', 'fyooriz', 'visualstudioacode', 'MainActivity.java');
const securityPath = path.join(root, 'docs', 'SECURITY_AND_LICENSES.md');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const nativeHttp = fs.readFileSync(nativeHttpPath, 'utf8');
const mainActivity = fs.readFileSync(mainActivityPath, 'utf8');
const security = fs.readFileSync(securityPath, 'utf8');

assert(nativeHttp.includes('if (!"https".equalsIgnoreCase(scheme))'), 'NativeHttp must enforce HTTPS-only URLs');
assert(nativeHttp.includes('Only HTTPS URLs are allowed'), 'NativeHttp HTTPS rejection message missing');
assert(!nativeHttp.includes('if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme))'), 'NativeHttp must not allow plain HTTP');
assert(mainActivity.includes('Only HTTPS URLs are allowed by the native API boundary.'), 'MainActivity HTTPS boundary missing');
assert(security.includes('Prefer argument arrays/process APIs over shell strings.'), 'Terminal command safety guidance missing');

console.log('Security contract validation passed: HTTPS policy and terminal guidance are present.');
