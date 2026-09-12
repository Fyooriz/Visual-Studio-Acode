#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const nativeHttpPath = path.join(root, 'app', 'src', 'main', 'java', 'com', 'fyooriz', 'visualstudioacode', 'NativeHttp.java');
const mainActivityPath = path.join(root, 'app', 'src', 'main', 'java', 'com', 'fyooriz', 'visualstudioacode', 'MainActivity.java');
const manifestPath = path.join(root, 'app', 'src', 'main', 'AndroidManifest.xml');
const securityPath = path.join(root, 'docs', 'SECURITY_AND_LICENSES.md');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const nativeHttp = fs.readFileSync(nativeHttpPath, 'utf8');
const mainActivity = fs.readFileSync(mainActivityPath, 'utf8');
const manifest = fs.readFileSync(manifestPath, 'utf8');
const security = fs.readFileSync(securityPath, 'utf8');

assert(nativeHttp.includes('static URI validateRequest(String method, String url)'), 'NativeHttp must expose a reusable request validation boundary');
assert(nativeHttp.includes('"https".equalsIgnoreCase(uri.getScheme())'), 'NativeHttp must validate the URL scheme');
assert(nativeHttp.includes('Only HTTPS URLs are allowed by the native API boundary'), 'NativeHttp HTTPS rejection message missing');
assert(nativeHttp.includes('ALLOWED_METHODS'), 'NativeHttp must define an HTTP method allowlist');
assert(nativeHttp.includes('embedded credentials'), 'NativeHttp must reject embedded URL credentials');
assert(nativeHttp.includes('Local or reserved network targets are blocked'), 'NativeHttp must block local/reserved network targets');
assert(nativeHttp.includes('BLOCKED_HEADERS'), 'NativeHttp must filter transport-level headers');
assert(nativeHttp.includes('setInstanceFollowRedirects(false)'), 'NativeHttp must not follow redirects automatically');
assert(nativeHttp.includes('MAX_BODY_BYTES') && nativeHttp.includes('MAX_RESPONSE_BYTES'), 'NativeHttp must bound request and response sizes');
assert(mainActivity.includes('NativeHttp.request(method, urlString, rawHeaders, body)'), 'MainActivity must route outbound HTTP through NativeHttp');
assert(!mainActivity.includes('url.openConnection()'), 'MainActivity must not own outbound HTTP connections');
assert(manifest.includes('android:allowBackup="false"'), 'Automatic Android app backup must remain disabled until a data policy exists');
assert(security.includes('Prefer argument arrays/process APIs over shell strings.'), 'Terminal command safety guidance missing');

console.log('Security contract validation passed: NativeHttp ownership, HTTPS/method/SSRF/header policy, limits, backup policy, and terminal guidance are present.');
