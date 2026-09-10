const editor = document.querySelector('#editor');
const gutter = document.querySelector('#gutter');
const position = document.querySelector('#position');
const language = document.querySelector('#language');
const dirty = document.querySelector('#dirty');
const tabs = document.querySelector('#tabs');
const panel = document.querySelector('#panel');
const panelTitle = document.querySelector('#panel-title');
const panelClose = document.querySelector('#panel-close');
const command = document.querySelector('#command');
const commandList = document.querySelector('#command-list');
const previewBody = document.querySelector('#preview-body');
const toast = document.querySelector('#toast');
const workspace = document.querySelector('#workspace');
const diagnosticsCount = document.querySelector('#diagnostics-count');

const STORAGE_KEY = 'vsac.workspace.v3';
const state = { activeId: 'main.js', files: new Map(), panelMode: 'commands', previewFrame: null };

const COMMANDS = [
  ['New File', () => createUntitled()], ['Open File', () => openNative()], ['Save File', () => saveCurrent()],
  ['Find in File', () => openFind()], ['Preview HTML', () => previewHtml()], ['Terminal', () => openTerminal()],
  ['API Studio', () => openApiStudio()], ['Problems', () => openProblems()], ['DevTools', () => openDevTools()],
  ['Languages', () => openLanguages()],
  ['AI Assistant', () => showTool('AI Assistant', 'Provider adapters and permissioned project edits are reserved for the AI Platform implementation.')],
  ['LSP Status', () => showTool('LSP', 'The language-service broker is isolated from editor globals. Language adapters can be registered independently.')]
];

function seed() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) { try { const data = JSON.parse(saved); for (const file of data.files || []) state.files.set(file.id, file); state.activeId = data.activeId || state.activeId; } catch (_) {} }
  if (!state.files.size) {
    addFile('main.js', 'JavaScript', `function hello() {\n  return "Visual Studio Acode";\n}\n\nconsole.log(hello());\n`);
    addFile('README.md', 'Markdown', '# Visual Studio Acode\n\nMobile-first developer workspace.\n');
    addFile('index.html', 'HTML', '<!doctype html>\n<html>\n  <head><title>VSAC</title></head>\n  <body><h1>Visual Studio Acode</h1></body>\n</html>\n');
  }
  activate(state.activeId);
}

function addFile(id, lang, content) { state.files.set(id, { id, name: id, language: lang, content, dirty: false }); }
function createUntitled() { let n = 1; while (state.files.has(`untitled-${n}.txt`)) n++; const id = `untitled-${n}.txt`; addFile(id, 'Plain Text', ''); activate(id); closePanel(); }
function activate(id) { if (!state.files.has(id)) return; const current = state.files.get(state.activeId); if (current) current.content = editor.value; state.activeId = id; const file = state.files.get(id); editor.value = file.content; workspace.textContent = 'Local workspace'; language.textContent = file.language; dirty.textContent = file.dirty ? 'Modified' : 'Saved'; renderTabs(); sync(); }
function renderTabs() { tabs.innerHTML = ''; for (const file of state.files.values()) { const el = document.createElement('button'); el.className = `tab${file.id === state.activeId ? ' active' : ''}`; el.textContent = `${file.name}${file.dirty ? ' •' : ''}`; el.title = file.name; el.onclick = () => activate(file.id); tabs.appendChild(el); } const add = document.createElement('button'); add.className = 'tab add-tab'; add.textContent = '+'; add.title = 'New file'; add.onclick = createUntitled; tabs.appendChild(add); }
function renderGutter() { const lines = editor.value.split('\n').length; gutter.textContent = Array.from({ length: Math.max(1, lines) }, (_, i) => i + 1).join('\n'); gutter.scrollTop = editor.scrollTop; }
function updatePosition() { const before = editor.value.slice(0, editor.selectionStart); const line = before.split('\n').length; const lastBreak = before.lastIndexOf('\n'); position.textContent = `Ln ${line}, Col ${before.length - lastBreak}`; }
function sync() { const file = state.files.get(state.activeId); if (file) file.content = editor.value; renderGutter(); updatePosition(); runDiagnostics(); persist(); }
function markDirty() { const file = state.files.get(state.activeId); if (!file) return; file.content = editor.value; file.dirty = true; dirty.textContent = 'Modified'; renderTabs(); renderGutter(); updatePosition(); runDiagnostics(); persist(); }
function persist() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeId: state.activeId, files: [...state.files.values()] })); } catch (_) {} }
function runDiagnostics() { if (!window.VSACDiagnostics) return; const file = state.files.get(state.activeId); if (!file) return; const items = window.VSACDiagnostics.validate({ uri: `workspace://${file.id}`, language: file.language, content: editor.value }); diagnosticsCount.textContent = `${items.length} problem${items.length === 1 ? '' : 's'}`; }
function openProblems() { const file = state.files.get(state.activeId); const items = window.VSACDiagnostics ? window.VSACDiagnostics.validate({ uri: `workspace://${file.id}`, language: file.language, content: editor.value }) : []; openPanel('Problems'); hideCommandArea(); previewBody.classList.remove('hidden'); previewBody.innerHTML = ''; if (!items.length) { previewBody.textContent = 'No problems detected.'; return; } for (const item of items) { const row = document.createElement('div'); row.className = 'problem-row'; row.textContent = `${item.severity.toUpperCase()} · ${item.line}:${item.column} · ${item.message}`; previewBody.appendChild(row); } }
function openDevTools() { openPanel('DevTools'); hideCommandArea(); previewBody.classList.remove('hidden'); previewBody.innerHTML = `<div class="devtools-actions"><button id="dt-clear">Clear</button><button id="dt-refresh">Refresh</button></div><pre id="dt-output" class="devtools-output">No preview session.</pre>`; const render = () => { const snap = window.VSACDevTools ? window.VSACDevTools.snapshot() : { logs: [], errors: [], network: [] }; document.querySelector('#dt-output').textContent = JSON.stringify(snap, null, 2); }; document.querySelector('#dt-clear').onclick = () => { window.VSACDevTools?.clear(); render(); }; document.querySelector('#dt-refresh').onclick = render; render(); }
function openLanguages() {
  openPanel('Languages');
  hideCommandArea();
  previewBody.classList.remove('hidden');
  const names = new Set(Object.values(window.VSACLanguages?.extensions || {}));
  ['Dockerfile', 'Makefile', 'CMake', 'Starlark', 'Plain Text'].forEach((name) => names.add(name));
  const sorted = [...names].sort((a, b) => a.localeCompare(b));
  previewBody.innerHTML = `<strong>${sorted.length} language/file families detected</strong><div class="result-row">${sorted.map(escapeHtml).join(' · ')}</div>`;
}
function openNative() { if (window.VSACNative?.openTextFile) window.VSACNative.openTextFile(); else showToast('Native file picker is unavailable in this build.'); }
function saveCurrent() { const file = state.files.get(state.activeId); if (!file) return; file.content = editor.value; if (window.VSACNative?.saveTextFile) window.VSACNative.saveTextFile(file.content, file.name); else { file.dirty = false; dirty.textContent = 'Saved locally'; renderTabs(); persist(); } }
function openFind() { openPanel('Find'); command.value = ''; command.placeholder = 'Search in current file…'; command.oninput = () => { const q = command.value; let count = 0; if (q) { try { count = (editor.value.match(new RegExp(escapeRegExp(q), 'g')) || []).length; } catch (_) {} } commandList.innerHTML = `<div class="result-row">${count} match${count === 1 ? '' : 'es'}</div>`; }; commandList.innerHTML = '<div class="result-row">Type to search this file.</div>'; previewBody.classList.add('hidden'); command.focus(); }
function previewHtml() { const file = state.files.get(state.activeId); if (!file || (!/html/i.test(file.language) && !/\.html?$/i.test(file.name))) { showTool('Preview', 'Open an HTML file to use the local preview panel.'); return; } openPanel('Preview'); hideCommandArea(); previewBody.classList.remove('hidden'); previewBody.innerHTML = ''; const frame = document.createElement('iframe'); frame.className = 'preview-frame'; frame.setAttribute('sandbox', 'allow-scripts allow-forms allow-modals'); const html = window.VSACDevTools ? window.VSACDevTools.instrumentHtml(file.content) : file.content; frame.src = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`; state.previewFrame = frame; previewBody.appendChild(frame); }
function openTerminal() { openPanel('Terminal'); command.placeholder = 'Enter a shell command…'; command.value = ''; commandList.innerHTML = ''; const note = document.createElement('div'); note.className = 'terminal-note'; note.textContent = 'Commands execute only through the native bridge and inherit the app UID boundary.'; commandList.appendChild(note); const run = document.createElement('button'); run.type = 'button'; run.textContent = 'Run command'; run.setAttribute('aria-label', 'Run command'); run.onclick = runTerminalCommand; commandList.appendChild(run); command.onkeydown = (event) => { if (event.key === 'Enter') runTerminalCommand(); }; previewBody.classList.add('hidden'); command.focus(); }
function runTerminalCommand() { const value = command.value.trim(); if (!value) return; commandList.insertAdjacentHTML('beforeend', `<div class="terminal-command">$ ${escapeHtml(value)}</div>`); command.value = ''; if (window.VSACNative?.runTerminal) window.VSACNative.runTerminal(value); else commandList.insertAdjacentHTML('beforeend', '<div class="terminal-error">Native terminal unavailable.</div>'); }
function openApiStudio() { openPanel('API Studio'); hideCommandArea(); previewBody.classList.remove('hidden'); previewBody.innerHTML = `<div class="api-form"><div class="api-row"><select id="api-method"><option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option><option>HEAD</option></select><input id="api-url" value="https://httpbin.org/get" placeholder="https://example.com/api"></div><textarea id="api-headers" placeholder="Headers, one per line"></textarea><textarea id="api-body" placeholder="Request body (optional)"></textarea><button id="api-send">Send request</button><pre id="api-result" class="api-result">Response will appear here.</pre></div>`; document.querySelector('#api-send').onclick = sendApiRequest; }
function sendApiRequest() { const method = document.querySelector('#api-method').value; const url = document.querySelector('#api-url').value.trim(); const headers = document.querySelector('#api-headers').value; const body = document.querySelector('#api-body').value; const result = document.querySelector('#api-result'); if (!/^https?:\/\//i.test(url)) { result.textContent = 'Only http:// and https:// URLs are allowed.'; return; } result.textContent = 'Sending…'; if (window.VSACNative?.httpRequest) window.VSACNative.httpRequest(method, url, headers, body); else result.textContent = 'Native API service unavailable.'; }
function hideCommandArea() { command.classList.add('hidden'); commandList.classList.add('hidden'); }
function showTool(title, message) { openPanel(title); hideCommandArea(); previewBody.classList.remove('hidden'); previewBody.textContent = message; }
function openPanel(title = 'Command Palette') { state.panelMode = title; panelTitle.textContent = title; panel.classList.remove('hidden'); command.classList.remove('hidden'); commandList.classList.remove('hidden'); previewBody.classList.add('hidden'); command.placeholder = 'Type a command…'; command.oninput = title === 'Command Palette' ? renderCommands : null; if (title === 'Command Palette') renderCommands(); else commandList.replaceChildren(); command.focus(); }
function closePanel() { panel.classList.add('hidden'); command.value = ''; command.oninput = null; state.panelMode = 'commands'; }
function renderCommands() { const query = command.value.trim().toLowerCase(); commandList.innerHTML = ''; for (const [label, action] of COMMANDS) { if (query && !label.toLowerCase().includes(query)) continue; const button = document.createElement('button'); button.type = 'button'; button.textContent = label; button.onclick = action; commandList.appendChild(button); } }
function showToast(message) { toast.textContent = message; toast.classList.remove('hidden'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.add('hidden'), 1800); }
function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function escapeHtml(value) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }

window.VSAC = {
  nativeOpenResult(name, content) {
    let id = name || 'untitled.txt'; const base = id; let n = 1;
    while (state.files.has(id)) id = `${base}.${n++}`;
    const lang = window.VSACLanguages?.detect(id) || 'Plain Text';
    addFile(id, lang, content || ''); activate(id); closePanel(); showToast(`Opened ${id}`);
  },
  nativeOpenError(message) { showToast(message || 'Open failed'); },
  nativeSaveResult(message, ok) { const file = state.files.get(state.activeId); if (ok && file) { file.dirty = false; dirty.textContent = 'Saved'; renderTabs(); persist(); } showToast(message || (ok ? 'Saved' : 'Save failed')); },
  nativeTerminalResult(exitCode, output) { commandList.insertAdjacentHTML('beforeend', `<pre class="terminal-output">${escapeHtml(output || '(no output)')}</pre><div class="terminal-exit">exit ${exitCode}</div>`); },
  nativeTerminalError(message) { commandList.insertAdjacentHTML('beforeend', `<div class="terminal-error">${escapeHtml(message || 'Terminal failed')}</div>`); },
  nativeApiResult(status, headers, body, redirect) { const result = document.querySelector('#api-result'); if (result) result.textContent = [`HTTP ${status}`, redirect ? `Redirect: ${redirect}` : '', headers || '', body || ''].filter(Boolean).join('\n'); },
  nativeApiError(message) { const result = document.querySelector('#api-result'); if (result) result.textContent = `ERROR: ${message || 'API request failed'}`; }
};

editor.addEventListener('input', markDirty);
editor.addEventListener('change', persist);
editor.addEventListener('click', updatePosition); editor.addEventListener('keyup', updatePosition); editor.addEventListener('select', updatePosition);
editor.addEventListener('scroll', () => { gutter.scrollTop = editor.scrollTop; });
editor.addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); saveCurrent(); } if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') { event.preventDefault(); openPanel(); } if (event.key === 'Tab') { event.preventDefault(); editor.setRangeText('  ', editor.selectionStart, editor.selectionEnd, 'end'); markDirty(); } if (event.key === 'Escape') closePanel(); });
panelClose.addEventListener('click', closePanel);
window.addEventListener('pagehide', persist);
window.addEventListener('beforeunload', persist);
document.querySelector('#project')?.addEventListener('click', () => window.VSACNative?.openWorkspace ? window.VSACNative.openWorkspace() : showToast('Workspace picker unavailable.'));
document.querySelector('#save')?.addEventListener('click', saveCurrent);
document.querySelector('#run')?.addEventListener('click', previewHtml);
document.querySelector('#more')?.addEventListener('click', openPanel);
document.querySelector('#menu')?.addEventListener('click', openPanel);
seed();
