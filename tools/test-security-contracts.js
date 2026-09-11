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
assert(mainActivity.includes('Native API network capability is disabled until provider-scoped networking is implemented.'), 'MainActivity native network bridge must remain disabled');
assert(!mainActivity.includes('HttpURLConnection'), 'MainActivity must not expose a generic HttpURLConnection bridge');
assert(!mainActivity.includes('import java.net.'), 'MainActivity must not import direct network APIs');
assert(security.includes('Prefer argument arrays/process APIs over shell strings.'), 'Terminal command safety guidance missing');

console.log('Security contract validation passed: native network bridge is closed and terminal guidance is present.');