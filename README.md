# FRONTLINE, landing page

One static Hebrew (RTL) page: HTML, CSS and a little vanilla JS. No build step, no framework, no external requests except the visit counter once it is switched on.

דף נחיתה סטטי אחד בעברית. אין שלב בנייה, אין ספריות, ואין פניות לשרתים חיצוניים חוץ ממונה הביקורים, אחרי שמפעילים אותו.

## Files

| File | What it is |
|---|---|
| `index.html` | The page. Static Open Graph tags live in its `<head>`. |
| `config.js` | **The one place to edit.** Every value that is not confirmed yet. |
| `styles.css` | Design tokens and layout (logical CSS properties only). |
| `main.js` | Reads `config.js`, fills the page, runs the reveals and the ring. |
| `gate.sh` | The publish gate. Run it before every push. |
| `gate-test.sh` | Tests the gate itself on a throwaway clone (a malformed word list must fail, a missing one must not pass). |
| `assets/fonts/` | Self-hosted woff2 (IBM Plex Sans Hebrew 400/700, Karantina 700) and their OFL licences. |
| `assets/img/` | The logo mark, the three step images, and the student union and Reichman University logos (WebP; the two logos have a transparent background, cut from the files they came in, not redrawn). |
| `assets/og.png` | The 1200x630 share card. Source: `og/card.html`. |
| `assets/logo-source.jpg` | The original logo file. |
| `qa/` | Screenshots at 360/390/768/1280 px. Lighthouse JSON is kept locally, not committed. |

## How placeholders work / איך עובדים הערכים למילוי

Every unconfirmed value in `config.js` starts with `TODO_`. On the page it renders as a dashed chip that says **למילוי** plus the hint written after `TODO_`, so it can never be read as a fact. The prefix is recognised in any case and with stray spaces, so `" todo_..."` is still a chip. Replace a value only when it is true.

A value that is filled but malformed (a link without `https://`, an email without `@`, a phone number with words around it) renders as a chip that says **לבדוק את הערך**, never as a dead link, and the browser console names the key that was rejected.

Anything that is club policy and not yet decided lives in its own key and appears inside the FAQ answer as a chip. The FAQ never prints an undecided answer as plain text.

כל ערך שעוד לא אושר מתחיל ב־`TODO_`, ומופיע בדף כתגית מקווקוות "למילוי". מחליפים ערך רק כשהוא נכון. ערך שמולא אבל לא תקין מופיע כתגית "לבדוק את הערך", ולא כקישור שבור. מדיניות שעוד לא הוחלטה נשארת כתגית בתוך התשובה.

## config.js, key by key / מפתח אחר מפתח

| Key | English | עברית | Format |
|---|---|---|---|
| `SIGNUP_URL` | Sign-up form link. Until it is real, both buttons read "ההרשמה נפתחת בקרוב" and link nowhere. Fill it **last**. | קישור לטופס ההרשמה. עד שהוא אמיתי, הכפתורים כתובים "ההרשמה נפתחת בקרוב" ולא מקשרים לשום מקום. ממלאים אחרון. | `https://...` |
| `PARTNER_EMAIL` | The club's email, for the partner "מייל" button and the footer. Never a personal address. | המייל של המועדון, לכפתור "מייל" ולתחתית הדף. לא כתובת אישית. | an email address |
| `PARTNER_WHATSAPP` | The club's WhatsApp number for the "וואטסאפ" button. Never a personal number. Israeli local form is converted for you. | מספר הוואטסאפ של המועדון. לא מספר אישי. אפשר לכתוב גם בפורמט מקומי. | `+972 5X-XXX-XXXX` or `05X-XXX-XXXX` |
| `SEATS` | Places for participants only; the four managers are not counted. Shown as "15 מקומות". A number only: the page adds the word, so anything else is a "לבדוק את הערך" chip. | מספר המקומות למשתתפים בלבד, בלי המנהלים. מספר בלבד, המילה "מקומות" נוספת לבד. | a number |
| `DEADLINE` | Last day to apply (hero and FAQ). Kept in its own LTR run, so the digits never reorder. | התאריך האחרון להרשמה. | day.month, e.g. `27.10` |
| `ANSWER_DATE` | When applicants hear back (FAQ). Same LTR handling as `DEADLINE`. | מתי עונים למועמדים. | day.month, e.g. `04.11` |
| `MEETING_DAY_TIME` | Weekly meeting day and time (hero chip and FAQ). | יום ושעת המפגש השבועי. | day and time |
| `BACKING_TEXT` | The backing line under the logo, in the wording the student union approves. Filling it also shows `REICHMAN_LOGO` above it. | שורת הגיבוי מתחת ללוגו, בנוסח שהאגודה מאשרת. מילוי השורה מציג גם את לוגו האוניברסיטה. | free text |
| `PARTICIPANT_COST` | FAQ "כמה זה עולה?". A full sentence once decided (if free: `ההשתתפות בחינם.`). | עלות ההשתתפות, משפט שלם. | sentence |
| `EXPERIENCE_ANSWER` | FAQ "צריך ניסיון ביזמות?". Fill only once the managers agree on the bar and the insurance answer for physical work is in writing. | האם נדרש ניסיון. ממלאים רק אחרי החלטה ואחרי תשובה בכתב על ביטוח. | sentence |
| `WEEKLY_LOAD` | FAQ "כמה זמן זה לוקח?": the work expected between meetings. | היקף העבודה בין המפגשים. | sentence |
| `SELECTION_STEP` | FAQ "איך נרשמים?": what happens after the form (if everyone is interviewed: `אחרי זה נקבע איתכם ראיון קצר.`). | שלב המיון אחרי הטופס. | sentence |
| `INSTAGRAM_URL` | Instagram profile (footer icon). | קישור לאינסטגרם. | `https://...` |
| `AGUDA_URL` | Student union page (footer). Makes the union logo a link. | קישור לאגודת הסטודנטים. הופך את לוגו האגודה לקישור. | `https://...` |
| `AGUDA_LOGO` | Union logo file in `assets/img/`, first in the footer. It shows as soon as it is set; until `AGUDA_URL` is real it is a plain image beside the "קישור לאגודה" chip, never a dead link. Without a file the footer link reads "אגודת הסטודנטים". Do not scrape their logo. | קובץ לוגו האגודה. מופיע מיד, ועד שיש `AGUDA_URL` אמיתי הוא תמונה בלי קישור. | `assets/img/aguda.webp` |
| `REICHMAN_LOGO` | Reichman University logo file in `assets/img/`. **It appears only above the backing line, and only once `BACKING_TEXT` is filled.** While `BACKING_TEXT` is still a chip the logo is nowhere on the page, because on its own it would claim official backing in wording the student union has not approved. Do not add it anywhere else on the page. | לוגו אוניברסיטת רייכמן. **מופיע רק מעל שורת הגיבוי, ורק אחרי שממלאים את `BACKING_TEXT`.** עד אז הוא לא מופיע בכלל, כי לבדו הוא רומז על גיבוי רשמי בנוסח שהאגודה עוד לא אישרה. לא מוסיפים אותו לשום מקום אחר בדף. | `assets/img/reichman.webp` |
| `GOATCOUNTER_CODE` | Site code from goatcounter.com (no cookies, no consent banner). Until it is set, no counter script loads. | הקוד מ־goatcounter.com. עד שממלאים, אין מונה. | the code only, not the full URL |
| `SPEAKERS[]` | Speakers who confirmed in writing: `{ name, role, org, photo }`. Empty shows "שמות האורחים יתפרסמו אחרי שיאשרו.". | מרצים שאישרו בכתב. | array |
| `PARTNERS[]` | Partner organisations that confirmed in writing: `{ name, url }`. | ארגונים שאישרו בכתב. | array |
| `TEAM[]` | The four managers: `{ name, role, line, photo }`. Each manager fills and confirms their own name, role and line. Without a photo the card shows initials. Never an AI face for a real person. | ארבעת המנהלים. כל מנהל ומנהלת ממלאים ומאשרים את השם, התפקיד והשורה שלהם. | array |
| `FAQ[]` | `{ q, a }`. `{KEY}` inside `a` is replaced by that value, or by its chip. Anything undecided goes in a key, never as plain text in `a`. | שאלות ותשובות. מה שלא הוחלט נכנס כמפתח, לא כטקסט. | array |

## Publish gate / בדיקה לפני פרסום

```sh
sh gate.sh
```

It must end with `RESULT: PASS`. It checks what a push would publish (every commit, the commit messages, and the files git would add):

1. `TODO_` appears only in `config.js` and this README.
2. No FAQ item carries the retired `check` flag.
3. Author, committer and `user.email` are the GitHub noreply address only.
4. The GitHub handle appears only as the site URL, the repo name, the bare username or the noreply address. A Windows user folder or its short form is a finding.
5. No local machine paths, in text or in image files.
6. The privacy grep: `git grep -l -a -i -E -f .gate-private` over the files and every commit, and over the commit messages. The word list sits in `.gate-private`, which is gitignored on purpose, because listing the words in this public README would publish them. Without that file the gate says `COULD NOT CHECK` and does not pass.

Then by hand: open the page and search for **לבדוק**. It must find nothing. Every **למילוי** chip still on the page should be one you chose to publish.

## Going live

1. Go conditions:
   - At least one field-meeting host date in writing.
   - The insurance answer for physical off-campus work, in writing, before the lines about work clothes and working beside the staff go public.
   - The union's wording for `BACKING_TEXT`. It also switches on the university logo, so fill it only with the approved text.
   - The club's own email and WhatsApp number.
   - The FAQ policy keys decided, or deliberately left as chips.
   - A GoatCounter account.
2. `gh auth status` shows `amitfidel` active, then `gh repo create amitfidel/frontline --public --source=. --push`.
3. GitHub, Settings, Pages: deploy from branch `main`, folder `/ (root)`. The site appears at `https://amitfidel.github.io/frontline/`.
4. Fill `config.js`, `SIGNUP_URL` last. Run `sh gate.sh`. Commit, push.
5. Live checks: paste the link into a WhatsApp chat to yourself and check the card, open GoatCounter, run Lighthouse on the live URL.

Working from a fresh clone? The commit identity is set per folder, so set it before the first commit there (the gate fails until you do):

```sh
git config user.name "amitfidel"
git config user.email "187608176+amitfidel@users.noreply.github.com"
```

If the repo name is not `frontline`, update the three absolute URLs in the `<head>` of `index.html` (`canonical`, `og:url`, `og:image`) and the allowed forms in `gate.sh`. All other paths are relative.

## Design tokens

Recorded from the design planning pass. Every value in `styles.css` derives from these.

**Colour, sampled from the logo**

| Token | Hex | Use | Contrast on paper |
|---|---|---|---|
| `--paper` | `#FBF8F2` | Page background: the logo file's own cream, so the mark has no visible edge | |
| `--sand` | `#F3ECE1` | Partner panel | |
| `--ink` | `#3F2E27` | Body text: the wordmark brown | 12.1:1 |
| `--ink-2` | `#6B5850` | Secondary text | 6.3:1 |
| `--rust` | `#8A2724` | The loops' dark end. Emphasis, links, primary button, chip text | 8.3:1 |
| `--copper` | `#B74026` | Mid copper. Chip borders, inactive buttons | 5.3:1 |
| `--copper-lt` | `#C86334` | Light copper. Ring gradient and plank only, never text | 3.7:1 |

**Type.** Display: Karantina 700, a condensed Hebrew poster face, used only for section heads, the closing line and the partner block title. Everything else: IBM Plex Sans Hebrew 400/700, whose Latin also sets the `FRONTLINE` wordmark (tracked +0.05em, to echo the logo). No serif display: cream and copper with a serif is the look every generic page lands on.

**Space.** 4, 8, 12, 16, 24, 32, 48, 72, 112 px (`--s-1` to `--s-9`). Content measure 36rem.

**Signature.** The three-arc ring in "איך זה עובד": the logo's loops redrawn as one 360° cycle, לומדים, עובדים, מקימים, clockwise from the right as Hebrew reads. On wide screens it is sticky and closes arc by arc as each step is read; on phones it closes in one move when it scrolls into view. The copper plank under the logo mark returns once under each section head.

**Motion.** Logo reveal (mark, then wordmark) 600 ms end to end, pure CSS. Scroll fades 500 ms via `IntersectionObserver`. Ring arcs 350 ms each. FAQ expand 300 ms. All of it is off under `prefers-reduced-motion`.

**Light only, by design.** The club's look is copper on cream, matching the logo, so there is no dark variant; `color-scheme: only light` asks browsers not to auto-darken it.

## Re-rendering the share card

Serve the folder (`python -m http.server`), open `og/card.html` at exactly 1200x630, and screenshot it to `assets/og.png` (keep it under 300 KB).
