/*
 * FRONTLINE, the one config spot.
 *
 * Every value that is not confirmed yet starts with TODO_ and shows on the page
 * as a dashed "למילוי" chip, never as plain text. The text after TODO_ is the
 * hint shown inside the chip. Replace a TODO_ value only when it is true.
 *
 * Publish gate: `grep -rn "TODO_" .` must return hits only in this file and in
 * README.md. Anything left here with TODO_ is still visibly a placeholder.
 *
 * Full key-by-key guide (Hebrew and English): README.md.
 */
window.FRONTLINE = {
  // Links and contact. Use the club's identity, never a personal number.
  SIGNUP_URL: "TODO_קישור לטופס ההרשמה",        // full https:// link; last thing to fill
  PARTNER_EMAIL: "TODO_מייל המועדון",           // e.g. club@example.org
  PARTNER_WHATSAPP: "TODO_וואטסאפ של המועדון",  // E.164, e.g. +972501234567
  INSTAGRAM_URL: "TODO_קישור לאינסטגרם",        // full https:// link
  AGUDA_URL: "TODO_קישור לאגודה",               // full https:// link
  AGUDA_LOGO: "TODO_קובץ הלוגו של האגודה",       // file you add, e.g. assets/img/aguda.svg

  // Facts about the cohort.
  SEATS: "TODO_מספר מקומות",
  DEADLINE: "TODO_תאריך אחרון",
  ANSWER_DATE: "TODO_תאריך תשובות",
  MEETING_DAY_TIME: "TODO_יום ושעה",
  BACKING_TEXT: "TODO_נוסח הגיבוי, באישור האגודה",

  // Visit counter (goatcounter.com). The site code only, e.g. "frontline".
  GOATCOUNTER_CODE: "TODO_קוד GoatCounter",

  // Speakers and partner organisations. Leave empty until each one said yes
  // in writing. Empty lists show one calm line: "השמות יתפרסמו בקרוב."
  // Speaker: { name: "", role: "", org: "", photo: "" }   (photo optional)
  // Partner: { name: "", url: "" }                        (url optional)
  SPEAKERS: [],
  PARTNERS: [],

  // The four managers. photo is optional (a file path); without it the card
  // shows the initials. Never an AI-generated face for a real person.
  TEAM: [
    { name: "TODO_שם", role: "תוכן, סילבוס ופרויקטים", line: "TODO_שורה אחת", photo: "" },
    { name: "TODO_שם", role: "קשרי חוץ, מנכ״לים ושותפויות", line: "TODO_שורה אחת", photo: "" },
    { name: "TODO_שם", role: "תפעול, כספים ולוגיסטיקה", line: "TODO_שורה אחת", photo: "" },
    { name: "TODO_שם", role: "שיווק, סושיאל וקהילה", line: "TODO_שורה אחת", photo: "" }
  ],

  // FAQ. {KEY} inside an answer is replaced by that value (or its chip).
  // check: "TODO_CONFIRM" marks a draft of club policy nobody confirmed yet;
  // it renders as a dashed draft. Delete the check line once it is confirmed.
  FAQ: [
    { q: "למי זה מתאים?",
      a: "למי שלומדים ברייכמן ורוצים לבנות משהו עם השפעה חברתית. לא צריך ניסיון קודם.",
      check: "TODO_CONFIRM" },
    { q: "כמה זמן זה לוקח?",
      a: "סמסטר אחד. מפגש שבועי ב־{MEETING_DAY_TIME}, ועבודת צוות בין המפגשים." },
    { q: "כמה זה עולה?",
      a: "בלי עלות למשתתפים.",
      check: "TODO_CONFIRM" },
    { q: "איך נרשמים?",
      a: "ממלאים את הטופס עד {DEADLINE}. עם חלק מהנרשמים נקיים שיחה קצרה. תשובות עד {ANSWER_DATE}." },
    { q: "צריך ניסיון ביזמות?",
      a: "לא. צריך לרצות לעבוד, גם כשזה פיזי." },
    { q: "עם מה יוצאים בסוף?",
      a: "עם מיזם שבניתם והצגתם בערב הסיום, ועם ניסיון מתוך ארגונים אמיתיים." }
  ]
};
