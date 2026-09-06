const editor = document.querySelector('#editor');
const gutter = document.querySelector('#gutter');
const position = document.querySelector('#position');
const palette = document.querySelector('#palette');
const command = document.querySelector('#command');
const tabs = document.querySelector('#tabs');

const files = ['README.md', 'main.js', 'package.json'];
let activeFile = 'main.js';

function renderTabs() {
  tabs.innerHTML = '';
  for (const file of files) {
    const el = document.createElement('button');
    el.className = `tab${file === activeFile ? ' active' : ''}`;
    el.textContent = file;
    el.onclick = () => { activeFile = file; renderTabs(); };
    tabs.appendChild(el);
  }
}

function renderGutter() {
  const count = Math.max(1, editor.value.split('\n').length);
  gutter.textContent = Array.from({length: count}, (_, i) => i + 1).join('\n');
}

function updatePosition() {
  const before = editor.value.slice(0, editor.selectionStart);
  const line = before.split('\n').length;
  const col = before.length - before.lastIndexOf('\n');
  position.textContent = `Ln ${line}, Col ${col}`;
}

function sync() { renderGutter(); updatePosition(); }

editor.addEventListener('input', sync);
editor.addEventListener('click', updatePosition);
editor.addEventListener('keyup', updatePosition);
editor.addEventListener('scroll', () => { gutter.scrollTop = editor.scrollTop; });

document.querySelector('#menu').onclick = () => palette.classList.toggle('hidden');
document.querySelector('#more').onclick = () => palette.classList.toggle('hidden');
document.querySelector('#run').onclick = () => {
  // ExecutionEngine will own this action once the Android/native bridge is added.
  document.querySelector('#language').textContent = 'Run queued';
  setTimeout(() => document.querySelector('#language').textContent = 'JavaScript', 1200);
};

command.addEventListener('input', () => {
  const q = command.value.toLowerCase();
  for (const item of document.querySelectorAll('.command-list button')) {
    item.hidden = !item.textContent.toLowerCase().includes(q);
  }
});

document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
    event.preventDefault();
    palette.classList.remove('hidden');
    command.focus();
  }
  if (event.key === 'Escape') palette.classList.add('hidden');
});

renderTabs();
sync();
