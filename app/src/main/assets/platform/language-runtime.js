(() => {
  'use strict';

  const EXTENSIONS = Object.freeze({
    js:'JavaScript',mjs:'JavaScript',cjs:'JavaScript',jsx:'JavaScript JSX',
    ts:'TypeScript',tsx:'TypeScript TSX',html:'HTML',htm:'HTML',css:'CSS',scss:'SCSS',sass:'Sass',less:'Less',
    json:'JSON',jsonc:'JSON with Comments',xml:'XML',svg:'SVG',md:'Markdown',markdown:'Markdown',
    py:'Python',pyw:'Python',java:'Java',kt:'Kotlin',kts:'Kotlin Script',go:'Go',rs:'Rust',php:'PHP',
    c:'C',h:'C/C++',cc:'C++',cpp:'C++',cxx:'C++',hpp:'C++',cs:'C#',dart:'Dart',lua:'Lua',rb:'Ruby',r:'R',
    swift:'Swift',m:'Objective-C',mm:'Objective-C++',pl:'Perl',pm:'Perl',ex:'Elixir',exs:'Elixir',hs:'Haskell',
    lhs:'Haskell',clj:'Clojure',cljs:'ClojureScript',groovy:'Groovy',gradle:'Gradle',sh:'Shell',bash:'Bash',
    zsh:'Zsh',fish:'Fish',bat:'Batch',ps1:'PowerShell',yaml:'YAML',yml:'YAML',toml:'TOML',ini:'INI',conf:'Config',
    env:'Env',tf:'Terraform',hcl:'HCL',sql:'SQL',graphql:'GraphQL',gql:'GraphQL',smali:'Smali',prisma:'Prisma',
    vue:'Vue',svelte:'Svelte'
  });

  function detect(name) {
    const value = String(name || '').toLowerCase();
    if (value === 'dockerfile') return 'Dockerfile';
    if (value === 'makefile') return 'Makefile';
    const dot = value.lastIndexOf('.');
    if (dot < 0 || dot === value.length - 1) return 'Plain Text';
    return EXTENSIONS[value.slice(dot + 1)] || 'Plain Text';
  }

  function activeFileName() {
    const active = document.querySelector('#tabs .tab.active');
    return active ? (active.title || active.textContent.replace(/\s+•$/, '')) : '';
  }

  function sync() {
    const name = activeFileName();
    if (!name) return;
    const detected = detect(name);
    const node = document.querySelector('#language');
    if (node && node.textContent !== detected) node.textContent = detected;
    const editor = document.querySelector('#editor');
    if (editor) editor.dataset.language = detected;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelector('#tabs');
    if (tabs && window.MutationObserver) {
      new MutationObserver(sync).observe(tabs, { childList:true, subtree:true, characterData:true });
    }
    sync();
  });

  window.VSACLanguages = Object.freeze({ detect, extensions: EXTENSIONS });
})();
