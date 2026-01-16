const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQndjBqUVsGNWfRpgZzwiuoum6dRsQuIEvouN3D7za_DHgIl-X3nVrVs13VxA7MvIPIau32if2ntiAS/pub?gid=241210704&single=true&output=csv';

fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = text.trim().split('\n').slice(1); // skip header
    const container = document.getElementById('stocks');

    rows.forEach(row => {
      const [name, code, price, change, rating] = row.split(',');

      const div = document.createElement('div');
      div.className = 'stock';

      div.innerHTML = `
        <div class="name">${name}</div>
        <div class="price">${price}</div>
        <div class="rating ${ratingClass(rating)}">${rating}</div>
      `;

      container.appendChild(div);
    });
  });

function ratingClass(r) {
  if (r.includes('買')) return 'buy';
  if (r.includes('賣')) return 'sell';
  return 'hold';
}

