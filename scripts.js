const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQndjBqUVsGNWfRpgZzwiuoum6dRsQuIEvouN3D7za_DHgIl-X3nVrVs13VxA7MvIPIau32if2ntiAS/pub?gid=241210704&single=true&output=csv';

fetch(CSV_URL)
  .then(res => res.text())
  .then(csv => {
    const lines = csv.trim().split('\n');
    const tbody = document.getElementById('tableBody');

    tbody.innerHTML = '';

    // 假設 CSV 欄位：
    // 公司名,股票代碼,現價,升幅,評分,更新日期
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:bold;">${cols[0]}</td>
        <td>${cols[1]}</td>
        <td>${cols[2]}</td>
        <td>${formatRise(cols[3])}</td>
        <td>${cols[4]}</td>
      `;
      tbody.appendChild(tr);

      // 更新日期只取第一筆
      if (i === 1 && cols[5]) {
        document.getElementById('updateInfo').innerText =
          '更新：' + cols[5];
      }
    }

    initSorting();
  });

function formatRise(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  return (num * 100).toFixed(2) + '%';
}

/* === 表格排序（來自你原 scripts.html 行為） === */
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
      const A = a.children[colIndex].innerText;
      const B = b.children[colIndex].innerText;
      const numA = parseFloat(A.replace('%',''));
      const numB = parseFloat(B.replace('%',''));

      if (!isNaN(numA) && !isNaN(numB)) {
        return asc ? numA - numB : numB - numA;
      }
      return asc ? A.localeCompare(B) : B.localeCompare(A);
    });

    rows.forEach(row => tbody.appendChild(row));
  }
}
