const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQndjBqUVsGNWfRpgZzwiuoum6dRsQuIEvouN3D7za_DHgIl-X3nVrVs13VxA7MvIPIau32if2ntiAS/pub?gid=241210704&single=true&output=csv';

fetch(CSV_URL)
  .then(res => res.text())
  .then(csv => {
    const lines = csv.trim().split('\n');
    const tbody = document.getElementById('tableBody');

    tbody.innerHTML = '';

    for (let i = 1; i < lines.length; i++) {
      // 關鍵修正：支援 Tab / 逗號
      const cols = lines[i].split(/\t|,/);

      const company = cols[0] || '';
      const code    = cols[1] || '';
      const price   = cols[2] || '';
      const rise    = cols[3] || '';
      const rating  = cols[4] || '';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:bold;">${company}</td>
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
  let color = '#333';
  if (text === '買入') color = '#1a7f37';
  if (text === '賣出') color = '#cf222e';
  if (text === '持有') color = '#666';

  return `<span style="color:${color}; font-weight:bold;">${text}</span>`;
}

function initSorting() {
  const table = document.getElementById('sortableTable');
  const headers = table.querySelectorAll('th');
  let sortDirection = {};

  headers.forEach((header, index) => {
    header.addEventListener('click', () => {
      sortTable(index);
    });
  });

  function sortTable(colIndex) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const asc = !sortDirection[colIndex];
    sortDirection[colIndex] = asc;

    rows.sort((a, b) => {
      let A = a.children[colIndex].innerText.replace('%', '');
      let B = b.children[colIndex].innerText.replace('%', '');

      const numA = parseFloat(A);
      const numB = parseFloat(B);

      if (!isNaN(numA) && !isNaN(numB)) {
        return asc ? numA - numB : numB - nu
