/* FRONTLINE landing page. Reads config.js, fills the page, runs the reveals.
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
  const MAIL_SUBJECT = "FRONTLINE, שיתוף פעולה";

  // ---- values -------------------------------------------------------------
  // Unfilled marker: the config.js prefix in any case, with anything that is not a
  // letter or a digit in front of it (spaces, quotes, gershayim), and its near-misses
  // (a dash, a colon or a space instead of the underscore). fold() first turns
  // fullwidth letters into plain ones and drops invisible marks (RLM, LRM, zero-width
  // space, BOM), so a pasted value cannot hide the marker from the test.
  // Written as a regex so the publish grep for the literal marker only ever hits config.js.
  const MARK = /^[^\p{L}\p{N}]*todo(?![a-z])[\s_:-]*/iu;
  const fold = (v) => v.normalize("NFKC").replace(/\p{DI}/gu, "");
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
    const hint = label || (pending(v) ? fold(v).replace(MARK, "").replace(/[\s\p{Pi}\p{Pf}"'`\u05F3\u05F4]+$/u, "") : "");
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

  // ---- sign-up buttons: a real link only when the URL is real -------------
  const signup = httpUrl(C.SIGNUP_URL);
  doc.querySelectorAll("[data-signup]").forEach((n) => {
    if (signup) {
      const a = link(signup, "להגשת מועמדות");
      a.className = "btn";
      n.replaceWith(a);
    } else if (!blank(C.SIGNUP_URL)) {
      n.after(badChip("SIGNUP_URL"));
    }
  });

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

  // ---- people cards (team, speakers) ----------------------------------------
  const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("");
  const person = (m, headingTag) => {
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
    const h = make(headingTag, "person-name");
    h.append(blank(m.name) ? chip(m.name) : m.name.trim());
    body.append(h);
    for (const [field, cls] of [["role", "person-role"], ["line", "person-line"]]) {
      if (!(field in m)) continue;
      const p = make("p", cls);
      p.append(blank(m[field]) ? chip(m[field]) : m[field].trim());
      body.append(p);
    }
    li.append(av, body);
    return li;
  };
  const list = (v) => (Array.isArray(v) ? v.filter((x) => x && typeof x === "object") : []);

  const team = doc.getElementById("team-list");
  list(C.TEAM).forEach((m) => team.append(person(m, "h3")));

  // Speakers and partners: only entries with a real name. Never a sample.
  const speakers = list(C.SPEAKERS).filter((s) => !blank(s.name));
  const partners = list(C.PARTNERS).filter((p) => !blank(p.name));
  if (speakers.length || partners.length) {
    const box = doc.getElementById("people");
    box.replaceChildren();
    if (speakers.length) {
      const ul = make("ul", "people-list");
      speakers.forEach((s) => {
        const role = [s.role, s.org].filter((x) => !blank(x)).map((x) => x.trim()).join(", ");
        ul.append(person({ name: s.name, photo: s.photo, ...(role ? { role } : {}) }, "h3"));
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

  // ---- motion: reveals and the ring -----------------------------------------
  doc.documentElement.classList.add("js");
  const ring = doc.querySelector(".ring");
  const wide = matchMedia("(min-width: 900px)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const closeRing = () => { if (ring) ring.dataset.step = "3"; };

  if (!("IntersectionObserver" in window)) {
    doc.querySelectorAll("[data-reveal]").forEach((n) => n.classList.add("is-in"));
    closeRing();
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); obs.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    doc.querySelectorAll("[data-reveal]").forEach((n) => io.observe(n));

    if (ring) {
      if (reduce && !wide.matches) closeRing();
      // Narrow screens: the ring sits above the steps and closes in one move.
      new IntersectionObserver((entries, obs) => {
        if (entries.some((e) => e.isIntersecting) && !wide.matches) {
          ring.classList.add("is-all");
          closeRing();
          obs.disconnect();
        }
      }, { threshold: 0.5 }).observe(ring);
      // Wide screens: the ring is sticky and closes arc by arc as each step is read.
      const stepIO = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && wide.matches) ring.dataset.step = e.target.dataset.step;
        });
      }, { rootMargin: "-45% 0px -45% 0px" });
      doc.querySelectorAll(".step").forEach((s) => stepIO.observe(s));
      wide.addEventListener("change", () => { if (!wide.matches) closeRing(); });
    }
  }

  // ---- visit counter: only once a real GoatCounter code is set --------------
  const gc = C.GOATCOUNTER_CODE;
  if (!blank(gc) && /^[a-z0-9-]{1,63}$/i.test(gc.trim())) {
    const s = make("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    s.dataset.goatcounter = `https://${gc.trim()}.goatcounter.com/count`;
    doc.body.append(s);
  }
})();
