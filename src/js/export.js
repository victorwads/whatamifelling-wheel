/**
 * Export module – handles PNG generation, PDF generation, and share/download logic.
 */

/**
 * Build a formatted date/time string for exports.
 */
function formatDateTime(lang, ui) {
  const now = new Date();
  const dateStr = now.toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
  return { dateStr, timeStr, full: `${dateStr} — ${timeStr}` };
}

/**
 * Generate a decorated PNG as a Blob.
 * Returns { blob, filename }.
 */
export async function generatePNG(wheel, lang, ui, groups) {
  const wheelDataUrl = wheel.exportDataURL();
  const wheelImg = new Image();
  wheelImg.src = wheelDataUrl;
  await new Promise(r => { wheelImg.onload = r; });

  const { full: dateTimeStr } = formatDateTime(lang, ui);

  const dpr = 2; // always export at 2x for quality
  const W = 1200;
  const pad = 40;
  const wheelSize = W - pad * 2;
  let H = pad + 60 + 28 + 24 + pad + wheelSize + pad;

  let listLines = [];
  if (groups) {
    listLines.push('');
    for (const [sectorName, { words }] of Object.entries(groups)) {
      listLines.push(`▸ ${sectorName}`);
      listLines.push(`  ${words.join(', ')}`);
    }
    H += listLines.length * 26 + pad;
  }

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
  c.font = 'bold 36px "Segoe UI", system-ui, sans-serif';
  c.textAlign = 'center';
  c.fillText(ui.appTitle, W / 2, y + 36);
  y += 52;

  // Date/time
  c.fillStyle = '#666';
  c.font = '18px "Segoe UI", system-ui, sans-serif';
  c.fillText(`${ui.exportDateLabel}: ${dateTimeStr}`, W / 2, y + 18);
  y += 32;

  // Description
  c.fillStyle = '#888';
  c.font = '14px "Segoe UI", system-ui, sans-serif';
  c.fillText(ui.appDescription, W / 2, y + 14);
  y += 32;

  // Wheel image
  c.drawImage(wheelImg, pad, y, wheelSize, wheelSize);
  y += wheelSize + 20;

  // Selected emotions
  if (groups && listLines.length > 0) {
    c.textAlign = 'left';
    for (const line of listLines) {
      if (line === '') { y += 8; continue; }
      if (line.startsWith('▸')) {
        c.fillStyle = '#444';
        c.font = 'bold 18px "Segoe UI", system-ui, sans-serif';
      } else {
        c.fillStyle = '#555';
        c.font = '16px "Segoe UI", system-ui, sans-serif';
      }
      c.fillText(line, pad + 10, y + 18);
      y += 26;
    }
  }

  // Footer line
  c.strokeStyle = '#ddd';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(pad, H - pad + 10);
  c.lineTo(W - pad, H - pad + 10);
  c.stroke();

  const dataUrl = offscreen.toDataURL('image/png');
  const blob = await (await fetch(dataUrl)).blob();
  const filename = `emotion-wheel-${lang}.png`;
  return { blob, filename };
}

/**
 * Generate a PDF as a Blob using jsPDF-free approach:
 * Render an HTML page, print to PDF. On mobile, returns the wheel page HTML for sharing.
 * Actually: we generate a full HTML string that can be opened or converted.
 */
export function generatePDFHtml(wheel, lang, ui, groups) {
  const svgContent = wheel.exportSVG();
  const { full: dateTimeStr } = formatDateTime(lang, ui);

  let listingHtml = "";
  if (groups) {
    listingHtml += '<div class="page-break"></div>';
    listingHtml += '<div class="listing-page">';
    listingHtml += `<h1>${ui.pdfListTitle}</h1>`;
    listingHtml += `<p class="date">${ui.exportDateLabel}: ${dateTimeStr}</p>`;
    for (const [sectorName, { words }] of Object.entries(groups)) {
      listingHtml += `<h2>${sectorName}</h2><ul>`;
      for (const w of words) listingHtml += `<li>${w}</li>`;
      listingHtml += '</ul>';
    }
    listingHtml += '</div>';
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${ui.pdfTitle}</title>
<style>
  @media print { .page-break { page-break-before: always; } }
  body { margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #222; }
  .wheel-page {
    display: flex; flex-direction: column; align-items: center;
    justify-content: flex-start; min-height: 100vh; padding: 40px 40px 20px;
  }
  .wheel-page h1 { font-size: 2rem; margin: 0 0 4px; color: #333; }
  .wheel-page .date { font-size: 0.95rem; color: #777; margin: 0 0 4px; }
  .wheel-page .desc { font-size: 0.85rem; color: #999; margin: 0 0 20px; max-width: 600px; text-align: center; }
  .wheel-page svg { max-width: 90vw; max-height: 72vh; }
  .listing-page { padding: 40px 60px; }
  .listing-page h1 { font-size: 1.6rem; border-bottom: 2px solid #ddd; padding-bottom: 8px; margin-bottom: 4px; }
  .listing-page .date { font-size: 0.9rem; color: #777; margin-bottom: 16px; }
  .listing-page h2 { font-size: 1.1rem; text-transform: uppercase; margin: 16px 0 6px; color: #555; }
  .listing-page li { font-size: 0.95rem; margin: 2px 0; }
</style>
</head>
<body>
  <div class="wheel-page">
    <h1>${ui.appTitle}</h1>
    <p class="date">${dateTimeStr}</p>
    <p class="desc">${ui.appDescription}</p>
    ${svgContent}
  </div>
  ${listingHtml}
</body>
</html>`;
}

/**
 * Format selected groups as a markdown-style list for clipboard.
 * Example:
 *   *Medo*
 *   - Ansioso
 *   - Preocupado
 *
 *   *Alegria*
 *   - Feliz
 */
export function formatAsMarkdownList(groups) {
  if (!groups) return '';
  const parts = [];
  for (const [sectorName, { words }] of Object.entries(groups)) {
    parts.push(`*${sectorName}*`);
    for (const w of words) {
      parts.push(`- ${w}`);
    }
    parts.push(''); // blank line between sections
  }
  return parts.join('\n').trim();
}

/**
 * Share a file using the Web Share API (mobile).
 * Returns true if shared successfully, false otherwise.
 */
export async function shareFile(file, title) {
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ title, files: [file] });
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
