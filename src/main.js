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

// Current language: prefer localStorage, then browser detection
let currentLang = localStorage.getItem('emotion-wheel-lang');
if (!currentLang || !LANGUAGES[currentLang]) currentLang = getBrowserLanguage();
langSelect.value = currentLang;
let langData = LANGUAGES[currentLang];

const wheel = new EmotionWheel(canvas, langData.sectors);

// ===========================================================================
//  VIEWPORT — re-render approach for crisp zoom (like SVG).
//  The canvas is always full-container resolution. Zoom/pan is applied via
//  ctx.translate + ctx.scale before every draw, so text is always sharp.
// ===========================================================================

let vpScale = 1;
let vpTx = 0;
let vpTy = 0;
const MIN_SCALE = 0.5;
const MAX_SCALE = 8;

function updateView() {
  wheel.setViewport(vpScale, vpTx, vpTy);
  wheel.draw();
}

function centerView() {
  const cw = container.clientWidth;
  const ch = container.clientHeight;
  const ws = wheel.worldSize;
  vpTx = (cw - ws * vpScale) / 2;
  vpTy = (ch - ws * vpScale) / 2;
}

function resetView() {
  vpScale = 1;
  centerView();
  updateView();
}

// Zoom toward a screen point (sx, sy) in container-space
function zoomAt(sx, sy, newScale) {
  newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
  const worldX = (sx - vpTx) / vpScale;
  const worldY = (sy - vpTy) / vpScale;
  vpTx = sx - worldX * newScale;
  vpTy = sy - worldY * newScale;
  vpScale = newScale;
  updateView();
}

// Convert client coords → world coords (for hitTest)
function clientToWorld(clientX, clientY) {
  const rect = container.getBoundingClientRect();
  const sx = clientX - rect.left;
  const sy = clientY - rect.top;
  return {
    x: (sx - vpTx) / vpScale,
    y: (sy - vpTy) / vpScale
  };
}

// ---------------------------------------------------------------------------
// LIFECYCLE
// ---------------------------------------------------------------------------

function resize() {
  if (!container) return;
  const w = container.clientWidth;
  const h = container.clientHeight;
  wheel.resize(w, h);
  resetView();
}

window.addEventListener("resize", resize);
resize();
updateLocalization();

// ===========================================================================
//  POINTER EVENTS — unified mouse + touch (drag to pan, pinch to zoom)
// ===========================================================================

const pointers = new Map();
let dragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartTx = 0;
let dragStartTy = 0;
let didDrag = false;
let pinchPrevDist = 0;
let pinchPrevCx = 0;
let pinchPrevCy = 0;

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
    dragStartTx = vpTx;
    dragStartTy = vpTy;
  } else if (pointers.size === 2) {
    dragging = false;
    const pts = [...pointers.values()];
    pinchPrevDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    const rect = container.getBoundingClientRect();
    pinchPrevCx = (pts[0].x + pts[1].x) / 2 - rect.left;
    pinchPrevCy = (pts[0].y + pts[1].y) / 2 - rect.top;
  }
});

container.addEventListener("pointermove", (e) => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (pointers.size === 2) {
    // Pinch zoom + pan
    const pts = [...pointers.values()];
    const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    const rect = container.getBoundingClientRect();
    const cx = (pts[0].x + pts[1].x) / 2 - rect.left;
    const cy = (pts[0].y + pts[1].y) / 2 - rect.top;

    // Pan: follow midpoint movement
    vpTx += cx - pinchPrevCx;
    vpTy += cy - pinchPrevCy;

    // Zoom: scale around current midpoint
    const ratio = dist / pinchPrevDist;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, vpScale * ratio));
    const worldX = (cx - vpTx) / vpScale;
    const worldY = (cy - vpTy) / vpScale;
    vpTx = cx - worldX * newScale;
    vpTy = cy - worldY * newScale;
    vpScale = newScale;

    pinchPrevDist = dist;
    pinchPrevCx = cx;
    pinchPrevCy = cy;
    updateView();
    didDrag = true;
  } else if (pointers.size === 1 && dragging) {
    // Pan (drag)
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag = true;
    vpTx = dragStartTx + dx;
    vpTy = dragStartTy + dy;
    updateView();
  }
});

container.addEventListener("pointerup", (e) => {
  const wasInPointers = pointers.has(e.pointerId);
  pointers.delete(e.pointerId);

  if (wasInPointers && pointers.size === 0 && !didDrag) {
    const { x, y } = clientToWorld(e.clientX, e.clientY);
    handleTap(x, y);
  }

  if (pointers.size === 1) {
    const p = [...pointers.values()][0];
    dragging = true;
    dragStartX = p.x;
    dragStartY = p.y;
    dragStartTx = vpTx;
    dragStartTy = vpTy;
  }

  if (pointers.size === 0) dragging = false;
});

container.addEventListener("pointercancel", (e) => {
  pointers.delete(e.pointerId);
  if (pointers.size === 0) dragging = false;
});

// Scroll = pan | Ctrl/Meta + scroll (or trackpad pinch) = zoom
container.addEventListener("wheel", (e) => {
  e.preventDefault();
  const rect = container.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;

  if (e.ctrlKey || e.metaKey) {
    // Zoom (Ctrl+scroll wheel, or trackpad pinch which fires as ctrlKey)
    const factor = Math.pow(1.003, -e.deltaY);
    zoomAt(sx, sy, vpScale * factor);
  } else {
    // Pan (regular scroll / trackpad two-finger swipe)
    vpTx -= e.deltaX;
    vpTy -= e.deltaY;
    updateView();
  }
}, { passive: false });

// ---------------------------------------------------------------------------
// ZOOM BUTTONS
// ---------------------------------------------------------------------------

document.getElementById("btn-zoom-in").addEventListener("click", () => {
  const rect = container.getBoundingClientRect();
  zoomAt(rect.width / 2, rect.height / 2, vpScale * 1.4);
});

document.getElementById("btn-zoom-out").addEventListener("click", () => {
  const rect = container.getBoundingClientRect();
  zoomAt(rect.width / 2, rect.height / 2, vpScale / 1.4);
});

document.getElementById("btn-zoom-reset").addEventListener("click", resetView);

// ---------------------------------------------------------------------------
// TAP / CLICK HANDLING
// ---------------------------------------------------------------------------

function handleTap(x, y) {
  const hit = wheel.hitTest(x, y);
  if (hit) {
    wheel.toggleSelection(hit);
    wheel.draw();
    updateSidebar();

    const sector = langData.sectors[hit.sectorIdx];
    const word = sector.rings[hit.ringIdx][hit.wordIdx];
    logEvent(analytics, 'select_item', {
      item_list_name: 'emotion_wheel',
      items: [{ item_name: word, item_category: sector.name, item_variant: currentLang }]
    });
  }
}

// Mouse hover cursor
canvas.addEventListener("mousemove", (e) => {
  if (pointers.size > 0) return;
  const { x, y } = clientToWorld(e.clientX, e.clientY);
  canvas.style.cursor = wheel.hitTest(x, y) ? "pointer" : "grab";
});

// ---------------------------------------------------------------------------
// 7. LANGUAGE
// ---------------------------------------------------------------------------

langSelect.addEventListener("change", (e) => {
  currentLang = e.target.value;
  langData = LANGUAGES[currentLang];
  localStorage.setItem('emotion-wheel-lang', currentLang);
  
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
  
  const dataUrl = wheel.exportDataURL();
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
  
  const dataUrl = wheel.exportDataURL();
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
