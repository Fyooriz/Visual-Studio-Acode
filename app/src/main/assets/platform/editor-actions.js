(() => {
  'use strict';

  const PREF_KEY = 'vsac.preferences.v1';
  const editor = document.querySelector('#editor');
  const panel = document.querySelector('#panel');
  const panelTitle = document.querySelector('#panel-title');
  const command = document.querySelector('#command');
  const commandList = document.querySelector('#command-list');
  const previewBody = document.querySelector('#preview-body');

  if (!editor || !panel || !panelTitle || !command || !commandList || !previewBody) return;

  const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function readPrefs() {
    try { return JSON.parse(localStorage.getItem(PREF_KEY) || '{}'); }
    catch (_) { return {}; }
  }

  function applyEditorPrefs() {
    const prefs = readPrefs();
    const tabSize = Math.max(1, Math.min(8, Number(prefs.tabSize) || 2));
    editor.style.tabSize = String(tabSize);
    editor.style.whiteSpace = prefs.wrap === true ? 'pre-wrap' : 'pre';
  }

  function syncFromPreferences() {
    applyEditorPrefs();
    window.dispatchEvent(new CustomEvent('vsac:editor-preferences-changed'));
  }

  function openEditorPanel(title) {
    panelTitle.textContent = title;
    panel.classList.remove('hidden');
    command.classList.remove('hidden');
    commandList.classList.remove('hidden');
    previewBody.classList.add('hidden');
    command.value = '';
    command.onkeydown = null;
    command.oninput = null;
    command.focus();
  }

  function selectedOrCurrentWord() {
    if (editor.selectionStart !== editor.selectionEnd) return editor.value.slice(editor.selectionStart, editor.selectionEnd);
    const start = editor.selectionStart;
    const value = editor.value;
    let left = start;
    let right = start;
    while (left > 0 && /[A-Za-z0-9_$-]/.test(value[left - 1])) left -= 1;
    while (right < value.length && /[A-Za-z0-9_$-]/.test(value[right])) right += 1;
    return value.slice(left, right);
  }

  function findMatches(text, query, options) {
    if (!query) return [];
    const flags = `${options.regex ? 'g' : 'g'}${options.caseSensitive ? '' : 'i'}`;
    try {
      const re = new RegExp(options.regex ? query : escapeRegExp(query), flags);
      const out = [];
      let match;
      while ((match = re.exec(text))) {
        out.push({ start: match.index, end: match.index + match[0].length, value: match[0] });
        if (match[0] === '') re.lastIndex += 1;
        if (out.length >= 5000) break;
      }
      return out;
    } catch (_) {
      return [];
    }
  }

  function setRange(start, end) {
    editor.focus();
    editor.setSelectionRange(start, end);
    const textBefore = editor.value.slice(0, start);
    const line = textBefore.split('\n').length - 1;
    const lineStart = textBefore.lastIndexOf('\n') + 1;
    const column = start - lineStart;
    const approxLineHeight = parseFloat(getComputedStyle(editor).lineHeight) || 20;
    editor.scrollTop = Math.max(0, line * approxLineHeight - editor.clientHeight / 3);
    return { line, column };
  }

  function renderFindReplace(initialFind = selectedOrCurrentWord()) {
    openEditorPanel('Find / Replace');
    command.placeholder = 'Find…';
    command.value = initialFind;
    commandList.innerHTML = '';
    previewBody.classList.add('hidden');

    const form = document.createElement('div');
    form.className = 'editor-search-form';
    form.innerHTML = `
      <input id="er-replace" class="editor-search-input" placeholder="Replace with…" autocomplete="off">
      <div class="editor-search-options">
        <label><input id="er-case" type="checkbox"> Case</label>
        <label><input id="er-regex" type="checkbox"> Regex</label>
      </div>
      <div class="editor-search-actions">
        <button id="er-prev" type="button">↑ Previous</button>
        <button id="er-next" type="button">↓ Next</button>
        <button id="er-one" type="button">Replace</button>
        <button id="er-all" type="button">Replace All</button>
      </div>
      <div id="er-count" class="editor-search-count"></div>`;
    commandList.appendChild(form);

    const replaceInput = form.querySelector('#er-replace');
    const caseInput = form.querySelector('#er-case');
    const regexInput = form.querySelector('#er-regex');
    const countEl = form.querySelector('#er-count');

    const getOptions = () => ({ caseSensitive: caseInput.checked, regex: regexInput.checked });
    const matches = () => findMatches(editor.value, command.value, getOptions());

    const updateCount = () => {
      const items = matches();
      countEl.textContent = command.value ? `${items.length}${items.length >= 5000 ? '+' : ''} match${items.length === 1 ? '' : 'es'}` : 'Type text to search.';
      return items;
    };

    const selectRelative = (direction) => {
      const items = updateCount();
      if (!items.length) return;
      const cursor = direction > 0 ? editor.selectionEnd : editor.selectionStart - 1;
      let target = direction > 0 ? items.find((item) => item.start > cursor) : [...items].reverse().find((item) => item.end <= cursor);
      if (!target) target = direction > 0 ? items[0] : items[items.length - 1];
      setRange(target.start, target.end);
    };

    form.querySelector('#er-prev').onclick = () => selectRelative(-1);
    form.querySelector('#er-next').onclick = () => selectRelative(1);

    form.querySelector('#er-one').onclick = () => {
      const items = matches();
      if (!items.length) return;
      const selected = selectedOrCurrentWord();
      let target = items.find((item) => item.start === editor.selectionStart && item.end === editor.selectionEnd);
      if (!target) target = items.find((item) => item.start >= editor.selectionStart) || items[0];
      let replacement = replaceInput.value;
      if (getOptions().regex) {
        try { replacement = selected.replace(new RegExp(command.value, getOptions().caseSensitive ? '' : 'i'), replacement); }
        catch (_) { return; }
      }
      editor.setRangeText(replacement, target.start, target.end, 'select');
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      updateCount();
    };

    form.querySelector('#er-all').onclick = () => {
      const needle = command.value;
      if (!needle) return;
      const options = getOptions();
      let re;
      try { re = new RegExp(options.regex ? needle : escapeRegExp(needle), options.caseSensitive ? 'g' : 'gi'); }
      catch (_) { countEl.textContent = 'Invalid regular expression.'; return; }
      editor.value = editor.value.replace(re, replaceInput.value);
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      updateCount();
    };

    command.oninput = updateCount;
    [caseInput, regexInput].forEach((input) => input.addEventListener('change', updateCount));
    command.onkeydown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); panel.classList.add('hidden'); return; }
      if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); selectRelative(1); }
    };
    updateCount();
  }

  function goToLine() {
    openEditorPanel('Go to Line');
    command.placeholder = 'Line number';
    command.setAttribute('inputmode', 'numeric');
    command.value = '';
    commandList.innerHTML = '<div class="result-row">Enter a line number and press Enter.</div>';
    command.onkeydown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); panel.classList.add('hidden'); return; }
      if (event.key !== 'Enter') return;
      event.preventDefault();
      const requested = Math.max(1, Number(command.value) || 1);
      const lines = editor.value.split('\n');
      const row = Math.min(lines.length - 1, requested - 1);
      const column = Math.min(lines[row].length, 0);
      let offset = 0;
      for (let i = 0; i < row; i += 1) offset += lines[i].length + 1;
      setRange(offset + column, offset + column);
      panel.classList.add('hidden');
    };
    command.focus();
  }

  function duplicateLine() {
    const value = editor.value;
    const start = value.lastIndexOf('\n', editor.selectionStart - 1) + 1;
    const endBreak = value.indexOf('\n', editor.selectionEnd);
    const end = endBreak === -1 ? value.length : endBreak;
    const line = value.slice(start, end);
    editor.setRangeText(`${line}\n${line}`, start, end, 'end');
    const nextCursor = start + line.length + 1 + Math.max(0, editor.selectionStart - start);
    editor.setSelectionRange(nextCursor, nextCursor);
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function toggleComment() {
    const fileName = document.querySelector('#tabs .tab.active')?.textContent.replace(/\s+•$/, '') || '';
    const lineStarts = [];
    const before = editor.value.slice(0, editor.selectionStart);
    const startRow = before.split('\n').length - 1;
    const selectedText = editor.value.slice(editor.selectionStart, editor.selectionEnd);
    const selectedRows = Math.max(1, selectedText.split('\n').length);
    const lines = editor.value.split('\n');
    const prefixes = new Set(['JavaScript', 'TypeScript', 'Java', 'Kotlin', 'Go', 'Rust', 'C', 'C++', 'C#', 'Dart', 'PHP', 'Swift', 'Scala', 'Objective-C', 'Shell', 'Python', 'Ruby', 'Lua', 'R', 'SQL']);
    const lang = document.querySelector('#language')?.textContent || '';
    const linePrefix = prefixes.has(lang) || /\.(js|jsx|ts|tsx|java|kt|go|rs|c|cc|cpp|h|hpp|cs|dart|php|sh|bash|py|rb|lua|sql)$/i.test(fileName) ? '//' : (/\.(html?|xml|svg)$/i.test(fileName) ? '<!--' : '#');
    const lineEnd = linePrefix === '<!--' ? ' -->' : '';
    const beginOffset = lines.slice(0, startRow).reduce((n, line) => n + line.length + 1, 0);
    const endRow = Math.min(lines.length - 1, startRow + selectedRows - 1);
    const endOffset = lines.slice(0, endRow + 1).reduce((n, line) => n + line.length + 1, 0);
    const activeLines = lines.slice(startRow, endRow + 1);
    const nonEmpty = activeLines.filter((line) => line.trim());
    const uncomment = nonEmpty.length > 0 && nonEmpty.every((line) => line.trimStart().startsWith(linePrefix));
    const updated = activeLines.map((line) => {
      const indent = line.match(/^\s*/)?.[0] || '';
      const rest = line.slice(indent.length);
      if (uncomment) {
        let next = rest.startsWith(linePrefix) ? rest.slice(linePrefix.length) : rest;
        if (next.startsWith(' ')) next = next.slice(1);
        if (linePrefix === '<!--' && next.endsWith(lineEnd)) next = next.slice(0, -lineEnd.length).replace(/\s+$/, '');
        return indent + next;
      }
      return linePrefix === '<!--' ? `${indent}<!-- ${rest}${lineEnd}` : `${indent}${linePrefix} ${rest}`;
    });
    lines.splice(startRow, activeLines.length, ...updated);
    editor.value = lines.join('\n');
    const newEnd = Math.min(editor.value.length, endOffset + updated.reduce((n, line, i) => n + line.length - activeLines[i].length, 0));
    editor.setSelectionRange(beginOffset, newEnd);
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function handleShortcut(event) {
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === 'f') { event.preventDefault(); event.stopImmediatePropagation(); renderFindReplace(); return; }
    if (key === 'h') { event.preventDefault(); event.stopImmediatePropagation(); renderFindReplace(); return; }
    if (key === 'l') { event.preventDefault(); event.stopImmediatePropagation(); goToLine(); return; }
    if (key === 'd') { event.preventDefault(); event.stopImmediatePropagation(); duplicateLine(); return; }
    if (event.shiftKey && key === 'k') { event.preventDefault(); event.stopImmediatePropagation(); toggleComment(); }
  }

  editor.addEventListener('keydown', handleShortcut, true);
  applyEditorPrefs();
  window.addEventListener('vsac:editor-preferences-changed', syncFromPreferences);

  window.VSACEditorActions = Object.freeze({
    version: '0.2.0',
    findReplace: renderFindReplace,
    goToLine,
    duplicateLine,
    toggleComment,
    applyPreferences: applyEditorPrefs,
  });
})();
