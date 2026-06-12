# הגדרת מנגנון העדכונים דרך GitHub
# Setting up updates via GitHub

כדי שכפתור "בדוק עדכונים" בתוסף יעבוד, צריך פעם אחת להעלות את הקבצים ל-GitHub.
To make the "Check for updates" button work, upload the files to GitHub once.

---

## שלב 1 — צור חשבון ומאגר (Repository)
1. היכנס ל-https://github.com והירשם (חינם).
2. לחץ על **New repository**.
3. שם המאגר: `yt-focus` (חייב להיות **Public**).
4. לחץ **Create repository**.

## שלב 2 — העלה את קבצי התוסף
1. במאגר החדש לחץ **Add file → Upload files**.
2. גרור את **כל התוכן** של תיקיית `yt-focus` (כל הקבצים והתיקיות).
3. לחץ **Commit changes**.

## שלב 3 — עדכן את הכתובת בקוד (פעם אחת)
1. פתח את הקובץ `background.js`.
2. בשורה עם `UPDATE_URL`, החלף את `USERNAME` בשם המשתמש שלך ב-GitHub. לדוגמה אם שם המשתמש הוא `david`:
   ```
   const UPDATE_URL = "https://raw.githubusercontent.com/david/yt-focus/main/version.json";
   ```
3. באותו אופן, ערוך את `version.json` והחלף `USERNAME` בקישור ההורדה.
4. שמור והעלה מחדש את שני הקבצים ל-GitHub (Upload files שוב, או עריכה ישירה ב-GitHub).

## שלב 4 — שחרור גרסה להורדה (Release)
1. במאגר לחץ **Releases → Create a new release**.
2. תייג גרסה: `v1.2.0`.
3. צרף את הקובץ `yt-focus.zip` (גרור אותו לאזור הקבצים).
4. לחץ **Publish release**.

מעכשיו, קישור ההורדה לחברים הוא דף ה-Releases:
`https://github.com/USERNAME/yt-focus/releases`

---

## איך מוציאים עדכון בעתיד
כשתרצה לשחרר גרסה חדשה (למשל אחרי שיוטיוב שינה משהו והפרסומות חזרו):
1. עדכן את הקוד בתוסף.
2. העלה `version.number` חדש ב-`manifest.json` (למשל `1.3.0`).
3. עדכן את `version.json` באותו מספר גרסה.
4. צור Release חדש עם ה-ZIP המעודכן.

כשחבר ילחץ "בדוק עדכונים" — התוסף ישווה את הגרסה שלו ל-`version.json`,
ואם יש חדשה יופיע כפתור ירוק שמוביל לדף ההורדה.

---

## English (short)
1. Create a **public** GitHub repo named `yt-focus`.
2. Upload all extension files.
3. In `background.js`, replace `USERNAME` in `UPDATE_URL` with your GitHub username.
   Do the same in `version.json` (the `download` link).
4. Create a Release, attach `yt-focus.zip`, publish.
5. Share the Releases page link with friends.
   To ship an update: bump the version in `manifest.json` AND `version.json`, then publish a new Release.

© Shlemut Labs / מעבדות שלמות — shlmut@otzmashelkesher.co.il
