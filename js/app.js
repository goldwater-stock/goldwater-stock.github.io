const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQndjBqUVsGNWfRpgZzwiuoum6dRsQuIEvouN3D7za_DHgIl-X3nVrVs13VxA7MvIPIau32if2ntiAS/pub?gid=241210704&single=true&output=csv';

const TARGET_COLUMNS = [
  'col-finance',
  'col-property',
  'col-tech',
  'col-consumer'
];

const STORAGE_KEY = 'columnOrder';

fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = text.trim().split('\n').slice(1);

    TARGET_COLUMNS.forEach(colId => {
      const container = document.getElementById(colId);
      if (!container) return;

      rows.forEach(row => {
        container.appendChild(createStock(row));
      });
    });

    const single = document.getElementById('stocks');
    if (single) {
      rows.forEach(row => {
        single.appendChild(createStock(row));
      });
    }

    restoreColumnOrder();
    enableColumnDrag();
  });

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

/* ===== Column order ===== */

function restoreColumnOrder() {
  const container = document.querySelector('.columns');
  if (!container) return;

  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (!Array.isArray(saved)) return;

  saved.forEach(id => {
    const col = container.querySelector(`[data-col="${id}"]`);
    if (col) container.appendChild(col);
  });
}

function saveColumnOrder() {
  const container = document.querySelector('.columns');
  const order = [...container.children].map(col => col.dataset.col);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
}

/* ===== Drag only by title ===== */

function enableColumnDrag() {
  const container = document.querySelector('.columns');
  if (!container) return;

  let dragging = null;

  container.querySelectorAll('.column').forEach(col => {
    col.draggable = false; // ⭐ column 本身不能拖

    const title = col.querySelector('h2');
    if (!title) return;

    title.draggable = true; // ⭐ 只有標題能拖
    title.style.cursor = 'grab';

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
    const after = getAfterColumn(container, e.clientX);
    if (!dragging) return;

    if (!after) {
      container.appendChild(dragging);
    } else {
      container.insertBefore(dragging, after);
    }
  });
}

function getAfterColumn(container, x) {
  const columns = [...container.querySelectorAll('.column:not(.dragging)')];

  return columns.reduce(
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

const sortState = {};

document.querySelectorAll('.stock-header div').forEach(header => {
  header.addEventListener('click', () => {
    const key = header.dataset.key;
    const column = header.closest('.column');
    const list = column.querySelector('[id^="col-"], #stocks');
    if (!list) return;

    const stocks = [...list.querySelectorAll('.stock')];

    const dir = sortState[key] === 'asc' ? 'desc' : 'asc';
    sortState[key] = dir;

    stocks.sort((a, b) => {
      const va = getValue(a, key);
      const vb = getValue(b, key);

      if (typeof va === 'number') {
        return dir === 'asc' ? va - vb : vb - va;
      }
      return dir === 'asc'
        ? va.localeCompare(vb)
        : vb.localeCompare(va);
    });

    stocks.forEach(s => list.appendChild(s));
  });
});

function getValue(stock, key) {
  const el = stock.querySelector(`.${key}`);
  if (!el) return '';

  const text = el.textContent.trim();

  if (key === 'price' || key === 'change') {
    return parseFloat(text.replace('%', '').replace('+', '')) || 0;
  }

  return text;
}
