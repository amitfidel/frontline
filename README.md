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
| `assets/fonts/` | Self-hosted woff2 (IBM Plex Sans Hebrew 400/700, Karantina 700) and their OFL licences. |
| `assets/img/` | The logo mark and the three step images (WebP). |
| `assets/og.png` | The 1200x630 share card. Source: `og/card.html`. |
| `assets/logo-source.jpg` | The original logo file. |
| `qa/` | Screenshots at 360/390/768/1280 px. Lighthouse JSON is kept locally, not committed. |

## How placeholders work / איך עובדים הערכים למילוי

Every unconfirmed value in `config.js` starts with `TODO_`. On the page it renders as a dashed copper chip that says **למילוי** plus the hint written after `TODO_`, so it can never be read as a fact. Replace a value only when it is true. A value that is filled but malformed (a link without `https://`, an email without `@`) renders as a chip that says `לבדוק את הערך ב־config.js`, never as a dead link.

כל ערך שעוד לא אושר מתחיל ב־`TODO_`, ומופיע בדף כתגית מקווקוות "למילוי". מחליפים ערך רק כשהוא נכון. ערך שמולא אבל לא תקין מופיע כתגית "לבדוק את הערך", ולא כקישור שבור.

## config.js, key by key / מפתח אחר מפתח

| Key | English | עברית | Format |
|---|---|---|---|
| `SIGNUP_URL` | Sign-up form link. Until it is real, both buttons read "ההרשמה נפתחת בקרוב" and link nowhere. Fill it **last**. | קישור לטופס ההרשמה. עד שהוא אמיתי, הכפתורים כתובים "ההרשמה נפתחת בקרוב" ולא מקשרים לשום מקום. ממלאים אחרון. | `https://...` |
| `PARTNER_EMAIL` | The club's email, for the partner "מייל" button and the footer. Never a personal address. | המייל של המועדון, לכפתור "מייל" ולתחתית הדף. לא כתובת אישית. | `club@example.org` |
| `PARTNER_WHATSAPP` | The club's WhatsApp number for the "וואטסאפ" button. Never a personal number. | מספר הוואטסאפ של המועדון. לא מספר אישי. | E.164, `+972501234567` |
| `SEATS` | Number of seats, shown as "מקומות מוגבלים: …". | מספר המקומות. | `20` |
| `DEADLINE` | Last day to apply (hero chip and FAQ). | התאריך האחרון להרשמה. | free text, `30.10` |
| `ANSWER_DATE` | When applicants hear back (FAQ). | מתי עונים למועמדים. | free text |
| `MEETING_DAY_TIME` | Weekly meeting day and time (hero chip and FAQ). | יום ושעת המפגש השבועי. | free text, `יום ד׳, 18:00` |
| `BACKING_TEXT` | The backing line under the logo, in the wording the student union approves. | שורת הגיבוי מתחת ללוגו, בנוסח שהאגודה מאשרת. | free text |
| `INSTAGRAM_URL` | Instagram profile (footer icon). | קישור לאינסטגרם. | `https://...` |
| `AGUDA_URL` | Student union page (footer). | קישור לאגודת הסטודנטים. | `https://...` |
| `AGUDA_LOGO` | Union logo file you add to `assets/img/`. Optional: without it the footer shows the words "אגודת הסטודנטים". Do not scrape their logo. | קובץ לוגו האגודה, אם קיבלתם אותו מהם. | `assets/img/aguda.svg` |
| `GOATCOUNTER_CODE` | Site code from goatcounter.com (no cookies, no consent banner). Until it is set, no counter script loads. | הקוד מ־goatcounter.com. עד שממלאים, אין מונה. | `frontline` |
| `SPEAKERS[]` | Speakers who confirmed in writing: `{ name, role, org, photo }`. Empty shows "השמות יתפרסמו בקרוב.". | מרצים שאישרו בכתב. רשימה ריקה מציגה "השמות יתפרסמו בקרוב.". | array |
| `PARTNERS[]` | Partner organisations that confirmed in writing: `{ name, url }`. | ארגונים שאישרו בכתב. | array |
| `TEAM[]` | The four managers: `{ name, role, line, photo }`. Without a photo the card shows initials. Never an AI face for a real person. | ארבעת המנהלים. בלי תמונה מופיעים ראשי התיבות. | array |
| `FAQ[]` | `{ q, a, check }`. `{KEY}` inside `a` is replaced by that value. `check: "TODO_CONFIRM"` marks a draft of club policy; it renders dashed until you delete the `check` line. | שאלות ותשובות. `check: "TODO_CONFIRM"` מסמן טיוטה שצריך לאשר. מוחקים את השורה אחרי האישור. | array |

The role names in `TEAM[]` are a Hebrew rendering of the four roles in the club's deck. Check them against the deck before publishing.

## Publish gate / בדיקה לפני פרסום

Run from this folder.

```sh
grep -rn "TODO_" . --exclude-dir=.git --exclude=config.js --exclude=README.md   # must print nothing
git log --format="%ae %ce" | sort -u                                             # only the GitHub noreply address
```

Anything still `TODO_` inside `config.js` is visible on the page as a chip, so it cannot be mistaken for a fact, but it should be a deliberate choice to publish with it.

## Going live (the Owner's steps)

1. Go conditions: at least one host date in writing, the union's wording for `BACKING_TEXT`, the club's own email and WhatsApp number, a GoatCounter account.
2. `gh auth status` shows `amitfidel` active, then `gh repo create amitfidel/frontline --public --source=. --push`.
3. GitHub, Settings, Pages: deploy from branch `main`, folder `/ (root)`. The site appears at `https://amitfidel.github.io/frontline/`.
4. Fill `config.js`, `SIGNUP_URL` last. Run the publish gate. Commit, push.
5. Live checks: paste the link into a WhatsApp chat to yourself and check the card, open GoatCounter, run Lighthouse on the live URL.

If the repo name is not `frontline`, update the three absolute URLs in the `<head>` of `index.html` (`canonical`, `og:url`, `og:image`). All other paths are relative.

## Design tokens

Recorded from the `frontend-design` planning pass. Every value in `styles.css` derives from these.

**Colour, sampled from the logo**

| Token | Hex | Use | Contrast on paper |
|---|---|---|---|
| `--paper` | `#FBF8F2` | Page background: the logo file's own cream, so the mark has no visible edge | |
| `--sand` | `#F3ECE1` | Partner panel | |
| `--ink` | `#3F2E27` | Body text: the wordmark brown | 12.1:1 |
| `--ink-2` | `#6B5850` | Secondary text | 6.3:1 |
| `--rust` | `#8A2724` | The loops' dark end. Emphasis, links, primary button | 8.3:1 |
| `--copper` | `#B74026` | Mid copper. Chips, dashed borders, small UI | 5.3:1 |
| `--copper-lt` | `#C86334` | Light copper. Ring gradient and plank only, never text | 3.7:1 |

**Type.** Display: Karantina 700, a condensed Hebrew poster face, used only for section heads, the closing line and the partner block title. Everything else: IBM Plex Sans Hebrew 400/700, whose Latin also sets the `FRONTLINE` wordmark (tracked +0.05em, to echo the logo). No serif display: cream and copper with a serif is the look every generic page lands on.

**Space.** 4, 8, 12, 16, 24, 32, 48, 72, 112 px (`--s-1` to `--s-9`). Content measure 36rem.

**Signature.** The three-arc ring in "איך זה עובד": the logo's loops redrawn as one 360° cycle, לומדים, עובדים, מקימים, clockwise from the right as Hebrew reads. On wide screens it is sticky and closes arc by arc as each step is read; on phones it closes in one move when it scrolls into view. The copper plank under the logo mark returns once under each section head.

**Motion.** Logo reveal (mark, then wordmark) 600 ms end to end, pure CSS. Scroll fades 500 ms via `IntersectionObserver`. Ring arcs 350 ms each. All of it is off under `prefers-reduced-motion`.

**Light only, by design.** The club's look is copper on cream, matching the logo, so there is no dark variant; `color-scheme: only light` asks browsers not to auto-darken it.

## Re-rendering the share card

Serve the folder (`python -m http.server`), open `og/card.html` at exactly 1200x630, and screenshot it to `assets/og.png` (keep it under 300 KB).
