(() => {
  'use strict';

  const STORAGE_KEY = 'vsac.project.workspace.v1';
  const state = {
    treeUri: localStorage.getItem(STORAGE_KEY) || '',
    rootName: localStorage.getItem(STORAGE_KEY + '.name') || 'No workspace',
    expanded: new Set(),
    pendingReadUri: '',
    currentFileUri: localStorage.getItem(STORAGE_KEY + '.file') || '',
  };

  function nodes() {
    const body = document.querySelector('#preview-body');
    if (!body) throw new Error('Project panel body is unavailable');
    return body;
  }

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  }

  function fileLanguage(name) {
    const ext = (name.includes('.') ? name.split('.').pop() : '').toLowerCase();
    return ({
      js:'JavaScript',mjs:'JavaScript',cjs:'JavaScript',jsx:'JavaScript',
      ts:'TypeScript',tsx:'TypeScript',html:'HTML',htm:'HTML',css:'CSS',scss:'SCSS',less:'LESS',
      json:'JSON',xml:'XML',svg:'SVG',md:'Markdown',markdown:'Markdown',txt:'Plain Text',csv:'CSV',
      yaml:'YAML',yml:'YAML',toml:'TOML',py:'Python',java:'Java',kt:'Kotlin',kts:'Kotlin',go:'Go',
      rs:'Rust',c:'C',h:'C/C++',cc:'C++',cpp:'C++',hpp:'C++',cs:'C#',dart:'Dart',php:'PHP',rb:'Ruby',
      lua:'Lua',sh:'Shell',bash:'Shell',zsh:'Shell',fish:'Shell',sql:'SQL',tf:'Terraform',gradle:'Gradle',
      properties:'Properties',ini:'INI',conf:'Config',env:'Env'
    })[ext] || (/^(dockerfile|makefile|\.gitignore)$/i.test(name) ? 'Plain Text' : 'Plain Text');
  }

  function saveBinding(uri) {
    state.currentFileUri = uri || '';
    if (state.currentFileUri) localStorage.setItem(STORAGE_KEY + '.file', state.currentFileUri);
    else localStorage.removeItem(STORAGE_KEY + '.file');
  }

  function clearWorkspaceState() {
    state.treeUri = '';
    state.rootName = 'No workspace';
    state.expanded.clear();
    saveBinding('');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY + '.name');
  }

  function openPanel(title) {
    const panel = document.querySelector('#panel');
    const titleEl = document.querySelector('#panel-title');
    const input = document.querySelector('#command');
    const list = document.querySelector('#command-list');
    const body = nodes();
    titleEl.textContent = title;
    panel.classList.remove('hidden');
    input.classList.add('hidden');
    list.classList.add('hidden');
    body.classList.remove('hidden');
  }

  function normalizeEntries(raw) {
    if (!raw) return [];
    try {
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (_) {
      return [];
    }
  }

  function list(parentUri) {
    if (!state.treeUri || !window.VSACNative?.workspaceList) return [];
    return normalizeEntries(window.VSACNative.workspaceList(parentUri || ''));
  }

  function renderFolder(parentUri, title, depth) {
    const body = nodes();
    const entries = list(parentUri);
    if (!entries.length) {
      body.insertAdjacentHTML('beforeend', `<div class="project-empty" style="padding-left:${12 + depth * 16}px">Empty folder</div>`);
      return;
    }
    for (const entry of entries) {
      const pad = 12 + depth * 16;
      const row = document.createElement('button');
      row.className = 'project-row';
      row.style.paddingLeft = `${pad}px`;
      row.dataset.uri = entry.uri;
      row.dataset.directory = entry.directory ? '1' : '0';
      row.innerHTML = `<span class="project-icon">${entry.directory ? '▸' : '•'}</span><span class="project-name">${escapeHtml(entry.name)}</span>`;
      row.title = entry.name;
      if (entry.directory) {
        row.onclick = () => {
          const key = entry.uri;
          if (state.expanded.has(key)) state.expanded.delete(key); else state.expanded.add(key);
          drawTree(parentUri, title);
        };
      } else {
        row.onclick = () => readFile(entry);
      }
      body.appendChild(row);
      if (entry.directory && state.expanded.has(entry.uri)) renderFolder(entry.uri, title, depth + 1);
    }
  }

  function drawTree(parentUri, title) {
    const body = nodes();
    body.innerHTML = `<div class="project-toolbar"><button id="project-refresh">Refresh</button><button id="project-root">Change folder</button></div>`;
    body.insertAdjacentHTML('beforeend', `<div class="project-root-label">${escapeHtml(title)}</div>`);
    renderFolder(parentUri || '', title, 0);
    body.querySelector('#project-refresh').onclick = () => drawTree(parentUri, title);
    body.querySelector('#project-root').onclick = openWorkspace;
  }

  function openWorkspace() {
    if (window.VSACNative?.openWorkspace) window.VSACNative.openWorkspace();
    else window.VSAC?.nativeOpenError?.('Native workspace picker is unavailable in this build.');
  }

  function readFile(entry) {
    state.pendingReadUri = entry.uri;
    if (window.VSACNative?.workspaceRead) {
      window.VSACNative.workspaceRead(entry.uri, entry.name, entry.mime || '');
    } else {
      window.VSAC?.nativeOpenError?.('Workspace file service is unavailable.');
    }
  }

  function open() {
    openPanel('Project Explorer');
    if (!window.VSACNative?.hasWorkspace || !window.VSACNative.hasWorkspace()) {
      if (state.treeUri) clearWorkspaceState();
    }
    if (!state.treeUri) {
      nodes().innerHTML = `<div class="project-empty">No project folder selected.</div><button id="project-open" class="project-action">Open project folder</button>`;
      nodes().querySelector('#project-open').onclick = openWorkspace;
      return;
    }
    drawTree('', state.rootName);
  }

  window.VSACProject = Object.freeze({ open, openWorkspace, getCurrentUri: () => state.currentFileUri, clearCurrentUri: () => saveBinding('') });

  document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('#project');
    if (button) button.addEventListener('click', open);
  });

  const waitForVSAC = () => {
    if (!window.VSAC) { setTimeout(waitForVSAC, 25); return; }
    const originalOpen = window.VSAC.nativeOpenResult;
    window.VSAC.nativeOpenResult = (name, content) => {
      const pending = state.pendingReadUri;
      state.pendingReadUri = '';
      saveBinding(pending || '');
      return originalOpen(name, content);
    };

    window.VSAC.workspaceOpened = (uri, name) => {
      state.treeUri = uri || '';
      state.rootName = name || 'Workspace';
      state.expanded.clear();
      localStorage.setItem(STORAGE_KEY, state.treeUri);
      localStorage.setItem(STORAGE_KEY + '.name', state.rootName);
      saveBinding('');
      open();
    };

    window.VSAC.workspaceError = (message) => {
      if (typeof window.showToast === 'function') window.showToast(message || 'Workspace operation failed');
      else window.VSAC.nativeOpenError?.(message || 'Workspace operation failed');
    };

    window.VSAC.workspaceReadResult = (uri, name, mime, content) => {
      state.pendingReadUri = uri || '';
      window.VSAC.nativeOpenResult(name || 'untitled.txt', content || '');
      drawTree('', state.rootName);
    };

    window.VSAC.workspaceWriteResult = (uri, ok, message) => {
      if (ok) {
        window.VSAC.nativeSaveResult(message || 'Saved', true);
        if (uri) saveBinding(uri);
      } else {
        window.VSAC.nativeSaveResult(message || 'Save failed', false);
      }
    };

    document.addEventListener('click', (event) => {
      const target = event.target.closest('button');
      if (!target) return;
      const text = (target.textContent || '').trim();
      if (text === 'New File' || target.id === 'save') {
        if (text === 'New File') saveBinding('');
      }
    }, true);

    const saveButton = document.querySelector('#save');
    if (saveButton) {
      saveButton.addEventListener('click', (event) => {
        if (!state.currentFileUri || !window.VSACNative?.workspaceWrite) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const activeTab = document.querySelector('#tabs .tab.active');
        const text = window.VSAC?.editorValue?.() || '';
        const fallback = activeTab ? activeTab.textContent.replace(/\s•$/, '') : '';
        const editor = document.querySelector('#editor');
        window.VSACNative.workspaceWrite(state.currentFileUri, editor ? editor.value : text);
      }, true);
    }
  };
  waitForVSAC();
})();
