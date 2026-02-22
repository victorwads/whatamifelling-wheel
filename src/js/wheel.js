import { CONFIG } from './data.js';
import { ColorHelper } from './color.js';

/**
 * Main Class to handle Emotion Wheel rendering and hit testing
 */
export class EmotionWheel {
  constructor(canvas, sectors) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.sectors = sectors;
    // Carrega seleção do Session Storage
    const saved = sessionStorage.getItem('emotion-wheel-selected');
    this.selected = saved ? new Set(JSON.parse(saved)) : new Set();

    // Geometry state (world coordinates)
    this.cx = 0;
    this.cy = 0;
    this.outerR = 0;
    this.innerR = 0;
    this.ringWidth = 0;
    this.sectorAngle = (2 * Math.PI) / this.sectors.length;

    // Canvas dimensions and viewport
    this.canvasW = 0;
    this.canvasH = 0;
    this.worldSize = 0;
    this.vpScale = 1;
    this.vpTx = 0;
    this.vpTy = 0;
  }

  setSectors(sectors) {
    this.sectors = sectors;
    this.sectorAngle = (2 * Math.PI) / this.sectors.length;
  }

  resize(containerW, containerH) {
    const dpr = window.devicePixelRatio || 1;
    this.canvasW = containerW;
    this.canvasH = containerH;
    this.canvas.width = containerW * dpr;
    this.canvas.height = containerH * dpr;
    this.canvas.style.width = containerW + "px";
    this.canvas.style.height = containerH + "px";

    // Fixed world size so the wheel looks identical on any screen.
    // Zoom/pan handles fitting it to the viewport.
    if (!this._worldInited) {
      this.worldSize = 800;
      this.cx = this.worldSize / 2;
      this.cy = this.worldSize / 2;
      this.outerR = (this.worldSize / 2) * 0.95;
      this.innerR = this.outerR * CONFIG.CENTER_RATIO;
      this.ringWidth = (this.outerR - this.innerR) / CONFIG.NUM_RINGS;
      this._worldInited = true;
    }
  }

  setViewport(scale, tx, ty, rotation = 0) {
    this.vpScale = scale;
    this.vpTx = tx;
    this.vpTy = ty;
    this.vpRotation = rotation;
  }

  draw() {
    const dpr = this._dprOverride || (window.devicePixelRatio || 1);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.clearRect(0, 0, this.canvasW, this.canvasH);

    // Apply viewport transform (world → screen)
    this.ctx.translate(this.vpTx, this.vpTy);
    this.ctx.scale(this.vpScale, this.vpScale);
    if (this.vpRotation) {
      this.ctx.translate(this.cx, this.cy);
      this.ctx.rotate(this.vpRotation);
      this.ctx.translate(-this.cx, -this.cy);
    }

    // 1. Draw all slices (filled)
    for (let s = 0; s < this.sectors.length; s++) {
      const sector = this.sectors[s];
      const sectorStart = s * this.sectorAngle;

      for (let ri = 0; ri < CONFIG.NUM_RINGS; ri++) {
        const words = sector.rings[ri];
        const m = words.length;
        const rIn = this.innerR + ri * this.ringWidth + CONFIG.RING_GAP;
        const rOut = this.innerR + (ri + 1) * this.ringWidth;
        const color = ColorHelper.getRingColor(sector.baseColor, ri);

        for (let wi = 0; wi < m; wi++) {
          const aStart = sectorStart + (wi / m) * this.sectorAngle;
          const aEnd = sectorStart + ((wi + 1) / m) * this.sectorAngle;
          const path = this.getSlicePath(aStart, aEnd, rIn, rOut);

          this.ctx.fillStyle = ColorHelper.rgb(color);
          this.ctx.fill(path);

          this.ctx.strokeStyle = "rgba(255,255,255,0.6)";
          this.ctx.lineWidth = CONFIG.DIVIDER_WIDTH;
          this.ctx.stroke(path);
        }
      }
    }

    // 2. Draw highlights
    for (const key of this.selected) {
      const [s, ri, wi] = key.split("-").map(Number);
      const sector = this.sectors[s];
      if (!sector) continue;
      const sectorStart = s * this.sectorAngle;
      const m = sector.rings[ri].length;
      const rIn = this.innerR + ri * this.ringWidth + CONFIG.RING_GAP;
      const rOut = this.innerR + (ri + 1) * this.ringWidth;
      const aStart = sectorStart + (wi / m) * this.sectorAngle;
      const aEnd = sectorStart + ((wi + 1) / m) * this.sectorAngle;
      const path = this.getSlicePath(aStart, aEnd, rIn, rOut);

      this.ctx.save();
      this.ctx.strokeStyle = "#000";
      this.ctx.lineWidth = CONFIG.HIGHLIGHT_WIDTH;
      this.ctx.shadowColor = "rgba(255,255,255,0.9)";
      this.ctx.shadowBlur = 6;
      this.ctx.stroke(path);
      this.ctx.restore();
    }

    // 3. Draw text
    for (let s = 0; s < this.sectors.length; s++) {
      const sector = this.sectors[s];
      const sectorStart = s * this.sectorAngle;

      for (let ri = 0; ri < CONFIG.NUM_RINGS; ri++) {
        const words = sector.rings[ri];
        const m = words.length;
        const rIn = this.innerR + ri * this.ringWidth;
        const rOut = this.innerR + (ri + 1) * this.ringWidth;
        const rMid = (rIn + rOut) / 2;

        for (let wi = 0; wi < m; wi++) {
          const aStart = sectorStart + (wi / m) * this.sectorAngle;
          const aEnd = sectorStart + ((wi + 1) / m) * this.sectorAngle;
          this.drawRadialText(words[wi], (aStart + aEnd) / 2, rMid, rOut - rIn, aEnd - aStart, sector.baseColor, ri);
        }
      }
    }

    // 4. Center disk — colored pie slices per sector
    for (let s = 0; s < this.sectors.length; s++) {
      const sector = this.sectors[s];
      const aStart = s * this.sectorAngle;
      const aEnd = (s + 1) * this.sectorAngle;
      const color = ColorHelper.lighten(sector.baseColor, 0.70);

      this.ctx.beginPath();
      this.ctx.moveTo(this.cx, this.cy);
      this.ctx.arc(this.cx, this.cy, this.innerR, aStart, aEnd, false);
      this.ctx.closePath();
      this.ctx.fillStyle = ColorHelper.rgb(color);
      this.ctx.fill();

      // Divider line
      this.ctx.strokeStyle = "rgba(255,255,255,0.8)";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    // Center disk border
    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, this.innerR, 0, 2 * Math.PI);
    this.ctx.strokeStyle = "#ccc";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    for (let s = 0; s < this.sectors.length; s++) {
      const sector = this.sectors[s];
      const aMid = s * this.sectorAngle + this.sectorAngle / 2;
      this.drawSectorLabel(sector.name, aMid, this.innerR * 0.55);
    }
  }

  getSlicePath(aStart, aEnd, rInner, rOuter) {
    const p = new Path2D();
    p.arc(this.cx, this.cy, rOuter, aStart, aEnd, false);
    p.arc(this.cx, this.cy, rInner, aEnd, aStart, true);
    p.closePath();
    return p;
  }

  drawRadialText(text, angle, rMid, ringH, arcSpan, baseColor, ringIdx) {
    this.ctx.save();
    this.ctx.translate(this.cx, this.cy);
    this.ctx.rotate(angle);

    const screenAngle = angle + (this.vpRotation || 0);
    const normAngle = ((screenAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const flip = normAngle > Math.PI / 2 && normAngle < (3 * Math.PI) / 2;

    // Fixed font size based on world geometry, NOT per-word arc length.
    // This ensures all words render at the same size on any screen/zoom.
    const fontSize = Math.max(5, Math.min(this.ringWidth * 0.28, 13));
    this.ctx.font = `${fontSize * 0.55}px sans-serif`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = ColorHelper.getLabelColor(baseColor, ringIdx);

    if (flip) {
      this.ctx.rotate(Math.PI);
      this.ctx.translate(-rMid, 0);
    } else {
      this.ctx.translate(rMid, 0);
    }

    this.ctx.fillText(text, 0, 0);
    this.ctx.restore();
  }

  drawSectorLabel(name, angle, r) {
    this.ctx.save();
    this.ctx.translate(this.cx, this.cy);
    this.ctx.rotate(angle);
    
    const screenAngle = angle + (this.vpRotation || 0);
    const normAngle = ((screenAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const flip = normAngle > Math.PI / 2 && normAngle < (3 * Math.PI) / 2;

    const fontSize = Math.max(7, this.innerR * 0.13);
    this.ctx.font = `600 ${fontSize}px sans-serif`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = "#333";

    if (flip) {
      this.ctx.rotate(Math.PI);
      this.ctx.translate(-r, 0);
      this.ctx.rotate(-Math.PI / 2);
    } else {
      this.ctx.translate(r, 0);
      this.ctx.rotate(-Math.PI / 2);
    }
    this.ctx.fillText(name, 0, 0);
    this.ctx.restore();
  }

  hitTest(x, y) {
    const dx = x - this.cx;
    const dy = y - this.cy;
    const r = Math.sqrt(dx * dx + dy * dy);
    if (r < this.innerR || r > this.outerR) return null;

    let theta = Math.atan2(dy, dx);
    if (theta < 0) theta += 2 * Math.PI;

    const ringIdx = Math.floor((r - this.innerR) / this.ringWidth);
    const sectorIdx = Math.floor(theta / this.sectorAngle);
    if (sectorIdx < 0 || sectorIdx >= this.sectors.length) return null;

    const sectorStart = sectorIdx * this.sectorAngle;
    const m = this.sectors[sectorIdx].rings[ringIdx].length;
    const wordIdx = Math.floor(((theta - sectorStart) / this.sectorAngle) * m);

    return { sectorIdx, ringIdx, wordIdx };
  }

  toggleSelection(hit) {
    const key = `${hit.sectorIdx}-${hit.ringIdx}-${hit.wordIdx}`;
    if (this.selected.has(key)) {
      this.selected.delete(key);
    } else {
      this.selected.add(key);
    }
    // Salva seleção no Session Storage
    sessionStorage.setItem('emotion-wheel-selected', JSON.stringify(Array.from(this.selected)));
  }

  clearSelection() {
    this.selected.clear();
    sessionStorage.setItem('emotion-wheel-selected', JSON.stringify([]));
  }

  getSelectedGroups() {
    if (this.selected.size === 0) return null;
    const groups = {};
    for (const key of this.selected) {
      const [s, ri, wi] = key.split("-").map(Number);
      const sector = this.sectors[s];
      if (!sector) continue;
      const word = sector.rings[ri][wi];
      if (!groups[sector.name]) groups[sector.name] = { sectorIdx: s, words: [] };
      groups[sector.name].words.push(word);
    }
    return groups;
  }

  /**
   * Export the wheel as a PNG data URL at its natural (world) resolution,
   * independent of the current viewport zoom/pan.
   */
  exportDataURL(customScale) {
    const dpr = customScale || (window.devicePixelRatio || 1);
    const size = this.worldSize;
    const offscreen = document.createElement('canvas');
    offscreen.width = size * dpr;
    offscreen.height = size * dpr;

    // Temporarily swap context and viewport
    const origCtx = this.ctx;
    const origW = this.canvasW;
    const origH = this.canvasH;
    const origS = this.vpScale;
    const origTx = this.vpTx;
    const origTy = this.vpTy;
    const origRot = this.vpRotation;

    this._dprOverride = dpr;
    this.ctx = offscreen.getContext('2d');
    this.canvasW = size;
    this.canvasH = size;
    this.vpScale = 1;
    this.vpTx = 0;
    this.vpTy = 0;
    this.vpRotation = 0;

    this.draw();
    const url = offscreen.toDataURL('image/png');

    // Restore
    delete this._dprOverride;
    this.ctx = origCtx;
    this.canvasW = origW;
    this.canvasH = origH;
    this.vpScale = origS;
    this.vpTx = origTx;
    this.vpTy = origTy;
    this.vpRotation = origRot;

    return url;
  }

  /**
   * Export the wheel as an SVG string — fully vectorized.
   * Replicates the canvas drawing as SVG paths and text elements.
   */
  exportSVG() {
    const ws = this.worldSize;
    const cx = this.cx;
    const cy = this.cy;
    const parts = [];

    parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ws} ${ws}" width="${ws}" height="${ws}">`);
    parts.push(`<style>text { font-family: sans-serif; }</style>`);

    // Helper: describe an arc slice path (annular sector)
    const arcPath = (aStart, aEnd, rIn, rOut) => {
      const x1 = cx + rOut * Math.cos(aStart);
      const y1 = cy + rOut * Math.sin(aStart);
      const x2 = cx + rOut * Math.cos(aEnd);
      const y2 = cy + rOut * Math.sin(aEnd);
      const x3 = cx + rIn * Math.cos(aEnd);
      const y3 = cy + rIn * Math.sin(aEnd);
      const x4 = cx + rIn * Math.cos(aStart);
      const y4 = cy + rIn * Math.sin(aStart);
      const largeArc = (aEnd - aStart) > Math.PI ? 1 : 0;
      return [
        `M ${x1} ${y1}`,
        `A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${rIn} ${rIn} 0 ${largeArc} 0 ${x4} ${y4}`,
        `Z`
      ].join(' ');
    };

    // 1. All ring slices (filled)
    for (let s = 0; s < this.sectors.length; s++) {
      const sector = this.sectors[s];
      const sectorStart = s * this.sectorAngle;
      for (let ri = 0; ri < CONFIG.NUM_RINGS; ri++) {
        const words = sector.rings[ri];
        const m = words.length;
        const rIn = this.innerR + ri * this.ringWidth + CONFIG.RING_GAP;
        const rOut = this.innerR + (ri + 1) * this.ringWidth;
        const color = ColorHelper.getRingColor(sector.baseColor, ri);
        for (let wi = 0; wi < m; wi++) {
          const aStart = sectorStart + (wi / m) * this.sectorAngle;
          const aEnd = sectorStart + ((wi + 1) / m) * this.sectorAngle;
          const d = arcPath(aStart, aEnd, rIn, rOut);
          parts.push(`<path d="${d}" fill="${ColorHelper.rgb(color)}" stroke="rgba(255,255,255,0.6)" stroke-width="${CONFIG.DIVIDER_WIDTH}"/>`);
        }
      }
    }

    // 2. Highlights for selected items
    for (const key of this.selected) {
      const [s, ri, wi] = key.split("-").map(Number);
      const sector = this.sectors[s];
      if (!sector) continue;
      const sectorStart = s * this.sectorAngle;
      const m = sector.rings[ri].length;
      const rIn = this.innerR + ri * this.ringWidth + CONFIG.RING_GAP;
      const rOut = this.innerR + (ri + 1) * this.ringWidth;
      const aStart = sectorStart + (wi / m) * this.sectorAngle;
      const aEnd = sectorStart + ((wi + 1) / m) * this.sectorAngle;
      const d = arcPath(aStart, aEnd, rIn, rOut);
      parts.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="${CONFIG.HIGHLIGHT_WIDTH}"/>`);
    }

    // 3. Text labels
    for (let s = 0; s < this.sectors.length; s++) {
      const sector = this.sectors[s];
      const sectorStart = s * this.sectorAngle;
      for (let ri = 0; ri < CONFIG.NUM_RINGS; ri++) {
        const words = sector.rings[ri];
        const m = words.length;
        const rIn = this.innerR + ri * this.ringWidth;
        const rOut = this.innerR + (ri + 1) * this.ringWidth;
        const rMid = (rIn + rOut) / 2;
        const fontSize = Math.max(5, Math.min(this.ringWidth * 0.28, 13));

        for (let wi = 0; wi < m; wi++) {
          const aStart = sectorStart + (wi / m) * this.sectorAngle;
          const aEnd = sectorStart + ((wi + 1) / m) * this.sectorAngle;
          const angle = (aStart + aEnd) / 2;

          // Position along the radius
          const tx = cx + rMid * Math.cos(angle);
          const ty = cy + rMid * Math.sin(angle);

          // Flip text on the left half so it reads left-to-right
          const normAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
          const flip = normAngle > Math.PI / 2 && normAngle < (3 * Math.PI) / 2;
          const rotDeg = flip
            ? (angle * 180 / Math.PI) + 180
            : (angle * 180 / Math.PI);

          const fillColor = ColorHelper.getLabelColor(sector.baseColor, ri);
          parts.push(`<text x="${tx}" y="${ty}" font-size="${fontSize * 0.55}" fill="${fillColor}" text-anchor="middle" dominant-baseline="central" transform="rotate(${rotDeg}, ${tx}, ${ty})">${this.escSvg(words[wi])}</text>`);
        }
      }
    }

    // 4. Center disk — colored pie slices
    for (let s = 0; s < this.sectors.length; s++) {
      const sector = this.sectors[s];
      const aStart = s * this.sectorAngle;
      const aEnd = (s + 1) * this.sectorAngle;
      const color = ColorHelper.lighten(sector.baseColor, 0.70);
      const x1 = cx + this.innerR * Math.cos(aStart);
      const y1 = cy + this.innerR * Math.sin(aStart);
      const x2 = cx + this.innerR * Math.cos(aEnd);
      const y2 = cy + this.innerR * Math.sin(aEnd);
      const largeArc = (aEnd - aStart) > Math.PI ? 1 : 0;
      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${this.innerR} ${this.innerR} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      parts.push(`<path d="${d}" fill="${ColorHelper.rgb(color)}" stroke="rgba(255,255,255,0.8)" stroke-width="1"/>`);
    }

    // Center disk border
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${this.innerR}" fill="none" stroke="#ccc" stroke-width="1"/>`);

    // 5. Sector labels (center)
    for (let s = 0; s < this.sectors.length; s++) {
      const sector = this.sectors[s];
      const aMid = s * this.sectorAngle + this.sectorAngle / 2;
      const r = this.innerR * 0.55;
      const tx = cx + r * Math.cos(aMid);
      const ty = cy + r * Math.sin(aMid);

      const normAngle = ((aMid % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const flip = normAngle > Math.PI / 2 && normAngle < (3 * Math.PI) / 2;
      // Sector labels are rotated -90° from radial direction
      const rotDeg = flip
        ? (aMid * 180 / Math.PI) + 180 - 90
        : (aMid * 180 / Math.PI) - 90;

      const fontSize = Math.max(7, this.innerR * 0.13);
      parts.push(`<text x="${tx}" y="${ty}" font-size="${fontSize}" font-weight="600" fill="#333" text-anchor="middle" dominant-baseline="central" transform="rotate(${rotDeg}, ${tx}, ${ty})">${this.escSvg(sector.name)}</text>`);
    }

    parts.push('</svg>');
    return parts.join('\n');
  }

  /** Escape special characters for SVG text content */
  escSvg(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
