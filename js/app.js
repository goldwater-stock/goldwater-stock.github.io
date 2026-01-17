const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQndjBqUVsGNWfRpgZzwiuoum6dRsQuIEvouN3D7za_DHgIl-X3nVrVs13VxA7MvIPIau32if2ntiAS/pub?gid=241210704&single=true&output=csv';

fetch(CSV_URL)
  .then(r => r.text())
  .then(text => {
    const rows = text.trim().split('\n').slice(1);
    const container = document.getElementById('col-finance');

    rows.forEach(r => container.appendChild(createStock(r)));
    enableSorting();
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
  if (r.includes('買')) return 'buy';
  if (r.includes('賣')) return 'sell';
  return 'hold';
}

/* ===== Sorting ===== */

function enableSorting() {
  document.querySelectorAll('.stock-header div').forEach(header => {
    const key = header.dataset.key;
    if (!key) return;

    header.addEventListener('click', () => {
      const column = header.closest('.column');
      const list = column.querySelector('[id^="col-"]');
      if (!list) return;

      // 讀取目前排序狀態
      const currentDir = header.dataset.dir === 'asc' ? 'asc' : 'desc';
      const nextDir = currentDir === 'asc' ? 'desc' : 'asc';

      // 重置同一個 header row 的其他 icon
      column.querySelectorAll('.stock-header div').forEach(h => {
        h.dataset.dir = '';
        h.textContent = h.textContent.replace(/[▲▼]/g, '').trim();
      });

      const items = [...list.querySelectorAll('.stock')];

      items.sort((a, b) => {
        const va = getValue(a, key);
        const vb = getValue(b, key);

        if (typeof va === 'number' && typeof vb === 'number') {
          return nextDir === 'asc' ? va - vb : vb - va;
        }
        return nextDir === 'asc'
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va));
      });

      // 更新 icon 與狀態
      header.dataset.dir = nextDir;
      header.textContent += nextDir === 'asc' ? ' ▲' : ' ▼';

      items.forEach(i => list.appendChild(i));
    });
  });
}


function updateHeaderIcon(header, asc) {
  document.querySelectorAll('.stock-header div').forEach(h => {
    h.textContent = h.textContent.replace(/[▲▼]/g, '').trim();
  });

  header.textContent += asc ? ' ▲' : ' ▼';
}

function getValue(stock, key) {
  const el = stock.querySelector(`.${key}`);
  if (!el) return '';

  let t = el.textContent.trim();

  if (key === 'price' || key === 'change') {
    return parseFloat(
      t.replace(/[%$,]/g, '').replace('+', '')
    ) || 0;
  }

  return t;
}
