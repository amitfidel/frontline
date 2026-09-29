/*
 * FRONTLINE, the one config spot.
 *
 * Every value that is not confirmed yet starts with TODO_ and shows on the page
 * as a dashed "למילוי" chip, never as plain text. The text after TODO_ is the
 * hint shown inside the chip. Replace a value only when it is true.
 *
 * Before publishing, run `sh gate.sh` from this folder (see README.md).
 * Full key-by-key guide (Hebrew and English): README.md.
 */
window.FRONTLINE = {
  // Links and contact. Use the club's identity, never a personal number.
  SIGNUP_URL: "TODO_קישור לטופס ההרשמה",        // full https:// link; last thing to fill
  PARTNER_EMAIL: "TODO_מייל המועדון",           // the club's own address
  PARTNER_WHATSAPP: "TODO_וואטסאפ של המועדון",  // +972 5X-XXX-XXXX or 05X-XXX-XXXX
  INSTAGRAM_URL: "TODO_קישור לאינסטגרם",        // full https:// link
  AGUDA_URL: "TODO_קישור לאגודה",               // full https:// link
  AGUDA_LOGO: "TODO_קובץ הלוגו של האגודה",       // a file you add, e.g. assets/img/aguda.svg

  // Facts about the cohort.
  SEATS: "TODO_מספר מקומות",
  DEADLINE: "TODO_תאריך אחרון",
  ANSWER_DATE: "TODO_תאריך תשובות",
  MEETING_DAY_TIME: "TODO_יום ושעה",
  BACKING_TEXT: "TODO_שורת הגיבוי",               // in the wording the student union approves

  // Club policy, used inside the FAQ answers. Each is a full sentence once decided.
  PARTICIPANT_COST: "TODO_עלות ההשתתפות",
  EXPERIENCE_ANSWER: "TODO_האם נדרש ניסיון",
  WEEKLY_LOAD: "TODO_היקף העבודה בין המפגשים",
  SELECTION_STEP: "TODO_שלב המיון",

  // Visit counter (goatcounter.com). The site code only, e.g. "frontline".
  GOATCOUNTER_CODE: "TODO_קוד GoatCounter",

  // Speakers and partner organisations. Leave empty until each one said yes
  // in writing. Empty lists show one calm line.
  // Speaker: { name: "", role: "", org: "", photo: "" }   (photo optional)
  // Partner: { name: "", url: "" }                        (url optional)
  SPEAKERS: [],
  PARTNERS: [],

  // The four managers. Each fills their own name, role and line. photo is
  // optional (a file path); without it the card shows the initials.
  // Never an AI-generated face for a real person.
  TEAM: [
    { name: "TODO_שם", role: "TODO_תפקיד", line: "TODO_שורה אחת", photo: "" },
    { name: "TODO_שם", role: "TODO_תפקיד", line: "TODO_שורה אחת", photo: "" },
    { name: "TODO_שם", role: "TODO_תפקיד", line: "TODO_שורה אחת", photo: "" },
    { name: "TODO_שם", role: "TODO_תפקיד", line: "TODO_שורה אחת", photo: "" }
  ],

  // FAQ. {KEY} inside an answer is replaced by that value, or its chip.
  // Anything not decided goes in a {KEY} above, never as plain text here.
  FAQ: [
    { q: "למי זה מתאים?",
      a: "למי שלומדים ברייכמן, מכל תואר, ורוצים להקים מיזם חברתי." },
    { q: "כמה זמן זה לוקח?",
      a: "סמסטר אחד, מפגש בכל שבוע: {MEETING_DAY_TIME}. {WEEKLY_LOAD}" },
    { q: "כמה זה עולה?",
      a: "{PARTICIPANT_COST}" },
    { q: "איך נרשמים?",
      a: "ממלאים את הטופס עד {DEADLINE}. {SELECTION_STEP} תשובות עד {ANSWER_DATE}." },
    { q: "צריך ניסיון ביזמות?",
      a: "{EXPERIENCE_ANSWER}" },
    { q: "עם מה יוצאים בסוף?",
      a: "עם מיזם שבניתם והצגתם בערב הסיום, ועם ניסיון של עבודה מבפנים, בתוך ארגון חברתי." }
  ]
};
