#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const registryPath = path.join(root, 'app', 'src', 'main', 'assets', 'feature-registry.json');
const architecturePath = path.join(root, 'docs', 'ARCHITECTURE.md');
const pluginAuditPath = path.join(root, 'docs', 'PLUGIN_AUDIT.md');
const securityPath = path.join(root, 'docs', 'SECURITY_AND_LICENSES.md');
const allowedStatuses = new Set(['PLANNED','IMPLEMENTING','IMPLEMENTED','INTEGRATED','TESTED','VERIFIED','BLOCKED','DEPRECATED']);
function assert(condition, message) { if (!condition) throw new Error(message); }
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
assert(registry.schemaVersion === 2, 'feature-registry schemaVersion must be 2');
assert(registry.product === 'Visual Studio Acode', 'feature-registry product mismatch');
assert(registry.sourcePolicy && Array.isArray(registry.sourcePolicy.uploadedArchives), 'uploaded archive source policy missing');
for (const archive of ['Acode.zip','Acode screenshot.zip','ace-linters-2.3.4.zip','suger-devtool-main.zip']) assert(registry.sourcePolicy.uploadedArchives.includes(archive), `missing source archive in registry: ${archive}`);
assert(Array.isArray(registry.sourcePolicy.governanceDocuments), 'governance document source policy missing');
for (const document of ['Prompt.md','text.txt']) assert(registry.sourcePolicy.governanceDocuments.includes(document), `missing governance source in registry: ${document}`);
assert(registry.sourcePolicy.externalEvidenceHashes && typeof registry.sourcePolicy.externalEvidenceHashes === 'object', 'external evidence hashes missing');
for (const source of ['Acode.zip','Acode screenshot.zip','Prompt.md','text.txt']) {
  const hash = registry.sourcePolicy.externalEvidenceHashes[source];
  assert(typeof hash === 'string' && /^sha256:[0-9a-f]{64}$/.test(hash), `invalid sha256 evidence hash for ${source}`);
}
assert(registry.features && typeof registry.features === 'object', 'feature registry has no features object');
for (const [id, feature] of Object.entries(registry.features)) {
  assert(allowedStatuses.has(feature.status), `${id}: invalid status ${feature.status}`);
  assert(feature.owner, `${id}: owner is required`);
  assert(Array.isArray(feature.sources), `${id}: sources must be an array`);
  assert(feature.evidence && typeof feature.evidence === 'object', `${id}: evidence is required`);
  if (feature.status === 'BLOCKED') assert(typeof feature.blocker === 'string' && feature.blocker.length > 0, `${id}: BLOCKED requires a concrete blocker`);
  if (feature.status === 'VERIFIED') for (const key of ['build','test','runtime','security']) assert(feature.evidence[key] === 'pass', `${id}: VERIFIED requires evidence.${key}=pass`);
}
for (const doc of [architecturePath, pluginAuditPath, securityPath]) assert(fs.existsSync(doc), `required governance document missing: ${path.relative(root, doc)}`);
const architecture = fs.readFileSync(architecturePath, 'utf8');
assert(architecture.includes('one owner'), 'architecture must document one-owner subsystem rule');
assert(architecture.includes('EditorAdapter'), 'architecture must list internal integration contracts');
const security = fs.readFileSync(securityPath, 'utf8');
for (const term of ['Unknown license','AI','Terminal']) assert(security.includes(term), `security/license gate missing ${term} coverage`);
console.log(`Governance validation passed: ${Object.keys(registry.features).length} feature records checked.`);
