/**
 * Emotion Wheel – theme.js
 * Centralises sector base colours so lang files stay colour-free.
 * Order matches the sector order defined in pt.js (the source of truth).
 *
 * Sector index:
 *  0 – Fear/Medo/Miedo/…
 *  1 – Anger/Raiva/Ira/…
 *  2 – Sadness/Tristeza/…
 *  3 – Surprise/Surpresa/…
 *  4 – Joy/Alegria/…
 *  5 – Love/Amor/…
 */
export const BASE_COLORS = [
  [120,   0, 180],   // Fear     – violet
  [220,  40,  40],   // Anger    – red
  [ 50, 100, 200],   // Sadness  – blue
  [255, 180,   0],   // Surprise – yellow
  [ 60, 180,  75],   // Joy      – green
  [230,  80, 150],   // Love     – pink
];
