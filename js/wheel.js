import { SECTORS, CONFIG } from './data.js';
import { ColorHelper } from './color.js';

/**
 * Main Class to handle Emotion Wheel rendering and hit testing
 */
export class EmotionWheel {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.selected = new Set();
    
    // Geometry state
    this.cx = 0;
    this.cy = 0;
    this.outerR = 0;
    this.innerR = 0;
    this.ringWidth = 0;
    this.sectorAngle = (2 * Math.PI) / SECTORS.length;
  }

  resize(width, height) {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.cx = width / 2;
    this.cy = height / 2;
    this.outerR = (width / 2) * 0.95;
    this.innerR = this.outerR * CONFIG.CENTER_RATIO;
    this.ringWidth = (this.outerR - this.innerR) / CONFIG.NUM_RINGS;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw all slices (filled)
    for (let s = 0; s < SECTORS.length; s++) {
      const sector = SECTORS[s];
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
      const sector = SECTORS[s];
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
    for (let s = 0; s < SECTORS.length; s++) {
      const sector = SECTORS[s];
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

    // 4. Center disk
    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, this.innerR, 0, 2 * Math.PI);
    this.ctx.fillStyle = "#fff";
    this.ctx.fill();
    this.ctx.strokeStyle = "#ccc";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    for (let s = 0; s < SECTORS.length; s++) {
      const sector = SECTORS[s];
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

    const fontSize = Math.max(9, this.innerR * 0.22);
    this.ctx.font = `bold ${fontSize}px sans-serif`;
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
    if (sectorIdx < 0 || sectorIdx >= SECTORS.length) return null;

    const sectorStart = sectorIdx * this.sectorAngle;
    const m = SECTORS[sectorIdx].rings[ringIdx].length;
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
      const sector = SECTORS[s];
      const word = sector.rings[ri][wi];
      if (!groups[sector.name]) groups[sector.name] = [];
      groups[sector.name].push(word);
    }
    return groups;
  }
}
