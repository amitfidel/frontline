/* FRONTLINE landing page. Reads config.js, fills the page, runs the four moments.
 * Every unfilled or invalid value renders as a dashed "למילוי" chip,
 * so nothing unconfirmed can read as fact and no link is ever dead. */
(() => {
  "use strict";
  const C = window.FRONTLINE || {};
  // SEATS: 15 works as well as "15". Every other key is text, so a bare number
  // there (BACKING_TEXT: 0) stays unfilled instead of printing as the line.
  if (typeof C.SEATS === "number") C.SEATS = String(C.SEATS);
  const doc = document;
  const WA_OPENER = "שלום, הגעתי מהאתר של FRONTLINE ואשמח לשמוע על שיתוף פעולה.";
  const WA_STUDENT = "היי, אשמח לדעת כשההרשמה ל־FRONTLINE נפתחת";
  const MAIL_SUBJECT = "FRONTLINE, שיתוף פעולה";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- values -------------------------------------------------------------
  // Unfilled marker: the config.js prefix in any case, with anything that is not a
  // letter or a digit in front of it (spaces, quotes, gershayim), and its near-misses
  // (a dash, a colon or a space instead of the underscore). fold() first turns
  // fullwidth letters into plain ones, drops invisible marks (RLM, LRM, zero-width
  // space, BOM), and turns the apostrophe look-alikes that Unicode files as letters
  // (modifier letter apostrophe U+02BC, turned comma U+02BB, double apostrophe U+02EE,
  // the primes, the saltillo) into a plain apostrophe, so none of them can hide the marker.
  // Written as a regex so the publish grep for the literal marker only ever hits config.js.
  const QUOTE_LETTERS = /[ʹ-ʿˈˊˋˮߴߵꞋꞌ]/gu;
  const MARK = /^[^\p{L}\p{N}]*todo(?![a-z])[\s_:-]*/iu;
  const fold = (v) => v.normalize("NFKC").replace(/\p{DI}/gu, "").replace(QUOTE_LETTERS, "'");
  const pending = (v) => typeof v === "string" && MARK.test(fold(v));
  // Filled means text with a letter or a digit in it that does not open with the marker.
  const blank = (v) => typeof v !== "string" || !/[\p{L}\p{N}]/u.test(fold(v)) || pending(v);

  const httpUrl = (v) => {
    if (blank(v)) return null;
    try {
      const u = new URL(v.trim());
      return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
    } catch { return null; }
  };
  const email = (v) =>
    !blank(v) && /^[^\s@<>()"',;:]+@[^\s@<>()"',;:]+\.[a-z]{2,}$/i.test(v.trim()) ? v.trim() : null;
  // WhatsApp needs the full international number with no trunk 0 (wa.me/9725...).
  // Accepts "+972 50-000-0000", "00972...", "972..." and Israeli local "050-000-0000".
  // Anything else, including text around the number, returns null and shows a chip.
  const waDigits = (v) => {
    if (blank(v)) return null;
    const raw = v.trim();
    if (!/^\+?[\d\s\-().]+$/.test(raw)) return null;
    let d = raw.replace(/\D/g, "");
    if (raw.startsWith("+")) { /* already international */ }
    else if (d.startsWith("00")) d = d.slice(2);
    else if (d.startsWith("0")) d = "972" + d.slice(1);
    else if (!d.startsWith("972")) return null;
    if (d.startsWith("0") || d.startsWith("9720")) return null;
    if (d.startsWith("972")) return d.length === 11 || d.length === 12 ? d : null;
    return d.length >= 8 && d.length <= 15 ? d : null;
  };

  // ---- dom helpers --------------------------------------------------------
  const make = (tag, cls, text) => {
    const n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const bdi = (text, dir) => { const b = make("bdi", null, text); b.dir = dir; return b; };
  const ltr = (text) => bdi(text, "ltr");
  const chip = (v, label) => {
    const c = make("span", "todo");
    c.append(make("b", null, "למילוי"));
    // The hint is the text after the marker, without the quotes a typo wrapped it in.
    const hint = label || (pending(v) ? fold(v).replace(MARK, "").replace(/[\s\p{Pi}\p{Pf}"'`׳״]+$/u, "") : "");
    if (hint) c.append(" · " + hint);
    return c;
  };
  // A filled but malformed value: never a dead link, and the key is named in the console.
  const badChip = (key) => {
    console.warn(`FRONTLINE config: ${key} was rejected, check its format in config.js`);
    return chip(null, "לבדוק את הערך");
  };
  // A date is Hebrew text in its own isolated right-to-left run: the digits of 27.10
  // still read left to right (a number always does), nothing around the date can
  // pull them apart, and a date in words (27 באוקטובר) reads in the right order.
  const DATE_KEYS = new Set(["DEADLINE", "ANSWER_DATE"]);
  const plain = (key, s) => (DATE_KEYS.has(key) ? bdi(s, "rtl") : doc.createTextNode(s));
  const valueNode = (key) => (blank(C[key]) ? chip(C[key]) : plain(key, C[key].trim()));
  const link = (href, content, external) => {
    const a = make("a");
    a.href = href;
    if (external) { a.target = "_blank"; a.rel = "noopener"; }
    a.append(content);
    return a;
  };
  // Disclosure (hero panel, team bios): one button, one region, folded with inert.
  const disclose = (button, region, onToggle) => {
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", region.id);
    region.inert = true;
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      region.inert = !open;
      onToggle(open);
    });
  };

  // ---- the sign-up panel: one builder for the hero panel and the terminal's back ----
  // Each action exists only if its value is real, so the panel never holds a dead link.
  const pad2 = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
  // Save the date: only when DEADLINE is a real day.month whose date this year is today or
  // later and at most 180 days away (on the visitor's own clock). After the deadline, or
  // too early to know the year, the action is absent: never a date in the wrong year.
  const icsHref = () => {
    if (blank(C.DEADLINE)) return null;
    const m = /^(\d{1,2})\.(\d{1,2})$/.exec(C.DEADLINE.trim());
    if (!m) return null;
    const day = Number(m[1]), month = Number(m[2]);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const date = new Date(now.getFullYear(), month - 1, day);
    if (date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    const days = Math.round((date - today) / 86400000);
    if (days < 0 || days > 180) return null;
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const canonical = doc.querySelector('link[rel="canonical"]');
    const url = canonical ? canonical.href : location.href.split("#")[0];
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//FRONTLINE//save the date//HE",
      "BEGIN:VEVENT",
      `UID:frontline-deadline-${ymd(date)}`,
      `DTSTAMP:${now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
      `DTSTART;VALUE=DATE:${ymd(date)}`,
      `DTEND;VALUE=DATE:${ymd(next)}`,
      "SUMMARY:FRONTLINE\\, יום אחרון להרשמה",
      `URL:${url}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ];
    return "data:text/calendar;charset=utf-8," + encodeURIComponent(ics.join("\r\n") + "\r\n");
  };
  const actionList = () => {
    const acts = [];
    const ig = httpUrl(C.INSTAGRAM_URL);
    if (ig) acts.push(link(ig, "עקבו אחרינו באינסטגרם, נעדכן שם כשהטופס עולה", true));
    const ics = icsHref();
    if (ics) {
      const a = link(ics, "שמרו את ה־");
      a.append(bdi(C.DEADLINE.trim(), "rtl"), " ביומן");
      a.download = "frontline.ics";
      acts.push(a);
    }
    const wa = waDigits(C.PARTNER_WHATSAPP);
    if (wa) acts.push(link(`https://wa.me/${wa}?text=${encodeURIComponent(WA_STUDENT)}`, "כתבו לנו בוואטסאפ", true));
    if (!acts.length) return make("p", "acts-none", "הקישור יופיע כאן כשההרשמה תיפתח");
    const ul = make("ul", "acts");
    for (const a of acts) {
      a.classList.add("act");
      const li = make("li");
      li.append(a);
      ul.append(li);
    }
    return ul;
  };

  // ---- sign-up in the hero: a real link only when the URL is real ------------
  // Until then the button unfolds the panel (U1); a malformed URL also shows its chip.
  const signup = httpUrl(C.SIGNUP_URL);
  const malformed = !signup && !blank(C.SIGNUP_URL);
  const heroSignup = doc.querySelector(".hero [data-signup]");
  if (heroSignup && signup) {
    const a = link(signup, "להגשת מועמדות");
    a.className = "btn";
    heroSignup.replaceWith(a);
  } else if (heroSignup) {
    const b = make("button", "btn is-soon", heroSignup.textContent.trim());
    b.type = "button";
    const panel = make("div", "soon-panel");
    panel.id = "soon-hero";
    const inner = make("div", "soon-inner");
    inner.append(actionList());
    panel.append(inner);
    disclose(b, panel, (open) => panel.classList.toggle("is-open", open));
    heroSignup.replaceWith(b, ...(malformed ? [badChip("SIGNUP_URL")] : []), panel);
  }

  // ---- partner contact buttons --------------------------------------------
  const mail = email(C.PARTNER_EMAIL);
  const wa = waDigits(C.PARTNER_WHATSAPP);
  const contacts = {
    email: mail && `mailto:${mail}?subject=${encodeURIComponent(MAIL_SUBJECT)}`,
    whatsapp: wa && `https://wa.me/${wa}?text=${encodeURIComponent(WA_OPENER)}`,
  };
  doc.querySelectorAll("[data-contact]").forEach((n) => {
    const href = contacts[n.dataset.contact];
    if (!href) return;
    const a = link(href, n.textContent, n.dataset.contact === "whatsapp");
    a.className = "btn btn-line";
    n.replaceWith(a);
  });

  // ---- footer links ---------------------------------------------------------
  const IG_ICON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">' +
    '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
    '<circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
    '<circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/></svg>';
  const foot = (name, href, build) => {
    const li = doc.querySelector(`[data-foot="${name}"]`);
    if (!li || !href) return;
    li.replaceChildren(link(href, build(), /^https?:/.test(href)));
  };
  foot("instagram", httpUrl(C.INSTAGRAM_URL), () => {
    const s = make("span", "icon-link");
    s.innerHTML = IG_ICON; // static markup, no config data
    s.append(make("span", "sr-only", "אינסטגרם"));
    return s;
  });
  // Logos get their height from the CSS. [w, h] is the shipped file's size: it
  // reserves the box until the file loads, then the file's own ratio wins.
  const logo = (src, cls, alt, [w, h], lazy) => {
    const img = make("img", cls);
    img.src = src.trim();
    img.alt = alt;
    img.width = w;
    img.height = h;
    img.decoding = "async";
    if (lazy) img.loading = "lazy";
    return img;
  };
  const agudaLogo = () => logo(C.AGUDA_LOGO, "aguda-logo", "אגודת הסטודנטים, אוניברסיטת רייכמן", [458, 238], true);
  const agudaUrl = httpUrl(C.AGUDA_URL);
  const hasAgudaLogo = !blank(C.AGUDA_LOGO);
  foot("aguda", agudaUrl, () => (hasAgudaLogo ? agudaLogo() : doc.createTextNode("אגודת הסטודנטים")));
  // No real AGUDA_URL yet: the logo still shows, as a plain image beside the
  // chip, never as a dead link.
  if (!agudaUrl && hasAgudaLogo) doc.querySelector('[data-foot="aguda"]')?.prepend(agudaLogo());
  foot("email", mail && `mailto:${mail}`, () => ltr(mail));

  // ---- remaining single values (chips until filled) -------------------------
  const check = {
    PARTNER_EMAIL: email,
    PARTNER_WHATSAPP: (v) => (waDigits(v) ? v.trim() : null),
    INSTAGRAM_URL: httpUrl,
    AGUDA_URL: httpUrl,
    // "מקומות" comes with the number, not from index.html, so a chip there never reads "מקומות מקומות".
    SEATS: (v) => (/^\d{1,4}$/.test(v.trim()) ? `${v.trim()} מקומות` : null),
  };
  doc.querySelectorAll("[data-cfg]").forEach((n) => {
    const key = n.dataset.cfg;
    const v = C[key];
    if (blank(v)) { n.replaceWith(chip(v)); return; }
    const out = check[key] ? check[key](v) : v.trim();
    if (!out) { n.replaceWith(badChip(key)); return; }
    n.replaceWith(n.hasAttribute("data-ltr") ? ltr(out) : plain(key, out));
  });

  // ---- university logo: only beside a filled backing line --------------------
  // On its own the logo would claim backing whose wording nobody approved, so it
  // appears only next to BACKING_TEXT, and never while that is still a chip.
  const backing = doc.querySelector(".backing");
  if (backing && !blank(C.BACKING_TEXT) && !blank(C.REICHMAN_LOGO)) {
    backing.prepend(logo(C.REICHMAN_LOGO, "backing-logo", "אוניברסיטת רייכמן", [382, 234]));
    backing.classList.add("has-logo");
  }

  // ---- people ---------------------------------------------------------------
  const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("");
  const list = (v) => (Array.isArray(v) ? v.filter((x) => x && typeof x === "object") : []);

  // Team (S3): a photo tile, name, role, and the manager's own words behind the name.
  // A photo named *-224.webp gets its *-336.webp sibling for sharp phones.
  const tile = (m) => {
    const t = make("span", "tile");
    t.setAttribute("aria-hidden", "true");
    if (!blank(m.photo)) {
      const img = make("img");
      const src = m.photo.trim();
      img.src = src;
      if (/-224\.webp$/i.test(src)) {
        img.srcset = `${src} 224w, ${src.replace(/-224\.webp$/i, "-336.webp")} 336w`;
        img.sizes = "7rem";
      }
      img.alt = "";
      img.width = 112;
      img.height = 112;
      img.loading = "lazy";
      img.decoding = "async";
      t.append(img);
    } else if (!blank(m.name)) {
      t.textContent = initials(m.name);
    } else {
      t.classList.add("is-empty");
    }
    return t;
  };
  const member = (m, n) => {
    const li = make("li", "person member");
    const body = make("div", "person-body");
    const h = make("h3", "person-name");
    const role = make("p", "person-role");
    role.append(blank(m.role) ? chip(m.role) : m.role.trim());
    body.append(h, role);
    li.append(tile(m), body);
    if (blank(m.name) || blank(m.bio)) {
      h.append(blank(m.name) ? chip(m.name) : m.name.trim());
      if (blank(m.bio)) {
        const p = make("p", "bio-chip");
        p.append(chip(null, "ביוגרפיה"));
        body.append(p);
      }
      return li;
    }
    const b = make("button", null, m.name.trim());
    b.type = "button";
    h.append(b);
    const more = make("span", "more", "לקרוא עוד");
    more.setAttribute("aria-hidden", "true");
    body.append(more);
    const bio = make("div", "bio");
    bio.id = `bio-${n}`;
    const inner = make("div");
    inner.append(make("p", null, m.bio.trim()));
    bio.append(inner);
    li.append(bio);
    disclose(b, bio, (open) => {
      li.classList.toggle("is-open", open);
      more.textContent = open ? "לסגור" : "לקרוא עוד";
    });
    return li;
  };
  const team = doc.getElementById("team-list");
  list(C.TEAM).forEach((m, i) => team.append(member(m, i + 1)));

  // Speakers and partners: only entries with a real name. Never a sample.
  const person = (m) => {
    const li = make("li", "person");
    const av = make("span", "avatar");
    av.setAttribute("aria-hidden", "true");
    if (!blank(m.photo)) {
      const img = make("img");
      img.src = m.photo.trim();
      img.alt = "";
      img.width = 112;
      img.height = 112;
      img.loading = "lazy";
      img.decoding = "async";
      av.append(img);
    } else if (!blank(m.name)) {
      av.textContent = initials(m.name);
    } else {
      av.classList.add("is-empty");
    }
    const body = make("div", "person-body");
    const h = make("h3", "person-name");
    h.append(blank(m.name) ? chip(m.name) : m.name.trim());
    body.append(h);
    if ("role" in m) {
      const p = make("p", "person-role");
      p.append(blank(m.role) ? chip(m.role) : m.role.trim());
      body.append(p);
    }
    li.append(av, body);
    return li;
  };
  const speakers = list(C.SPEAKERS).filter((s) => !blank(s.name));
  const partners = list(C.PARTNERS).filter((p) => !blank(p.name));
  if (speakers.length || partners.length) {
    const box = doc.getElementById("people");
    box.replaceChildren();
    if (speakers.length) {
      const ul = make("ul", "people-list");
      speakers.forEach((s) => {
        const role = [s.role, s.org].filter((x) => !blank(x)).map((x) => x.trim()).join(", ");
        ul.append(person({ name: s.name, photo: s.photo, ...(role ? { role } : {}) }));
      });
      box.append(ul);
    }
    if (partners.length) {
      const ul = make("ul", "partner-names");
      ul.setAttribute("aria-label", "ארגונים שותפים");
      partners.forEach((p) => {
        const li = make("li");
        const u = httpUrl(p.url);
        li.append(u ? link(u, p.name.trim(), true) : p.name.trim());
        ul.append(li);
      });
      box.append(ul);
    }
  }

  // ---- FAQ --------------------------------------------------------------------
  // An undecided answer is a {KEY} placeholder. An unfilled answer, or an item
  // still carrying any "check" field (the retired draft flag), shows only a chip:
  // no path prints an undecided answer as plain text.
  const faq = doc.getElementById("faq-list");
  list(C.FAQ).forEach((item) => {
    if (blank(item.q)) return;
    const d = make("details");
    const answer = make("div", "answer");
    const p = make("p");
    if (blank(item.a) || item.check != null) {
      p.append(chip(item.a, pending(item.a) ? "" : "תשובה"));
    } else {
      item.a.trim().split(/\{([A-Z_]+)\}/).forEach((part, i) => {
        if (i % 2) p.append(valueNode(part));
        else if (part) p.append(part);
      });
    }
    answer.append(p);
    d.append(make("summary", null, item.q.trim()), answer);
    faq.append(d);
  });

  // ---- S4, the terminal -------------------------------------------------------
  // Soon: slide the puck the whole way (or tap it, or press Enter or Space) and the card
  // turns to its back: the real actions, and a way back. Live: the puck is the link to the
  // form. data-puck="off" on #term swaps the slider for a plain button that does the same.
  const FIGURE =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<circle cx="12" cy="5.6" r="3.3"/>' +
    '<path d="M7.6 10.6h8.8a2.6 2.6 0 0 1 2.5 1.9l1.5 5.4a1 1 0 0 1-1.9.6l-1.3-3.9-.9 7.6H7.7l-.9-7.6-1.3 3.9a1 1 0 0 1-1.9-.6l1.5-5.4a2.6 2.6 0 0 1 2.5-1.9z"/></svg>';
  const term = doc.getElementById("term");
  const terminal = () => {
    const front = term.querySelector(".front");
    const label = term.querySelector(".term-label");
    if (!front || !label) return;
    const puckOn = term.dataset.puck !== "off";
    if (signup) term.querySelector("[data-soon]")?.remove();
    let control;
    let slider = null;
    if (!puckOn) {
      control = signup ? link(signup, "להגשת מועמדות") : make("button", null, label.textContent.trim());
      if (!signup) control.type = "button";
      control.className = "btn";
      label.replaceWith(make("p", "verbs", "לומדים · עובדים · מקימים"), control);
    } else {
      if (signup) label.textContent = "להגשת מועמדות";
      const hint = make("p", "hint", "החליקו כל הדרך, או הקישו");
      hint.id = "track-hint";
      const track = make("div", "slide");
      const rail = make("div", "rail");
      rail.setAttribute("aria-hidden", "true");
      const stops = make("ol", "stops");
      for (const word of ["לומדים", "עובדים", "מקימים"]) stops.append(make("li", null, word));
      rail.append(make("span", "fill"), stops);
      control = signup ? link(signup, "") : make("button");
      if (signup) control.draggable = false;
      else control.type = "button";
      control.className = "puck";
      control.setAttribute("aria-labelledby", "track-label track-hint");
      control.innerHTML = FIGURE; // static markup, no config data
      track.append(rail, control);
      front.append(hint, track);
      slider = drag(track, control);
    }
    if (malformed) (puckOn ? label : control).after(badChip("SIGNUP_URL"));

    if (signup) {
      // Live: dock or tap follows the link inside the same gesture. No back face.
      if (slider) slider.onDock = () => slider.follow();
      return;
    }
    const back = make("div", "face back");
    back.id = "signup-back";
    const again = make("button", "flip-back", "חזרה");
    again.type = "button";
    const top = make("div", "back-top");
    top.append(make("h3", "back-h", "רוצים לדעת ראשונים?"), again);
    back.append(top, actionList());
    back.inert = true;
    term.querySelector(".term-card").append(back);
    control.setAttribute("aria-expanded", "false");
    control.setAttribute("aria-controls", back.id);
    const flip = (on) => {
      term.classList.toggle("is-flipped", on);
      control.setAttribute("aria-expanded", String(on));
      front.inert = on;
      back.inert = !on;
      (on ? back.querySelector(".act") || again : control).focus({ preventScroll: true }); // the first action
      if (on && slider) setTimeout(slider.reset, reduce ? 0 : 520); // back to the start, unseen
    };
    again.addEventListener("click", () => flip(false));
    back.addEventListener("keydown", (e) => { if (e.key === "Escape") flip(false); });
    if (slider) slider.onDock = () => setTimeout(() => flip(true), reduce ? 0 : 120);
    else control.addEventListener("click", () => flip(true));
  };

  // The puck (E3 to E5). Pointer Events with capture; the page keeps vertical scrolling
  // (touch-action: pan-y, and a first move more vertical than horizontal lets go). Layout
  // is read on pointerdown and on resize only; each pointermove writes one custom property.
  function drag(track, puck) {
    const term = track.closest(".term");
    const stops = [...track.querySelectorAll(".stops li")];
    const api = { onDock: () => {} };
    let dir = 1, travel = 0, marks = [], lit = 0, p = 0;
    let start = null, dragging = false, moved = false, synthetic = false, width = innerWidth;
    const setX = (px) => track.style.setProperty("--x", `${px}px`);
    const measured = () => { if (!marks.length) measure(); };
    const measure = () => {
      dir = getComputedStyle(track).direction === "rtl" ? -1 : 1;
      const gap = (track.clientHeight - puck.offsetHeight) / 2;
      travel = Math.max(1, track.clientWidth - puck.offsetWidth - 2 * gap);
      const box = track.getBoundingClientRect();
      const edge = dir < 0 ? box.right : box.left;
      const rest = gap + puck.offsetWidth / 2;
      marks = stops.map((li) => {
        const r = li.getBoundingClientRect();
        return (Math.abs(r.left + r.width / 2 - edge) - rest) / travel;
      });
    };
    const light = (q) => {
      const n = marks.filter((m) => q >= m).length;
      if (n === lit) return;
      lit = n;
      stops.forEach((li, i) => li.classList.toggle("is-lit", i < n));
    };
    const settle = (cls) => {
      term.classList.remove("is-returning", "is-docking");
      if (cls) term.classList.add(cls);
    };
    const dock = () => {
      measured();
      settle("is-docking");
      p = 1;
      setX(dir * travel);
      light(1);
      api.onDock();
    };
    const springBack = () => {
      // one overshoot of 8% of the distance, but never more than 4 px past the start
      const o = Math.min(0.08, 4 / Math.max(p * travel, 1));
      const k = (f) => (1 + o * f).toFixed(4);
      track.style.setProperty("--spring",
        `linear(0, 0.45 10%, 0.8 20%, 0.98 30%, ${k(1)} 40%, ${k(0.7)} 50%, ${k(0.25)} 60%, ${k(-0.05)} 70%, 1 80%, 1)`);
      settle("is-returning");
      p = 0;
      setX(0);
      light(0);
      setTimeout(() => settle(null), reduce ? 0 : 650);
    };
    api.reset = () => { settle(null); p = 0; setX(0); light(0); };
    api.follow = () => { synthetic = true; puck.click(); synthetic = false; };
    const let_go = () => {
      if (start && puck.hasPointerCapture(start.id)) puck.releasePointerCapture(start.id);
      start = null;
      term.classList.remove("is-touching");
    };
    puck.addEventListener("pointerdown", (e) => {
      if (!e.isPrimary || e.button !== 0) return;
      measure();
      start = { x: e.clientX, y: e.clientY, id: e.pointerId };
      dragging = moved = false;
      term.classList.add("is-touching", "is-touched");
      try { puck.setPointerCapture(e.pointerId); } catch { /* the pointer is already gone */ }
    });
    puck.addEventListener("pointermove", (e) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (!dragging) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return; // the 6 px intent lock
        moved = true;
        if (Math.abs(dy) > Math.abs(dx)) { let_go(); return; } // vertical first: the page scrolls
        dragging = true;
        settle(null);
        term.classList.add("is-dragging");
      }
      p = Math.min(1, Math.max(0, (dx * dir) / travel));
      setX(dir * p * travel);
      light(p);
    });
    const finish = (e, cancelled) => {
      if (!start || e.pointerId !== start.id) return;
      const was = dragging;
      let_go();
      dragging = false;
      term.classList.remove("is-dragging");
      if (moved) setTimeout(() => { moved = false; });
      if (!was) return; // a tap: the click that follows does it
      if (!cancelled && p >= 0.92) dock();
      else springBack();
    };
    puck.addEventListener("pointerup", (e) => finish(e, false));
    puck.addEventListener("pointercancel", (e) => finish(e, true));
    puck.addEventListener("click", (e) => {
      if (synthetic) return; // our own follow(): let the link navigate
      if (moved && e.detail !== 0) { e.preventDefault(); return; } // the end of a drag, not a tap
      if (puck.tagName === "A") { measured(); settle("is-docking"); setX(dir * travel); light(1); return; } // the link navigates
      dock();
    });
    addEventListener("resize", () => {
      if (innerWidth === width || dragging) return;
      width = innerWidth;
      measure();
      if (p) setX(dir * p * travel);
    }, { passive: true });
    return api;
  }
  if (term) terminal();

  // ---- visit counter: only once a real GoatCounter code is set --------------
  const gc = C.GOATCOUNTER_CODE;
  if (!blank(gc) && /^[a-z0-9-]{1,63}$/i.test(gc.trim())) {
    const s = make("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    s.dataset.goatcounter = `https://${gc.trim()}.goatcounter.com/count`;
    doc.body.append(s);
  }

  // ---- motion -----------------------------------------------------------------
  // Without IntersectionObserver nothing is marked .js, so the page stays the finished one
  // the CSS draws by default. .st marks support for scroll timelines: the CSS branches on
  // .st and .js:not(.st), so the scroll branch and the observer branch never both run.
  if (!("IntersectionObserver" in window)) return;
  const root = doc.documentElement;
  root.classList.add("js");
  const st = !!(window.CSS && CSS.supports && CSS.supports("animation-timeline: view()"));
  if (st) root.classList.add("st");
  const once = (els, fn, opts) => {
    const io = new IntersectionObserver((entries, obs) => {
      for (const e of entries) if (e.isIntersecting) { obs.unobserve(e.target); fn(e.target); }
    }, opts);
    for (const el of els) if (el) io.observe(el);
  };
  const SOON = { rootMargin: "0px 0px -8% 0px" };
  once(doc.querySelectorAll("[data-reveal]"), (n) => n.classList.add("is-in"), SOON);                    // C1
  once(doc.querySelectorAll(".frame"), (f) => f.classList.add("is-locked"), { ...SOON, threshold: 0.6 }); // N1
  once([doc.querySelector(".angles")], (a) => a.classList.add("is-in"), { ...SOON, threshold: 1 });     // N3
  once([term], (t) => t.classList.add("is-armed"), { threshold: 0.8 });                                  // E1, E2
  if (!st) once(doc.querySelectorAll(".section"), (s) => s.classList.add("is-wired"), { rootMargin: "0px 0px -28% 0px" }); // W1

  // The ring (S1). Phones with scroll timelines: the CSS draws it with the thumb and the
  // readout (R3) counts the same travel through 13 observer thresholds, no per-frame work.
  // Phones without: today's one-shot close, one turn of the hand, the readout counting
  // through it. Wide screens: the sticky ring closes arc by arc as each step is read.
  const ringWrap = doc.querySelector(".ring-wrap");
  const ring = ringWrap && ringWrap.querySelector(".ring");
  const deg = ring && ring.querySelector(".deg");
  if (!ring || !deg) return;
  const wide = matchMedia("(min-width: 900px)");
  const ringMode = ringWrap.dataset.ring || "scroll";
  const show = (d) => { deg.textContent = `${d}°`; ringWrap.classList.toggle("is-full", d === 360); };
  const close = () => { ring.classList.add("is-all"); ring.dataset.step = "3"; show(360); };
  if (reduce || ringMode === "off") { close(); return; }
  const stepIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting || !wide.matches) continue;
      const s = Number(e.target.dataset.step);
      ring.dataset.step = String(s);
      show(s * 120);
    }
  }, { rootMargin: "-45% 0px -45% 0px" });
  doc.querySelectorAll(".step").forEach((s) => stepIO.observe(s));
  wide.addEventListener("change", () => { if (!wide.matches) close(); });
  if (wide.matches) { show(0); return; }
  if (st && ringMode === "scroll") {
    ring.classList.add("is-all");
    ring.dataset.step = "3"; // the closed ring is the base; the scroll animation draws over it
    // The reading is the share of the ring above the 85% line (the CSS travel), in 30 degree
    // steps. It comes from the observers' own rects, so nothing is measured per frame. The
    // second observer only notices jumps (a tap to the top) that cross no threshold.
    const sync = (entries) => {
      if (wide.matches) return;
      const r = entries[entries.length - 1].boundingClientRect;
      const f = Math.min(1, Math.max(0, (0.85 * innerHeight - r.top) / r.height));
      show(Math.floor(f * 12 + 0.01) * 30);
    };
    new IntersectionObserver(sync, { threshold: Array.from({ length: 13 }, (_, i) => i / 12), rootMargin: "0px 0px -15% 0px" }).observe(ringWrap);
    new IntersectionObserver(sync, { rootMargin: "0px 0px 100000px 0px" }).observe(ringWrap);
  } else {
    show(0);
    once([ringWrap], () => {
      close();
      show(0);
      ringWrap.classList.add("is-turning");
      for (let i = 1; i <= 12; i++) setTimeout(() => show(i * 30), (i * 700) / 12);
    }, { threshold: 0.5 });
  }
})();
