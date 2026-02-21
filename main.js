// =============================================================================
// Emotion Wheel – main.js
// Pure vanilla JS, no build step required.
// =============================================================================

// ---------------------------------------------------------------------------
// 1. DATA
// ---------------------------------------------------------------------------

const SECTORS = [
  {
    name: "Medo",
    baseColor: [120, 0, 180],
    rings: [
      ["Apreensivo","Inseguro","Preocupado","Tenso","Receoso","Inquieto","Nervoso","Cauteloso","Vulnerável","Alerta"],
      ["Ansioso","Assustado","Ameaçado","Desconfortável","Pressionado","Alarmado","Perturbado","Desprotegido","Em risco","Hesitante"],
      ["Aterrorizado","Apavorado","Horrorizado","Paralisado","Em pânico","Desesperado","Fóbico","Em choque","Pavor","Descontrolado"],
      ["Terror","Pavor extremo","Histeria","Pânico total","Colapso","Desespero","Sem chão","Fuga","Aniquilação","Medo absoluto"],
    ],
  },
  {
    name: "Raiva",
    baseColor: [220, 40, 40],
    rings: [
      ["Irritado","Incomodado","Contrariado","Impaciente","Chateado","Agitado","Frustrado","Ressentido","Cético","Desconfiado"],
      ["Bravo","Zangado","Ofendido","Hostil","Indignado","Ultrajado","Provocado","Rancoroso","Ciumento","Agressivo"],
      ["Furioso","Enraivecido","Revoltado","Colérico","Explosivo","Amargo","Odioso","Vingativo","Desprezo","Intolerante"],
      ["Fúria","Ódio","Fora de si","Irado","Violento","Implacável","Raivoso","Descontrolado","Possesso","Incendiado"],
    ],
  },
  {
    name: "Tristeza",
    baseColor: [50, 100, 200],
    rings: [
      ["Desanimado","Abatido","Chateado","Solitário","Saudoso","Cansado","Vazio","Melancólico","Desmotivado","Carente"],
      ["Triste","Magoado","Desapontado","Desiludido","Pesaroso","Impotente","Culpado","Arrependido","Envergonhado","Desamparado"],
      ["Deprimido","Devastado","Inconsolável","Humilhado","Lamentoso","Desesperançoso","Luto","Aflito","Angustiado","Oprimido"],
      ["Desespero","Desolado","Arrasado","Sem sentido","Profunda dor","Abismo","Desmoronado","Aniquilado","Trágado","Desfeito"],
    ],
  },
  {
    name: "Surpresa",
    baseColor: [255, 180, 0],
    rings: [
      ["Curioso","Intrigado","Atento","Desconfiado","Distraído","Incerto","Suspenso","Questionador","Inesperado","Desperto"],
      ["Surpreso","Espantado","Perplexo","Confuso","Impressionado","Sem palavras","Tocado","Estupefato","Chocado","Atônito"],
      ["Assombrado","Aboquiaberto","Alarmado","Estarrecido","Aterrorizado","Desnorteado","Incrédulo","Paralisado","Espanto","Perturbado"],
      ["Abalado","Em choque","Estatelado","Descompensado","Sobressalto","Colapso","Vértigo","Pânico súbito","Explodido","Inacreditável"],
    ],
  },
  {
    name: "Alegria",
    baseColor: [60, 180, 75],
    rings: [
      ["Sereno","Aliviado","Confortável","Tranquilo","Relaxado","Leve","Grato","Satisfeito","Bem","Ok"],
      ["Feliz","Alegre","Animado","Divertido","Esperançoso","Otimista","Entusiasmado","Interessado","Motivado","Empolgado"],
      ["Radiante","Encantado","Inspirado","Vibrante","Energizado","Maravilhado","Triunfante","Orgulhoso","Eufórico","Apaixonado"],
      ["Êxtase","Júbilo","Exaltação","Arrebatado","Extasiado","Plenitude","Transbordando","Incrível","Glorioso","Pico"],
    ],
  },
  {
    name: "Amor",
    baseColor: [230, 80, 150],
    rings: [
      ["Carinho","Afeto","Ternura","Acolhido","Cuidado","Compaixão","Amizade","Respeito","Gentileza","Conexão"],
      ["Amoroso","Apreciado","Valorizado","Confiante","Íntimo","Solidário","Protetor","Dedicado","Gratidão","Pertencimento"],
      ["Apaixonado","Devoto","Admiração","Encantamento","Desejo","Comprometido","Saudade","Reverência","Fascínio","União"],
      ["Adoração","Veneração","Entrega","Amor profundo","Fusão","Plenamente amado","Amor incondicional","Inteireza","Sagrado","Completude"],
    ],
  },
];

// ---------------------------------------------------------------------------
// 2. CONFIGURATION
// ---------------------------------------------------------------------------

const NUM_RINGS       = 4;
const NUM_SECTORS     = SECTORS.length;
const SECTOR_ANGLE    = (2 * Math.PI) / NUM_SECTORS;       // 60°
const CENTER_RATIO    = 0.10;   // center disk radius as fraction of outerR
const RING_GAP        = 0;      // gap between rings (px) – 0 for solid look
const DIVIDER_WIDTH   = 0.5;    // thin white dividers between slices
const HIGHLIGHT_WIDTH = 3;      // selected slice border width

// ---------------------------------------------------------------------------
// 3. STATE
// ---------------------------------------------------------------------------

/** Set of "sectorIdx-ringIdx-wordIdx" keys */
const selected = new Set();

// ---------------------------------------------------------------------------
// 4. CANVAS SETUP
// ---------------------------------------------------------------------------

const canvas  = document.getElementById("wheel");
const ctx     = canvas.getContext("2d");
let cx, cy, outerR, innerR, ringWidth;

/** Resize canvas to fit container and recompute geometry. */
function resize() {
  const container = document.getElementById("canvas-container");
  const size = Math.min(container.clientWidth, container.clientHeight);
  const dpr  = window.devicePixelRatio || 1;

  canvas.width  = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width  = size + "px";
  canvas.style.height = size + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  cx     = size / 2;
  cy     = size / 2;
  outerR = (size / 2) * 0.95;
  innerR = outerR * CENTER_RATIO;
  ringWidth = (outerR - innerR) / NUM_RINGS;

  draw();
}

// ---------------------------------------------------------------------------
// 5. COLOR HELPERS
// ---------------------------------------------------------------------------

/** Lighten / darken an [r,g,b] by mixing with white. factor 0→original, 1→white */
function lighten([r, g, b], factor) {
  return [
    Math.round(r + (255 - r) * factor),
    Math.round(g + (255 - g) * factor),
    Math.round(b + (255 - b) * factor),
  ];
}

function rgb(arr) { return `rgb(${arr[0]},${arr[1]},${arr[2]})`; }

/** Return color for a given ring index (0 = innermost = lightest, 3 = outermost = darkest). */
function ringColor(base, ringIdx) {
  // ring 0 (inner) lightest  → ring 3 (outer) darkest
  const factors = [0.55, 0.35, 0.15, 0.0];
  return lighten(base, factors[ringIdx]);
}

// ---------------------------------------------------------------------------
// 6. GEOMETRY HELPERS
// ---------------------------------------------------------------------------

/** Build the path for a donut-slice (annular sector). */
function slicePath(aStart, aEnd, rInner, rOuter) {
  const p = new Path2D();
  p.arc(cx, cy, rOuter, aStart, aEnd, false);
  p.arc(cx, cy, rInner, aEnd, aStart, true);
  p.closePath();
  return p;
}

/** Convert (x, y) in canvas CSS coords to (r, theta) with theta in [0, 2π). */
function toPolar(x, y) {
  const dx = x - cx;
  const dy = y - cy;
  const r  = Math.sqrt(dx * dx + dy * dy);
  let theta = Math.atan2(dy, dx);
  if (theta < 0) theta += 2 * Math.PI;
  return { r, theta };
}

// ---------------------------------------------------------------------------
// 7. DRAWING
// ---------------------------------------------------------------------------

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // --- Draw all slices (filled) ---
  for (let s = 0; s < NUM_SECTORS; s++) {
    const sector = SECTORS[s];
    const sectorStart = s * SECTOR_ANGLE;

    for (let ri = 0; ri < NUM_RINGS; ri++) {
      const words = sector.rings[ri];
      const m = words.length;
      const rIn  = innerR + ri * ringWidth + RING_GAP;
      const rOut = innerR + (ri + 1) * ringWidth;
      const color = ringColor(sector.baseColor, ri);

      for (let wi = 0; wi < m; wi++) {
        const aStart = sectorStart + (wi / m) * SECTOR_ANGLE;
        const aEnd   = sectorStart + ((wi + 1) / m) * SECTOR_ANGLE;
        const path   = slicePath(aStart, aEnd, rIn, rOut);

        // Fill
        ctx.fillStyle = rgb(color);
        ctx.fill(path);

        // Thin white divider
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.lineWidth = DIVIDER_WIDTH;
        ctx.stroke(path);
      }
    }
  }

  // --- Draw highlights for selected slices ---
  for (const key of selected) {
    const [s, ri, wi] = key.split("-").map(Number);
    const sector = SECTORS[s];
    const sectorStart = s * SECTOR_ANGLE;
    const m = sector.rings[ri].length;
    const rIn  = innerR + ri * ringWidth + RING_GAP;
    const rOut = innerR + (ri + 1) * ringWidth;
    const aStart = sectorStart + (wi / m) * SECTOR_ANGLE;
    const aEnd   = sectorStart + ((wi + 1) / m) * SECTOR_ANGLE;
    const path   = slicePath(aStart, aEnd, rIn, rOut);

    ctx.save();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = HIGHLIGHT_WIDTH;
    ctx.shadowColor = "rgba(255,255,255,0.9)";
    ctx.shadowBlur = 6;
    ctx.stroke(path);
    ctx.restore();
  }

  // --- Draw text (on top of everything) ---
  for (let s = 0; s < NUM_SECTORS; s++) {
    const sector = SECTORS[s];
    const sectorStart = s * SECTOR_ANGLE;

    for (let ri = 0; ri < NUM_RINGS; ri++) {
      const words = sector.rings[ri];
      const m = words.length;
      const rIn  = innerR + ri * ringWidth + RING_GAP;
      const rOut = innerR + (ri + 1) * ringWidth;
      const rMid = (rIn + rOut) / 2;

      for (let wi = 0; wi < m; wi++) {
        const aStart = sectorStart + (wi / m) * SECTOR_ANGLE;
        const aEnd   = sectorStart + ((wi + 1) / m) * SECTOR_ANGLE;
        const aMid   = (aStart + aEnd) / 2;

        drawRadialText(words[wi], aMid, rMid, rOut - rIn, aEnd - aStart, sector.baseColor, ri);
      }
    }

    // Sector label in center disk
    const aMid = sectorStart + SECTOR_ANGLE / 2;
    const labelR = innerR * 0.6;
    drawSectorLabel(sector.name, aMid, labelR);
  }

  // --- Center disk ---
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Sector labels inside center disk (re-draw on top of white disk)
  for (let s = 0; s < NUM_SECTORS; s++) {
    const sector = SECTORS[s];
    const sectorStart = s * SECTOR_ANGLE;
    const aMid = sectorStart + SECTOR_ANGLE / 2;
    const labelR = innerR * 0.55;
    drawSectorLabel(sector.name, aMid, labelR);
  }
}

/** Draw a word radially (along radius direction), keeping text upright. */
function drawRadialText(text, angle, rMid, ringH, arcSpan, baseColor, ringIdx) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // Determine if we need to flip to keep text upright.
  // Text pointing "down" (angle between π/2 and 3π/2) should be flipped.
  const normAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const flip = normAngle > Math.PI / 2 && normAngle < (3 * Math.PI) / 2;

  // Font size adapts to ring width and arc length
  const arcLen = arcSpan * rMid;
  const maxH = ringH * 0.82;
  const maxW = arcLen * 0.9;
  let fontSize = Math.min(maxH * 0.28, 14);
  // Shrink long texts
  ctx.font = `${fontSize}px sans-serif`;
  let measured = ctx.measureText(text).width;
  while (measured > maxH * 0.92 && fontSize > 5) {
    fontSize -= 0.5;
    ctx.font = `${fontSize}px sans-serif`;
    measured = ctx.measureText(text).width;
  }

  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = determineLabelColor(baseColor, ringIdx);

  if (flip) {
    ctx.rotate(Math.PI);
    ctx.translate(-rMid, 0);
    ctx.rotate(-Math.PI / 2);
  } else {
    ctx.translate(rMid, 0);
    ctx.rotate(-Math.PI / 2);
  }

  ctx.fillText(text, 0, 0);
  ctx.restore();
}

/** Determine text color (dark or light) based on background brightness. */
function determineLabelColor(base, ringIdx) {
  const c = ringColor(base, ringIdx);
  const lum = 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
  return lum > 160 ? "#222" : "#fff";
}

/** Draw a sector name label positioned in the center disk area. */
function drawSectorLabel(name, angle, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  const normAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const flip = normAngle > Math.PI / 2 && normAngle < (3 * Math.PI) / 2;

  const fontSize = Math.max(9, innerR * 0.22);
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#333";

  if (flip) {
    ctx.rotate(Math.PI);
    ctx.translate(-r, 0);
    ctx.rotate(-Math.PI / 2);
  } else {
    ctx.translate(r, 0);
    ctx.rotate(-Math.PI / 2);
  }

  ctx.fillText(name, 0, 0);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 8. HIT-TESTING
// ---------------------------------------------------------------------------

/** Find slice under (x, y). Returns {sectorIdx, ringIdx, wordIdx} or null. */
function hitTest(x, y) {
  const { r, theta } = toPolar(x, y);
  if (r < innerR || r > outerR) return null;

  // Determine ring
  const ringIdx = Math.floor((r - innerR) / ringWidth);
  if (ringIdx < 0 || ringIdx >= NUM_RINGS) return null;

  // Determine sector
  const sectorIdx = Math.floor(theta / SECTOR_ANGLE);
  if (sectorIdx < 0 || sectorIdx >= NUM_SECTORS) return null;

  // Determine word sub-slice
  const sectorStart = sectorIdx * SECTOR_ANGLE;
  const localAngle = theta - sectorStart;
  const m = SECTORS[sectorIdx].rings[ringIdx].length;
  const wordIdx = Math.floor((localAngle / SECTOR_ANGLE) * m);
  if (wordIdx < 0 || wordIdx >= m) return null;

  return { sectorIdx, ringIdx, wordIdx };
}

// ---------------------------------------------------------------------------
// 9. INTERACTION
// ---------------------------------------------------------------------------

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const hit = hitTest(x, y);
  if (!hit) return;

  const key = `${hit.sectorIdx}-${hit.ringIdx}-${hit.wordIdx}`;
  if (selected.has(key)) {
    selected.delete(key);
  } else {
    selected.add(key);
  }

  draw();
  updateSidebar();
});

// Pointer cursor on hoverable slices
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  canvas.style.cursor = hitTest(x, y) ? "pointer" : "default";
});

// ---------------------------------------------------------------------------
// 10. SIDEBAR
// ---------------------------------------------------------------------------

function updateSidebar() {
  const list = document.getElementById("selected-list");
  list.innerHTML = "";

  if (selected.size === 0) {
    list.innerHTML = '<li class="empty">Nenhuma emoção selecionada</li>';
    return;
  }

  // Group by sector
  const groups = {};
  for (const key of selected) {
    const [s, ri, wi] = key.split("-").map(Number);
    const sector = SECTORS[s];
    const word = sector.rings[ri][wi];
    if (!groups[sector.name]) groups[sector.name] = [];
    groups[sector.name].push(word);
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
// 11. BUTTONS
// ---------------------------------------------------------------------------

document.getElementById("btn-clear").addEventListener("click", () => {
  selected.clear();
  draw();
  updateSidebar();
});

document.getElementById("btn-copy").addEventListener("click", () => {
  const words = [];
  for (const key of selected) {
    const [s, ri, wi] = key.split("-").map(Number);
    words.push(SECTORS[s].rings[ri][wi]);
  }
  if (words.length === 0) return;
  navigator.clipboard.writeText(words.join(", ")).then(() => {
    showToast("Lista copiada!");
  });
});

document.getElementById("btn-export-png").addEventListener("click", () => {
  // Render at current resolution
  const link = document.createElement("a");
  link.download = "emotion-wheel.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

document.getElementById("btn-export-pdf").addEventListener("click", () => {
  const dataUrl = canvas.toDataURL("image/png");
  const win = window.open("");
  win.document.write(`
    <html>
    <head><title>Emotion Wheel – PDF</title>
    <style>
      body { margin:0; display:flex; justify-content:center; align-items:center; height:100vh; background:#fff; }
      img  { max-width:100%; max-height:100%; }
    </style>
    </head>
    <body><img src="${dataUrl}" onload="window.print()"></body>
    </html>
  `);
  win.document.close();
});

// ---------------------------------------------------------------------------
// 12. TOAST HELPER
// ---------------------------------------------------------------------------

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2000);
}

// ---------------------------------------------------------------------------
// 13. INIT
// ---------------------------------------------------------------------------

window.addEventListener("resize", resize);
resize();
updateSidebar();
