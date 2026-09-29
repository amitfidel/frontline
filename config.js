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
  PARTNER_EMAIL: "Frontline.club26@gmail.com",  // the club's own address
  PARTNER_WHATSAPP: "+972587716766",            // +972 5X-XXX-XXXX or 05X-XXX-XXXX
  INSTAGRAM_URL: "https://www.instagram.com/Front_line_club/", // full https:// link
  AGUDA_URL: "TODO_קישור לאגודה",               // full https:// link
  AGUDA_LOGO: "assets/img/aguda.webp",         // shows unlinked until AGUDA_URL is real
  // The university logo appears only beside BACKING_TEXT, and only once that
  // line is filled: on its own it would claim backing nobody approved yet.
  REICHMAN_LOGO: "assets/img/reichman.webp",

  // Facts about the cohort.
  SEATS: "15",                                  // participants only, the managers are not counted
  DEADLINE: "27.10",                            // day.month
  ANSWER_DATE: "04.11",                         // day.month
  MEETING_DAY_TIME: "ימי שלישי, 17:00 עד 20:00",
  BACKING_TEXT: "מועדון היזמות החברתית של אגודת הסטודנטים, אוניברסיטת רייכמן", // in the wording the student union approves

  // Club policy, used inside the FAQ answers. Each is a full sentence once decided.
  PARTICIPANT_COST: "אין דמי השתתפות.",
  EXPERIENCE_ANSWER: "עדיפות גבוהה לניסיון בעבודה עם אנשים, ביזמות ובעשייה חברתית.",
  WEEKLY_LOAD: "היקף העבודה בין המפגשים משתנה משבוע לשבוע.",
  SELECTION_STEP: "השלב הבא הוא ראיון.",

  // Visit counter (goatcounter.com). The site code only, e.g. "frontline".
  GOATCOUNTER_CODE: "TODO_קוד GoatCounter",

  // Speakers and partner organisations. Leave empty until each one said yes
  // in writing. Empty lists show one calm line.
  // Speaker: { name: "", role: "", org: "", photo: "" }   (photo optional)
  // Partner: { name: "", url: "" }                        (url optional)
  SPEAKERS: [],
  PARTNERS: [],

  // The four managers, in card order. Each fills and confirms their own name, role
  // and bio (first person, the whole entry on one line; a \n starts a new line on the
  // card). photo is optional (a file path; a *-224.webp file also uses its *-336.webp
  // twin); without it the card shows the initials. Never an AI face for a real person.
  TEAM: [
    { name: "נועה שימרון", role: "שיווק, סושיאל וקהילה", bio: "היי לכולם, אני נועה שימרון. סטודנטית שנה שנייה לתואר כפול בפסיכולוגיה ומנהל עסקים, וביום-יום עובדת כ-HR בחברת Boost. לפני הלימודים עשיתי שנת שירות בעמותת 'קדימה' ושירתתי כקצינת חינוך בשייטת 13. מעבר לזה - אני מאוד אוהבת לבשל, לטייל בארץ ולמצוא פינה יפה לקפה.", photo: "assets/img/team-1-224.webp" },
    { name: "עמית פידל", role: "קשרי חוץ, מנכ״לים ושותפויות", bio: "היי לכולם, אני עמית פידל, לומד שנה שלישית במדעי המחשב ויזמות בתוכנית המצטיינים, עובד בחברה בשם Sepio cyber וחלק מתוכנית אבירם באוניברסיטה.\nאני מאוד אוהב ספורט, את הים וחיבור של השניים, וכיום מתעסק בהקמת חברה עצמאית.", photo: "assets/img/team-2-224.webp" },
    { name: "אופק ברוס", role: "תוכן, סילבוס ופרויקטים", bio: "אני אופק ברוס, סטודנט שנה ב׳ לכלכלה ומנהל עסקים בתוכנית מצטיינים.\nבמקור מקריית טבעון, קצין בקבע בדרגת רב-סרן, בתפקידי האחרון מפקד פלגת לוחמים ביחידה מובחרת, כיום פועל להקמת מיזמים חברתיים ומתכונן לתחרות איש ברזל, אוהב את כל סוגי הספורט, לקרוא, לאכול ולטייל.", photo: "assets/img/team-3-224.webp" },
    { name: "מאיה אברך", role: "כספים, אופרציה וקשר עם האוניברסיטה", bio: "אני מאיה אברך, סטודנטית שנה שנייה לפסיכולוגיה ומנהל עסקים ומאמנת בחמש אצבעות.\nשירתתי כמפקדת בחוות השומר.\nאוהבת אמנות, כל מה שקשור לעשייה בידיים, לטייל בארץ ובעולם, ולקחת וליזום חלק בעשייה חברתית.", photo: "assets/img/team-4-224.webp" }
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
