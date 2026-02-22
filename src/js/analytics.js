/**
 * Analytics module — wraps Firebase Analytics SDK.
 * All event names and parameters are centralized here.
 *
 * Debug: add ?debug=true to the URL to see events logged in the console.
 * Firebase DebugView: install the Google Analytics Debugger extension
 * or add ?firebase_debug=true to enable real-time DebugView in Firebase console.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAnalytics, logEvent, setUserProperties } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyCREHXxyytzQfisgP3c2syZwgHtJLxCfD4",
  authDomain: "whatamifelling.firebaseapp.com",
  projectId: "whatamifelling",
  storageBucket: "whatamifelling.firebasestorage.app",
  messagingSenderId: "591867024928",
  appId: "1:591867024928:web:cde827caa412c6f6368e45",
  measurementId: "G-GW7XVYLDKX"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const DEBUG = location.search.includes('debug=true');

function send(eventName, params = {}) {
  if (DEBUG) {
    console.log(`[Analytics] ${eventName}`, params);
  }
  try {
    logEvent(analytics, eventName, params);
  } catch (err) {
    console.error(`[Analytics] Failed to send "${eventName}":`, err);
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Set the user's preferred language as a user property.
 * This shows up in the User Properties section of Firebase Analytics.
 */
export function setLanguageProperty(language) {
  try {
    setUserProperties(analytics, { preferred_language: language });
  } catch (err) {
    console.error('[Analytics] Failed to set user property:', err);
  }
}

/**
 * User changed language in the selector.
 * Firebase Console: Events > language_change, filter by `language` param.
 */
export function trackLanguageChange(language) {
  send('language_change', { language });
}

/**
 * User clicked/tapped an emotion on the wheel.
 * All names are in English for consistent aggregation.
 * Firebase Console: Events > emotion_click, filter by `emotion`, `category`, `ring`.
 */
export function trackEmotionClick(emotion, category, ring, language) {
  send('emotion_click', {
    emotion,       // e.g. "Anxious"
    category,      // e.g. "Fear"
    ring,          // 0-3 (inner to outer)
    language       // user's current language
  });
}

/**
 * User clicked the clear (trash) button.
 * Firebase Console: Events > clear_selection.
 */
export function trackClearSelection() {
  send('clear_selection');
}

/**
 * User copied the emotion list to clipboard.
 * Firebase Console: Events > copy_emotions, filter by `language`.
 */
export function trackCopyEmotions(language) {
  send('copy_emotions', { language });
}

/**
 * User opened the export dropdown menu.
 * Firebase Console: Events > export_menu_open.
 */
export function trackExportMenuOpen() {
  send('export_menu_open');
}

/**
 * User exported as PNG.
 * Firebase Console: Events > export_png, filter by `language`.
 */
export function trackExportPNG(language) {
  send('export_png', { language });
}

/**
 * User exported as PDF.
 * Firebase Console: Events > export_pdf, filter by `language`.
 */
export function trackExportPDF(language) {
  send('export_pdf', { language });
}

/**
 * User toggled the sidebar (mobile bottom sheet).
 * Firebase Console: Events > sidebar_toggle, filter by `action` (collapse/expand).
 */
export function trackSidebarToggle(action) {
  send('sidebar_toggle', { action }); // 'collapse' | 'expand'
}
