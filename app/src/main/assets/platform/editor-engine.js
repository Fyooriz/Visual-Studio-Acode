(() => {
  'use strict';

  const BRACKETS = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
  const CLOSE = new Set(Object.values(BRACKETS));

  function isQuote(ch) {
    return ch === '"' || ch === "'" || ch === '`';
  }

  function getIndent(text, row) {
    const lines = text.split('\n');
    return (lines[row] || '').match(/^\s*/)?.[0] || '';
  }

  function smartTab(textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const selected = value.slice(start, end);
    const indent = '  ';
    if (selected.includes('\n')) {
      const next = selected.split('\n').map((line) => indent + line).join('\n');
      textarea.setRangeText(next, start, end, 'select');
      return true;
    }
    textarea.setRangeText(indent, start, end, 'end');
    return true;
  }

  function smartBackspace(textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end) return false;
    const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
    const before = textarea.value.slice(lineStart, start);
    if (/^ +$/.test(before) && before.length > 0) {
      const remove = Math.min(2, before.length);
      textarea.setRangeText('', start - remove, start, 'end');
      return true;
    }
    return false;
  }

  function smartEnter(textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const currentLine = value.slice(0, start).split('\n').length - 1;
    const indent = getIndent(value, currentLine);
    const lineBefore = value.slice(value.lastIndexOf('\n', start - 1) + 1, start);
    const trimmed = lineBefore.trimEnd();
    const nextChar = value.slice(end, end + 1);
    const extra = /[{\[]\s*$/.test(trimmed) ? '  ' : '';
    let insertion = '\n' + indent + extra;
    if (extra && nextChar === '}') insertion += '\n' + indent;
    textarea.setRangeText(insertion, start, end, 'end');
    if (extra && nextChar === '}') {
      const cursor = textarea.selectionStart;
      textarea.setSelectionRange(cursor - indent.length, cursor - indent.length);
    }
    return true;
  }

  function autoPair(textarea, event) {
    const key = event.key;
    if (!(key in BRACKETS)) return false;
    if (event.ctrlKey || event.metaKey || event.altKey) return false;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const next = value.slice(end, end + 1);

    if (isQuote(key) && next === key && start === end) {
      textarea.selectionStart = textarea.selectionEnd = end + 1;
      return true;
    }

    if (CLOSE.has(key)) return false;
    const close = BRACKETS[key];
    const selected = value.slice(start, end);
    textarea.setRangeText(key + selected + close, start, end, 'end');
    textarea.setSelectionRange(start + 1 + selected.length, start + 1 + selected.length);
    return true;
  }

  function skipClosing(textarea, event) {
    if (!CLOSE.has(event.key)) return false;
    if (event.ctrlKey || event.metaKey || event.altKey) return false;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end) return false;
    if (textarea.value[start] !== event.key) return false;
    textarea.selectionStart = textarea.selectionEnd = start + 1;
    return true;
  }

  function stopHandled(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function expose(textarea) {
    if (!textarea || textarea.dataset.vsacEditorEngine === '1') return;
    textarea.dataset.vsacEditorEngine = '1';
    textarea.setAttribute('spellcheck', 'false');
    textarea.setAttribute('autocapitalize', 'off');
    textarea.setAttribute('autocomplete', 'off');
    textarea.setAttribute('autocorrect', 'off');

    textarea.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        stopHandled(event);
        smartTab(textarea);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }
      if (event.key === 'Backspace' && smartBackspace(textarea)) {
        stopHandled(event);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }
      if (event.key === 'Enter') {
        stopHandled(event);
        smartEnter(textarea);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }
      if (skipClosing(textarea, event)) {
        stopHandled(event);
        return;
      }
      if (autoPair(textarea, event)) {
        stopHandled(event);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    textarea.addEventListener('paste', () => {
      requestAnimationFrame(() => textarea.dispatchEvent(new Event('input', { bubbles: true })));
    });

    textarea.addEventListener('input', () => {
      textarea.dataset.editorReady = '1';
    });
  }

  window.VSACEditor = Object.freeze({
    version: '0.1.1',
    attach: expose,
    smartTab,
    smartEnter,
  });

  document.addEventListener('DOMContentLoaded', () => expose(document.querySelector('#editor')));
})();
