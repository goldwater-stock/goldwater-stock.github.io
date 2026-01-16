const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQndjBqUVsGNWfRpgZzwiuoum6dRsQuIEvouN3D7za_DHgIl-X3nVrVs13VxA7MvIPIau32if2ntiAS/pub?gid=241210704&single=true&output=csv';

// index.html 用的欄位
const TARGET_COLUMNS = [
  'col-finance',
  'col-property',
  'col-tech',
  'col-consumer'
];

// 讀取 CSV
fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = text.trim().split('\n').slice(1); // 跳過 header

    // index.html（多欄）
    TARGET_COLUMNS.forEach(colId => {
      const container = document.getElementById(colId);
      if (!container) return;

      renderRows(container, rows);
    });

    // finance.html（單欄）
    const single = document.getElementById('stocks');
    if (single) {
      renderRows(single, rows);
    }
  });

// 共用渲染函數
function renderRows(container, rows) {
  rows.forEach(row => {
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

    container.appendChild(div);
  });
}

function ratingClass(r) {
  if (!r) return 'hold';
  if (r.includes('買')) return 'buy';
  if (r.includes('賣')) return 'sell';
  return 'hold';
}




