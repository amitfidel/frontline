/* FRONTLINE landing page. Reads config.js, fills the page, runs the reveals.
 * Every unfilled or invalid value renders as a dashed "למילוי" chip,
 * so nothing unconfirmed can read as fact and no link is ever dead. */
(() => {
  "use strict";
  const C = window.FRONTLINE || {};
  for (const k of Object.keys(C)) if (typeof C[k] === "number") C[k] = String(C[k]); // SEATS: 20 works too
  const doc = document;
  const WA_OPENER = "שלום, הגעתי מהאתר של FRONTLINE ואשמח לשמוע על שיתוף פעולה.";
  const MAIL_SUBJECT = "FRONTLINE, שיתוף פעולה";

  // ---- values -------------------------------------------------------------
  // The prefix is split so the publish grep for unfilled values only ever hits config.js.
  const MARK = "TODO" + "_";
  const pending = (v) => typeof v === "string" && v.startsWith(MARK);
  const blank = (v) => typeof v !== "string" || v.trim() === "" || pending(v);

  const httpUrl = (v) => {
    if (blank(v)) return null;
    try {
      const u = new URL(v.trim());
      return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
    } catch { return null; }
  };
  const email = (v) =>
    !blank(v) && /^[^\s@<>()"',;:]+@[^\s@<>()"',;:]+\.[a-z]{2,}$/i.test(v.trim()) ? v.trim() : null;
  const waDigits = (v) => {
    if (blank(v)) return null;
    const d = v.replace(/\D/g, "");
    return d.length >= 8 && d.length <= 15 ? d : null;
  };

  // ---- dom helpers --------------------------------------------------------
  const make = (tag, cls, text) => {
    const n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const ltr = (text) => { const b = make("bdi", null, text); b.dir = "ltr"; return b; };
  const chip = (v, label) => {
    const c = make("span", "todo");
    c.append(make("b", null, "למילוי"));
    const hint = label || (pending(v) ? v.slice(MARK.length).trim() : "");
    if (hint) c.append(" · " + hint);
    return c;
  };
  const badChip = () => chip(null, "לבדוק את הערך ב־config.js");
  const valueNode = (key) => (blank(C[key]) ? chip(C[key]) : doc.createTextNode(C[key].trim()));
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
      n.after(badChip());
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
  foot("aguda", httpUrl(C.AGUDA_URL), () => {
    if (blank(C.AGUDA_LOGO)) return doc.createTextNode("אגודת הסטודנטים");
    const img = make("img", "aguda-logo");
    img.src = C.AGUDA_LOGO.trim();
    img.alt = "אגודת הסטודנטים";
    img.height = 40;
    img.loading = "lazy";
    return img;
  });
  foot("email", mail && `mailto:${mail}`, () => ltr(mail));

  // ---- remaining single values (chips until filled) -------------------------
  const check = {
    PARTNER_EMAIL: email,
    PARTNER_WHATSAPP: (v) => (waDigits(v) ? v.trim() : null),
    INSTAGRAM_URL: httpUrl,
    AGUDA_URL: httpUrl,
  };
  doc.querySelectorAll("[data-cfg]").forEach((n) => {
    const key = n.dataset.cfg;
    const v = C[key];
    if (blank(v)) { n.replaceWith(chip(v)); return; }
    const out = check[key] ? check[key](v) : v.trim();
    if (!out) { n.replaceWith(badChip()); return; }
    n.replaceWith(n.hasAttribute("data-ltr") ? ltr(out) : doc.createTextNode(out));
  });

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
  const faq = doc.getElementById("faq-list");
  list(C.FAQ).forEach((item) => {
    if (blank(item.q) || blank(item.a)) return;
    const d = make("details");
    const answer = make("div", "answer");
    const p = make("p");
    item.a.trim().split(/\{([A-Z_]+)\}/).forEach((part, i) => {
      if (i % 2) p.append(valueNode(part));
      else if (part) p.append(part);
    });
    if (pending(item.check)) {
      answer.classList.add("is-draft");
      answer.append(chip(null, "טיוטה, לאשר לפני פרסום"));
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
