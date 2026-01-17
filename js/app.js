/* ================================
   Config
================================ */

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQndjBqUVsGNWfRpgZzwiuoum6dRsQuIEvouN3D7za_DHgIl-X3nVrVs13VxA7MvIPIau32if2ntiAS/pub?gid=241210704&single=true&output=csv';

const TARGET_COLUMNS = [
  'col-finance',
  'col-property',
  'col-tech',
  'col-consumer'
];

const COLUMN_ORDER_KEY = 'columnOrder';
const SORT_STATE_KEY = 'sortState';

/* ================================
   Load & Render
================================ */

fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = text.trim().split('\n').slice(1);

    TARGET_COLUMNS.forEach(colId => {
      const container = document.getElementById(colId);
      if (!container) return;
      rows.forEach(row => container.appendChild(createStock(row)));
    });

    const single = document.getElementById('stocks');
    if (single) {
      rows.forEach(row => single.appendChild(createStock(row)));
    }

    restoreColumnOrder();
    enableColumnDrag();
    enableSorting();
    restoreSorting();
  });

/* ================================
   Stock Row
================================ */

function createStock(row) {
  const [name, code, price, change, rating] = row.split(',');

  const div = document.createElement('div');
  div.className = 'stock';

  div.innerHTML = `
    <div class="name">${name}</div>
    <div class="code">${code}</div>
    <div class="price">${price}</div>
    <div class="change">${change}</div>
    <div class="rating ${ratingClass(rating)}">${rating}</div>
  `;
  return div;
}

function ratingClass(r) {
  if (!r) return 'hold';
  if (r.includes('買')) return 'buy';
  if (r.includes('賣')) return 'sell';
  return 'hold';
}

/* ================================
   Column Drag
================================ */

function restoreColumnOrder() {
  const container = document.querySelector('.columns');
  if (!container) return;

  const saved = JSON.parse(localStorage.getItem(COLUMN_ORDER_KEY));
  if (!Array.isArray(saved)) return;

  saved.forEach(id => {
    const col = container.querySelector(`[data-col="${id}"]`);
    if (col) container.appendChild(col);
  });
}

function saveColumnOrder() {
  const container = document.querySelector('.columns');
  if (!container) return;

  const order = [...container.children].map(c => c.dataset.col);
  localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(order));
}

function enableColumnDrag() {
  const container = document.querySelector('.columns');
  if (!container) return;

  let dragging = null;

  container.querySelectorAll('.stock-header, .stock').forEach(el => {
    el.addEventListener('dragstart', e => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  container.querySelectorAll('.column').forEach(col => {
    const title = col.querySelector('h2');
    if (!title) return;

    title.draggable = true;

    title.addEventListener('dragstart', e => {
      dragging = col;
      col.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    title.addEventListener('dragend', () => {
      col.classList.remove('dragging');
      dragging = null;
      saveColumnOrder();
    });
  });

  container.addEventListener('dragover', e => {
    e.preventDefault();
    if (!dragging) return;

    const after = getAfterColumn(container, e.clientX);
    after ? container.insertBefore(dragging, after)
          : container.appendChild(dragging);
  });
}

function getAfterColumn(container, x) {
  const cols = [...container.querySelectorAll('.column:not(.dragging)')];
  return cols.reduce(
    (closest, col) => {
      const box = col.getBoundingClientRect();
      const offset = x - box.left - box.width / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: col };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

/* ================================
   Sorting (▲ ▼ + persist)
================================ */

function enableSorting() {
  const state = JSON.parse(localStorage.getItem(SORT_STATE_KEY)) || {};

  document.querySelectorAll('.stock-header div').forEach(header => {
    header.addEventListener('click', e => {
      e.stopPropagation();

      const key = header.dataset.key;
      const column = header.closest('.column');
      if (!column) return;

      const colId = column.dataset.col || 'single';
      const list =
        column.querySelector('[id^="col-"]') ||
        column.querySelector('#stocks');

      if (!list) return;

      const dir =
        state[colId]?.key === key && state[colId]?.dir === 'asc'
          ? 'desc'
          : 'asc';

      state[colId] = { key, dir };
      localStorage.setItem(SORT_STATE_KEY, JSON.stringify(state));

      applySort(column, list, key, dir);
      updateHeaderIcons(column, key, dir);
    });
  });
}

function restoreSorting() {
  const state = JSON.parse(localStorage.getItem(SORT_STATE_KEY));
  if (!state) return;

  document.querySelectorAll('.column').forEach(column => {
    const colId = column.dataset.col || 'single';
    const s = state[colId];
    if (!s) return;

    const list =
      column.querySelector('[id^="col-"]') ||
      column.querySelector('#stocks');

    if (!list) return;

    applySort(column, list, s.key, s.dir);
    updateHeaderIcons(column, s.key, s.dir);
  });
}

function applySort(column, list, key, dir) {
  const items = [...list.querySelectorAll('.stock')];

  items.sort((a, b) => {
    const va = getValue(a, key);
    const vb = getValue(b, key);

    if (typeof va === 'number') {
      return dir === 'asc' ? va - vb : vb - va;
    }
    return dir === 'asc'
      ? va.localeCompare(vb)
      : vb.localeCompare(va);
  });

  items.forEach(i => list.appendChild(i));
}

function updateHeaderIcons(column, key, dir) {
  column.querySelectorAll('.stock-header div').forEach(h => {
    const base = h.textContent.replace(/[▲▼]/g, '').trim();
    h.textContent = base;
    if (h.dataset.key === key) {
      h.textContent = base + (dir === 'asc' ? ' ▲' : ' ▼');
    }
  });
}

function getValue(stock, key) {
  const el = stock.querySelector(`.${key}`);
  if (!el) return '';

  let t = el.textContent.trim();
 if (key === 'price') {
  return parseFloat(
    t.replace('$', '')
     .replace(',', '')
     .trim()
  ) || 0;
}

if (key === 'change') {
  return parseFloat(
    t.replace('%', '')
     .replace('+', '')
     .trim()
  ) || 0;
}

