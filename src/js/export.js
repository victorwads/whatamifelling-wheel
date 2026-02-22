/**
 * Export module – handles PNG generation, real PDF generation (jsPDF),
 * HTML-print fallback, and share/download logic.
 */

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/**
 * Encode a selection Set into a compact base64 url-safe string.
 */
export function encodeSelectionHash(selectedSet) {
  if (!selectedSet || selectedSet.size === 0) return '';
  const arr = Array.from(selectedSet).map(k => k.split('-').map(Number)).flat();
  const u8 = new Uint8Array(arr);
  return btoa(String.fromCharCode(...u8)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Build the full shareable URL with the selection hash.
 */
export function buildShareURL(selectedSet) {
  let url = location.origin + location.pathname;
  const hash = encodeSelectionHash(selectedSet);
  if (hash) url += '#sel=' + hash;
  return url;
}

/**
 * Format a date/time stamp suitable for filenames: YYYY-MM-DD_HH-MM
 */
function formatFileDateTime() {
  const now = new Date();
  const p = n => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth()+1)}-${p(now.getDate())}_${p(now.getHours())}-${p(now.getMinutes())}`;
}

function formatDateTime(lang, ui) {
  const now = new Date();
  const dateStr = now.toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
  return { dateStr, timeStr, full: `${dateStr} — ${timeStr}` };
}

/**
 * Compute percentage distribution data from selected groups.
 */
function computePercentages(groups, sectors) {
  if (!groups) return null;
  const total = Object.values(groups).reduce((s, g) => s + g.words.length, 0);
  const entries = Object.entries(groups).map(([name, { sectorIdx, words }]) => ({
    name,
    sectorIdx,
    words,
    count: words.length,
    pct: words.length / total,
    pctRound: Math.round((words.length / total) * 100),
    color: sectors[sectorIdx].baseColor,
  }));
  return { total, entries };
}

/**
 * Draw a percentage bar on a 2D canvas context with rounded ends.
 */
function drawPercentageBar(c, pctData, x, y, w, h) {
  c.save();
  c.beginPath();
  const r = h / 2;
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.clip();
  let bx = x;
  for (const entry of pctData.entries) {
    const segW = w * entry.pct;
    c.fillStyle = `rgb(${entry.color[0]},${entry.color[1]},${entry.color[2]})`;
    c.fillRect(bx, y, segW + 1, h);
    bx += segW;
  }
  c.restore();
}

/**
 * Wrap comma-separated text into lines that fit within maxWidth (canvas).
 */
function getWrappedLines(c, text, maxWidth) {
  const pieces = text.split(', ');
  const lines = [];
  let current = '';
  for (const piece of pieces) {
    const test = current ? current + ', ' + piece : piece;
    if (c.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = piece;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ---------------------------------------------------------------------------
// PNG EXPORT
// ---------------------------------------------------------------------------

/**
 * Generate a decorated PNG as a Blob.
 * High resolution (3x DPR, 1800px logical width).
 * Includes title, datetime, wheel, percentage bar, and emotion list.
 * Returns { blob, filename }.
 */
export async function generatePNG(wheel, lang, ui, groups) {
  const pctData = computePercentages(groups, wheel.sectors);

  const dpr = 3;
  const W = 1800;
  const pad = 60;
  const wheelSize = W - pad * 2;
  const textMaxW = W - pad * 2 - 30;

  // --- Height pre-calculation (measuring context) ---
  const mc = document.createElement('canvas').getContext('2d');
  let H = pad + 64 + 38 + 36 + 20 + wheelSize + 30;

  if (pctData) {
    H += 20 + 24; // bar + gap
    mc.font = '18px "Segoe UI", system-ui, sans-serif';
    for (const entry of pctData.entries) {
      H += 32; // header
      const lines = getWrappedLines(mc, entry.words.join(', '), textMaxW);
      H += lines.length * 24 + 14;
    }
  }
  H += pad + 30; // extra room for URL footer

  // --- Export wheel at exact resolution needed ---
  const neededPx = wheelSize * dpr;
  const exportScale = Math.ceil(neededPx / wheel.worldSize);
  const wheelDataUrl = wheel.exportDataURL(exportScale);
  const wheelImg = new Image();
  wheelImg.src = wheelDataUrl;
  await new Promise(r => { wheelImg.onload = r; });

  const { full: dateTimeStr } = formatDateTime(lang, ui);
  const shareUrl = buildShareURL(wheel.selected);

  // --- Create canvas ---
  const offscreen = document.createElement('canvas');
  offscreen.width = W * dpr;
  offscreen.height = H * dpr;
  const c = offscreen.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Background
  c.fillStyle = '#f8f8f8';
  c.fillRect(0, 0, W, H);

  let y = pad;

  // Title
  c.fillStyle = '#222';
  c.font = 'bold 44px "Segoe UI", system-ui, sans-serif';
  c.textAlign = 'center';
  c.fillText(ui.appTitle, W / 2, y + 44);
  y += 64;

  // Date/time
  c.fillStyle = '#666';
  c.font = '22px "Segoe UI", system-ui, sans-serif';
  c.fillText(`${ui.exportDateLabel}: ${dateTimeStr}`, W / 2, y + 22);
  y += 38;

  // Description
  c.fillStyle = '#888';
  c.font = '18px "Segoe UI", system-ui, sans-serif';
  c.fillText(ui.appDescription, W / 2, y + 18);
  y += 36;

  y += 20;

  // Wheel image
  c.drawImage(wheelImg, pad, y, wheelSize, wheelSize);
  y += wheelSize + 30;

  // Percentage bar + grouped emotions
  if (pctData) {
    const barW = W - pad * 2;
    const barH = 20;
    drawPercentageBar(c, pctData, pad, y, barW, barH);
    y += barH + 24;

    c.textAlign = 'left';
    for (const entry of pctData.entries) {
      // Color dot
      const [r, g, b] = entry.color;
      c.fillStyle = `rgb(${r},${g},${b})`;
      c.beginPath();
      c.arc(pad + 14, y + 14, 7, 0, Math.PI * 2);
      c.fill();

      // Header
      c.fillStyle = '#333';
      c.font = 'bold 22px "Segoe UI", system-ui, sans-serif';
      c.fillText(`${entry.name} (${entry.pctRound}%)`, pad + 30, y + 20);
      y += 32;

      // Words (wrapped)
      c.fillStyle = '#555';
      c.font = '18px "Segoe UI", system-ui, sans-serif';
      const lines = getWrappedLines(c, entry.words.join(', '), textMaxW);
      for (const line of lines) {
        c.fillText(line, pad + 30, y + 18);
        y += 24;
      }
      y += 14;
    }
  }

  // URL link no rodapé
  c.fillStyle = '#0066cc';
  c.font = '16px "Segoe UI", system-ui, sans-serif';
  c.textAlign = 'center';
  c.fillText(shareUrl, W / 2, H - 20);

  const dataUrl = offscreen.toDataURL('image/png');
  const blob = await (await fetch(dataUrl)).blob();
  const filename = `emotion-wheel-${lang}_${formatFileDateTime()}.png`;
  return { blob, filename, url: shareUrl };
}

// ---------------------------------------------------------------------------
// PDF EXPORT (jsPDF)
// ---------------------------------------------------------------------------

/**
 * Dynamically load jsPDF library from CDN.
 * Returns the jsPDF constructor.
 */
async function loadJsPDF() {
  if (window.jspdf) return window.jspdf.jsPDF;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/jspdf@4.2.0/dist/jspdf.umd.min.js';
    const timeout = setTimeout(() => reject(new Error('jsPDF load timeout')), 10000);
    script.onload = () => { clearTimeout(timeout); resolve(window.jspdf.jsPDF); };
    script.onerror = () => { clearTimeout(timeout); reject(new Error('Failed to load jsPDF CDN')); };
    document.head.appendChild(script);
  });
}

/**
 * Generate a real PDF file as a Blob using jsPDF.
 * Includes title, datetime, wheel (high-res raster), percentage bar, and emotion list.
 * Returns { blob, filename }.
 * Throws if jsPDF cannot be loaded (caller should fallback to HTML print).
 */
export async function generatePDF(wheel, lang, ui, groups) {
  const JsPDF = await loadJsPDF();

  const wheelDataUrl = wheel.exportDataURL(4);
  const { full: dateTimeStr } = formatDateTime(lang, ui);
  const pctData = computePercentages(groups, wheel.sectors);
  const shareUrl = buildShareURL(wheel.selected);

  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const margin = 15;
  const contentW = pageW - margin * 2;

  let y = margin;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(51, 51, 51);
  doc.text(ui.appTitle, pageW / 2, y + 8, { align: 'center' });
  y += 14;

  // Date/time
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(119, 119, 119);
  doc.text(`${ui.exportDateLabel}: ${dateTimeStr}`, pageW / 2, y + 4, { align: 'center' });
  y += 8;

  // Description
  doc.setFontSize(8);
  doc.setTextColor(153, 153, 153);
  const descLines = doc.splitTextToSize(ui.appDescription, contentW - 20);
  doc.text(descLines, pageW / 2, y + 4, { align: 'center' });
  y += descLines.length * 3.5 + 6;

  // Wheel image (centered)
  const wheelMM = 155;
  const wheelX = (pageW - wheelMM) / 2;
  doc.addImage(wheelDataUrl, 'PNG', wheelX, y, wheelMM, wheelMM);
  y += wheelMM + 6;

  // Percentage bar + emotions
  if (pctData) {
    const barH = 3.5;
    let bx = margin;
    for (const entry of pctData.entries) {
      const segW = contentW * entry.pct;
      doc.setFillColor(entry.color[0], entry.color[1], entry.color[2]);
      doc.rect(bx, y, segW, barH, 'F');
      bx += segW;
    }
    y += barH + 5;

    // Emotion groups
    for (const entry of pctData.entries) {
      if (y > pageH - margin - 15) {
        doc.addPage();
        y = margin;
      }

      // Color dot
      doc.setFillColor(entry.color[0], entry.color[1], entry.color[2]);
      doc.circle(margin + 2.5, y + 1.8, 1.5, 'F');

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(68, 68, 68);
      doc.text(`${entry.name} (${entry.pctRound}%)`, margin + 7, y + 3.5);
      y += 6;

      // Words
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(85, 85, 85);
      const wordsText = entry.words.join(', ');
      const wordLines = doc.splitTextToSize(wordsText, contentW - 12);
      for (const line of wordLines) {
        if (y > pageH - margin - 5) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin + 7, y + 3);
        y += 4.5;
      }
      y += 3;
    }
  }

  // Adiciona a URL interativa no rodapé do PDF
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 102, 204);
  if (y > 270) { doc.addPage(); }
  doc.textWithLink(shareUrl, margin, 290, { url: shareUrl });

  const blob = doc.output('blob');
  const filename = `emotion-wheel-${lang}_${formatFileDateTime()}.pdf`;
  return { blob, filename, url: shareUrl };
}

// ---------------------------------------------------------------------------
// PDF HTML FALLBACK (used when jsPDF CDN is unavailable)
// ---------------------------------------------------------------------------

/**
 * Generate PDF as HTML string — fallback for offline / CDN failure.
 * Opens in a print dialog for manual "Save as PDF".
 */
export function generatePDFHtml(wheel, lang, ui, groups) {
  const svgContent = wheel.exportSVG();
  const { full: dateTimeStr } = formatDateTime(lang, ui);
  const pctData = computePercentages(groups, wheel.sectors);

  let pctBarHtml = '';
  let listingHtml = '';

  if (pctData) {
    pctBarHtml = '<div class="pct-bar">';
    for (const entry of pctData.entries) {
      const [r, g, b] = entry.color;
      pctBarHtml += `<div style="width:${entry.pct * 100}%;background:rgb(${r},${g},${b})" title="${entry.name} (${entry.pctRound}%)"></div>`;
    }
    pctBarHtml += '</div>';

    listingHtml += '<div class="listing">';
    for (const entry of pctData.entries) {
      const [r, g, b] = entry.color;
      listingHtml += `<h2><span class="dot" style="background:rgb(${r},${g},${b})"></span>${entry.name} (${entry.pctRound}%)</h2><ul>`;
      for (const w of entry.words) listingHtml += `<li>${w}</li>`;
      listingHtml += '</ul>';
    }
    listingHtml += '</div>';
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${ui.pdfTitle}</title>
<style>
  @media print { .no-print { display: none; } }
  body { margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #222; }
  .wheel-page {
    display: flex; flex-direction: column; align-items: center;
    justify-content: flex-start; min-height: 100vh; padding: 40px 40px 20px;
  }
  .wheel-page h1 { font-size: 2rem; margin: 0 0 4px; color: #333; }
  .wheel-page .date { font-size: 0.95rem; color: #777; margin: 0 0 4px; }
  .wheel-page .desc { font-size: 0.85rem; color: #999; margin: 0 0 20px; max-width: 600px; text-align: center; }
  .wheel-page svg { max-width: 90vw; max-height: 72vh; }
  .pct-bar { display: flex; height: 12px; border-radius: 6px; overflow: hidden; margin: 16px 40px 8px; }
  .pct-bar > div { min-width: 2px; }
  .listing { padding: 8px 60px 40px; }
  .listing h2 { font-size: 1.1rem; text-transform: uppercase; margin: 14px 0 4px; color: #555; display: flex; align-items: center; gap: 8px; }
  .dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
  .listing li { font-size: 0.95rem; margin: 2px 0; }
</style>
</head>
<body>
  <div class="wheel-page">
    <h1>${ui.appTitle}</h1>
    <p class="date">${dateTimeStr}</p>
    <p class="desc">${ui.appDescription}</p>
    ${svgContent}
  </div>
  ${pctBarHtml}
  ${listingHtml}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// CLIPBOARD / SHARING HELPERS
// ---------------------------------------------------------------------------

/**
 * Format selected groups as a markdown-style list for clipboard.
 */
export function formatAsMarkdownList(groups) {
  if (!groups) return '';
  const parts = [];
  for (const [sectorName, { words }] of Object.entries(groups)) {
    parts.push(`*${sectorName}*`);
    for (const w of words) {
      parts.push(`- ${w}`);
    }
    parts.push('');
  }
  return parts.join('\n').trim();
}

/**
 * Share a file using the Web Share API (mobile).
 * Returns true if shared successfully, false otherwise.
 */
export async function shareFile(file, title, text, url) {
  try {
    const shareData = { files: [file] };
    if (text) shareData.text = text;
    if (title) shareData.title = title;
    if (url) shareData.url = url;
    if (navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      return true;
    }
  } catch (err) {
    if (err.name !== 'AbortError') console.error("Share failed:", err);
  }
  return false;
}

/**
 * Download a blob as a file.
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Detect if we're on a mobile/touch device.
 */
export function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || 
         (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
}
