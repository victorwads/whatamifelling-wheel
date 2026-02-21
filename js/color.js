/**
 * Helper for color utilities
 */
export class ColorHelper {
  /** Lighten / darken an [r,g,b] by mixing with white. factor 0→original, 1→white */
  static lighten([r, g, b], factor) {
    return [
      Math.round(r + (255 - r) * factor),
      Math.round(g + (255 - g) * factor),
      Math.round(b + (255 - b) * factor),
    ];
  }

  static rgb(arr) {
    return `rgb(${arr[0]},${arr[1]},${arr[2]})`;
  }

  /** Return color for a given ring index (0 = innermost = lightest, 3 = outermost = darkest). */
  static getRingColor(base, ringIdx) {
    const factors = [0.55, 0.35, 0.15, 0.0];
    return this.lighten(base, factors[ringIdx]);
  }

  /** Determine text color (dark or light) based on background brightness. */
  static getLabelColor(base, ringIdx) {
    const c = this.getRingColor(base, ringIdx);
    const lum = 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
    return lum > 160 ? "#222" : "#fff";
  }
}
