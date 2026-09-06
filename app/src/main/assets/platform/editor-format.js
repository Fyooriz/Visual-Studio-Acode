(() => {
  'use strict';

  const editor = document.querySelector('#editor');
  if (!editor) return;

  const languageName = () => document.querySelector('#language')?.textContent || '';
  const fileName = () => document.querySelector('#tabs .tab.active')?.textContent.replace(/\s+•$/, '') || '';

  function supportsJson() {
    return /json/i.test(languageName()) || /\.json$/i.test(fileName());
  }

  function formatJson() {
    if (!supportsJson()) return { ok: false, message: 'Built-in formatter currently supports JSON.' };
    const source = editor.value;
    if (!source.trim()) return { ok: true, changed: false, message: 'Document is empty.' };
    try {
      const parsed = JSON.parse(source);
      const formatted = JSON.stringify(parsed, null, 2) + '\n';
      if (formatted === source) return { ok: true, changed: false, message: 'Already formatted.' };
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.value = formatted;
      editor.setSelectionRange(Math.min(start, formatted.length), Math.min(end, formatted.length));
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      return { ok: true, changed: true, message: 'JSON formatted.' };
    } catch (error) {
      return { ok: false, message: `Invalid JSON: ${error.message}` };
    }
  }

  function showResult(result) {
    const toast = document.querySelector('#toast');
    if (!toast) return;
    toast.textContent = result.message;
    toast.classList.remove('hidden');
    clearTimeout(showResult.timer);
    showResult.timer = setTimeout(() => toast.classList.add('hidden'), 2200);
  }

  function formatDocument() {
    const result = formatJson();
    showResult(result);
    return result;
  }

  function installMobileAction() {
    const runButton = document.querySelector('#run');
    if (!runButton || document.querySelector('#format-editor-action')) return;
    const button = document.createElement('button');
    button.id = 'format-editor-action';
    button.className = 'icon';
    button.type = 'button';
    button.setAttribute('aria-label', 'Format document');
    button.title = 'Format document';
    button.textContent = '≡';
    button.addEventListener('click', formatDocument);
    runButton.parentNode?.insertBefore(button, runButton);
  }

  editor.addEventListener('keydown', (event) => {
    if (event.altKey && event.shiftKey && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      event.stopImmediatePropagation();
      formatDocument();
    }
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'i') {
      event.preventDefault();
      event.stopImmediatePropagation();
      formatDocument();
    }
  }, true);

  window.VSACFormatter = Object.freeze({
    version: '0.1.0',
    supports: supportsJson,
    formatDocument,
    formatJson,
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installMobileAction);
  else installMobileAction();
})();
