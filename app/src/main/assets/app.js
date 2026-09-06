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

const STORAGE_KEY = 'vsac.workspace.v1';
const state = {
  activeId: 'main.js',
  files: new Map(),
  panelMode: 'commands'
};

const COMMANDS = [
  ['New File', () => createUntitled()],
  ['Open File', () => openNative()],
  ['Save File', () => saveCurrent()],
  ['Find in File', () => openFind()],
  ['Preview HTML', () => previewHtml()],
  ['Terminal', () => showTool('Terminal', 'Terminal backend is reserved for the native execution engine.')],
  ['Problems', () => showTool('Problems', 'Diagnostics will be populated by the unified LSP/linter engine.')],
  ['DevTools', () => showTool('DevTools', 'Suger-derived DevTools capability is isolated behind an internal adapter.')],
  ['AI Assistant', () => showTool('AI Assistant', 'AI provider adapters are not enabled in the offline foundation build.')]
];

function seed() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      for (const file of data.files || []) state.files.set(file.id, file);
      state.activeId = data.activeId || state.activeId;
    } catch (_) {}
  }
  if (!state.files.size) {
    addFile('main.js', 'JavaScript', `function hello() {\n  return "Visual Studio Acode";\n}\n\nconsole.log(hello());\n`);
    addFile('README.md', 'Markdown', '# Visual Studio Acode\n\nMobile-first code editor foundation.\n');
    addFile('index.html', 'HTML', '<!doctype html>\n<html>\n  <body>\n    <h1>Visual Studio Acode</h1>\n  </body>\n</html>\n');
  }
  activate(state.activeId);
}

function addFile(id, lang, content) {
  state.files.set(id, { id, name: id, language: lang, content, dirty: false });
}

function createUntitled() {
  let n = 1;
  while (state.files.has(`untitled-${n}.txt`)) n++;
  const id = `untitled-${n}.txt`;
  addFile(id, 'Plain Text', '');
  activate(id);
  closePanel();
  persist();
}

function activate(id) {
  if (!state.files.has(id)) return;
  const current = state.files.get(state.activeId);
  if (current) current.content = editor.value;
  state.activeId = id;
  const file = state.files.get(id);
  editor.value = file.content;
  workspace.textContent = 'Local workspace';
  language.textContent = file.language;
  dirty.textContent = file.dirty ? 'Modified' : 'Saved';
  renderTabs();
  sync();
}

function renderTabs() {
  tabs.innerHTML = '';
  for (const file of state.files.values()) {
    const el = document.createElement('button');
    el.className = `tab${file.id === state.activeId ? ' active' : ''}`;
    el.textContent = `${file.name}${file.dirty ? ' •' : ''}`;
    el.title = file.name;
    el.onclick = () => activate(file.id);
    tabs.appendChild(el);
  }
  const add = document.createElement('button');
  add.className = 'tab add-tab';
  add.textContent = '+';
  add.title = 'New file';
  add.onclick = createUntitled;
  tabs.appendChild(add);
}

function renderGutter() {
  const lines = editor.value.split('\n').length;
  gutter.textContent = Array.from({ length: Math.max(1, lines) }, (_, i) => i + 1).join('\n');
  gutter.scrollTop = editor.scrollTop;
}

function updatePosition() {
  const before = editor.value.slice(0, editor.selectionStart);
  const line = before.split('\n').length;
  const lastBreak = before.lastIndexOf('\n');
  const col = before.length - lastBreak;
  position.textContent = `Ln ${line}, Col ${col}`;
}

function sync() {
  const file = state.files.get(state.activeId);
  if (file) {
    file.content = editor.value;
    if (!file.dirty) dirty.textContent = 'Saved';
  }
  renderGutter();
  updatePosition();
  persist();
}

function markDirty() {
  const file = state.files.get(state.activeId);
  if (!file) return;
  file.content = editor.value;
  file.dirty = true;
  dirty.textContent = 'Modified';
  renderTabs();
  renderGutter();
  updatePosition();
  persist();
}

function persist() {
  const payload = { activeId: state.activeId, files: [...state.files.values()] };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch (_) {}
}

function openNative() {
  if (window.VSACNative && typeof window.VSACNative.openTextFile === 'function') {
    window.VSACNative.openTextFile();
  } else {
    showToast('Native file picker is unavailable in this build.');
  }
}

function saveCurrent() {
  const file = state.files.get(state.activeId);
  if (!file) return;
  file.content = editor.value;
  if (window.VSACNative && typeof window.VSACNative.saveTextFile === 'function') {
    window.VSACNative.saveTextFile(file.content, file.name);
  } else {
    file.dirty = false;
    dirty.textContent = 'Saved locally';
    renderTabs();
    persist();
    showToast('Saved to local workspace.');
  }
}

function openFind() {
  openPanel('Find');
  command.value = '';
  command.placeholder = 'Search in current file…';
  command.oninput = () => {
    const q = command.value;
    const count = q ? (editor.value.match(new RegExp(escapeRegExp(q), 'g')) || []).length : 0;
    commandList.innerHTML = `<div class="result-row">${count} match${count === 1 ? '' : 'es'}</div>`;
  };
  commandList.innerHTML = '<div class="result-row">Type to search this file.</div>';
  command.focus();
}

function previewHtml() {
  const file = state.files.get(state.activeId);
  if (!file || !/html/i.test(file.language) && !/\.html?$/i.test(file.name)) {
    showTool('Preview', 'Open an HTML file to use the local preview panel.');
    return;
  }
  openPanel('Preview');
  command.classList.add('hidden');
  commandList.classList.add('hidden');
  previewBody.classList.remove('hidden');
  previewBody.innerHTML = '';
  const frame = document.createElement('iframe');
  frame.className = 'preview-frame';
  frame.setAttribute('sandbox', 'allow-scripts allow-forms allow-modals');
  frame.srcdoc = file.content;
  previewBody.appendChild(frame);
}

function showTool(title, message) {
  openPanel(title);
  command.classList.add('hidden');
  commandList.classList.add('hidden');
  previewBody.classList.remove('hidden');
  previewBody.textContent = message;
}

function openPanel(title = 'Command Palette') {
  state.panelMode = title;
  panelTitle.textContent = title;
  panel.classList.remove('hidden');
  command.classList.remove('hidden');
  commandList.classList.remove('hidden');
  previewBody.classList.add('hidden');
  command.placeholder = 'Type a command…';
  command.oninput = renderCommands;
  renderCommands();
  command.focus();
}

function closePanel() {
  panel.classList.add('hidden');
  command.value = '';
  command.oninput = null;
  state.panelMode = 'commands';
}

function renderCommands() {
  const query = command.value.trim().toLowerCase();
  commandList.innerHTML = '';
  for (const [label, action] of COMMANDS) {
    if (query && !label.toLowerCase().includes(query)) continue;
    const button = document.createElement('button');
    button.textContent = label;
    button.onclick = action;
    commandList.appendChild(button);
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.add('hidden'), 1800);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

window.VSAC = {
  nativeOpenResult(name, content) {
    let id = name || 'untitled.txt';
    let base = id;
    let n = 1;
    while (state.files.has(id)) id = `${base}.${n++}`;
    const ext = id.includes('.') ? id.split('.').pop().toLowerCase() : '';
    const lang = ({ js: 'JavaScript', ts: 'TypeScript', html: 'HTML', htm: 'HTML', css: 'CSS', json: 'JSON', md: 'Markdown', py: 'Python', java: 'Java', kt: 'Kotlin', go: 'Go', rs: 'Rust', php: 'PHP', c: 'C', cpp: 'C++', h: 'C/C++' })[ext] || 'Plain Text';
    addFile(id, lang, content || '');
    activate(id);
    closePanel();
    showToast(`Opened ${id}`);
    persist();
  },
  nativeOpenError(message) { showToast(message || 'Open failed'); },
  nativeSaveResult(message, ok) {
    const file = state.files.get(state.activeId);
    if (ok && file) {
      file.dirty = false;
      dirty.textContent = 'Saved';
      renderTabs();
      persist();
    }
    showToast(message || (ok ? 'Saved' : 'Save failed'));
  }
};

editor.addEventListener('input', markDirty);
editor.addEventListener('click', updatePosition);
editor.addEventListener('keyup', updatePosition);
editor.addEventListener('select', updatePosition);
editor.addEventListener('scroll', () => { gutter.scrollTop = editor.scrollTop; });

// Practical mobile editor shortcuts.
editor.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault();
    saveCurrent();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
    event.preventDefault();
    openPanel();
  }
  if (event.key === 'Tab') {
    event.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.setRangeText('  ', start, end, 'end');
    markDirty();
  }
  if (event.key === 'Escape') closePanel();
});

document.querySelector('#menu').onclick = () => openPanel();
document.querySelector('#more').onclick = () => openPanel();
document.querySelector('#save').onclick = saveCurrent;
document.querySelector('#run').onclick = previewHtml;
panelClose.onclick = closePanel;

seed();
