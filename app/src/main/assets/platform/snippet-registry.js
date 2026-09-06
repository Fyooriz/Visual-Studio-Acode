(() => {
  'use strict';

  // Adapted from the MIT-licensed React/JSX/TSX snippet source in the supplied Acode archive.
  // Only declarative snippet data is used; Acode plugin activation and editor-global hooks are not imported.
  const SNIPPETS = Object.freeze({
    javascript: Object.freeze({
      imr: "import React from 'react';",
      imrc: "import React, { ${1:useState} } from 'react';",
      imps: "import { use${1:State} } from 'react';",
      impse: "import { useState, useEffect } from 'react';",
      clg: 'console.log(${1});',
      cle: 'console.error(${1});',
      cli: 'console.info(${1});',
      map: '${1:arrayName}.map(${2:item} => {\n  ${3}\n})',
      if: 'if (${1:condition}) {\n  ${2}\n}',
      ife: 'if (${1:condition}) {\n  ${2}\n} else {\n  ${3}\n}',
      for: 'for (let i = 0; i < ${1:length}; i++) {\n  ${2}\n}',
      fn: 'function ${1:name}(${2}) {\n  ${3}\n}',
      afn: 'const ${1:name} = (${2}) => {\n  ${3}\n}',
    }),
    jsx: Object.freeze({
      rfc: "import React from 'react';\n\nfunction ${1:Component}() {\n  return (\n    ${2:<div />}\n  );\n}\n\nexport default ${1:Component};",
      rfce: 'export default function ${1:Component}() {\n  return (\n    <div>${2}</div>\n  );\n}',
      rafc: "import React from 'react';\n\nconst ${1:Component} = () => {\n  return (\n    ${2:<div />}\n  );\n};\n\nexport default ${1:Component};",
      map: '${1:items}.map(${2:item} => (\n  <${3:div} key={${2:item}}>${4}</${3:div}>\n))',
      button: '<button type="${1:button}">${2}</button>',
      div: '<div${1}></div>',
      classname: 'className="${1}"',
      onCl: 'onClick={${1:(event) => ${2:handleClick}(event)}}',
      onCh: 'onChange={${1:(event) => ${2:handleChange}(event)}}',
    }),
    tsx: Object.freeze({
      imp: "import ${1:Thing} from '${2:module}';",
      imd: "import { ${1:Thing} } from '${2:module}';",
      exd: 'export default ${1};',
      us: 'const [${1:state}, ${1/(.)/set\\u$1/}] = useState<${2:Type}>(${3});',
      ue: 'useEffect(() => {\n  ${1}\n}, [${2}]);',
      uref: 'const ${1:refName} = useRef<${2:HTMLElement}>(${3:null});',
      memo: 'export default memo(${1:Component});',
      asyncfn: 'async function ${1:name}(${2:params}): Promise<${3:void}> {\n  ${4}\n}',
    }),
  });

  function languageBucket(language) {
    const value = String(language || '').toLowerCase();
    if (value.includes('typescript') || value === 'tsx') return 'tsx';
    if (value.includes('jsx') || value.includes('react')) return 'jsx';
    return 'javascript';
  }

  function get(prefix, language) {
    const bucket = SNIPPETS[languageBucket(language)] || SNIPPETS.javascript;
    return bucket[prefix] || null;
  }

  function list(language, query) {
    const bucket = SNIPPETS[languageBucket(language)] || SNIPPETS.javascript;
    const q = String(query || '').toLowerCase();
    return Object.keys(bucket)
      .filter((key) => !q || key.toLowerCase().includes(q))
      .map((key) => ({ prefix: key, body: bucket[key] }));
  }

  window.VSACSnippets = Object.freeze({
    version: '0.1.0',
    get,
    list,
  });
})();
