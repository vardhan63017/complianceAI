/* Audits: list, audit record (overview), plan & agenda, meeting record, fieldwork checklist, consolidation. */
(function (CA) {
  var esc = CA.esc;
  var STAGES = ["Scheduled", "Checklist approved", "Fieldwork", "Findings", "Report", "Closed"];
  var TABS = [["", "Overview"], ["plan", "Plan & agenda"], ["scope", "Scope"], ["checklist", "Checklist"], ["fieldwork", "Fieldwork"], ["consolidation", "Consolidation"], ["findings", "Findings"], ["meeting", "Meeting record"], ["report", "Report"]];

  CA.auditStage = function (a) {
    if (a.report && a.report.state === "Issued") return 6;
    if (a.report) return 4;
    if (a.fieldwork === "Submitted") return 3;
    if (a.checklist && a.checklist.state === "Approved") return 2;
    if (CA.S.cyclePlan.status === "Published" || a.status === "Scheduled") return 1;
    return 0;
  };
  CA.auditHead = function (a, tab) {
    var bu = CA.bu(a.bu), st = CA.auditStage(a);
    var label = st === 0 ? "Planned (plan not published)" : ["", "Scheduled · checklist in preparation", "Fieldwork", "Findings", "Report", "", "Closed"][st];
    return CA.head({ crumbs: [["Audits"], ["My audits", "audits"], [a.id]], title: a.title, chips: CA.chip(a.standard) + CA.chip(label, st >= 6 ? "ok" : st === 0 ? "" : "warn") + (a.id === "IA-2027-001" ? CA.demo("Walkthrough scenario") : "") }) +
      CA.timeline(STAGES, Math.min(st, 6)) +
      '<nav class="tabs-ca" aria-label="Audit record sections">' + TABS.map(function (t) {
        return '<a href="#/audit/' + a.id + (t[0] ? "/" + t[0] : "") + '"' + (t[0] === tab ? ' aria-current="page"' : "") + ">" + t[1] + (t[0] === "findings" ? ' <span class="chip">' + CA.S.findings.filter(function (f) { return f.audit === a.id; }).length + "</span>" : "") + "</a>";
      }).join("") + "</nav>";
  };
  function myAuditorId() { return CA.role() === "la" ? "AUD-01" : CA.role() === "au" ? "AUD-02" : null; }

  // ---------- list ----------
  CA.route("audits", {
    title: "My audits", roles: "pm la au", nav: "audits",
    render: function () {
      var me = myAuditorId(), mine = CA.ui.allAudits ? false : !!me;
      var rows = CA.S.audits.filter(function (a) { return !mine || a.lead === me || a.auditor === me; }).map(function (a) { var s = CA.slot(a.slot); return Object.assign({ date: s.date, time: s.time, loc: s.location }, a); });
      return CA.head({ crumbs: [["Audits"], ["My audits"]], title: mine ? "My audits" : "All audits · H1-2027", chips: CA.chip(rows.length + " audits"),
        actions: me ? '<button class="btn btn-soft btn-sm" data-action="toggle-all-audits">' + (mine ? "Show all audits" : "Show only mine") + "</button>" : "" }) +
        CA.table([
          { k: "id", label: "Audit", fmt: function (a) { return CA.idLink("audit/" + a.id, a.id); } }, { k: "title", label: "Title" },
          { k: "date", label: "Date", fmt: function (a) { return CA.d(a.date) + " " + a.time; } }, { k: "loc", label: "Location" },
          { k: "auditor", label: "Lead / auditor", sv: function (a) { return CA.auditor(a.auditor).name; }, fmt: function (a) { return esc(CA.auditor(a.lead).name) + " / " + esc(CA.auditor(a.auditor).name); } },
          { k: "st", label: "Stage", sv: function (a) { return CA.auditStage(a); }, fmt: function (a) { var s = CA.auditStage(a); return CA.chip(["Planned", "Scheduled", "Fieldwork", "Findings", "Report", "", "Closed"][s], s >= 6 ? "ok" : s >= 2 ? "warn" : ""); } }
        ], rows, { id: "t-audits", rowRoute: function (a) { return "audit/" + a.id; } });
    }
  });
  CA.on("toggle-all-audits", function () { CA.ui.allAudits = !CA.ui.allAudits; CA.render(); });

  // ---------- overview ----------
  CA.route("audit/:id", {
    title: function (p) { return "Audit " + p.id; }, roles: "pm la au ae ex be", nav: "audits",
    render: function (p) {
      var a = CA.audit(p.id); if (!a) return CA.empty("question-circle", "Audit not found", esc(p.id));
      var sl = CA.slot(a.slot), sc = a.scope, c = CA.auditCounts(a), items = CA.checklistItems(a);
      var trail = CA.S.trail.filter(function (t) { return t.record.indexOf(a.id) === 0 || (a.id === "IA-2027-001" && /CP-H1-2027/.test(t.record)); }).slice(0, 8);
      var next = !sc || !sc.confirmed ? ["Confirm scope & applicability", "audit/" + a.id + "/scope"] : !a.checklist || a.checklist.state !== "Approved" ? ["Build & approve the checklist", "audit/" + a.id + "/checklist"] : a.fieldwork !== "Submitted" ? ["Continue fieldwork", "audit/" + a.id + "/fieldwork"] : !a.report ? ["Generate the report", "audit/" + a.id + "/report"] : ["Open the report", "audit/" + a.id + "/report"];
      return CA.auditHead(a, "") +
        '<div class="grid g2"><section class="card-ca"><h2 class="card-title"><i class="bi bi-bullseye"></i> Scope <span class="sp"></span>' + (sc && sc.confirmed ? CA.chip("Confirmed", "ok") : CA.chip("Not confirmed", "warn")) + "</h2>" +
        (sc ? '<dl class="row small mb-0"><dt class="col-4">Objective</dt><dd class="col-8">' + esc(sc.objective || "—") + '</dd><dt class="col-4">Boundaries</dt><dd class="col-8">' + esc(sc.boundaries || "—") + '</dd><dt class="col-4">Activities</dt><dd class="col-8">' + esc((sc.activities || []).join(", ") || "—") + '</dd><dt class="col-4">Excluded</dt><dd class="col-8">' + esc(sc.exclusions || "None recorded") + "</dd></dl>" : '<p class="small-muted mb-0">Scope not defined yet.</p>') + "</section>" +
        '<section class="card-ca"><h2 class="card-title"><i class="bi bi-people"></i> Team &amp; schedule</h2><div class="list-ca">' +
        '<div class="li-ca"><span class="sp">' + esc(CA.auditor(a.lead).name) + '<small>Lead Auditor · ISO 9001 Lead Auditor</small></span></div>' +
        '<div class="li-ca"><span class="sp">' + esc(CA.auditor(a.auditor).name) + "<small>Auditor · " + sl.match + "% match (A05)</small></span></div>" +
        '<div class="li-ca"><span class="sp">' + esc(sl.auditees) + "<small>Auditee · invitation " + esc(sl.invite.toLowerCase()) + " " + "</small></span>" + CA.sim() + "</div></div>" +
        '<div class="li-ca"><i class="bi bi-calendar-event"></i><span class="sp">' + CA.dow(sl.date) + " " + CA.d(sl.date) + " · " + sl.time + " · " + sl.mins + " min · " + esc(sl.location) + "</span></div></section></div>" +
        '<div class="grid g3"><section class="card-ca"><h2 class="card-title">Checklist</h2>' + (a.checklist ? CA.chip(a.checklist.state, a.checklist.state === "Approved" ? "ok" : "ai") + '<span class="small">' + items.length + " questions" + (a.checklist.approvedBy ? " · approved by " + esc(a.checklist.approvedBy) : "") + "</span>" : '<span class="small-muted">Not generated yet.</span>') + "</section>" +
        '<section class="card-ca"><h2 class="card-title">Fieldwork</h2>' + CA.chip(a.fieldwork, a.fieldwork === "Submitted" ? "ok" : a.fieldwork === "Not started" ? "" : "warn") + '<span class="small">' + (items.length ? (items.length - c.open) + " / " + items.length + " answered" : "—") + "</span></section>" +
        '<section class="card-ca"><h2 class="card-title">Next step</h2><a class="btn btn-ink btn-sm" style="justify-self:start" href="#/' + next[1] + '">' + esc(next[0]) + " →</a></section></div>" +
        '<section class="card-ca"><h2 class="card-title"><i class="bi bi-clock-history"></i> Record history</h2>' + CA.history(trail.map(function (t) { return { what: t.action + " — " + t.detail, ts: t.ts, who: t.actor, cls: /Approved|Confirmed|Published|Issued/.test(t.action) ? "ok" : /AI/.test(t.action) ? "ai" : "" }; })) + "</section>";
    }
  });

  // ---------- plan & agenda ----------
  CA.route("audit/:id/plan", {
    title: "Audit plan & agenda", roles: "pm la au ae", nav: "audits",
    render: function (p) {
      var a = CA.audit(p.id); if (!a) return CA.empty("question-circle", "Audit not found", esc(p.id));
      return CA.auditHead(a, "plan") +
        '<section class="card-ca"><h2 class="card-title">Agenda <span class="sp"></span>' + CA.btn({ text: "Add item", icon: "plus", action: "agenda-add", data: { id: a.id }, roles: "la", size: "btn-sm" }) + CA.btn({ text: "Send agenda to auditee", icon: "send", action: "agenda-send", data: { id: a.id }, roles: "la", size: "btn-sm" }) + "</h2>" +
        (a.agenda.length ? '<div class="table-wrap"><table class="table-ca"><thead><tr><th>Time</th><th>Item</th><th>Duration</th></tr></thead><tbody>' + a.agenda.map(function (r) { return '<tr><td class="mono">' + esc(r[0]) + "</td><td>" + esc(r[1]) + "</td><td>" + esc(r[2]) + "</td></tr>"; }).join("") + "</tbody></table></div>" : CA.empty("list", "No agenda yet", "Add agenda items.")) +
        (a.agendaSent ? '<div class="approval-stamp">Sent to auditee ' + esc(a.agendaSent) + " (simulated email + Teams)</div>" : "") + "</section>" +
        '<section class="card-ca fill"><h2 class="card-title">Audit plan</h2><p class="small mb-0">Objective, scope, criteria (' + esc(a.standard) + "), team, schedule and agenda make up the audit plan. Scope is maintained on the " + CA.link("audit/" + a.id + "/scope", "Scope tab") + ".</p></section>";
    }
  });
  CA.on("agenda-add", function (el) {
    var a = CA.audit(el.dataset.id);
    CA.modal({ title: "Add agenda item", okText: "Add", body: '<form novalidate class="row g-2">' + CA.field({ name: "t", label: "Time", type: "time", required: true, value: "11:00", col: "col-4" }) + CA.field({ name: "item", label: "Item", required: true, col: "col-8" }) + CA.field({ name: "dur", label: "Duration", required: true, value: "10 min", col: "col-4" }) + "</form>",
      onOk: function (b) { var d = CA.formData(b.querySelector("form")); a.agenda.push([d.t, d.item, d.dur]); a.agenda.sort(function (x, y) { return x[0] > y[0] ? 1 : -1; }); CA.log("Edited", a.id, "Agenda item added"); CA.toast("Agenda item added"); CA.render(); } });
  });
  CA.on("agenda-send", function (el) { var a = CA.audit(el.dataset.id); a.agendaSent = CA.stamp(); CA.log("Sent", a.id, "Agenda sent to auditee (simulated)"); CA.toast("Agenda sent to auditee (simulated email + Teams)", "info"); CA.render(); });

  // ---------- meeting record ----------
  CA.route("audit/:id/meeting", {
    title: "Meeting record", roles: "pm la au ae", nav: "audits",
    render: function (p) {
      var a = CA.audit(p.id); if (!a) return CA.empty("question-circle", "Audit not found", esc(p.id));
      var m = a.meeting, can = CA.can("la au");
      return CA.auditHead(a, "meeting") + '<form data-form="meeting" data-id="' + a.id + '" novalidate class="grid g2"><fieldset class="card-ca"' + (can ? "" : " disabled") + '><h2 class="card-title">Opening meeting</h2>' +
        CA.field({ name: "attendees", label: "Attendees", value: m.attendees, required: true, placeholder: "Names and roles" }) +
        CA.field({ name: "opening", label: "Notes (scope, agenda, confidentiality confirmed)", type: "textarea", value: m.opening, required: true }) + "</fieldset>" +
        '<fieldset class="card-ca"' + (can ? "" : " disabled") + '><h2 class="card-title">Closing meeting</h2>' + CA.field({ name: "closing", label: "Notes (findings presented, auditee response)", type: "textarea", rows: 5, value: m.closing }) +
        (can ? '<button class="btn btn-ink" type="submit" style="justify-self:start">Save meeting record</button>' : CA.btn({ text: "Edit meeting record", roles: "la au" })) + (m.savedAt ? '<span class="approval-stamp">Saved ' + esc(m.savedAt) + " by " + esc(m.savedBy) + "</span>" : "") + "</fieldset></form>";
    }
  });
  CA.onForm("meeting", function (form, d) { var a = CA.audit(form.dataset.id); Object.assign(a.meeting, d, { savedAt: CA.stamp(), savedBy: CA.me().user }); CA.log("Saved", a.id, "Meeting record"); CA.store.save(); CA.toast("Meeting record saved"); CA.render(); });

  // ---------- fieldwork ----------
  var RESULTS = [["sat", "Satisfied", "r-sat"], ["obs", "Observation", "r-obs"], ["afi", "Area for Improvement", "r-afi"], ["min", "Minor NC", "r-min"], ["maj", "Major NC", "r-maj"], ["na", "Not applicable", "r-na"]];
  CA.route("audit/:id/fieldwork", {
    title: "Fieldwork checklist", roles: "pm la au", nav: "audits",
    render: function (p, q) {
      var a = CA.audit(p.id); if (!a) return CA.empty("question-circle", "Audit not found", esc(p.id));
      var head = CA.auditHead(a, "fieldwork");
      if (!a.checklist || a.checklist.state !== "Approved") return head + '<section class="card-ca">' + CA.empty("lock", "Fieldwork opens once the checklist is approved", "The Lead Auditor approves the audit-specific checklist first.", '<a class="btn btn-ink btn-sm" href="#/audit/' + a.id + '/checklist">Go to checklist builder</a>') + "</section>";
      var items = CA.checklistItems(a), cur = CA.byId(items, q.q) || items.filter(function (i) { return !a.responses[i.id]; })[0] || items[0];
      var idx = items.indexOf(cur), r = a.responses[cur.id] || {}, can = CA.can("au la") && a.fieldwork !== "Submitted";
      var c = CA.auditCounts(a), groups = {};
      items.forEach(function (it) { var g = it.clause.split(".")[0]; (groups[g] = groups[g] || []).push(it); });
      var GN = {}; CA.CLAUSE_GROUPS.forEach(function (g) { GN[g[0]] = g[1]; });
      var fid = CA.S.findings.filter(function (f) { return f.audit === a.id && f.item === cur.id; })[0];
      return head +
        '<div class="d-flex flex-wrap gap-2 align-items-center">' + CA.chip("Online · autosave", "ok") + CA.chip("Offline fieldwork", "future") + '<span class="small-muted">Offline execution is planned for R2. Saving writes to this browser only.</span><span class="sp"></span>' +
        (can && c.open ? CA.btn({ text: "Load sample responses (demo shortcut)", icon: "magic", action: "fw-sample", data: { id: a.id }, roles: "au la", size: "btn-sm" }) : "") +
        (a.fieldwork === "Submitted" ? CA.chip("Fieldwork submitted " + (a.fieldworkAt || ""), "ok") : CA.btn({ text: "Submit fieldwork", icon: "send-check", action: "fw-submit", data: { id: a.id }, roles: "au la", cls: "btn-ink", size: "btn-sm" })) + "</div>" +
        '<div class="grid g-left"><nav class="card-ca fill" aria-label="Checklist sections"><h2 class="card-title">Sections</h2><div class="sec-nav">' +
        Object.keys(groups).map(function (g) { var done = groups[g].filter(function (i) { return a.responses[i.id]; }).length; return '<button type="button" class="' + (groups[g].indexOf(cur) > -1 ? "on" : "") + '" data-action="go" data-route="audit/' + a.id + "/fieldwork?q=" + groups[g][0].id + '">' + g + " " + esc((GN[g] || "").split(" ")[0]) + ' <span class="mono">' + (done === groups[g].length ? '<i class="bi bi-check-circle-fill done-ic"></i> ' : "") + done + "/" + groups[g].length + "</span></button>"; }).join("") +
        '</div><div class="small-muted">' + (items.length - c.open) + " of " + items.length + " answered</div>" +
        '<div class="list-ca" style="gap:4px">' + items.map(function (it, i) { var rr = a.responses[it.id]; return '<a class="li-ca" style="padding:4px 8px' + (it === cur ? ";border-color:var(--ai);background:var(--ai-soft)" : "") + '" href="#/audit/' + a.id + "/fieldwork?q=" + it.id + '"' + (it === cur ? ' aria-current="true"' : "") + '><span class="mono small">' + (i + 1) + '</span><span class="sp small">' + esc(it.clause) + "</span>" + (rr ? CA.gradeChip(rr.result) : '<span class="small-muted">—</span>') + "</a>"; }).join("") + "</div></nav>" +
        '<form class="card-ca" data-form="fw" data-id="' + a.id + '" data-item="' + cur.id + '" novalidate><div class="row-head">' + CA.chip("Clause " + cur.clause + " (illustrative)") + CA.chip("Question " + (idx + 1) + " of " + items.length) + '<span class="sp"></span><span class="small-muted" id="autosave">' + (r.savedAt ? "Saved " + esc(r.savedAt.slice(11)) + " · this browser" : "Not saved yet") + "</span></div>" +
        '<h2 style="font-size:1.1rem;margin:0">' + esc(cur.q) + '</h2><div class="small muted">Look for: ' + esc(cur.evidence) + " · Guidance: " + esc(cur.guidance) + "</div>" +
        '<fieldset class="grid gap-3"' + (can ? "" : " disabled") + '><div><span class="form-label req d-block">Result</span><div class="result-pills" role="radiogroup" aria-label="Result">' +
        RESULTS.map(function (x) { return '<input type="radio" name="result" id="r-' + x[0] + '" value="' + x[0] + '"' + (r.result === x[0] ? " checked" : "") + ' required data-change="fw-autosave"><label for="r-' + x[0] + '" class="' + x[2] + '">' + x[1] + "</label>"; }).join("") + "</div>" +
        '<div class="form-text">Same labels as the TPL-59 sheet. Points: Satisfied 3 · Observation/AFI 2 · Minor 1 · Major 0. N/A is excluded from the score.</div></div>' +
        CA.field({ name: "note", label: "Observation / evidence note", type: "textarea", value: r.note || "", placeholder: "What did you see? Which records did you sample?" }) +
        '<div><label class="form-label" for="f-file">Evidence attachment</label><input class="form-control" type="file" id="f-file" name="file" data-change="fw-file"><div class="form-text">' + (r.file ? '<i class="bi bi-paperclip"></i> <b>' + esc(r.file) + "</b> · " : "") + "Only the filename is kept. Nothing is uploaded " + CA.sim() + "</div></div>" +
        '<div class="form-check"><input class="form-check-input" type="checkbox" name="good" id="f-good"' + (r.good ? " checked" : "") + '><label class="form-check-label small" for="f-good">Mark as Good Practice (shown in the report)</label></div></fieldset>' +
        (fid ? '<div class="li-ca" style="border-color:var(--warn)"><i class="bi bi-flag"></i><span class="sp">Finding ' + CA.idLink("finding/" + fid.id, fid.id) + " raised for this question<small>" + esc(fid.status) + "</small></span></div>" : "") +
        '<div class="d-flex flex-wrap gap-2">' + (can ? '<button class="btn btn-soft" type="submit" name="act" value="save"><i class="bi bi-save"></i> Save draft</button>' + (!fid ? '<button class="btn btn-soft" type="submit" name="act" value="finding"><i class="bi bi-flag"></i> Raise finding</button>' : "") : "") + '<span class="sp"></span>' +
        (idx > 0 ? '<a class="btn btn-soft" href="#/audit/' + a.id + "/fieldwork?q=" + items[idx - 1].id + '">Previous</a>' : "") +
        (idx < items.length - 1 ? (can ? '<button class="btn btn-ink" type="submit" name="act" value="next">Save &amp; next question</button>' : '<a class="btn btn-ink" href="#/audit/' + a.id + "/fieldwork?q=" + items[idx + 1].id + '">Next question</a>') : '<a class="btn btn-ink" href="#/audit/' + a.id + '/consolidation">Review consolidation →</a>') + "</div></form></div>";
    }
  });
  function saveResponse(form, d) {
    var a = CA.audit(form.dataset.id), id = form.dataset.item, prev = a.responses[id] || {};
    a.responses[id] = { result: d.result || prev.result || "", note: d.note != null ? d.note : prev.note, file: prev.file || "", good: !!d.good, savedAt: CA.stamp(), by: CA.me().user };
    if (a.fieldwork === "Not started") a.fieldwork = "In progress";
    CA.store.save();
    return a;
  }
  CA.onForm("fw", function (form, d, submitter) {
    var act = submitter ? submitter.value : "save";
    var a = saveResponse(form, d), id = form.dataset.item, items = CA.checklistItems(a), it = CA.byId(items, id);
    CA.log("Recorded", a.id + "/" + id, "Result " + CA.gradeLabel(d.result) + (a.responses[id].file ? " · evidence " + a.responses[id].file : ""));
    if (act === "finding") {
      if (!/obs|afi|min|maj/.test(d.result)) { CA.toast("Findings are raised for Observation, AFI, Minor NC or Major NC results.", "warn"); CA.render(); return; }
      var f = CA.newFinding(a, it, d);
      CA.toast("Draft finding " + f.id + " created. The Lead Auditor confirms the grade."); CA.go("finding/" + f.id); return;
    }
    if (act === "next") { var i = items.indexOf(it); CA.go("audit/" + a.id + "/fieldwork?q=" + items[Math.min(i + 1, items.length - 1)].id); return; }
    CA.toast("Response saved (this browser only)"); CA.render();
  });
  CA.on("fw-autosave", function (el) {
    var form = el.closest("form"); saveResponse(form, CA.formData(form));
    var s = document.getElementById("autosave"); if (s) s.textContent = "Saved " + CA.stamp().slice(11) + " · this browser";
  });
  CA.on("fw-file", function (el) {
    var form = el.closest("form"), a = CA.audit(form.dataset.id), id = form.dataset.item;
    var name = el.files && el.files[0] ? el.files[0].name : "";
    if (!name) return;
    var d = CA.formData(form); saveResponse(form, d); a.responses[id].file = name; CA.store.save();
    CA.log("Attached", a.id + "/" + id, "Evidence filename " + name + " (not uploaded)");
    CA.toast("Attached " + esc(name) + " — filename only, nothing uploaded (simulated)", "info"); CA.render();
  });
  CA.on("fw-sample", function (el) {
    var a = CA.audit(el.dataset.id);
    var SAMPLE = { Q01: ["sat", "Context review dated Feb 2027 seen; actions tracked."], Q02: ["sat", "Town hall notes (Jan 2027) and 12/12 code of conduct sign-offs."], Q03: ["obs", "Risks are listed but opportunities are mixed in, with no separate actions."], Q04: ["afi", "Playbook kept on SharePoint; pricing rules last updated 9 months ago."], Q05: ["sat", "Two new hires sampled; onboarding checklists complete."], Q06: ["sat", "One complaint traced to closure in CRM."], Q07: ["min", "3 of 10 quotations sampled (Mar–Apr 2027) had no signed contract review."], Q08: ["na", "Not applicable — confirmed during scoping."], Q09: ["sat", "CSAT trend reviewed monthly with actions logged.", true], Q10: ["sat", "CAR-2026-0004 change in CRM confirmed in place."] };
    var n = 0;
    CA.checklistItems(a).forEach(function (it) { if (!a.responses[it.id] && SAMPLE[it.id]) { a.responses[it.id] = { result: SAMPLE[it.id][0], note: SAMPLE[it.id][1], file: it.id === "Q07" ? "Quotation_sample_Mar-Apr2027.xlsx" : "", good: !!SAMPLE[it.id][2], savedAt: CA.stamp(), by: CA.me().user + " (demo shortcut)" }; n++; } });
    a.fieldwork = "In progress"; CA.log("Recorded", a.id, n + " sample responses loaded (demo shortcut)"); CA.store.save();
    CA.toast(n + " sample responses filled in (clearly marked as a demo shortcut)", "info"); CA.render();
  });
  CA.on("fw-submit", function (el) {
    var a = CA.audit(el.dataset.id), c = CA.auditCounts(a);
    if (c.open) { CA.toast(c.open + " question(s) still unanswered. Record a result for every question before submitting.", "warn"); return; }
    CA.confirm("Submit fieldwork for " + a.id + "?", "Responses become read-only and the audit moves to Findings. Unraised NC results can still be raised from the Consolidation view.", "Submit fieldwork", function () {
      a.fieldwork = "Submitted"; a.fieldworkAt = CA.stamp(); a.status = "Findings"; CA.log("Submitted", a.id, "Fieldwork submitted"); CA.store.save();
      CA.toast("Fieldwork submitted. Audit moved to Findings."); CA.go("audit/" + a.id + "/consolidation");
    });
  });

  CA.newFinding = function (a, it, d) {
    var r = a.responses[it.id] || {}; r.note = r.note || "";
    var f = { id: CA.nextFindingId(a.id), audit: a.id, bu: a.bu, item: it.id, clause: it.clause, requirement: a.standard + " clause " + it.clause + " — " + it.q.replace(/\?$/, "") + " (illustrative paraphrase)", evidence: r.note || "", statement: "", aiStatement: CA.SIM.findingDraft(it.clause === "8.2.3" ? r.note.replace(/\.$/, "") : r.note), aiStatementState: "pending", grade: "", aiGrade: d.result, gradeConfirmedBy: "", status: "Draft", owner: CA.bu(a.bu).manager, due: "", car: "", rootCause: "", causeCat: "", repeat: it.clause === "8.2.3" ? "F-IA-2026-001-02" : "", file: r.file, history: [{ ts: CA.stamp(), who: CA.me().user, what: "Draft finding raised from fieldwork" }] };
    if (it.clause !== "8.2.3") f.aiStatement = "Requirement for clause " + it.clause + " not fully met: " + (r.note || "see evidence") + " (Simulated AI draft.)";
    CA.S.findings.push(f);
    CA.aiLog("A07", f.id, "Drafted finding statement and suggested grade " + CA.gradeLabel(d.result));
    CA.log("Raised", f.id, "Draft finding on clause " + it.clause);
    CA.store.save();
    return f;
  };

  // ---------- consolidation ----------
  CA.route("audit/:id/consolidation", {
    title: "Consolidation view", roles: "pm la au", nav: "audits",
    render: function (p) {
      var a = CA.audit(p.id); if (!a) return CA.empty("question-circle", "Audit not found", esc(p.id));
      var head = CA.auditHead(a, "consolidation");
      if (!a.checklist || a.checklist.state !== "Approved") return head + '<section class="card-ca">' + CA.empty("lock", "Nothing to consolidate yet", "Approve the checklist and record fieldwork first.") + "</section>";
      var items = CA.checklistItems(a), c = CA.auditCounts(a), s = CA.score(c);
      var rows = items.map(function (it) { var r = a.responses[it.id] || {}; var f = CA.S.findings.filter(function (x) { return x.audit === a.id && x.item === it.id; })[0]; return { id: it.id, clause: it.clause, q: it.q, result: r.result || "", note: r.note || "", file: r.file || "", good: r.good, f: f }; });
      return head + '<div class="grid g4 stagger">' + CA.kpi(s.pct == null ? "–" : s.pct.toFixed(1) + "%", "Live compliance (" + s.applicable + " applicable)", "", s.pct != null && s.pct < 90 ? "bad" : "good") + CA.kpi(String(c.sat), "Satisfied") + CA.kpi(String(c.obs + c.afi), "Observation / AFI") + CA.kpi(c.min + " / " + c.maj, "Minor / Major NC", "", c.min + c.maj ? "bad" : "") + "</div>" +
        '<div class="formula">(' + c.sat + "×3 + " + c.obs + "×2 + " + c.afi + "×2 + " + c.min + "×1 + " + c.maj + "×0) ÷ (3 × " + s.applicable + ") = " + s.earned + " ÷ " + s.max + (s.pct != null ? " = " + s.pct.toFixed(1) + "%" : "") + " · N/A: " + c.na + " · unanswered: " + c.open + "</div>" +
        CA.table([
          { k: "clause", label: "Clause", fmt: function (r) { return '<span class="mono">' + esc(r.clause) + "</span>"; } }, { k: "q", label: "Question" },
          { k: "result", label: "Result", fmt: function (r) { return r.result ? CA.gradeChip(r.result) : CA.chip("Unanswered", "warn"); } },
          { k: "note", label: "Note / evidence", fmt: function (r) { return esc(r.note) + (r.file ? '<div class="small"><i class="bi bi-paperclip"></i> ' + esc(r.file) + "</div>" : "") + (r.good ? CA.chip("Good practice", "ok") : ""); } },
          { k: "f", label: "Finding", sort: false, fmt: function (r) { return r.f ? CA.idLink("finding/" + r.f.id, r.f.id) : /obs|afi|min|maj/.test(r.result) ? CA.btn({ text: "Raise finding", action: "raise-from-cons", data: { id: a.id, item: r.id }, roles: "au la", size: "btn-sm" }) : ""; } }
        ], rows, { id: "t-cons", rowRoute: function (r) { return "audit/" + a.id + "/fieldwork?q=" + r.id; } }) +
        '<div class="d-flex gap-2"><a class="btn btn-soft" href="#/audit/' + a.id + '/findings">Findings for this audit</a><a class="btn btn-ink" href="#/audit/' + a.id + '/report">Report builder →</a></div>';
    }
  });
  CA.on("raise-from-cons", function (el) {
    var a = CA.audit(el.dataset.id), it = CA.byId(CA.checklistItems(a), el.dataset.item);
    var f = CA.newFinding(a, it, { result: a.responses[it.id].result }); CA.toast("Draft finding " + f.id + " created"); CA.go("finding/" + f.id);
  });

  // ---------- audit findings tab ----------
  CA.route("audit/:id/findings", {
    title: "Audit findings", roles: "pm la au ae", nav: "audits",
    render: function (p) {
      var a = CA.audit(p.id); if (!a) return CA.empty("question-circle", "Audit not found", esc(p.id));
      var fs = CA.S.findings.filter(function (f) { return f.audit === a.id; });
      var cand = CA.checklistItems(a).filter(function (it) { var r = a.responses[it.id]; return r && /obs|afi|min|maj/.test(r.result) && !fs.some(function (f) { return f.item === it.id; }); });
      return CA.auditHead(a, "findings") +
        (cand.length ? '<div class="sim-banner" style="border-style:solid"><i class="bi bi-flag"></i><span>' + cand.length + " fieldwork result(s) graded Observation / AFI / NC without a finding: " + cand.map(function (it) { return "<b>" + esc(it.clause) + "</b> " + CA.btn({ text: "Raise finding", action: "raise-from-cons", data: { id: a.id, item: it.id }, roles: "au la", size: "btn-sm" }); }).join(" ") + "</span></div>" : "") +
        (fs.length ? CA.findingsTable(fs, "t-af") : '<section class="card-ca">' + CA.empty("flag", "No findings raised for this audit yet", "Findings are raised from fieldwork: record a result such as Minor NC, then press Raise finding.", '<a class="btn btn-ink btn-sm" href="#/audit/' + a.id + '/fieldwork' + (CA.byId(CA.checklistItems(a), "Q07") ? "?q=Q07" : "") + '">Go to fieldwork (clause 8.2.3)</a>') + "</section>");
    }
  });
})(window.CA);
