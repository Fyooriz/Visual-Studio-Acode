(() => {
  'use strict';

  function renderProblems() {
    const list = document.querySelector('#command-list');
    const command = document.querySelector('#command');
    const panelTitle = document.querySelector('#panel-title');
    const panel = document.querySelector('#panel');
    const editor = document.querySelector('#editor');
    if (!list || !editor) return;

    panel.classList.remove('hidden');
    panelTitle.textContent = 'Problems';
    command.classList.add('hidden');
    list.classList.remove('hidden');
    const body = document.querySelector('#preview-body');
    if (body) body.classList.add('hidden');
    list.innerHTML = '';

    const file = window.VSAC && window.VSAC.currentFile ? window.VSAC.currentFile() : null;
    const diagnostics = window.VSACDiagnostics ? window.VSACDiagnostics.lint({
      uri: file ? file.name : 'active.txt',
      languageId: file ? file.language : 'Plain Text',
      text: editor.value
    }) : [];

    if (!diagnostics.length) {
      const ok = document.createElement('div');
      ok.className = 'result-row success';
      ok.textContent = 'No problems detected.';
      list.appendChild(ok);
      return;
    }

    for (const item of diagnostics) {
      const row = document.createElement('button');
      row.className = 'problem-row';
      row.textContent = `${item.range.start.line + 1}:${item.range.start.character + 1} — ${item.message}`;
      row.onclick = () => {
        const lines = editor.value.split('\n');
        let offset = 0;
        for (let i = 0; i < item.range.start.line; i++) offset += lines[i].length + 1;
        editor.focus();
        editor.setSelectionRange(offset + item.range.start.character, offset + item.range.start.character + 1);
        panel.classList.add('hidden');
      };
      list.appendChild(row);
    }
  }

  function refreshCount() {
    const editor = document.querySelector('#editor');
    const counter = document.querySelector('#diagnostics-count');
    if (!editor || !counter || !window.VSACDiagnostics) return;
    const result = window.VSACDiagnostics.lint({ uri: 'active', languageId: document.querySelector('#language')?.textContent || '', text: editor.value });
    counter.textContent = `${result.length} problem${result.length === 1 ? '' : 's'}`;
  }

  const observer = new MutationObserver(() => {
    const list = document.querySelector('#command-list');
    if (!list) return;
    for (const button of list.querySelectorAll('button')) {
      const text = button.textContent.trim();
      if (text === 'Problems' && !button.dataset.vsacBound) {
        button.dataset.vsacBound = '1';
        button.onclick = renderProblems;
      }
      if (text === 'DevTools' && !button.dataset.vsacBound) {
        button.dataset.vsacBound = '1';
        button.onclick = () => {
          const panel = document.querySelector('#panel');
          const title = document.querySelector('#panel-title');
          const body = document.querySelector('#preview-body');
          if (!panel || !title || !body) return;
          panel.classList.remove('hidden'); title.textContent = 'DevTools';
          document.querySelector('#command')?.classList.add('hidden');
          list.classList.add('hidden'); body.classList.remove('hidden');
          const snap = window.VSACDevTools ? window.VSACDevTools.snapshot() : { logs: [], errors: [] };
          body.textContent = [`Console events: ${snap.logs.length}`, `Runtime errors: ${snap.errors.length}`, '', ...(snap.errors.length ? snap.errors.map(e => `ERROR: ${e.message}`) : ['No captured preview errors.'])].join('\n');
        };
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  document.querySelector('#editor')?.addEventListener('input', refreshCount);
  refreshCount();
})();
