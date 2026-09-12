#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const registryPath = path.join(root, 'app', 'src', 'main', 'assets', 'feature-registry.json');
const featureRegistryJavaPath = path.join(root, 'app', 'src', 'main', 'java', 'com', 'fyooriz', 'visualstudioacode', 'platform', 'FeatureRegistry.java');
const architecturePath = path.join(root, 'docs', 'ARCHITECTURE.md');
const pluginAuditPath = path.join(root, 'docs', 'PLUGIN_AUDIT.md');
const securityPath = path.join(root, 'docs', 'SECURITY_AND_LICENSES.md');
const sourceAuditPath = path.join(root, 'docs', 'SOURCE-AUDIT-2026-09-06.md');
const sourceManifestPath = path.join(root, 'docs', 'SOURCE-MANIFEST-2026-09-06.json');
const aiSkillPolicyPath = path.join(root, 'docs', 'AI_SKILL_RUNTIME_POLICY.md');
const allowedStatuses = new Set(['PLANNED','IMPLEMENTING','IMPLEMENTED','INTEGRATED','TESTED','VERIFIED','BLOCKED','DEPRECATED']);
const trackedSourceContainers = ['Data apk.zip','Informasi.zip','Skill.zip'];
const canonicalJavaFeatureMap = new Map([
  ['editor', 'editor'],
  ['workspace', 'workspace'],
  ['diagnostics', 'diagnostics'],
  ['lsp', 'lsp'],
  ['formatting', 'format'],
  ['execution', 'execution'],
  ['terminal', 'terminal'],
  ['webPreview', 'preview'],
  ['devTools', 'devtools'],
  ['git', 'git'],
  ['database', 'database'],
  ['ai', 'ai'],
  ['remote', 'remote'],
  ['androidTooling', 'project-tools'],
  ['flutterTooling', 'project-tools']
]);
function assert(condition, message) { if (!condition) throw new Error(message); }
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
assert(Number.isInteger(registry.schemaVersion) && registry.schemaVersion >= 2, 'feature-registry schemaVersion must be >= 2');
assert(registry.product === 'Visual Studio Acode', 'feature-registry product mismatch');
assert(registry.sourcePolicy && Array.isArray(registry.sourcePolicy.uploadedArchives), 'uploaded archive source policy missing');
for (const archive of ['Acode.zip','Acode screenshot.zip','ace-linters-2.3.4.zip','suger-devtool-main.zip']) assert(registry.sourcePolicy.uploadedArchives.includes(archive), `missing source archive in registry: ${archive}`);
assert(Array.isArray(registry.sourcePolicy.governanceDocuments), 'governance document source policy missing');
for (const document of ['Prompt.md','text.txt']) assert(registry.sourcePolicy.governanceDocuments.includes(document), `missing governance source in registry: ${document}`);
assert(Array.isArray(registry.sourcePolicy.sourceContainers), 'new source container policy missing');
for (const container of trackedSourceContainers) assert(registry.sourcePolicy.sourceContainers.includes(container), `missing source container in registry: ${container}`);
assert(Array.isArray(registry.sourcePolicy.sourcePackages), 'new source package inventory missing');
for (const packageName of ['Acode-main.zip','termux-app-master.zip','vscode-main.zip']) assert(registry.sourcePolicy.sourcePackages.includes(packageName), `missing core source package in registry: ${packageName}`);
assert(registry.sourcePolicy.externalEvidenceHashes && typeof registry.sourcePolicy.externalEvidenceHashes === 'object', 'external evidence hashes missing');
for (const source of ['Acode.zip','Acode screenshot.zip','Prompt.md','text.txt',...trackedSourceContainers]) {
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
assert(fs.existsSync(featureRegistryJavaPath), 'Java feature registry missing');
const javaRegistry = fs.readFileSync(featureRegistryJavaPath, 'utf8');
const javaEntries = new Map();
for (const match of javaRegistry.matchAll(/new Feature\("([^"]+)", "([^"]+)", "([^"]+)"\)/g)) {
  javaEntries.set(match[1], { owner: match[2], status: match[3] });
}
for (const [jsonFeatureId, javaFeatureId] of canonicalJavaFeatureMap) {
  assert(registry.features[jsonFeatureId], `canonical JSON feature missing: ${jsonFeatureId}`);
  assert(javaEntries.has(javaFeatureId), `Java feature registry missing canonical feature: ${javaFeatureId}`);
  assert(javaEntries.get(javaFeatureId).owner === registry.features[jsonFeatureId].owner, `${jsonFeatureId}: Java owner ${javaEntries.get(javaFeatureId).owner} != JSON owner ${registry.features[jsonFeatureId].owner}`);
}
for (const forbiddenOwner of ['DiagnosticsPlatform', 'ExecutionEngine', 'RemoteWorkspace']) assert(!javaRegistry.includes(forbiddenOwner), `stale Java subsystem owner remains: ${forbiddenOwner}`);
for (const doc of [architecturePath, pluginAuditPath, securityPath, sourceAuditPath, sourceManifestPath, aiSkillPolicyPath]) assert(fs.existsSync(doc), `required governance document missing: ${path.relative(root, doc)}`);
const architecture = fs.readFileSync(architecturePath, 'utf8');
assert(architecture.includes('one owner'), 'architecture must document one-owner subsystem rule');
assert(architecture.includes('EditorAdapter'), 'architecture must list internal integration contracts');
const security = fs.readFileSync(securityPath, 'utf8');
for (const term of ['Unknown license','AI','Terminal']) assert(security.includes(term), `security/license gate missing ${term} coverage`);
const sourceAudit = fs.readFileSync(sourceAuditPath, 'utf8');
for (const term of ['Acode-main','termux-app-master','vscode-main','Skill/agent collections']) assert(sourceAudit.includes(term), `source audit missing ${term} coverage`);
const sourceManifest = JSON.parse(fs.readFileSync(sourceManifestPath, 'utf8'));
assert(sourceManifest.schemaVersion === 1, 'source manifest schemaVersion must be 1');
for (const container of trackedSourceContainers) assert(sourceManifest.containers && sourceManifest.containers[container], `source manifest missing ${container}`);
const manifestPackageNames = new Set();
for (const [container, metadata] of Object.entries(sourceManifest.containers)) {
  assert(metadata && typeof metadata.sha256 === 'string' && /^[0-9a-f]{64}$/.test(metadata.sha256), `${container}: invalid source manifest sha256`);
  const registryHash = registry.sourcePolicy.externalEvidenceHashes[container];
  if (registryHash) assert(registryHash === `sha256:${metadata.sha256}`, `${container}: registry and source manifest SHA-256 mismatch`);
  assert(Array.isArray(metadata.packages), `${container}: packages array missing`);
  for (const pkg of metadata.packages) {
    assert(pkg && typeof pkg.name === 'string' && pkg.name.length > 0, `${container}: package name missing`);
    assert(typeof pkg.sha256 === 'string' && /^[0-9a-f]{64}$/.test(pkg.sha256), `${container}/${pkg.name}: invalid package sha256`);
    manifestPackageNames.add(pkg.name);
  }
}
for (const packageName of manifestPackageNames) assert(registry.sourcePolicy.sourcePackages.includes(packageName), `manifest package missing from registry sourcePackages: ${packageName}`);
const aiSkillPolicy = fs.readFileSync(aiSkillPolicyPath, 'utf8');
for (const term of ['AIPlatform','declarative','permission','audit event','licens']) assert(aiSkillPolicy.includes(term), `AI skill runtime policy missing ${term} coverage`);
console.log(`Governance validation passed: ${Object.keys(registry.features).length} feature records, ${javaEntries.size} Java owner records, and ${manifestPackageNames.size} source packages checked.`);
