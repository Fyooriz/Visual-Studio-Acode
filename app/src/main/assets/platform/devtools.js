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
      const safeValue=${safeValue.toString()};
      const send=(data)=>{try{parent.postMessage({source:'VSAC',...data},'*')}catch(_){}};
      ['log','info','warn','error','debug'].forEach(level=>{
        const fn=console[level];
        console[level]=function(){
          send({kind:'console',data:{level,args:Array.from(arguments).map(safeValue)}});
          return fn.apply(console,arguments);
        };
      });
      addEventListener('error',e=>send({kind:'error',data:{message:e.message||'Script error',line:e.lineno||0,column:e.colno||0}}));
      addEventListener('unhandledrejection',e=>send({kind:'error',data:{message:String(e.reason||'Unhandled promise rejection'),line:0,column:0}}));
    })();`;
  }

  function instrumentHtml(html) {
    const source = createProbeSource();
    const src = `data:text/javascript;charset=utf-8,${encodeURIComponent(source)}`;
    const probe = `<script src="${src}"></script>`;
    return /<head\b[^>]*>/i.test(html)
      ? String(html).replace(/<head\b[^>]*>/i, match => match + probe)
      : probe + String(html || '');
  }

  function installPreviewProbe(frame) {
    if (!frame) return;
    try {
      const probe = () => {
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
      };
      probe();
    } catch (_) {}
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
