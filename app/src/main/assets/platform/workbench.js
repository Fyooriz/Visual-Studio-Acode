(() => {
  'use strict';

  const STORAGE_KEY = 'vsac.workspace.v3';
  const PREF_KEY = 'vsac.preferences.v1';
  let drawer;
  let body;

  function esc(value) {
    const div = document.createElement('div');
    div.textContent = String(value ?? '');
    return div.innerHTML;
  }

  function readWorkspace() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return Array.isArray(data.files) ? data.files : [];
    } catch (_) {
      return [];
    }
  }

  function readPrefs() {
    try { return JSON.parse(localStorage.getItem(PREF_KEY) || '{}'); } catch (_) { return {}; }
  }

  function savePrefs(prefs) {
    try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (_) {}
  }

  function activeTab(name) {
    const tabs = [...document.querySelectorAll('#tabs .tab')];
    const normalized = String(name || '').replace(/\s+•$/, '');
    return tabs.find((tab) => tab.textContent.replace(/\s+•$/, '') === normalized);
  }

  function openFile(name) {
    const tab = activeTab(name);
    if (tab) {
      tab.click();
      close();
      return true;
    }
    return false;
  }

  function tool(label) {
    const map = {
      Preview: '#run',
      Terminal: null,
      'API Studio': null,
      Problems: null,
      DevTools: null,
      'Command Palette': '#more'
    };
    if (label === 'Terminal') {
      [...document.querySelectorAll('#command-list button')].find((b) => b.textContent === 'Terminal')?.click();
      if (!document.querySelector('#panel:not(.hidden)')) document.querySelector('#menu')?.click();
      return;
    }
    if (['API Studio', 'Problems', 'DevTools'].includes(label)) {
      document.querySelector('#menu')?.click();
      requestAnimationFrame(() => [...document.querySelectorAll('#command-list button')].find((b) => b.textContent === label)?.click());
      return;
    }
    const selector = map[label];
    if (selector) document.querySelector(selector)?.click();
  }

  function renderExplorer() {
    const files = readWorkspace();
    if (!files.length) {
      body.innerHTML = '<div class="wb-empty">Workspace is empty.</div>';
      return;
    }
    body.innerHTML = files.map((file) => `
      <button class="wb-file" data-file="${esc(file.name || file.id)}">
        <span>${esc(file.name || file.id)}</span>
        <small>${esc(file.language || 'Plain Text')}${file.dirty ? ' · modified' : ''}</small>
      </button>`).join('');
    body.querySelectorAll('.wb-file').forEach((button) => {
      button.addEventListener('click', () => openFile(button.dataset.file));
    });
  }

  function renderSearch(query = '') {
    const files = readWorkspace();
    const q = query.trim().toLowerCase();
    if (!q) {
      body.innerHTML = '<div class="wb-empty">Search across all open workspace files.</div>';
      return;
    }
    const results = [];
    for (const file of files) {
      const lines = String(file.content || '').split(/\r?\n/);
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(q)) results.push({ name: file.name || file.id, line: index + 1, text: line.trim() });
      });
    }
    body.innerHTML = results.length
      ? results.slice(0, 200).map((r) => `<button class="wb-result" data-file="${esc(r.name)}"><strong>${esc(r.name)}:${r.line}</strong><span>${esc(r.text || '(empty)')}</span></button>`).join('')
      : '<div class="wb-empty">No matches.</div>';
    body.querySelectorAll('.wb-result').forEach((button) => button.addEventListener('click', () => openFile(button.dataset.file)));
  }

  function renderTools() {
    body.innerHTML = `
      <div class="wb-section-title">Integrated mobile tools</div>
      <div class="wb-grid">
        <button data-tool="Command Palette">⌘<span>Commands</span></button>
        <button data-tool="Preview">▶<span>Preview</span></button>
        <button data-tool="Terminal">$<span>Terminal</span></button>
        <button data-tool="API Studio">⇄<span>API Studio</span></button>
        <button data-tool="Problems">✓<span>Problems</span></button>
        <button data-tool="DevTools">◈<span>DevTools</span></button>
      </div>
      <div class="wb-section-title">Editor preferences</div>
      <label class="wb-pref"><span>Tab width</span><input id="wb-tab" type="number" min="1" max="8" inputmode="numeric"></label>
      <label class="wb-pref"><span>Word wrap</span><input id="wb-wrap" type="checkbox"></label>`;
    const prefs = readPrefs();
    const tab = document.querySelector('#wb-tab');
    const wrap = document.querySelector('#wb-wrap');
    tab.value = Number.isFinite(prefs.tabSize) ? prefs.tabSize : 2;
    wrap.checked = prefs.wrap === true;
    tab.addEventListener('change', () => {
      const size = Math.max(1, Math.min(8, Number(tab.value) || 2));
      tab.value = size;
      const next = { ...readPrefs(), tabSize: size };
      savePrefs(next);
      document.documentElement.style.setProperty('--vsac-tab-size', String(size));
    });
    wrap.addEventListener('change', () => {
      const next = { ...readPrefs(), wrap: wrap.checked };
      savePrefs(next);
      document.documentElement.style.setProperty('--vsac-wrap', wrap.checked ? 'pre-wrap' : 'pre');
    });
    body.querySelectorAll('[data-tool]').forEach((button) => button.addEventListener('click', () => { tool(button.dataset.tool); close(); }));
  }

  function ensureDrawer() {
    if (drawer) return;
    drawer = document.createElement('section');
    drawer.id = 'workbench-drawer';
    drawer.className = 'wb-drawer hidden';
    drawer.innerHTML = `
      <div class="wb-head"><strong>Workbench</strong><button id="wb-close" aria-label="Close workbench">×</button></div>
      <div class="wb-nav">
        <button data-view="explorer" class="active">Explorer</button>
        <button data-view="search">Search</button>
        <button data-view="tools">Tools</button>
      </div>
      <input id="wb-query" class="wb-query" placeholder="Search workspace…" autocomplete="off">
      <div id="wb-body" class="wb-body"></div>`;
    document.body.appendChild(drawer);
    body = drawer.querySelector('#wb-body');
    drawer.querySelector('#wb-close').addEventListener('click', close);
    drawer.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => {
      drawer.querySelectorAll('[data-view]').forEach((b) => b.classList.toggle('active', b === button));
      const view = button.dataset.view;
      const query = drawer.querySelector('#wb-query');
      query.classList.toggle('hidden', view !== 'search');
      query.value = '';
      if (view === 'explorer') renderExplorer();
      if (view === 'search') renderSearch('');
      if (view === 'tools') renderTools();
    }));
    drawer.querySelector('#wb-query').addEventListener('input', (event) => renderSearch(event.target.value));
  }

  function open() {
    ensureDrawer();
    drawer.classList.remove('hidden');
    drawer.querySelector('[data-view="explorer"]').click();
  }

  function close() {
    if (drawer) drawer.classList.add('hidden');
  }

  function injectLauncher() {
    const topbar = document.querySelector('.topbar');
    if (!topbar || document.querySelector('#workbench-launcher')) return;
    const button = document.createElement('button');
    button.id = 'workbench-launcher';
    button.className = 'icon';
    button.setAttribute('aria-label', 'Open Workbench');
    button.title = 'Workbench';
    button.textContent = '▦';
    button.addEventListener('click', open);
    const save = document.querySelector('#save');
    topbar.insertBefore(button, save || null);
  }

  function applyPrefs() {
    const prefs = readPrefs();
    document.documentElement.style.setProperty('--vsac-tab-size', String(Number(prefs.tabSize) || 2));
    document.documentElement.style.setProperty('--vsac-wrap', prefs.wrap === true ? 'pre-wrap' : 'pre');
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectLauncher();
    applyPrefs();
  });

  window.VSACWorkbench = Object.freeze({ open, close, refresh: renderExplorer });
})();
