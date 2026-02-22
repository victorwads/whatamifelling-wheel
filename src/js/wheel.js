import { CONFIG } from './data.js';
import { ColorHelper } from './color.js';

/**
 * Main Class to handle Emotion Wheel rendering and hit testing
 */
export class EmotionWheel {
  constructor(canvas, sectors) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.selected = new Set();
    this.sectors = sectors;
    
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
    this.selected.clear();
  }

  resize(containerW, containerH) {
    const dpr = window.devicePixelRatio || 1;
    this.canvasW = containerW;
    this.canvasH = containerH;
    this.canvas.width = containerW * dpr;
    this.canvas.height = containerH * dpr;
    this.canvas.style.width = containerW + "px";
    this.canvas.style.height = containerH + "px";

    // World size: the wheel occupies a square of this size
    this.worldSize = Math.min(containerW, containerH);
    this.cx = this.worldSize / 2;
    this.cy = this.worldSize / 2;
    this.outerR = (this.worldSize / 2) * 0.95;
    this.innerR = this.outerR * CONFIG.CENTER_RATIO;
    this.ringWidth = (this.outerR - this.innerR) / CONFIG.NUM_RINGS;
  }

  setViewport(scale, tx, ty) {
    this.vpScale = scale;
    this.vpTx = tx;
    this.vpTy = ty;
  }

  draw() {
    const dpr = window.devicePixelRatio || 1;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.clearRect(0, 0, this.canvasW, this.canvasH);

    // Apply viewport transform (world → screen)
    this.ctx.translate(this.vpTx, this.vpTy);
    this.ctx.scale(this.vpScale, this.vpScale);

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

    const normAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const flip = normAngle > Math.PI / 2 && normAngle < (3 * Math.PI) / 2;

    const arcLen = arcSpan * rMid;
    let fontSize = Math.min(arcLen * 0.80, 13);
    this.ctx.font = `${fontSize}px sans-serif`;
    let measured = this.ctx.measureText(text).width;
    while (measured > ringH * 0.88 && fontSize > 4) {
      fontSize -= 0.5;
      this.ctx.font = `${fontSize}px sans-serif`;
      measured = this.ctx.measureText(text).width;
    }

    this.ctx.font = `${fontSize}px sans-serif`;
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
    const normAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
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
  }

  clearSelection() {
    this.selected.clear();
  }

  getSelectedGroups() {
    if (this.selected.size === 0) return null;
    const groups = {};
    for (const key of this.selected) {
      const [s, ri, wi] = key.split("-").map(Number);
      const sector = this.sectors[s];
      if (!sector) continue;
      const word = sector.rings[ri][wi];
      if (!groups[sector.name]) groups[sector.name] = [];
      groups[sector.name].push(word);
    }
    return groups;
  }

  /**
   * Export the wheel as a PNG data URL at its natural (world) resolution,
   * independent of the current viewport zoom/pan.
   */
  exportDataURL() {
    const dpr = window.devicePixelRatio || 1;
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

    this.ctx = offscreen.getContext('2d');
    this.canvasW = size;
    this.canvasH = size;
    this.vpScale = 1;
    this.vpTx = 0;
    this.vpTy = 0;

    this.draw();
    const url = offscreen.toDataURL('image/png');

    // Restore
    this.ctx = origCtx;
    this.canvasW = origW;
    this.canvasH = origH;
    this.vpScale = origS;
    this.vpTx = origTx;
    this.vpTy = origTy;

    return url;
  }
}
