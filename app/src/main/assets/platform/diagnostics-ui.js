(() => {
  'use strict';

  function diagnosticsForActiveDocument() {
    const editor = document.querySelector('#editor');
    if (!editor || !window.VSACDiagnostics) return [];
    const language = document.querySelector('#language')?.textContent || 'Plain Text';
    return window.VSACDiagnostics.validate({
      uri: `vsac://${language.toLowerCase()}/active`,
      language,
      content: editor.value
    });
  }

  function refreshCount() {
    const counter = document.querySelector('#diagnostics-count');
    if (!counter) return;
    const diagnostics = diagnosticsForActiveDocument();
    counter.textContent = `${diagnostics.length} problem${diagnostics.length === 1 ? '' : 's'}`;
  }

  function renderProblems() {
    const list = document.querySelector('#command-list');
    const command = document.querySelector('#command');
    const panelTitle = document.querySelector('#panel-title');
    const panel = document.querySelector('#panel');
    const body = document.querySelector('#preview-body');
    const editor = document.querySelector('#editor');
    if (!list || !command || !panelTitle || !panel || !editor) return;

    panel.classList.remove('hidden');
    panelTitle.textContent = 'Problems';
    command.classList.add('hidden');
    list.classList.remove('hidden');
    if (body) body.classList.add('hidden');
    list.innerHTML = '';

    const diagnostics = diagnosticsForActiveDocument();
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
      row.textContent = `${item.line}:${item.column} — ${item.message}`;
      row.onclick = () => {
        const lines = editor.value.split('\n');
        let offset = 0;
        const lineIndex = Math.max(0, item.line - 1);
        for (let i = 0; i < lineIndex; i++) offset += lines[i].length + 1;
        const column = Math.max(0, item.column - 1);
        editor.focus();
        editor.setSelectionRange(offset + column, offset + column + 1);
        panel.classList.add('hidden');
      };
      list.appendChild(row);
    }
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
          const command = document.querySelector('#command');
          const body = document.querySelector('#preview-body');
          if (!panel || !title || !command || !body) return;
          panel.classList.remove('hidden');
          title.textContent = 'DevTools';
          command.classList.add('hidden');
          list.classList.add('hidden');
          body.classList.remove('hidden');
          const snap = window.VSACDevTools ? window.VSACDevTools.snapshot() : { logs: [], errors: [], network: [] };
          body.textContent = [
            `Console events: ${snap.logs.length}`,
            `Runtime errors: ${snap.errors.length}`,
            `Network events: ${snap.network ? snap.network.length : 0}`,
            '',
            ...(snap.errors.length ? snap.errors.map(e => `ERROR: ${e.message}`) : ['No captured preview errors.'])
          ].join('\n');
        };
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  document.querySelector('#editor')?.addEventListener('input', refreshCount);
  refreshCount();
})();
