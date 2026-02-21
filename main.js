import { EmotionWheel } from './js/wheel.js';

const canvas = document.getElementById("wheel");
const wheel = new EmotionWheel(canvas);

// ---------------------------------------------------------------------------
// 1. LIFECYCLE
// ---------------------------------------------------------------------------

function resize() {
  const container = document.getElementById("canvas-container");
  if (!container) return;
  wheel.resize(container.clientWidth, container.clientHeight);
  wheel.draw();
}

window.addEventListener("resize", resize);
resize();

// ---------------------------------------------------------------------------
// 2. INTERACTION
// ---------------------------------------------------------------------------

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const hit = wheel.hitTest(x, y);
  
  if (hit) {
    wheel.toggleSelection(hit);
    wheel.draw();
    updateSidebar();
  }
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  canvas.style.cursor = wheel.hitTest(x, y) ? "pointer" : "default";
});

// ---------------------------------------------------------------------------
// 3. UI UPDATES
// ---------------------------------------------------------------------------

function updateSidebar() {
  const list = document.getElementById("selected-list");
  list.innerHTML = "";

  const groups = wheel.getSelectedGroups();
  if (!groups) {
    list.innerHTML = '<li class="empty">Nenhuma emoção selecionada</li>';
    return;
  }

  for (const [sectorName, words] of Object.entries(groups)) {
    const header = document.createElement("li");
    header.className = "group-header";
    header.textContent = sectorName;
    list.appendChild(header);

    for (const w of words) {
      const li = document.createElement("li");
      li.textContent = w;
      list.appendChild(li);
    }
  }
}

// ---------------------------------------------------------------------------
// 4. BUTTONS
// ---------------------------------------------------------------------------

document.getElementById("btn-clear").addEventListener("click", () => {
  wheel.clearSelection();
  wheel.draw();
  updateSidebar();
});

document.getElementById("btn-copy").addEventListener("click", async () => {
  const groups = wheel.getSelectedGroups();
  if (!groups) return;

  const words = Object.values(groups).flat();
  try {
    await navigator.clipboard.writeText(words.join(", "));
    showToast("Lista copiada!");
  } catch (err) {
    console.error("Failed to copy!", err);
  }
});

document.getElementById("btn-export-png").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "emotion-wheel.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

document.getElementById("btn-export-pdf").addEventListener("click", () => {
  const dataUrl = canvas.toDataURL("image/png");
  const groups = wheel.getSelectedGroups();
  let listingHtml = "";

  if (groups) {
    listingHtml += '<div class="page-break"></div>';
    listingHtml += '<div class="listing-page">';
    listingHtml += '<h1>Emoções Selecionadas</h1>';
    for (const [sectorName, words] of Object.entries(groups)) {
      listingHtml += `<h2>${sectorName}</h2><ul>`;
      for (const w of words) listingHtml += `<li>${w}</li>`;
      listingHtml += '</ul>';
    }
    listingHtml += '</div>';
  }

  const win = window.open("");
  win.document.write(`
    <html>
    <head><title>Roda das Emoções – PDF</title>
    <style>
      @media print { .page-break { page-break-before: always; } }
      body { margin: 0; padding: 20px; font-family: sans-serif; color: #222; }
      .wheel-page { display: flex; justify-content: center; align-items: center; height: calc(100vh - 40px); }
      .wheel-page img { max-width: 100%; max-height: 100%; }
      .listing-page { padding: 40px 60px; }
      .listing-page h1 { font-size: 1.6rem; border-bottom: 2px solid #ddd; padding-bottom: 8px; }
      .listing-page h2 { font-size: 1.1rem; text-transform: uppercase; margin: 16px 0 6px; }
      .listing-page li { font-size: 0.95rem; }
    </style>
    </head>
    <body onload="window.print()">
      <div class="wheel-page"><img src="${dataUrl}" /></div>
      ${listingHtml}
    </body>
    </html>
  `);
  win.document.close();
});

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2000);
}
