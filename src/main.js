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
const langSelect = document.getElementById("lang-select");

// Detect browser language
function getBrowserLanguage() {
  const userLangs = navigator.languages || [navigator.language || navigator.userLanguage];
  for (let lang of userLangs) {
    if (!lang) continue;
    const shortLang = lang.split('-')[0].toLowerCase();
    if (LANGUAGES[shortLang]) return shortLang;
  }
  return "pt"; // Fallback
}

// Current language state
let currentLang = getBrowserLanguage();
langSelect.value = currentLang;
let langData = LANGUAGES[currentLang];

const wheel = new EmotionWheel(canvas, langData.sectors);

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
updateLocalization();

// ---------------------------------------------------------------------------
// 2. INTERACTION
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
// 3. UI UPDATES & LOCALIZATION
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
      console.error("Share failed:", err);
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
    console.error("Error sharing PNG:", err);
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
