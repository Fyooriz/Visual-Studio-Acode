(() => {
  'use strict';

  // Transitional compatibility owner: normalize toolbar handlers that pass DOM events
  // into app.js panel functions, and recover persisted editor state after reload.
  const replaceHandler = (id) => {
    const current = document.querySelector(`#${id}`);
    if (!current || typeof window.openPanel !== 'function') return;
    const replacement = current.cloneNode(true);
    current.replaceWith(replacement);
    replacement.addEventListener('click', () => window.openPanel());
  };

  replaceHandler('more');
  replaceHandler('menu');

  const hydrate = () => {
    const editor = document.querySelector('#editor');
    if (!editor || editor.value) return;
    try {
      const raw = localStorage.getItem('vsac.workspace.v3');
      if (!raw) return;
      const data = JSON.parse(raw);
      const activeId = data.activeId;
      const files = Array.isArray(data.files) ? data.files : [];
      const active = files.find((file) => file && file.id === activeId);
      if (!active || typeof active.content !== 'string') return;
      editor.value = active.content;
      const language = document.querySelector('#language');
      const dirty = document.querySelector('#dirty');
      if (language && active.language) language.textContent = active.language;
      if (dirty) dirty.textContent = active.dirty ? 'Modified' : 'Saved';
      editor.dispatchEvent(new Event('change', { bubbles: true }));
      editor.focus({ preventScroll: true });
      editor.setSelectionRange(0, 0);
      window.dispatchEvent(new Event('vsac:persisted-state-restored'));
    } catch (_) {
      // Corrupt local editor state must not prevent the shell from loading.
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrate, { once: true });
  } else {
    hydrate();
  }
})();
