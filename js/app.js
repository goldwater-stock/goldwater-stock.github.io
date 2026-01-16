const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQndjBqUVsGNWfRpgZzwiuoum6dRsQuIEvouN3D7za_DHgIl-X3nVrVs13VxA7MvIPIau32if2ntiAS/pub?gid=241210704&single=true&output=csv';

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/你的ID/pub?gid=241210704&single=true&output=csv';

const TARGET_COLUMNS = [
  'col-finance',
  'col-property',
  'col-tech',
  'col-consumer'
];

fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = text.trim().split('\n').slice(1);

    TARGET_COLUMNS.forEach(colId => {
      const container = document.getElementById(colId);
      if (!container) return;

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
    });

    enableColumnDrag();
  });

function ratingClass(r) {
  if (!r) return 'hold';
  if (r.includes('買')) return 'buy';
  if (r.includes('賣')) return 'sell';
  return 'hold';
}

/* =========================
   Column Drag & Reorder
   ========================= */

function enableColumnDrag() {
  const container = document.querySelector('.columns');
  if (!container) return;

  let dragging = null;

  container.querySelectorAll('.column').forEach(col => {
    col.draggable = true;

    col.addEventListener('dragstart', e => {
      dragging = col;
      col.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    col.addEventListener('dragend', () => {
      dragging = null;
      col.classList.remove('dragging');
    });
  });

  container.addEventListener('dragover', e => {
    e.preventDefault();
    const after = getAfterColumn(container, e.clientX);
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
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}



