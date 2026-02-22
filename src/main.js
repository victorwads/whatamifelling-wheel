import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
import { EmotionWheel } from './js/wheel.js';
import { LANGUAGES } from './js/data.js';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCREHXxyytzQfisgP3c2syZwgHtJLxCfD4",
  authDomain: "whatamifelling.firebaseapp.com",
  projectId: "whatamifelling",
  storageBucket: "whatamifelling.firebasestorage.app",
  messagingSenderId: "591867024928",
  appId: "1:591867024928:web:cde827caa412c6f6368e45",
  measurementId: "G-GW7XVYLDKX"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const canvas = document.getElementById("wheel");
const container = document.getElementById("canvas-container");
const langSelect = document.getElementById("lang-select");

// Detect browser language
function getBrowserLanguage() {
  const userLangs = navigator.languages || [navigator.language || navigator.userLanguage];
  for (let lang of userLangs) {
    if (!lang) continue;
    const shortLang = lang.split('-')[0].toLowerCase();
    if (LANGUAGES[shortLang]) return shortLang;
  }
  return "pt";
}

// Current language state
let currentLang = getBrowserLanguage();
langSelect.value = currentLang;
let langData = LANGUAGES[currentLang];

const wheel = new EmotionWheel(canvas, langData.sectors);

// ===========================================================================
//  ZOOM & PAN — simple approach using CSS transform on the canvas.
//  State: scale, tx, ty  →  canvas.style.transform = matrix(scale,0,0,scale,tx,ty)
//  The canvas is rendered once at full resolution; zoom just scales the element.
// ===========================================================================

let vScale = 1;   // current visual scale
let tx = 0;        // translation X (px, in container space)
let ty = 0;        // translation Y (px, in container space)
const MIN_SCALE = 0.8;
const MAX_SCALE = 6;

// CSS width/height of the canvas (set in resize)
let cssW = 0;
let cssH = 0;

function applyTransform() {
  // transform-origin is center center (default). We use matrix to combine.
  // With transform-origin center: translate moves relative to the center of the element.
  // Simpler: use transform-origin:0 0 and compute manually.
  canvas.style.transformOrigin = "0 0";
  canvas.style.transform = `matrix(${vScale},0,0,${vScale},${tx},${ty})`;
}

function resetZoom() {
  vScale = 1;
  tx = 0;
  ty = 0;
  centerCanvas();
  applyTransform();
}

function centerCanvas() {
  const cw = container.clientWidth;
  const ch = container.clientHeight;
  tx = (cw - cssW * vScale) / 2;
  ty = (ch - cssH * vScale) / 2;
}

// Zoom toward a point (px, py) in container-space
function zoomAt(px, py, newScale) {
  newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
  // The point (px, py) in container maps to canvas coords:
  //   canvasX = (px - tx) / vScale
  // After zoom, we want the same canvasX to map back to px:
  //   px = canvasX * newScale + newTx   →   newTx = px - canvasX * newScale
  const canvasX = (px - tx) / vScale;
  const canvasY = (py - ty) / vScale;
  tx = px - canvasX * newScale;
  ty = py - canvasY * newScale;
  vScale = newScale;
  applyTransform();
}

// Convert a point in page/client coords to canvas logical coords (for hitTest)
function clientToCanvas(clientX, clientY) {
  const rect = container.getBoundingClientRect();
  const px = clientX - rect.left;
  const py = clientY - rect.top;
  const canvasX = (px - tx) / vScale;
  const canvasY = (py - ty) / vScale;
  return { x: canvasX, y: canvasY };
}

// ---------------------------------------------------------------------------
// LIFECYCLE
// ---------------------------------------------------------------------------

function resize() {
  if (!container) return;
  const w = container.clientWidth;
  const h = container.clientHeight;
  const size = Math.min(w, h);
  cssW = size;
  cssH = size;
  wheel.resize(size, size);
  wheel.draw();
  resetZoom();
}

window.addEventListener("resize", resize);
resize();
updateLocalization();

// ===========================================================================
//  POINTER EVENTS — unified mouse + touch handling
// ===========================================================================

// We track active pointers for pinch and drag
const pointers = new Map();  // pointerId → { x, y }
let dragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartTx = 0;
let dragStartTy = 0;
let didDrag = false;       // did the pointer move enough to count as a drag?
let pinchStartDist = 0;
let pinchStartScale = 1;

container.addEventListener("pointerdown", (e) => {
  if (e.target.closest("#zoom-controls")) return;
  e.preventDefault();
  container.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (pointers.size === 1) {
    dragging = true;
    didDrag = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartTx = tx;
    dragStartTy = ty;
  } else if (pointers.size === 2) {
    dragging = false;
    const pts = [...pointers.values()];
    pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    pinchStartScale = vScale;
  }
});

container.addEventListener("pointermove", (e) => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (pointers.size === 2) {
    // Pinch zoom
    const pts = [...pointers.values()];
    const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    const newScale = pinchStartScale * (dist / pinchStartDist);
    const rect = container.getBoundingClientRect();
    const cx = (pts[0].x + pts[1].x) / 2 - rect.left;
    const cy = (pts[0].y + pts[1].y) / 2 - rect.top;
    zoomAt(cx, cy, newScale);
    didDrag = true;
  } else if (pointers.size === 1 && dragging) {
    // Pan (drag)
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag = true;
    tx = dragStartTx + dx;
    ty = dragStartTy + dy;
    applyTransform();
  }
});

container.addEventListener("pointerup", (e) => {
  const wasInPointers = pointers.has(e.pointerId);
  pointers.delete(e.pointerId);

  if (wasInPointers && pointers.size === 0 && !didDrag) {
    // It was a tap / click — handle emotion selection
    const { x, y } = clientToCanvas(e.clientX, e.clientY);
    handleTap(x, y);
  }

  // If going from 2→1 pointers, reset drag anchor to the remaining pointer
  if (pointers.size === 1) {
    const p = [...pointers.values()][0];
    dragging = true;
    dragStartX = p.x;
    dragStartY = p.y;
    dragStartTx = tx;
    dragStartTy = ty;
  }

  if (pointers.size === 0) {
    dragging = false;
  }
});

container.addEventListener("pointercancel", (e) => {
  pointers.delete(e.pointerId);
  if (pointers.size === 0) dragging = false;
});

// Mouse wheel zoom (desktop)
container.addEventListener("wheel", (e) => {
  e.preventDefault();
  const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
  const rect = container.getBoundingClientRect();
  const px = e.clientX - rect.left;
  const py = e.clientY - rect.top;
  zoomAt(px, py, vScale * factor);
}, { passive: false });

// ---------------------------------------------------------------------------
// ZOOM BUTTONS
// ---------------------------------------------------------------------------

document.getElementById("btn-zoom-in").addEventListener("click", () => {
  const rect = container.getBoundingClientRect();
  zoomAt(rect.width / 2, rect.height / 2, vScale * 1.4);
});

document.getElementById("btn-zoom-out").addEventListener("click", () => {
  const rect = container.getBoundingClientRect();
  zoomAt(rect.width / 2, rect.height / 2, vScale / 1.4);
});

document.getElementById("btn-zoom-reset").addEventListener("click", resetZoom);

// ---------------------------------------------------------------------------
// TAP / CLICK HANDLING
// ---------------------------------------------------------------------------

function handleTap(x, y) {
  const hit = wheel.hitTest(x, y);
  if (hit) {
    wheel.toggleSelection(hit);
    wheel.draw();
    updateSidebar();

    // Analytics: log which emotion was clicked
    const sector = langData.sectors[hit.sectorIdx];
    const word = sector.rings[hit.ringIdx][hit.wordIdx];
    logEvent(analytics, 'select_item', {
      item_list_name: 'emotion_wheel',
      items: [{ item_name: word, item_category: sector.name, item_variant: currentLang }]
    });
  }
}

// Mouse hover cursor (desktop only, doesn't interfere with pointer events)
canvas.addEventListener("mousemove", (e) => {
  if (pointers.size > 0) return;
  const { x, y } = clientToCanvas(e.clientX, e.clientY);
  canvas.style.cursor = wheel.hitTest(x, y) ? "pointer" : "grab";
});

// ---------------------------------------------------------------------------
// 7. LANGUAGE
// ---------------------------------------------------------------------------

langSelect.addEventListener("change", (e) => {
  currentLang = e.target.value;
  langData = LANGUAGES[currentLang];
  
  logEvent(analytics, 'select_content', { content_type: 'language', item_id: currentLang });
  
  // Update wheel data and redraw
  wheel.setSectors(langData.sectors);
  wheel.draw();
  
  updateLocalization();
  updateSidebar();
});

// ---------------------------------------------------------------------------
// 8. UI UPDATES & LOCALIZATION
// ---------------------------------------------------------------------------

function updateLocalization() {
  const ui = langData.ui;
  document.getElementById("ui-sidebar-title").textContent = ui.sidebarTitle;
  document.getElementById("btn-clear").textContent = ui.btnClear;
  document.getElementById("btn-copy").textContent = ui.btnCopy;
  document.getElementById("btn-export-png").textContent = ui.btnExportPng;
  document.getElementById("btn-export-pdf").textContent = ui.btnExportPdf;
}

function updateSidebar() {
  const list = document.getElementById("selected-list");
  list.innerHTML = "";

  const groups = wheel.getSelectedGroups();
  if (!groups) {
    list.innerHTML = `<li class="empty">${langData.ui.emptySelection}</li>`;
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
// 9. BUTTONS
// ---------------------------------------------------------------------------

document.getElementById("btn-clear").addEventListener("click", () => {
  wheel.clearSelection();
  wheel.draw();
  updateSidebar();
});

document.getElementById("btn-copy").addEventListener("click", async () => {
  const groups = wheel.getSelectedGroups();
  if (!groups) return;

  const words = Object.values(groups).flat().join(", ");
  logEvent(analytics, 'share', { method: 'copy', content_type: 'text' });

  if (navigator.share) {
    try {
      await navigator.share({
        title: langData.ui.sidebarTitle,
        text: words
      });
      return;
    } catch (err) {
      if (err.name !== 'AbortError') console.error("Share failed:", err);
    }
  }

  try {
    await navigator.clipboard.writeText(words);
    showToast(langData.ui.toastCopied);
  } catch (err) {
    console.error("Failed to copy!", err);
  }
});

document.getElementById("btn-export-png").addEventListener("click", async () => {
  logEvent(analytics, 'share', { method: 'png', content_type: 'image' });
  
  const dataUrl = canvas.toDataURL("image/png");
  const filename = `emotion-wheel-${currentLang}.png`;

  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], filename, { type: "image/png" });
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: langData.ui.pdfTitle || 'Emotion Wheel',
        files: [file]
      });
    } else {
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
    }
  } catch (err) {
    if (err.name !== 'AbortError') console.error("Error sharing PNG:", err);
  }
});

document.getElementById("btn-export-pdf").addEventListener("click", () => {
  logEvent(analytics, 'share', { method: 'pdf', content_type: 'document' });
  
  const dataUrl = canvas.toDataURL("image/png");
  const groups = wheel.getSelectedGroups();
  const ui = langData.ui;
  let listingHtml = "";

  if (groups) {
    listingHtml += '<div class="page-break"></div>';
    listingHtml += '<div class="listing-page">';
    listingHtml += `<h1>${ui.pdfListTitle}</h1>`;
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
    <head><title>${ui.pdfTitle}</title>
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
