(() => {
  'use strict';

  const state = {
    logs: [],
    network: [],
    errors: []
  };
  const limit = 300;

  function push(list, value) {
    list.push({ ...value, timestamp: Date.now() });
    if (list.length > limit) list.splice(0, list.length - limit);
  }

  function installPreviewProbe(frame) {
    if (!frame || !frame.contentWindow) return;
    const probe = () => {
      const win = frame.contentWindow;
      if (!win || win.__VSAC_PROBE__) return;
      win.__VSAC_PROBE__ = true;

      ['log', 'info', 'warn', 'error', 'debug'].forEach((method) => {
        const original = win.console[method];
        win.console[method] = (...args) => {
          push(state.logs, { level: method, args: args.map(safeValue) });
          original.apply(win.console, args);
        };
      });

      win.addEventListener('error', (event) => {
        push(state.errors, { message: event.message || 'Script error', line: event.lineno || 0, column: event.colno || 0 });
      });

      win.addEventListener('unhandledrejection', (event) => {
        push(state.errors, { message: String(event.reason || 'Unhandled promise rejection'), line: 0, column: 0 });
      });
    };
    try { probe(); } catch (_) {}
  }

  function safeValue(value) {
    try {
      if (value === null || value === undefined) return value;
      if (typeof value === 'object') return JSON.parse(JSON.stringify(value));
      return String(value);
    } catch (_) {
      return '[unserializable]';
    }
  }

  function clear() {
    state.logs.length = 0;
    state.network.length = 0;
    state.errors.length = 0;
  }

  function snapshot() {
    return JSON.parse(JSON.stringify(state));
  }

  window.VSACDevTools = { state, installPreviewProbe, clear, snapshot };
})();
