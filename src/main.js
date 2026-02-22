import { EmotionWheel } from './js/wheel.js';
import { LANGUAGES } from './js/data.js';
import { generatePNG, generatePDF, generatePDFHtml, formatAsMarkdownList, shareFile, downloadBlob, isMobile, encodeSelectionHash, buildShareURL } from './js/export.js';
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

// Apply saved theme on load
const savedTheme = localStorage.getItem('emotion-wheel-theme');
if (savedTheme === 'light') {
  document.body.classList.remove('dark');
} else {
  document.body.classList.add('dark');
}

// Current language: prefer localStorage, then browser detection
let currentLang = localStorage.getItem('emotion-wheel-lang');
if (!currentLang || !LANGUAGES[currentLang]) currentLang = getBrowserLanguage();
langSelect.value = currentLang;
let langData = LANGUAGES[currentLang];
setLanguageProperty(currentLang);

function decodeSelectionFromHash(hash) {
  if (!hash) return [];
  hash = hash.replace(/-/g, '+').replace(/_/g, '/');
  while (hash.length % 4) hash += '=';
  const bin = atob(hash);
  const arr = Array.from(bin, c => c.charCodeAt(0));
  const keys = [];
  for (let i = 0; i < arr.length; i += 3) {
    keys.push(`${arr[i]}-${arr[i+1]}-${arr[i+2]}`);
  }
  return keys;
}

// Carrega seleção do pathname da URL, se existir
let initialSelected = null;
const pathParts = location.pathname.split('/').filter(p => p);
if (pathParts.length > 0 && pathParts[pathParts.length - 1].match(/^[A-Za-z0-9_-]+$/)) {
  initialSelected = new Set(decodeSelectionFromHash(pathParts[pathParts.length - 1]));
}

const wheel = new EmotionWheel(canvas, langData.sectors);
if (initialSelected) {
  wheel.selected = initialSelected;
  sessionStorage.setItem('emotion-wheel-selected', JSON.stringify(Array.from(initialSelected)));
}

// ===========================================================================
//  VIEWPORT — re-render approach for crisp zoom (like SVG).
//  The canvas is always full-container resolution. Zoom/pan is applied via
//  ctx.translate + ctx.scale before every draw, so text is always sharp.
// ===========================================================================

let vpScale = 1;
let vpTx = 0;
let vpTy = 0;
let vpRotation = 0;
const MIN_SCALE = 0.5;
const MAX_SCALE = 8;

function updateView() {
  wheel.setViewport(vpScale, vpTx, vpTy, vpRotation);
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
  vpRotation = 0;
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
  
  let wx = (sx - vpTx) / vpScale;
  let wy = (sy - vpTy) / vpScale;
  
  if (vpRotation) {
    const cx = wheel.cx;
    const cy = wheel.cy;
    const dx = wx - cx;
    const dy = wy - cy;
    const cos = Math.cos(-vpRotation);
    const sin = Math.sin(-vpRotation);
    wx = cx + dx * cos - dy * sin;
    wy = cy + dx * sin + dy * cos;
  }
  
  return { x: wx, y: wy };
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
updateSidebar();

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
let pinchPrevAngle = 0;
let pinchPrevCx = 0;
let pinchPrevCy = 0;
let gesturePrevScale = 1;
let gesturePrevRotation = 0;
let gesturePrevCx = 0;
let gesturePrevCy = 0;
let gestureActive = false;

container.addEventListener("pointerdown", (e) => {
  if (e.target.closest("#zoom-controls") || e.target.closest("#floating-left") || e.target.closest("#floating-right") || e.target.closest("#export-menu")) return;
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
    pinchPrevAngle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
    const rect = container.getBoundingClientRect();
    pinchPrevCx = (pts[0].x + pts[1].x) / 2 - rect.left;
    pinchPrevCy = (pts[0].y + pts[1].y) / 2 - rect.top;
  }
});

container.addEventListener("pointermove", (e) => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (pointers.size === 2) {
    // Pinch zoom + pan + rotate
    const pts = [...pointers.values()];
    const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    const angle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
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

    // Rotate: rotate around current midpoint
    let angleDiff = angle - pinchPrevAngle;
    if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    
    if (angleDiff !== 0) {
      const rx = (cx - vpTx) / vpScale - wheel.cx;
      const ry = (cy - vpTy) / vpScale - wheel.cy;
      
      const cos = Math.cos(angleDiff);
      const sin = Math.sin(angleDiff);
      
      const rxNew = rx * cos - ry * sin;
      const ryNew = rx * sin + ry * cos;
      
      vpTx = cx - vpScale * (wheel.cx + rxNew);
      vpTy = cy - vpScale * (wheel.cy + ryNew);
      
      vpRotation += angleDiff;
    }

    pinchPrevDist = dist;
    pinchPrevAngle = angle;
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

// Safari-only gesture events for trackpad pinch + rotate
container.addEventListener("gesturestart", (e) => {
  if (e.target.closest("#zoom-controls") || e.target.closest("#floating-left") || e.target.closest("#floating-right") || e.target.closest("#export-menu")) return;
  e.preventDefault();
  gestureActive = true;
  dragging = false;
  const rect = container.getBoundingClientRect();
  gesturePrevScale = 1;
  gesturePrevRotation = 0;
  gesturePrevCx = e.clientX - rect.left;
  gesturePrevCy = e.clientY - rect.top;
}, { passive: false });

container.addEventListener("gesturechange", (e) => {
  if (!gestureActive) return;
  e.preventDefault();
  const rect = container.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;

  // Pan: follow midpoint movement
  vpTx += cx - gesturePrevCx;
  vpTy += cy - gesturePrevCy;

  // Zoom: scale around current midpoint
  const ratio = e.scale / gesturePrevScale;
  const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, vpScale * ratio));
  const worldX = (cx - vpTx) / vpScale;
  const worldY = (cy - vpTy) / vpScale;
  vpTx = cx - worldX * newScale;
  vpTy = cy - worldY * newScale;
  vpScale = newScale;

  // Rotate: rotate around current midpoint
  let angleDiff = (e.rotation - gesturePrevRotation) * Math.PI / 180;
  if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
  if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

  if (angleDiff !== 0) {
    const rx = (cx - vpTx) / vpScale - wheel.cx;
    const ry = (cy - vpTy) / vpScale - wheel.cy;

    const cos = Math.cos(angleDiff);
    const sin = Math.sin(angleDiff);

    const rxNew = rx * cos - ry * sin;
    const ryNew = rx * sin + ry * cos;

    vpTx = cx - vpScale * (wheel.cx + rxNew);
    vpTy = cy - vpScale * (wheel.cy + ryNew);

    vpRotation += angleDiff;
  }

  gesturePrevScale = e.scale;
  gesturePrevRotation = e.rotation;
  gesturePrevCx = cx;
  gesturePrevCy = cy;
  updateView();
  didDrag = true;
}, { passive: false });

container.addEventListener("gestureend", (e) => {
  if (!gestureActive) return;
  e.preventDefault();
  gestureActive = false;
});

container.addEventListener("gesturecancel", (e) => {
  if (!gestureActive) return;
  e.preventDefault();
  gestureActive = false;
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
    // Atualiza URL com history API
    const hash = encodeSelectionHash(wheel.selected);
    const baseUrl = location.origin + '/' + (hash || '');
    history.pushState({ selection: hash }, '', baseUrl);

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
  
  // Re-run search if there's an active search term
  const searchInput = document.getElementById("search-input");
  if (searchInput && searchInput.value) {
    searchEmotions(searchInput.value);
  } else {
    wheel.draw();
  }
  
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
  document.getElementById("btn-copy-text").innerHTML = '<i class="fa-regular fa-clipboard"></i> ' + ui.btnCopyText;
  document.getElementById("btn-copy-link").innerHTML = '<i class="fa-solid fa-link"></i> ' + ui.btnCopyLink;
  document.getElementById("btn-clear").title = ui.btnClear;
  document.getElementById("btn-export").title = ui.btnShare;
  document.getElementById("btn-search").title = ui.btnSearch;
  document.getElementById("search-input").placeholder = ui.searchPlaceholder;
  document.getElementById("btn-clear-label").textContent = ui.btnClearAll;
  document.getElementById("btn-export-label").textContent = ui.btnShareFeelings;
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
  for (const [sectorName, { sectorIdx, words }] of Object.entries(groups)) {
    const pct = (words.length / totalSelected) * 100;
    const seg = document.createElement("div");
    const [r, g, b] = langData.sectors[sectorIdx].baseColor;
    seg.style.width = pct + "%";
    seg.style.background = `rgb(${r},${g},${b})`;
    seg.title = `${sectorName} (${Math.round(pct)}%)`;
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

// Toggle dark/light theme
document.getElementById("btn-theme").addEventListener("click", () => {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('emotion-wheel-theme', isDark ? 'dark' : 'light');
  document.querySelector('#btn-theme i').className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
});

// Sync icon on load after toggling
if (savedTheme !== 'light') {
  document.querySelector('#btn-theme i').className = 'fa-solid fa-sun';
}

// Clear selection
document.getElementById("btn-clear").addEventListener("click", () => {
  trackClearSelection();
  wheel.clearSelection();
  wheel.draw();
  updateSidebar();
  // Limpa URL
  history.pushState({ selection: null }, '', location.origin + '/');
});

// Copy as markdown list (clipboard only, no share API)
document.getElementById("btn-copy-text").addEventListener("click", async () => {
  const groups = wheel.getSelectedGroups();
  if (!groups) return;
  const shareUrl = buildShareURL(wheel.selected);
  const text = formatAsMarkdownList(groups) + '\n\n' + (langData.ui.shareIntro || 'Olha meus sentimentos') + ':\n' + shareUrl;
  trackCopyEmotions(currentLang);
  if (isMobile() && navigator.share) {
    try {
      await navigator.share({ text });
      showToast('Compartilhado!');
    } catch (err) { showToast('Falha ao compartilhar'); }
    return;
  }
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
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
    showToast('Falha ao copiar');
  }
});

document.getElementById("btn-copy-link").addEventListener("click", async () => {
  const link = buildShareURL(wheel.selected);
  const msg = `${langData.ui.shareIntro || 'Olha meus sentimentos'}: ${link}`;
  if (isMobile() && navigator.share) {
    try {
      await navigator.share({ text: msg });
      showToast('Compartilhado!');
    } catch (err) { showToast('Falha ao compartilhar'); }
    return;
  }
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(link);
      showToast('Link copiado!');
    } else {
      const ta = document.createElement("textarea");
      ta.value = link;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast('Link copiado!');
    }
  } catch (err) {
    showToast('Falha ao copiar link');
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
  const { blob, filename, url } = await generatePNG(wheel, currentLang, ui, groups);

  if (isMobile()) {
    const file = new File([blob], filename, { type: "image/png" });
    const shareText = `${ui.shareIntro || 'Olha meus sentimentos'}:\n${url}`;
    const shared = await shareFile(file, ui.appTitle, shareText);
    if (!shared) downloadBlob(blob, filename);
  } else {
    downloadBlob(blob, filename);
  }
});

// Export PDF: generate real PDF via jsPDF, fallback to print dialog
document.getElementById("btn-export-pdf").addEventListener("click", async () => {
  exportMenu.classList.add("hidden");
  trackExportPDF(currentLang);

  const ui = langData.ui;
  const groups = wheel.getSelectedGroups();

  try {
    const { blob, filename, url } = await generatePDF(wheel, currentLang, ui, groups);
    if (isMobile()) {
      const file = new File([blob], filename, { type: 'application/pdf' });
      const shareText = `${ui.shareIntro || 'Olha meus sentimentos'}:\n${url}`;
      const shared = await shareFile(file, ui.appTitle, shareText);
      if (!shared) downloadBlob(blob, filename);
    } else {
      downloadBlob(blob, filename);
    }
  } catch (err) {
    console.warn('jsPDF unavailable, falling back to print:', err);
    const html = generatePDFHtml(wheel, currentLang, ui, groups);
    const win = window.open('');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
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
  if (e.target.closest("#zoom-controls") || e.target.closest("#floating-left") || e.target.closest("#floating-right") || e.target.closest("#export-menu")) return;
  // Only on mobile: the sidebar handle is visible only on mobile
  if (window.innerWidth <= 700 && !sidebar.classList.contains("collapsed")) {
    // Don't auto-collapse — let user do it via handle
  }
});

// ---------------------------------------------------------------------------
// SEARCH FUNCTIONALITY
// ---------------------------------------------------------------------------

const btnSearch = document.getElementById("btn-search");
const searchInput = document.getElementById("search-input");
const btnSearchClear = document.getElementById("btn-search-clear");

// Toggle search box
btnSearch.addEventListener("click", (e) => {
  e.stopPropagation();
  const isExpanded = btnSearch.classList.contains("expanded");
  if (!isExpanded) {
    btnSearch.classList.add("expanded");
    setTimeout(() => searchInput.focus(), 300);
  }
});

// Close search box when clicking elsewhere
document.addEventListener("click", (e) => {
  if (!e.target.closest("#btn-search")) {
    if (!searchInput.value) {
      btnSearch.classList.remove("expanded");
      wheel.searchHighlights.clear();
      wheel.draw();
    }
  }
});

// Prevent clicks inside search from closing it
searchInput.addEventListener("click", (e) => {
  e.stopPropagation();
});

btnSearchClear.addEventListener("click", (e) => {
  e.stopPropagation();
});

// Clear search
btnSearchClear.addEventListener("click", () => {
  searchInput.value = "";
  wheel.searchHighlights.clear();
  wheel.draw();
  searchInput.focus();
});

// Fuzzy match function - calculates similarity between two strings
function fuzzyMatch(str, query) {
  str = str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  query = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Exact match
  if (str.includes(query)) return 1.0;
  
  // Calculate Levenshtein distance based similarity
  let matches = 0;
  let qIdx = 0;
  
  for (let i = 0; i < str.length && qIdx < query.length; i++) {
    if (str[i] === query[qIdx]) {
      matches++;
      qIdx++;
    }
  }
  
  if (matches === 0) return 0;
  
  // Similarity score based on matched chars
  return matches / Math.max(str.length, query.length);
}

// Search emotions
function searchEmotions(query) {
  wheel.searchHighlights.clear();
  
  if (!query || query.trim().length < 2) {
    wheel.draw();
    return;
  }
  
  query = query.trim();
  const threshold = 0.4; // Minimum similarity threshold
  
  for (let s = 0; s < langData.sectors.length; s++) {
    const sector = langData.sectors[s];
    
    // Check sector name
    if (fuzzyMatch(sector.name, query) >= threshold) {
      // Highlight all words in this sector
      for (let ri = 0; ri < sector.rings.length; ri++) {
        for (let wi = 0; wi < sector.rings[ri].length; wi++) {
          wheel.searchHighlights.add(`${s}-${ri}-${wi}`);
        }
      }
      continue;
    }
    
    // Check individual words
    for (let ri = 0; ri < sector.rings.length; ri++) {
      const words = sector.rings[ri];
      for (let wi = 0; wi < words.length; wi++) {
        const word = words[wi];
        if (fuzzyMatch(word, query) >= threshold) {
          wheel.searchHighlights.add(`${s}-${ri}-${wi}`);
        }
      }
    }
  }
  
  wheel.draw();
}

// Search input listener
let searchTimeout;
searchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchEmotions(e.target.value);
  }, 300);
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

// ---------------------------------------------------------------------------
// HISTORY API SUPPORT (Botão Voltar)
// ---------------------------------------------------------------------------

window.addEventListener('popstate', (event) => {
  const pathParts = location.pathname.split('/').filter(p => p);
  if (pathParts.length > 0 && pathParts[pathParts.length - 1].match(/^[A-Za-z0-9_-]+$/)) {
    const selection = new Set(decodeSelectionFromHash(pathParts[pathParts.length - 1]));
    wheel.selected = selection;
  } else {
    wheel.selected = new Set();
  }
  wheel.draw();
  updateSidebar();
});
