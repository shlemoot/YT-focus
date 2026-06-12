# מדריך GitHub Desktop — העלאה ועדכונים
# YouTube Focus · מעבדות שלמות

המדריך הזה מסביר איך להעלות את התוסף ל-GitHub דרך GitHub Desktop (התוכנה שכבר יש לך),
ואיך להוציא עדכונים בעתיד. אין צורך בידע טכני — רק לחיצות.

═══════════════════════════════════════════════
## חלק א' — הקמה ראשונית (פעם אחת בלבד)
═══════════════════════════════════════════════

### שלב 1 — צור מאגר חדש בשם yt-focus
1. ב-GitHub Desktop: למעלה משמאל לחץ **File → New repository**
   (או Current repository → Add → Create new repository)
2. מלא:
   - **Name:** `yt-focus`
   - **Local path:** בחר מקום נוח (למשל המסמכים שלך)
   - סמן **Initialize this repository with a README** (לא חובה)
3. לחץ **Create repository**.

### שלב 2 — העתק את קבצי התוסף לתוך המאגר
1. ב-GitHub Desktop לחץ **Repository → Show in Explorer** (Ctrl+Shift+F).
   ייפתח חלון של התיקייה החדשה `yt-focus`.
2. העתק לתוך התיקייה הזו את **כל הקבצים** של התוסף:
   manifest.json, background.js, rules.json, version.json,
   והתיקיות content/ , popup/ , icons/ , וגם README.md, LICENSE.txt.
   (פשוט גרור הכל פנימה.)

### שלב 3 — פרסם (Publish) ל-GitHub
1. חזור ל-GitHub Desktop. בצד שמאל תראה את כל הקבצים תחת "Changes".
2. למטה משמאל, בשדה **Summary** כתוב: `First version 1.3.0`
3. לחץ **Commit to main**.
4. למעלה לחץ **Publish repository**.
   - ודא ש-**"Keep this code private"** *לא* מסומן (המאגר חייב להיות Public כדי שהעדכון יעבוד).
5. לחץ **Publish repository**.

### שלב 4 — מצא את שם המשתמש שלך והכתובת
1. לחץ **Repository → View on GitHub** (Ctrl+Shift+G). ייפתח הדפדפן.
2. הסתכל על הכתובת למעלה. היא תיראה כך:
   `https://github.com/SHEM-MISHTAMESH/yt-focus`
   החלק `SHEM-MISHTAMESH` הוא שם המשתמש שלך. **שמור אותו** — נצטרך אותו פעם אחת.

### שלב 5 — עדכן את כתובת העדכון בקוד (פעם אחת)
1. פתח את הקובץ `background.js` (אפשר דרך Repository → Open in Visual Studio Code, או כל עורך).
2. מצא את השורה:
   const UPDATE_URL = "https://raw.githubusercontent.com/USERNAME/yt-focus/main/version.json";
3. החלף את `USERNAME` בשם המשתמש שלך מהשלב הקודם. שמור.
4. פתח את `version.json` והחלף גם שם את `USERNAME` בקישור ההורדה. שמור.
5. חזור ל-GitHub Desktop → Summary: `Set update URL` → **Commit to main** → **Push origin**.

═══════════════════════════════════════════════
## חלק ב' — איך שולחים ללקוח
═══════════════════════════════════════════════

1. ב-GitHub באתר (View on GitHub) לחץ **Releases** (בצד ימין) → **Create a new release**.
2. **Tag:** `v1.3.0` · **Title:** `YouTube Focus 1.3.0`
3. גרור את הקובץ `yt-focus.zip` לאזור הקבצים למטה.
4. לחץ **Publish release**.
5. הקישור שתשלח ללקוחות:
   `https://github.com/SHEM-MISHTAMESH/yt-focus/releases`
   הלקוח מוריד את ה-ZIP, מחלץ, ומתקין לפי ההוראות ב-README.

═══════════════════════════════════════════════
## חלק ג' — איך מוציאים עדכון בעתיד
═══════════════════════════════════════════════

כשיוטיוב משתנה והפרסומות חוזרות, או כשתרצה להוסיף פיצ'ר:
1. אני אכין לך גרסה חדשה (קבצים + מספר גרסה חדש, למשל 1.4.0).
2. העתק את הקבצים החדשים לתיקיית yt-focus (דרוס את הישנים).
3. ב-GitHub Desktop: Summary `Version 1.4.0` → **Commit to main** → **Push origin**.
4. צור **Release חדש** עם ה-ZIP החדש (כמו בחלק ב').

זהו! כשלקוח ילחץ "בדוק עדכונים" בתוסף, הוא יראה שיש גרסה חדשה
ויקבל קישור ישיר להורדה.

═══════════════════════════════════════════════

© מעבדות שלמות / Shlemut Labs — shlmut@otzmashelkesher.co.il
