(() => {
  'use strict';

  const state = { logs: [], network: [], errors: [] };
  const limit = 300;

  function push(list, value) {
    list.push({ ...value, timestamp: Date.now() });
    if (list.length > limit) list.splice(0, list.length - limit);
  }

  function safeValue(value) {
    try {
      if (value === null || value === undefined) return value;
      if (typeof value === 'object') return JSON.parse(JSON.stringify(value));
      return String(value);
    } catch (_) { return '[unserializable]'; }
  }

  function createProbeSource() {
    return `(function(){
      'use strict';
      const safeValue=${safeValue.toString()};
      const send=(data)=>{try{parent.postMessage({source:'VSAC',...data},'*')}catch(_){}};
      ['log','info','warn','error','debug'].forEach(level=>{
        const fn=console[level];
        console[level]=function(){
          send({kind:'console',data:{level,args:Array.from(arguments).map(safeValue)}});
          return fn.apply(console,arguments);
        };
      });
      const reportError=(message,line,column)=>send({kind:'error',data:{message:message||'Script error',line:line||0,column:column||0}});
      window.addEventListener('error',e=>reportError(e.message,e.lineno,e.colno));
      window.addEventListener('unhandledrejection',e=>reportError(String(e.reason||'Unhandled promise rejection'),0,0));
      window.onerror=(message,source,line,column)=>{reportError(message,line,column);return false;};
    })();`;
  }

  function instrumentHtml(html) {
    const source = createProbeSource();
    const probe = `<script>${source.replace(/<\/script/gi, '<\\/script')}</script>`;
    const policy = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; font-src data:; object-src 'none'; base-uri 'none'; form-action 'none';">`;
    const input = String(html || '');
    if (/<head\b[^>]*>/i.test(input)) {
      return input.replace(/<head\b[^>]*>/i, match => `${match}${policy}${probe}`);
    }
    return `<!doctype html><html><head>${policy}${probe}</head><body>${input}</body></html>`;
  }

  function installPreviewProbe(frame) {
    if (!frame) return;
    frame.addEventListener('load', () => {
      try {
        const win = frame.contentWindow;
        if (!win || win.__VSAC_PROBE__) return;
        win.__VSAC_PROBE__ = true;
        ['log', 'info', 'warn', 'error', 'debug'].forEach(method => {
          const original = win.console[method];
          win.console[method] = (...args) => {
            push(state.logs, { level: method, args: args.map(safeValue) });
            original.apply(win.console, args);
          };
        });
      } catch (_) {}
    }, { once: true });
  }

  function receive(event) {
    if (!event.data || event.data.source !== 'VSAC') return;
    if (event.data.kind === 'console') push(state.logs, event.data.data || {});
    if (event.data.kind === 'error') push(state.errors, event.data.data || {});
    if (event.data.kind === 'network') push(state.network, event.data.data || {});
  }

  function clear() {
    state.logs.length = 0;
    state.network.length = 0;
    state.errors.length = 0;
  }

  function snapshot() { return JSON.parse(JSON.stringify(state)); }

  window.addEventListener('message', receive);
  window.VSACDevTools = Object.freeze({ state, instrumentHtml, installPreviewProbe, clear, snapshot });
})();
