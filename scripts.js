const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQndjBqUVsGNWfRpgZzwiuoum6dRsQuIEvouN3D7za_DHgIl-X3nVrVs13VxA7MvIPIau32if2ntiAS/pub?gid=241210704&single=true&output=csv';

fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    const lines = text
      .trim()
      .split('\n')
      .map(l => l.replace(/\r/g, ''));

    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    for (let i = 1; i < lines.length; i++) {
      // 先用逗號切，再把空欄位保留
      let cols = lines[i].split(',');

      // 移除完全空白的欄位（關鍵）
      cols = cols.filter(c => c !== '');

      // 現在 cols 應該是：
      // [公司名, 代碼, 價格, 升幅, 評分]
      const company = cols[0] || '';
      const code    = cols[1] || '';
      const price   = cols[2] || '';
      const rise    = cols[3] || '';
      const rating  = cols[4] || '';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:bold; font-size:1.05em;">${company}</td>
        <td>${code}</td>
        <td>${price}</td>
        <td>${rise}</td>
        <td>${formatRating(rating)}</td>
      `;
      tbody.appendChild(tr);
    }

    initSorting();
  })
  .catch(err => {
    document.getElementById('tableBody').innerHTML =
      '<tr><td colspan="5">資料載入失敗</td></tr>';
  });

function formatRating(text) {
  if (text === '買入') return '<span style="color:#1a7f37;font-weight:bold;">買入</span>';
  if (text === '賣出') return '<span style="color:#cf222e;font-weight:bold;">賣出</span>';
  if (text === '持有') return '<span style="color:#666;font-weight:bold;">持有</span>';
  return text;
}

function initSorting() {
  const table = document.getElementById('sortableTable');
  const headers = table.querySelectorAll('th');
  let dir = {};

  headers.forEach((th, i) => {
    th.addEventListener('click', () => sort(i));
  });

  function sort(col) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const asc = !dir[col];
    dir[col] = asc;

    rows.sort((a, b) => {
      let A = a.children[col].innerText.replace('%', '');
      let B = b.children[col].innerText.replace('%', '');
      const nA = parseFloat(A);
      const nB = parseFloat(B);

      if (!isNaN(nA) && !isNaN(nB)) {
        return asc ? nA - nB : nB - nA;
      }
      return asc
        ? A.localeCompare(B, 'zh-HK')
        : B.localeCompare(A, 'zh-HK');
    });

    rows.forEach(r => tbody.appendChild(r));
  }
}
