/*
 * Visual Studio Acode Diagnostics Platform
 * Adapted conceptually from the service/provider model in Ace Linters.
 * This implementation intentionally avoids patching global Ace state.
 */
(function (global) {
  'use strict';

  const providers = new Map();
  const diagnostics = new Map();

  function register(provider) {
    if (!provider || !provider.id || typeof provider.validate !== 'function') {
      throw new TypeError('Diagnostic provider requires id + validate()');
    }
    providers.set(provider.id, Object.freeze({ ...provider }));
    return () => providers.delete(provider.id);
  }

  function validate(document) {
    const source = document && typeof document.content === 'string' ? document.content : '';
    const mode = document && document.language ? document.language : 'Plain Text';
    const uri = document && document.uri ? document.uri : 'untitled://document';
    const results = [];

    for (const provider of providers.values()) {
      if (Array.isArray(provider.languages) && !provider.languages.includes(mode)) continue;
      try {
        const items = provider.validate({ uri, language: mode, content: source }) || [];
        for (const item of items) results.push(normalize(item, provider.id));
      } catch (error) {
        results.push({
          source: provider.id,
          severity: 'error',
          message: `Diagnostic provider failed: ${error && error.message ? error.message : String(error)}`,
          line: 1,
          column: 1
        });
      }
    }

    diagnostics.set(uri, results);
    return results;
  }

  function normalize(item, source) {
    return {
      source,
      severity: item.severity || 'warning',
      message: String(item.message || 'Diagnostic'),
      line: Math.max(1, Number(item.line) || 1),
      column: Math.max(1, Number(item.column) || 1)
    };
  }

  function list(uri) {
    return diagnostics.get(uri) || [];
  }

  function clear(uri) {
    diagnostics.delete(uri);
  }

  // Lightweight, dependency-free providers are used until the native LSP broker is connected.
  register({
    id: 'vsac-json',
    languages: ['JSON'],
    validate({ content }) {
      if (!content.trim()) return [];
      try {
        JSON.parse(content);
        return [];
      } catch (error) {
        const match = String(error.message || '').match(/position (\d+)/i);
        const offset = match ? Number(match[1]) : 0;
        const prefix = content.slice(0, offset);
        return [{ severity: 'error', message: `Invalid JSON: ${error.message}`, line: prefix.split('\n').length, column: offset - prefix.lastIndexOf('\n') }];
      }
    }
  });

  register({
    id: 'vsac-brackets',
    languages: ['JavaScript', 'TypeScript', 'CSS', 'C', 'C++', 'C#', 'Java', 'Kotlin', 'Go', 'Rust', 'PHP', 'Dart', 'Lua'],
    validate({ content }) {
      const stack = [];
      const pairs = { ')': '(', ']': '[', '}': '{' };
      const opens = new Set(['(', '[', '{']);
      const items = [];
      let line = 1;
      let column = 0;
      for (let i = 0; i < content.length; i++) {
        const ch = content[i];
        if (ch === '\n') { line++; column = 0; continue; }
        column++;
        if (opens.has(ch)) stack.push({ ch, line, column });
        else if (pairs[ch]) {
          const last = stack.pop();
          if (!last || last.ch !== pairs[ch]) {
            items.push({ severity: 'error', message: `Unmatched '${ch}'`, line, column });
          }
        }
      }
      for (let i = stack.length - 1; i >= 0; i--) {
        items.push({ severity: 'warning', message: `Unclosed '${stack[i].ch}'`, line: stack[i].line, column: stack[i].column });
      }
      return items;
    }
  });

  global.VSACDiagnostics = Object.freeze({ register, validate, list, clear });
})(window);
