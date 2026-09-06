(() => {
  'use strict';

  const BRACKETS = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
  const CLOSE = new Set(Object.values(BRACKETS));
  let completion = null;
  let completionItems = [];
  let completionIndex = 0;

  function isQuote(ch) {
    return ch === '"' || ch === "'" || ch === '`';
  }

  function getIndent(text, row) {
    const lines = text.split('\n');
    return (lines[row] || '').match(/^\s*/)?.[0] || '';
  }

  function currentPrefix(textarea) {
    const start = textarea.selectionStart;
    if (start !== textarea.selectionEnd) return '';
    const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
    return textarea.value.slice(lineStart, start).match(/[A-Za-z0-9_.$:-]+$/)?.[0] || '';
  }

  function expandSnippetPrefix(textarea, prefix) {
    const body = window.VSACSnippets?.get(prefix, textarea.dataset.language || '');
    if (!body) return false;
    const start = textarea.selectionStart - prefix.length;
    let firstIndex = -1;
    let firstLength = 0;
    const expanded = body.replace(/\$\{(\d+)(?::([^}]*))?\}|\$(\d+)/g, (match, longIndex, defaultText, shortIndex) => {
      const index = Number(longIndex || shortIndex || 0);
      const replacement = defaultText ?? '';
      if (index > 0 && firstIndex === -1) {
        firstIndex = 0;
        firstLength = replacement.length;
      }
      return replacement;
    });
    textarea.setRangeText(expanded, start, textarea.selectionEnd, 'end');
    const cursor = firstIndex === -1 ? start + expanded.length : start + firstIndex;
    textarea.setSelectionRange(cursor, cursor + firstLength);
    hideCompletion();
    return true;
  }

  function expandSnippet(textarea) {
    const prefix = currentPrefix(textarea);
    return prefix ? expandSnippetPrefix(textarea, prefix) : false;
  }

  function ensureCompletionElement() {
    if (completion) return completion;
    completion = document.createElement('div');
    completion.className = 'vsac-completion hidden';
    completion.setAttribute('role', 'listbox');
    document.body.appendChild(completion);
    return completion;
  }

  function renderCompletion(textarea) {
    const box = ensureCompletionElement();
    const prefix = currentPrefix(textarea);
    completionItems = window.VSACSnippets?.list(textarea.dataset.language || '', prefix).slice(0, 12) || [];
    completionIndex = Math.max(0, Math.min(completionIndex, completionItems.length - 1));
    box.innerHTML = '';
    if (!completionItems.length) {
      hideCompletion();
      return false;
    }
    completionItems.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = index === completionIndex ? 'active' : '';
      button.textContent = item.prefix;
      button.setAttribute('role', 'option');
      button.onclick = () => expandSnippetPrefix(textarea, item.prefix);
      box.appendChild(button);
    });
    box.classList.remove('hidden');
    return true;
  }

  function showCompletion(textarea) {
    completionIndex = 0;
    return renderCompletion(textarea);
  }

  function hideCompletion() {
    completion?.classList.add('hidden');
  }

  function moveCompletion(delta, textarea) {
    if (!completion || completion.classList.contains('hidden')) return false;
    if (!completionItems.length) return true;
    completionIndex = (completionIndex + delta + completionItems.length) % completionItems.length;
    renderCompletion(textarea);
    return true;
  }

  function acceptCompletion(textarea) {
    if (!completion || completion.classList.contains('hidden') || !completionItems.length) return false;
    return expandSnippetPrefix(textarea, completionItems[completionIndex].prefix);
  }

  function smartTab(textarea) {
    if (expandSnippet(textarea)) return true;
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
    if (acceptCompletion(textarea)) return true;
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

    const languageNode = document.querySelector('#language');
    const syncLanguage = () => { textarea.dataset.language = languageNode?.textContent || ''; };
    syncLanguage();
    if (languageNode && window.MutationObserver) new MutationObserver(syncLanguage).observe(languageNode, { childList: true, characterData: true, subtree: true });

    textarea.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.code === 'Space') {
        stopHandled(event);
        showCompletion(textarea);
        return;
      }
      if (event.key === 'ArrowDown' && completion && !completion.classList.contains('hidden')) {
        stopHandled(event);
        moveCompletion(1, textarea);
        return;
      }
      if (event.key === 'ArrowUp' && completion && !completion.classList.contains('hidden')) {
        stopHandled(event);
        moveCompletion(-1, textarea);
        return;
      }
      if (event.key === 'Escape' && completion && !completion.classList.contains('hidden')) {
        stopHandled(event);
        hideCompletion();
        return;
      }
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

    textarea.addEventListener('input', () => {
      textarea.dataset.editorReady = '1';
      if (completion && !completion.classList.contains('hidden')) renderCompletion(textarea);
    });

    textarea.addEventListener('blur', () => setTimeout(hideCompletion, 120));
    textarea.addEventListener('paste', () => {
      requestAnimationFrame(() => textarea.dispatchEvent(new Event('input', { bubbles: true })));
    });
  }

  window.VSACEditor = Object.freeze({
    version: '0.3.0',
    attach: expose,
    smartTab,
    smartEnter,
    expandSnippet,
    showCompletion,
    hideCompletion,
  });

  document.addEventListener('DOMContentLoaded', () => expose(document.querySelector('#editor')));
})();
