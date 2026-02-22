import { EmotionWheel } from './js/wheel.js';
import { LANGUAGES } from './js/data.js';
import { generatePNG, generatePDFHtml, formatAsMarkdownList, shareFile, downloadBlob, isMobile } from './js/export.js';
import {
  setLanguageProperty, trackLanguageChange, trackEmotionClick,
  trackClearSelection, trackCopyEmotions, trackExportMenuOpen,
  trackExportPNG, trackExportPDF, trackSidebarToggle
} from './js/analytics.js';

// English data for standardized analytics labels
const enSectors = LANGUAGES.en.sectors;

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
setLanguageProperty(currentLang);

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
  const cw = container.clientWidth;
  const ch = container.clientHeight;
  const ws = wheel.worldSize;
  // Fit the wheel to the screen
  vpScale = Math.min(cw, ch) / ws;
  vpTx = (cw - ws * vpScale) / 2;
  vpTy = (ch - ws * vpScale) / 2;
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
  if (e.target.closest("#zoom-controls") || e.target.closest("#floating-top") || e.target.closest("#export-menu")) return;
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
    // Use English names for analytics standardization
    const enSector = enSectors[hit.sectorIdx];
    const enWord = enSector.rings[hit.ringIdx][hit.wordIdx];
    const enCategory = enSector.name;
    trackEmotionClick(enWord, enCategory, hit.ringIdx, currentLang);
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
  
  trackLanguageChange(currentLang);
  setLanguageProperty(currentLang);
  
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
  document.getElementById("ui-app-title").textContent = ui.appTitle;
  document.getElementById("ui-app-description").textContent = ui.appDescription;
  document.getElementById("ui-sidebar-title").textContent = ui.sidebarTitle;
  document.getElementById("btn-export-png").innerHTML = '<i class="fa-solid fa-image"></i> ' + ui.btnExportPng;
  document.getElementById("btn-export-pdf").innerHTML = '<i class="fa-solid fa-file-pdf"></i> ' + ui.btnExportPdf;
  document.getElementById("btn-clear").title = ui.btnClear;
  document.getElementById("btn-copy").title = ui.btnCopy;
  document.getElementById("btn-export").title = ui.btnShare || 'Export';
  document.title = ui.appTitle;
}

function updateSidebar() {
  const list = document.getElementById("selected-list");
  list.innerHTML = "";

  const groups = wheel.getSelectedGroups();
  if (!groups) {
    list.innerHTML = `<li class="empty">${langData.ui.emptySelection}</li>`;
    return;
  }

  // Calculate totals for percentage bar
  const totalSelected = Object.values(groups).reduce((sum, g) => sum + g.words.length, 0);

  // Percentage bar
  const barLi = document.createElement("li");
  barLi.className = "percentage-bar-wrapper";
  const bar = document.createElement("div");
  bar.className = "percentage-bar";
  for (const [, { sectorIdx, words }] of Object.entries(groups)) {
    const pct = (words.length / totalSelected) * 100;
    const seg = document.createElement("div");
    const [r, g, b] = langData.sectors[sectorIdx].baseColor;
    seg.style.width = pct + "%";
    seg.style.background = `rgb(${r},${g},${b})`;
    bar.appendChild(seg);
  }
  barLi.appendChild(bar);
  list.appendChild(barLi);

  for (const [sectorName, { sectorIdx, words }] of Object.entries(groups)) {
    const pct = Math.round((words.length / totalSelected) * 100);
    const header = document.createElement("li");
    header.className = "group-header";
    header.textContent = `${sectorName} (${pct}%)`;
    list.appendChild(header);

    for (const w of words) {
      const li = document.createElement("li");
      li.textContent = w;
      list.appendChild(li);
    }
  }
}

// ---------------------------------------------------------------------------
// 9. BUTTONS — Clear, Copy, Export
// ---------------------------------------------------------------------------

// Clear selection
document.getElementById("btn-clear").addEventListener("click", () => {
  trackClearSelection();
  wheel.clearSelection();
  wheel.draw();
  updateSidebar();
});

// Copy as markdown list (clipboard only, no share API)
document.getElementById("btn-copy").addEventListener("click", async () => {
  const groups = wheel.getSelectedGroups();
  if (!groups) return;

  const text = formatAsMarkdownList(groups);
  trackCopyEmotions(currentLang);

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for non-secure contexts (HTTP)
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    showToast(langData.ui.toastCopied);
  } catch (err) {
    console.error("Failed to copy!", err);
  }
});

// Export button → toggle dropdown menu
const exportBtn = document.getElementById("btn-export");
const exportMenu = document.getElementById("export-menu");

exportBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = exportMenu.classList.contains("hidden");
  exportMenu.classList.toggle("hidden");
  if (willOpen) {
    trackExportMenuOpen();
  }
});

// Close export menu when clicking elsewhere
document.addEventListener("click", () => {
  exportMenu.classList.add("hidden");
});

// Export PNG: share on mobile, download on desktop
document.getElementById("btn-export-png").addEventListener("click", async () => {
  exportMenu.classList.add("hidden");
  trackExportPNG(currentLang);

  const ui = langData.ui;
  const groups = wheel.getSelectedGroups();
  const { blob, filename } = await generatePNG(wheel, currentLang, ui, groups);

  if (isMobile()) {
    const file = new File([blob], filename, { type: "image/png" });
    const shared = await shareFile(file, ui.appTitle);
    if (!shared) downloadBlob(blob, filename);
  } else {
    downloadBlob(blob, filename);
  }
});

// Export PDF: share on mobile, download on desktop
document.getElementById("btn-export-pdf").addEventListener("click", async () => {
  exportMenu.classList.add("hidden");
  trackExportPDF(currentLang);

  const ui = langData.ui;
  const groups = wheel.getSelectedGroups();

  if (isMobile()) {
    // On mobile: generate HTML, render as blob for sharing
    const html = generatePDFHtml(wheel, currentLang, ui, groups);
    const htmlBlob = new Blob([html], { type: 'text/html' });
    const file = new File([htmlBlob], `emotion-wheel-${currentLang}.html`, { type: 'text/html' });
    const shared = await shareFile(file, ui.appTitle);
    if (!shared) {
      // Fallback: open print window
      const win = window.open("");
      win.document.write(html);
      win.document.close();
    }
  } else {
    // Desktop: open in print window for PDF save
    const html = generatePDFHtml(wheel, currentLang, ui, groups);
    const win = window.open("");
    win.document.write(html);
    win.document.close();
  }
});

// ---------------------------------------------------------------------------
// 10. MOBILE: collapsible sidebar (bottom sheet)
// ---------------------------------------------------------------------------

const sidebar = document.getElementById("sidebar");
const sidebarHandle = document.getElementById("sidebar-handle");

sidebarHandle.addEventListener("click", () => {
  const willCollapse = !sidebar.classList.contains("collapsed");
  sidebar.classList.toggle("collapsed");
  trackSidebarToggle(willCollapse ? 'collapse' : 'expand');
});

// On mobile, collapse sidebar when tapping the canvas area
container.addEventListener("pointerdown", (e) => {
  if (e.target.closest("#zoom-controls") || e.target.closest("#floating-top") || e.target.closest("#export-menu")) return;
  // Only on mobile: the sidebar handle is visible only on mobile
  if (window.innerWidth <= 700 && !sidebar.classList.contains("collapsed")) {
    // Don't auto-collapse — let user do it via handle
  }
});

// ---------------------------------------------------------------------------
// UTILS
// ---------------------------------------------------------------------------

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2000);
}
