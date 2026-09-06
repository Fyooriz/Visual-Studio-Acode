(() => {
  'use strict';

  // Adapted from declarative language/snippet sources in the supplied Acode archive.
  // Only data is used; plugin activation, globals, and executable hooks are excluded.
  const SNIPPETS = Object.freeze({
    javascript: Object.freeze({
      imr: "import React from 'react';", imrc: "import React, { ${1:useState} } from 'react';",
      clg: 'console.log(${1});', cle: 'console.error(${1});', if: 'if (${1:condition}) {\n  ${2}\n}',
      ife: 'if (${1:condition}) {\n  ${2}\n} else {\n  ${3}\n}', for: 'for (let i = 0; i < ${1:length}; i++) {\n  ${2}\n}',
      fn: 'function ${1:name}(${2}) {\n  ${3}\n}', afn: 'const ${1:name} = (${2}) => {\n  ${3}\n}'
    }),
    jsx: Object.freeze({
      rfc: "import React from 'react';\n\nfunction ${1:Component}() {\n  return (\n    ${2:<div />}\n  );\n}\n\nexport default ${1:Component};",
      rfce: 'export default function ${1:Component}() {\n  return (\n    <div>${2}</div>\n  );\n}',
      rafc: "import React from 'react';\n\nconst ${1:Component} = () => {\n  return (\n    ${2:<div />}\n  );\n};\n\nexport default ${1:Component};",
      button: '<button type="${1:button}">${2}</button>', div: '<div${1}></div>'
    }),
    tsx: Object.freeze({
      imp: "import ${1:Thing} from '${2:module}';", imd: "import { ${1:Thing} } from '${2:module}';",
      exd: 'export default ${1};', ue: 'useEffect(() => {\n  ${1}\n}, [${2}]);',
      asyncfn: 'async function ${1:name}(${2:params}): Promise<${3:void}> {\n  ${4}\n}'
    }),
    python: Object.freeze({
      imp: 'import ${1:module}', from: 'from ${1:module} import ${2:name}', print: 'print(${1})',
      fn: 'def ${1:name}(${2}):\n    ${3}', if: 'if ${1:condition}:\n    ${2}', for: 'for ${1:item} in ${2:items}:\n    ${3}',
      cls: 'class ${1:Name}:\n    ${3}'
    }),
    kotlin: Object.freeze({
      fun: 'fun ${1:name}(${2}): ${3:Unit} {\n    ${4}\n}', val: 'val ${1:name}: ${2:Type} = ${3:value}',
      println: 'println(${1})', when: 'when (${1:value}) {\n    ${2}\n}'
    }),
    java: Object.freeze({
      cls: 'public class ${1:Name} {\n    ${2}\n}', main: 'public static void main(String[] args) {\n    ${1}\n}',
      sout: 'System.out.println(${1});', method: 'public ${1:void} ${2:name}(${3}) {\n    ${4}\n}'
    }),
    csharp: Object.freeze({
      cls: 'public class ${1:Name}\n{\n    ${2}\n}', cw: 'Console.WriteLine(${1});',
      method: 'public ${1:void} ${2:name}(${3})\n{\n    ${4}\n}'
    }),
    cpp: Object.freeze({
      inc: '#include <${1:iostream}>', main: 'int main() {\n    ${1}\n    return 0;\n}',
      cout: 'std::cout << ${1} << std::endl;', cls: 'class ${1:Name} {\npublic:\n    ${2}\n};'
    }),
    c: Object.freeze({
      inc: '#include <${1:stdio.h}>', main: 'int main(void) {\n    ${1}\n    return 0;\n}',
      printf: 'printf("${1}%s\\n", ${2});', fn: '${1:int} ${2:name}(${3}) {\n    ${4}\n}'
    }),
    go: Object.freeze({
      pkg: 'package ${1:main}', imp: 'import "${1:fmt}"', main: 'func main() {\n    ${1}\}',
      fn: 'func ${1:name}(${2}) ${3:error} {\n    ${4}\n    return nil\n}', println: 'fmt.Println(${1})'
    }),
    rust: Object.freeze({
      fn: 'fn ${1:name}(${2}) -> ${3:()} {\n    ${4}\n}', main: 'fn main() {\n    ${1}\n}',
      println: 'println!("{}", ${1});', let: 'let ${1:name}: ${2:Type} = ${3:value};'
    }),
    php: Object.freeze({ echo: 'echo ${1};', fn: 'function ${1:name}(${2}) {\n    ${3}\n}', if: 'if (${1:condition}) {\n    ${2}\n}', class: 'class ${1:Name} {\n    ${2}\n}' }),
    ruby: Object.freeze({ puts: 'puts ${1}', fn: 'def ${1:name}(${2})\n  ${3}\nend', each: '${1:items}.each do |${2:item}|\n  ${3}\nend' }),
    dart: Object.freeze({ imp: "import '${1:package}';", void: 'void ${1:name}(${2}) {\n  ${3}\n}', main: 'void main() {\n  ${1}\n}', print: 'print(${1});' }),
    swift: Object.freeze({ import: 'import ${1:Foundation}', fn: 'func ${1:name}(${2}) -> ${3:Void} {\n    ${4}\n}', print: 'print(${1})' }),
    shell: Object.freeze({ shebang: '#!/usr/bin/env bash', echo: 'echo "${1}"', if: 'if [[ ${1:condition} ]]; then\n  ${2}\nfi', for: 'for ${1:item} in ${2:items}; do\n  ${3}\ndone' }),
    sql: Object.freeze({ select: 'SELECT ${1:*}\nFROM ${2:table}\nWHERE ${3:condition};', insert: 'INSERT INTO ${1:table} (${2:columns})\nVALUES (${3:values});', update: 'UPDATE ${1:table}\nSET ${2:column} = ${3:value}\nWHERE ${4:condition};', create: 'CREATE TABLE ${1:table} (\n  ${2:id INTEGER PRIMARY KEY}\n);' }),
    html: Object.freeze({ doc: '<!doctype html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>${1:Document}</title>\n</head>\n<body>\n  ${2}\n</body>\n</html>', div: '<div>${1}</div>', button: '<button>${1}</button>', link: '<a href="${1:#}">${2}</a>' }),
    css: Object.freeze({ rule: '${1:.selector} {\n  ${2:property}: ${3:value};\n}', media: '@media (${1:max-width: 768px}) {\n  ${2}\n}', var: ':root {\n  --${1:name}: ${2:value};\n}' })
  });

  function languageBucket(language) {
    const value = String(language || '').toLowerCase();
    if (value.includes('typescript') || value.includes('tsx')) return 'tsx';
    if (value.includes('jsx') || value.includes('react')) return 'jsx';
    if (value.includes('python')) return 'python';
    if (value === 'kotlin' || value.includes('kotlin script')) return 'kotlin';
    if (value === 'java') return 'java';
    if (value === 'c#' || value === 'csharp') return 'csharp';
    if (value === 'c++' || value === 'c/c++') return 'cpp';
    if (value === 'c') return 'c';
    if (value === 'go') return 'go';
    if (value === 'rust') return 'rust';
    if (value === 'php') return 'php';
    if (value === 'ruby') return 'ruby';
    if (value === 'dart') return 'dart';
    if (value === 'swift') return 'swift';
    if (value.includes('shell') || value === 'bash' || value === 'zsh' || value === 'fish') return 'shell';
    if (value === 'sql') return 'sql';
    if (value === 'html') return 'html';
    if (value === 'css' || value === 'scss' || value === 'sass' || value === 'less') return 'css';
    return 'javascript';
  }

  function get(prefix, language) {
    const bucket = SNIPPETS[languageBucket(language)] || SNIPPETS.javascript;
    return bucket[prefix] || null;
  }

  function list(language, query) {
    const bucket = SNIPPETS[languageBucket(language)] || SNIPPETS.javascript;
    const q = String(query || '').toLowerCase();
    return Object.keys(bucket).filter((key) => !q || key.toLowerCase().includes(q)).map((key) => ({ prefix: key, body: bucket[key] }));
  }

  window.VSACSnippets = Object.freeze({ version: '0.2.0', get, list });
})();
