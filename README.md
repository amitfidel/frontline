# FRONTLINE, landing page

One static Hebrew (RTL) page: HTML, CSS and a little vanilla JS. No build step, no framework, no external requests except the visit counter once it is switched on.

דף נחיתה סטטי אחד בעברית. אין שלב בנייה, אין ספריות, ואין פניות לשרתים חיצוניים חוץ ממונה הביקורים, אחרי שמפעילים אותו.

## Files

| File | What it is |
|---|---|
| `index.html` | The page. Static Open Graph tags live in its `<head>`. The three motion switches live here too (see Motion). |
| `config.js` | **The one place to edit.** Every value that is not confirmed yet. |
| `styles.css` | Design tokens, layout (logical CSS properties only) and, at the end, every motion, each named by its row in the motion table below. |
| `main.js` | Reads `config.js`, fills the page, builds the team cards, the sign-up panel and the terminal, and runs the motion. |
| `gate.sh` | The publish gate. Run it before every push. |
| `gate-test.sh` | Tests the gate itself on throwaway clones: a malformed word list must fail, a missing one must not pass, every marker typo in `config.js` must be named, the `config.js` exception must hold only for the exact allowed line, and a word list or `.gate-allow` that starts with a BOM or holds a CR must be refused. |
| `assets/fonts/` | Self-hosted woff2 (IBM Plex Sans Hebrew 400/700, Karantina 700) and their OFL licences. |
| `assets/img/` | The logo mark, the three step images, the student union and Reichman University logos (WebP; the two logos have a transparent background, cut from the files they came in, not redrawn), and the four team photos (`team-1-224.webp` to `team-4-336.webp`, see Team photos). |
| `assets/og.png` | The 1200x630 share card. Source: `og/card.html`. |
| `assets/logo-source.jpg` | The original logo file. |
| `qa/` | Screenshots at 360/390/768/1280 px (first screen and full page, motion on, after a full scroll). Lighthouse JSON is kept locally, not committed. |

## How placeholders work / איך עובדים הערכים למילוי

Every unconfirmed value in `config.js` starts with `TODO_`. On the page it renders as a dashed chip that says **למילוי** plus the hint written after `TODO_`, so it can never be read as a fact. The prefix is recognised in any case and through the typos a paste can add: spaces, quotes, gershayim, apostrophe look-alikes that Unicode counts as letters (`ʼ` `ʻ` `ˮ` and their kin), or an invisible direction mark in front of it, or fullwidth letters. So `" todo_..."` is still a chip, and the gate names the line so it gets fixed. A value with no letter or digit in it is a chip too, and so is a bare number in any key but `SEATS`. Replace a value only when it is true.

A value that is filled but malformed (a link without `https://`, an email without `@`, a phone number with words around it) renders as a chip that says **לבדוק את הערך**, never as a dead link, and the browser console names the key that was rejected.

Anything that is club policy and not yet decided lives in its own key and appears inside the FAQ answer as a chip. The FAQ never prints an undecided answer as plain text. A chip on a dark board keeps its dashed border and its word; only its colours change.

כל ערך שעוד לא אושר מתחיל ב־`TODO_`, ומופיע בדף כתגית מקווקוות "למילוי". מחליפים ערך רק כשהוא נכון. ערך שמולא אבל לא תקין מופיע כתגית "לבדוק את הערך", ולא כקישור שבור. מדיניות שעוד לא הוחלטה נשארת כתגית בתוך התשובה.

## config.js, key by key / מפתח אחר מפתח

| Key | English | עברית | Format |
|---|---|---|---|
| `SIGNUP_URL` | Sign-up form link. Until it is real, the hero button reads "ההרשמה נפתחת בקרוב" and unfolds the sign-up panel, and the terminal's puck turns the card to the same actions. Once it is real, the hero button and the puck are links to the form. Fill it **last**. | קישור לטופס ההרשמה. עד שהוא אמיתי, על הכפתור כתוב "ההרשמה נפתחת בקרוב", והוא פותח פאנל עם הפעולות האמיתיות. גם הדמות שמחליקים בסוף הדף הופכת את הכרטיס לאותן פעולות. ממלאים אחרון. | `https://...` |
| `PARTNER_EMAIL` | The club's email, for the partner "מייל" button and the footer. Never a personal address. | המייל של המועדון, לכפתור "מייל" ולתחתית הדף. לא כתובת אישית. | an email address |
| `PARTNER_WHATSAPP` | The club's WhatsApp number: the partner "וואטסאפ" button (partner opener), and, in the sign-up panel, "כתבו לנו בוואטסאפ" for students (its own opener, `WA_STUDENT` in `main.js`). Never a personal number. Israeli local form is converted for you. | מספר הוואטסאפ של המועדון, לשותפים ולסטודנטים. לא מספר אישי. אפשר לכתוב גם בפורמט מקומי. | `+972 5X-XXX-XXXX` or `05X-XXX-XXXX` |
| `SEATS` | Places for participants only; the four managers are not counted. Shown as "15 מקומות". A number only: the page adds the word, so anything else is a "לבדוק את הערך" chip. | מספר המקומות למשתתפים בלבד, בלי המנהלים. מספר בלבד, המילה "מקומות" נוספת לבד. | a number |
| `DEADLINE` | Last day to apply (hero, FAQ, the terminal's caption). Kept in its own right-to-left run (a `<bdi>`): the digits of `27.10` never reorder, and a date in words such as `27 באוקטובר` reads in the right order. As `day.month` it also gives the panel its save-the-date, a calendar file made in the browser, offered only when this year's date is today or later and at most 180 days away on the visitor's own clock; after the deadline, or in words, that action is absent. | התאריך האחרון להרשמה. בפורמט יום.חודש הוא נותן גם את "שמרו את ה־27.10 ביומן" בפאנל, רק כשהתאריך השנה עוד לפנינו ובתוך 180 יום. | day.month, e.g. `27.10` |
| `ANSWER_DATE` | When applicants hear back (FAQ). Same handling as `DEADLINE`. | מתי עונים למועמדים. | day.month, e.g. `04.11` |
| `MEETING_DAY_TIME` | Weekly meeting day and time (hero facts and FAQ). | יום ושעת המפגש השבועי. | day and time |
| `BACKING_TEXT` | The backing line under the logo, in the wording the student union approves. Filling it also shows `REICHMAN_LOGO` above it. | שורת הגיבוי מתחת ללוגו, בנוסח שהאגודה מאשרת. מילוי השורה מציג גם את לוגו האוניברסיטה. | free text |
| `PARTICIPANT_COST` | FAQ "כמה זה עולה?". A full sentence once decided. | עלות ההשתתפות, משפט שלם. | sentence |
| `EXPERIENCE_ANSWER` | FAQ "צריך ניסיון ביזמות?". Filled with the managers' own bar. The insurance go condition does not apply to it: it promises no physical work. | האם נדרש ניסיון. תנאי הביטוח לא חל עליו, כי הוא לא מבטיח עבודה פיזית. | sentence |
| `WEEKLY_LOAD` | FAQ "כמה זמן זה לוקח?": the work expected between meetings. | היקף העבודה בין המפגשים. | sentence |
| `SELECTION_STEP` | FAQ "איך נרשמים?": what happens after the form. | שלב המיון אחרי הטופס. | sentence |
| `INSTAGRAM_URL` | Instagram profile: the footer icon, and the first action of the sign-up panel. | קישור לאינסטגרם, בתחתית הדף ובפאנל ההרשמה. | `https://...` |
| `AGUDA_URL` | Student union page (footer). Makes the union logo a link. | קישור לאגודת הסטודנטים. הופך את לוגו האגודה לקישור. | `https://...` |
| `AGUDA_LOGO` | Union logo file in `assets/img/`, first in the footer. It shows as soon as it is set; until `AGUDA_URL` is real it is a plain image beside the "קישור לאגודה" chip, never a dead link. Without a file the footer link reads "אגודת הסטודנטים". Do not scrape their logo. | קובץ לוגו האגודה. מופיע מיד, ועד שיש `AGUDA_URL` אמיתי הוא תמונה בלי קישור. | `assets/img/aguda.webp` |
| `REICHMAN_LOGO` | Reichman University logo file in `assets/img/`. **It appears only above the backing line, and only once `BACKING_TEXT` is filled.** While `BACKING_TEXT` is still a chip the logo is nowhere on the page, because on its own it would claim official backing in wording the student union has not approved. Do not add it anywhere else on the page. | לוגו אוניברסיטת רייכמן. **מופיע רק מעל שורת הגיבוי, ורק אחרי שממלאים את `BACKING_TEXT`.** עד אז הוא לא מופיע בכלל, כי לבדו הוא רומז על גיבוי רשמי בנוסח שהאגודה עוד לא אישרה. לא מוסיפים אותו לשום מקום אחר בדף. | `assets/img/reichman.webp` |
| `GOATCOUNTER_CODE` | Site code from goatcounter.com (no cookies, no consent banner). Until it is set, no counter script loads. | הקוד מ־goatcounter.com. עד שממלאים, אין מונה. | the code only, not the full URL |
| `SPEAKERS[]` | Speakers who confirmed in writing: `{ name, role, org, photo }`. Empty shows "שמות האורחים יתפרסמו אחרי שיאשרו.". | מרצים שאישרו בכתב. | array |
| `PARTNERS[]` | Partner organisations that confirmed in writing: `{ name, url }`. | ארגונים שאישרו בכתב. | array |
| `TEAM[]` | The four managers, in card order: `{ name, role, bio, photo }` (`bio` replaced the old `line`). Each manager fills and confirms their own name, role and bio, in the first person. **Keep each entry on one physical line** (a `\n` inside `bio` starts a new line on the card): the gate's one exception is keyed to a whole line. A blank bio shows a "למילוי · ביוגרפיה" chip and no disclosure; without a photo the card shows initials. Never an AI face for a real person. | ארבעת המנהלים: שם, תפקיד, ביוגרפיה, תמונה. כל מנהל ומנהלת ממלאים ומאשרים את הרשומה שלהם, בגוף ראשון. כל רשומה בשורה אחת. | array |
| `FAQ[]` | `{ q, a }`. `{KEY}` inside `a` is replaced by that value, or by its chip. Anything undecided goes in a key, never as plain text in `a`. | שאלות ותשובות. מה שלא הוחלט נכנס כמפתח, לא כטקסט. | array |

## Team photos

`assets/img/team-N-224.webp` and `team-N-336.webp` (2x and 3x of the 112 px tile), numbered in card order. Each is a square crop of the manager's own photo: face centred, eyes at about 40% from the top, the crop about 2.2 times the face width, no rotation, one mild warm grade applied to all four alike, natural colour, WebP quality 72. The files are written from a fresh pixel buffer, so they carry no EXIF, XMP or ICC chunk (list the RIFF chunks to check: only `VP8 `). The source photos never enter this folder. To replace one, export the same two sizes under the same names; a `photo` that ends in `-224.webp` picks up its `-336.webp` twin by itself, and any other single file works as well.

## Motion

The page has four moments and nothing else moves. **S1** the ring in "איך זה עובד" closes and reads 360°. **S2** the three scenes sit in copper viewfinder frames that lock on as each arrives, and the picture drifts a little inside its frame. **S3** a manager's card opens in place. **S4** at the end, a terminal: slide the figure the whole way past לומדים, עובדים, מקימים (or tap it, or press Enter or Space) and the card turns to its back, the real actions and a way back. The copper wire in the inline-start gutter joins them, from under the hero button to the terminal card, filling with the thumb.

Rules the code keeps: every scroll-linked motion animates `transform` or `opacity` only; copy never scrubs (text appears by one-shot reveals that only add); nothing is pinned, sticky or viewport-height-sized on phones (the ring's `sticky`, with its `50vh`, is for 900 px and up); the base style of every animated element is its finished state, so a page without JavaScript, with reduced motion, or in an engine without scroll timelines is the same finished page.

**Loading, for the first paint (LCP).** The step pictures' wells have `content-visibility: auto`: each picture is laid out, and so fetched, as its frame comes near the screen (about 1,100 px ahead on a phone), never with the first screen, so the logo mark paints sooner. A well's size comes from its `aspect-ratio`, so nothing shifts when the picture arrives. Keep both, or the pictures load with the first screen again.

**Motion switches**, one attribute each in `index.html`:

| Switch | Values | What it does |
|---|---|---|
| `data-ring` on `.ring-wrap` | `once` (set), `scroll`, `off` | `once` closes the arcs in one move as the ring arrives (the hand turns once, the readout counts to 360°). `scroll` draws the arcs with the thumb on phones; it failed the 8 ms gate (below), so it is not used. `off` shows the closed ring, nothing moves. A missing or unknown value reads as `once`; only an explicit `scroll` takes the thumb-linked path. |
| `data-drift` on `.steps` | `on` (set), `off` | The pictures' drift inside the frames. |
| `data-puck` on `#term` | `on` (set), `off` | `off` shows a plain button instead of the slider (the three verbs as a caption above it); a tap still turns the card. |

**The ring's gate.** The scrubbed arcs animate `stroke-dashoffset`, a paint property, so they had to stay under 8 ms per frame at 4x CPU throttle. Measured in Chrome on a 390 px phone profile, crossing the ring in 16 px steps, three runs: the 90th-percentile frame is 6.6 to 8.5 ms and the longest ring frames are 10.8 to 12.5 ms (with the ring still: 4.4 ms and 6.5 to 9.2 ms; the ring itself adds about 3 ms at the 90th percentile). Longer ring frames than 8 ms mean the switch, so `data-ring` is `once`, today's one-shot arcs. If a real phone shows the scrubbed ring smooth, `scroll` is one word away.

**The motion table** (the verifier maps every `@keyframes`, `animation`, `transition` and `animation-timeline` in `styles.css` to one of these rows; the rules name their row in a comment). "Fallback" is an engine without `animation-timeline` (Firefox, iOS before 26); "RM" is `prefers-reduced-motion: reduce`.

| # | Element | Trigger | Property | Duration, easing | Compositor | Fallback | RM |
|---|---|---|---|---|---|---|---|
| H1 | the mark settles; wordmark and tagline rise | load | the mark: transform only, so it is on screen, and counted as the page's largest paint, from the first frame; wordmark and tagline: opacity, transform | 450 ms | yes | same | static |
| H2 | wire, hero segment | load +500 ms | scaleY 0 to 1 | 500 ms | yes | same | drawn |
| W1 | wire, one segment per section | the segment's own view timeline through a 1 px window at 72% of the screen, so each fills 1:1 and the next starts where it ends | scaleY 0 to 1 | scrubbed | yes | once per section, 600 ms | drawn |
| R1 | ring arcs | `once`: the whole ring above the 85% line (half of it, on a screen too short for the whole) | stroke-dashoffset 1 to 0, 120 ms apart | 350 ms each | no, paint (once) | same | closed |
| R2 | tick hand | with R1; wide: one step per section read | rotate | 700 ms linear; wide 350 ms | yes | same | at rest |
| R3 | degree readout | with R1: 12 writes through the turn; wide: 0, 120, 240, 360 | text | event-driven | tiny | same | 360° |
| N1 | a frame locks on | 60% of the frame in view, or the frame filling 60% of a screen too short for that (a phone held sideways); once. A frame scrolled past, however fast, locks too | ticks move 4 px outward; the picture's tint 0.55 to 0; the hairline brightens | 300, 400, 250 ms | ticks and tint yes | same | locked |
| N2 | picture drifts in its frame | the picture's view timeline | translateY 4% to 0, scale 1.08 to 1 | scrubbed | yes | still | still |
| N3 | the three angles in frame 2 | the line fully in view, once | opacity, 8 px from inline-start | 250 ms, 80 ms apart | yes | same | shown |
| C1 | section reveals, closing line | in view, once | opacity, translateY | 500 ms | yes | same | shown |
| T1 | a team card opens | click, Enter, Space | grid rows 0fr to 1fr (then hidden after the fold); the tile's ring | 320 ms; 200 ms | layout, on input | same | instant |
| F1 | FAQ open, plus turns | click | as before | as before | as before | as before | instant |
| E1 | the terminal arms | 80% of the card in view, once | dashed to solid border; one ring from the puck, scale 1 to 1.6, opacity 0.6 to 0 | 250 ms; 600 ms | ring yes | same | armed |
| E2 | the puck nudges | with E1, 700 ms later, once | 6 px toward the end, twice | 900 ms each | yes | same | none |
| E3 | the puck follows the finger | a 6 px horizontal intent lock | translateX, one custom property per move; the fill rides with it; stops light | the finger | yes | same | works |
| E4 | the puck returns | released below 92% | translateX, a spring curve (one overshoot of 8%, never more than 4 px) | 600 ms | yes | same | instant |
| E5 | the puck docks | released at 92% or more, tap, Enter, Space | translateX to the end | 120 ms | yes | same | instant |
| E6 | the card turns | E5, soon state | rotateY 0 to -180 deg toward the reading direction, perspective 900px | 500 ms | yes | same | instant |
| U1 | the hero panel unfolds | hero button | grid rows 0fr to 1fr (then hidden after the fold) | 320 ms | layout, on input | same | instant |
| U2 | the hero button's plus turns (hero addendum, the Owner, 2026-09-29) | hero button | rotate 0 to 45 deg | 250 ms | yes | same | instant |
| P1 | press feedback | `:active` on buttons, the puck, a team card's tile | scale 0.985 | 120 ms | yes | same | colour only |

Where the build differs from the motion brief, on purpose: W1's range (the brief's `entry 0% to exit 60%` leaves gaps between segments and fills slower than the thumb), N2 ends at 0 rather than -4% (at -4% the picture opens a gap at the frame's foot), N1 moves the ticks vertically (two pseudo-elements, the top pair and the bottom pair), E1's ring is the puck's (a card-sized ring at 1.6x would leave the screen), E4 is a CSS transition on a computed spring curve, so it runs on the compositor.

Engine support: `animation-timeline: view()` in Chrome and Android WebView 115+, Safari and iOS 26+, Samsung Internet 23; Firefox stable behind a flag. `main.js` adds `.st` when `CSS.supports('animation-timeline: view()')` is true; the scroll branch needs `.st`, the observer branch `.js:not(.st)`, so they never both run.

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
6. The privacy grep: `git grep -a -i -E -f .gate-private` over the files and every commit, and a grep of every commit message and every author and committer name. The word list sits in `.gate-private`, which is gitignored on purpose, because listing the words in this public README would publish them. Without that file the gate says `COULD NOT CHECK` and does not pass.

   **One exception, for `config.js` only.** A `config.js` line that equals, byte for byte, a line in `.gate-allow` is not a finding, in the working tree and in history. `.gate-allow` is gitignored too, and every line in it must be one team entry, the one with `name: "עמית פידל"`, alone on its line and with `bio: "` in it. Any other line in it, or a `.gate-allow` git would publish, makes the gate say `COULD NOT CHECK`. No `.gate-allow` means no exception, so that bio line fails (the safe direction). It holds more than one line only because history keeps the older versions of that entry.

   The word is never exempt anywhere else: not in another file, not on another `config.js` line, not in history of another file, not in a commit message, not in an author or committer name. **Never name it in a commit message.** Findings print only a place (`path`, `path:line`, `rev:path:line`, or `commit: field`), never the matched text, so a pasted gate report cannot carry the word. When the exception is used, the gate says how many `config.js` matches it allowed.

   **Both files must be UTF-8 without BOM, LF line ends.** If `.gate-private` or `.gate-allow` starts with a byte-order mark (UTF-8 or UTF-16) or holds a CR byte, the gate refuses with `COULD NOT CHECK` and names the file. It does not repair them: a BOM or a CR can make a pattern or a line miss without a sound.

   Making `.gate-allow` in Git Bash, from this folder, without printing the line:

   ```sh
   grep -F 'name: "עמית פידל"' config.js | tr -d '\r' > .gate-allow
   git check-ignore -v .gate-allow        # must print the .gitignore rule
   sh gate.sh
   ```

   When the entry changes after it was committed, keep the old line (history still has it) and add the new one with `>>` instead of `>`. If the gate names an older version in history (`<rev>:config.js:<n>`) that is your entry, add that exact line:

   ```sh
   git show <rev>:config.js | sed -n '<n>p' | tr -d '\r' >> .gate-allow
   ```
7. In `config.js` every unfilled marker opens its value, spelled exactly `TODO_`, and nothing is in fullwidth letters. A marker behind a quote, an invisible mark or a space, or in the middle of a value, is named by line. The page shows a chip for the first kinds, but it prints a marker in the middle of a value as text. A marker after a colon inside a value is in the middle of that value.

Checks 2 and 7 name a `config.js` line by its number (`config.js:<line>`), never its text, because one `config.js` line may now hold the word.

Then by hand: open the page and search for **לבדוק**. It must find nothing. Every **למילוי** chip still on the page should be one you chose to publish.

## Going live

1. Go conditions:
   - At least one field-meeting host date in writing.
   - The insurance answer for physical off-campus work, in writing, before step 2 ("מגיעים בבגדי עבודה, עובדים לצד העובדים") and the partner block's line about working beside the staff go public. It no longer applies to `EXPERIENCE_ANSWER`.
   - The union's wording for `BACKING_TEXT`. It also switches on the university logo, so fill it only with the approved text.
   - The FAQ policy keys decided, or deliberately left as chips.
   - A GoatCounter account.
2. `gh auth status` shows `amitfidel` active, then `gh repo create amitfidel/frontline --public --source=. --push`.
3. GitHub, Settings, Pages: deploy from branch `main`, folder `/ (root)`. The site appears at `https://amitfidel.github.io/frontline/`.
4. Fill `config.js`, `SIGNUP_URL` last. Run `sh gate.sh`. Commit, push. The same day SIGNUP_URL goes live: post the form on Instagram, and answer every WhatsApp message that mentions FRONTLINE (search the chat for the word).
5. Live checks: paste the link into a WhatsApp chat to yourself and check the card, open GoatCounter, run Lighthouse on the live URL. On a phone, inside the Instagram browser: slide the puck the whole way, then scroll with a thumb that starts on the track; tap "שמרו את ה־27.10 ביומן" (it works in Safari and Chrome proper; some in-app browsers ignore calendar files).
6. The day after DEADLINE: move DEADLINE and ANSWER_DATE to the next cohort, or take the page down.

Working from a fresh clone? The commit identity is set per folder, so set it before the first commit there (the gate fails until you do):

```sh
git config user.name "amitfidel"
git config user.email "187608176+amitfidel@users.noreply.github.com"
```

If the repo name is not `frontline`, update the three absolute URLs in the `<head>` of `index.html` (`canonical`, `og:url`, `og:image`) and the allowed forms in `gate.sh`. All other paths are relative (the save-the-date file takes its link from `canonical`).

## Design tokens

Every value in `styles.css` derives from these.

**Colour, sampled from the logo**

| Token | Hex | Use | Contrast on paper |
|---|---|---|---|
| `--paper` | `#FBF8F2` | Page background: the logo file's own cream, so the mark has no visible edge | |
| `--sand` | `#F3ECE1` | Partner panel; the cream text on the boards | |
| `--ink` | `#3F2E27` | Body text: the wordmark brown | 12.1:1 |
| `--ink-2` | `#6B5850` | Secondary text | 6.3:1 |
| `--rust` | `#8A2724` | The loops' dark end. Emphasis, links, primary button, chip text | 8.3:1 |
| `--copper` | `#B74026` | Mid copper. Chip borders, inactive buttons, the wire on cream | 5.3:1 |
| `--copper-lt` | `#C86334` | Light copper. Accents only, never text | 3.7:1 |

**The boards** (how it works, and the sign-up terminal): the only dark surfaces, with a faint static grid and nothing else.

| Token | Hex | Use | Contrast on board / board-2 |
|---|---|---|---|
| `--board` | `#1B1310` | The wordmark brown taken down to umber | |
| `--board-2` | `#2A1D18` | Raised: the terminal card | |
| `--copper-glow` | `#E8895A` | Lines, labels and links on a board; the wire there | 7.1:1 / 6.3:1 |
| `--mute` | `#C9B8A6` | Captions on a board | 9.5:1 / 8.5:1 |
| `--sand` | `#F3ECE1` | Text on a board | 15.6:1 / 13.9:1 |

Rust is never used on a board (2.1:1 there).

**Type.** Display: Karantina 700, a condensed Hebrew poster face, used only for section heads, the closing line and the partner block title. Everything else: IBM Plex Sans Hebrew 400/700, whose Latin also sets the `FRONTLINE` wordmark (tracked +0.05em, to echo the logo). A utility voice, Plex 400 at 0.75rem, tracked +0.12em, tabular figures, sets the frame tags, the terminal's caption and the stops. No serif display: cream and copper with a serif is the look every generic page lands on.

**Space.** 4, 8, 12, 16, 24, 32, 48, 72, 112 px (`--s-1` to `--s-9`). Content measure 36rem. Boards get `--s-8` above and below on phones, `--s-9` from 900 px. On phones the ring and the first frame sit `--s-7` apart, as the motion brief's layout places them, so the two share a screen: a full screen of empty board between them was tried and read as a broken gap, and the Owner's rule is how the page looks, so the close spacing stands. At a normal scroll the ring's turn and the first frame's lock can play at the same time.

**Light only, by design.** The club's look is copper on cream, matching the logo, with two umber boards inside it; there is no dark variant, and `color-scheme: only light` asks browsers not to auto-darken it.

## Re-rendering the share card

Serve the folder (`python -m http.server`), open `og/card.html` at exactly 1200x630, and screenshot it to `assets/og.png` (keep it under 300 KB).
