/**
 * Emotion Wheel Data & Constants
 * Aggregates all language modules into a single LANGUAGES export
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

export const LANGUAGES = { pt, en, es, fr, de, it, ru, ja, ko, zh, ar, hi, tr };

export const CONFIG = {
  NUM_RINGS: 4,
  CENTER_RATIO: 0.18,
  RING_GAP: 0,
  DIVIDER_WIDTH: 0.5,
  HIGHLIGHT_WIDTH: 3
};
