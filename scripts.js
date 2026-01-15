const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQndjBqUVsGNWfRpgZzwiuoum6dRsQuIEvouN3D7za_DHgIl-X3nVrVs13VxA7MvIPIau32if2ntiAS/pub?gid=241210704&single=true&output=csv';

fetch(CSV_URL)
  .then(res => res.text())
  .then(csv => {
    const lines = csv.trim().split('\n');
    const tbody = document.getElementById('tableBody');

    tbody.innerHTML = '';

    // 從第 2 行開始（跳過 header）
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');

      // 欄位對齊你的實際資料
      const company = cols[0];
      const code = cols[1];
      const price = cols[2];
      const rise = cols[3];     // 已經是 1.6%
      const rating = cols[4];   // 中文：買入 / 持有 / 賣出

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
  .catch(() => {
    document.getElementById('tableBody').innerHTML =
      '<tr><td colspan="5">資料載入失敗</td></tr>';
  });

/* === 評分顯示（對齊你原本的語意） === */
function formatRating(text) {
  let color = '#333';

  if (text === '買入') color = '#1a7f37';
  if (text === '賣出') color = '#cf222e';
  if (text === '持有') color = '#666';

  return `<span style="color:${color}; font-weight:b
