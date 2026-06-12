# YouTube Focus 🎯

תוסף Chrome ליצירת חוויית צפייה ממוקדת ביוטיוב — חסימת פרסומות, הסתרת הצעות סרטונים והסחות דעת.
A Chrome extension for a focused YouTube experience — block ads, hide suggestions and distractions.

© **מעבדות שלמות / Shlemut Labs**. כל הזכויות שמורות / All rights reserved.
✉️ שאלות ובקשות / Questions & requests: **shlmut@otzmashelkesher.co.il**

---

## עברית 🇮🇱

### התקנה (לשליחה לחברים)
1. חלץ את תיקיית `yt-focus` למקום קבוע במחשב (למשל "המסמכים שלי"). אל תמחק אותה אחרי ההתקנה.
2. פתח כרום ועבור אל: `chrome://extensions`
3. הדלק למעלה את **"מצב מפתח" (Developer mode)**.
4. לחץ **"טען פריט שלא ארוז" (Load unpacked)** ובחר את תיקיית `yt-focus`.
5. האייקון 🎯 יופיע בסרגל הכלים. לחץ עליו לפתיחת ההגדרות.

### שימוש
- **מתג ראשי** מפעיל/מכבה הכל (קיצור `Alt+F`).
- כל פיצ'ר נשלט בנפרד. כל לחיצה מוחלת מיד על הלשונית הפתוחה.
- **פרופילים:** 📚 מצב לימוד (מסתיר הכל) / 🎬 מצב רגיל (רק פרסומות).
- **מתג שפה** בראש החלון — מעבר מהיר בין עברית לאנגלית.
- **מונה פרסומות** סופר כמה נחסמו.
- **Whitelist** — בעמוד סרטון אפשר לאשר פרסומות בערוץ שאוהבים (תמיכה ביוצרים).
- קיצורים: `Alt+F` מצב פוקוס, `Alt+S` הסתרת/הצגת הצעות.

### מגבלות
יוטיוב משנה מדי פעם את שיטות הפרסום. אם פרסומות חוזרות, ייתכן שיידרש עדכון.
התוסף לשימוש אישי. הפצה מסחרית דורשת אישור מבעל הזכויות.

---

## English 🇬🇧

### Installation (to share with friends)
1. Extract the `yt-focus` folder to a permanent location (e.g. Documents). Don't delete it after installing.
2. Open Chrome and go to: `chrome://extensions`
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the `yt-focus` folder.
5. The 🎯 icon appears in the toolbar. Click it to open settings.

### Usage
- **Master switch** turns everything on/off (`Alt+F`).
- Every feature is independent. Each click applies instantly to the open tab.
- **Profiles:** 📚 Study mode (hides everything) / 🎬 Normal mode (ads only).
- **Language toggle** at the top — switch Hebrew/English instantly.
- **Ad counter** shows how many ads were blocked.
- **Whitelist** — on a video page you can allow ads on channels you support.
- Shortcuts: `Alt+F` focus mode, `Alt+S` toggle suggestions.

### Limitations
YouTube periodically changes its ad delivery. If ads return, an update may be needed.
For personal use. Commercial distribution requires permission from the copyright holder.

---

## How it's built
Manifest V3 · `declarativeNetRequest` for network-level ad blocking · CSS-class-based hiding ·
`MutationObserver` + SPA navigation support · `chrome.storage.sync` · Vanilla JS, no build step.

```
yt-focus/
├── manifest.json
├── rules.json          # ad-blocking network rules
├── background.js       # service worker: counter + settings
├── content/
│   ├── content.js      # observer + class injection + ad skipping
│   └── focus.css       # all hiding rules
├── popup/
│   ├── popup.html
│   ├── popup.css
│   ├── popup.js
│   └── i18n.js         # Hebrew/English dictionary
├── icons/  (16/48/128)
├── LICENSE.txt
└── README.md
```

© Shlemut Labs / מעבדות שלמות — shlmut@otzmashelkesher.co.il
