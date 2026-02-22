/**
 * Emotion Wheel Data & Constants
 * Aggregates all language modules into a single LANGUAGES export.
 * Base colours are injected from theme.js so lang files stay colour-free.
 */

import pt from './lang/pt.js';
import en from './lang/en.js';
import es from './lang/es.js';
import fr from './lang/fr.js';
import de from './lang/de.js';
import it from './lang/it.js';
import ru from './lang/ru.js';
import ja from './lang/ja.js';
import ko from './lang/ko.js';
import zh from './lang/zh.js';
import ar from './lang/ar.js';
import hi from './lang/hi.js';
import tr from './lang/tr.js';
import { BASE_COLORS } from './theme.js';

// Inject base colours into every language's sectors so wheel.js always
// finds sector.baseColor regardless of whether the lang file defines it.
const rawLanguages = { pt, en, es, fr, de, it, ru, ja, ko, zh, ar, hi, tr };
for (const lang of Object.values(rawLanguages)) {
  lang.sectors.forEach((sector, i) => {
    sector.baseColor = BASE_COLORS[i];
  });
}
export const LANGUAGES = rawLanguages;

export const CONFIG = {
  NUM_RINGS: 4,
  CENTER_RATIO: 0.18,
  RING_GAP: 0,
  DIVIDER_WIDTH: 0.5,
  HIGHLIGHT_WIDTH: 3
};
