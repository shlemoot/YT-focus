/**
 * YouTube Focus — i18n.js
 * Bilingual dictionary (Hebrew / English) + helper to apply a language.
 * © Shlemut Labs / מעבדות שלמות. All rights reserved.
 */

"use strict";

const I18N = {
  he: {
    "subtitle": "חוויית צפייה ממוקדת",
    "adsBlocked": "פרסומות נחסמו",
    "focusOn": "מצב פוקוס פעיל",
    "focusOff": "מצב פוקוס כבוי",
    "hintToggle": "Alt+F להפעלה/כיבוי מהיר",
    "profileStudy": "📚 מצב לימוד",
    "profileNormal": "🎬 מצב רגיל",
    "groupAds": "פרסומות",
    "groupFocus": "מיקוד",
    "groupPlayer": "נגן",
    "featBlockAds": "חסימת פרסומות וידאו ודילוג אוטומטי",
    "featSearchAds": "הסתרת מודעות בחיפוש ובסיידבר",
    "featSecondary": "הסתרת עמודת ההצעות בנגן",
    "featExpand": "מירכוז והרחבת הנגן",
    "featHome": "הסתרת פיד עמוד הבית",
    "featChannel": "הסתרת המלצות בעמוד ערוץ",
    "featShorts": "הסתרת Shorts",
    "featEndScreen": "הסתרת מסך הסיום",
    "featComments": "הסתרת תגובות",
    "featTheater": "מצב קולנוע אוטומטי",
    "featAutoplay": "ביטול השמעה אוטומטית של הסרטון הבא",
    "featAnim": "אנימציית מעבר עדינה",
    "wlAllow": "★ אפשר פרסומות בערוץ הזה",
    "wlAllowed": "✓ פרסומות מאופשרות בערוץ זה",
    "wlOpenVideo": "פתח סרטון כדי לנהל ערוץ ב-whitelist",
    "wlNoChannel": "לא זוהה ערוץ בדף הנוכחי",
    "wlChannelPrefix": "ערוץ: ",
    "contact": "✉️ שאלות ובקשות — צור קשר",
    "copyright": "© מעבדות שלמות. כל הזכויות שמורות.",
    "resetCount": "איפוס מונה",
    "checkUpdate": "⬇️ בדוק עדכונים",
    "checking": "בודק…",
    "upToDate": "הגרסה שלך עדכנית ✓",
    "updateAvailable": "גרסה חדשה זמינה! לחץ להורדה",
    "updateError": "בדיקת העדכון נכשלה. נסה שוב מאוחר יותר."
  },
  en: {
    "subtitle": "A focused viewing experience",
    "adsBlocked": "ads blocked",
    "focusOn": "Focus mode ON",
    "focusOff": "Focus mode OFF",
    "hintToggle": "Alt+F to toggle quickly",
    "profileStudy": "📚 Study mode",
    "profileNormal": "🎬 Normal mode",
    "groupAds": "Ads",
    "groupFocus": "Focus",
    "groupPlayer": "Player",
    "featBlockAds": "Block video ads & auto-skip",
    "featSearchAds": "Hide ads in search & sidebar",
    "featSecondary": "Hide the suggestions column",
    "featExpand": "Center & widen the player",
    "featHome": "Hide the home feed",
    "featChannel": "Hide channel recommendations",
    "featShorts": "Hide Shorts",
    "featEndScreen": "Hide the end screen",
    "featComments": "Hide comments",
    "featTheater": "Auto theater mode",
    "featAutoplay": "Disable autoplay of next video",
    "featAnim": "Smooth transition animation",
    "wlAllow": "★ Allow ads on this channel",
    "wlAllowed": "✓ Ads allowed on this channel",
    "wlOpenVideo": "Open a video to manage channel whitelist",
    "wlNoChannel": "No channel detected on this page",
    "wlChannelPrefix": "Channel: ",
    "contact": "✉️ Questions & requests — Contact",
    "copyright": "© Shlemut Labs. All rights reserved.",
    "resetCount": "Reset counter",
    "checkUpdate": "⬇️ Check for updates",
    "checking": "Checking…",
    "upToDate": "You're up to date ✓",
    "updateAvailable": "New version available! Click to download",
    "updateError": "Update check failed. Try again later."
  }
};

function detectLang() {
  const l = (navigator.language || "en").toLowerCase();
  return l.startsWith("he") || l.startsWith("iw") ? "he" : "en";
}

function applyLang(lang) {
  const dict = I18N[lang] || I18N.en;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });
  const toggle = document.getElementById("langToggle");
  if (toggle) toggle.textContent = lang === "he" ? "EN" : "עב";
  return dict;
}
