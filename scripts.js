const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQndjBqUVsGNWfRpgZzwiuoum6dRsQuIEvouN3D7za_DHgIl-X3nVrVs13VxA7MvIPIau32if2ntiAS/pub?gid=241210704&single=true&output=csv';

fetch(CSV_URL)
  .then(res => res.text())
  .then(csv => {
    const lines = csv.trim().split('\n');
    const tbody = document.getElementById('tableBody');

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const code = cols[0];
      const price = cols[1];
      const rating = cols[2];

      let cls = '';
      if (rating === 'BUY') cls = 'buy';
      else if (rating === 'SELL') cls = 'sell';
      else if (rating === 'HOLD') cls = 'hold';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:bold;">${code}</td>
        <td>${price}</td>
        <td class="${cls}">${rating}</td>
      `;
      tbody.appendChild(tr);
    }
  })
  .catch(err => {
    document.getElementById('tableBody').innerHTML =
      '<tr><td colspan="3">資料載入失敗</td></tr>';
  });
