(() => {
  // src/model.js
  var fmt = (v, opts = {}) => {
    if (v === null || v === void 0 || v === "") return "\u2014";
    if (typeof v === "number") {
      if (opts.ratio || Math.abs(v) < 1 && v !== 0 && !Number.isInteger(v)) return v.toFixed(4);
      const cents = opts.cents || !Number.isInteger(v);
      const s = Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });
      return v < 0 ? `(${s})` : s;
    }
    return String(v);
  };
  var signed = (v) => (v > 0 ? "+" : v < 0 ? "\u2212" : "") + fmt(Math.abs(Math.round(v)));
  var group = (arr, f) => arr.reduce((m, x) => {
    const k = f(x);
    (m.get(k) || m.set(k, []).get(k)).push(x);
    return m;
  }, /* @__PURE__ */ new Map());
  var AREAS = [
    { id: "intake_and_engagement", name: "Intake & engagement", short: "Intake" },
    { id: "wages_and_stock_compensation", name: "Wages, stock comp & benefits", short: "Wages" },
    { id: "investments_and_digital_assets", name: "Investments, crypto & foreign", short: "Investments" },
    { id: "business", name: "Business (Lindqvist Studio)", short: "Business" },
    { id: "rentals_and_sale", name: "Rentals & condo sale", short: "Rentals" },
    { id: "pass_throughs_and_basis", name: "K-1s & basis", short: "K-1s" },
    { id: "deductions_and_credits", name: "Deductions & credits", short: "Deductions" },
    { id: "tax_and_payments", name: "Tax computation & payments", short: "Tax & payments" },
    { id: "california", name: "California (540NR)", short: "California" },
    { id: "partner_review", name: "Partner review", short: "Partner" }
  ];
  var areaName = (id) => (AREAS.find((a) => a.id === id) || { name: id }).name;
  function areaOfLine(key) {
    const k = key;
    if (/^(SchCA540NR|F540NR|ScheduleS|FTB)/.test(k)) return "california";
    if (/^(F1040\.1|F8959|Sch3\.11|F6251\.2i)/.test(k) || /^F1040\.1[az]$/.test(k)) return "wages_and_stock_compensation";
    if (/^(F8606|F8889|F1040\.4|Sch1\.13)/.test(k)) return "wages_and_stock_compensation";
    if (/^(F7203|F8949\.F|SchD\.12|SchE\.28|SchE\.32|SchB\.1\.7|SchB\.1\.8|F8995\.(2|15)\.2)/.test(k)) return "pass_throughs_and_basis";
    if (/^(SchC|SchSE|F4562-C|Sch1\.(3|15|16|17)|F8995\.(2|15)\.1)/.test(k)) return "business";
    if (/^(SchE|F4562-E|F4797|F8582)/.test(k)) return "rentals_and_sale";
    if (/^(SchB|SchD|F8949|F8960|F1040\.(2b|3a|3b|7)$|Sch3\.1$|F8938)/.test(k)) return "investments_and_digital_assets";
    if (/^(SchA|F8283|F8812|F8863|F2441|F8867|F1040\.(12|13|14|19)$|F8995)/.test(k)) return "deductions_and_credits";
    return "tax_and_payments";
  }
  var DOC_AREA = {
    D01: "intake_and_engagement",
    D02: "intake_and_engagement",
    D03: "intake_and_engagement",
    D04: "intake_and_engagement",
    D05: "intake_and_engagement",
    D06: "intake_and_engagement",
    D07: "intake_and_engagement",
    D69: "tax_and_payments",
    D70: "intake_and_engagement",
    D72: "tax_and_payments",
    D71: "deductions_and_credits",
    D08: "wages_and_stock_compensation",
    D09: "wages_and_stock_compensation",
    D10: "wages_and_stock_compensation",
    D11: "wages_and_stock_compensation",
    D12: "wages_and_stock_compensation",
    D13: "wages_and_stock_compensation",
    D73: "california",
    D41: "wages_and_stock_compensation",
    D42: "wages_and_stock_compensation",
    D43: "wages_and_stock_compensation",
    D44: "wages_and_stock_compensation",
    D45: "wages_and_stock_compensation",
    D28: "investments_and_digital_assets",
    D29: "investments_and_digital_assets",
    D30: "investments_and_digital_assets",
    D31: "investments_and_digital_assets",
    D32: "investments_and_digital_assets",
    D33: "investments_and_digital_assets",
    D34: "investments_and_digital_assets",
    D35: "investments_and_digital_assets",
    D36: "investments_and_digital_assets",
    D74: "investments_and_digital_assets",
    D37: "pass_throughs_and_basis",
    D38: "pass_throughs_and_basis",
    D39: "pass_throughs_and_basis",
    D40: "pass_throughs_and_basis",
    D67: "tax_and_payments",
    D68: "tax_and_payments"
  };
  function areaOfDoc(d) {
    if (DOC_AREA[d.id]) return DOC_AREA[d.id];
    const n = +d.id.slice(1);
    if (n >= 14 && n <= 27) return "business";
    if (n >= 46 && n <= 53) return "rentals_and_sale";
    return "deductions_and_credits";
  }
  function maskText(s, reveal) {
    if (reveal || !s) return s;
    let out = String(s);
    out = out.replace(/\b(\d{3})-(\d{2})-(\d{4})\b/g, (_, a, b, c) => `\u2022\u2022\u2022-\u2022\u2022-${c}`);
    out = out.replace(/\bSE\d{2}(?: ?\d{4}){5}\b/g, (m) => "SE\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 " + m.slice(-9));
    out = out.replace(/(Identity Protection PIN[^0-9]*)(\d{6})/g, (_, a) => a + "\u2022\u2022\u2022\u2022\u2022\u2022");
    out = out.replace(/(license no\. )(\d+)/g, (_, a, n) => a + "\u2022\u2022\u2022\u2022" + n.slice(-3));
    return out;
  }
  var isSensitiveEv = (e) => ["ssn", "account_number"].includes(e.value_type) || /ip_pin|routing|account/.test(e.field);
  function buildModel(P) {
    const docs = new Map(P.documents.map((d) => [d.id, d]));
    const evs = new Map(P.extracted_values.map((e) => [e.id, e]));
    const evByDoc = group(P.extracted_values, (e) => e.document_id);
    const staff = new Map(P.firm.staff.map((s) => [s.id, s]));
    const clientUsers = new Map(P.firm.client_users.map((c) => [c.id, c]));
    const qa = new Map(P.client.questionnaire.map((q) => [q.id, q]));
    const msgs = new Map(P.client.messages.map((q) => [q.id, q]));
    const calls = new Map(P.client.call_notes.map((q) => [q.id, q]));
    const people = new Map(P.household.people.map((p) => [p.id, p]));
    const versions = P.return_versions.map((v) => {
      const lineMap = new Map(v.lines.map((l) => [l.key, l]));
      const usedBy = /* @__PURE__ */ new Map();
      const evToLines = /* @__PURE__ */ new Map();
      for (const l of v.lines) {
        for (const i of l.inputs || []) (usedBy.get(i) || usedBy.set(i, []).get(i)).push(l.key);
        for (const s of l.sources || []) (evToLines.get(s) || evToLines.set(s, []).get(s)).push(l.key);
      }
      const assets = new Map((v.assets || []).map((a) => [a.asset_id, a]));
      return { ...v, lineMap, usedBy, evToLines, assets };
    });
    const vIndex = new Map(versions.map((v) => [v.version, v]));
    function docLanding(version, docId) {
      const out = /* @__PURE__ */ new Map();
      for (const e of evByDoc.get(docId) || []) for (const k of version.evToLines.get(e.id) || []) (out.get(k) || out.set(k, []).get(k)).push(e.id);
      for (const [ref, keys] of version.evToLines) if (ref === docId || ref.startsWith(`doc:${docId}#`)) for (const k of keys) out.get(k) || out.set(k, []);
      return out;
    }
    function docStatus(version, d) {
      const used = version.documents_used.includes(d.id);
      const superseded = version.documents_superseded.includes(d.id);
      const landing = docLanding(version, d.id);
      if (superseded) return { code: "superseded", label: "Superseded", detail: "Replaced by a corrected document." };
      if (d.id === "D10") return { code: "duplicate", label: "Duplicate image", detail: "Second image of the Halvorsen W-2 (D09); matched and counted once." };
      if (d.extraction.status === "not_extracted") return { code: "reference", label: "Reference only", detail: d.extraction.reason };
      if (landing.size) return { code: "landed", label: `On return (${landing.size} line${landing.size > 1 ? "s" : ""})`, landing, partial: d.extraction.status === "partial", detail: d.extraction.reason };
      if (!used) return { code: "not_used", label: "Not in this version", detail: "Received after this computation, or not used by the engine." };
      return { code: "support", label: "Support only", detail: "Used by the engine as context (identity, engagement, prior year or supporting detail); no return line cites its values." };
    }
    function resolveRef(ref, version) {
      if (!ref) return null;
      if (/^ev-\d+$/.test(ref)) {
        const e = evs.get(ref);
        return e ? { kind: "ev", id: ref, label: `${e.document_id} p${e.page} \xB7 ${e.label}`, value: e.value, ev: e, doc: docs.get(e.document_id) } : { kind: "missing", id: ref, label: ref };
      }
      if (/^D\d{2}$/.test(ref)) {
        const d = docs.get(ref);
        return { kind: "doc", id: ref, label: `${ref} \xB7 ${d?.title}`, doc: d };
      }
      let m;
      if (m = ref.match(/^doc:(D\d+)#page(\d+)$/)) return { kind: "docpage", id: ref, label: `${m[1]} page ${m[2]} (not extracted)`, doc: docs.get(m[1]), page: +m[2] };
      if (/^qa-\d+$/.test(ref)) {
        const q = qa.get(ref);
        return { kind: "qa", id: ref, label: `Questionnaire: ${q?.question}`, value: q?.answer, item: q };
      }
      if (/^msg-\d+$/.test(ref)) {
        const q = msgs.get(ref);
        return { kind: "msg", id: ref, label: `Message from ${q?.from}`, value: q?.text, item: q };
      }
      if (/^call-\d+$/.test(ref)) {
        const q = calls.get(ref);
        return { kind: "call", id: ref, label: "Client call notes", value: q?.notes.join(" \xB7 "), item: q };
      }
      if (ref.startsWith("py:")) {
        const v = jsonPointer(P.prior_years, ref.slice(3));
        return { kind: "py", id: ref, label: `Prior year ${ref.slice(4).replace(/\//g, " \u203A ")}`, value: v };
      }
      if (ref.startsWith("agency:")) {
        const v = jsonPointer(P.tax_agency_records, ref.slice(7));
        return { kind: "agency", id: ref, label: `Agency record ${ref.slice(8)}`, value: v };
      }
      if (ref.startsWith("asset:")) {
        const id = ref.slice(6);
        const a = version?.assets.get(id) || P.prior_years.asset_records.find((x) => x.asset_id === id);
        return { kind: "asset", id, label: `Asset ${id} \xB7 ${a?.description || ""}`, asset: a };
      }
      if (ref.startsWith("household:")) {
        const p = people.get(ref.slice(10));
        return { kind: "person", id: ref, label: `${p?.name} (${p?.role})`, person: p };
      }
      if (ref.startsWith("ref:param.")) {
        const k = ref.slice(10);
        return { kind: "param", id: ref, label: `Engine parameter ${k}`, value: P.engine_reference.parameters[k] };
      }
      if (ref.startsWith("ref:fx.")) {
        const [, , cur, rate] = ref.split(".");
        return { kind: "param", id: ref, label: `FX ${cur} ${rate}`, value: P.engine_reference.parameters.fx[cur][rate] };
      }
      if (ref.startsWith("timeline:")) {
        const t = P.timeline.find((x) => x.id === ref.slice(9));
        return { kind: "timeline", id: ref, label: `Timeline: ${t?.event}`, value: t?.detail, item: t };
      }
      if (version?.lineMap.has(ref)) {
        const l = version.lineMap.get(ref);
        return { kind: "line", id: ref, label: `${ref} \xB7 ${l.label}`, value: l.value, line: l };
      }
      return { kind: "text", id: ref, label: ref };
    }
    const py = P.prior_years.return_2024;
    function lots(version) {
      const rows = [];
      for (const l of version.lines) {
        if (l.form !== "F8949" || /total$/.test(l.key)) continue;
        const [, box, lot] = l.key.split(".");
        const m = l.label.match(/^(.*?) \(acquired ([^,]+), sold ([^;]+); proceeds ([\d,.-]+), basis ([\d,.-]+)(?:, adjustment [A-Z]+ ([\d,.-]+))?\)/);
        const num2 = (s) => s ? parseFloat(s.replace(/,/g, "")) : 0;
        const broker = lot.startsWith("X") ? "Brightpath" : lot.startsWith("M") ? "Meridian" : lot.startsWith("N") ? "Northlake" : lot.startsWith("C") ? "Coinhaven" : "Woodworks (S corp)";
        rows.push({ key: l.key, box, lot, broker, desc: m ? m[1] : l.label, acquired: m?.[2], sold: m?.[3], proceeds: num2(m?.[4]), basis: num2(m?.[5]), adj: num2(m?.[6]), gain: l.value, term: ["D", "E", "F", "K"].includes(box) ? "long" : "short", covered: ["A", "D"].includes(box), digital: ["H", "K"].includes(box), sources: l.sources, line: l });
      }
      return rows;
    }
    return { P, docs, evs, evByDoc, staff, clientUsers, qa, msgs, calls, people, versions, vIndex, docLanding, docStatus, resolveRef, py, lots };
  }
  function jsonPointer(obj, ptr) {
    if (!ptr || ptr === "/") return obj;
    return ptr.split("/").slice(1).reduce((o, k) => o == null ? void 0 : o[k.replace(/~1/g, "/").replace(/~0/g, "~")], obj);
  }
  function hash(obj) {
    const s = typeof obj === "string" ? obj : JSON.stringify(obj);
    let h2 = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h2 ^= s.charCodeAt(i);
      h2 = Math.imul(h2, 16777619);
    }
    return (h2 >>> 0).toString(16).padStart(8, "0");
  }

  // src/ui/core.js
  var { h, render, createContext, Fragment } = window.preact;
  var { useState, useEffect, useMemo, useContext, useRef, useCallback } = window.preactHooks;
  var html = window.htm.bind(h);
  var Ctx = createContext(null);
  var useApp = () => useContext(Ctx);
  var cx = (...a) => a.filter(Boolean).join(" ");
  function Money({ v, cents, strike, className }) {
    return html`<span class=${cx("num", strike && "strike", className, typeof v === "number" && v < 0 && "neg")}>${typeof v === "number" ? fmt(v, { cents }) : fmt(v)}</span>`;
  }
  function Pill({ tone = "neutral", children, title }) {
    return html`<span class=${`pill pill-${tone}`} title=${title}>${children}</span>`;
  }
  function Btn({ onClick, children, kind = "default", disabled, title, small, type = "button" }) {
    return html`<button type=${type} class=${cx("btn", `btn-${kind}`, small && "btn-sm")} onClick=${onClick} disabled=${disabled} title=${title}>${children}</button>`;
  }
  function Section({ title, right, children, sub }) {
    return html`<section class="sec">
    ${(title || right) && html`<header class="sec-h"><div><h3>${title}</h3>${sub && html`<p class="sub">${sub}</p>`}</div>${right && html`<div class="sec-r">${right}</div>`}</header>`}
    ${children}
  </section>`;
  }
  function Ref({ r, label, children, title, plain }) {
    const app = useApp();
    if (!r) return null;
    const res = app.M.resolveRef(r, app.V);
    const kind = res?.kind || "text";
    const text = children || label || shortRef(r, res);
    return html`<button type="button" class=${`ref ref-${kind}${plain ? " plain" : ""}`} title=${title || res?.label || r} onClick=${(e) => {
      e.stopPropagation();
      app.open(r);
    }}>${text}</button>`;
  }
  function shortRef(r, res) {
    if (!res) return r;
    if (res.kind === "ev") return `${res.ev.document_id}\xB7${res.ev.label}`;
    if (res.kind === "doc") return r;
    if (res.kind === "line") return r;
    if (res.kind === "docpage") return `${res.doc?.id} p${res.page}`;
    if (res.kind === "py") return "PY " + r.slice(4).split("/").slice(-2).join("/");
    if (res.kind === "agency") return "Agency " + r.slice(8).split("/")[0];
    if (r.startsWith("F-")) return r;
    if (r.startsWith("area:")) return areaName(r.slice(5));
    return r.replace(/^household:/, "").replace(/^ref:/, "");
  }
  function Who({ id }) {
    const app = useApp();
    const a = app.actorById.get(id);
    if (!a) return html`<span class="who">${id}</span>`;
    return html`<span class="who" title=${a.role}><span class=${`dot dot-${a.role}`}></span>${a.name}</span>`;
  }
  function When({ at }) {
    if (!at) return null;
    const d = new Date(at);
    return html`<time class="when" datetime=${at} title=${at}>${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</time>`;
  }
  function Modal({ title, onClose, children, wide }) {
    useEffect(() => {
      const k = (e) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", k);
      return () => window.removeEventListener("keydown", k);
    }, []);
    return html`<div class="modal-bg" onClick=${onClose}><div class=${cx("modal", wide && "modal-wide")} role="dialog" aria-label=${title} onClick=${(e) => e.stopPropagation()}>
    <header class="modal-h"><h3>${title}</h3><button class="x" aria-label="Close" onClick=${onClose}>×</button></header>
    <div class="modal-b">${children}</div></div></div>`;
  }
  function Empty({ children }) {
    return html`<div class="empty">${children}</div>`;
  }
  function Bar({ value, max, tone = "accent" }) {
    const pct = max ? Math.min(100, value / max * 100) : 0;
    return html`<div class="bar"><div class=${`bar-fill bar-${tone}`} style=${`width:${pct}%`}></div></div>`;
  }
  var TICK = { agreed_to_source_document: "\u2713S", recalculated: "\u2713R", confirmed_with_client: "\u2713C", agreed_to_prior_year: "\u2713P", agreed_to_third_party_record: "\u2713T" };
  var TICK_LABEL = { agreed_to_source_document: "Agreed to source document", recalculated: "Recalculated", confirmed_with_client: "Confirmed with client", agreed_to_prior_year: "Agreed to prior year", agreed_to_third_party_record: "Agreed to third-party record" };
  function Tick({ method, title }) {
    return html`<span class=${`tick tick-${method}`} title=${title || TICK_LABEL[method] || method}>${TICK[method] || "\u2713"}</span>`;
  }
  var KIND_LABEL = { engine_error: "Engine error", extraction_error: "Extraction error", client_conflict: "Client data conflict", judgment: "Judgment call", outside_filing: "Outside filing", pass: "Pass" };
  var KIND_TONE = { engine_error: "bad", extraction_error: "bad", client_conflict: "warn", judgment: "info", outside_filing: "neutral" };

  // src/checks.js
  var num = (s) => s == null ? 0 : typeof s === "number" ? s : parseFloat(String(s).replace(/[,$]/g, "")) || 0;
  var r0 = (x) => Math.round(x);
  var pageText = (M, docId, page) => M.docs.get(docId)?.pages.find((p) => p.page === page)?.printed_content || "";
  var docText = (M, docId) => (M.docs.get(docId)?.pages || []).map((p) => p.printed_content).join("\n");
  var evsOf = (M, docId) => M.evByDoc.get(docId) || [];
  var evField = (M, docId, field) => evsOf(M, docId).find((e) => e.field === field);
  function effectOf(V, category, delta, caCategory) {
    const R = V.tax_effect_rates;
    const f = R[category]?.federal_per_dollar ?? 0;
    const c = R[caCategory || category]?.california_per_dollar ?? 0;
    return { tax_fed: r0(delta * f), tax_ca: r0(delta * c), basis: `${fmtn(delta)} \xD7 ${category} (fed ${f}${caCategory ? `; CA ${caCategory} ${c}` : `, CA ${c}`})` };
  }
  var fmtn = (v) => (v < 0 ? "\u2212" : "") + Math.abs(Math.round(v)).toLocaleString("en-US");
  function extractionFidelity(M) {
    const issues = [];
    for (const e of M.P.extracted_values) {
      const txt = pageText(M, e.document_id, e.page);
      if (!txt) continue;
      const read = e.text_as_read || "";
      let ok = true;
      if (["money", "integer", "quantity"].includes(e.value_type)) {
        const v = num(e.value);
        if (v !== 0) {
          const nums = new Set((txt.match(/-?\d[\d,]*\.?\d*/g) || []).map((x) => num(x)));
          ok = nums.has(v) || nums.has(-v);
        }
      } else if (e.value_type === "date") {
        const v = String(e.value || "");
        if (v) {
          const [y, m, d] = v.split("-");
          ok = txt.includes(v) || txt.includes(`${m}/${d}/${y}`) || txt.includes(`${m}/${y}`);
        }
      } else if (["text", "ein", "ssn", "code", "account_number"].includes(e.value_type) && read && read.length > 3) {
        const norm = (s) => s.toLowerCase().replace(/\s+/g, " ");
        ok = norm(txt).includes(norm(read));
        if (ok && String(e.value) !== read && e.value_type !== "text") ok = false;
      }
      if (!ok) issues.push(e);
    }
    return issues;
  }
  function runChecks(M, V) {
    const P = M.P;
    const L2 = (k) => V.lineMap.get(k);
    const val = (k) => L2(k)?.value;
    const findings = [];
    const recompute = [];
    const add = (f) => findings.push({ status_default: "open", severity: "error", ...f });
    const rc = (r) => recompute.push({ ...r, agree: r.agree ?? Math.abs(num(r.engine) - num(r.independent)) <= (r.tol ?? 1) });
    const w2Docs = P.documents.filter((d) => d.document_type === "W-2");
    const distinct = /* @__PURE__ */ new Map();
    for (const d of w2Docs) {
      const ein = evField(M, d.id, "employer_ein")?.value;
      const b1 = evField(M, d.id, "box1")?.value;
      distinct.set(`${ein}|${b1}`, d);
    }
    const w2 = [...distinct.values()];
    const sumBox = (box) => w2.reduce((s, d) => s + num(evField(M, d.id, box)?.value), 0);
    rc({ id: "rc-w2-box1", area: "wages_and_stock_compensation", label: "Wages: sum of box 1 over distinct W-2s (dedupe by EIN + box 1)", engine: val("F1040.1a"), independent: sumBox("box1"), refs: ["F1040.1a", ...w2.map((d) => d.id)], note: `${w2Docs.length} W-2 images \u2192 ${w2.length} distinct (D10 is a phone photo of D09).` });
    rc({ id: "rc-w2-box2", area: "wages_and_stock_compensation", label: "Federal withholding: sum of box 2", engine: val("F1040.25a"), independent: sumBox("box2"), refs: ["F1040.25a"] });
    const ssMax = P.engine_reference.parameters.ss_wage_base * 0.062;
    rc({ id: "rc-excess-ss", area: "wages_and_stock_compensation", label: "Excess social security: box 4 total \u2212 6.2% \xD7 wage base", engine: val("Sch3.11"), independent: r0(sumBox("box4") - ssMax), refs: ["Sch3.11"] });
    rc({ id: "rc-medicare", area: "wages_and_stock_compensation", label: "Medicare wages: sum of box 5", engine: val("F8959.1"), independent: sumBox("box5"), refs: ["F8959.1"] });
    if (L2("F8606.18")) {
      const basis = num(val("F8606.1")) + num(evField(M, "D42", "box1")?.value);
      const conv = num(evField(M, "D41", "box1")?.value);
      rc({ id: "rc-8606", area: "wages_and_stock_compensation", label: "Backdoor Roth: taxable conversion = 1099-R box 1 \u2212 (2025 contribution + 2024 basis per 5498)", engine: val("F8606.18"), independent: conv - basis, refs: ["F8606.18", "D41", "D42", "D43"] });
    }
    const slmm = (cost2, pis, year, disposed) => {
      const [py, pm] = pis.split("-").map(Number);
      const annual = cost2 / 27.5;
      if (year < py) return 0;
      if (year === py) return annual * (12 - pm + 0.5) / 12;
      if (disposed && +disposed.slice(0, 4) === year) {
        const dm = +disposed.slice(5, 7);
        return annual * (dm - 0.5) / 12;
      }
      return annual;
    };
    const pyAssets = new Map(P.prior_years.asset_records.map((a) => [a.asset_id, a]));
    const depA = ["SAC-BLDG", "SAC-ROOF"].reduce((s, id) => s + slmm(pyAssets.get(id).cost, pyAssets.get(id).placed_in_service, 2025, null), 0);
    const depB = ["AUS-BLDG", "AUS-FLOOR"].reduce((s, id) => s + slmm(pyAssets.get(id).cost, pyAssets.get(id).placed_in_service, 2025, pyAssets.get(id).disposed), 0);
    rc({ id: "rc-dep-a", area: "rentals_and_sale", label: "1450 Fremont depreciation (27.5-yr SL mid-month from asset records)", engine: val("F4562-E.total-A"), independent: r0(depA), refs: ["F4562-E.total-A", "asset:SAC-BLDG", "asset:SAC-ROOF"] });
    rc({ id: "rc-dep-b", area: "rentals_and_sale", label: "Barton Hills condo depreciation through sale month", engine: val("F4562-E.total-B"), independent: r0(depB), refs: ["F4562-E.total-B", "asset:AUS-BLDG", "asset:AUS-FLOOR"] });
    const accum = ["AUS-BLDG", "AUS-FLOOR"].reduce((s, id) => {
      const a = pyAssets.get(id);
      return s + Object.values(a.federal).reduce((x, y) => x + y, 0) + slmm(a.cost, a.placed_in_service, 2025, a.disposed);
    }, 0);
    const sale = num(evField(M, "D51", "price")?.value), cost = num(evField(M, "D51", "purchase_price")?.value), imp = num(evField(M, "D51", "flooring")?.value);
    const selling = num(evField(M, "D51", "commission")?.value) + num(evField(M, "D51", "title")?.value);
    rc({ id: "rc-4797", area: "rentals_and_sale", label: "Condo gain: price \u2212 (cost + improvements + selling costs \u2212 depreciation)", engine: val("F4797.25"), independent: r0(sale - (cost + imp + selling - accum)), refs: ["F4797.25", "D51"], tol: 2 });
    const k23 = M.docs.get("D40");
    if (L2("F7203.1")) {
      const b22 = P.prior_years.basis_records.scorp_lindqvist_family_woodworks[0].ending_stock_basis;
      const inc23 = num(evField(M, "D40", "box1")?.value), dist23 = num(evField(M, "D40", "box16d")?.value);
      const b23 = Math.max(0, b22 + inc23 - dist23);
      const b24 = Math.max(0, b23 + P.prior_years.return_2024.K1_1120S.box1 - P.prior_years.return_2024.K1_1120S.box16D);
      rc({ id: "rc-7203", area: "pass_throughs_and_basis", label: "Woodworks stock basis 1/1/2025: 2022 basis + 2023 K-1 + 2024 K-1 (income \u2212 distributions)", engine: val("F7203.1"), independent: b24, refs: ["F7203.1", "D40", "py:/basis_records/scorp_lindqvist_family_woodworks"], note: k23 ? `21,300 + 14,100 \u2212 20,000 = ${b23.toLocaleString()} (2023); + 16,900 \u2212 30,000 = ${b24.toLocaleString()} (2024)` : "" });
    }
    if (L2("SchSE.12")) {
      const ne = num(val("SchC.31")) * 0.9235;
      rc({ id: "rc-se", area: "business", label: "SE tax = Schedule C profit \xD7 92.35% \xD7 15.3% (Erik has no wages)", engine: val("SchSE.12"), independent: r0(ne * 0.153), refs: ["SchSE.12"], tol: 2 });
    }
    if (L2("F8812.11")) rc({ id: "rc-ctc", area: "deductions_and_credits", label: "CTC phase-out: 50 per 1,000 (or part) of MAGI over 400,000", engine: val("F8812.11"), independent: Math.min(2700, Math.ceil((num(val("F1040.11")) - 4e5) / 1e3) * 50), refs: ["F8812.11"] });
    rc({ id: "rc-salt", area: "deductions_and_credits", label: "SALT cap at this AGI (40,000; phase-down starts 500,000)", engine: val("SchA.5e"), independent: Math.min(num(val("SchA.5d")), 4e4), refs: ["SchA.5e"] });
    const ye = num(evField(M, "D36", "balance_ye_sek")?.value), mx = num(evField(M, "D36", "max_balance_sek")?.value), fxYE = P.fx_rates.SEK_per_USD["2025_year_end"];
    rc({ id: "rc-8938", area: "investments_and_digital_assets", label: "Form 8938 max value: SEK 1,452,300 \xF7 year-end rate 9.71", engine: val("F8938.1.max"), independent: r0(mx / fxYE), refs: ["F8938.1.max", "D36"] });
    const bp = docText(M, "D74");
    const bpST = num(bp.match(/short-term covered proceeds ([\d,.]+)/)?.[1]), bpLT = num(bp.match(/long-term covered proceeds ([\d,.]+)/)?.[1]);
    const bpLots = M.lots(V).filter((x) => x.broker === "Brightpath");
    rc({ id: "rc-bp-st", area: "investments_and_digital_assets", label: `Brightpath 1099-B: short-term proceeds, summary vs ${bpLots.filter((x) => x.term === "short").length} lots`, engine: bpST, independent: Math.round(bpLots.filter((x) => x.term === "short").reduce((s, x) => s + x.proceeds, 0) * 100) / 100, refs: ["D74"], tol: 0.01 });
    rc({ id: "rc-bp-lt", area: "investments_and_digital_assets", label: `Brightpath 1099-B: long-term proceeds, summary vs ${bpLots.filter((x) => x.term === "long").length} lots`, engine: bpLT, independent: Math.round(bpLots.filter((x) => x.term === "long").reduce((s, x) => s + x.proceeds, 0) * 100) / 100, refs: ["D74"], tol: 0.01 });
    let sums = 0, sumsOk = 0;
    const sumBad = [];
    for (const l of V.lines) {
      if (l.rule !== "R-SUM" || !l.inputs?.length || typeof l.value !== "number") continue;
      const xs = l.inputs.map((k) => V.lineMap.get(k)?.value).filter((x) => typeof x === "number");
      if (xs.length !== l.inputs.length) continue;
      sums++;
      const ca = l.key.match(/^SchCA540NR\.(\w+)\.D$/);
      if (ca) {
        const g = (c) => num(V.lineMap.get(`SchCA540NR.${ca[1]}.${c}`)?.value);
        if (Math.abs(g("A") - g("B") + g("C") - l.value) <= 1.5) {
          sumsOk++;
          continue;
        }
      }
      const s = xs.reduce((a, b) => a + b, 0), d = xs[0] - xs.slice(1).reduce((a, b) => a + b, 0);
      const absd = xs[0] - xs.slice(1).reduce((a, b) => a + Math.abs(b), 0);
      if ([s, d, absd, -s].some((x) => Math.abs(x - l.value) <= 1.5) || Math.abs(Math.abs(d) - Math.abs(l.value)) <= 1.5) sumsOk++;
      else sumBad.push(l.key);
    }
    rc({ id: "rc-arith", area: "tax_and_payments", label: `Arithmetic: every total recomputed from its inputs (${sums} totals)`, engine: sums, independent: sumsOk, agree: sumBad.length === 0, refs: sumBad, note: sumBad.length ? `Could not reproduce: ${sumBad.join(", ")} (sign conventions or non-additive totals; review)` : "All totals reproduce from their inputs." });
    {
      const comp = evField(M, "D28", "int_1"), stand = evField(M, "D29", "box1");
      const t29 = docText(M, "D29");
      if (comp && stand && num(comp.value) === num(stand.value) && /sweep program for Northlake Securities account ending (\d+)/.test(t29) && L2("SchB.1.2") && num(val("SchB.1.2")) > 0) {
        add({
          id: "F-INT-DUP",
          area: "investments_and_digital_assets",
          kind: "engine_error",
          title: "Same bank-sweep interest counted twice",
          amount: num(stand.value),
          summary: "The Northlake composite 1099 (D28 p1) already reports the bank-sweep interest of 1,840. D29 is the sweep bank's own 1099-INT for the same account ending 7731. The engine put both on Schedule B.",
          evidence: ["ev-0492", "ev-0538", "SchB.1.1", "SchB.1.2", "py:/return_2024/lines/SchB.1.1"],
          how: "Matched account numbers across documents. The 2024 return reported the sweep only once.",
          proposal: { lines: [{ key: "SchB.1.2", from: val("SchB.1.2"), to: 0 }], effects: [effectOf(V, "interest", -num(stand.value))], verification: "agreed_to_source_document" }
        });
      }
    }
    {
      const l = L2("SchB.1.6");
      if (l && (l.sources || []).some((s) => s.includes("2024_average"))) {
        const sek = num(evField(M, "D36", "interest_sek")?.value), rate = P.fx_rates.SEK_per_USD["2025_average"];
        const right = r0(sek / rate);
        add({
          id: "F-FX-RATE",
          area: "investments_and_digital_assets",
          kind: "engine_error",
          title: "Swedish interest converted at the 2024 exchange rate",
          amount: right - l.value,
          summary: `SEK ${sek.toLocaleString()} was converted at 10.56 (the 2024 average) instead of 9.86 (the 2025 average): ${l.value.toLocaleString()} should be ${right.toLocaleString()}.`,
          evidence: ["ev-0960", "SchB.1.6", "ref:fx.SEK.2025_average", "ref:fx.SEK.2024_average"],
          how: "Compared the rate key cited in the line's sources against the tax year.",
          proposal: { lines: [{ key: "SchB.1.6", from: l.value, to: right }], effects: [effectOf(V, "interest", right - l.value)], verification: "recalculated" }
        });
      }
    }
    {
      const supp = docText(M, "D11");
      const adj = [];
      for (const r of M.lots(V).filter((x) => x.broker === "Northlake" && !x.covered && x.basis === 0)) {
        const acq = r.acquired;
        const m = [...supp.matchAll(/Lot (RSU-\d+): (\d+) sh acquired (\d\d)\/(\d\d)\/(\d{4}).*?adjusted basis ([\d,.]+)/g)].find((mm) => `${mm[5]}-${mm[3]}-${mm[4]}` === acq);
        if (m) adj.push({ r, basis: num(m[6]), suppLot: m[1] });
      }
      if (adj.length) {
        const st = adj.filter((a) => a.r.term === "short"), lt = adj.filter((a) => a.r.term === "long");
        const dst = -st.reduce((s, a) => s + a.basis, 0), dlt = -lt.reduce((s, a) => s + a.basis, 0);
        add({
          id: "F-RSU-BASIS",
          area: "investments_and_digital_assets",
          kind: "engine_error",
          title: "RSU sales taxed with zero basis",
          amount: dst + dlt,
          summary: `Three Corvane RSU lots are noncovered, so Northlake left the basis blank. The engine used 0, which taxes the full proceeds even though the vest value was already in W-2 wages (box 14 RSU 38,200). The supplemental statement (D11 p2) gives adjusted basis of ${adj.map((a) => `${a.suppLot} ${a.basis.toLocaleString()}`).join(", ")}.`,
          evidence: ["D11", "ev-0066", "ev-0068", "ev-0070", "ev-0498", "ev-0516", "ev-0525", "ev-0027", ...adj.map((a) => a.r.key)],
          how: "Matched each noncovered lot to a supplemental-statement lot by acquisition date (rule R-8949-LOT only applies a supplement when the engine matches it \u2014 it did for ESPP, not RSU).",
          proposal: {
            lines: adj.map((a) => ({ key: a.r.key, from: a.r.gain, to: Math.round((a.r.proceeds - a.basis) * 100) / 100, note: `basis ${a.basis.toLocaleString()} (code B)` })),
            effects: [{ ...effectOf(V, "stcg", dst, "ca_source_income"), label: "Short-term (sold Feb/May, during CA residency \u2192 CA-source)" }, { ...effectOf(V, "ltcg", dlt), label: "Long-term (sold Aug, after the move)" }],
            verification: "agreed_to_source_document"
          }
        });
      }
    }
    {
      const d = M.docs.get("D31");
      const t = pageText(M, "D31", 32);
      const m = t.match(/(M\d+) (.+?) ([\d.]+) sh acquired (\S+) sold (\S+) proceeds ([\d,.]+) basis ([\d,.]+) (short|long)-term (noncovered|covered)/);
      const summary = num(docText(M, "D31").match(/total proceeds ([\d,.]+)/)?.[1]);
      const lotSum = M.lots(V).filter((x) => x.broker === "Meridian").reduce((s, x) => s + x.proceeds, 0);
      if (d && m && !V.lineMap.has(`F8949.B.${m[1]}`)) {
        const g = num(m[6]) - num(m[7]);
        add({
          id: "F-MERIDIAN-P32",
          area: "investments_and_digital_assets",
          kind: "extraction_error",
          title: "Meridian 1099-B page 32 was never read (one sale missing)",
          amount: g,
          summary: `Summary proceeds ${summary.toLocaleString(void 0, { minimumFractionDigits: 2 })} vs lots ${lotSum.toLocaleString(void 0, { minimumFractionDigits: 2 })}: the ${(summary - lotSum).toFixed(2)} gap is lot ${m[1]} (${m[2]}) on the unread supplemental page. It goes on Form 8949 box B (noncovered).`,
          evidence: ["doc:D31#page32", "ev-0703"],
          how: "Explained the engine's BROKER_SUMMARY_DETAIL_MISMATCH diagnostic by reading the page the pipeline marked as not extracted.",
          proposal: { lines: [{ key: `F8949.B.${m[1]}`, from: null, to: g, note: `${m[2]} acquired ${m[4]} sold ${m[5]} proceeds ${m[6]} basis ${m[7]}` }], effects: [effectOf(V, "stcg", g)], verification: "agreed_to_source_document" }
        });
      }
    }
    if (L2("F8949.H.C6") && P.client.messages.some((m) => m.id === "msg-07")) {
      const l = L2("F8949.H.C6");
      const proceeds = 5325, basis = 3050;
      add({
        id: "F-CRYPTO-C6",
        area: "investments_and_digital_assets",
        kind: "judgment",
        severity: "warning",
        title: "Crypto lot C6: zero basis and the wrong holding period",
        amount: -basis,
        summary: "The engine used the transfer-in date (2025-06-01) and 0 basis. Erik says the BTC was bought on CryptoNorth on 03/15/2021 for 3,050 (msg-07), which makes it a long-term sale with a 2,275 gain. The only support is a bank statement line, so get the statement before relying on it.",
        evidence: ["ev-0879", "ev-0918", "ev-0919", "msg-07", "F8949.H.C6"],
        how: "Engine diagnostic DIGITAL_ASSET_BASIS_MISSING + client message.",
        authority: "Treas. Reg. \xA71.1012-1(j) (specific identification of digital assets); taxpayer bears substantiation burden \u2014 bank record of purchase.",
        proposal: {
          lines: [{ key: "F8949.H.C6", from: l.value, to: 0, note: "moved to box K" }, { key: "F8949.K.C6", from: null, to: proceeds - basis, note: "acquired 2021-03-15, basis 3,050" }],
          effects: [{ ...effectOf(V, "stcg", -proceeds, "ca_source_income"), label: "Remove short-term gain (sold 6/18, CA residency)" }, { ...effectOf(V, "ltcg", proceeds - basis, "ca_source_income"), label: "Add long-term gain" }],
          verification: "confirmed_with_client",
          needs: "Obtain the 2021 bank statement showing the 3,050 payment to CryptoNorth."
        }
      });
    }
    {
      const t15 = docText(M, "D15");
      const k = num(evField(M, "D21", "box1a")?.value), books = num(evField(M, "D14", "total_income")?.value);
      const m = t15.match(/of which ([\d,.]+) arrived through Paywell/);
      if (L2("SchC.1") && num(val("SchC.1")) === books + k && m && num(m[1]) === k) {
        add({
          id: "F-1099K-DUP",
          area: "business",
          kind: "engine_error",
          title: "1099-K receipts counted twice in gross receipts",
          amount: -k,
          summary: `Gross receipts are books revenue (${books.toLocaleString()}) plus the Paywell 1099-K (${k.toLocaleString()}). But the deposits detail (D15 p3) shows the 12,400 is Atlas Outdoor Gear's card payments, which are already deposited in the books and already inside Atlas's 1099-NEC (41,200). The books tie exactly to the 1099-NECs (142,000) plus 9,300 from non-1099 clients.`,
          evidence: ["ev-0103", "ev-0127", "ev-0109", "ev-0110", "ev-0111", "ev-0116", "SchC.1"],
          how: "Reconciled the books to the third-party information returns, which is the same reconciliation the 2028 IRS Letter 566 asks for.",
          proposal: { lines: [{ key: "SchC.1", from: val("SchC.1"), to: books }], effects: [effectOf(V, "schc_profit", -k)], verification: "agreed_to_source_document" }
        });
      }
    }
    {
      const d = M.docs.get("D23");
      const body = (p) => p.printed_content.replace(/^\(.*?\)\s*/, "");
      const seen = /* @__PURE__ */ new Map();
      let dup = null;
      for (const p of d.pages) {
        const b = body(p);
        if (seen.has(b)) dup = { page: p.page, of: seen.get(b) };
        else seen.set(b, p.page);
      }
      if (dup && L2("SchC.44a")) {
        const dupTotal = num(evField(M, "D23", "page_total") && evsOf(M, "D23").find((e) => e.page === dup.page && e.field === "page_total")?.value);
        const miles = num(val("SchC.44a")) - dupTotal;
        const odo = num(evField(M, "D23", "odometer_end")?.value) - num(evField(M, "D23", "odometer_start")?.value);
        const newCar = r0(miles * P.engine_reference.parameters.mileage_rate);
        add({
          id: "F-MILEAGE-DUP",
          area: "business",
          kind: "engine_error",
          title: "Mileage log page counted twice",
          amount: newCar - val("SchC.9"),
          summary: `Page ${dup.page} of the mileage log is a second scan of page ${dup.of} (same trips, same handwriting). The engine summed every page total: ${num(val("SchC.44a")).toLocaleString()} miles. The real figure is ${miles.toLocaleString()} business miles out of ${odo.toLocaleString()} total.`,
          evidence: ["doc:D23#page2", "doc:D23#page3", "ev-0315", "ev-0404", "SchC.44a", "SchC.9"],
          how: "Compared page contents and summed the individual trips per page.",
          proposal: { lines: [{ key: "SchC.44a", from: val("SchC.44a"), to: miles }, { key: "SchC.44c", from: val("SchC.44c"), to: odo - miles }, { key: "SchC.9", from: val("SchC.9"), to: newCar }], effects: [effectOf(V, "schc_profit", val("SchC.9") - newCar)], verification: "recalculated" }
        });
      }
    }
    {
      const q = M.qa.get("qa-25");
      if (L2("Sch1.17") && num(val("Sch1.17")) > 0 && /^Yes/i.test(q?.answer || "")) {
        const amt = num(val("Sch1.17"));
        const e1 = effectOf(V, "adjustment", -amt);
        const qbiBump = r0(amt * 0.2);
        const e2 = effectOf(V, "ordinary_income", -qbiBump);
        add({
          id: "F-SEHI",
          area: "business",
          kind: "engine_error",
          title: "Self-employed health insurance deduction not allowed",
          amount: -amt,
          summary: `Erik could have joined Ngozi's employer family coverage (qa-25: "both of Ngozi's employers offer family coverage"). A month when you are eligible for an employer-subsidized plan through a spouse is not eligible for this deduction. The 2024 return made the same call (prior-year note on Sch1.17).`,
          evidence: ["qa-25", "ev-0484", "Sch1.17", "py:/return_2024/notes/Sch1.17"],
          how: "Compared the questionnaire answer and prior-year treatment with the engine's rule R-SEHI, which does not test eligibility.",
          authority: "IRC \xA7162(l)(2)(B); Pub. 535 / Form 7206 instructions: not allowed for any month eligible for an employer-subsidized plan of the taxpayer or spouse.",
          proposal: { lines: [{ key: "Sch1.17", from: amt, to: 0 }], effects: [{ ...e1, label: "Remove adjustment" }, { tax_fed: e2.tax_fed, tax_ca: 0, label: "QBI deduction rises (qualified business income no longer reduced by SEHI)", basis: `+${qbiBump} QBI deduction \xD7 0.31` }], verification: "confirmed_with_client" }
        });
      }
    }
    {
      const inv = docText(M, "D47");
      const wi = P.what_if.alternatives.find((a) => a.id === "hvac_improvement");
      if (/Installed new .*system/i.test(inv) && L2("SchE.14A") && num(val("SchE.14A")) >= 11e3) {
        add({
          id: "F-HVAC",
          area: "rentals_and_sale",
          kind: "engine_error",
          title: "HVAC system replacement expensed as a repair",
          amount: 11e3,
          summary: "Invoice D47 shows the whole system was replaced: the failed furnace and condenser came out and a new heat pump, air handler, line set and thermostat went in, with a permit and a 10-year warranty. That is a restoration of the building's HVAC system, so it is an improvement depreciated over 27.5 years, not a repair. The engine has an exact what-if for this.",
          evidence: ["D47", "ev-1001", "qa-37", "call-01", "SchE.14A"],
          how: "Read the invoice and call notes against the capitalization rules; used the engine what-if for the exact effect.",
          authority: "Treas. Reg. \xA71.263(a)-3(k) (restoration) and (e)(2)(ii)(B) (HVAC is a separate building system); not within the $2,500 de minimis safe harbor.",
          proposal: {
            lines: (wi?.changed_lines || []).filter((c) => ["SchE.14A", "SchE.18A", "F4562-E.total-A", "SchE.21A", "SchE.22A"].includes(c.key)).map((c) => ({ key: c.key, from: c.old, to: c.new })),
            effects: [{ tax_fed: wi.federal.total_tax_change, tax_ca: wi.california.total_tax_change, label: "Engine what-if hvac_improvement (exact)", basis: "what_if.alternatives[hvac_improvement]" }],
            whatIf: "hvac_improvement",
            verification: "agreed_to_source_document",
            asset: { asset_id: "SAC-HVAC", description: "1450 Fremont Way - heat pump system", cost: 11e3, placed_in_service: "2025-08-12", method: "SL / mid-month", life_years: 27.5, federal_2025: 150, california_2025: 150 }
          }
        });
      }
    }
    {
      const payoff = docText(M, "D56");
      if (/Interest is reported on the 2025 Form 1098/.test(payoff) && (L2("SchA.8a")?.sources || []).includes("ev-1032")) {
        const amt = num(evField(M, "D56", "interest")?.value);
        add({
          id: "F-MORTGAGE-DUP",
          area: "deductions_and_credits",
          kind: "engine_error",
          title: "Payoff interest counted twice in mortgage interest",
          amount: -amt,
          summary: "The Lonestar 1098 (D55) says box 1 already includes the interest paid at payoff on 11/20/2025, and the payoff statement (D56) says the same. The engine added the 2,150 from the payoff statement on top of the 1098.",
          evidence: ["ev-1029", "ev-1032", "D55", "D56", "SchA.8a"],
          how: "Read the lender statements' own notes on what box 1 includes.",
          proposal: { lines: [{ key: "SchA.8a", from: val("SchA.8a"), to: val("SchA.8a") - amt }], effects: [effectOf(V, "itemized", -amt)], verification: "agreed_to_source_document" }
        });
      }
    }
    {
      const credit = num(evField(M, "D54", "tax_credit")?.value);
      const paid = num(evField(M, "D58", "paid")?.value);
      if (credit && L2("SchA.5b") && num(val("SchA.5b")) === paid) {
        const newRE = paid - credit;
        const newTotal = num(val("SchA.5a")) + newRE;
        const newCapped = Math.min(newTotal, 4e4);
        const lost = num(val("SchA.5e")) - newCapped;
        add({
          id: "F-RE-TAX",
          area: "deductions_and_credits",
          kind: "engine_error",
          title: "Home property tax includes the seller's share",
          amount: -credit,
          summary: `The escrow paid the full 2025 Travis County bill (13,420), but at closing the seller credited the buyers ${credit.toLocaleString()} for 01/01\u201307/07 (D54). Only ${newRE.toLocaleString()} is the buyers' tax. With that fixed, total SALT is ${newTotal.toLocaleString()}, which is under the 40,000 cap, so the deduction drops by ${lost.toLocaleString()}.`,
          evidence: ["ev-1027", "ev-1036", "ev-1038", "SchA.5b", "SchA.5e"],
          how: "Tied the property tax deduction to the buyer closing statement proration.",
          authority: "IRC \xA7164(d) \u2014 real property tax apportioned between seller and buyer by days owned.",
          proposal: {
            lines: [{ key: "SchA.5b", from: paid, to: newRE }, { key: "SchA.5d", from: val("SchA.5d"), to: newTotal }, { key: "SchA.5e", from: val("SchA.5e"), to: newCapped }],
            effects: [{ tax_fed: r0(lost * 0.26), tax_ca: r0(credit * 0.048), label: "Itemized deduction falls (now below the SALT cap)", basis: `fed: \u2212${lost} \xD7 itemized \u22120.26 (salt rate is 0 only while capped); CA: \u2212${credit} \xD7 \u22120.048` }],
            verification: "agreed_to_source_document"
          }
        });
      }
    }
    {
      const gp = num(evField(M, "D66", "box4c")?.value);
      const l = L2("F8283.A1.vehicle");
      if (l && gp && l.value > gp && /4a vehicle sold/.test(docText(M, "D66"))) {
        add({
          id: "F-CAR-DONATION",
          area: "deductions_and_credits",
          kind: "engine_error",
          title: "Car donation deducted at Blue Book value instead of the sale price",
          amount: gp - l.value,
          summary: `The charity sold the Subaru at arm's length for ${gp.toLocaleString()} (1098-C box 4c). When a donated vehicle is sold without significant use or improvement by the charity, the deduction is limited to the gross proceeds. The engine used the client's Kelley Blue Book estimate of 6,000. This is the exact item IRS Letter 566 examines in 2028.`,
          evidence: ["ev-1054", "qa-39", "call-01", "F8283.A1.vehicle"],
          how: "Compared the claimed value with the 1098-C boxes.",
          authority: "IRC \xA7170(f)(12)(A)(ii); Form 1098-C instructions; Pub. 4303.",
          proposal: { lines: [{ key: "F8283.A1.vehicle", from: l.value, to: gp }, { key: "SchA.12", from: val("SchA.12"), to: val("SchA.12") - (l.value - gp) }], effects: [effectOf(V, "itemized", gp - l.value)], verification: "agreed_to_source_document" }
        });
      }
    }
    {
      const tx = P.tax_agency_records.irs_account_transcript_2025[0].transactions.filter((t) => t.code === "670" && t.date < "2026-04-01");
      const paid = tx.reduce((s, t) => s + num(t.amount), 0);
      if (L2("F1040.26") && num(val("F1040.26")) !== paid) {
        add({
          id: "F-FED-ESTIMATES",
          area: "tax_and_payments",
          kind: "client_conflict",
          title: "Q4 federal estimate was 3,000, not the 4,000 the client remembered",
          amount: paid - val("F1040.26"),
          summary: `No EFTPS confirmation was uploaded for Q4, so the engine used the questionnaire ("4,000 I think", qa-41). The IRS transcript pulled 03/12/2026 shows 3,000 on 01/15/2026. Total 2025 estimates are ${paid.toLocaleString()}.`,
          evidence: ["qa-41", "D67", "agency:/irs_account_transcript_2025/0/transactions/3", "F1040.26"],
          how: "Agreed estimated payments to the IRS transcript (required step).",
          proposal: { lines: [{ key: "F1040.26", from: val("F1040.26"), to: paid }], effects: [{ pay_fed: paid - val("F1040.26"), tax_fed: 0, tax_ca: 0, label: "Payments fall; the balance due rises 1:1. The Form 2210 penalty rises slightly (Q4 was underpaid by a further 1,000).", basis: "1:1 payment" }], verification: "agreed_to_third_party_record" }
        });
      }
    }
    {
      const ftb = P.tax_agency_records.ftb_account;
      const paid = ftb.tax_year_2025_payments.reduce((s, t) => s + t.amount, 0);
      if (L2("F540NR.72") && num(val("F540NR.72")) !== paid) {
        add({
          id: "F-CA-ESTIMATES",
          area: "california",
          kind: "engine_error",
          title: "California estimates include a payment applied to 2024",
          amount: paid - val("F540NR.72"),
          summary: `The 09/15/2025 Web Pay payment of 3,500 was designated tax year 2024 (D68, ev-1076), and the FTB is holding it as a 2024 credit. Rule R-CA-ESTIMATED-PAYMENTS counts every payment by date. The FTB account shows ${paid.toLocaleString()} for 2025. Ask the FTB to transfer the 2024 credit, or have the client expect it as a separate 2024 refund.`,
          evidence: ["ev-1074", "ev-1075", "ev-1076", "agency:/ftb_account/tax_year_2024_payments_after_filing/0", "F540NR.72"],
          how: "Agreed California payments to the FTB account record.",
          proposal: { lines: [{ key: "F540NR.72", from: val("F540NR.72"), to: paid }], effects: [{ pay_ca: paid - val("F540NR.72"), tax_fed: 0, tax_ca: 0, label: "California refund falls 1:1", basis: "1:1 payment" }], verification: "agreed_to_third_party_record" }
        });
      }
    }
    {
      const ytd = num(evField(M, "D73", "ytd_ca_wages")?.value);
      const corv = num(evField(M, "D08", "box16")?.value), halv = num(evField(M, "D09", "box16")?.value);
      const l = L2("SchCA540NR.1.E");
      if (ytd && l && num(l.value) === corv + halv) {
        const right = corv + ytd;
        add({
          id: "F-CA-WAGES",
          area: "california",
          kind: "engine_error",
          title: "Texas wages taxed as California-source",
          amount: right - l.value,
          summary: `Halvorsen kept California as the work state through 09/30 by mistake (D09 note; qa-45). The engine took W-2 box 16 (111,300) as California-source. Ngozi worked from Sacramento only until 07/14. The 07/18 paystub (D73) shows YTD California wages of ${ytd.toLocaleString()} through 07/15, so California-source wages are ${corv.toLocaleString()} + ${ytd.toLocaleString()} = ${right.toLocaleString()}. California will refund the excess withholding through the return.`,
          evidence: ["ev-0047", "ev-0030", "ev-1081", "qa-45", "qa-03", "SchCA540NR.1.E"],
          how: "Split wages by work location using the residency dates and the paystub YTD, rather than trusting box 16.",
          authority: "R&TC \xA717951; FTB Pub. 1031 \u2014 nonresident wages sourced where services are performed.",
          proposal: { lines: [{ key: "SchCA540NR.1.E", from: l.value, to: right }], effects: [effectOf(V, "ca_source_income", right - l.value)], verification: "agreed_to_source_document" }
        });
      }
    }
    {
      const theo = M.people.get("theo");
      const pyTheo = P.prior_years.return_2024.dependents.find((d) => d.name.startsWith("Theo"));
      if (theo && pyTheo && theo.ssn !== pyTheo.ssn) {
        add({
          id: "F-THEO-SSN",
          area: "deductions_and_credits",
          kind: "client_conflict",
          title: "Theo's SSN in the organizer does not match the 2024 return",
          amount: 0,
          summary: `The organizer has ${theo.ssn}; the 2024 return as filed (D06 p1) has ${pyTheo.ssn}. The last two digits look transposed. A wrong dependent TIN causes an e-file reject (R0000-504-02) and blocks the child tax credit. Theo's Social Security card (D71, arrived 07/13/2026) confirms ${pyTheo.ssn}.`,
          evidence: ["household:theo", "py:/return_2024/dependents/1", "D71", "ev-1080", "msg-10", "agency:/efile/0"],
          how: "Agreed identity data to the prior-year return.",
          sensitive: true,
          later: ["D71", "ev-1080", "msg-10"],
          proposal: { lines: [{ key: "household.theo.ssn", from: theo.ssn, to: pyTheo.ssn }], effects: [{ tax_fed: 0, tax_ca: 0, label: "No tax effect; blocks e-file", basis: "\u2014" }], verification: "agreed_to_prior_year" }
        });
      }
    }
    {
      const fid = extractionFidelity(M);
      for (const e of fid.filter((x) => ["ein", "ssn", "account_number"].includes(x.value_type))) {
        const printed = (pageText(M, e.document_id, e.page).match(/\b\d{2}-\d{7}\b/) || [])[0];
        const lines = [...V.evToLines.get(e.id) || []];
        add({
          id: `F-TIN-${e.id}`,
          area: "deductions_and_credits",
          kind: "extraction_error",
          title: `Provider tax ID misread (${e.document_id})`,
          amount: 0,
          summary: `The pipeline read ${e.value} (confidence ${e.confidence}), but the statement prints ${printed}, with two digits transposed. Form 2441 needs the correct provider TIN to support the 5,000 dependent-care benefit exclusion. Line 1a also names the provider "Bright Oak Preschool", but the statement and the 2024 return say "Bright Oak Kids Club".`,
          evidence: [e.id, "ev-1043", ...lines, "py:/return_2024/lines/F2441.provider"],
          how: "Extraction fidelity check: each value's text-as-read must appear on the page.",
          proposal: { lines: [...lines.map((k) => ({ key: k, from: V.lineMap.get(k).label, to: V.lineMap.get(k).label.replace(e.value, printed), text: true })), { key: "F2441.1a", from: L2("F2441.1a")?.label, to: "Care provider: Bright Oak Kids Club, tax ID 68-0412257", text: true }], effects: [{ tax_fed: 0, tax_ca: 0, label: "No tax effect (credit is 0 after the exclusion)", basis: "\u2014" }], verification: "agreed_to_source_document" }
        });
      }
    }
    {
      const sp = num(evField(M, "D15", "spotify")?.value);
      if (sp && L2("SchC.27a.1") && num(val("SchC.27a.1")) === num(evField(M, "D14", "Software and subscriptions")?.value)) {
        add({
          id: "F-SPOTIFY",
          area: "business",
          kind: "engine_error",
          severity: "warning",
          title: "Personal Spotify Family subscription in business software",
          amount: -sp,
          summary: "Erik confirmed on the 03/26 call that Spotify Family (216) was booked to the business by mistake. The engine mapped the books line as is.",
          evidence: ["ev-0106", "call-01", "SchC.27a.1"],
          how: "Books-to-tax review of the transaction detail against the call notes.",
          proposal: { lines: [{ key: "SchC.27a.1", from: val("SchC.27a.1"), to: val("SchC.27a.1") - sp }], effects: [effectOf(V, "schc_profit", sp)], verification: "confirmed_with_client" }
        });
      }
      const ph = num(evField(M, "D14", "Telephone")?.value), net = num(evField(M, "D14", "Internet")?.value);
      if (ph && net && L2("SchC.25") && num(val("SchC.25")) === ph + net) {
        const allowed = r0(ph * 0.7 + net * 0.5);
        add({
          id: "F-PHONE-NET",
          area: "business",
          kind: "judgment",
          severity: "warning",
          title: "Family phone plan and home internet deducted at 100%",
          amount: allowed - (ph + net),
          summary: `The books deduct the whole 4-line family mobile plan (2,160) and the home internet (1,320). On the call Erik estimated business use at 70% for the phone plan and 50% for internet, which allows ${allowed.toLocaleString()}. Seventy percent of a four-line family plan is generous. A reviewer may prefer Erik's own line only (25% \xD7 70%) and should record the call.`,
          evidence: ["ev-0101", "ev-0095", "ev-0107", "ev-0108", "call-01", "SchC.25"],
          how: "Books-to-tax review against the call notes.",
          authority: "IRC \xA7262 (personal expenses); allocation by reasonable business-use percentage, documented.",
          proposal: { lines: [{ key: "SchC.25", from: val("SchC.25"), to: allowed }], effects: [effectOf(V, "schc_profit", ph + net - allowed)], verification: "confirmed_with_client" }
        });
      }
    }
    if (L2("Sch1.16")) {
      const schcFix = ["F-1099K-DUP", "F-MILEAGE-DUP", "F-SPOTIFY", "F-PHONE-NET"].map((id) => findings.find((f) => f.id === id)).filter(Boolean);
      const dProfit = schcFix.reduce((s, f) => s + (f.id === "F-1099K-DUP" ? f.amount : -f.amount), 0);
      const r = sepRecompute(V, dProfit);
      if (r.delta) add({
        id: "F-SEP-LIMIT",
        area: "business",
        kind: "engine_error",
        severity: "warning",
        title: "SEP deduction must be recomputed after the Schedule C fixes",
        amount: r.delta,
        summary: `The SEP limit is 20% of (net profit \u2212 \xBD SE tax). With the Schedule C corrections (${schcFix.map((f) => f.id).join(", ")}), net profit is ${Math.round(r.profit).toLocaleString()} and the limit becomes ${r.limit.toLocaleString()} (was ${val("Sch1.16").toLocaleString()}). The non-deductible excess grows to ${(18e3 - r.limit).toLocaleString()}. The engine's adjustment rate doesn't capture this knock-on effect, so it is recorded separately.`,
        evidence: ["Sch1.16", "SchC.31", "ev-0485", ...schcFix.map((f) => f.id)],
        how: "Recomputed the SEP limit from the adjusted profit (R-SEP-LIMIT formula) instead of trusting the engine figure.",
        dependsOn: schcFix.map((f) => f.id),
        proposal: { lines: [{ key: "Sch1.16", from: val("Sch1.16"), to: r.limit }], effects: [effectOf(V, "adjustment", r.delta)], verification: "recalculated" }
      });
    }
    if (L2("Sch1.16")) {
      const contrib = num(evField(M, "D26", "amount")?.value), ded = num(val("Sch1.16"));
      if (contrib > ded) {
        add({
          id: "F-SEP-EXCESS",
          area: "business",
          kind: "judgment",
          severity: "warning",
          title: `SEP contribution exceeds the limit by ${(contrib - ded).toLocaleString()}`,
          amount: 0,
          summary: `Erik deposited 18,000, but the limit is 20% of (net profit \u2212 \xBD SE tax) = ${ded.toLocaleString()}. The engine correctly deducts only the limit, but nothing addresses the excess. It is subject to a 6% excise tax every year it stays in the account (Form 5329) unless it is withdrawn with its earnings by the extended due date (10/15/2026). The limit also falls further once Schedule C is corrected, so recompute it after those adjustments.`,
          evidence: ["ev-0485", "ev-0486", "Sch1.16", "qa-26"],
          how: "Compared the contribution with the deduction limit and checked the carryover output (sep_contribution_not_deductible_for_2025).",
          authority: "IRC \xA7404(h), \xA74972/\xA74973; Pub. 560.",
          proposal: null
        });
      }
    }
    {
      const open = P.prior_years.prior_preparer_workpaper.open_items_left_by_prior_preparer.find((x) => /3520/.test(x));
      if (open) add({
        id: "F-3520",
        area: "investments_and_digital_assets",
        kind: "outside_filing",
        severity: "warning",
        title: "Possible unfiled Form 3520 for the 2023 foreign inheritance",
        amount: 0,
        summary: 'Erik inherited the Sparbanken account from his mother in 2023 (D36: "inheritance from Birgitta Lindqvist"; qa-07). Its peak value is about 150,000 USD, which is over the 100,000 reporting threshold for bequests from a foreign person. The prior preparer left "3520 discussed? (no note of resolution)". The engagement letter excludes gift and information returns, so advise the client in writing and offer a separate engagement. Penalties can be large.',
        evidence: ["D07", "D36", "qa-07", "qa-08", "D01"],
        how: "Carried forward the prior preparer's open items and checked each against this year's documents.",
        authority: "IRC \xA76039F, \xA76677; Form 3520 Part IV.",
        proposal: null
      });
    }
    add({
      id: "F-1099-NEC",
      area: "business",
      kind: "outside_filing",
      severity: "warning",
      title: "1099-NECs for two contractors were never filed",
      amount: 0,
      summary: 'Mara Quintero (4,800) and Dev Patel (2,600) were paid by ACH and no 1099-NECs were issued (D27, qa-23). They were due 02/02/2026. Schedule C line J must be answered "No" truthfully. Advise late filing to cut the \xA76721/6722 penalties, which is outside the engagement.',
      evidence: ["ev-0487", "ev-0488", "qa-23", "SchC.J", "D01"],
      how: "Engine diagnostic FORM_1099_FILING + engagement scope.",
      proposal: null
    });
    add({
      id: "F-FBAR",
      area: "investments_and_digital_assets",
      kind: "outside_filing",
      severity: "info",
      title: "FBAR (FinCEN 114) due 10/15/2026 \u2014 client files",
      amount: 0,
      summary: `The foreign account peaked at about 149,567 USD, so an FBAR is required. The prior preparer noted "FBAR filed by client separately". It is outside the engagement (D01), but get the client's confirmation into the file. Form 8938 is included in the return.`,
      evidence: ["F8938.1.max", "D07", "D01"],
      how: "Engine diagnostic FBAR_OUTSIDE_RETURN.",
      proposal: null
    });
    add({
      id: "F-OREGON",
      area: "pass_throughs_and_basis",
      kind: "outside_filing",
      severity: "info",
      title: "Oregon and Arizona composite returns cover the K-1s",
      amount: 0,
      summary: "Woodworks filed an Oregon composite return (1,580 paid on Erik's behalf, included in distributions), and Ridgeline filed an Arizona composite. No nonresident returns are needed from the client. California Schedule S credits the Oregon tax for the resident period.",
      evidence: ["ev-0982", "D38", "ScheduleS.credit"],
      how: "Reviewed the K-1 state statements.",
      proposal: null
    });
    add({
      id: "F-ADA-RETURN",
      area: "deductions_and_credits",
      kind: "outside_filing",
      severity: "info",
      title: `Ada's own return claims "can be claimed as a dependent"`,
      amount: 0,
      summary: 'Ada files her own 2025 return with consumer software and checked "someone can claim you" (household.related_returns). That is consistent with claiming her here for the credit for other dependents. AOTC is phased out at this income, and Ada cannot claim it either.',
      evidence: ["household:ada", "F8812.6", "F8863.7", "D59", "D60"],
      how: "Related-return check.",
      proposal: null
    });
    add({
      id: "F-QA-CONFLICTS",
      area: "intake_and_engagement",
      kind: "client_conflict",
      severity: "info",
      title: "Three questionnaire answers are contradicted by documents",
      amount: 0,
      summary: `qa-14 "No" investment sales, but there are 282 brokerage sales. qa-15 "didn't really sell" crypto, but the 1099-DA shows 12 dispositions. qa-31 says there is no prior IRA basis, but the 2024 Form 8606 (line 14: 7,000) and the 2024 Form 5498 (D42) show basis. In each case the documents govern, and the engine followed the documents. Send the client one note correcting the record.`,
      evidence: ["qa-14", "qa-15", "qa-31", "D42", "F8606.2", "D34"],
      how: "Questionnaire answers tested against documents.",
      proposal: null
    });
    add({
      id: "F-CA-AMT-ISO",
      area: "california",
      kind: "judgment",
      severity: "warning",
      title: "California AMT on the ISO exercise has not been computed",
      amount: 0,
      summary: "Ngozi exercised 1,000 ISOs on 07/30/2025, after the move, with a 40,000 spread. California sources ISO income by the share of workdays in California between grant (03/2022) and exercise. Nearly all of the service period was in California, so a California-source AMT adjustment (Schedule P 540NR) is likely. The engine does not compute it. The preparer needs to compute it outside the engine and the partner needs to decide.",
      evidence: ["D12", "ev-0076", "F6251.2i", "F540NR.61"],
      how: "Engine diagnostic CA_AMT_NOT_COMPUTED + residency dates.",
      authority: "FTB Pub. 1004; R&TC \xA717952; Schedule P (540NR) instructions.",
      proposal: null
    });
    add({
      id: "F-WASH-M12",
      area: "investments_and_digital_assets",
      kind: "judgment",
      severity: "info",
      title: "Possible unreported wash sale at Meridian (no 2025 effect)",
      amount: 0,
      summary: "M12 Meadowlark Biotech was sold at a 1,640 loss on 08/14, and 100 shares were bought back on 08/20 (M16). Meridian reported no wash sale. 820 of the loss would shift into M16's basis. M16 was also sold in 2025, so the net 2025 gain is the same; only lot-level presentation changes. Document it and don't adjust.",
      evidence: ["F8949.A.M12", "F8949.A.M16"],
      how: "Scanned the lot detail for repurchases within 30 days of a loss sale.",
      proposal: null
    });
    add({
      id: "F-HOME-OFFICE-PY",
      area: "business",
      kind: "judgment",
      severity: "info",
      title: "The 2024 home office used 300 sq ft; the client measured 220",
      amount: 0,
      summary: `The prior preparer used 300 sq ft ("2 rooms combined?"). Erik's measurements (D24) show the Sacramento studio is 220 sq ft, so 2024 was overstated by 80 sq ft \xD7 $5 = $400 of deduction. That is immaterial, so don't amend. The 2025 average of 240 is computed correctly by month.`,
      evidence: ["D24", "SchC.30", "py:/return_2024/lines/SchC.30", "D07"],
      how: "Prior preparer open item resolved against the client's measurements.",
      proposal: null
    });
    const s179 = P.what_if.alternatives.find((a) => a.id === "equipment_section179");
    if (s179) add({
      id: "F-ELECT-179",
      area: "business",
      kind: "judgment",
      severity: "info",
      title: "Elect \xA7179 for the studio equipment: saves 1,050 in California at no federal cost",
      amount: 0,
      summary: "Federally, \xA7179 and 100% bonus give the same 38,000 deduction. California does not allow bonus depreciation but does allow \xA7179 up to 25,000, so electing \xA7179 cuts California tax by 1,050 (engine what-if). This is an election for the partner to approve.",
      evidence: ["D22", "F4562-C.14", "SchCA540NR.12.C"],
      how: "Engine what-if equipment_section179.",
      authority: "IRC \xA7179; R&TC \xA717255.",
      proposal: { lines: s179.changed_lines.slice(0, 3).map((c) => ({ key: c.key, from: c.old, to: c.new })), effects: [{ tax_fed: s179.federal.total_tax_change, tax_ca: s179.california.total_tax_change, label: "Engine what-if equipment_section179 (exact)", basis: "what_if" }], whatIf: "equipment_section179", election: true }
    });
    {
      const e = M.evs.get("ev-1049");
      if (e) add({
        id: "F-ST-BRIGID",
        area: "deductions_and_credits",
        kind: "judgment",
        severity: "info",
        title: "St. Brigid gift: the handwritten receipt is ambiguous (1,500 or 7,500)",
        amount: 0,
        summary: "The receipt's first digit could be a 1 or a 7 (pipeline confidence 0.41). The client confirmed 1,500 with the parish by phone and matched it to bank check #2207 (msg-08). The receipt is a contemporaneous written acknowledgment with no goods or services line. Keep 1,500 and attach the bank record.",
        evidence: ["ev-1049", "doc:D64#page1", "msg-08", "SchA.11"],
        how: "Low-confidence read routed to the client.",
        authority: "IRC \xA7170(f)(8) \u2014 written acknowledgment for gifts of 250 or more.",
        proposal: null
      });
    }
    return { findings, recompute, fidelity: extractionFidelity(M) };
  }
  function sepRecompute(V, schcProfitDelta) {
    const profit = V.lineMap.get("SchC.31").value + schcProfitDelta;
    const se = profit * 0.9235 * 0.153;
    const limit = Math.round(0.2 * (profit - se / 2));
    const cur = V.lineMap.get("Sch1.16").value;
    return { profit, limit, delta: limit - cur, contribution: 18e3 };
  }

  // src/journal.js
  var ROLE_CAN = {
    preparer: ["adjust", "adjust_revert", "verify", "finding_status", "review_reply", "question", "answer", "signoff:preparer", "decision", "attach", "note", "time", "unmask", "seen", "undo", "filing:extension", "household"],
    reviewer: ["adjust", "adjust_revert", "verify", "finding_status", "review_note", "review_reply", "review_resolve", "question", "answer", "signoff:reviewer", "decision", "attach", "note", "time", "unmask", "seen", "undo", "filing:extension", "filing:efile_submit", "filing:efile_result", "household"],
    partner: ["adjust", "adjust_revert", "adjust_approve", "verify", "finding_status", "review_note", "review_reply", "review_resolve", "question", "answer", "signoff:partner", "decision", "attach", "note", "time", "unmask", "seen", "undo", "filing:extension", "filing:efile_submit", "filing:efile_result", "filing:freeze", "filing:amend_open", "filing:notice_response", "filing:rollforward", "household"],
    firm_administrator: ["standard", "assign", "note", "time", "unmask", "seen", "undo", "filing:client_copy"],
    quality_reviewer: ["review_note", "review_reply", "review_resolve", "note", "unmask", "seen", "decision"],
    client: ["answer", "attach", "seen", "filing:client_approval", "note"]
  };
  var ROLE_LABEL = { preparer: "Preparer", reviewer: "Reviewer", partner: "Partner", firm_administrator: "Firm administrator", quality_reviewer: "Quality reviewer", client: "Client" };
  function actorsFrom(P) {
    const staff = P.firm.staff.map((s) => ({ id: s.id, name: s.name, role: s.role, credential: s.credential, clearance: s.sensitive_data_clearance, active_from: s.active_from, note: s.note }));
    const clients = P.firm.client_users.map((c) => ({ id: c.id, name: c.name, role: "client", clearance: true, active_from: "2026-01-01" }));
    return [...staff, ...clients];
  }
  var seq = 0;
  function newEvent(actor, type, target, data, clockISO, extra = {}) {
    seq++;
    return { id: `e-${Date.now().toString(36)}-${(Math.random() * 1e6 | 0).toString(36)}-${seq}`, at: clockISO, real_at: (/* @__PURE__ */ new Date()).toISOString(), actor: actor.id, role: actor.role, type, target: target ?? null, data: data ?? {}, ...extra };
  }
  var LS_KEY = "okafor-workpaper-journal-v1";
  async function openStore(onEvents, onStatus) {
    let events = [];
    let mode = "local";
    const readLocal = () => {
      try {
        return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      } catch {
        return [];
      }
    };
    const writeLocal = (evs) => {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(evs));
      } catch {
      }
    };
    events = readLocal();
    onEvents(events);
    onStatus({ mode: "local", label: "Saved in this browser" });
    let col = null;
    try {
      const db = window.claude?.use ? await window.claude.use("db") : null;
      if (db) {
        col = db.collection("journal");
        mode = "shared";
        onStatus({ mode, label: "Saved to the shared workpaper" });
        col.onSnapshot((snap) => {
          const shared = snap.docs.map((d) => {
            try {
              return JSON.parse(d.data().json);
            } catch {
              return null;
            }
          }).filter(Boolean);
          events = shared.sort((a, b) => a.real_at < b.real_at ? -1 : a.real_at > b.real_at ? 1 : a.id < b.id ? -1 : 1);
          onEvents(events);
        }, (e) => {
          onStatus({ mode: "local", label: "Shared store unavailable \u2014 saved in this browser", error: e?.message });
          col = null;
        });
      }
    } catch {
      col = null;
    }
    return {
      get mode() {
        return mode;
      },
      async append(evs) {
        const list = Array.isArray(evs) ? evs : [evs];
        if (col) {
          try {
            for (const ev of list) await col.doc(ev.id).set({ json: JSON.stringify(ev), at: ev.at, real_at: ev.real_at, type: ev.type, actor: ev.actor });
            return;
          } catch (e) {
            onStatus({ mode: "local", label: "Could not write to the shared store \u2014 saved in this browser", error: e?.message });
            col = null;
          }
        }
        events = [...events, ...list];
        writeLocal(events);
        onEvents(events);
      },
      async reset() {
        if (col) {
          try {
            const s = await col.get();
            for (const d of s.docs) await col.doc(d.id).delete();
          } catch {
          }
        }
        events = [];
        writeLocal(events);
        onEvents(events);
      }
    };
  }
  function replay(ctx, allEvents, clockISO) {
    const { actors, standards: baseStandards } = ctx;
    const actorById = new Map(actors.map((a) => [a.id, a]));
    const S = {
      adjustments: /* @__PURE__ */ new Map(),
      // id -> adj
      verifications: [],
      // {id, target, method, note, evidence, actor, at, batch}
      findingStatus: /* @__PURE__ */ new Map(),
      // finding id -> {status, reason, actor, at}
      reviewNotes: /* @__PURE__ */ new Map(),
      // id -> {id, target, text, blocking, actor, at, replies[], resolved}
      questions: /* @__PURE__ */ new Map(),
      // id -> {id, target, to, text, actor, at, answers[]}
      signoffs: [],
      // {id, area, level, fingerprint, actor, at}
      decisions: [],
      notes: [],
      attachments: [],
      time: [],
      views: [],
      filing: [],
      rejected: [],
      seen: /* @__PURE__ */ new Map(),
      standards: JSON.parse(JSON.stringify(baseStandards)),
      assignments: { ...ctx.assignment },
      householdOverrides: /* @__PURE__ */ new Map(),
      frozen: null,
      amendment: null,
      events: [],
      undone: /* @__PURE__ */ new Set()
    };
    const events = allEvents.filter((e) => !clockISO || e.at <= clockISO);
    for (const e of events) {
      if (e.type !== "undo") continue;
      const targets = events.filter((x) => e.data.event && x.id === e.data.event || e.data.batch && x.batch === e.data.batch);
      if (targets.length && targets.every((t) => t.actor === e.actor)) targets.forEach((t) => S.undone.add(t.id));
    }
    const reject = (e, why) => S.rejected.push({ ...e, why });
    for (const e of events) {
      if (e.type === "undo") {
        S.events.push(e);
        continue;
      }
      if (S.undone.has(e.id)) {
        S.events.push({ ...e, undone: true });
        continue;
      }
      const a = actorById.get(e.actor);
      if (!a) {
        reject(e, "Unknown person");
        continue;
      }
      const cap = e.type === "signoff" ? `signoff:${e.data.level}` : e.type === "filing" ? `filing:${e.data.step}` : e.type;
      if (!(ROLE_CAN[a.role] || []).includes(cap)) {
        reject(e, `${ROLE_LABEL[a.role]}s can't ${cap.startsWith("signoff:") ? "sign off as " + cap.slice(8) : cap.replace(/[:_]/g, " ")}`);
        continue;
      }
      if (a.active_from && e.at.slice(0, 10) < a.active_from) {
        reject(e, `${a.name} was not active on the engagement until ${a.active_from}`);
        continue;
      }
      if (e.type === "unmask" && !a.clearance) {
        reject(e, `${a.name} has no sensitive-data clearance`);
        continue;
      }
      if (S.frozen && ["adjust", "adjust_revert", "adjust_approve"].includes(e.type) && !S.amendment) {
        reject(e, "The return is frozen at filing; open an amendment first");
        continue;
      }
      switch (e.type) {
        case "adjust": {
          const layer = S.frozen ? S.amendment?.id || "amendment" : "original";
          const area = e.data.area || areaOfLine(e.data.lines?.[0]?.key || "");
          const fed = (e.data.effects || []).reduce((s, x) => s + (x.tax_fed || 0) + (x.pay_fed ? -x.pay_fed : 0), 0);
          const ca = (e.data.effects || []).reduce((s, x) => s + (x.tax_ca || 0) + (x.pay_ca ? -x.pay_ca : 0), 0);
          const threshold = S.standards.partner_threshold ?? 1e3;
          S.adjustments.set(e.id, { id: e.id, ...e.data, area, actor: e.actor, at: e.at, batch: e.batch, layer, status: "active", approvals: [], needsPartner: Math.abs(fed) > threshold || Math.abs(ca) > threshold || !!e.data.election, netFed: fed, netCa: ca });
          if (e.data.finding) S.findingStatus.set(e.data.finding, { status: "adjusted", reason: e.data.reason, actor: e.actor, at: e.at, adj: e.id });
          break;
        }
        case "adjust_approve": {
          const adj = S.adjustments.get(e.data.adj);
          if (!adj) {
            reject(e, "No such adjustment");
            break;
          }
          if (adj.actor === e.actor) {
            reject(e, "A person may not approve their own adjustment");
            break;
          }
          adj.approvals.push({ actor: e.actor, at: e.at });
          break;
        }
        case "adjust_revert": {
          const adj = S.adjustments.get(e.data.adj);
          if (adj) {
            adj.status = "reverted";
            adj.revertedBy = e.actor;
            adj.revertedAt = e.at;
            adj.revertReason = e.data.reason;
            if (adj.finding) S.findingStatus.set(adj.finding, { status: "open", reason: "Adjustment reverted", actor: e.actor, at: e.at });
          }
          break;
        }
        case "verify":
          S.verifications.push({ id: e.id, target: e.target, ...e.data, actor: e.actor, at: e.at, batch: e.batch });
          break;
        case "finding_status":
          S.findingStatus.set(e.target, { ...e.data, actor: e.actor, at: e.at });
          break;
        case "review_note":
          S.reviewNotes.set(e.id, { id: e.id, target: e.target, text: e.data.text, blocking: e.data.blocking !== false, actor: e.actor, at: e.at, replies: [], resolved: null });
          break;
        case "review_reply": {
          const n = S.reviewNotes.get(e.data.note);
          if (n) n.replies.push({ actor: e.actor, at: e.at, text: e.data.text });
          break;
        }
        case "review_resolve": {
          const n = S.reviewNotes.get(e.data.note);
          if (!n) break;
          if (n.actor !== e.actor) {
            reject(e, "Only the person who opened a review note may clear it");
            break;
          }
          n.resolved = { actor: e.actor, at: e.at, text: e.data.text };
          break;
        }
        case "question":
          S.questions.set(e.id, { id: e.id, target: e.target, to: e.data.to, text: e.data.text, actor: e.actor, at: e.at, answers: [] });
          break;
        case "answer": {
          const q = S.questions.get(e.data.question);
          if (!q) break;
          if (q.to === "client" && a.role !== "client" && !e.data.onBehalf) {
            reject(e, "Client questions are answered by the client (or recorded as a call note)");
            break;
          }
          q.answers.push({ actor: e.actor, at: e.at, text: e.data.text, attachment: e.data.attachment });
          S.verifications.push({ id: e.id, target: q.target, method: q.to === "client" ? "confirmed_with_client" : "agreed_to_source_document", note: `Answer to "${q.text}": ${e.data.text}`, evidence: [`question:${q.id}`], actor: e.actor, at: e.at });
          break;
        }
        case "signoff": {
          const prepared = [...S.adjustments.values()].some((x) => x.area === e.data.area && x.actor === e.actor) || S.signoffs.some((x) => x.area === e.data.area && x.level === "preparer" && x.actor === e.actor);
          if (e.data.level !== "preparer" && prepared) {
            reject(e, "A person may not review or sign off on work they prepared");
            break;
          }
          S.signoffs.push({ id: e.id, area: e.data.area, level: e.data.level, fingerprint: e.data.fingerprint, snapshot: e.data.snapshot, actor: e.actor, at: e.at });
          break;
        }
        case "decision":
          if (!e.data.authority) {
            reject(e, "Every judgment call records the authority relied on");
            break;
          }
          S.decisions.push({ id: e.id, target: e.target, ...e.data, actor: e.actor, at: e.at });
          break;
        case "attach":
          S.attachments.push({ id: e.id, target: e.target, ...e.data, actor: e.actor, at: e.at });
          break;
        case "note":
          S.notes.push({ id: e.id, target: e.target, text: e.data.text, actor: e.actor, at: e.at });
          break;
        case "time":
          S.time.push({ id: e.id, ...e.data, actor: e.actor, at: e.at });
          break;
        case "unmask":
          S.views.push({ id: e.id, target: e.target, what: e.data.what, actor: e.actor, at: e.at });
          break;
        case "seen":
          S.seen.set(e.actor, e.at);
          break;
        case "standard":
          S.standards = { ...S.standards, ...e.data };
          break;
        case "assign":
          S.assignments = { ...S.assignments, ...e.data };
          break;
        case "household":
          S.householdOverrides.set(e.data.path, e.data.value);
          break;
        case "filing": {
          const step = e.data.step;
          if (step === "efile_submit") {
            const blockers = ctx.filingBlockers ? ctx.filingBlockers(S) : [];
            if (blockers.length && !e.data.override) {
              reject(e, `Filing blocked: ${blockers.map((b) => b.label).join("; ")}`);
              break;
            }
          }
          if (step === "freeze") S.frozen = { at: e.at, actor: e.actor, snapshot: e.data.snapshot, fingerprint: e.data.fingerprint };
          if (step === "amend_open") S.amendment = { id: e.id, at: e.at, actor: e.actor, reason: e.data.reason };
          S.filing.push({ id: e.id, ...e.data, actor: e.actor, at: e.at });
          break;
        }
      }
      S.events.push(e);
    }
    return S;
  }
  function effectiveLines(V, S) {
    const over = /* @__PURE__ */ new Map();
    for (const adj of S.adjustments.values()) {
      if (adj.status !== "active") continue;
      for (const l of adj.lines || []) over.set(l.key, { to: l.to, from: l.from, adj: adj.id, text: l.text, note: l.note });
    }
    const affected = /* @__PURE__ */ new Set();
    const stack = [...over.keys()];
    while (stack.length) {
      const k = stack.pop();
      for (const d of V.usedBy.get(k) || []) if (!affected.has(d) && !over.has(d)) {
        affected.add(d);
        stack.push(d);
      }
    }
    return { over, affected };
  }
  function finalReturn(V, S) {
    const f = { ...V.summary.federal }, c = { ...V.summary.california };
    let dTaxF = 0, dTaxC = 0, dPayF = 0, dPayC = 0;
    for (const adj of S.adjustments.values()) {
      if (adj.status !== "active") continue;
      for (const x of adj.effects || []) {
        dTaxF += x.tax_fed || 0;
        dTaxC += x.tax_ca || 0;
        dPayF += x.pay_fed || 0;
        dPayC += x.pay_ca || 0;
      }
    }
    f.total_tax += dTaxF;
    f.payments += dPayF;
    f.balance_due = f.total_tax - f.payments;
    c.total_tax += dTaxC;
    c.payments += dPayC;
    c.balance_due = c.total_tax - c.payments;
    return { federal: f, california: c, delta: { dTaxF, dTaxC, dPayF, dPayC } };
  }
  function areaFingerprint(V, S, area, eff) {
    const lines = V.lines.filter((l) => areaOfLine(l.key) === area).map((l) => [l.key, eff.over.has(l.key) ? eff.over.get(l.key).to : l.value]);
    const adjs = [...S.adjustments.values()].filter((a) => a.area === area).map((a) => [a.id, a.status, a.approvals.length]);
    return hash({ v: V.version, lines, adjs });
  }
  function returnFingerprint(fr) {
    return hash({ f: [fr.federal.total_tax, fr.federal.payments], c: [fr.california.total_tax, fr.california.payments] });
  }

  // src/derive.js
  var DIAG_FINDING = {
    SCORP_BASIS_INCOMPLETE: "rc-7203",
    DIGITAL_ASSET_BASIS_MISSING: "F-CRYPTO-C6",
    K1_EXPECTED_NOT_RECEIVED: "D37",
    AMT_CREDIT_CARRYFORWARD: "F6251.11",
    AOTC_PHASED_OUT: "F-ADA-RETURN",
    FBAR_OUTSIDE_RETURN: "F-FBAR",
    FORM_1099_FILING: "F-1099-NEC",
    DUE_DILIGENCE_REQUIRED: "F8867.status",
    CA_AMT_NOT_COMPUTED: "F-CA-AMT-ISO",
    HOME_OFFICE_AREA_CHANGE: "F-HOME-OFFICE-PY",
    QUESTIONNAIRE_SALES_CONFLICT: "F-QA-CONFLICTS",
    LOW_CONFIDENCE_READ: "F-ST-BRIGID",
    BROKER_SUMMARY_DETAIL_MISMATCH: "F-MERIDIAN-P32"
  };
  function variances(V, py, S) {
    const out = [];
    const rule = S.standards.variance_review;
    for (const [k, pv] of Object.entries(py.lines)) {
      const l = V.lineMap.get(k);
      if (!l || typeof pv !== "number" || typeof l.value !== "number") continue;
      const d = l.value - pv;
      const pct = pv ? Math.abs(d / pv) * 100 : Infinity;
      if (Math.abs(d) > rule.and_over_amount && pct > rule.flag_if_change_over_percent) out.push({ key: k, label: l.label, py: pv, cy: l.value, d, pct });
    }
    return out;
  }
  var isExplained = (S, key) => S.notes.some((n) => n.target === key) || S.verifications.some((v) => v.target === key) || S.decisions.some((d) => d.target === key);
  function signoffState(V, S, eff, area) {
    const fp = areaFingerprint(V, S, area, eff);
    const lv = {};
    for (const level of ["preparer", "reviewer", "partner"]) {
      const last = [...S.signoffs].reverse().find((s) => s.area === area && s.level === level);
      lv[level] = last ? { ...last, fresh: last.fingerprint === fp } : null;
    }
    return { fp, ...lv };
  }
  function clientApproval(S, fr) {
    const last = [...S.filing].reverse().find((f) => f.step === "client_approval");
    if (!last) return null;
    return { ...last, fresh: last.fingerprint === returnFingerprint(fr) };
  }
  function filingBlockers(app, S) {
    const { V, eff, fr } = app;
    const b = [];
    const open = [...S.reviewNotes.values()].filter((n) => n.blocking && !n.resolved);
    if (open.length) b.push({ label: `${open.length} open review note${open.length > 1 ? "s" : ""}`, go: "review" });
    const pend = [...S.adjustments.values()].filter((a) => a.status === "active" && a.needsPartner && !a.approvals.length);
    if (pend.length) b.push({ label: `${pend.length} adjustment${pend.length > 1 ? "s" : ""} awaiting partner approval`, go: "adjustments" });
    const openF = app.findings.filter((f) => ["engine_error", "extraction_error", "client_conflict"].includes(f.kind) && (S.findingStatus.get(f.id)?.status || "open") === "open");
    if (openF.length) b.push({ label: `${openF.length} unresolved error finding${openF.length > 1 ? "s" : ""}`, go: "findings" });
    const ps = signoffState(V, S, eff, "partner_review");
    if (!ps.partner?.fresh) b.push({ label: ps.partner ? "Partner sign-off reopened by later changes" : "No partner sign-off", go: "review" });
    const ca = clientApproval(S, fr || app.fr);
    if (!ca?.fresh) b.push({ label: ca ? "Client approval is for different numbers" : "No client approval / e-file authorization (8879)", go: "filing" });
    return b;
  }
  function requiredSteps(app) {
    const { M, V, S, eff, fr } = app;
    const docs = [...M.docs.values()].filter((d) => d.received_at <= app.clock);
    const unexplained = docs.filter((d) => {
      const st = M.docStatus(V, d);
      return st.code === "not_used" && !S.notes.some((n) => n.target === d.id) && !S.verifications.some((v) => v.target === d.id);
    });
    const vs = variances(V, M.py, S);
    const vOpen = vs.filter((v) => !isExplained(S, v.key));
    const carry = ["SchD.6", "SchD.14", "F8582.1c", "F8606.2"];
    const carryOk = carry.every((k) => S.verifications.some((v) => v.target === k));
    const payF = ["F-FED-ESTIMATES", "F-CA-ESTIMATES"].every((id) => !app.findings.find((f) => f.id === id) || (S.findingStatus.get(id)?.status || "open") !== "open");
    const dd = S.decisions.some((d) => d.kind === "due_diligence");
    const diags = V.diagnostics.filter((d) => {
      const t = DIAG_FINDING[d.code];
      return !(t && ((S.findingStatus.get(t)?.status || "open") !== "open" || S.verifications.some((v) => v.target === t) || S.notes.some((n) => n.target === t) || S.decisions.some((x) => x.target === t))) && !S.notes.some((n) => n.target === "diag:" + d.code);
    });
    const areas = AREAS.filter((a) => a.id !== "partner_review");
    const revOk = areas.every((a) => signoffState(V, S, eff, a.id).reviewer?.fresh);
    const ps = signoffState(V, S, eff, "partner_review");
    const ca = clientApproval(S, fr);
    const idv = S.verifications.some((v) => ["D04", "D05", "D03"].includes(v.target));
    const pyr = S.verifications.some((v) => v.target === "D06") || S.notes.some((n) => n.target === "D06");
    return [
      { step: "Engagement letter and consents signed", ok: M.docs.has("D01") && M.docs.has("D02"), detail: "D01 signed 01/12/2026; \xA77216 consent D02", go: "D01" },
      { step: "Identity verified", ok: idv, detail: idv ? "Driver licenses / IP PIN verified" : "Verify D04, D05 (driver licenses) and D03 (IP PIN)", go: "D04" },
      { step: "Prior-year return reviewed", ok: pyr, detail: pyr ? "D06 reviewed" : "Review D06 and the prior preparer file D07", go: "D06" },
      { step: "All documents accounted for", ok: unexplained.length === 0, detail: unexplained.length ? `${unexplained.length} received document(s) not on this version without a note: ${unexplained.map((d) => d.id).join(", ")}` : `${docs.length} received documents each have a status`, go: "documents" },
      { step: "Prior-year variances explained", ok: vOpen.length === 0, detail: `${vs.length - vOpen.length} of ${vs.length} flagged variances explained`, go: "variances" },
      { step: "Carryovers agreed to prior year", ok: carryOk, detail: carryOk ? "Capital loss, passive and IRA basis carryovers agreed" : "Verify SchD.6, SchD.14, F8582.1c, F8606.2 against the 2024 return", go: "carryovers" },
      { step: "Estimated payments agreed to IRS and FTB records", ok: payF, detail: payF ? "Agreed (see payment findings)" : "Payments disagree with agency records", go: "payments" },
      { step: "Due diligence completed", ok: dd, detail: dd ? "Form 8867 checklist recorded" : "Complete the Form 8867 checklist for CTC/ODC", go: "F8867.status" },
      { step: "Diagnostics resolved", ok: diags.length === 0, detail: diags.length ? `${diags.length} of ${V.diagnostics.length} engine diagnostics without a disposition` : "Every diagnostic has a disposition", go: "diagnostics" },
      { step: "Reviewer sign-off", ok: revOk, detail: revOk ? "All areas signed and current" : `${areas.filter((a) => !signoffState(V, S, eff, a.id).reviewer?.fresh).length} areas without a current reviewer sign-off`, go: "review" },
      { step: "Partner sign-off", ok: !!ps.partner?.fresh, detail: ps.partner ? ps.partner.fresh ? "Signed and current" : "Reopened: changed since signing" : "Not signed", go: "review" },
      { step: "Client approval and e-file authorization", ok: !!ca?.fresh, detail: ca ? ca.fresh ? "Form 8879 / FTB 8879 signed for these numbers" : "Signed for different numbers \u2014 re-approve" : "Not yet approved", go: "filing" }
    ];
  }

  // src/demo.js
  function demoEvents(M, findings) {
    const A = new Map([...M.P.firm.staff, ...M.P.firm.client_users.map((c) => ({ ...c, role: "client" }))].map((a) => [a.id, a]));
    const ev = [];
    const at = (d) => d + "T16:00:00Z";
    let n = 0;
    const push = (actor, type, target, data, d, extra) => {
      const e = newEvent(A.get(actor), type, target, data, at(d), extra);
      e.real_at = new Date(Date.UTC(2026, 0, 1) + n++ * 6e4).toISOString();
      e.demo = true;
      ev.push(e);
      return e;
    };
    const F = (id) => findings.find((f) => f.id === id);
    const apply = (actor, id, d, batch) => {
      const f = F(id);
      if (!f?.proposal) return null;
      return push(actor, "adjust", f.proposal.lines[0]?.key, { finding: f.id, title: f.title, lines: f.proposal.lines, effects: f.proposal.effects, reason: f.summary.split(". ")[0] + ".", verification: f.proposal.verification, area: f.area, election: !!f.proposal.election, whatIf: f.proposal.whatIf }, d, batch ? { batch } : {});
    };
    push("st-01", "time", "area:intake_and_engagement", { area: "intake_and_engagement", hours: 1.25, note: "Engagement, identity, prior-year review" }, "2026-03-09");
    push("st-01", "verify", "D04", { method: "agreed_to_source_document", note: "Texas DL, name/DOB agree to organizer; issued 08/02/2025", evidence: ["ev-0006"] }, "2026-03-09");
    push("st-01", "verify", "D05", { method: "agreed_to_source_document", note: "Texas DL for Erik agrees to organizer", evidence: ["ev-0008"] }, "2026-03-09");
    push("st-01", "verify", "D06", { method: "agreed_to_prior_year", note: "Read 2024 return and Delta River workpaper; open items carried into findings", evidence: ["D07"] }, "2026-03-09");
    push("st-01", "verify", "F1040.1a", { method: "agreed_to_source_document", note: "Box 1 of D08 + D09; D10 is the same W-2", evidence: ["ev-0016", "ev-0035"] }, "2026-03-10");
    push("st-01", "verify", "F1040.25a", { method: "agreed_to_source_document", evidence: ["ev-0017", "ev-0036"] }, "2026-03-10");
    push("st-01", "time", "area:wages_and_stock_compensation", { area: "wages_and_stock_compensation", hours: 2.5, note: "W-2s, stock plan statements, ISO" }, "2026-03-10");
    const b1 = "b-pay";
    apply("st-01", "F-FED-ESTIMATES", "2026-03-12", b1);
    apply("st-01", "F-CA-ESTIMATES", "2026-03-12", b1);
    push("st-01", "verify", "SchD.6", { method: "agreed_to_prior_year", note: "2024 Sch D: ST loss 6,200 less 3,000 allowed", evidence: ["D06", "D07"] }, "2026-03-12", { batch: "b-carry" });
    push("st-01", "verify", "SchD.14", { method: "agreed_to_prior_year", evidence: ["D06", "D07"] }, "2026-03-12", { batch: "b-carry" });
    push("st-01", "verify", "F8582.1c", { method: "agreed_to_prior_year", note: "6,300 + 9,850 per 2024 Form 8582", evidence: ["D06"] }, "2026-03-12", { batch: "b-carry" });
    push("st-01", "verify", "F8606.2", { method: "agreed_to_third_party_record", note: "2024 Form 5498 (D42) shows 7,000 made 02/12/2025 for 2024", evidence: ["D42"] }, "2026-03-12", { batch: "b-carry" });
    const b2 = "b-inv";
    for (const id of ["F-RSU-BASIS", "F-INT-DUP", "F-MERIDIAN-P32"]) apply("st-01", id, "2026-03-20", b2);
    apply("st-02", "F-FX-RATE", "2026-04-06");
    push("st-01", "time", "area:investments_and_digital_assets", { area: "investments_and_digital_assets", hours: 3.5, note: "Three brokers, 282 lots, crypto, Sparbanken" }, "2026-03-20");
    push("st-04", "unmask", "D08", { what: "document D08 (SSN)" }, "2026-03-24");
    const b3 = "b-biz";
    for (const id of ["F-1099K-DUP", "F-MILEAGE-DUP", "F-SPOTIFY", "F-SEHI"]) apply("st-01", id, "2026-03-25", b3);
    const q1 = push("st-01", "question", "SchC.25", { to: "client", text: "What share of the family phone plan and home internet is used for the studio?" }, "2026-03-25");
    push("cu-02", "answer", "SchC.25", { question: q1.id, text: "Phone about 70%, internet about 50% (we talked on the 26th)." }, "2026-03-26");
    apply("st-01", "F-PHONE-NET", "2026-03-26");
    apply("st-01", "F-SEP-LIMIT", "2026-03-26");
    push("st-01", "time", "area:business", { area: "business", hours: 4.25, note: "Books to tax, mileage, contractors, SEP" }, "2026-03-26");
    for (const a of ["wages_and_stock_compensation", "investments_and_digital_assets", "business"]) push("st-01", "signoff", "area:" + a, { area: a, level: "preparer", fingerprint: "demo", snapshot: [] }, "2026-03-27");
    const rn1 = push("st-02", "review_note", "Sch1.17", { text: "Confirm Erik was eligible for Ngozi's plan in every month, including after the job change in June.", blocking: true }, "2026-04-02");
    push("st-01", "review_reply", "Sch1.17", { note: rn1.id, text: "qa-25: both employers offered family coverage; Halvorsen coverage effective 06/02, Corvane through 05/31. No gap month." }, "2026-04-03");
    push("st-02", "review_resolve", "Sch1.17", { note: rn1.id, text: "Agreed." }, "2026-04-06");
    push("st-02", "review_note", "SchE.14A", { text: "HVAC: invoice reads as a full system replacement. Capitalize unless the client has something showing it was a repair.", blocking: false }, "2026-04-06");
    push("st-02", "filing", null, { step: "extension", note: "Form 4868 with 36,000; FTB 3519 with 0 (from v2)" }, "2026-04-14");
    push("st-01", "time", "area:rentals_and_sale", { area: "rentals_and_sale", hours: 3, note: "Rentals, condo sale, 4797" }, "2026-06-24");
    apply("st-01", "F-HVAC", "2026-06-24");
    const b4 = "b-ded";
    for (const id of ["F-MORTGAGE-DUP", "F-RE-TAX", "F-CAR-DONATION", "F-CA-WAGES"]) apply("st-01", id, "2026-06-25", b4);
    push("st-01", "time", "area:deductions_and_credits", { area: "deductions_and_credits", hours: 2.5, note: "Schedule A, 8283, 2441, 8812" }, "2026-06-25");
    push("st-01", "time", "area:california", { area: "california", hours: 2, note: "Wage split from the 07/18 paystub; FTB payments" }, "2026-06-25");
    const q2 = push("st-01", "question", "F8949.H.C6", { to: "client", text: "Lot C6 (0.05 BTC) has no cost basis. Where and when was it bought?" }, "2026-06-26");
    push("cu-02", "answer", "F8949.H.C6", { question: q2.id, text: "Bought on CryptoNorth in March 2021 for about 3,050; only a bank statement line remains (03/15/2021)." }, "2026-06-30");
    apply("st-01", "F-CRYPTO-C6", "2026-06-30");
    push("st-01", "attach", "F8949.H.C6", { name: "Bank statement March 2021 (requested)", kind: "text", note: "Client to upload the statement page showing 3,050 to CryptoNorth on 03/15/2021" }, "2026-06-30");
    push("st-01", "verify", "SchA.11", { method: "confirmed_with_client", note: "St. Brigid 1,500 confirmed by parish and bank check #2207 (msg-08)", evidence: ["msg-08", "ev-1049"] }, "2026-07-01");
    push("st-01", "decision", "F8867.status", { kind: "due_diligence", topic: "Form 8867", conclusion: "Knowledge, eligibility and record-keeping requirements met for CTC (Theo) and ODC (Ada).", authority: "IRC \xA76695(g); Treas. Reg. \xA71.6695-2" }, "2026-07-01");
    push("st-01", "finding_status", "F-1099-NEC", { status: "advised", reason: "Emailed client: file 1099-NECs late for Quintero and Patel; outside engagement." }, "2026-07-01");
    push("st-01", "finding_status", "F-FBAR", { status: "advised", reason: "Client confirmed they file the FBAR themselves by 10/15." }, "2026-07-01");
    push("st-01", "finding_status", "F-QA-CONFLICTS", { status: "no_change", reason: "Documents govern; engine followed them. Sent the client a note correcting qa-14, qa-15 and qa-31." }, "2026-07-01");
    push("st-01", "finding_status", "F-3520", { status: "advised", reason: "Written advice sent; offered separate engagement for 2023 Form 3520." }, "2026-07-01");
    for (const a of ["wages_and_stock_compensation", "investments_and_digital_assets", "business", "rentals_and_sale", "deductions_and_credits", "california", "pass_throughs_and_basis", "tax_and_payments", "intake_and_engagement"]) push("st-01", "signoff", "area:" + a, { area: a, level: "preparer", fingerprint: "demo", snapshot: [] }, "2026-07-01");
    push("st-02", "signoff", "area:investments_and_digital_assets", { area: "investments_and_digital_assets", level: "reviewer", fingerprint: "demo", snapshot: [] }, "2026-07-02");
    for (const a of ["wages_and_stock_compensation", "business", "rentals_and_sale", "pass_throughs_and_basis", "intake_and_engagement"]) push("st-02", "signoff", "area:" + a, { area: a, level: "reviewer", fingerprint: "demo", snapshot: [] }, "2026-07-02");
    push("st-03", "adjust_approve", null, { adj: "__F-RSU-BASIS" }, "2026-07-06");
    push("st-03", "adjust_approve", null, { adj: "__F-1099K-DUP" }, "2026-07-06");
    push("st-03", "adjust_approve", null, { adj: "__F-SEHI" }, "2026-07-06");
    push("st-03", "adjust_approve", null, { adj: "__F-CA-WAGES" }, "2026-07-06");
    push("st-03", "review_note", "F540NR.61", { text: "Compute California AMT (Schedule P) for the ISO exercise outside the engine before we file. Most of the option period was California service.", blocking: true }, "2026-07-07");
    const byFinding = new Map(ev.filter((e) => e.type === "adjust").map((e) => [e.data.finding, e.id]));
    for (const e of ev) if (e.type === "adjust_approve" && String(e.data.adj).startsWith("__")) {
      e.data.adj = byFinding.get(e.data.adj.slice(2));
      e.target = e.data.adj;
    }
    return ev;
  }

  // src/ui/docviewer.js
  var SimulatedRenderer = {
    kind: "simulated",
    pages: (doc) => doc.pages,
    // Find where an extracted value sits in the printed text: anchor on the field's lot/box token, then the value text.
    locate(ev, text) {
      const read = ev.text_as_read || "";
      if (!read) return null;
      const anchors = [];
      const lot = ev.field.match(/^([A-Z]+\d+|trip\d+|RSU-\d+|ESPP-\d+|pay\d+|q\d+)_/);
      if (lot) {
        const t = lot[1];
        if (/^trip(\d+)/.test(t)) anchors.push(null);
        else if (/^pay(\d+)/.test(t) || /^q\d/.test(t)) anchors.push(null);
        else anchors.push(t + " ");
      }
      const box = ev.field.match(/box_?(\d+[a-z]?)/i);
      if (box) anchors.push(`Box ${box[1]}`, `box ${box[1]}`, `${box[1]} `);
      const word = ev.label.split(/[ (]/)[0];
      if (word && word.length > 3) anchors.push(word);
      for (const a of anchors) {
        if (!a) continue;
        const i = text.indexOf(a);
        if (i >= 0) {
          const j2 = text.indexOf(read, i);
          if (j2 >= 0) return { start: j2, end: j2 + read.length };
        }
      }
      const trip = ev.field.match(/^trip(\d+)_/);
      if (trip) {
        const dates = [...text.matchAll(/\d{4}-\d{2}-\d{2}/g)];
        const d = dates[+trip[1] - 1];
        if (d) {
          const j2 = text.indexOf(read.includes("/") ? d[0] : read, d.index);
          if (j2 >= 0) return { start: j2, end: j2 + (read.includes("/") ? d[0].length : read.length) };
        }
      }
      const j = text.indexOf(read);
      if (j >= 0) return { start: j, end: j + read.length };
      if (ev.value_type === "date" && ev.value) {
        const k = text.indexOf(ev.value);
        if (k >= 0) return { start: k, end: k + String(ev.value).length };
      }
      return null;
    }
  };
  function DocViewer({ docId, page: initialPage, focusEv, compact }) {
    const app = useApp();
    const doc = app.M.docs.get(docId);
    const [page, setPage] = useState(initialPage || (focusEv ? app.M.evs.get(focusEv)?.page : 1) || 1);
    useEffect(() => {
      if (focusEv) setPage(app.M.evs.get(focusEv)?.page || 1);
      else if (initialPage) setPage(initialPage);
    }, [docId, focusEv, initialPage]);
    const ref = useRef();
    useEffect(() => {
      const el = ref.current?.querySelector(".hl-focus");
      if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
    }, [page, focusEv, docId]);
    if (!doc) return html`<div class="empty">Document not found.</div>`;
    const p = doc.pages.find((x) => x.page === page) || doc.pages[0];
    const reveal = app.revealed.has(docId);
    const text = p.printed_content;
    const evs = (app.M.evByDoc.get(docId) || []).filter((e) => e.page === p.page);
    const spans = [];
    for (const e of evs) {
      const loc = SimulatedRenderer.locate(e, text);
      if (loc && !spans.some((s) => loc.start < s.end && loc.end > s.start)) spans.push({ ...loc, ev: e });
    }
    spans.sort((a, b) => a.start - b.start);
    const parts = [];
    let i = 0;
    for (const s of spans) {
      if (s.start > i) parts.push({ t: text.slice(i, s.start) });
      parts.push({ t: text.slice(s.start, s.end), ev: s.ev });
      i = s.end;
    }
    if (i < text.length) parts.push({ t: text.slice(i) });
    const unread = doc.extraction.status === "partial" && /Page (\d+)/.test(doc.extraction.reason || "") && +doc.extraction.reason.match(/Page (\d+)/)[1] === p.page;
    const status = app.M.docStatus(app.V, doc);
    const many = doc.pages.length > 1;
    return html`<div class=${cx("docv", compact && "docv-compact")}>
    <div class="docv-bar">
      <div class="docv-title"><strong>${doc.id}</strong> ${doc.title}${doc.marked_corrected ? html` <${Pill} tone="warn">CORRECTED<//>` : ""}</div>
      ${many && html`<div class="pager">
        <button class="btn btn-sm" disabled=${page <= 1} onClick=${() => setPage(page - 1)} aria-label="Previous page">‹</button>
        <select aria-label="Page" value=${page} onChange=${(e) => setPage(+e.target.value)}>${doc.pages.map((x) => html`<option value=${x.page}>Page ${x.page} of ${doc.page_count}</option>`)}</select>
        <button class="btn btn-sm" disabled=${page >= doc.pages.length} onClick=${() => setPage(page + 1)} aria-label="Next page">›</button></div>`}
    </div>
    <div class="paper" ref=${ref}>
      <div class="paper-head"><span>${doc.issuer}</span><span>${doc.document_type} · ${doc.file_name}</span></div>
      ${unread && html`<div class="paper-flag">The pipeline did not read this page.</div>`}
      <p class="paper-text">${parts.map((x) => x.ev ? html`<mark class=${cx("hl", x.ev.id === focusEv && "hl-focus", x.ev.confidence < 0.9 && "hl-low")} title=${`${x.ev.id} \xB7 ${x.ev.label} \xB7 read "${x.ev.text_as_read}" \xB7 confidence ${x.ev.confidence}`} onClick=${() => app.open(x.ev.id)}>${maskIfNeeded(app, x.ev, x.t, reveal)}</mark>` : maskText(x.t, reveal || app.canSeeSensitive && app.revealAll))}</p>
      <div class="paper-foot">Simulated from the packet's printed content · received ${doc.received_at.slice(0, 10)} · uploaded by ${doc.uploaded_by}</div>
    </div>
    ${!compact && html`<div class="docv-meta">
      <div><span class="k">Status</span> <${Pill} tone=${status.code === "landed" ? "good" : status.code === "superseded" || status.code === "duplicate" ? "neutral" : "info"}>${status.label}<//> <span class="muted">${status.detail || ""}</span></div>
      <${RevealBtn} docId=${docId} />
    </div>`}
  </div>`;
  }
  function maskIfNeeded(app, ev, t, reveal) {
    if (isSensitiveEv(ev) && !reveal) return maskText(t, false) === t ? "\u2022\u2022\u2022\u2022" + t.slice(-4) : maskText(t, false);
    return maskText(t, reveal);
  }
  function RevealBtn({ docId }) {
    const app = useApp();
    const doc = app.M.docs.get(docId);
    const hasSensitive = doc && /\b\d{3}-\d{2}-\d{4}\b|SE\d{2} \d{4}|Protection PIN|license no/.test(doc.pages.map((p) => p.printed_content).join(" "));
    if (!hasSensitive) return null;
    if (app.revealed.has(docId)) return html`<span class="muted small">Sensitive data shown · view logged</span>`;
    if (!app.actor.clearance) return html`<span class="muted small">SSNs and account numbers masked (no clearance)</span>`;
    return html`<button class="btn btn-sm" onClick=${() => app.reveal(docId, "document " + docId)}>Show sensitive data (logged)</button>`;
  }

  // src/ui/inspector.js
  function Inspector() {
    const app = useApp();
    const ref = app.openRef;
    if (!ref) return null;
    const crumbs = app.trail;
    return html`<aside class="insp" aria-label="Trace panel">
    <div class="insp-top">
      <div class="crumbs">${crumbs.map((c, i) => html`<button class=${cx("crumb", i === crumbs.length - 1 && "cur")} onClick=${() => app.openAt(i)}>${c.replace(/^household:/, "")}</button>`)}</div>
      <button class="x" aria-label="Close trace panel" onClick=${() => app.open(null)}>×</button>
    </div>
    <div class="insp-body">${renderRef(app, ref)}</div>
  </aside>`;
  }
  function renderRef(app, ref) {
    if (ref.startsWith("F-")) return html`<${FindingPanel} id=${ref} />`;
    if (ref.startsWith("question:")) return html`<${QuestionPanel} id=${ref.slice(9)} />`;
    if (ref.startsWith("area:")) return html`<${AreaRefPanel} id=${ref.slice(5)} />`;
    const res = app.M.resolveRef(ref, app.V);
    switch (res?.kind) {
      case "line":
        return html`<${LinePanel} k=${ref} />`;
      case "ev":
        return html`<${EvPanel} id=${ref} />`;
      case "doc":
        return html`<${DocPanel} id=${ref} />`;
      case "docpage":
        return html`<${DocPanel} id=${res.doc.id} page=${res.page} />`;
      case "asset":
        return html`<${AssetPanel} id=${res.id} />`;
      case "qa":
      case "msg":
      case "call":
        return html`<${ClientItemPanel} res=${res} />`;
      case "person":
        return html`<${PersonPanel} res=${res} />`;
      default:
        return html`<div class="panel"><h2 class="ph">${res?.label || ref}</h2><${ValueDump} v=${res?.value} />
      <${Annotations} target=${ref} /></div>`;
    }
  }
  function ValueDump({ v }) {
    if (v === void 0) return html`<p class="muted">No value.</p>`;
    if (typeof v !== "object" || v === null) return html`<p class="big num">${fmt(v)}</p>`;
    return html`<pre class="dump">${JSON.stringify(v, null, 1)}</pre>`;
  }
  function LinePanel({ k }) {
    const app = useApp();
    const { V, M, eff, S } = app;
    const l = V.lineMap.get(k);
    const ov = eff.over.get(k);
    const area = areaOfLine(k);
    const rule = M.P.engine_reference.rules[l.rule];
    const hist = M.versions.filter((v) => v.computed_at <= app.clock).map((v) => ({ v: v.version, val: v.lineMap.get(k)?.value }));
    const pyVal = M.py.lines[k];
    const variance = typeof pyVal === "number" && typeof l.value === "number" ? l.value - pyVal : null;
    const flagged = variance !== null && Math.abs(variance) > S.standards.variance_review.and_over_amount && Math.abs(variance) / Math.max(1, Math.abs(pyVal)) * 100 > S.standards.variance_review.flag_if_change_over_percent;
    const findings = app.findings.filter((f) => f.evidence?.includes(k) || f.proposal?.lines?.some((x) => x.key === k));
    const usedBy = V.usedBy.get(k) || [];
    return html`<div class="panel">
    <div class="ph-row"><span class="key">${k}</span><${Pill}>${areaName(area)}<//>${eff.affected.has(k) && html`<${Pill} tone="warn" title="An input to this line was adjusted; the engine must recompute it">Inputs adjusted<//>`}</div>
    <h2 class="ph">${l.label}</h2>
    <div class="valrow">
      ${ov ? html`<${Money} v=${l.value} strike /><span class="arrow">→</span><span class="big"><${Money} v=${ov.to} /></span><${Pill} tone="accent">Adjusted<//>` : html`<span class="big"><${Money} v=${l.value} /></span>`}
    </div>
    ${l.note && html`<p class="note">Engine note: ${l.note}</p>`}
    <div class="kv">
      <div><span class="k">Rule</span><span><code>${l.rule}</code> ${rule}</span></div>
      <div><span class="k">Versions</span><span class="hist">${hist.map((h2) => html`<span><b>${h2.v}</b> <${Money} v=${h2.val} /></span>`)}</span></div>
      ${pyVal !== void 0 && html`<div><span class="k">2024</span><span><${Money} v=${pyVal} /> ${variance !== null && html`<span class=${cx("var", flagged && "var-flag")}>${signed(variance)}${pyVal ? ` (${Math.round(variance / Math.abs(pyVal) * 100)}%)` : ""}</span>`} ${flagged && html`<${Pill} tone="warn">Variance to explain<//>`}</span></div>`}
    </div>
    ${findings.length > 0 && html`<div class="blk"><h4>Findings on this line</h4>${findings.map((f) => html`<${FindingChip} f=${f} />`)}</div>`}
    ${l.inputs?.length > 0 && html`<div class="blk"><h4>How it was built</h4>
      <table class="t t-tight"><tbody>${l.inputs.map((i) => {
      const il = V.lineMap.get(i);
      const io = eff.over.get(i);
      return html`<tr><td><${Ref} r=${i} /></td><td class="muted">${il?.label}</td><td class="r">${io ? html`<${Money} v=${io.to} /> <span class="muted">adj.</span>` : html`<${Money} v=${il?.value} />`}</td></tr>`;
    })}</tbody></table></div>`}
    ${l.sources?.length > 0 && html`<div class="blk"><h4>Where it came from</h4><${SourceList} sources=${l.sources} /></div>`}
    ${!l.inputs?.length && !l.sources?.length && html`<div class="blk"><p class="muted">The engine cites no source or input for this line (${l.rule}). Record how it was verified.</p></div>`}
    ${usedBy.length > 0 && html`<div class="blk"><h4>Flows into</h4><div class="chips">${usedBy.map((u) => html`<${Ref} r=${u} />`)}</div></div>`}
    <${Annotations} target=${k} line=${l} />
  </div>`;
  }
  function SourceList({ sources }) {
    const app = useApp();
    return html`<ul class="srcs">${sources.map((s) => {
      const r = app.M.resolveRef(s, app.V);
      if (r?.kind === "ev") {
        const e = r.ev;
        const masked = isSensitiveEv(e) && !app.revealed.has(e.document_id);
        return html`<li class="src"><${Ref} r=${s}>${e.document_id} p${e.page}<//> <span class="muted">${e.label}</span> <span class="num">${masked ? "\u2022\u2022\u2022\u2022" : fmt(typeof e.value === "number" ? e.value : e.value)}</span>
        ${e.confidence < 0.9 && html`<${Pill} tone="bad">confidence ${e.confidence}<//>`} <span class="muted small">${r.doc?.issuer}</span></li>`;
      }
      return html`<li class="src"><${Ref} r=${s} /> <span class="muted">${r?.label}</span>${r?.value !== void 0 && typeof r.value !== "object" ? html` <span class="num">${fmt(r.value)}</span>` : ""}</li>`;
    })}</ul>`;
  }
  function FindingChip({ f }) {
    const app = useApp();
    const st = app.S.findingStatus.get(f.id)?.status || "open";
    return html`<button class="fchip" onClick=${() => app.open(f.id)}><${Pill} tone=${KIND_TONE[f.kind]}>${KIND_LABEL[f.kind]}<//> <span>${f.title}</span> <${StatusPill} st=${st} /></button>`;
  }
  function StatusPill({ st }) {
    const tone = { open: "bad", adjusted: "good", no_change: "neutral", advised: "info", waived: "neutral" }[st] || "neutral";
    const label = { open: "Open", adjusted: "Adjusted", no_change: "No change", advised: "Advised client", waived: "Waived" }[st] || st;
    return html`<${Pill} tone=${tone}>${label}<//>`;
  }
  function EvPanel({ id }) {
    const app = useApp();
    const e = app.M.evs.get(id);
    const lines = app.V.evToLines.get(id) || [];
    const doc = app.M.docs.get(e.document_id);
    const status = app.M.docStatus(app.V, doc);
    const masked = isSensitiveEv(e) && !app.revealed.has(e.document_id);
    return html`<div class="panel">
    <div class="ph-row"><span class="key">${id}</span><${Pill}>${e.value_type}<//>${e.confidence < 0.9 ? html`<${Pill} tone="bad">confidence ${e.confidence}<//>` : html`<${Pill}>confidence ${e.confidence}<//>`}</div>
    <h2 class="ph">${e.label}</h2>
    <div class="kv">
      <div><span class="k">Value</span><span class="num big">${masked ? "\u2022\u2022\u2022\u2022" : fmt(e.value)}</span></div>
      <div><span class="k">Read as</span><span class="num">"${masked ? "\u2022\u2022\u2022\u2022" : e.text_as_read}"</span></div>
      <div><span class="k">Field</span><span><code>${e.field}</code> · page ${e.page}</span></div>
      <div><span class="k">Landed on</span><span>${lines.length ? html`<span class="chips">${lines.map((k) => html`<${Ref} r=${k} />`)}</span>` : html`<span class="muted">No return line cites this value. Document status: ${status.label}${status.detail ? " \xB7 " + status.detail : ""}</span>`}</span></div>
    </div>
    <${DocViewer} docId=${e.document_id} focusEv=${id} compact />
    <${Annotations} target=${id} />
  </div>`;
  }
  function DocPanel({ id, page }) {
    const app = useApp();
    const d = app.M.docs.get(id);
    const status = app.M.docStatus(app.V, d);
    const evs = app.M.evByDoc.get(id) || [];
    const landing = app.M.docLanding(app.V, id);
    const findings = app.findings.filter((f) => f.evidence?.some((x) => x === id || x.startsWith(`doc:${id}#`) || app.M.evs.get(x)?.document_id === id));
    return html`<div class="panel">
    <div class="ph-row"><span class="key">${id}</span><${Pill}>${d.document_type}<//><${Pill} tone=${status.code === "landed" ? "good" : "neutral"}>${status.label}<//></div>
    <h2 class="ph">${d.title}</h2>
    <p class="muted small">Received ${d.received_at.slice(0, 10)} from ${d.uploaded_by} · belongs to ${d.belongs_to} · extraction ${d.extraction.status} (${d.extraction.values} values)${d.extraction.reason ? " \xB7 " + d.extraction.reason : ""}</p>
    ${findings.length > 0 && html`<div class="blk"><h4>Findings</h4>${findings.map((f) => html`<${FindingChip} f=${f} />`)}</div>`}
    <${DocViewer} docId=${id} page=${page} />
    <div class="blk"><h4>Where it landed</h4>
      ${landing.size ? html`<table class="t t-tight"><tbody>${[...landing].map(([k, ids]) => html`<tr><td><${Ref} r=${k} /></td><td class="muted">${app.V.lineMap.get(k)?.label}</td><td class="r"><${Money} v=${app.V.lineMap.get(k)?.value} /></td></tr>`)}</tbody></table>` : html`<p class="muted">${status.detail || "Not cited by any return line."}</p>`}
    </div>
    ${evs.length > 0 && evs.length <= 80 && html`<div class="blk"><h4>Values read (${evs.length})</h4><table class="t t-tight"><tbody>${evs.map((e) => {
      const ls = app.V.evToLines.get(e.id) || [];
      const masked = isSensitiveEv(e) && !app.revealed.has(id);
      return html`<tr class="click" onClick=${() => app.open(e.id)}><td class="muted small">p${e.page}</td><td>${e.label}</td><td class="r num">${masked ? "\u2022\u2022\u2022\u2022" : fmt(e.value)}</td><td>${e.confidence < 0.9 ? html`<${Pill} tone="bad">${e.confidence}<//>` : ""}</td><td class="small">${ls.length ? ls.slice(0, 2).join(", ") + (ls.length > 2 ? "\u2026" : "") : html`<span class="muted">—</span>`}</td></tr>`;
    })}</tbody></table></div>`}
    ${evs.length > 80 && html`<div class="blk"><p class="muted">${evs.length} values read. Open the sales detail or mileage schedules to review them in bulk.</p></div>`}
    <${Annotations} target=${id} />
  </div>`;
  }
  function FindingPanel({ id }) {
    const app = useApp();
    const f = app.findings.find((x) => x.id === id);
    if (!f) return html`<${Empty}>Finding ${id} is not visible at this point in the season.<//>`;
    const st = app.S.findingStatus.get(id);
    const adj = st?.adj && app.S.adjustments.get(st.adj);
    const fed = (f.proposal?.effects || []).reduce((s, x) => s + (x.tax_fed || 0) - (x.pay_fed || 0), 0);
    const ca = (f.proposal?.effects || []).reduce((s, x) => s + (x.tax_ca || 0) - (x.pay_ca || 0), 0);
    const [reason, setReason] = useState("");
    return html`<div class="panel">
    <div class="ph-row"><span class="key">${f.id}</span><${Pill} tone=${KIND_TONE[f.kind]}>${KIND_LABEL[f.kind]}<//><${StatusPill} st=${st?.status || "open"} /><${Pill}>${areaName(f.area)}<//></div>
    <h2 class="ph">${f.title}</h2>
    <p class="lead">${f.summary}</p>
    <div class="kv">
      <div><span class="k">How found</span><span>${f.how}</span></div>
      ${f.authority && html`<div><span class="k">Authority</span><span>${f.authority}</span></div>`}
      ${f.proposal?.needs && html`<div><span class="k">Still needed</span><span>${f.proposal.needs}</span></div>`}
    </div>
    <div class="blk"><h4>Evidence</h4><${SourceList} sources=${f.evidence.filter((x) => !x.startsWith("F-"))} /></div>
    ${f.proposal && html`<div class="blk"><h4>Proposed adjustment</h4>
      <table class="t t-tight"><thead><tr><th>Line</th><th class="r">Engine</th><th class="r">Proposed</th></tr></thead><tbody>
      ${f.proposal.lines.map((x) => html`<tr><td>${app.V.lineMap.has(x.key) ? html`<${Ref} r=${x.key} />` : html`<code>${x.key}</code>`}${x.note && html`<div class="muted small">${x.note}</div>`}</td><td class="r">${x.text ? html`<span class="small">${maskText(String(x.from), app.revealAll)}</span>` : html`<${Money} v=${x.from} />`}</td><td class="r">${x.text ? html`<span class="small">${maskText(String(x.to), app.revealAll)}</span>` : html`<${Money} v=${x.to} />`}</td></tr>`)}
      </tbody></table>
      <table class="t t-tight"><thead><tr><th>Tax effect</th><th class="r">Federal</th><th class="r">California</th></tr></thead><tbody>
      ${f.proposal.effects.map((x) => html`<tr><td>${x.label || "Rate estimate"}<div class="muted small">${x.basis}</div></td><td class="r num">${x.pay_fed ? `payments ${signed(x.pay_fed)}` : signed(x.tax_fed || 0)}</td><td class="r num">${x.pay_ca ? `payments ${signed(x.pay_ca)}` : signed(x.tax_ca || 0)}</td></tr>`)}
      <tr class="tot"><td>Effect on balance due</td><td class="r num">${signed(fed)}</td><td class="r num">${signed(ca)}</td></tr>
      </tbody></table>
      ${(Math.abs(fed) > (app.S.standards.partner_threshold ?? 1e3) || Math.abs(ca) > (app.S.standards.partner_threshold ?? 1e3) || f.proposal.election) && html`<p class="muted small">Over ${(app.S.standards.partner_threshold ?? 1e3).toLocaleString()} (or an election): needs partner sign-off.</p>`}
    </div>`}
    ${adj && html`<div class="blk"><h4>Adjustment</h4><${AdjRow} a=${adj} /></div>`}
    <div class="blk actions">
      ${f.proposal && (!st || st.status === "open") && html`<${Btn} kind="primary" disabled=${!app.can("adjust")} title=${app.why("adjust")} onClick=${() => app.applyFinding(f)}>Apply adjustment<//>`}
      ${(!st || st.status === "open") && html`<input class="in" placeholder="Reason (required)" value=${reason} onInput=${(e) => setReason(e.target.value)} aria-label="Reason" />
        <${Btn} disabled=${!app.can("finding_status") || !reason} onClick=${() => {
      app.act("finding_status", id, { status: f.kind === "outside_filing" ? "advised" : "no_change", reason });
      setReason("");
    }}>${f.kind === "outside_filing" ? "Mark client advised" : "Close with no change"}<//>`}
      ${st && st.status !== "open" && st.status !== "adjusted" && html`<p class="muted small">${st.status} by <${Who} id=${st.actor} /> <${When} at=${st.at} />: ${st.reason}</p>`}
    </div>
    <${Annotations} target=${id} />
  </div>`;
  }
  function AdjRow({ a }) {
    const app = useApp();
    const approved = a.approvals.length > 0;
    return html`<div class=${cx("adj", a.status !== "active" && "adj-off")}>
    <div class="adj-h"><strong>${a.title || a.lines?.map((l) => l.key).join(", ")}</strong>
      ${a.status === "reverted" ? html`<${Pill}>Reverted<//>` : a.needsPartner ? approved ? html`<${Pill} tone="good">Partner approved<//>` : html`<${Pill} tone="warn">Needs partner<//>` : html`<${Pill} tone="good">Within preparer authority<//>`}
      ${a.layer !== "original" && html`<${Pill} tone="info">Amendment<//>`}</div>
    <div class="muted small">By <${Who} id=${a.actor} /> <${When} at=${a.at} /> · ${a.reason}</div>
    <div class="adj-lines">${(a.lines || []).map((l) => html`<span class="chip"><code>${l.key}</code> ${l.text ? "" : html`<${Money} v=${l.from} strike /> → <${Money} v=${l.to} />`}</span>`)}</div>
    <div class="adj-eff num">Fed ${signed(a.netFed)} · CA ${signed(a.netCa)}</div>
    <div class="row gap">
      ${a.status === "active" && a.needsPartner && !approved && html`<${Btn} small disabled=${!app.can("adjust_approve") || a.actor === app.actor.id} title=${a.actor === app.actor.id ? "You may not approve your own adjustment" : app.why("adjust_approve")} onClick=${() => app.act("adjust_approve", a.id, { adj: a.id })}>Approve<//>`}
      ${a.status === "active" && html`<${Btn} small disabled=${!app.can("adjust_revert")} onClick=${() => app.act("adjust_revert", a.id, { adj: a.id, reason: "Reverted" })}>Revert<//>`}
      ${a.revertReason && html`<span class="muted small">Reverted by <${Who} id=${a.revertedBy} /> <${When} at=${a.revertedAt} /></span>`}
    </div>
  </div>`;
  }
  function AssetPanel({ id }) {
    const app = useApp();
    const pa = app.M.P.prior_years.asset_records.find((a) => a.asset_id === id);
    const va = app.V.assets.get(id);
    return html`<div class="panel"><div class="ph-row"><span class="key">${id}</span></div><h2 class="ph">${pa?.description || va?.description}</h2>
    <${AssetTable} pa=${pa} va=${va} />
    <${Annotations} target=${"asset:" + id} /></div>`;
  }
  function AssetTable({ pa, va }) {
    const a = va || pa;
    const years = /* @__PURE__ */ new Set([...Object.keys(pa?.federal || {}), ...Object.keys(pa?.california || {})]);
    const rows = [...years].sort().map((y) => ({ y, f: pa.federal[y] || 0, c: pa.california[y] || 0 }));
    return html`<div class="kv">
      <div><span class="k">Activity</span><span>${a.activity}</span></div>
      <div><span class="k">Cost</span><span class="num">${fmt(a.cost)}${a.land_value || a.land_value_not_depreciated ? ` (land ${fmt(a.land_value || a.land_value_not_depreciated)} not depreciated)` : ""}</span></div>
      <div><span class="k">In service</span><span>${a.placed_in_service} · ${a.method} · ${a.life_years} yrs</span></div>
      ${a.disposed && html`<div><span class="k">Disposed</span><span>${typeof a.disposed === "string" ? a.disposed : JSON.stringify(a.disposed)}</span></div>`}
    </div>
    <table class="t t-tight"><thead><tr><th>Year</th><th class="r">Federal</th><th class="r">California</th></tr></thead><tbody>
    ${rows.map((r) => html`<tr><td>${r.y}</td><td class="r num">${fmt(r.f, { cents: true })}</td><td class="r num">${fmt(r.c, { cents: true })}</td></tr>`)}
    ${va && html`<tr class="tot"><td>2025</td><td class="r num">${fmt(va.federal?.depreciation ?? va.federal?.["2025"] ?? 0, { cents: true })}</td><td class="r num">${fmt(va.california?.depreciation ?? 0, { cents: true })}</td></tr>`}
    </tbody></table>
    ${va && html`<pre class="dump small">${JSON.stringify({ federal: va.federal, california: va.california, amt: va.amt, disposed: va.disposed }, null, 1)}</pre>`}`;
  }
  function ClientItemPanel({ res }) {
    const it = res.item;
    return html`<div class="panel"><div class="ph-row"><span class="key">${res.id}</span><${Pill}>${res.kind === "qa" ? "Questionnaire" : res.kind === "msg" ? "Client message" : "Call notes"}<//></div>
    <h2 class="ph">${res.kind === "qa" ? it.question : res.label}</h2>
    ${res.kind === "call" ? html`<ul class="bul">${it.notes.map((n) => html`<li>${n}</li>`)}</ul><p class="muted small">${it.participants.join(", ")} · ${it.date.slice(0, 10)}</p>` : html`<blockquote class="quote">${res.value}</blockquote><p class="muted small">${it.answered_by || it.from} · ${(it.answered_at || it.sent_at).slice(0, 10)}</p>`}
    <${Annotations} target=${res.id} /></div>`;
  }
  function PersonPanel({ res }) {
    const app = useApp();
    const p = res.person;
    const ovr = app.S.householdOverrides;
    const ssn = ovr.get(`${p.id}.ssn`) || p.ssn;
    const show = app.revealed.has("household:" + p.id);
    return html`<div class="panel"><div class="ph-row"><span class="key">${res.id}</span><${Pill}>${p.role}<//></div><h2 class="ph">${p.name}</h2>
    <div class="kv">
      <div><span class="k">SSN</span><span class="num">${show ? ssn : maskText(ssn, false)} ${ovr.has(`${p.id}.ssn`) && html`<${Pill} tone="accent">Corrected<//>`}</span></div>
      <div><span class="k">Date of birth</span><span>${p.dob}</span></div>
      ${p.relationship && html`<div><span class="k">Relationship</span><span>${p.relationship} · ${p.months_lived_with_you} months${p.full_time_student ? " \xB7 full-time student" : ""}</span></div>`}
      ${p.note && html`<div><span class="k">Note</span><span>${p.note}</span></div>`}
    </div>
    ${!show && app.actor.clearance && html`<${Btn} small onClick=${() => app.reveal("household:" + p.id, "SSN of " + p.name)}>Show SSN (logged)<//>`}
    ${!app.actor.clearance && html`<p class="muted small">Masked: no sensitive-data clearance.</p>`}
    <${Annotations} target=${res.id} /></div>`;
  }
  function QuestionPanel({ id }) {
    const app = useApp();
    const q = app.S.questions.get(id);
    if (!q) return html`<${Empty}>Question not found.<//>`;
    return html`<div class="panel"><h2 class="ph">${q.text}</h2><p class="muted small">Asked by <${Who} id=${q.actor} /> <${When} at=${q.at} /> to ${q.to === "client" ? "the client" : html`<${Who} id=${q.to} />`} about <${Ref} r=${q.target} /></p>
    ${q.answers.map((a) => html`<blockquote class="quote">${a.text}<footer><${Who} id=${a.actor} /> <${When} at=${a.at} /></footer></blockquote>`)}
    <${AnswerBox} q=${q} /></div>`;
  }
  function AnswerBox({ q }) {
    const app = useApp();
    const [t, setT] = useState("");
    const mayAnswer = q.to === "client" ? app.actor.role === "client" : q.to === app.actor.id || app.can("answer");
    if (!mayAnswer) return html`<p class="muted small">${q.to === "client" ? "Waiting for the client to answer." : "Waiting for an answer."}</p>`;
    return html`<div class="row gap"><input class="in grow" aria-label="Answer" value=${t} onInput=${(e) => setT(e.target.value)} placeholder="Type the answer" /><${Btn} kind="primary" disabled=${!t} onClick=${() => {
      app.act("answer", q.target, { question: q.id, text: t });
      setT("");
    }}>Answer<//></div>`;
  }
  function AreaRefPanel({ id }) {
    return html`<div class="panel"><h2 class="ph">${areaName(id)}</h2><${Annotations} target=${"area:" + id} /></div>`;
  }
  function Annotations({ target, line }) {
    const app = useApp();
    const { S } = app;
    const ver = S.verifications.filter((v) => v.target === target);
    const notes = S.notes.filter((n) => n.target === target);
    const rnotes = [...S.reviewNotes.values()].filter((n) => n.target === target);
    const qs = [...S.questions.values()].filter((q) => q.target === target);
    const atts = S.attachments.filter((a) => a.target === target);
    const decs = S.decisions.filter((d) => d.target === target);
    const adjs = [...S.adjustments.values()].filter((a) => a.lines?.some((l) => l.key === target));
    const [mode, setMode] = useState(null);
    return html`<div class="annot">
    ${adjs.length > 0 && html`<div class="blk"><h4>Adjustments</h4>${adjs.map((a) => html`<${AdjRow} a=${a} />`)}</div>`}
    ${ver.length > 0 && html`<div class="blk"><h4>Verified</h4><ul class="log">${ver.map((v) => html`<li><${Tick} method=${v.method} /> ${TICK_LABEL[v.method] || v.method} — <${Who} id=${v.actor} /> <${When} at=${v.at} />${v.note && html`<div class="muted small">${v.note}</div>`}${v.evidence?.length > 0 && html`<div class="chips">${v.evidence.map((r) => html`<${Ref} r=${r} />`)}</div>`}</li>`)}</ul></div>`}
    ${rnotes.length > 0 && html`<div class="blk"><h4>Review notes</h4>${rnotes.map((n) => html`<${ReviewNoteCard} n=${n} />`)}</div>`}
    ${qs.length > 0 && html`<div class="blk"><h4>Questions</h4>${qs.map((q) => html`<div class="qcard"><div><strong>${q.text}</strong> <span class="muted small">to ${q.to === "client" ? "client" : app.actorById.get(q.to)?.name}</span></div>${q.answers.map((a) => html`<blockquote class="quote">${a.text}<footer><${Who} id=${a.actor} /> <${When} at=${a.at} /></footer></blockquote>`)}${!q.answers.length && html`<${AnswerBox} q=${q} />`}</div>`)}</div>`}
    ${decs.length > 0 && html`<div class="blk"><h4>Decisions</h4>${decs.map((d) => html`<div class="qcard"><${Pill} tone="info">${d.kind}<//> <strong>${d.conclusion}</strong><div class="muted small">Authority: ${d.authority} — <${Who} id=${d.actor} /> <${When} at=${d.at} /></div></div>`)}</div>`}
    ${atts.length > 0 && html`<div class="blk"><h4>Attached evidence</h4><ul class="log">${atts.map((a) => html`<li>📎 ${a.url || a.dataUrl ? html`<a href=${a.url || a.dataUrl} target="_blank" rel="noopener">${a.name}</a>` : a.name} <span class="muted small">${a.kind || ""} ${a.size ? Math.round(a.size / 1024) + " KB" : ""}</span> — <${Who} id=${a.actor} /> <${When} at=${a.at} />${a.note && html`<div class="muted small">${a.note}</div>`}</li>`)}</ul></div>`}
    ${notes.length > 0 && html`<div class="blk"><h4>Notes</h4><ul class="log">${notes.map((n) => html`<li>${n.text} — <${Who} id=${n.actor} /> <${When} at=${n.at} /></li>`)}</ul></div>`}
    <div class="blk actions">
      <${Btn} small disabled=${!app.can("verify")} title=${app.why("verify")} onClick=${() => setMode("verify")}>Verify<//>
      ${line && typeof line.value === "number" && html`<${Btn} small disabled=${!app.can("adjust")} title=${app.why("adjust")} onClick=${() => setMode("adjust")}>Adjust<//>`}
      <${Btn} small disabled=${!app.can("note")} onClick=${() => setMode("note")}>Note<//>
      <${Btn} small disabled=${!app.can("review_note")} title=${app.why("review_note")} onClick=${() => setMode("review")}>Review note<//>
      <${Btn} small disabled=${!app.can("question")} title=${app.why("question")} onClick=${() => setMode("question")}>Ask<//>
      <${Btn} small disabled=${!app.can("decision")} title=${app.why("decision")} onClick=${() => setMode("decision")}>Record decision<//>
      <${Btn} small disabled=${!app.can("attach")} onClick=${() => setMode("attach")}>Attach<//>
    </div>
    ${mode && html`<${ActionForm} mode=${mode} target=${target} line=${line} done=${() => setMode(null)} />`}
  </div>`;
  }
  function ReviewNoteCard({ n }) {
    const app = useApp();
    const [t, setT] = useState("");
    return html`<div class=${cx("rn", n.resolved ? "rn-done" : n.blocking && "rn-block")}>
    <div class="rn-h">${n.resolved ? html`<${Pill} tone="good">Cleared<//>` : n.blocking ? html`<${Pill} tone="bad">Blocks filing<//>` : html`<${Pill} tone="warn">Open<//>`} <strong>${n.text}</strong></div>
    <div class="muted small"><${Who} id=${n.actor} /> <${When} at=${n.at} /> on <${Ref} r=${n.target} /></div>
    ${n.replies.map((r) => html`<div class="rn-reply">${r.text}<span class="muted small"> — <${Who} id=${r.actor} /> <${When} at=${r.at} /></span></div>`)}
    ${!n.resolved && html`<div class="row gap">
      <input class="in grow" aria-label="Reply" value=${t} onInput=${(e) => setT(e.target.value)} placeholder="Reply" />
      <${Btn} small disabled=${!t || !app.can("review_reply")} onClick=${() => {
      app.act("review_reply", n.target, { note: n.id, text: t });
      setT("");
    }}>Reply<//>
      <${Btn} small disabled=${!app.can("review_resolve") || app.actor.id !== n.actor} title=${app.actor.id !== n.actor ? "Only the person who opened the note may clear it" : ""} onClick=${() => app.act("review_resolve", n.target, { note: n.id, text: t })}>Clear<//>
    </div>`}
  </div>`;
  }
  var CATS = ["wages", "interest", "schc_profit", "stcg", "ltcg", "ordinary_income", "adjustment", "salt", "itemized", "ca_source_income"];
  function ActionForm({ mode, target, line, done }) {
    const app = useApp();
    const methods = app.S.standards.verification_types;
    const [f, setF] = useState({ method: methods[0], text: "", blocking: true, to: "client", to_value: line?.value ?? "", cat: guessCat(target), kind: "judgment", authority: "", evidence: "" });
    const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
    const submit = (e) => {
      e.preventDefault();
      const ev = f.evidence ? f.evidence.split(/[ ,]+/).filter(Boolean) : [];
      if (mode === "verify") app.act("verify", target, { method: f.method, note: f.text, evidence: ev });
      if (mode === "note") app.act("note", target, { text: f.text });
      if (mode === "review") app.act("review_note", target, { text: f.text, blocking: f.blocking });
      if (mode === "question") app.act("question", target, { to: f.to, text: f.text });
      if (mode === "decision") app.act("decision", target, { kind: f.kind, topic: target, conclusion: f.text, authority: f.authority });
      if (mode === "adjust") {
        const to = parseFloat(f.to_value);
        const delta2 = to - line.value;
        const eff = effectOf(app.V, f.cat, delta2);
        app.act("adjust", target, { title: `${target}: manual adjustment`, lines: [{ key: target, from: line.value, to }], effects: [eff], reason: f.text, category: f.cat, area: areaOfLine(target) });
      }
      done();
    };
    const staffOpts = app.actors.filter((a) => a.role !== "client" && a.id !== app.actor.id);
    const delta = mode === "adjust" ? (parseFloat(f.to_value) || 0) - (line?.value || 0) : 0;
    const preview = mode === "adjust" ? effectOf(app.V, f.cat, delta) : null;
    return html`<form class="aform" onSubmit=${submit}>
    ${mode === "verify" && html`<label>Method<select value=${f.method} onChange=${set("method")}>${methods.map((m) => html`<option value=${m}>${TICK_LABEL[m] || m}</option>`)}</select></label>`}
    ${mode === "adjust" && html`<label>New value<input class="in num" type="number" step="any" value=${f.to_value} onInput=${set("to_value")} required /></label>
      <label>Tax-effect category<select value=${f.cat} onChange=${set("cat")}>${CATS.map((c) => html`<option value=${c}>${c}</option>`)}</select></label>
      <p class="small">Change ${signed(delta)} → estimated federal ${signed(preview.tax_fed)}, California ${signed(preview.tax_ca)} <span class="muted">(${preview.basis})</span></p>`}
    ${mode === "question" && html`<label>To<select value=${f.to} onChange=${set("to")}><option value="client">Client (Ngozi & Erik)</option>${staffOpts.map((a) => html`<option value=${a.id}>${a.name} (${a.role})</option>`)}</select></label>`}
    ${mode === "decision" && html`<label>Kind<select value=${f.kind} onChange=${set("kind")}><option value="judgment">Judgment call</option><option value="election">Election</option><option value="due_diligence">Due diligence</option><option value="penalty">Penalty decision</option></select></label>`}
    ${mode === "attach" ? html`<${AttachForm} target=${target} done=${done} />` : html`
    <label>${mode === "adjust" ? "Why (kept with the original)" : mode === "decision" ? "Conclusion" : mode === "verify" ? "What you checked" : "Text"}<textarea class="in" rows="3" value=${f.text} onInput=${set("text")} required=${mode !== "verify"}></textarea></label>
    ${mode === "decision" && html`<label>Authority relied on (required)<input class="in" value=${f.authority} onInput=${set("authority")} required placeholder="e.g. Treas. Reg. §1.263(a)-3" /></label>`}
    ${mode === "verify" && html`<label>Evidence references (optional)<input class="in" value=${f.evidence} onInput=${set("evidence")} placeholder="ev-0016 D08 msg-07" /></label>`}
    ${mode === "review" && html`<label class="chk"><input type="checkbox" checked=${f.blocking} onChange=${set("blocking")} /> Blocks filing until cleared</label>`}
    <div class="row gap"><${Btn} kind="primary" type="submit">Save<//><${Btn} onClick=${done}>Cancel<//></div>`}
  </form>`;
  }
  function guessCat(k) {
    if (/^F1040\.1|SchCA540NR\.1\./.test(k)) return /\.E$/.test(k) ? "ca_source_income" : "wages";
    if (/^SchB\.1/.test(k)) return "interest";
    if (/^SchC/.test(k)) return "schc_profit";
    if (/^F8949\.[ABCH]/.test(k)) return "stcg";
    if (/^F8949|SchD/.test(k)) return "ltcg";
    if (/^Sch1\.1[3-7]/.test(k)) return "adjustment";
    if (/^SchA\.5/.test(k)) return "salt";
    if (/^SchA|F8283/.test(k)) return "itemized";
    return "ordinary_income";
  }
  function AttachForm({ target, done }) {
    const app = useApp();
    const [note, setNote] = useState("");
    const [busy, setBusy] = useState(false);
    const onFile = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setBusy(true);
      let url = null, dataUrl = null;
      try {
        const assets = window.claude?.use ? await window.claude.use("assets") : null;
        if (assets) {
          const r = await assets.upload(file);
          url = r.url;
        }
      } catch {
      }
      if (!url && file.size < 4e5) dataUrl = await new Promise((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.readAsDataURL(file);
      });
      app.act("attach", target, { name: file.name, size: file.size, kind: file.type, url, dataUrl, note, stored: url ? "asset store" : dataUrl ? "inline" : "name only (file too large for browser storage)" });
      setBusy(false);
      done();
    };
    const addMsg = () => {
      app.act("attach", target, { name: "Note / message", kind: "text", note });
      done();
    };
    return html`<div class="aform">
    <label>Description<input class="in" value=${note} onInput=${(e) => setNote(e.target.value)} placeholder="e.g. 2021 bank statement showing payment to CryptoNorth" /></label>
    <label>File<input type="file" onChange=${onFile} disabled=${busy} /></label>
    <div class="row gap"><${Btn} onClick=${addMsg} disabled=${!note}>Attach as text note<//><${Btn} onClick=${done}>Cancel<//></div>
  </div>`;
  }

  // src/ui/views1.js
  function Overview() {
    const app = useApp();
    const { V, S, fr, M } = app;
    const py = M.py.lines;
    const steps = requiredSteps(app);
    const blockers = filingBlockers(app, S);
    const openF = app.findings.filter((f) => (S.findingStatus.get(f.id)?.status || "open") === "open");
    const errs = openF.filter((f) => ["engine_error", "extraction_error", "client_conflict"].includes(f.kind));
    const rows = [
      ["Adjusted gross income", "F1040.11", py["F1040.11"], V.summary.federal.agi, null],
      ["Taxable income", "F1040.15", py["F1040.15"], V.summary.federal.taxable_income, null],
      ["Total tax", "F1040.24", py["F1040.24"], V.summary.federal.total_tax, fr.federal.total_tax],
      ["Total payments", "F1040.33", py["F1040.33"], V.summary.federal.payments, fr.federal.payments],
      ["Balance due / (refund)", "F1040.37", -(py["F1040.34"] || 0), V.summary.federal.balance_due, fr.federal.balance_due]
    ];
    const carows = [
      ["California AGI", "F540NR.32", py["CA540.17"], V.summary.california.ca_agi, null],
      ["Total tax", "F540NR.64", py["CA540.64"], V.summary.california.total_tax, fr.california.total_tax],
      ["Payments", "F540NR.78", (py["CA540.71"] || 0) + (py["CA540.72"] || 0), V.summary.california.payments, fr.california.payments],
      ["Balance due / (refund)", "F540NR.97", py["CA540.111"], V.summary.california.balance_due, fr.california.balance_due]
    ];
    const hasAdj = [...S.adjustments.values()].some((a) => a.status === "active");
    const sumTable = (title, rs, note) => html`<div class="tw"><table class="t sumt"><caption>${title}</caption><thead><tr><th></th><th class="r">2024 filed</th><th class="r">Engine ${V.version}</th><th class="r">Working</th><th class="r">Change vs ${V.version}</th></tr></thead><tbody>
    ${rs.map(([lab, k, a, b, c]) => html`<tr><td><${Ref} r=${k} plain>${lab}<//></td><td class="r"><${Money} v=${a} /></td><td class="r"><${Money} v=${b} /></td><td class="r strong">${c === null && hasAdj ? html`<span class="muted small" title="Engine recompute needed for AGI and taxable income">recompute</span>` : html`<${Money} v=${c ?? b} />`}</td><td class="r num">${c !== null && c !== b ? signed(c - b) : ""}</td></tr>`)}
  </tbody></table></div>${note && html`<p class="muted small">${note}</p>`}`;
    return html`<div class="view">
    <div class="hero">
      <div>
        <p class="eyebrow">2025 · Form 1040 MFJ + California 540NR (part-year) · client CL-20417</p>
        <h1>Okafor-Lindqvist household</h1>
        <p class="muted">Moved Sacramento → Austin on 07/15/2025. New preparer this year (prior: Delta River Tax Services). Engine version <strong>${V.version}</strong> computed ${V.computed_at.slice(0, 10)}: ${V.trigger}</p>
      </div>
      <div class="hero-nums">
        <div class="hn"><span class="k">Federal ${fr.federal.balance_due >= 0 ? "balance due" : "refund"}</span><span class="big num">${fmt(Math.abs(Math.round(fr.federal.balance_due)))}</span><span class="muted small">engine ${V.version}: ${V.summary.federal.balance_due >= 0 ? "due" : "refund"} ${fmt(Math.abs(V.summary.federal.balance_due))}</span></div>
        <div class="hn"><span class="k">California ${fr.california.balance_due >= 0 ? "balance due" : "refund"}</span><span class="big num">${fmt(Math.abs(Math.round(fr.california.balance_due)))}</span><span class="muted small">engine ${V.version}: ${V.summary.california.balance_due >= 0 ? "due" : "refund"} ${fmt(Math.abs(V.summary.california.balance_due))}</span></div>
      </div>
    </div>
    ${S.frozen && html`<div class="banner banner-info">Filed and frozen <${When} at=${S.frozen.at} />. ${S.amendment ? "Amendment open: new adjustments are recorded on the amendment layer." : "Changes need an amendment (Filing)."}</div>`}
    <div class="grid2">
      <${Section} title="Return summary vs last year" sub="Working = engine numbers plus recorded adjustments, using the engine's per-dollar tax-effect rates until the engine recomputes.">
        ${sumTable("Federal", rows)}
        ${sumTable("California (540NR)", carows, "The 2024 column is the 2024 Form 540 (full-year resident).")}
      <//>
      <${Section} title="What stands between this return and filing">
        ${blockers.length ? html`<ul class="todo">${blockers.map((b) => html`<li><button class="linkish" onClick=${() => app.go(b.go)}>${b.label}</button></li>`)}</ul>` : html`<p class="good">Nothing blocks filing.</p>`}
        <div class="stats">
          <button class="stat" onClick=${() => app.go("findings")}><span class="num big">${errs.length}</span><span>open errors</span></button>
          <button class="stat" onClick=${() => app.go("findings")}><span class="num big">${openF.length - errs.length}</span><span>open judgment & outside items</span></button>
          <button class="stat" onClick=${() => app.go("adjustments")}><span class="num big">${[...S.adjustments.values()].filter((a) => a.status === "active").length}</span><span>adjustments</span></button>
          <button class="stat" onClick=${() => app.go("review")}><span class="num big">${[...S.reviewNotes.values()].filter((n) => !n.resolved).length}</span><span>open review notes</span></button>
        </div>
      <//>
    </div>
    <${Section} title="Required steps" sub="Firm standard checklist. Each step's status is computed from the evidence, not ticked by hand.">
      <ol class="steps">${steps.map((s) => html`<li class=${s.ok ? "ok" : ""}><span class="stp">${s.ok ? "\u2713" : "\u25CB"}</span><div><strong>${s.step}</strong><div class="muted small">${s.detail}</div></div><button class="btn btn-sm" onClick=${() => app.go(s.go)}>Open</button></li>`)}</ol>
    <//>
    <${Section} title="Areas" sub="Each area has its own sign-offs, budget and open items.">
      <div class="areas">${AREAS.map((a) => html`<${AreaCard} a=${a} />`)}</div>
    <//>
  </div>`;
  }
  function AreaCard({ a }) {
    const app = useApp();
    const { V, S, eff } = app;
    const so = signoffState(V, S, eff, a.id);
    const open = app.findings.filter((f) => f.area === a.id && (S.findingStatus.get(f.id)?.status || "open") === "open");
    const spent = S.time.filter((t) => t.area === a.id).reduce((s, t) => s + +t.hours, 0);
    const budget = app.M.P.firm.budget_hours[a.id];
    const lv = (x, l, ab) => html`<span class=${cx("so", x ? x.fresh ? "so-ok" : "so-stale" : "so-none")} title=${x ? `${l}: ${app.actorById.get(x.actor)?.name} ${x.at.slice(0, 10)}${x.fresh ? "" : " \u2014 reopened, changed since signing"}` : `${l}: not signed`}>${ab}</span>`;
    return html`<button class="acard" onClick=${() => app.go("area:" + a.id)}>
    <div class="acard-h"><strong>${a.name}</strong><span class="sos">${lv(so.preparer, "Preparer", "P")}${lv(so.reviewer, "Reviewer", "R")}${lv(so.partner, "Partner", "Pt")}</span></div>
    <div class="muted small">${open.length ? `${open.length} open item${open.length > 1 ? "s" : ""}` : "No open items"}</div>
    ${budget !== void 0 && html`<div class="row gap small"><${Bar} value=${spent} max=${budget} tone=${spent > budget ? "bad" : "accent"} /><span class="num">${spent.toFixed(1)} / ${budget} h</span></div>`}
  </button>`;
  }
  function AreaView({ id }) {
    const app = useApp();
    const { V, S, eff } = app;
    const so = signoffState(V, S, eff, id);
    const lines = V.lines.filter((l) => areaOfLine(l.key) === id && !(l.form === "F8949" && !l.key.endsWith("total") && !l.key.endsWith("SCORP")));
    const docs = [...app.M.docs.values()].filter((d) => areaOfDoc(d) === id && d.received_at <= app.clock);
    const fs = app.findings.filter((f) => f.area === id);
    const [hrs, setHrs] = useState("");
    const sign = (level) => app.act("signoff", "area:" + id, { area: id, level, fingerprint: so.fp, snapshot: lines.map((l) => [l.key, eff.over.get(l.key)?.to ?? l.value]) });
    return html`<div class="view">
    <p class="eyebrow">Area</p><h1>${areaName(id)}</h1>
    <${Section} title="Sign-offs" sub="A sign-off records a fingerprint of every number, adjustment and approval in the area. Any later change reopens it.">
      <div class="signs">${["preparer", "reviewer", "partner"].map((lvl) => {
      const x = so[lvl];
      return html`<div class=${cx("sign", x && (x.fresh ? "sign-ok" : "sign-stale"))}>
        <div class="k">${lvl}</div>
        ${x ? html`<div><${Who} id=${x.actor} /> <${When} at=${x.at} /></div><div class="small">${x.fresh ? "Current" : "Reopened: changed since signing"}</div>` : html`<div class="muted">Not signed</div>`}
        <${Btn} small disabled=${!app.can("signoff:" + lvl) || x && x.fresh} title=${app.why("signoff:" + lvl)} onClick=${() => sign(lvl)}>${x && !x.fresh ? "Re-sign" : "Sign off"}<//>
      </div>`;
    })}</div>
    <//>
    ${fs.length > 0 && html`<${Section} title="Findings"><${FindingTable} list=${fs} /><//>`}
    ${lines.length > 0 && html`<${Section} title=${`Return lines (${lines.length})`}><${LineTable} lines=${lines} /><//>`}
    ${docs.length > 0 && html`<${Section} title=${`Documents (${docs.length})`}><${DocTable} docs=${docs} /><//>`}
    <${Section} title="Time" sub=${`Budget ${app.M.P.firm.budget_hours[id] ?? "\u2014"} h`}>
      <ul class="log">${S.time.filter((t) => t.area === id).map((t) => html`<li><span class="num">${t.hours} h</span> ${t.note} — <${Who} id=${t.actor} /> <${When} at=${t.at} /></li>`)}</ul>
      <div class="row gap"><input class="in num" style="width:6rem" type="number" step="0.25" min="0" aria-label="Hours" value=${hrs} onInput=${(e) => setHrs(e.target.value)} placeholder="Hours" /><${Btn} small disabled=${!hrs || !app.can("time")} onClick=${() => {
      app.act("time", "area:" + id, { area: id, hours: +hrs, note: "Work on " + areaName(id) });
      setHrs("");
    }}>Log time<//></div>
    <//>
  </div>`;
  }
  var FORM_NAMES = { F1040: "Form 1040", Sch1: "Schedule 1", Sch2: "Schedule 2", Sch3: "Schedule 3", SchA: "Schedule A", SchB: "Schedule B", SchC: "Schedule C", SchD: "Schedule D", SchE: "Schedule E", SchSE: "Schedule SE", F8949: "Form 8949 (totals)", F4797: "Form 4797", "F4562-C": "Form 4562 (Sch C)", "F4562-E": "Form 4562 (rentals)", F8582: "Form 8582", F6251: "Form 6251", F8959: "Form 8959", F8960: "Form 8960", F8995: "Form 8995-A", F8812: "Schedule 8812", F8863: "Form 8863", F2441: "Form 2441", F8889: "Form 8889", F8606: "Form 8606", F8283: "Form 8283", F7203: "Form 7203", F8938: "Form 8938", F2210: "Form 2210", F8867: "Form 8867", SchCA540NR: "Schedule CA (540NR)", F540NR: "Form 540NR", ScheduleS: "Schedule S", FTB3885A: "FTB 3885A", FTB5805: "FTB 5805" };
  function ReturnView() {
    const app = useApp();
    const { V } = app;
    const [q, setQ] = useState("");
    const [onlyAdj, setOnlyAdj] = useState(false);
    const forms = useMemo(() => {
      const m = /* @__PURE__ */ new Map();
      for (const l of V.lines) {
        if (l.form === "F8949" && !l.key.endsWith("total")) continue;
        (m.get(l.form) || m.set(l.form, []).get(l.form)).push(l);
      }
      return m;
    }, [V]);
    const [form, setForm] = useState("F1040");
    const ql = q.toLowerCase();
    const list = q ? V.lines.filter((l) => (l.key + " " + l.label).toLowerCase().includes(ql)) : forms.get(form) || [];
    const shown = onlyAdj ? list.filter((l) => app.eff.over.has(l.key) || app.eff.affected.has(l.key)) : list;
    return html`<div class="view">
    <p class="eyebrow">Tax computation · engine ${V.version}</p><h1>Return</h1>
    <div class="toolbar"><input class="in" type="search" aria-label="Filter lines" placeholder="Filter lines by key or label" value=${q} onInput=${(e) => setQ(e.target.value)} />
      <label class="chk"><input type="checkbox" checked=${onlyAdj} onChange=${(e) => setOnlyAdj(e.target.checked)} /> Adjusted or affected only</label></div>
    <div class="split">
      ${!q && html`<nav class="formnav" aria-label="Forms">${[...forms.keys()].map((f) => html`<button class=${cx("fn", f === form && "cur")} onClick=${() => setForm(f)}>${FORM_NAMES[f] || f}<span class="muted small">${forms.get(f).length}</span></button>`)}</nav>`}
      <div class="grow minw0"><${LineTable} lines=${shown} /></div>
    </div>
  </div>`;
  }
  function LineTable({ lines }) {
    const app = useApp();
    const { eff, S, M } = app;
    if (!lines.length) return html`<${Empty}>No lines.<//>`;
    return html`<div class="tw"><table class="t lines"><thead><tr><th>Line</th><th>Description</th><th class="r">2024</th><th class="r">Amount</th><th>Evidence</th></tr></thead><tbody>
    ${lines.map((l) => {
      const ov = eff.over.get(l.key);
      const ver = S.verifications.filter((v) => v.target === l.key);
      const fl = app.findingByLine.get(l.key);
      const rn = [...S.reviewNotes.values()].filter((n) => n.target === l.key && !n.resolved);
      const pv = M.py.lines[l.key];
      return html`<tr class=${cx("click", ov && "row-adj", fl && "row-flag")} onClick=${() => app.open(l.key)}>
        <td class="key">${l.key}</td><td>${l.label}${eff.affected.has(l.key) && html` <${Pill} tone="warn" title="Recompute pending">recalc<//>`}</td>
        <td class="r muted"><${Money} v=${pv} /></td>
        <td class="r">${ov ? html`<${Money} v=${l.value} strike /> <${Money} v=${ov.to} className="strong" />` : html`<${Money} v=${l.value} />`}</td>
        <td class="ev">${ver.map((v) => html`<${Tick} method=${v.method} />`)}${fl && html`<${Pill} tone=${KIND_TONE[fl.kind]}>${fl.id}<//>`}${rn.length > 0 && html`<${Pill} tone="bad">RN<//>`}${!ver.length && !l.sources?.length && !l.inputs?.length && html`<span class="muted small">no source</span>`}</td>
      </tr>`;
    })}
  </tbody></table></div>`;
  }
  function DocumentsView() {
    const app = useApp();
    const [filter, setFilter] = useState("all");
    const docs = [...app.M.docs.values()].filter((d) => d.received_at <= app.clock);
    const notYet = app.M.docs.size - docs.length;
    const withStatus = docs.map((d) => ({ d, st: app.M.docStatus(app.V, d) }));
    const counts = withStatus.reduce((m, x) => (m[x.st.code] = (m[x.st.code] || 0) + 1, m), {});
    const shown = filter === "all" ? withStatus : withStatus.filter((x) => x.st.code === filter);
    return html`<div class="view">
    <p class="eyebrow">Document index · completeness</p><h1>Documents</h1>
    <p class="muted">${docs.length} received${notYet ? `, ${notYet} not yet received at this point in the season` : ""}. Every document shows where it landed on the return, or why it did not.</p>
    <div class="toolbar">${["all", "landed", "support", "reference", "superseded", "duplicate", "not_used"].map((k) => html`<button class=${cx("tab", filter === k && "cur")} onClick=${() => setFilter(k)}>${{ all: "All", landed: "On return", support: "Support only", reference: "Reference", superseded: "Superseded", duplicate: "Duplicate", not_used: "Not in version" }[k]} <span class="muted">${k === "all" ? docs.length : counts[k] || 0}</span></button>`)}</div>
    <${DocTable} docs=${shown.map((x) => x.d)} />
  </div>`;
  }
  function DocTable({ docs }) {
    const app = useApp();
    return html`<div class="tw"><table class="t"><thead><tr><th>Doc</th><th>Title</th><th>Received</th><th>Status</th><th>Lands on</th><th></th></tr></thead><tbody>
    ${docs.map((d) => {
      const st = app.M.docStatus(app.V, d);
      const land = st.landing ? [...st.landing.keys()] : [];
      const fl = app.findings.filter((f) => f.evidence?.some((x) => x === d.id || app.M.evs.get(x)?.document_id === d.id || x.startsWith(`doc:${d.id}#`)));
      const ver = app.S.verifications.some((v) => v.target === d.id);
      return html`<tr class="click" onClick=${() => app.open(d.id)}>
      <td class="key">${d.id}</td><td>${d.title}${d.marked_corrected ? html` <${Pill} tone="warn">corrected<//>` : ""}${d.extraction.status === "partial" ? html` <${Pill} tone="bad">partly read<//>` : ""}</td>
      <td class="small">${d.received_at.slice(0, 10)}</td>
      <td><${Pill} tone=${st.code === "landed" ? "good" : st.code === "not_used" ? "warn" : "neutral"}>${st.label}<//></td>
      <td class="small">${land.slice(0, 3).join(", ")}${land.length > 3 ? ` +${land.length - 3}` : ""}</td>
      <td>${ver && html`<${Tick} method="agreed_to_source_document" />`}${fl.slice(0, 2).map((f) => html`<${Pill} tone=${KIND_TONE[f.kind]}>${f.id}<//>`)}</td></tr>`;
    })}
  </tbody></table></div>`;
  }
  function FindingsView() {
    const app = useApp();
    const [kind, setKind] = useState("all");
    const [sel, setSel] = useState(/* @__PURE__ */ new Set());
    const [showRc, setShowRc] = useState(false);
    const list = app.findings.filter((f) => kind === "all" || f.kind === kind);
    const byKind = app.findings.reduce((m, f) => (m[f.kind] = (m[f.kind] || 0) + 1, m), {});
    const applicable = [...sel].map((id) => app.findings.find((f) => f.id === id)).filter((f) => f?.proposal && (app.S.findingStatus.get(f.id)?.status || "open") === "open");
    return html`<div class="view">
    <p class="eyebrow">Checks that don't trust the engine</p><h1>Findings</h1>
    <p class="muted">${app.findings.length} findings from independent checks of documents, agency records, client answers and the prior year. ${app.recompute.filter((r) => r.agree).length} of ${app.recompute.length} independent recomputations agree with the engine.</p>
    <div class="toolbar">${["all", "engine_error", "extraction_error", "client_conflict", "judgment", "outside_filing"].map((k) => html`<button class=${cx("tab", kind === k && "cur")} onClick=${() => setKind(k)}>${k === "all" ? "All" : KIND_LABEL[k]} <span class="muted">${k === "all" ? app.findings.length : byKind[k] || 0}</span></button>`)}
      <span class="grow"></span>
      <${Btn} kind="primary" disabled=${!applicable.length || !app.can("adjust")} title=${app.why("adjust")} onClick=${() => {
      app.applyFindings(applicable);
      setSel(/* @__PURE__ */ new Set());
    }}>Apply ${applicable.length || ""} selected<//>
    </div>
    <${FindingTable} list=${list} sel=${sel} setSel=${setSel} />
    <${Section} title="Independent recomputations" right=${html`<${Btn} small onClick=${() => setShowRc(!showRc)}>${showRc ? "Hide" : "Show"}<//>`} sub="The workpaper recomputes these from source values and compares them with the engine.">
      ${showRc && html`<div class="tw"><table class="t"><thead><tr><th></th><th>Check</th><th class="r">Engine</th><th class="r">Independent</th><th>Refs</th></tr></thead><tbody>
      ${app.recompute.map((r) => html`<tr><td>${r.agree ? html`<${Pill} tone="good">agrees<//>` : html`<${Pill} tone="bad">differs<//>`}</td><td>${r.label}${r.note && html`<div class="muted small">${r.note}</div>`}</td><td class="r"><${Money} v=${r.engine} /></td><td class="r"><${Money} v=${r.independent} /></td><td class="chips">${(r.refs || []).slice(0, 4).map((x) => html`<${Ref} r=${x} />`)}</td></tr>`)}
      </tbody></table></div>`}
    <//>
  </div>`;
  }
  function FindingTable({ list, sel, setSel }) {
    const app = useApp();
    const toggle = (id) => {
      const s = new Set(sel);
      s.has(id) ? s.delete(id) : s.add(id);
      setSel(s);
    };
    return html`<div class="tw"><table class="t findings"><thead><tr>${sel && html`<th><input type="checkbox" aria-label="Select all" onChange=${(e) => setSel(e.target.checked ? new Set(list.map((f) => f.id)) : /* @__PURE__ */ new Set())} /></th>`}<th>Finding</th><th>Type</th><th class="r">Fed / CA</th><th>Status</th></tr></thead><tbody>
    ${list.map((f) => {
      const st = app.S.findingStatus.get(f.id)?.status || "open";
      const eff = (f.proposal?.effects || []).reduce((a, x) => ({ f: a.f + (x.tax_fed || 0) - (x.pay_fed || 0), c: a.c + (x.tax_ca || 0) - (x.pay_ca || 0) }), { f: 0, c: 0 });
      return html`<tr class=${cx("click", `sev-${f.severity}`)} onClick=${() => app.open(f.id)}>
      ${sel && html`<td onClick=${(e) => e.stopPropagation()}><input type="checkbox" aria-label=${"Select " + f.id} checked=${sel.has(f.id)} onChange=${() => toggle(f.id)} /></td>`}
      <td><strong>${f.title}</strong><div class="muted small clamp">${areaName(f.area)} · ${f.summary}</div></td>
      <td><${Pill} tone=${KIND_TONE[f.kind]}>${KIND_LABEL[f.kind]}<//></td>
      <td class="r num small">${f.proposal ? html`${signed(eff.f)}<br />${signed(eff.c)}` : ""}</td><td><${StatusPill} st=${st} /></td></tr>`;
    })}
  </tbody></table></div>`;
  }
  function AdjustmentsView() {
    const app = useApp();
    const adjs = [...app.S.adjustments.values()];
    const active = adjs.filter((a) => a.status === "active");
    const tot = active.reduce((s, a) => ({ f: s.f + a.netFed, c: s.c + a.netCa }), { f: 0, c: 0 });
    const batches = [...new Set(adjs.filter((a) => a.batch && a.actor === app.actor.id).map((a) => a.batch))];
    return html`<div class="view">
    <p class="eyebrow">Change ledger · originals are never overwritten</p><h1>Adjustments</h1>
    <div class="stats"><div class="stat"><span class="num big">${active.length}</span><span>active</span></div><div class="stat"><span class="num big">${signed(tot.f)}</span><span>federal effect on balance</span></div><div class="stat"><span class="num big">${signed(tot.c)}</span><span>California effect</span></div><div class="stat"><span class="num big">${active.filter((a) => a.needsPartner && !a.approvals.length).length}</span><span>awaiting partner</span></div></div>
    ${batches.length > 0 && html`<p class="small">Your batches: ${batches.map((b) => html`<${Btn} small onClick=${() => app.act("undo", null, { batch: b })}>Undo batch ${b.slice(-4)}<//> `)}</p>`}
    ${adjs.length ? adjs.slice().reverse().map((a) => html`<${AdjRow} a=${a} />`) : html`<${Empty}>No adjustments yet. Apply one from Findings, or use Adjust on any return line.<//>`}
  </div>`;
  }
  function VariancesView() {
    const app = useApp();
    const vs = variances(app.V, app.M.py, app.S);
    const [txt, setTxt] = useState({});
    return html`<div class="view"><p class="eyebrow">Judgment · swings from last year</p><h1>Prior-year variances</h1>
    <p class="muted">Flagged when the change is over ${app.S.standards.variance_review.flag_if_change_over_percent}% and over ${app.S.standards.variance_review.and_over_amount.toLocaleString()} (firm standard). Each needs an explanation.</p>
    <div class="tw"><table class="t"><thead><tr><th>Line</th><th>Description</th><th class="r">2024</th><th class="r">2025</th><th class="r">Change</th><th>Explanation</th></tr></thead><tbody>
    ${vs.map((v) => {
      const ex = app.S.notes.filter((n) => n.target === v.key);
      return html`<tr><td><${Ref} r=${v.key} /></td><td>${v.label}</td><td class="r"><${Money} v=${v.py} /></td><td class="r"><${Money} v=${v.cy} /></td><td class="r num">${signed(v.d)} <span class="muted small">${isFinite(v.pct) ? Math.round(v.pct) + "%" : "new"}</span></td>
      <td>${ex.length ? ex.map((n) => html`<div class="small">${n.text} <span class="muted">— <${Who} id=${n.actor} /></span></div>`) : html`<div class="row gap"><input class="in grow" aria-label=${"Explain " + v.key} value=${txt[v.key] || ""} onInput=${(e) => setTxt({ ...txt, [v.key]: e.target.value })} placeholder="Why it moved" /><${Btn} small disabled=${!txt[v.key] || !app.can("note")} onClick=${() => app.act("note", v.key, { text: txt[v.key] })}>Save<//></div>`}</td></tr>`;
    })}
    </tbody></table></div>
  </div>`;
  }
  function DiagnosticsView() {
    const app = useApp();
    return html`<div class="view"><p class="eyebrow">Engine ${app.V.version}</p><h1>Engine diagnostics</h1>
    <p class="muted">Each diagnostic is linked to the finding, line or document that resolves it.</p>
    <div class="tw"><table class="t"><tbody>${app.V.diagnostics.map((d) => {
      const t = DIAG_FINDING[d.code];
      const st = t && app.S.findingStatus.get(t)?.status;
      return html`<tr><td><${Pill} tone=${d.severity === "warning" ? "warn" : "info"}>${d.severity}<//></td><td><code>${d.code}</code><div class="small">${d.message}</div></td><td>${t && html`<${Ref} r=${t} />`} ${st && html`<${StatusPill} st=${st} />`}</td><td class="chips">${d.refs.map((r) => html`<${Ref} r=${r} />`)}</td></tr>`;
    })}</tbody></table></div></div>`;
  }

  // src/ui/views2.js
  var L = (app, k) => app.V.lineMap.get(k)?.value;
  var E = (app, k) => app.eff.over.has(k) ? app.eff.over.get(k).to : L(app, k);
  function Row({ k, label, cents }) {
    const app = useApp();
    const l = app.V.lineMap.get(k);
    if (!l) return null;
    const ov = app.eff.over.get(k);
    return html`<tr class="click" onClick=${() => app.open(k)}><td class="key">${k}</td><td>${label || l.label}</td><td class="r">${ov ? html`<${Money} v=${l.value} strike /> <${Money} v=${ov.to} className="strong" />` : html`<${Money} v=${l.value} cents=${cents} />`}</td></tr>`;
  }
  var Tbl = ({ keys, title }) => html`<div class="tw"><table class="t t-tight">${title && html`<caption>${title}</caption>`}<tbody>${keys.map((k) => html`<${Row} k=${k} />`)}</tbody></table></div>`;
  var SCHEDULES = [
    ["sales", "Sales detail"],
    ["depreciation", "Depreciation by asset"],
    ["books", "Books to tax"],
    ["rentals", "Rentals & passive losses"],
    ["k1", "K-1 lines & basis"],
    ["retirement", "Retirement & foreign"],
    ["deductions", "Deductions & credits"],
    ["payments", "Payments"],
    ["state", "State split"],
    ["carryovers", "Carryovers & roll-forward"],
    ["prior", "Prior preparer vs us"],
    ["mileage", "Mileage log"]
  ];
  function SchedulesView({ tab }) {
    const app = useApp();
    const t = tab || "sales";
    const C = { sales: SalesDetail, depreciation: Depreciation, books: BooksToTax, rentals: Rentals, k1: K1Basis, retirement: RetirementForeign, deductions: Deductions, payments: Payments, state: StateSplit, carryovers: Carryovers, prior: PriorVsUs, mileage: Mileage }[t];
    return html`<div class="view"><p class="eyebrow">Records a CPA expects</p><h1>${SCHEDULES.find((s) => s[0] === t)?.[1]}</h1>
    <div class="toolbar wrap">${SCHEDULES.map(([id, n]) => html`<button class=${cx("tab", id === t && "cur")} onClick=${() => app.go("schedules/" + id)}>${n}</button>`)}</div>
    <${C} /></div>`;
  }
  function SalesDetail() {
    const app = useApp();
    const lots = useMemo(() => app.M.lots(app.V), [app.V]);
    const [f, setF] = useState({ broker: "all", term: "all", ex: false, q: "" });
    const [page, setPage] = useState(0);
    const [sel, setSel] = useState(/* @__PURE__ */ new Set());
    const exceptions = (r) => !r.covered && r.basis === 0 || r.adj !== 0 || r.broker === "Coinhaven" && r.basis === 0 || app.findingByLine.has(r.key) || r.gain < -1e3;
    const rows = lots.filter((r) => (f.broker === "all" || r.broker === f.broker) && (f.term === "all" || r.term === f.term) && (!f.ex || exceptions(r)) && (!f.q || (r.desc + r.lot).toLowerCase().includes(f.q.toLowerCase())));
    const groups = [...new Set(lots.map((r) => r.broker))].map((b) => {
      const rs = lots.filter((r) => r.broker === b);
      return { b, n: rs.length, p: rs.reduce((s, r) => s + r.proceeds, 0), c: rs.reduce((s, r) => s + r.basis, 0), g: rs.reduce((s, r) => s + r.gain, 0), ex: rs.filter(exceptions).length, ver: rs.filter((r) => app.verifiedSet.has(r.key)).length };
    });
    const per = 50;
    const pg = rows.slice(page * per, page * per + per);
    const bulk = () => app.actBatch(rows.filter((r) => sel.has(r.key)).map((r) => ["verify", r.key, { method: "agreed_to_source_document", note: `Agreed to ${r.broker} 1099-B detail`, evidence: r.sources.slice(0, 1) }]), `Verified ${sel.size} lots`);
    return html`
    <div class="tw"><table class="t"><caption>By broker — totals tie to each 1099-B summary (see Findings › recomputations)</caption><thead><tr><th>Broker</th><th class="r">Lots</th><th class="r">Proceeds</th><th class="r">Basis</th><th class="r">Gain</th><th class="r">Exceptions</th><th class="r">Verified</th></tr></thead><tbody>
    ${groups.map((g) => html`<tr class="click" onClick=${() => setF({ ...f, broker: g.b })}><td>${g.b}</td><td class="r num">${g.n}</td><td class="r"><${Money} v=${g.p} cents /></td><td class="r"><${Money} v=${g.c} cents /></td><td class="r"><${Money} v=${g.g} cents /></td><td class="r num">${g.ex}</td><td class="r"><${Bar} value=${g.ver} max=${g.n} /></td></tr>`)}
    </tbody></table></div>
    <div class="toolbar wrap">
      <select aria-label="Broker" value=${f.broker} onChange=${(e) => {
      setF({ ...f, broker: e.target.value });
      setPage(0);
    }}><option value="all">All brokers</option>${groups.map((g) => html`<option value=${g.b}>${g.b}</option>`)}</select>
      <select aria-label="Term" value=${f.term} onChange=${(e) => {
      setF({ ...f, term: e.target.value });
      setPage(0);
    }}><option value="all">Short & long</option><option value="short">Short-term</option><option value="long">Long-term</option></select>
      <label class="chk"><input type="checkbox" checked=${f.ex} onChange=${(e) => {
      setF({ ...f, ex: e.target.checked });
      setPage(0);
    }} /> Exceptions only (missing basis, adjustments, findings, losses over 1,000)</label>
      <input class="in" type="search" aria-label="Search lots" placeholder="Search security or lot" value=${f.q} onInput=${(e) => {
      setF({ ...f, q: e.target.value });
      setPage(0);
    }} />
      <span class="grow"></span>
      <${Btn} small onClick=${() => setSel(new Set(rows.map((r) => r.key)))}>Select all ${rows.length} shown<//>
      <${Btn} small kind="primary" disabled=${!sel.size || !app.can("verify")} onClick=${() => {
      bulk();
      setSel(/* @__PURE__ */ new Set());
    }}>Mark ${sel.size || ""} agreed to 1099-B<//>
    </div>
    <div class="tw"><table class="t lots"><thead><tr><th></th><th>Lot</th><th>Security</th><th>Box</th><th>Acquired</th><th>Sold</th><th class="r">Proceeds</th><th class="r">Basis</th><th class="r">Adj.</th><th class="r">Gain</th><th></th></tr></thead><tbody>
      ${pg.map((r) => {
      const ov = app.eff.over.get(r.key);
      const fl = app.findingByLine.get(r.key);
      return html`<tr class=${cx("click", exceptions(r) && "row-flag", ov && "row-adj")} onClick=${() => app.open(r.key)}>
        <td onClick=${(e) => e.stopPropagation()}><input type="checkbox" aria-label=${"Select " + r.lot} checked=${sel.has(r.key)} onChange=${() => {
        const s = new Set(sel);
        s.has(r.key) ? s.delete(r.key) : s.add(r.key);
        setSel(s);
      }} /></td>
        <td class="key">${r.lot}</td><td>${r.desc}</td><td>${r.box}</td><td class="small">${r.acquired}</td><td class="small">${r.sold}</td>
        <td class="r"><${Money} v=${r.proceeds} cents /></td><td class="r"><${Money} v=${r.basis} cents /></td><td class="r"><${Money} v=${r.adj || null} cents /></td>
        <td class="r">${ov ? html`<${Money} v=${r.gain} strike cents /> <${Money} v=${ov.to} cents className="strong" />` : html`<${Money} v=${r.gain} cents />`}</td>
        <td>${app.verifiedSet.has(r.key) && html`<${Tick} method="agreed_to_source_document" />`}${fl && html`<${Pill} tone=${KIND_TONE[fl.kind]}>${fl.id}<//>`}</td></tr>`;
    })}
    </tbody></table></div>
    <div class="pager">${rows.length > per && html`<${Btn} small disabled=${!page} onClick=${() => setPage(page - 1)}>Previous<//><span class="small">${page * per + 1}–${Math.min(rows.length, page * per + per)} of ${rows.length}</span><${Btn} small disabled=${(page + 1) * per >= rows.length} onClick=${() => setPage(page + 1)}>Next<//>`}</div>
    <${Tbl} title="Schedule D" keys=${["SchD.1b", "SchD.2", "SchD.3", "SchD.6", "SchD.7", "SchD.8b", "SchD.9", "SchD.10", "SchD.11", "SchD.12", "SchD.13", "SchD.14", "SchD.15", "SchD.16", "SchD.19"]} />`;
  }
  function Depreciation() {
    const app = useApp();
    const va = [...app.V.assets.values()];
    const hv = app.findings.find((f) => f.id === "F-HVAC");
    const hvacApplied = app.S.findingStatus.get("F-HVAC")?.status === "adjusted";
    return html`<div class="tw"><table class="t"><thead><tr><th>Asset</th><th>Activity</th><th>In service</th><th>Method / life</th><th class="r">Cost</th><th class="r">Fed 2025</th><th class="r">CA 2025</th><th class="r">AMT 2025</th><th>Disposal</th></tr></thead><tbody>
    ${va.map((a) => html`<tr class="click" onClick=${() => app.open("asset:" + a.asset_id)}><td class="key">${a.asset_id}</td><td class="small">${a.description}</td><td class="small">${a.placed_in_service}</td><td class="small">${a.method} / ${a.life_years}</td><td class="r"><${Money} v=${a.cost} /></td>
      <td class="r"><${Money} v=${a.federal?.depreciation ?? a.federal?.current} cents /></td><td class="r"><${Money} v=${a.california?.depreciation ?? a.california?.current} cents /></td><td class="r"><${Money} v=${a.amt?.depreciation ?? a.amt?.current} cents /></td><td class="small">${a.disposed ? typeof a.disposed === "object" ? `${a.disposed.date || ""} ${a.disposed.note || ""}` : a.disposed : ""}</td></tr>`)}
    ${hvacApplied && hv && html`<tr class="row-adj"><td class="key">SAC-HVAC</td><td class="small">1450 Fremont Way - heat pump system (from F-HVAC)</td><td class="small">2025-08-12</td><td class="small">SL / mid-month / 27.5</td><td class="r"><${Money} v=${11e3} /></td><td class="r"><${Money} v=${150} /></td><td class="r"><${Money} v=${150} /></td><td class="r"><${Money} v=${150} /></td><td></td></tr>`}
    </tbody></table></div>
    <p class="muted small">Click an asset for depreciation by year (federal vs California), accumulated amounts and AMT. California differences: the 2021 appliances (no CA bonus) and the 2025 studio equipment (CA allows no bonus; see the §179 what-if).</p>
    <${Tbl} title="Condo disposal and recapture (Form 4797)" keys=${["F4797.20", "F4797.21", "F4797.22", "F4797.23", "F4797.24", "F4797.25", "F4797.26g", "SchD.19"]} />`;
  }
  function BooksToTax() {
    const app = useApp();
    const ev = (id) => app.M.evs.get(id)?.value;
    const books = ev("ev-0105");
    const rows = [
      ["Net income per books (QuickBooks, cash basis)", books, "ev-0105"],
      ["Add back: depreciation booked by client (straight-line)", ev("ev-0092"), "ev-0092"],
      ["Add back: Erik's health insurance (moves to Schedule 1 / disallowed)", ev("ev-0094"), "ev-0094"],
      ["Add back: fuel (replaced by standard mileage)", ev("ev-0090"), "ev-0090"],
      ["Add back: 50% of meals", ev("ev-0097") / 2, "ev-0097"],
      ["Add: 1099-K amounts the engine treated as unmatched", E(app, "SchC.1") - ev("ev-0103"), "SchC.1"],
      ["Less: tax depreciation (Form 4562)", -E(app, "SchC.13"), "SchC.13"],
      ["Less: standard mileage", -E(app, "SchC.9"), "SchC.9"],
      ["Less: home office (simplified)", -E(app, "SchC.30"), "SchC.30"],
      ["Adjust: phone/internet business share", E(app, "SchC.25") - (ev("ev-0101") + ev("ev-0095")), "SchC.25"],
      ["Adjust: personal subscriptions", E(app, "SchC.27a.1") - ev("ev-0099"), "SchC.27a.1"]
    ];
    const total = rows.reduce((s, r) => s + (r[1] || 0), 0);
    const ncs = ["ev-0113", "ev-0116", "ev-0119", "ev-0122", "ev-0125"].reduce((s, id) => s + ev(id), 0);
    return html`<div class="grid2">
    <div class="tw"><table class="t"><caption>Books → Schedule C net profit (working)</caption><tbody>
      ${rows.map(([l, v, r]) => html`<tr><td>${l}</td><td><${Ref} r=${r} /></td><td class="r"><${Money} v=${Math.round(v)} /></td></tr>`)}
      <tr class="tot"><td>Schedule C net profit (working)</td><td></td><td class="r"><${Money} v=${Math.round(total)} /></td></tr>
      <tr><td class="muted">Engine Schedule C line 31</td><td><${Ref} r="SchC.31" /></td><td class="r muted"><${Money} v=${L(app, "SchC.31")} /></td></tr>
    </tbody></table></div>
    <div class="tw"><table class="t"><caption>Gross receipts vs third-party returns (Letter 566 item 2)</caption><tbody>
      <tr><td>Forms 1099-NEC (5 payers)</td><td class="r"><${Money} v=${ncs} /></td></tr>
      <tr><td>Clients that issued no 1099 (D15 p3)</td><td class="r"><${Money} v=${ev("ev-0111")} /></td></tr>
      <tr class="tot"><td>Equals books revenue</td><td class="r"><${Money} v=${ncs + ev("ev-0111")} /></td></tr>
      <tr><td>Books total income (D14)</td><td class="r"><${Money} v=${ev("ev-0103")} /></td></tr>
      <tr><td>Form 1099-K (Paywell) — Atlas card payments, already inside Atlas's 1099-NEC</td><td class="r"><${Money} v=${ev("ev-0127")} /></td></tr>
      <tr><td>Engine gross receipts</td><td class="r"><${Money} v=${L(app, "SchC.1")} /></td></tr>
      <tr><td>Working gross receipts</td><td class="r strong"><${Money} v=${E(app, "SchC.1")} /></td></tr>
    </tbody></table></div></div>
    <${Tbl} title="Schedule C as computed" keys=${["SchC.1", "SchC.8", "SchC.9", "SchC.11", "SchC.13", "SchC.15", "SchC.17", "SchC.18", "SchC.22", "SchC.24a", "SchC.24b", "SchC.25", "SchC.27a.1", "SchC.27a.2", "SchC.28", "SchC.29", "SchC.30", "SchC.31", "SchSE.12", "Sch1.15", "Sch1.16", "Sch1.17"]} />`;
  }
  function Rentals() {
    return html`<div class="grid2"><${Tbl} title="1450 Fremont Way (Sacramento) — managed, all year" keys=${["SchE.2A", "SchE.3A", "SchE.9A", "SchE.11A", "SchE.12A", "SchE.14A", "SchE.16A", "SchE.18A", "SchE.20A", "SchE.21A", "SchE.22A"]} />
    <${Tbl} title="1200 Barton Hills Dr 4C (Austin) — rented to 09/30, sold 10/15" keys=${["SchE.2B", "SchE.3B", "SchE.9B", "SchE.12B", "SchE.14B", "SchE.16B", "SchE.18B", "SchE.19B", "SchE.20B", "SchE.21B", "SchE.22B"]} /></div>
    <${Tbl} title="Form 8582 — passive activity losses" keys=${["F8582.1a", "F8582.1b", "F8582.1c", "F8582.3a", "F8582.4", "SchE.26", "SchE.32", "SchE.41"]} />
    <p class="muted small">Net passive income is positive (condo gain + K-1 income), so current and suspended losses (6,300 Fremont; 9,850 Barton Hills) are all allowed. The condo's suspended losses are also released by the fully taxable disposition.</p>`;
  }
  function K1Basis() {
    const app = useApp();
    const b = app.M.P.prior_years.basis_records;
    const ev = (id) => app.M.evs.get(id)?.value;
    const roll = [
      ["2022", null, null, 21300, "Client worksheet (prior preparer file)"],
      ["2023", ev("ev-0983"), ev("ev-0985"), 21300 + ev("ev-0983") - ev("ev-0985"), "2023 K-1 found June 2026 (D40)"],
      ["2024", 16900, 3e4, 21300 + ev("ev-0983") - ev("ev-0985") + 16900 - 3e4, '2024 K-1 per prior return; prior preparer "assumed sufficient" \u2014 confirmed'],
      ["2025", 18485, 42e3, 0, "Distributions exceed basis by 21,215 \u2192 capital gain (Form 7203)"]
    ];
    return html`<div class="tw"><table class="t"><caption>Lindqvist Family Woodworks, Inc. (20%) — stock basis by year</caption><thead><tr><th>Year</th><th class="r">Income items</th><th class="r">Distributions</th><th class="r">Ending basis</th><th>Source</th></tr></thead><tbody>
    ${roll.map((r) => html`<tr><td>${r[0]}</td><td class="r"><${Money} v=${r[1]} /></td><td class="r"><${Money} v=${r[2]} /></td><td class="r strong"><${Money} v=${r[3]} /></td><td class="small">${r[4]}</td></tr>`)}
    </tbody></table></div>
    <div class="grid2"><${Tbl} title="Form 7203 (2025)" keys=${["F7203.1", "F7203.3a", "F7203.3c", "F7203.4", "F7203.5", "F7203.6", "F7203.7", "F7203.excess", "F8949.F.SCORP"]} />
    <${Tbl} title="K-1 lines on the return" keys=${["SchE.28A", "SchE.28B", "SchB.1.7", "SchB.1.8", "SchD.12", "Sch3.1", "F8995.2.2", "F8995.15.2", "ScheduleS.credit"]} /></div>
    <div class="tw"><table class="t"><caption>Ridgeline Real Estate Fund III LP — capital account</caption><tbody>
      <tr><td>2024 ending capital (outside basis never computed by prior preparer)</td><td class="r"><${Money} v=${b.partnership_ridgeline[0].ending_capital_account} /></td></tr>
      <tr><td>2025: + net income 9,870 − distributions 6,000 − foreign taxes 210 (<${Ref} r="D37" />)</td><td class="r"><${Money} v=${ev("ev-0970")} /></td></tr>
    </tbody></table></div>
    <p class="muted small">Carry forward: compute Ridgeline outside basis (capital account + share of liabilities) before any loss year; Woodworks ending stock basis 0.</p>`;
  }
  function RetirementForeign() {
    return html`<div class="grid2"><${Tbl} title="Backdoor Roth — Form 8606" keys=${["F8606.1", "F8606.2", "F8606.3", "F8606.6", "F8606.8", "F8606.10", "F8606.11", "F8606.14", "F8606.16", "F8606.17", "F8606.18", "F1040.4a", "F1040.4b"]} />
    <${Tbl} title="HSA — Form 8889" keys=${["F8889.3", "F8889.9", "F8889.13", "F8889.14a", "F8889.15", "F8889.16", "SchCA540NR.1.C"]} /></div>
    <div class="grid2"><${Tbl} title="Foreign account — Sparbanken Norrland" keys=${["SchB.1.6", "SchB.7a", "SchB.7b", "F8938.1.max", "F8938.1.ye", "F8938.req"]} />
    <${Tbl} title="SEP and ISO" keys=${["Sch1.16", "F6251.2i", "F6251.11"]} /></div>
    <p class="muted small">Outside the return: FBAR (due 10/15/2026, client files), possible 2023 Form 3520 for the inheritance (see F-3520), SEP excess contribution (F-SEP-EXCESS).</p>`;
  }
  function Deductions() {
    const app = useApp();
    const [dd, setDd] = useState({ rel: false, age: false, res: false, ssn: false, sup: false, other: false, ada: false });
    const done = app.S.decisions.find((d) => d.kind === "due_diligence");
    return html`<div class="grid2"><${Tbl} title="Schedule A with limits" keys=${["SchA.5a", "SchA.5b", "SchA.5d", "SchA.5e", "SchA.8a", "SchA.8c", "SchA.8e", "SchA.11", "F8283.A1.stock", "F8283.A1.vehicle", "SchA.12", "SchA.14", "SchA.17", "F1040.12"]} />
    <${Tbl} title="Credits with limits" keys=${["F8812.1", "F8812.4", "F8812.6", "F8812.8", "F8812.11", "F8812.12", "F8863.27", "F8863.30", "F8863.7", "F2441.1a", "F2441.1b", "F2441.2", "F2441.12", "F2441.31", "F8995.39"]} /></div>
    <${Section} title="Due diligence — Form 8867 (CTC for Theo, ODC for Ada)" sub="Firm rule: due diligence must be documented for CTC/ODC/AOTC/EIC/HOH.">
      ${done ? html`<p><${Tick} method="confirmed_with_client" /> Completed by <${Who} id=${done.actor} /> <${When} at=${done.at} />: ${done.conclusion}</p>` : html`<div class="ddl">
        ${[["rel", "Relationship: Theo (son) and Ada (daughter) \u2014 organizer + 2024 return"], ["age", "Age: Theo under 17 at year end (born 2017); Ada 19, full-time student (1098-T box 8)"], ["res", "Residency: both lived with the taxpayers 12 months (Ada away at school = temporary absence)"], ["ssn", "Valid SSNs: Theo's SSN corrected to the card (D71) \u2014 organizer had a transposition"], ["sup", "Support: Ada did not provide over half her own support (summer W-2 4,100)"], ["other", `Not claimed by anyone else; Ada's own return checks "can be claimed"`], ["ada", "Asked the client about any inconsistent information and recorded the answers"]].map(([k, t]) => html`<label class="chk"><input type="checkbox" checked=${dd[k]} onChange=${(e) => setDd({ ...dd, [k]: e.target.checked })} /> ${t}</label>`)}
        <${Btn} kind="primary" disabled=${!Object.values(dd).every(Boolean) || !app.can("decision")} title=${app.why("decision")} onClick=${() => app.act("decision", "F8867.status", { kind: "due_diligence", topic: "Form 8867", conclusion: "Knowledge, eligibility and record-keeping requirements met for CTC (Theo) and ODC (Ada); 8867 completed.", authority: "IRC \xA76695(g); Treas. Reg. \xA71.6695-2" })}>Record due diligence<//></div>`}
    <//>`;
  }
  function Payments() {
    const app = useApp();
    const P = app.M.P;
    const tx = P.tax_agency_records.irs_account_transcript_2025[0].transactions;
    const ftb = P.tax_agency_records.ftb_account;
    return html`<div class="grid2"><div class="tw"><table class="t"><caption>Federal estimates: client vs EFTPS vs IRS transcript</caption><thead><tr><th>Due</th><th class="r">Client said</th><th class="r">EFTPS (D67)</th><th class="r">IRS transcript</th></tr></thead><tbody>
    ${[["2025-04-15", 3e3, 3e3], ["2025-06-16", 3e3, 3e3], ["2025-09-15", 3e3, 3e3], ["2026-01-15", 4e3, null]].map(([d, c, e], i) => html`<tr class=${i === 3 ? "row-flag" : ""}><td>${d}</td><td class="r"><${Money} v=${c} /></td><td class="r"><${Money} v=${e} /></td><td class="r"><${Money} v=${tx[i]?.amount} /></td></tr>`)}
    <tr class="tot"><td>Total</td><td class="r"><${Money} v=${13e3} /></td><td class="r"><${Money} v=${9e3} /></td><td class="r"><${Money} v=${tx.reduce((s, t) => s + t.amount, 0)} /></td></tr></tbody></table></div>
    <div class="tw"><table class="t"><caption>California: Web Pay (D68) vs FTB account</caption><thead><tr><th>Date</th><th class="r">Amount</th><th>Designated</th><th>FTB applied to</th></tr></thead><tbody>
    ${[["2025-01-15", 3e3, "2024", "2024"], ["2025-03-28", 1240, "2024 balance", "2024"], ["2025-04-15", 3500, "2025", "2025"], ["2025-06-16", 3500, "2025", "2025"], ["2025-09-15", 3500, "2024", "2024 (held as credit)"], ["2026-01-15", 3500, "2025", "2025"]].map((r) => html`<tr class=${r[0] === "2025-09-15" ? "row-flag" : ""}><td>${r[0]}</td><td class="r"><${Money} v=${r[1]} /></td><td>${r[2]}</td><td>${r[3]}</td></tr>`)}
    <tr class="tot"><td>2025 estimates per FTB</td><td class="r"><${Money} v=${ftb.tax_year_2025_payments.reduce((s, t) => s + t.amount, 0)} /></td><td></td><td></td></tr></tbody></table></div></div>
    <div class="grid2"><${Tbl} title="Federal payments on the return" keys=${["F1040.25a", "F1040.26", "Sch3.10", "Sch3.11", "F1040.33", "F1040.37", "F2210.8", "F2210.19", "F1040.38"]} />
    <${Tbl} title="California payments on the return" keys=${["F540NR.71", "F540NR.72", "F540NR.73", "F540NR.78", "F540NR.97"]} /></div>
    <p class="muted small">Extension (04/14/2026): Form 4868 paid 36,000 from the v2 estimate. FTB 3519 paid 0 because v2 showed a California overpayment.</p>`;
  }
  function StateSplit() {
    const app = useApp();
    const rows = ["1", "2", "3", "4", "7", "12", "17"].map((n) => ["A", "B", "C", "D", "E"].map((c) => `SchCA540NR.${n}.${c}`));
    return html`<p class="muted">California resident 01/01–07/14 (195 of 365 days), then Texas. Column E is California-source income: everything earned while a resident, plus California-source income after the move (the Sacramento rental, Ridgeline's 22% California share).</p>
    <div class="tw"><table class="t"><thead><tr><th>Line</th><th class="r">A Federal</th><th class="r">B Subtract</th><th class="r">C Add</th><th class="r">D CA law total</th><th class="r">E CA source</th></tr></thead><tbody>
    ${rows.map((r) => html`<tr><td>${app.V.lineMap.get(r[0])?.label.split(" - ")[0] || r[0]}</td>${r.map((k) => {
      const l = app.V.lineMap.get(k);
      const ov = app.eff.over.get(k);
      return html`<td class=${cx("r", l && "click")} onClick=${() => l && app.open(k)}>${ov ? html`<${Money} v=${l.value} strike /> <${Money} v=${ov.to} className="strong" />` : html`<${Money} v=${l?.value} />`}</td>`;
    })}</tr>`)}
    </tbody></table></div>
    <${Tbl} title="Form 540NR" keys=${["F540NR.17", "F540NR.18", "F540NR.19", "F540NR.31", "F540NR.32", "F540NR.34", "F540NR.35", "F540NR.36", "F540NR.37", "F540NR.39", "F540NR.40", "ScheduleS.credit", "F540NR.61", "F540NR.64"]} />`;
  }
  function Carryovers() {
    const app = useApp();
    const P = app.M.P;
    const cin = P.prior_years.carryovers_into_2025;
    const cout = app.V.carryovers_out;
    const fr = app.fr;
    const sh = Math.round(1.1 * fr.federal.total_tax);
    const [ver, setVer] = useState(false);
    const keys = ["SchD.6", "SchD.14", "F8582.1c", "F8606.2"];
    return html`<div class="grid2"><div class="tw"><table class="t"><caption>Into 2025 — agreed to the 2024 return</caption><tbody>
      ${[["Capital loss, short-term", cin.capital_loss_short, "SchD.6"], ["Capital loss, long-term", cin.capital_loss_long, "SchD.14"], ["Passive \u2014 1450 Fremont", cin.passive_1450_fremont, "F8582.1c"], ["Passive \u2014 Barton Hills", cin.passive_1200_barton_hills, "F8582.1c"], ["IRA basis (8606 line 14)", 7e3, "F8606.2"]].map(([l, v, k]) => html`<tr><td>${l}</td><td class="r"><${Money} v=${v} /></td><td><${Ref} r=${k} /> ${app.verifiedSet.has(k) && html`<${Tick} method="agreed_to_prior_year" />`}</td></tr>`)}
    </tbody></table>
    <${Btn} small disabled=${!app.can("verify") || keys.every((k) => app.verifiedSet.has(k))} onClick=${() => app.actBatch(keys.map((k) => ["verify", k, { method: "agreed_to_prior_year", note: "Agreed to 2024 return D06 p6/p9 and prior preparer carryover worksheet D07 p6", evidence: ["D06", "D07"] }]), "Carryovers agreed")}>Agree all to 2024 return<//></div>
    <div class="tw"><table class="t"><caption>Out to 2026 (engine ${app.V.version}, before adjustments)</caption><tbody>
      ${Object.entries(cout.federal).map(([k, v]) => html`<tr><td>${k.replace(/_/g, " ")}</td><td class="r"><${Money} v=${v} /></td></tr>`)}
      ${Object.entries(cout.california.depreciation_basis_differences || {}).map(([k, v]) => html`<tr><td>CA basis difference ${k}</td><td class="r"><${Money} v=${v} cents /></td></tr>`)}
    </tbody></table></div></div>
    <${Section} title="Plan next year (2026)" sub="Built from the working numbers; it moves as adjustments change.">
      <div class="tw"><table class="t"><tbody>
        <tr><td>Federal safe harbor: 110% of 2025 total tax (2025 AGI over 150,000)</td><td class="r"><${Money} v=${sh} /></td></tr>
        <tr><td>Quarterly installments (04/15, 06/15, 09/15/2026, 01/15/2027)</td><td class="r"><${Money} v=${Math.ceil(sh / 4)} /></td></tr>
        <tr><td>Less expected 2026 withholding — set with the client's paystubs</td><td class="r muted">—</td></tr>
        <tr><td>California: nonresident in 2026; estimate only California-source income (Fremont rental, Ridgeline CA share). 30% / 40% / 30% on 04/15, 06/15, 01/15</td><td class="r muted">—</td></tr>
        <tr><td>Minimum tax credit from the 2025 ISO AMT (Form 8801)</td><td class="r"><${Money} v=${cout.federal.minimum_tax_credit_from_2025_amt} /></td></tr>
      </tbody></table></div>
      <h4>Open items carried forward</h4>
      <ul class="bul"><li>Form 3520 (2023 inheritance) — client advised, separate engagement (F-3520)</li><li>Late 1099-NEC filings for contractors; set up 1099 process for 2026 (F-1099-NEC)</li><li>SEP excess: confirm corrective withdrawal or file Form 5329 (F-SEP-EXCESS)</li><li>California AMT on the ISO exercise (Schedule P) and future CA treatment of the ISO shares on sale (F-CA-AMT-ISO)</li><li>New asset SAC-HVAC if F-HVAC is adopted; Ridgeline outside basis</li><li>Crypto: keep the CryptoNorth bank record with the lot basis</li></ul>
    <//>`;
  }
  function PriorVsUs() {
    const app = useApp();
    const pw = app.M.P.prior_years.prior_preparer_workpaper;
    const ours = [
      ['Woodworks S corp basis: 2023 K-1 missing; "assumed basis sufficient" for 2024', "Obtained the 2023 K-1 (D40); rolled forward: 2024 ending basis 2,300, so the 2024 assumption held. 2025 distributions exceed basis by 21,215 (taxed as capital gain).", "rc-7203"],
      ['8606 basis 7,000 "per client"; 5498 not obtained', "Agreed to the 2024 Form 5498 (D42). The client's 2025 answer (no prior basis) is wrong; the 8606 carries 7,000.", "F8606.2"],
      ["FBAR filed by client; 8938 filed", "Same treatment; 8938 included (149,567 max). Client confirmation requested for the FBAR.", "F-FBAR"],
      ["Fremont appliances: federal 100% bonus; CA 5-yr 200DB", "Continued; California basis difference 241.92 remains after 2025.", "asset:SAC-APPL"],
      ['Home office 300 sq ft ("2 rooms combined?")', "Client measured 220 (Sacramento) and 260 (Austin); 2025 average 240. 2024 overstated by $400 of deduction \u2014 immaterial, not amended.", "F-HOME-OFFICE-PY"],
      ["Open item: 2023 Form 3520 \u2014 no note of resolution", "Raised with the client; outside engagement scope; advise in writing.", "F-3520"],
      ["No SE health insurance deduction (Erik covered under Ngozi's plan)", "The engine claimed 14,400 this year; we reverse it for the same reason (eligible for employer coverage).", "F-SEHI"]
    ];
    return html`<p class="muted">${pw.summary_memo}</p>
    <div class="tw"><table class="t"><thead><tr><th>Prior preparer (Delta River, 2024)</th><th>What we did in 2025</th><th></th></tr></thead><tbody>
    ${ours.map((r) => html`<tr><td>${r[0]}</td><td>${r[1]}</td><td><${Ref} r=${r[2]} /></td></tr>`)}
    </tbody></table></div>`;
  }
  function Mileage() {
    const app = useApp();
    const evs = app.M.evByDoc.get("D23") || [];
    const pages = [1, 2, 3, 4].map((p) => ({ p, trips: evs.filter((e) => e.page === p && e.field.endsWith("_miles")), total: evs.find((e) => e.page === p && e.field === "page_total")?.value }));
    return html`<p class="muted">335 values read from four scanned pages. Page totals agree with the trips on each page. Page 3 is a second scan of page 2 (F-MILEAGE-DUP).</p>
    <div class="tw"><table class="t"><thead><tr><th>Page</th><th class="r">Trips</th><th class="r">Sum of trips</th><th class="r">Page total read</th><th></th></tr></thead><tbody>
    ${pages.map((x) => html`<tr class=${cx("click", x.p === 3 && "row-flag")} onClick=${() => app.open(`doc:D23#page${x.p}`)}><td>${x.p}</td><td class="r num">${x.trips.length}</td><td class="r"><${Money} v=${x.trips.reduce((s, e) => s + +e.value, 0)} /></td><td class="r"><${Money} v=${x.total} /></td><td>${x.p === 3 ? html`<${Pill} tone="bad">duplicate of page 2<//>` : ""}</td></tr>`)}
    </tbody></table></div><${Tbl} keys=${["SchC.43", "SchC.44a", "SchC.44b", "SchC.44c", "SchC.9"]} />`;
  }
  function ReviewView() {
    const app = useApp();
    const { S, V, eff } = app;
    const notes = [...S.reviewNotes.values()];
    const qs = [...S.questions.values()];
    const [t, setT] = useState("");
    return html`<div class="view"><p class="eyebrow">People</p><h1>Review</h1>
    <${Section} title="Sign-offs by area" sub="P = preparer, R = reviewer, Pt = partner. Amber means the area changed after it was signed, so the sign-off has reopened.">
      <div class="tw"><table class="t"><thead><tr><th>Area</th><th>Preparer</th><th>Reviewer</th><th>Partner</th></tr></thead><tbody>
      ${AREAS.map((a) => {
      const so = signoffState(V, S, eff, a.id);
      return html`<tr class="click" onClick=${() => app.go("area:" + a.id)}><td>${a.name}</td>${["preparer", "reviewer", "partner"].map((l) => {
        const x = so[l];
        return html`<td>${x ? html`<span class=${x.fresh ? "good" : "warnc"}>${x.fresh ? "\u2713" : "\u21BA"} <${Who} id=${x.actor} /> <${When} at=${x.at} /></span>` : html`<span class="muted">—</span>`}</td>`;
      })}</tr>`;
    })}
      </tbody></table></div><//>
    <${Section} title=${`Review notes (${notes.filter((n) => !n.resolved).length} open)`} sub="Notes marked blocking stop e-file submission until the person who wrote them clears them.">
      ${notes.length ? notes.slice().reverse().map((n) => html`<${ReviewNoteCard} n=${n} />`) : html`<${Empty}>No review notes yet. Open any line, document or finding and choose “Review note”.<//>`}
      <div class="row gap"><input class="in grow" aria-label="New return-level review note" value=${t} onInput=${(e) => setT(e.target.value)} placeholder="Return-level review note" /><${Btn} disabled=${!t || !app.can("review_note")} title=${app.why("review_note")} onClick=${() => {
      app.act("review_note", "area:partner_review", { text: t, blocking: true });
      setT("");
    }}>Add blocking note<//></div>
    <//>
    <${Section} title=${`Questions (${qs.filter((q) => !q.answers.length).length} unanswered)`} sub="Answers are filed as evidence on the item the question was about.">
      ${qs.length ? qs.slice().reverse().map((q) => html`<div class="qcard"><div><strong>${q.text}</strong> <span class="muted small">— <${Who} id=${q.actor} /> to ${q.to === "client" ? "client" : html`<${Who} id=${q.to} />`} on <${Ref} r=${q.target} /> <${When} at=${q.at} /></span></div>
        ${q.answers.map((a) => html`<blockquote class="quote">${a.text}<footer><${Who} id=${a.actor} /> <${When} at=${a.at} /></footer></blockquote>`)}${!q.answers.length && html`<${AnswerBox} q=${q} />`}</div>`) : html`<${Empty}>No questions yet.<//>`}
    <//>
    <${Section} title="Assignments & deadlines">
      <div class="tw"><table class="t t-tight"><tbody>${Object.entries(S.assignments).map(([r, id]) => html`<tr><td>${r}</td><td><${Who} id=${id} /></td></tr>`)}
      ${app.M.P.firm.deadlines.map((d) => html`<tr class=${d.date < app.clock.slice(0, 10) ? "muted" : ""}><td>${d.date}</td><td>${d.what}</td></tr>`)}</tbody></table></div>
    <//>
  </div>`;
  }
  function ActivityView() {
    const app = useApp();
    const { S, M } = app;
    const seen = S.seen.get(app.actor.id);
    const scripted = M.P.timeline.filter((t) => t.at <= app.clock).map((t) => ({ id: t.id, at: t.at, type: "season", actor: t.actor, text: `${t.event.replace(/_/g, " ")}${t.detail ? ": " + t.detail : ""}`, refs: t.refs }));
    const docsIn = [...M.docs.values()].filter((d) => d.received_at <= app.clock).map((d) => ({ id: "rcv-" + d.id, at: d.received_at, type: "received", text: `Received ${d.id} ${d.title}`, refs: [d.id] }));
    const ours = S.events.filter((e) => e.type !== "seen").map((e) => ({ id: e.id, at: e.at, type: e.type, actor: e.actor, text: describe(e, app), refs: e.target ? [e.target] : [], undone: e.undone, ev: e }));
    const rej = S.rejected.map((e) => ({ id: e.id, at: e.at, type: "rejected", actor: e.actor, text: `Not applied \u2014 ${e.why} (${e.type})`, refs: e.target ? [e.target] : [] }));
    const all = [...scripted, ...docsIn, ...ours, ...rej].sort((a, b) => a.at < b.at ? 1 : -1);
    const [filter, setFilter] = useState("all");
    const shown = all.filter((x) => filter === "all" || filter === "new" && seen && x.at > seen || filter === "work" && !["season", "received"].includes(x.type) || filter === "season" && ["season", "received"].includes(x.type));
    return html`<div class="view"><p class="eyebrow">Change</p><h1>Activity</h1>
    <div class="toolbar">${[["all", "Everything"], ["new", `Since I last looked${seen ? " (" + all.filter((x) => x.at > seen).length + ")" : ""}`], ["work", "Workpaper actions"], ["season", "Season events & documents"]].map(([k, l]) => html`<button class=${cx("tab", filter === k && "cur")} onClick=${() => setFilter(k)}>${l}</button>`)}
      <span class="grow"></span><${Btn} small onClick=${() => app.act("seen", null, {})}>Mark all as seen<//></div>
    <ul class="feed">${shown.map((x) => html`<li class=${cx(seen && x.at > seen && "new", x.undone && "undone", x.type === "rejected" && "rej")}>
      <${When} at=${x.at} /> <span class=${`ftype ftype-${x.type}`}>${x.type.replace(/_/g, " ")}</span> ${x.actor && html`<${Who} id=${x.actor} />`} <span>${x.text}</span> ${x.refs?.slice(0, 3).map((r) => html`<${Ref} r=${r} />`)}
      ${x.ev && x.ev.actor === app.actor.id && !x.undone && x.ev.type !== "undo" && html` <button class="linkish small" onClick=${() => app.act("undo", null, x.ev.batch ? { batch: x.ev.batch } : { event: x.ev.id })}>undo</button>`}
      ${x.undone && html` <${Pill}>undone<//>`}</li>`)}</ul>
  </div>`;
  }
  function describe(e, app) {
    const d = e.data || {};
    switch (e.type) {
      case "adjust":
        return `Adjusted ${(d.lines || []).map((l) => l.key).join(", ")} \u2014 ${d.reason || ""}`;
      case "verify":
        return `Verified (${d.method?.replace(/_/g, " ")})${d.note ? ": " + d.note : ""}`;
      case "review_note":
        return `Review note: ${d.text}`;
      case "review_reply":
        return `Replied: ${d.text}`;
      case "review_resolve":
        return "Cleared review note";
      case "question":
        return `Asked ${d.to === "client" ? "the client" : app.actorById.get(d.to)?.name}: ${d.text}`;
      case "answer":
        return `Answered: ${d.text}`;
      case "signoff":
        return `Signed off ${areaName(d.area)} as ${d.level}`;
      case "decision":
        return `${d.kind}: ${d.conclusion}`;
      case "filing":
        return `Filing \u2014 ${d.step.replace(/_/g, " ")}${d.note ? ": " + d.note : ""}`;
      case "unmask":
        return `Viewed unmasked: ${d.what}`;
      case "finding_status":
        return `Finding ${e.target} \u2192 ${d.status}: ${d.reason}`;
      case "undo":
        return "Undo";
      default:
        return `${e.type} ${d.text || d.note || ""}`;
    }
  }
  function CompareView() {
    const app = useApp();
    const { M } = app;
    const avail = M.versions.filter((v) => v.computed_at <= app.clock);
    const opts = [...avail.map((v) => v.version), "working", ...app.S.frozen ? ["filed"] : []];
    const [a, setA] = useState(opts[Math.max(0, opts.indexOf(app.V.version) - 1)] || opts[0]);
    const [b, setB] = useState("working");
    const val = (who, k) => {
      if (who === "working") return app.eff.over.has(k) ? app.eff.over.get(k).to : app.V.lineMap.get(k)?.value;
      if (who === "filed") return app.S.frozen?.snapshot?.lines?.[k] ?? app.V.lineMap.get(k)?.value;
      return M.vIndex.get(who)?.lineMap.get(k)?.value;
    };
    const keys = /* @__PURE__ */ new Set([...M.vIndex.get(avail.at(-1).version).lineMap.keys(), ...avail.flatMap((v) => [...v.lineMap.keys()])]);
    const diffs = [...keys].filter((k) => {
      const x = val(a, k), y = val(b, k);
      return x !== y && !(x == null && y == null);
    });
    const summ = (who) => who === "working" ? app.fr : who === "filed" ? app.S.frozen.snapshot.summary : M.vIndex.get(who).summary;
    return html`<div class="view"><p class="eyebrow">Change</p><h1>Compare versions</h1>
    <div class="toolbar"><select aria-label="From" value=${a} onChange=${(e) => setA(e.target.value)}>${opts.map((o) => html`<option value=${o}>${o}</option>`)}</select> → <select aria-label="To" value=${b} onChange=${(e) => setB(e.target.value)}>${opts.map((o) => html`<option value=${o}>${o}</option>`)}</select><span class="muted">${diffs.length} lines differ</span></div>
    <div class="tw"><table class="t t-tight"><thead><tr><th></th><th class="r">${a}</th><th class="r">${b}</th></tr></thead><tbody>
      ${["total_tax", "payments", "balance_due"].map((k) => html`<tr><td>Federal ${k.replace("_", " ")}</td><td class="r"><${Money} v=${summ(a)?.federal[k]} /></td><td class="r"><${Money} v=${Math.round(summ(b)?.federal[k])} /></td></tr>`)}
      ${["total_tax", "payments", "balance_due"].map((k) => html`<tr><td>California ${k.replace("_", " ")}</td><td class="r"><${Money} v=${summ(a)?.california[k]} /></td><td class="r"><${Money} v=${Math.round(summ(b)?.california[k])} /></td></tr>`)}
    </tbody></table></div>
    <div class="tw"><table class="t"><thead><tr><th>Line</th><th>Description</th><th class="r">${a}</th><th class="r">${b}</th><th class="r">Change</th></tr></thead><tbody>
      ${diffs.slice(0, 400).map((k) => {
      const x = val(a, k), y = val(b, k);
      return html`<tr class="click" onClick=${() => app.V.lineMap.has(k) && app.open(k)}><td class="key">${k}</td><td class="small">${(app.V.lineMap.get(k) || M.versions.find((v) => v.lineMap.has(k)).lineMap.get(k)).label}</td><td class="r"><${Money} v=${x} /></td><td class="r"><${Money} v=${y} /></td><td class="r num">${typeof x === "number" && typeof y === "number" ? signed(y - x) : x == null ? "added" : y == null ? "removed" : "changed"}</td></tr>`;
    })}
    </tbody></table></div></div>`;
  }
  function WhatIfView() {
    const app = useApp();
    const alts = app.M.P.what_if.alternatives;
    const [cat, setCat] = useState("schc_profit");
    const [amt, setAmt] = useState("1000");
    const e = effectOf(app.V, cat, +amt || 0);
    return html`<div class="view"><p class="eyebrow">Change</p><h1>What-ifs</h1>
    <${Section} title="Engine alternatives (exact)" sub="Computed by the engine from v3. An election or treatment can be proposed from here and then goes to the partner.">
      <div class="tw"><table class="t"><thead><tr><th>Alternative</th><th class="r">Federal tax</th><th class="r">California tax</th><th></th></tr></thead><tbody>
      ${alts.map((a) => {
      const f = app.findings.find((x) => x.proposal?.whatIf === a.id);
      return html`<tr><td>${a.description}<div class="muted small">${a.changed_lines.length} lines change</div></td><td class="r num">${signed(a.federal.total_tax_change)}</td><td class="r num">${signed(a.california.total_tax_change)}</td><td>${f ? html`<${Ref} r=${f.id} />` : ""}</td></tr>`;
    })}
      </tbody></table></div><//>
    <${Section} title="Quick estimate" sub="Per-dollar tax-effect rates from the current engine version. Nothing is saved.">
      <div class="row gap wrap"><select aria-label="Category" value=${cat} onChange=${(ev) => setCat(ev.target.value)}>${Object.keys(app.V.tax_effect_rates).map((k) => html`<option value=${k}>${k}</option>`)}</select>
        <input class="in num" type="number" aria-label="Change in dollars" value=${amt} onInput=${(ev) => setAmt(ev.target.value)} />
        <span>→ federal <strong class="num">${signed(e.tax_fed)}</strong>, California <strong class="num">${signed(e.tax_ca)}</strong></span></div>
    <//></div>`;
  }
  function FirmView() {
    const app = useApp();
    const { S, M } = app;
    const st = S.standards;
    const [thr, setThr] = useState(st.partner_threshold ?? 1e3);
    const [pct, setPct] = useState(st.variance_review.flag_if_change_over_percent);
    const [amt, setAmt] = useState(st.variance_review.and_over_amount);
    const spent = AREAS.map((a) => ({ a, s: S.time.filter((t) => t.area === a.id).reduce((x, t) => x + +t.hours, 0), b: M.P.firm.budget_hours[a.id] || 0 }));
    return html`<div class="view"><p class="eyebrow">Firm</p><h1>Standards, access & time</h1>
    <${Section} title="Firm standards" sub="Applied everywhere in the workpaper. Only the firm administrator can change them; changes are journaled.">
      <div class="row gap wrap">
        <label>Partner sign-off above (tax effect)<input class="in num" type="number" value=${thr} onInput=${(e) => setThr(+e.target.value)} /></label>
        <label>Variance flag: over %<input class="in num" type="number" value=${pct} onInput=${(e) => setPct(+e.target.value)} /></label>
        <label>and over amount<input class="in num" type="number" value=${amt} onInput=${(e) => setAmt(+e.target.value)} /></label>
        <${Btn} kind="primary" disabled=${!app.can("standard")} title=${app.why("standard")} onClick=${() => app.act("standard", null, { partner_threshold: thr, variance_review: { ...st.variance_review, flag_if_change_over_percent: pct, and_over_amount: amt } })}>Save standards<//>
      </div>
      <ul class="bul small">${st.rules.map((r) => html`<li>${r}</li>`)}</ul>
    <//>
    <${Section} title="Staff & access">
      <div class="tw"><table class="t"><thead><tr><th>Name</th><th>Role</th><th>Credential</th><th>Sensitive data</th><th>Active from</th></tr></thead><tbody>
      ${app.actors.map((a) => html`<tr><td>${a.name}</td><td>${ROLE_LABEL[a.role]}</td><td>${a.credential || ""}</td><td>${a.clearance ? "Cleared (unmasking is logged)" : html`<${Pill} tone="warn">Masked<//> ${a.note || ""}`}</td><td>${a.active_from}</td></tr>`)}
      </tbody></table></div><//>
    <${Section} title=${`Sensitive data view log (${S.views.length})`} sub="Every unmasked view of an SSN, account number or IP PIN.">
      ${S.views.length ? html`<ul class="log">${S.views.slice().reverse().map((v) => html`<li><${When} at=${v.at} /> <${Who} id=${v.actor} /> viewed ${v.what}</li>`)}</ul>` : html`<${Empty}>No unmasked views yet.<//>`}
      ${S.rejected.filter((r) => r.type === "unmask").map((r) => html`<p class="small bad">Refused: ${r.why} (<${When} at=${r.at} />)</p>`)}
    <//>
    <${Section} title="Time against budget">
      <div class="tw"><table class="t"><tbody>${spent.filter((x) => x.b).map((x) => html`<tr><td>${x.a.name}</td><td style="width:40%"><${Bar} value=${x.s} max=${x.b} tone=${x.s > x.b ? "bad" : "accent"} /></td><td class="r num">${x.s.toFixed(2)} / ${x.b} h</td></tr>`)}
      <tr class="tot"><td>Total</td><td></td><td class="r num">${spent.reduce((s, x) => s + x.s, 0).toFixed(2)} / ${spent.reduce((s, x) => s + x.b, 0)} h</td></tr></tbody></table></div>
      <p class="muted small">Fixed fee 4,800 (D01). Records retained 7 years after filing (destroy after ${S.frozen ? +S.frozen.at.slice(0, 4) + 7 : "\u2014"}).</p>
    <//>
    <${Section} title="Workpaper data" sub="Everything you do is an event in an append-only journal. The packet itself is never modified.">
      <p class="small">Storage: <strong>${app.storeStatus.label}</strong>. ${S.events.length} events, ${S.rejected.length} refused by policy.</p>
      <div class="row gap wrap"><${Btn} onClick=${() => app.loadDemo()} disabled=${!app.isOwnerish}>Load demo season activity<//><${Btn} kind="danger" onClick=${() => app.resetAll()} disabled=${!app.isOwnerish}>Reset workpaper journal<//></div>
    <//>
  </div>`;
  }

  // src/ui/views3.js
  var days = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);
  function FilingView() {
    const app = useApp();
    const { S, fr, M, V } = app;
    const P = M.P;
    const blockers = filingBlockers(app, S);
    const ca = clientApproval(S, fr);
    const efile = P.tax_agency_records.efile.filter((x) => x.date <= app.clock);
    const accepted = efile.some((x) => x.status === "accepted" && x.jurisdiction === "federal");
    const ext = P.timeline.find((t) => t.id === "extension-2026-04-14");
    const ourSubs = S.filing.filter((f) => f.step === "efile_submit");
    const freeze = () => {
      const eff = app.eff;
      const lines = {};
      for (const l of V.lines) lines[l.key] = eff.over.has(l.key) ? eff.over.get(l.key).to : l.value;
      app.act("filing", null, { step: "freeze", snapshot: { summary: { federal: { ...fr.federal }, california: { ...fr.california } }, lines, version: V.version }, fingerprint: returnFingerprint(fr), note: `Filed return frozen (engine ${V.version} + ${[...S.adjustments.values()].filter((a) => a.status === "active").length} adjustments)` });
    };
    const filedBal = S.frozen?.snapshot.summary.federal.balance_due ?? fr.federal.balance_due;
    const paidOn = "2026-07-20";
    const lateDays = days("2026-04-15", paidOn);
    const interest = filedBal > 0 ? Math.round(filedBal * P.post_filing_rates.irs_underpayment_interest_rate_annual * lateDays / 365) : 0;
    const ftp = filedBal > 0 ? Math.round(filedBal * P.post_filing_rates.irs_failure_to_pay_penalty_per_month * Math.ceil(lateDays / 30.4)) : 0;
    const amendDelta = S.amendment ? { f: fr.federal.total_tax - S.frozen.snapshot.summary.federal.total_tax, c: fr.california.total_tax - S.frozen.snapshot.summary.california.total_tax } : null;
    return html`<div class="view"><p class="eyebrow">Filing and after</p><h1>Filing</h1>
    <div class="steps-h">
      <div class=${cx("fs", "ok")}><span class="k">Extension</span><span>04/14/2026</span></div>
      <div class=${cx("fs", ca?.fresh && "ok", ca && !ca.fresh && "stale")}><span class="k">Client approval</span><span>${ca ? ca.fresh ? "Current" : "Stale" : "Pending"}</span></div>
      <div class=${cx("fs", accepted && "ok", !accepted && efile.some((x) => x.status === "rejected") && "stale")}><span class="k">E-file</span><span>${accepted ? "Accepted" : efile.length ? "Rejected" : "Not filed"}</span></div>
      <div class=${cx("fs", S.frozen && "ok")}><span class="k">Frozen</span><span>${S.frozen ? S.frozen.at.slice(0, 10) : "\u2014"}</span></div>
      <div class=${cx("fs", S.amendment && "stale")}><span class="k">Amendment</span><span>${S.amendment ? "Open" : "\u2014"}</span></div>
    </div>
    <${Section} title="Extension (Form 4868 / FTB 3519)">
      <p>${ext?.detail} <span class="muted">Filed by <${Who} id=${ext?.actor} />.</span></p>
      <div class="tw"><table class="t t-tight"><tbody><tr><td>Federal estimate (v2)</td><td class="r"><${Money} v=${P.what_if.extension.federal.estimated_balance} /></td><td>paid <${Money} v=${P.what_if.extension.federal.paid_with_form_4868} /></td></tr>
      <tr><td>California estimate (v2)</td><td class="r"><${Money} v=${P.what_if.extension.california.estimated_balance} /></td><td>paid <${Money} v=${P.what_if.extension.california.paid_with_ftb_3519} /></td></tr></tbody></table></div>
      <p class="muted small">An extension of time to file is not an extension of time to pay. Any federal balance on the final return accrues interest and a failure-to-pay penalty from 04/15/2026.</p>
    <//>
    <${Section} title="Client approval & e-file signature (Form 8879 / FTB 8879)" sub="The approval records a fingerprint of the numbers the client saw. If they change later, the approval reopens.">
      <div class="tw"><table class="t t-tight"><tbody>
        <tr><td>Federal total tax</td><td class="r"><${Money} v=${Math.round(fr.federal.total_tax)} /></td><td>${fr.federal.balance_due >= 0 ? "Balance due" : "Refund"} <strong class="num">${fmt(Math.abs(Math.round(fr.federal.balance_due)))}</strong></td></tr>
        <tr><td>California total tax</td><td class="r"><${Money} v=${Math.round(fr.california.total_tax)} /></td><td>${fr.california.balance_due >= 0 ? "Balance due" : "Refund"} <strong class="num">${fmt(Math.abs(Math.round(fr.california.balance_due)))}</strong></td></tr>
      </tbody></table></div>
      ${ca ? html`<p>${ca.fresh ? "\u2713" : "\u21BA"} Approved by <${Who} id=${ca.actor} /> <${When} at=${ca.at} /> ${!ca.fresh && html`<${Pill} tone="warn">Numbers changed since approval — the client must re-approve<//>`}</p>` : html`<p class="muted">Not yet approved.</p>`}
      ${app.actor.role === "client" ? html`<${ClientApprove} />` : html`<p class="muted small">Switch to Ngozi or Erik (client) to approve. Prior-year AGI for e-signature: ${fmt(P.household.prior_year_agi_for_esignature)}.</p>`}
    <//>
    <${Section} title="E-file" sub="Submission is blocked by firm standards until everything below is clear.">
      ${blockers.length ? html`<ul class="todo">${blockers.map((b) => html`<li><button class="linkish" onClick=${() => app.go(b.go)}>${b.label}</button></li>`)}</ul>` : html`<p class="good">Ready to file.</p>`}
      <${Btn} kind="primary" disabled=${!app.can("filing:efile_submit")} title=${app.why("filing:efile_submit")} onClick=${() => app.act("filing", null, { step: "efile_submit", note: "Federal 1040 + California 540NR transmitted" })}>Submit e-file<//>
      ${ourSubs.length > 0 && html`<ul class="log">${ourSubs.map((s) => html`<li><${When} at=${s.at} /> <${Who} id=${s.actor} /> ${s.note}</li>`)}</ul>`}
      ${S.rejected.filter((r) => r.type === "filing" && r.data.step === "efile_submit").map((r) => html`<p class="small bad">Refused <${When} at=${r.at} />: ${r.why}</p>`)}
      ${efile.length > 0 && html`<div class="tw"><table class="t"><caption>Agency acknowledgements</caption><thead><tr><th>When</th><th>Jurisdiction</th><th>Submission</th><th>Status</th><th>Errors</th></tr></thead><tbody>
        ${efile.map((x) => html`<tr class=${x.status === "rejected" ? "row-flag" : ""}><td class="small">${x.date.slice(0, 16).replace("T", " ")}</td><td>${x.jurisdiction}</td><td class="key">${x.submission_id}</td><td><${Pill} tone=${x.status === "accepted" ? "good" : x.status === "rejected" ? "bad" : "warn"}>${x.status}<//></td>
          <td class="small">${(x.errors || []).map((e) => html`<div><code>${e.code}</code> ${e.message} ${/Theo/.test(e.message) && html`<${Ref} r="F-THEO-SSN" />`}</div>`)}</td></tr>`)}
      </tbody></table></div>`}
    <//>
    <${Section} title="Freeze at filing; amend on top">
      ${S.frozen ? html`<p>Frozen <${When} at=${S.frozen.at} /> by <${Who} id=${S.frozen.actor} /> · fingerprint <code>${S.frozen.fingerprint}</code>. Filed federal tax <${Money} v=${Math.round(S.frozen.snapshot.summary.federal.total_tax)} />, California <${Money} v=${Math.round(S.frozen.snapshot.summary.california.total_tax)} />.</p>
        ${S.amendment ? html`<p>Amendment open since <${When} at=${S.amendment.at} />: ${S.amendment.reason}. Change vs filed: federal ${signed(amendDelta.f)}, California ${signed(amendDelta.c)} (Form 1040-X / 540X).</p>` : html`<${AmendOpen} />`}` : html`<p class="muted">After the return is accepted, freeze it. That records the filed numbers and every line. Further changes then go on an amendment layer, and the original stays intact.</p>
        <${Btn} disabled=${!app.can("filing:freeze")} title=${app.why("filing:freeze")} onClick=${freeze}>Freeze filed return<//>`}
    <//>
    ${app.clock >= "2026-07-20" && html`<${Section} title="After filing: payments and refunds">
      <div class="tw"><table class="t t-tight"><tbody>
        <tr><td>Federal ${filedBal > 0 ? "balance due" : "overpayment"} on the finalized return</td><td class="r"><${Money} v=${Math.round(Math.abs(filedBal))} /></td></tr>
        ${filedBal > 0 ? html`<tr><td>Paid 07/20/2026 (${lateDays} days late): interest at 7% (estimate)</td><td class="r"><${Money} v=${interest} /></td></tr><tr><td>Failure-to-pay penalty 0.5% per month or part (estimate)</td><td class="r"><${Money} v=${ftp} /></td></tr>` : html`<tr><td colspan="2" class="small">The scripted timeline says a balance was paid on 07/20/2026, but the finalized return shows an overpayment, so no 610 payment or 196/276 assessments should post. Confirm with the client that nothing was debited, and track the refund instead.</td></tr>`}
        ${app.clock >= "2026-08-21" && html`<tr><td>California refund issued 08/21/2026 (direct deposit)</td><td class="r"><${Money} v=${Math.round(-(S.frozen?.snapshot.summary.california.balance_due ?? fr.california.balance_due))} /></td></tr>`}
        <tr><td>FTB is holding 3,500 paid 09/15/2025 as a 2024 credit (F-CA-ESTIMATES)</td><td class="r"><${Money} v=${3500} /></td></tr>
      </tbody></table></div><//>`}
    <${Section} title="Client copy">
      <p class="small">A clean copy of the filed return summary, the changes we made, and the outside filings the client must handle themselves.</p>
      <${Btn} onClick=${() => app.download("Okafor-Lindqvist-2025-client-copy.html", clientCopyHtml(app))}>Download client copy<//>
    <//>
    ${app.clock >= "2028-01-20" && html`<${NoticeSection} />`}
  </div>`;
  }
  function AmendOpen() {
    const app = useApp();
    const [r, setR] = useState("");
    return html`<div class="row gap"><input class="in grow" aria-label="Reason for amendment" value=${r} onInput=${(e) => setR(e.target.value)} placeholder="Why amend (e.g. corrected K-1 received)" /><${Btn} disabled=${!r || !app.can("filing:amend_open")} title=${app.why("filing:amend_open")} onClick=${() => app.act("filing", null, { step: "amend_open", reason: r })}>Open amendment<//></div>`;
  }
  function ClientApprove() {
    const app = useApp();
    const [ok, setOk] = useState(false);
    const [pin, setPin] = useState("");
    return html`<div class="aform"><label class="chk"><input type="checkbox" checked=${ok} onChange=${(e) => setOk(e.target.checked)} /> I reviewed the return summary above and authorize Miraflores to e-file it (Form 8879 / FTB 8879).</label>
    <label>Your 5-digit signature PIN<input class="in num" inputmode="numeric" maxlength="5" value=${pin} onInput=${(e) => setPin(e.target.value.replace(/\D/g, ""))} /></label>
    <${Btn} kind="primary" disabled=${!ok || pin.length !== 5} onClick=${() => app.act("filing", null, { step: "client_approval", fingerprint: returnFingerprint(app.fr), summary: { f: Math.round(app.fr.federal.balance_due), c: Math.round(app.fr.california.balance_due) }, note: "Form 8879 and FTB 8879 signed electronically" })}>Approve and sign<//></div>`;
  }
  function NoticeSection() {
    const app = useApp();
    const n = app.M.P.tax_agency_records.notices.find((x) => x.type.startsWith("Letter 566"));
    const snap = app.S.frozen?.snapshot;
    const line = (k) => snap?.lines?.[k] ?? (app.eff.over.get(k)?.to ?? app.V.lineMap.get(k)?.value);
    const adjCar = [...app.S.adjustments.values()].find((a) => a.finding === "F-CAR-DONATION" && a.status === "active");
    const adjK = [...app.S.adjustments.values()].find((a) => a.finding === "F-1099K-DUP" && a.status === "active");
    const responded = app.S.filing.find((f) => f.step === "notice_response");
    return html`<${Section} title="IRS Letter 566 — examination of the 2025 return" sub=${`Dated ${n.dated}; response due ${n.response_due}. The response is built from the frozen filed record, so it stands on its own.`}>
    <ol class="bul">${n.items_under_examination.map((i) => html`<li>${i}</li>`)}</ol>
    <div class="grid2">
      <div class="tw"><table class="t t-tight"><caption>Item 1 — Noncash contributions (as filed)</caption><tbody>
        <tr><td>200 sh Northlake Total Market Index Fund to Austin Community Foundation DAF, 12/05/2025 (acknowledgment D65; held since 04/2019; FMV 72.50 high/low)</td><td class="r"><${Money} v=${line("F8283.A1.stock")} /></td></tr>
        <tr><td>2012 Subaru Outback to Lone Star Kids Auto Donation — limited to 1098-C gross proceeds (D66 box 4c)${adjCar ? "" : html` <${Pill} tone="bad">Filed at 6,000 — exposure<//>`}</td><td class="r"><${Money} v=${line("F8283.A1.vehicle")} /></td></tr>
      </tbody></table></div>
      <div class="tw"><table class="t t-tight"><caption>Item 2 — Gross receipts reconciliation (as filed)</caption><tbody>
        <tr><td>Forms 1099-NEC (Fennimore, Atlas, Sable & Finch, Riverbend, Quill)</td><td class="r"><${Money} v=${142e3} /></td></tr>
        <tr><td>Clients without a 1099 (11 small clients)</td><td class="r"><${Money} v=${9300} /></td></tr>
        <tr><td>Form 1099-K (Paywell) — Atlas card payments, also inside Atlas's 1099-NEC</td><td class="r"><${Money} v=${12400} /></td></tr>
        <tr class="tot"><td>Schedule C line 1 as filed</td><td class="r"><${Money} v=${line("SchC.1")} /></td></tr>
        <tr><td colspan="2" class="small">${adjK ? "Filed gross receipts equal the books, which tie to every third-party return; the 1099-K duplicates part of Atlas's 1099-NEC (deposit detail D15 p3)." : "The filed return double-counted the 1099-K. Concede 12,400 or file an amended return."}</td></tr>
      </tbody></table></div>
    </div>
    <div class="row gap">
      <${Btn} onClick=${() => app.download("Letter-566-response-2025.html", noticeHtml(app, n, line))}>Download response packet<//>
      <${Btn} disabled=${!app.can("filing:notice_response") || !!responded} title=${app.why("filing:notice_response")} onClick=${() => app.act("filing", null, { step: "notice_response", note: "Letter 566 response packet sent" })}>${responded ? "Response recorded" : "Record response sent"}<//>
    </div>
  <//>`;
  }
  var esc = (s) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  function docBlock(app, id) {
    const d = app.M.docs.get(id);
    return `<h3>${id} \u2014 ${esc(d.title)}</h3>${d.pages.map((p) => `<p><small>Page ${p.page}</small><br>${esc(p.printed_content)}</p>`).join("")}`;
  }
  function noticeHtml(app, n, line) {
    const adj = [...app.S.adjustments.values()].filter((a) => ["F-CAR-DONATION", "F-1099K-DUP"].includes(a.finding));
    return `<!doctype html><meta charset="utf-8"><title>Letter 566 response \u2014 2025</title><style>body{font:14px/1.5 system-ui;max-width:780px;margin:2rem auto;padding:0 1rem}table{border-collapse:collapse;width:100%}td{border-bottom:1px solid #ccc;padding:4px}</style>
<h1>Response to IRS Letter 566 (dated ${n.dated}) \u2014 Ngozi Okafor & Erik Lindqvist, 2025 Form 1040</h1>
<p>Prepared by Miraflores from the workpaper frozen at filing${app.S.frozen ? " on " + app.S.frozen.at.slice(0, 10) + " (fingerprint " + app.S.frozen.fingerprint + ")" : ""}.</p>
<h2>1. Noncash charitable contributions (Schedule A line 12, Form 8283)</h2>
<table><tr><td>Stock \u2014 200 sh Northlake Total Market Index Fund</td><td>${fmt(line("F8283.A1.stock"))}</td></tr><tr><td>Vehicle \u2014 2012 Subaru Outback (1098-C gross proceeds)</td><td>${fmt(line("F8283.A1.vehicle"))}</td></tr></table>
${docBlock(app, "D65")}${docBlock(app, "D66")}
<h2>2. Schedule C gross receipts</h2>
<table><tr><td>Forms 1099-NEC</td><td>142,000</td></tr><tr><td>Receipts without a 1099</td><td>9,300</td></tr><tr><td>Books revenue</td><td>151,300</td></tr><tr><td>Form 1099-K (included in Atlas Outdoor Gear's 1099-NEC)</td><td>12,400</td></tr><tr><td>Schedule C line 1 as filed</td><td>${fmt(line("SchC.1"))}</td></tr></table>
${["D14", "D15", "D16", "D17", "D18", "D19", "D20", "D21"].map((d) => docBlock(app, d)).join("")}
<h2>Workpaper adjustments on these items</h2><ul>${adj.map((a) => `<li>${esc(a.title || "")}: ${a.lines.map((l) => `${l.key} ${fmt(l.from)} \u2192 ${fmt(l.to)}`).join("; ")} \u2014 ${esc(a.reason)} (${a.at.slice(0, 10)})</li>`).join("") || "<li>None recorded.</li>"}</ul>`;
  }
  function clientCopyHtml(app) {
    const fr = app.S.frozen?.snapshot.summary || app.fr;
    const adjs = [...app.S.adjustments.values()].filter((a) => a.status === "active");
    const out = app.findings.filter((f) => f.kind === "outside_filing");
    return `<!doctype html><meta charset="utf-8"><title>2025 return \u2014 client copy</title><style>body{font:15px/1.55 system-ui;max-width:760px;margin:2rem auto;padding:0 1rem}td{padding:4px 8px;border-bottom:1px solid #ddd}</style>
<h1>Your 2025 tax return</h1><p>Ngozi Okafor & Erik Lindqvist \xB7 Form 1040 (married filing jointly) and California 540NR (part-year resident through 07/14/2025).</p>
<table><tr><td>Federal total tax</td><td>${fmt(Math.round(fr.federal.total_tax))}</td></tr><tr><td>Federal ${fr.federal.balance_due >= 0 ? "balance due" : "refund"}</td><td>${fmt(Math.abs(Math.round(fr.federal.balance_due)))}</td></tr><tr><td>California total tax</td><td>${fmt(Math.round(fr.california.total_tax))}</td></tr><tr><td>California ${fr.california.balance_due >= 0 ? "balance due" : "refund"}</td><td>${fmt(Math.abs(Math.round(fr.california.balance_due)))}</td></tr></table>
<h2>What we changed from the information we received</h2><ul>${adjs.map((a) => `<li>${esc(a.title)} \u2014 ${esc(a.reason)}</li>`).join("")}</ul>
<h2>Things you need to handle outside this return</h2><ul>${out.map((f) => `<li><strong>${esc(f.title)}.</strong> ${esc(f.summary)}</li>`).join("")}</ul>`;
  }
  function ClientHome() {
    const app = useApp();
    const { fr, S } = app;
    const qs = [...S.questions.values()].filter((q) => q.to === "client");
    const changes = [...S.adjustments.values()].filter((a) => a.status === "active");
    return html`<div class="view narrow"><p class="eyebrow">Miraflores client portal</p><h1>Your 2025 return</h1>
    <div class="hero-nums">
      <div class="hn"><span class="k">Federal ${fr.federal.balance_due >= 0 ? "you owe" : "refund"}</span><span class="big num">${fmt(Math.abs(Math.round(fr.federal.balance_due)))}</span></div>
      <div class="hn"><span class="k">California ${fr.california.balance_due >= 0 ? "you owe" : "refund"}</span><span class="big num">${fmt(Math.abs(Math.round(fr.california.balance_due)))}</span></div>
    </div>
    <${Section} title=${`Questions for you (${qs.filter((q) => !q.answers.length).length})`}>
      ${qs.length ? qs.map((q) => html`<div class="qcard"><strong>${q.text}</strong>${q.answers.map((a) => html`<blockquote class="quote">${a.text}</blockquote>`)}${!q.answers.length && html`<${AnswerBox} q=${q} />`}</div>`) : html`<${Empty}>No open questions.<//>`}
    <//>
    <${Section} title="What changed from what you told us">
      ${changes.length ? html`<ul class="bul">${changes.map((a) => html`<li>${a.title}</li>`)}</ul>` : html`<p class="muted">No changes yet.</p>`}
    <//>
    <${Section} title="Approve and sign"><${ClientApprove} /><//>
  </div>`;
  }
  function AboutView() {
    const app = useApp();
    const errs = app.findings.filter((f) => ["engine_error", "extraction_error", "client_conflict"].includes(f.kind));
    return html`<div class="view narrow prose">
    <p class="eyebrow">Design notes</p><h1>A workpaper is an evidence graph with a ledger</h1>
    <p>A traditional workpaper is a stack of spreadsheets, each copying numbers from the last, with tickmarks drawn by hand. Its job is to answer five questions about any number: where did it come from, what was done to it, who checked it, what is still open, and what did it look like on the day we filed. This workpaper answers those questions directly, from two parts.</p>
    <h3>1. Facts: the packet, never modified</h3>
    <p>The packet loads as delivered and becomes a graph. Return lines point to their inputs (how a number was built) and to their sources: extracted values, which point to a field on a page of a document. Client answers, prior-year pointers, agency records, assets and engine parameters are nodes too. Every reference format in the README resolves to something you can open, and every node knows what points at it. So a number traces down to the printed page, and a document traces up to every line it reached, or carries the reason it reached none.</p>
    <h3>2. Work: an append-only journal</h3>
    <p>Everything people do is an event: adjust, verify, note, review note, question, answer, decision, sign-off, time, unmask, filing step, undo. Nothing is overwritten. The workpaper's state is a replay of the facts plus the events up to the season clock. That one choice provides:</p>
    <ul class="bul">
      <li><strong>Originals kept.</strong> An adjustment records from/to, who, why and the tax effect. Reverting it is another event.</li>
      <li><strong>Enforced roles.</strong> Permissions are checked during replay, so an event someone was not allowed to make is recorded and shown as refused but has no effect. This covers self-review, partner approval over the threshold, staff not yet active, unmasking without clearance, and filing while review notes are open.</li>
      <li><strong>Sign-offs that reopen.</strong> A sign-off stores a fingerprint (hash) of every number, adjustment and approval in its area. Any later change, including a new engine version, makes it stale. Client approval works the same way for the bottom line.</li>
      <li><strong>History.</strong> "What changed since I last looked", version comparison, undo of a single action or a batch, freezing at filing with amendments layered on top, and replaying the season from January 2026 to the 2028 exam letter.</li>
      <li><strong>Several people at once.</strong> In the published app the journal is a shared document collection with live updates. Without it, the same journal lives in the browser.</li>
    </ul>
    <h3>Checks that don't trust the engine</h3>
    <p>${app.recompute.length} independent recomputations (W-2 sums, depreciation, the condo gain, S corp basis, 8606, SE tax, broker summaries against 260 lots, every total against its inputs) and ${app.findings.length} checks that read printed document text, agency records, client answers and the prior year. ${errs.length} of the findings are errors in the engine output or the extraction. The tax effect of each change uses the engine's per-dollar rates, or the exact what-if result where the engine supplied one. Lines downstream of an adjustment are marked for recompute instead of being silently re-added.</p>
    <h3>Simulated documents, real tracing</h3>
    <p>Pages render from <code>printed_content</code>, with each extracted value highlighted where its text appears. The viewer depends only on a renderer interface: <code>pages(doc)</code> and <code>locate(value, page)</code>. Swapping in page images that use the <code>position</code> boxes changes nothing upstream, because traces are stored as document, page and value id.</p>
    <h3>Tradeoffs</h3>
    <ul class="bul"><li>Tax effects are linear estimates between engine runs. The app shows which lines need a recompute rather than pretending to be an engine.</li><li>Checks are written against this packet's document types; a production version would make them declarative rules per form type.</li><li>The shared store is last-writer-per-event; the journal design makes merges trivial (events never conflict), but presence and locking are minimal.</li></ul>
    <h3>Errors found (${errs.length})</h3>
    <ol class="errs">${errs.map((f) => html`<li><button class="linkish" onClick=${() => app.open(f.id)}><strong>${f.title}</strong></button> <${Pill} tone=${KIND_TONE[f.kind]}>${KIND_LABEL[f.kind]}<//><div class="small">${f.how}</div></li>`)}</ol>
  </div>`;
  }

  // src/main.js
  var MILESTONES = [
    ["2026-01-21T12:00:00Z", "Jan 21 \xB7 first uploads"],
    ["2026-03-04T12:00:00Z", "Mar 4 \xB7 v1 computed"],
    ["2026-03-19T12:00:00Z", "Mar 19 \xB7 v2 (corrected Meridian)"],
    ["2026-04-14T18:00:00Z", "Apr 14 \xB7 extension filed"],
    ["2026-06-23T12:00:00Z", "Jun 23 \xB7 v3 (Ridgeline K-1)"],
    ["2026-07-09T12:00:00Z", "Jul 9 \xB7 final review"],
    ["2026-07-10T22:00:00Z", "Jul 10 \xB7 client approval"],
    ["2026-07-13T18:00:00Z", "Jul 13 \xB7 e-file rejected"],
    ["2026-07-15T12:00:00Z", "Jul 15 \xB7 accepted"],
    ["2026-08-21T18:00:00Z", "Aug 21 \xB7 CA refund"],
    ["2027-01-15T18:00:00Z", "Jan 2027 \xB7 next year starts"],
    ["2028-01-26T18:00:00Z", "Jan 2028 \xB7 IRS Letter 566"]
  ];
  var LS = { get: (k, d) => {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : d;
    } catch {
      return d;
    }
  }, set: (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
    }
  } };
  function App({ packet }) {
    const M = useMemo(() => buildModel(packet), [packet]);
    const actors = useMemo(() => actorsFrom(packet), [packet]);
    const actorById = useMemo(() => new Map(actors.map((a) => [a.id, a])), [actors]);
    const [events, setEvents] = useState([]);
    const [storeStatus, setStoreStatus] = useState({ label: "Loading\u2026" });
    const store = useRef(null);
    const [actorId, setActorId] = useState(LS.get("wp-actor", "st-01"));
    const [clock, setClock] = useState(LS.get("wp-clock", "2026-07-09T12:00:00Z"));
    const [route, setRoute] = useState(LS.get("wp-route", "overview"));
    const [trail, setTrail] = useState([]);
    const [revealed, setRevealed] = useState(/* @__PURE__ */ new Set());
    const [toast, setToast] = useState(null);
    const [modal, setModal] = useState(null);
    const [peers, setPeers] = useState([]);
    const [navOpen, setNavOpen] = useState(false);
    const actor = actorById.get(actorId) || actors[0];
    useEffect(() => {
      openStore(setEvents, setStoreStatus).then((s) => store.current = s);
    }, []);
    useEffect(() => {
      LS.set("wp-actor", actorId);
      LS.set("wp-clock", clock);
      LS.set("wp-route", route);
    }, [actorId, clock, route]);
    useEffect(() => {
      let room;
      (async () => {
        try {
          room = window.claude?.use ? await window.claude.use("room") : null;
          if (!room) return;
          room.onPeers((c) => setPeers(c.peers.filter((p) => !p.isMe)));
          room.presence({ persona: actorId, view: route });
        } catch {
        }
      })();
    }, []);
    useEffect(() => {
      (async () => {
        try {
          const room = window.claude?.use ? await window.claude.use("room") : null;
          room?.presence({ persona: actorId, view: route });
        } catch {
        }
      })();
    }, [actorId, route]);
    const V = useMemo(() => {
      const vs = M.versions.filter((v) => v.computed_at <= clock);
      return vs.length ? vs[vs.length - 1] : null;
    }, [M, clock]);
    const checks = useMemo(() => V ? runChecks(M, V) : { findings: [], recompute: [] }, [M, V]);
    const findings = useMemo(() => checks.findings.filter((f) => {
      const evid = f.evidence || [];
      for (const r of evid.filter((x) => !(f.later || []).includes(x))) {
        if (/^msg-/.test(r) && M.msgs.get(r)?.sent_at > clock) return false;
        const d = /^D\d\d$/.test(r) ? r : /^ev-/.test(r) ? M.evs.get(r)?.document_id : null;
        if (d && M.docs.get(d)?.received_at > clock) return false;
      }
      return true;
    }), [checks, clock]);
    const standards = useMemo(() => ({ ...packet.firm.starter_standards, partner_threshold: 1e3 }), [packet]);
    const S = useMemo(() => {
      if (!V) return null;
      const ctx = { actors, standards, assignment: packet.firm.assignment_at_start };
      ctx.filingBlockers = (s) => {
        const eff2 = effectiveLines(V, s);
        const fr2 = finalReturn(V, s);
        return filingBlockers({ V, eff: eff2, fr: fr2, findings, M }, s);
      };
      return replay(ctx, events, clock);
    }, [events, clock, V, findings]);
    const eff = useMemo(() => V && S ? effectiveLines(V, S) : null, [V, S]);
    const fr = useMemo(() => V && S ? finalReturn(V, S) : null, [V, S]);
    const findingByLine = useMemo(() => {
      const m = /* @__PURE__ */ new Map();
      for (const f of findings) {
        for (const l of f.proposal?.lines || []) if (!m.has(l.key)) m.set(l.key, f);
        for (const e of f.evidence || []) if (V?.lineMap.has(e) && !m.has(e)) m.set(e, f);
      }
      return m;
    }, [findings, V]);
    const verifiedSet = useMemo(() => new Set((S?.verifications || []).map((v) => v.target)), [S]);
    const pending = useRef(/* @__PURE__ */ new Set());
    useEffect(() => {
      if (!S) return;
      for (const r of S.rejected) if (pending.current.has(r.id)) {
        pending.current.delete(r.id);
        setToast({ msg: `Not applied: ${r.why}` });
      }
    }, [S]);
    if (!V) return html`<div class="boot"><h1>Okafor-Lindqvist 2025</h1><p>No return has been computed yet at ${clock.slice(0, 10)} — the first engine run is 2026-03-04.</p><button class="btn btn-primary" onClick=${() => setClock("2026-03-04T12:00:00Z")}>Jump to March 4</button></div>`;
    const canCap = (cap) => {
      if (!(ROLE_CAN[actor.role] || []).includes(cap)) return { ok: false, why: `${ROLE_LABEL[actor.role]}s can't do this` };
      if (actor.active_from && clock.slice(0, 10) < actor.active_from) return { ok: false, why: `${actor.name} joins the engagement on ${actor.active_from}` };
      if (S.frozen && !S.amendment && ["adjust", "adjust_revert", "adjust_approve"].includes(cap)) return { ok: false, why: "Frozen at filing \u2014 open an amendment" };
      return { ok: true };
    };
    const notify = (msg, undo) => {
      setToast({ msg, undo });
      clearTimeout(window.__t);
      window.__t = setTimeout(() => setToast(null), 6e3);
    };
    const append = async (evs) => {
      (Array.isArray(evs) ? evs : [evs]).forEach((e) => pending.current.add(e.id));
      await store.current?.append(evs);
    };
    const act = (type, target, data, extra = {}) => {
      const e = newEvent(actor, type, target, data, clock, extra);
      append(e);
      if (!["seen", "unmask"].includes(type)) notify(`${labelFor(type, data)} saved`, type === "undo" ? null : () => act("undo", null, { event: e.id }));
      return e;
    };
    const actBatch = (list, label) => {
      const batch = "b-" + Date.now().toString(36);
      const evs = list.map(([t, tg, d]) => newEvent(actor, t, tg, d, clock, { batch }));
      append(evs);
      notify(`${label} (${evs.length})`, () => act("undo", null, { batch }));
    };
    const findingEvents = (f) => {
      const evs = [["adjust", f.proposal.lines[0]?.key, { finding: f.id, title: f.title, lines: f.proposal.lines, effects: f.proposal.effects, reason: f.summary.split(". ")[0] + ".", verification: f.proposal.verification, area: f.area, election: !!f.proposal.election, whatIf: f.proposal.whatIf }]];
      if (f.id === "F-THEO-SSN") evs.push(["household", "household:theo", { path: "theo.ssn", value: f.proposal.lines[0].to }]);
      return evs;
    };
    const app = {
      M,
      V,
      S,
      eff,
      fr,
      actors,
      actorById,
      actor,
      clock,
      findings,
      recompute: checks.recompute,
      findingByLine,
      verifiedSet,
      revealed,
      storeStatus,
      route,
      isOwnerish: true,
      revealAll: false,
      canSeeSensitive: actor.clearance,
      can: (cap) => canCap(cap).ok,
      why: (cap) => canCap(cap).why || "",
      act,
      actBatch,
      applyFinding: (f) => {
        const evs = findingEvents(f);
        if (evs.length === 1) act(...evs[0]);
        else actBatch(evs, f.title);
      },
      applyFindings: (fs) => actBatch(fs.flatMap(findingEvents), `Applied ${fs.length} adjustments`),
      open: (ref) => {
        if (!ref) {
          setTrail([]);
          return;
        }
        setTrail((t) => t[t.length - 1] === ref ? t : [...t.slice(-7), ref]);
      },
      openAt: (i) => setTrail((t) => t.slice(0, i + 1)),
      get openRef() {
        return trail[trail.length - 1];
      },
      trail,
      go: (r) => {
        const map = { carryovers: "schedules/carryovers", payments: "schedules/payments" };
        if (/^(F-|D\d\d|ev-|asset:|household:|qa-|msg-|call-)/.test(r) || V.lineMap.has(r)) {
          app.open(r);
          return;
        }
        setRoute(map[r] || r);
        setNavOpen(false);
        window.scrollTo?.(0, 0);
      },
      reveal: (target, what) => {
        if (!actor.clearance) return;
        act("unmask", target, { what });
        setRevealed(/* @__PURE__ */ new Set([...revealed, target]));
      },
      download: async (name, content) => {
        try {
          const d = window.claude?.use ? await window.claude.use("downloads") : null;
          if (d) {
            await d.save({ filename: name, data: content });
            return;
          }
        } catch {
        }
        setModal({ title: name, body: html`<p class="small">Downloads aren't available in this view. Copy the HTML below and save it as <code>${name}</code>.</p><textarea class="in mono" rows="14" readonly>${content}</textarea>` });
      },
      loadDemo: async () => {
        const evs = demoEvents(M, checks.findings);
        const ctx = { actors, standards, assignment: packet.firm.assignment_at_start };
        for (const e of evs) if (e.type === "signoff") {
          const Vt = M.versions.filter((v) => v.computed_at <= e.at).at(-1);
          const prior = evs.slice(0, evs.indexOf(e));
          const St = replay(ctx, [...events, ...prior], e.at);
          e.data.fingerprint = areaFingerprint(Vt, St, e.data.area, effectiveLines(Vt, St));
        }
        await append(evs);
        notify(`Loaded ${evs.length} demo events (Mar\u2013Jul 2026)`);
      },
      resetAll: () => setModal({ title: "Reset the workpaper journal?", body: html`<p>This deletes every recorded action (adjustments, notes, sign-offs) for everyone using this workpaper. The packet is untouched.</p><div class="row gap"><button class="btn btn-danger" onClick=${async () => {
        await store.current.reset();
        setModal(null);
        notify("Journal cleared");
      }}>Delete all actions</button><button class="btn" onClick=${() => setModal(null)}>Cancel</button></div>` })
    };
    const isClient = actor.role === "client";
    const [view, sub] = route.split("/");
    let body;
    if (isClient) body = route === "filing" ? html`<${FilingView} />` : route === "documents" ? html`<${DocumentsView} />` : html`<${ClientHome} />`;
    else if (route.startsWith("area:")) body = html`<${AreaView} id=${route.slice(5)} />`;
    else body = { overview: html`<${Overview} />`, return: html`<${ReturnView} />`, documents: html`<${DocumentsView} />`, findings: html`<${FindingsView} />`, adjustments: html`<${AdjustmentsView} />`, variances: html`<${VariancesView} />`, diagnostics: html`<${DiagnosticsView} />`, schedules: html`<${SchedulesView} tab=${sub} />`, review: html`<${ReviewView} />`, activity: html`<${ActivityView} />`, compare: html`<${CompareView} />`, whatif: html`<${WhatIfView} />`, filing: html`<${FilingView} />`, firm: html`<${FirmView} />`, about: html`<${AboutView} />` }[view] || html`<${Overview} />`;
    const openRN = [...S.reviewNotes.values()].filter((n) => !n.resolved).length;
    const openErr = findings.filter((f) => ["engine_error", "extraction_error", "client_conflict"].includes(f.kind) && (S.findingStatus.get(f.id)?.status || "open") === "open").length;
    const seen = S.seen.get(actor.id);
    const newCount = seen ? S.events.filter((e) => e.at > seen && e.actor !== actor.id && e.type !== "seen").length + [...M.docs.values()].filter((d) => d.received_at > seen && d.received_at <= clock).length : 0;
    const NAV = isClient ? [["Your return", [["home", "Summary & questions"], ["documents", "Documents"], ["filing", "Approve & sign"]]]] : [
      ["Return", [["overview", "Overview"], ["return", "Return lines"], ["schedules", "Schedules"], ["documents", "Documents"]]],
      ["Evidence & judgment", [["findings", "Findings", openErr], ["adjustments", "Adjustments"], ["variances", "Variances"], ["diagnostics", "Engine diagnostics"]]],
      ["People & change", [["review", "Review", openRN], ["activity", "Activity", newCount], ["compare", "Compare versions"], ["whatif", "What-ifs"]]],
      ["Filing & firm", [["filing", "Filing"], ["firm", "Firm"], ["about", "Design notes"]]]
    ];
    return html`<${Ctx.Provider} value=${app}>
    <div class=${cx("shell", trail.length && "with-insp")}>
      <header class="top">
        <button class="hamb" aria-label="Menu" onClick=${() => setNavOpen(!navOpen)}>☰</button>
        <div class="brand"><span class="mark">M</span><span><strong>Miraflores</strong> <span class="muted">Workpaper</span></span></div>
        <div class="client">Okafor-Lindqvist · 2025</div>
        <${Search} />
        <label class="clock" title="Season clock: replay the engagement as of any date">
          <span class="k">As of</span>
          <select aria-label="Season clock" value=${MILESTONES.some((m) => m[0] === clock) ? clock : ""} onChange=${(e) => e.target.value && setClock(e.target.value)}>
            ${!MILESTONES.some((m) => m[0] === clock) && html`<option value="">${clock.slice(0, 10)}</option>`}
            ${MILESTONES.map(([v, l]) => html`<option value=${v}>${l}</option>`)}</select>
          <input type="date" aria-label="Exact date" value=${clock.slice(0, 10)} min="2026-01-12" max="2028-12-31" onChange=${(e) => e.target.value && setClock(e.target.value + "T23:59:00Z")} />
        </label>
        <label class="persona"><span class="k">Acting as</span>
          <select aria-label="Role switcher" value=${actorId} onChange=${(e) => {
      setActorId(e.target.value);
      setRevealed(/* @__PURE__ */ new Set());
      if (actorById.get(e.target.value).role === "client") setRoute("home");
      else if (route === "home") setRoute("overview");
    }}>
            ${actors.map((a) => html`<option value=${a.id}>${a.name} — ${ROLE_LABEL[a.role]}${a.credential ? ", " + a.credential : ""}</option>`)}</select></label>
        <div class="presence">${peers.slice(0, 4).map((p) => html`<span class="peer" title=${"Also here: " + (actorById.get(p.presence?.persona)?.name || "someone") + " \xB7 " + (p.presence?.view || "")}>${(actorById.get(p.presence?.persona)?.name || "?")[0]}</span>`)}
          <span class=${cx("store", storeStatus.mode === "shared" && "store-on")} title=${storeStatus.label}>●</span></div>
      </header>
      ${actor.active_from && clock.slice(0, 10) < actor.active_from && html`<div class="banner banner-warn">${actor.name} is not on the engagement until ${actor.active_from}: read-only at this date.</div>`}
      ${!actor.clearance && html`<div class="banner banner-warn">${actor.name} has no sensitive-data clearance: SSNs, bank and account numbers and IP PINs stay masked.</div>`}
      <nav class=${cx("nav", navOpen && "open")} aria-label="Workpaper sections">
        ${NAV.map(([g, items]) => html`<div class="navg"><div class="navh">${g}</div>${items.map(([id, label, badge]) => html`<button class=${cx("navi", (route === id || route.startsWith(id + "/")) && "cur")} onClick=${() => app.go(id)}>${label}${badge ? html`<span class="badge">${badge}</span>` : ""}</button>`)}</div>`)}
        ${!isClient && html`<div class="navg"><div class="navh">Areas</div>${AREAS.map((a) => html`<button class=${cx("navi", "navi-sm", route === "area:" + a.id && "cur")} onClick=${() => app.go("area:" + a.id)}>${a.short}</button>`)}</div>`}
        <div class="navfoot small muted">Engine ${V.version} · ${events.length} journal events<br />${storeStatus.label}</div>
      </nav>
      <main class="main" id="main">${body}</main>
      ${trail.length > 0 && html`<${Inspector} />`}
    </div>
    ${toast && html`<div class="toast" role="status">${toast.msg}${toast.undo && html` <button class="linkish" onClick=${() => {
      toast.undo();
      setToast(null);
    }}>Undo</button>`}</div>`}
    ${modal && html`<${Modal} title=${modal.title} onClose=${() => setModal(null)}>${modal.body}<//>`}
  <//>`;
  }
  function labelFor(type, d) {
    return { adjust: "Adjustment", verify: "Verification", note: "Note", review_note: "Review note", review_reply: "Reply", review_resolve: "Review note cleared", question: "Question", answer: "Answer", signoff: "Sign-off", decision: "Decision", attach: "Attachment", time: "Time", filing: "Filing step", finding_status: "Finding status", adjust_approve: "Approval", adjust_revert: "Revert", standard: "Standards", undo: "Undo", household: "Household correction" }[type] || type;
  }
  function Search() {
    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    return html`<${SearchInner} q=${q} setQ=${setQ} open=${open} setOpen=${setOpen} />`;
  }
  function SearchInner({ q, setQ, open, setOpen }) {
    const app = useApp();
    const res = useMemo(() => {
      if (q.length < 2) return [];
      const s = q.toLowerCase();
      const out = [];
      for (const l of app.V.lines) if ((l.key + " " + l.label).toLowerCase().includes(s)) out.push({ r: l.key, t: l.label, k: "Line" });
      for (const d of app.M.docs.values()) if ((d.id + " " + d.title + " " + d.issuer).toLowerCase().includes(s)) out.push({ r: d.id, t: d.title, k: "Document" });
      for (const f of app.findings) if ((f.id + " " + f.title).toLowerCase().includes(s)) out.push({ r: f.id, t: f.title, k: "Finding" });
      for (const qq of app.M.qa.values()) if ((qq.question + " " + qq.answer).toLowerCase().includes(s)) out.push({ r: qq.id, t: qq.question, k: "Client answer" });
      for (const m of app.M.msgs.values()) if (m.text.toLowerCase().includes(s)) out.push({ r: m.id, t: m.text, k: "Message" });
      if (out.length < 40) for (const e of app.M.evs.values()) {
        if ((e.label + " " + e.value).toLowerCase().includes(s)) out.push({ r: e.id, t: `${e.document_id} \xB7 ${e.label}: ${e.value}`, k: "Value read" });
        if (out.length > 60) break;
      }
      return out.slice(0, 40);
    }, [q, app.V]);
    return html`<div class="search"><input class="in" type="search" aria-label="Search the workpaper" placeholder="Search lines, documents, findings, answers…" value=${q} onInput=${(e) => {
      setQ(e.target.value);
      setOpen(true);
    }} onFocus=${() => setOpen(true)} onBlur=${() => setTimeout(() => setOpen(false), 200)} />
    ${open && res.length > 0 && html`<div class="sres">${res.map((x) => html`<button onMouseDown=${() => {
      app.go(x.r);
      setOpen(false);
    }}><span class="muted small">${x.k}</span> <code>${x.r}</code> ${x.t}</button>`)}</div>`}</div>`;
  }
  async function boot() {
    const root = document.getElementById("app");
    try {
      const res = await fetch("packet.json");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const packet = await res.json();
      render(html`<${App} packet=${packet} />`, root);
    } catch (e) {
      render(html`<div class="boot"><h1>Load the packet</h1><p>Couldn't fetch <code>packet.json</code> (${String(e.message)}). Choose the packet file to open it here.</p>
      <input type="file" accept="application/json" onChange=${async (ev) => {
        const t = await ev.target.files[0].text();
        render(html`<${App} packet=${JSON.parse(t)} />`, root);
      }} /></div>`, root);
    }
  }
  boot();
})();
