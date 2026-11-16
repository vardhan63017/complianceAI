/* Plan: programme list & approval, programme grid, clause coverage, cycle plan builder, audit calendar. */
(function (CA) {
  var esc = CA.esc;
  var PRG_STEPS = ["Draft", "In review", "Approved"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // ---------- Programme list & form ----------
  CA.route("programmes", {
    title: "Audit programmes", roles: "pm be ex", nav: "programmes",
    render: function (p, q) {
      var S = CA.S, draft = q.edit ? CA.programme(q.edit) : S.programmes.filter(function (x) { return x.status === "Draft"; })[0];
      return CA.head({ crumbs: [["Plan"], ["Programmes"]], title: "Audit programmes", actions: CA.btn({ text: "New programme", icon: "plus-lg", action: "prg-new", roles: "pm", cls: "btn-ink" }),
        sub: "The programme sets half-year coverage and strategy across the organisation (cycles, standards, BUs, external audits). It is not the detailed session schedule — that is the cycle plan." }) +
        CA.table([
          { k: "id", label: "ID", fmt: function (r) { return CA.idLink("programme/" + r.id, r.id); } }, { k: "name", label: "Programme" }, { k: "cycle", label: "Cycles" },
          { k: "standards", label: "Standards", sort: false, fmt: function (r) { return r.standards.join(", "); } }, { k: "manager", label: "Programme manager" },
          { k: "period", label: "Period", sort: false, fmt: function (r) { return CA.d(r.start) + " – " + CA.d(r.end); } },
          { k: "status", label: "Status", fmt: function (r) { return CA.chip(r.status) + (r.approvedBy ? '<div class="approval-stamp">' + esc(r.approvedBy) + "</div>" : ""); } }
        ], S.programmes, { id: "t-prg", rowRoute: function (r) { return "programme/" + r.id; }, flash: CA.ui.flash }) +
        (draft ? programmeForm(draft) : '<div class="info-banner"><i class="bi bi-check2-circle"></i><span>No draft programme. Open a programme to review its grid and approval.</span></div>');
    }
  });
  function programmeForm(g) {
    var bus = CA.S.bus, stds = ["ISO 9001", "ISO/IEC 20000-1", "ISO/IEC 27001", "ISO 14001", "ISO 45001"];
    var canEdit = CA.can("pm");
    return '<section class="card-ca"><h2 class="card-title"><i class="bi bi-pencil-square"></i> ' + esc(g.id) + " · " + esc(g.name) + " " + CA.chip(g.status) + "</h2>" + CA.timeline(PRG_STEPS, PRG_STEPS.indexOf(g.status)) +
      '<form data-form="programme" data-id="' + g.id + '" novalidate class="row g-3"><fieldset class="row g-3 m-0 p-0"' + (canEdit ? "" : " disabled") + ">" +
      CA.field({ name: "name", label: "Programme name", value: g.name, required: true, col: "col-md-6" }) +
      CA.field({ name: "year", label: "Year", type: "number", value: String(g.year), required: true, min: "2026", max: "2030", col: "col-md-2" }) +
      CA.field({ name: "type", label: "Audit type", type: "select", value: g.type, options: ["Internal Audit", "External surveillance (SV1)", "Supplier audit"], required: true, col: "col-md-4" }) +
      CA.field({ name: "cycle", label: "Cycle / half-year", type: "select", value: g.cycle, options: ["H1-2027 (IQA1) + H2-2027 (IQA2)", "H1-2027 (IQA1)", "H2-2027 (IQA2)"], required: true, col: "col-md-6" }) +
      CA.field({ name: "manager", label: "Programme manager", value: g.manager, required: true, col: "col-md-6" }) +
      CA.field({ name: "start", label: "Start date", type: "date", value: g.start, required: true, col: "col-md-3" }) +
      CA.field({ name: "end", label: "End date", type: "date", value: g.end, required: true, col: "col-md-3" }) +
      CA.field({ name: "coverage", label: "Country / BU coverage", type: "select", value: g.coverage, options: ["All 19 BUs · UAE, Bahrain, KSA, Oman", "UAE BUs only", "Selected BUs"], required: true, col: "col-md-6" }) +
      '<fieldset class="col-12"><legend class="form-label req">Standards</legend><div class="d-flex flex-wrap gap-3">' + stds.map(function (s, i) { return '<div class="form-check"><input class="form-check-input" type="checkbox" data-multi="1" name="standards" value="' + s + '" id="ps' + i + '"' + (g.standards.indexOf(s) > -1 ? " checked" : "") + '><label class="form-check-label" for="ps' + i + '">' + s + "</label></div>"; }).join("") + "</div></fieldset>" +
      '<div class="col-12 small-muted">' + bus.length + " BUs in the universe · external surveillance (SV1) by the certification body is recorded in the programme; its date is TBC in the demo.</div>" +
      "</fieldset>" + (canEdit ? '<div class="col-12 d-flex gap-2"><button class="btn btn-soft" type="submit" name="act" value="save" formnovalidate>Save draft</button><button class="btn btn-ink" type="submit" name="act" value="submit"><i class="bi bi-send"></i> Submit for review</button></div>' : '<div class="col-12">' + CA.btn({ text: "Edit programme", roles: "pm" }) + "</div>") + "</form></section>";
  }
  CA.onForm("programme", function (form, d, submitter) {
    var g = CA.programme(form.dataset.id);
    if (!d.standards.length) { CA.toast("Select at least one standard.", "warn"); return; }
    if (d.end < d.start) { CA.toast("End date must be after the start date.", "warn"); return; }
    Object.assign(g, { name: d.name, year: +d.year, type: d.type, cycle: d.cycle, manager: d.manager, start: d.start, end: d.end, coverage: d.coverage, standards: d.standards });
    if (submitter && submitter.value === "submit") {
      g.status = "In review"; g.history.push({ ts: CA.stamp(), who: CA.me().user, what: "Submitted for review" });
      CA.log("Submitted", g.id, "Programme submitted for review"); CA.store.save();
      CA.toast("Programme " + g.id + " submitted for review"); CA.go("programme/" + g.id);
    } else { CA.log("Saved", g.id, "Programme draft saved"); CA.store.save(); CA.toast("Draft saved"); CA.render(); }
  });
  CA.on("prg-new", function () {
    CA.modal({ title: "New programme", okText: "Create draft", body: '<form novalidate class="grid gap-2">' + CA.field({ name: "name", label: "Programme name", required: true, value: "Internal Audit Programme 2028" }) + CA.field({ name: "year", label: "Year", type: "number", value: "2028", required: true }) + "</form>",
      onOk: function (b) { var d = CA.formData(b.querySelector("form")), id = "PRG-" + d.year + (CA.programme("PRG-" + d.year) ? "-" + (CA.S.programmes.length + 1) : ""); CA.S.programmes.unshift({ id: id, name: d.name, year: +d.year, cycle: "H1-2027 (IQA1) + H2-2027 (IQA2)", type: "Internal Audit", standards: ["ISO 9001"], coverage: "All 19 BUs · UAE, Bahrain, KSA, Oman", manager: CA.me().user, start: d.year + "-04-20", end: d.year + "-11-30", status: "Draft", history: [{ ts: CA.stamp(), who: CA.me().user, what: "Programme drafted" }], approvedBy: "" }); CA.ui.flash = id; CA.log("Created", id, d.name); CA.toast("Draft " + id + " created"); CA.go("programmes?edit=" + id); } });
  });

  // ---------- Programme review & grid ----------
  CA.route("programme/:id", {
    title: function (p) { return "Programme " + p.id; }, roles: "pm be ex", nav: "programmes",
    render: function (p) {
      var g = CA.programme(p.id); if (!g) return CA.empty("question-circle", "Programme not found", esc(p.id));
      var S = CA.S, idx = PRG_STEPS.indexOf(g.status);
      var acts = g.status === "In review" ? CA.btn({ text: "Return to draft", action: "prg-return", data: { id: g.id }, roles: "be" }) + CA.btn({ text: "Approve programme", icon: "check2-circle", action: "prg-approve", data: { id: g.id }, roles: "be", cls: "btn-okay" }) :
        g.status === "Draft" ? CA.btn({ text: "Edit & submit", href: "programmes?edit=" + g.id, cls: "btn-ink", roles: "pm" }) : CA.btn({ text: "Build cycle plan", icon: "calendar-week", href: "cycle", cls: "btn-ink", roles: "pm" });
      var year = g.year;
      return CA.head({ crumbs: [["Plan"], ["Programmes", "programmes"], [g.id]], title: g.name, chips: CA.chip(g.status), actions: acts }) + CA.timeline(PRG_STEPS, g.status === "Approved" ? 3 : idx) +
        '<div class="grid g-side"><section class="card-ca"><h2 class="card-title">Programme grid · BUs × months ' + CA.demo() + '</h2><div class="table-wrap"><table class="table-ca pgrid"><thead><tr><th>Business unit</th>' + MONTHS.map(function (m) { return "<th>" + m + "</th>"; }).join("") + "</tr></thead><tbody>" +
        S.bus.map(function (b) {
          var sl = S.slots.filter(function (s) { return s.bu === b.id; })[0], m1 = sl && year === 2027 ? +sl.date.slice(5, 7) - 1 : 4;
          var m2 = 9 + (b.id.charCodeAt(4) % 2);
          return "<tr><td>" + esc(b.name) + "</td>" + MONTHS.map(function (x, i) { return "<td>" + (i === m1 ? '<span class="m iqa1">IQA1</span>' : i === m2 ? '<span class="m iqa2">IQA2</span>' : "") + "</td>"; }).join("") + "</tr>";
        }).join("") + '<tr><td><b>External (certification body)</b></td>' + MONTHS.map(function (x, i) { return "<td>" + (i === 6 ? '<span class="m sv" title="Date TBC">SV1?</span>' : "") + "</td>"; }).join("") + "</tr></tbody></table></div>" +
        '<p class="small-muted mb-0"><span class="m iqa1 pgrid" style="padding:0 4px;border-radius:3px;background:var(--ph-prep);color:#fff">IQA1</span> H1 internal audit · <span style="padding:0 4px;border-radius:3px;background:var(--ph-plan);color:#fff">IQA2</span> H2 internal audit · <span style="padding:0 4px;border-radius:3px;background:var(--ph-audit);color:#fff">SV1</span> external surveillance (date TBC, illustrative).</p></section>' +
        '<div class="grid"><section class="card-ca"><h2 class="card-title">Summary</h2><dl class="row small mb-0"><dt class="col-5">Cycles</dt><dd class="col-7">' + esc(g.cycle) + '</dd><dt class="col-5">Type</dt><dd class="col-7">' + esc(g.type) + '</dd><dt class="col-5">Standards</dt><dd class="col-7">' + esc(g.standards.join(", ")) + '</dd><dt class="col-5">Coverage</dt><dd class="col-7">' + esc(g.coverage) + '</dd><dt class="col-5">Manager</dt><dd class="col-7">' + esc(g.manager) + '</dd><dt class="col-5">Period</dt><dd class="col-7">' + CA.d(g.start) + " – " + CA.d(g.end) + "</dd></dl>" +
        (g.approvedBy ? '<div class="ai-box approved"><span class="human-tag"><i class="bi bi-person-check"></i> Approved</span><span class="small">' + esc(g.approvedBy) + " · " + esc(g.approvedAt || "") + "</span></div>" : "") +
        '<div class="info-banner"><i class="bi bi-gear"></i><span>No AI here. Programme approval runs on rules and a named approver (explanation reference).</span></div></section>' +
        '<section class="card-ca"><h2 class="card-title">History</h2>' + CA.history(g.history.slice().reverse()) + '</section><a class="btn btn-soft btn-sm" href="#/coverage">Clause coverage report →</a></div></div>';
    }
  });
  CA.on("prg-approve", function (el) {
    var g = CA.programme(el.dataset.id);
    CA.confirm("Approve " + g.id + "?", "Your name, role and the time are recorded on the programme and in the audit trail.", "Approve", function () {
      g.status = "Approved"; g.approvedBy = CA.me().user + " (" + CA.me().label + ")"; g.approvedAt = CA.stamp();
      g.history.push({ ts: g.approvedAt, who: CA.me().user, what: "Approved" }); CA.log("Approved", g.id, "Programme approved"); CA.store.save(); CA.toast("Programme " + g.id + " approved"); CA.render();
    }, "btn-okay");
  });
  CA.on("prg-return", function (el) {
    var g = CA.programme(el.dataset.id);
    CA.modal({ title: "Return " + g.id + " to draft", okText: "Return", body: '<form novalidate>' + CA.field({ name: "reason", label: "Reason", type: "textarea", required: true }) + "</form>",
      onOk: function (b) { var d = CA.formData(b.querySelector("form")); g.status = "Draft"; g.history.push({ ts: CA.stamp(), who: CA.me().user, what: "Returned: " + d.reason }); CA.log("Returned", g.id, d.reason); CA.toast("Returned to draft", "warn"); CA.render(); } });
  });

  // ---------- Clause coverage ----------
  CA.route("coverage", {
    title: "Clause coverage", roles: "pm be", nav: "coverage",
    render: function () {
      var S = CA.S, groups = CA.CLAUSE_GROUPS, sales = CA.audit("IA-2027-001");
      function cell(b, g, gi) {
        var planned = S.slots.some(function (s) { return s.bu === b.id && s.focus.split(", ")[1] && s.focus.split(", ")[1].split(".")[0] === g[0]; }) ||
          (b.id === "BU-01" && sales.checklist && sales.checklist.state === "Approved" && CA.checklistItems(sales).some(function (i) { return i.clause.split(".")[0] === g[0]; }));
        var covered = ((b.id.charCodeAt(3) + b.id.charCodeAt(4) + gi * 3) % 4) !== 0;
        return planned ? '<i class="bi bi-circle-half cov-plan" title="Planned H1-2027"></i>' : covered ? '<i class="bi bi-check-circle-fill cov-yes" title="Covered in H1-2026 / H2-2026"></i>' : '<i class="bi bi-dot cov-no" title="Not yet covered in this certification cycle"></i>';
      }
      var gaps = 0;
      S.bus.forEach(function (b) { groups.forEach(function (g, gi) { if (cell(b, g, gi).indexOf("cov-no") > -1) gaps++; }); });
      return CA.head({ crumbs: [["Plan"], ["Clause coverage"]], title: "Clause coverage report", chips: CA.demo(), sub: "Shows that every clause group is audited for every BU within the certification cycle. Gaps feed the next cycle's programme." }) +
        '<div class="grid g3 stagger">' + CA.kpi(String(S.bus.length * groups.length), "BU × clause-group cells") + CA.kpi(String(gaps), "Not yet covered", "", gaps ? "bad" : "good") + CA.kpi(sales.checklist && sales.checklist.state === "Approved" ? "Yes" : "Not yet", "Sales checklist feeds coverage") + "</div>" +
        '<div class="table-wrap"><table class="table-ca pgrid"><thead><tr><th>Business unit</th>' + groups.map(function (g) { return '<th title="' + esc(g[1]) + '">' + g[0] + " " + esc(g[1].split(" ")[0]) + "</th>"; }).join("") + "</tr></thead><tbody>" +
        S.bus.map(function (b) { return "<tr><td>" + CA.link("bu/" + b.id, b.name) + "</td>" + groups.map(function (g, gi) { return "<td>" + cell(b, g, gi) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>" +
        '<p class="small-muted"><i class="bi bi-check-circle-fill cov-yes"></i> covered · <i class="bi bi-circle-half cov-plan"></i> planned H1-2027 · <i class="bi bi-dot cov-no"></i> gap</p>';
    }
  });

  // ---------- Cycle plan builder ----------
  CA.route("cycle", {
    title: "Cycle plan builder", roles: "pm", nav: "cycle",
    render: function (p, q) {
      var S = CA.S, cp = S.cyclePlan, view = q.view || "table";
      var flags = S.slots.filter(function (s) { return s.flag && !s.override; });
      var pub = cp.status === "Published";
      return CA.head({ crumbs: [["Plan"], ["Cycle plan builder"]], title: "H1-2027 · IQA1 cycle plan", chips: CA.chip(cp.status) + (pub ? "" : CA.chip("A05 proposed · not yet published", "ai")),
        actions: CA.btn({ text: "Ask AI to propose slots", icon: "stars", action: "a05-propose", roles: "pm", cls: "btn-ai", disabled: pub }) + CA.btn({ text: "Add slot", icon: "plus", action: "slot-edit", roles: "pm" }) +
          CA.btn({ text: pub ? "Re-send updates" : "Publish & send invites", icon: "send", action: "publish-plan", roles: "pm", cls: "btn-ink" }),
        sub: "Replaces the Plan_IA sheet. Columns follow the existing cycle-plan template: department, team manager, location (office / Teams), focus area, auditor, auditees, planned date, slot, duration (30–90 min), actual date and status." }) +
        '<div class="grid g4 stagger">' + CA.kpi("19", "BUs in scope", CA.src()) + CA.kpi(String(S.auditors.length), "Auditors in directory", CA.demo()) + CA.kpi(CA.d(cp.opening), "IQA1 opening meeting (about)", CA.src("Explanation ref.")) + CA.kpi(String(flags.length), "Impartiality flags to resolve", "", flags.length ? "bad" : "good") + "</div>" +
        (pub ? '<div class="ai-box approved"><span class="human-tag"><i class="bi bi-person-check"></i> Published by ' + esc(cp.publishedBy) + " · " + esc(cp.publishedAt) + '</span><span class="small">Outlook invitations with Teams links ' + CA.sim("simulated") + ". Invitation status per slot is shown below.</span></div>" :
          '<div class="ai-box"><span class="ai-tag"><i class="bi bi-stars"></i> Simulated AI suggestion · A05 Audit Planner</span><span class="small">Auditor and slot proposals (blue cells) are ranked on competence for the standard, experience, location and Outlook free/busy (simulated). The impartiality rule and 24-month cooling-off check are deterministic and raise flags for a person to resolve. <b>Nothing is sent until the Programme Manager publishes.</b></span></div>') +
        (flags.length ? '<div class="sim-banner" style="border-color:var(--bad);background:var(--bad-soft);color:var(--bad)"><i class="bi bi-exclamation-octagon"></i><span>' + flags.map(function (s) { return "<b>" + esc(s.dept) + ":</b> " + esc(s.flag) + ' <button class="btn btn-sm btn-soft ms-1" data-action="slot-edit" data-id="' + s.id + '">Resolve</button>'; }).join("<br>") + "</span></div>" : "") +
        '<div class="tabs-ca"><a href="#/cycle" aria-selected="' + (view === "table") + '"><i class="bi bi-table"></i> Table</a><a href="#/cycle?view=calendar" aria-selected="' + (view === "calendar") + '"><i class="bi bi-calendar3"></i> Calendar</a></div>' +
        (view === "calendar" ? CA.calendarView(q.m || "2027-05") : slotTable(pub));
    }
  });
  function slotTable(pub) {
    var S = CA.S, ai = function (s) { return !pub && s.status === "AI proposed" ? "ai-cell" : ""; };
    return CA.table([
      { k: "dept", label: "Department", fmt: function (s) { return "<b>" + esc(s.dept) + '</b><div class="small-muted">' + CA.idLink("audit/" + s.audit, s.audit) + "</div>"; } },
      { k: "manager", label: "Team manager" }, { k: "location", label: "Location" }, { k: "focus", label: "Focus area" },
      { k: "auditor", label: "Auditor", sv: function (s) { return CA.auditor(s.auditor).name; }, cls: ai, fmt: function (s) { return esc(CA.auditor(s.auditor).name) + ' <span class="small-muted">· ' + s.match + "%</span>" + (s.flag && !s.override ? ' <i class="bi bi-exclamation-triangle-fill text-danger" title="' + esc(s.flag) + '"></i>' : s.override ? ' <i class="bi bi-shield-check text-success" title="Override: ' + esc(s.override) + '"></i>' : ""); } },
      { k: "auditees", label: "Auditees" },
      { k: "date", label: "Planned date", cls: ai, fmt: function (s) { return CA.dow(s.date) + " " + CA.d(s.date); } }, { k: "time", label: "Slot", cls: ai }, { k: "mins", label: "Min", num: true },
      { k: "actual", label: "Actual", fmt: function (s) { return s.actual ? CA.d(s.actual) : "—"; } },
      { k: "status", label: "Status", fmt: function (s) { return CA.chip(s.status, s.status === "AI proposed" ? "ai" : s.status === "Edited" ? "warn" : "ok"); } },
      { k: "invite", label: "Invite " , fmt: function (s) { return CA.chip(s.invite, s.invite === "Accepted" ? "ok" : s.invite === "Sent" ? "ok" : s.invite === "Not sent" ? "" : "warn"); } },
      { k: "e", label: "", sort: false, fmt: function (s) { return CA.btn({ text: "Edit", action: "slot-edit", data: { id: s.id }, roles: "pm", size: "btn-sm" }); } }
    ], S.slots, { id: "t-slots", flash: CA.ui.flash }) + '<p class="small-muted mb-0">Invitation column: ' + CA.sim("Outlook / Teams simulated") + " — no email or meeting is created.</p>";
  }
  CA.on("a05-propose", function (el) {
    el.disabled = true; el.innerHTML = '<span class="spinner-border spinner-border-sm"></span> A05 ranking auditors (simulated)…';
    setTimeout(function () {
      CA.aiLog("A05", "CP-H1-2027", "Proposed 19 slots and auditor matches"); CA.log("AI proposed", "CP-H1-2027", "A05 refreshed proposals (deterministic demo output)");
      CA.toast("A05 proposals refreshed: same deterministic result, 1 impartiality flag still needs a decision.", "ai"); CA.render();
    }, 1100);
  });
  CA.on("slot-edit", function (el) {
    var s = el.dataset.id ? CA.slot(el.dataset.id) : null, S = CA.S;
    var flagBox = s && s.flag && !s.override ? '<div class="col-12"><div class="sim-banner" style="border-color:var(--bad);background:var(--bad-soft);color:var(--bad)"><i class="bi bi-exclamation-octagon"></i><span>' + esc(s.flag) + "</span></div></div>" + CA.field({ name: "override", label: "Override reason (only if keeping this auditor)", type: "textarea", rows: 2, col: "col-12", help: "Leave blank and choose another auditor to resolve the flag." }) : "";
    CA.modal({ title: s ? "Edit slot · " + esc(s.dept) : "Add slot", okText: "Save slot", size: "modal-lg",
      body: '<form novalidate class="row g-3">' + flagBox +
        CA.field({ name: "bu", label: "BU / department", type: "select", required: true, value: s ? s.bu : "", placeholder: "Choose…", options: S.bus.map(function (b) { return [b.id, b.name]; }), col: "col-md-6" }) +
        CA.field({ name: "location", label: "Location / Teams", type: "select", required: true, value: s ? s.location : "Dubai office", options: S.locations.map(function (l) { return l.site === "Microsoft Teams (remote audit)" ? "Teams" : l.site; }), col: "col-md-6" }) +
        CA.field({ name: "focus", label: "Focus area", required: true, value: s ? s.focus : "", placeholder: "e.g. Customer requirements, 8.2", col: "col-md-6" }) +
        CA.field({ name: "auditor", label: "Auditor", type: "select", required: true, value: s ? s.auditor : "", placeholder: "Choose…", options: S.auditors.map(function (a) { return [a.id, a.name + " · " + a.standards.join(", ")]; }), col: "col-md-6" }) +
        CA.field({ name: "auditees", label: "Auditees", required: true, value: s ? s.auditees : "", col: "col-md-6" }) +
        CA.field({ name: "date", label: "Planned date", type: "date", required: true, value: s ? s.date : "2027-05-17", col: "col-md-3" }) +
        CA.field({ name: "time", label: "Time slot", type: "time", required: true, value: s ? s.time : "10:00", col: "col-md-3" }) +
        CA.field({ name: "mins", label: "Duration (minutes)", type: "number", required: true, value: s ? String(s.mins) : "60", min: "30", max: "90", col: "col-md-4", help: "30–90 minutes per the existing template.", invalid: "Enter 30 to 90 minutes." }) +
        CA.field({ name: "actual", label: "Actual date", type: "date", value: s ? s.actual : "", col: "col-md-4" }) +
        CA.field({ name: "status", label: "Status", type: "select", value: s ? s.status : "Edited", options: ["AI proposed", "Edited", "Published", "Completed", "Rescheduled", "Cancelled"], col: "col-md-4" }) + "</form>",
      onOk: function (b) {
        var d = CA.formData(b.querySelector("form")), bu = CA.bu(d.bu);
        if (!s) {
          var n = S.slots.length + 1;
          s = { id: "SL-" + String(n).padStart(2, "0"), audit: "IA-2027-" + String(n).padStart(3, "0"), bu: d.bu, dept: bu.name, manager: bu.manager, lead: "AUD-01", match: 0, invite: "Not sent", flag: "", override: "" };
          S.slots.push(s);
          S.audits.push({ id: s.audit, bu: d.bu, title: bu.name + " – " + d.location + " · IQA1 2027", standard: "ISO 9001:2026", cycle: "H1-2027 · IQA1", type: "Internal Audit", slot: s.id, status: "Planned", lead: "AUD-01", auditor: d.auditor, scope: null, applicability: null, checklist: null, responses: {}, fieldwork: "Not started", meeting: { opening: "", closing: "", attendees: "" }, agenda: [], report: null });
        }
        var prevAud = s.auditor;
        Object.assign(s, { bu: d.bu, dept: bu.name, manager: bu.manager, location: d.location, focus: d.focus, auditees: d.auditees, date: d.date, time: d.time, mins: +d.mins, actual: d.actual, status: d.status });
        if (prevAud !== d.auditor) CA.assignSlot(s, d.auditor);
        else if (d.override) { s.override = d.override; CA.log("Override", s.id, "Impartiality override: " + d.override); }
        if (S.cyclePlan.status === "Published" && s.invite !== "Not sent") s.invite = "Update pending";
        CA.ui.flash = s.id; CA.log("Edited", s.id, bu.name + " " + d.date + " " + d.time); CA.store.save();
        CA.toast("Slot saved for " + esc(bu.name)); CA.render();
      } });
  });
  CA.on("publish-plan", function () {
    var S = CA.S, flags = S.slots.filter(function (s) { return s.flag && !s.override; });
    if (flags.length) { CA.modal({ title: "Resolve impartiality flags first", body: "<p>The 24-month cooling-off rule flagged <b>" + flags.map(function (s) { return esc(s.dept); }).join(", ") + "</b>. Reassign the auditor or record an override reason before publishing.</p>", okText: "Resolve " + esc(flags[0].dept), onOk: function () { setTimeout(function () { CA.actions["slot-edit"]({ dataset: { id: flags[0].id } }); }, 350); } }); return; }
    var n = S.slots.filter(function (s) { return s.invite !== "Accepted" && s.invite !== "Sent"; }).length;
    CA.confirm("Publish cycle plan?", "Publishes " + S.slots.length + " slots and sends " + n + " Outlook invitations with Teams links. <b>Simulated</b> — no email or meeting is created.", "Publish & send invites", function () {
      S.cyclePlan.status = "Published"; S.cyclePlan.publishedBy = CA.me().user; S.cyclePlan.publishedAt = CA.stamp();
      S.slots.forEach(function (s) { if (s.status !== "Completed" && s.status !== "Cancelled") s.status = "Published"; if (s.invite !== "Accepted") s.invite = "Sent"; });
      S.audits.forEach(function (a) { if (a.status === "Planned") a.status = "Scheduled"; });
      CA.log("Published", "CP-H1-2027", "Cycle plan published; " + n + " invitations sent (simulated)");
      CA.S.notifications.unshift({ id: "N" + Date.now(), text: "Audit invitation: Sales – Dubai, 10 May 2027 09:30 (simulated Outlook)", route: "outside", roles: "ae la au" });
      CA.store.save(); CA.toast("Cycle plan published. " + n + " invitations sent (simulated Outlook / Teams).");
      CA.render();
      setTimeout(function () {
        var acc = 0; S.slots.forEach(function (s, i) { if (s.invite === "Sent" && i % 3 !== 2) { s.invite = "Accepted"; acc++; } });
        CA.ruleLog("Invites", "CP-H1-2027", acc + " invitations accepted (simulated responses)"); CA.store.save();
        CA.toast(acc + " invitations accepted (simulated responses)", "info"); if (CA.parseHash().path === "cycle") CA.render();
      }, 1800);
    });
  });

  // ---------- Calendar ----------
  CA.calendarView = function (ym) {
    var S = CA.S, y = +ym.slice(0, 4), m = +ym.slice(5, 7) - 1;
    var first = new Date(Date.UTC(y, m, 1)), startDow = (first.getUTCDay() + 6) % 7, days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    var prev = m === 0 ? (y - 1) + "-12" : y + "-" + String(m).padStart(2, "0"), next = m === 11 ? (y + 1) + "-01" : y + "-" + String(m + 2).padStart(2, "0");
    var base = CA.parseHash().path === "cycle" ? "cycle?view=calendar&m=" : "calendar?m=";
    var cells = "";
    for (var i = 0; i < startDow; i++) cells += '<div class="day out"></div>';
    for (var d = 1; d <= days; d++) {
      var iso = y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
      var evs = S.slots.filter(function (s) { return s.date === iso; });
      cells += '<div class="day"><span class="dn">' + d + (iso === CA.DEMO_TODAY ? " · today (demo)" : "") + "</span>" + evs.map(function (s) {
        return '<button type="button" class="ev ' + (s.status === "Completed" ? "done" : S.cyclePlan.status === "Published" ? "pub" : "") + '" data-action="slot-view" data-id="' + s.id + '" title="' + esc(s.dept + " · " + s.time) + '">' + s.time + " " + esc(s.dept) + "</button>";
      }).join("") + "</div>";
    }
    return '<div class="d-flex align-items-center gap-2"><a class="btn btn-soft btn-sm" href="#/' + base + prev + '" aria-label="Previous month"><i class="bi bi-chevron-left"></i></a><b>' + ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m] + " " + y + '</b><a class="btn btn-soft btn-sm" href="#/' + base + next + '" aria-label="Next month"><i class="bi bi-chevron-right"></i></a><span class="sp"></span>' + CA.chip(S.cyclePlan.status === "Published" ? "Published" : "Draft — AI proposed", S.cyclePlan.status === "Published" ? "ok" : "ai") + "</div>" +
      '<div class="cal">' + ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(function (x) { return '<div class="dow">' + x + "</div>"; }).join("") + cells + "</div>";
  };
  CA.on("slot-view", function (el) {
    var s = CA.slot(el.dataset.id), a = CA.auditor(s.auditor);
    CA.modal({ title: esc(s.dept) + " · " + CA.d(s.date), cancelText: "Close", okText: "Open audit record", onOk: function () { CA.go("audit/" + s.audit); },
      body: '<dl class="row small mb-0"><dt class="col-4">Audit</dt><dd class="col-8 mono">' + s.audit + '</dd><dt class="col-4">Time</dt><dd class="col-8">' + s.time + " · " + s.mins + ' min</dd><dt class="col-4">Location</dt><dd class="col-8">' + esc(s.location) + '</dd><dt class="col-4">Focus</dt><dd class="col-8">' + esc(s.focus) + '</dd><dt class="col-4">Auditor</dt><dd class="col-8">' + esc(a.name) + '</dd><dt class="col-4">Auditees</dt><dd class="col-8">' + esc(s.auditees) + '</dd><dt class="col-4">Invite</dt><dd class="col-8">' + CA.chip(s.invite) + " " + CA.sim() + "</dd></dl>" });
  });
  CA.route("calendar", {
    title: "Audit calendar", roles: "pm la au", nav: "calendar",
    render: function (p, q) {
      return CA.head({ crumbs: [["Plan"], ["Audit calendar"]], title: "Audit calendar", chips: CA.chip("H1-2027 · IQA1"), sub: "Month view of the cycle plan by auditor, site and standard. Calendar sync with Outlook is simulated." }) + CA.calendarView(q.m || "2027-05");
    }
  });
})(window.CA);
