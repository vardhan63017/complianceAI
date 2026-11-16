/* Findings register and finding editor (A07 Finding Writer & Grader — suggestion only;
   the Lead Auditor confirms every grade). */
(function (CA) {
  var esc = CA.esc;
  var F_STEPS = ["Draft", "Confirmed", "Sent to auditee", "Acknowledged"];

  CA.findingsTable = function (rows, id) {
    return CA.table([
      { k: "id", label: "Finding", fmt: function (f) { return CA.idLink("finding/" + f.id, f.id) + (f.repeat ? ' <i class="bi bi-arrow-repeat text-warning" title="Repeat of ' + esc(f.repeat) + '"></i>' : ""); } },
      { k: "audit", label: "Audit", fmt: function (f) { return CA.idLink("audit/" + f.audit, f.audit); } },
      { k: "bu", label: "BU", sv: function (f) { return CA.bu(f.bu).name; }, fmt: function (f) { return esc(CA.bu(f.bu).name); } },
      { k: "clause", label: "Clause", fmt: function (f) { return '<span class="mono">' + esc(f.clause) + "</span>"; } },
      { k: "statement", label: "Finding statement", fmt: function (f) { return esc(f.statement || f.aiStatement || "—") + (!f.statement ? " " + CA.chip("AI draft", "ai") : ""); } },
      { k: "grade", label: "Grade", fmt: function (f) { return f.grade ? CA.gradeChip(f.grade) + (f.gradeConfirmedBy ? '<div class="approval-stamp">✓ ' + esc(f.gradeConfirmedBy.split(" (")[0]) + "</div>" : "") : CA.chip("AI: " + CA.gradeLabel(f.aiGrade), "ai"); } },
      { k: "owner", label: "Owner" }, { k: "due", label: "Due", fmt: function (f) { return f.due ? CA.d(f.due) : "—"; } },
      { k: "status", label: "Status", fmt: function (f) { return CA.chip(f.status) + (f.car ? '<div class="small">' + CA.idLink("car/" + f.car, f.car) + "</div>" : ""); } }
    ], rows, { id: id, rowRoute: function (f) { return "finding/" + f.id; } });
  };

  CA.route("findings", {
    title: "Findings register", roles: "pm la au be", nav: "findings",
    render: function () {
      var S = CA.S, f = CA.ui.ff || (CA.ui.ff = { grade: "", status: "", bu: "" });
      var rows = S.findings.filter(function (x) { return (!f.grade || x.grade === f.grade || (!x.grade && x.aiGrade === f.grade)) && (!f.status || x.status === f.status) && (!f.bu || x.bu === f.bu); });
      var statuses = []; S.findings.forEach(function (x) { if (statuses.indexOf(x.status) < 0) statuses.push(x.status); });
      return CA.head({ crumbs: [["Audits"], ["Findings register"]], title: "Findings register", chips: CA.chip(S.findings.length + " findings") + CA.demo(),
        sub: "Every finding records the requirement, objective evidence, statement and grade. A07 can draft wording and suggest a grade; the Lead Auditor confirms. Repeat findings are flagged (<i class=\"bi bi-arrow-repeat text-warning\"></i>)." }) +
        '<div class="filters"><select class="form-select" data-change="ff" data-k="grade" aria-label="Grade"><option value="">All grades</option>' + CA.GRADES.filter(function (g) { return g.key !== "sat"; }).map(function (g) { return '<option value="' + g.key + '"' + (f.grade === g.key ? " selected" : "") + ">" + g.label + "</option>"; }).join("") + "</select>" +
        '<select class="form-select" data-change="ff" data-k="status" aria-label="Status"><option value="">All statuses</option>' + statuses.map(function (s) { return "<option" + (f.status === s ? " selected" : "") + ">" + esc(s) + "</option>"; }).join("") + "</select>" +
        '<select class="form-select" data-change="ff" data-k="bu" aria-label="Business unit"><option value="">All BUs</option>' + S.bus.map(function (b) { return '<option value="' + b.id + '"' + (f.bu === b.id ? " selected" : "") + ">" + esc(b.name) + "</option>"; }).join("") + "</select>" +
        (f.grade || f.status || f.bu ? '<button class="btn btn-link btn-sm" data-action="ff-clear">Clear</button>' : "") + "</div>" +
        CA.findingsTable(rows, "t-find") +
        '<p class="small-muted">External certification-body findings (e.g. SV1) can be recorded in the same register; the external auditor portal is ' + CA.future("R2") + ".</p>";
    }
  });
  CA.on("ff", function (el) { CA.ui.ff[el.dataset.k] = el.value; CA.render(); });
  CA.on("ff-clear", function () { CA.ui.ff = { grade: "", status: "", bu: "" }; CA.render(); });

  CA.route("finding/:id", {
    title: function (p) { return "Finding " + p.id; }, roles: "pm la au ae be", nav: "findings",
    render: function (p) {
      var f = CA.finding(p.id); if (!f) return CA.empty("question-circle", "Finding not found", esc(p.id));
      var a = CA.audit(f.audit), bu = CA.bu(f.bu), car = f.car ? CA.car(f.car) : null;
      var draft = f.status === "Draft", canEdit = draft && CA.can("la au"), idx = f.status === "Disputed" ? 2 : F_STEPS.indexOf(f.status);
      if (f.historic || f.status === "CAR open" || f.status === "Closed") idx = 4;
      var crumbs = a ? [["Audits"], [f.audit, "audit/" + f.audit + "/findings"], [f.id]] : [["Audits"], ["Findings", "findings"], [f.id]];
      var acts = "";
      if (draft) acts = CA.btn({ text: "Save draft", icon: "save", action: "f-save", data: { id: f.id }, roles: "la au" }) + CA.btn({ text: "Confirm & send to auditee", icon: "send", action: "f-confirm", data: { id: f.id }, roles: "la", cls: "btn-ink" });
      else if (f.status === "Sent to auditee") acts = CA.btn({ text: "Dispute", action: "f-dispute", data: { id: f.id }, roles: "ae", cls: "btn-danger-soft" }) + CA.btn({ text: "Acknowledge", icon: "check2", action: "f-ack", data: { id: f.id }, roles: "ae", cls: "btn-okay" });
      else if (f.status === "Disputed") acts = CA.btn({ text: "Revise finding", icon: "pencil", action: "f-revise", data: { id: f.id }, roles: "la", cls: "btn-ink" });
      else if (car) acts = CA.btn({ text: "Open " + car.id, icon: "tools", href: "car/" + car.id, cls: "btn-ink" });
      var G = CA.GRADES.filter(function (g) { return g.key !== "sat"; });
      return CA.head({ crumbs: crumbs, title: f.id, chips: (f.grade ? CA.gradeChip(f.grade) : CA.chip("Grade not confirmed", "warn")) + CA.chip(f.status) + (f.repeat ? CA.chip("Repeat finding", "warn") : ""), actions: acts }) +
        CA.timeline(F_STEPS.concat(["CAR opened"]), Math.max(0, idx), f.status === "Disputed" ? 2 : undefined) +
        '<div class="grid g2"><form class="card-ca" id="f-form" novalidate><h2 class="card-title">Finding record</h2><fieldset class="grid gap-3"' + (canEdit ? "" : " disabled") + ">" +
        '<dl class="row small mb-0"><dt class="col-4">Finding ID</dt><dd class="col-8 mono">' + f.id + '</dd><dt class="col-4">Audit</dt><dd class="col-8">' + (a ? CA.link("audit/" + a.id, a.id + " · " + a.title) : esc(f.audit) + " (historic, migrated)") + '</dd><dt class="col-4">Business unit</dt><dd class="col-8">' + esc(bu.name) + '</dd><dt class="col-4">Clause</dt><dd class="col-8 mono">' + esc(f.clause) + " (illustrative)</dd></dl>" +
        CA.field({ name: "requirement", label: "Requirement", type: "textarea", rows: 2, value: f.requirement, required: true }) +
        CA.field({ name: "evidence", label: "Objective evidence", type: "textarea", rows: 2, value: f.evidence, required: true }) +
        (f.file ? '<div class="small"><i class="bi bi-paperclip"></i> ' + esc(f.file) + " (filename only)</div>" : "") +
        CA.field({ name: "statement", label: "Finding statement", type: "textarea", rows: 3, value: f.statement, required: true, placeholder: "Accept or edit the AI draft, or write your own." }) +
        '<div class="row g-2">' + CA.field({ name: "owner", label: "Owner (auditee)", value: f.owner, required: true, col: "col-md-6" }) + CA.field({ name: "due", label: "Action plan due", value: f.due ? CA.d(f.due) : "Set by rule on acknowledgement", readonly: true, col: "col-md-6", help: "Minor NC: 30 days after acknowledgement · Major NC: closure verified within 90 days (deterministic rule)." }) + "</div>" +
        (car && car.rootCause ? '<div class="small"><b>Root cause (from CAR):</b> ' + esc(car.rootCause) + " · <b>Category:</b> " + esc(car.causeCat || "—") + "</div>" : "") + "</fieldset></form>" +
        '<div class="grid" style="align-content:start">' + statementBox(f, draft) + gradeBox(f, draft, G) +
        (f.repeat ? '<div class="li-ca" style="border-color:var(--warn)"><i class="bi bi-arrow-repeat text-warning"></i><span class="sp">Similar finding last time<small>' + CA.idLink("finding/" + f.repeat, f.repeat) + " · H1-2026 · same clause, same BU (flagged by A07, verified by rule match on clause + BU)</small></span></div>" : "") +
        (f.status === "Sent to auditee" ? '<div class="teams-card"><div class="top"><i class="bi bi-microsoft-teams"></i> Compliance AI · Teams card ' + CA.sim() + '</div><div class="bd"><b>New finding for ' + esc(bu.name) + "</b><span>" + f.id + " · " + CA.gradeLabel(f.grade) + " · clause " + esc(f.clause) + '</span><span class="small muted">' + esc(f.statement) + '</span></div><div class="acts">' + CA.btn({ text: "Acknowledge", action: "f-ack", data: { id: f.id }, roles: "ae", size: "btn-sm" }) + CA.btn({ text: "Dispute", action: "f-dispute", data: { id: f.id }, roles: "ae", size: "btn-sm" }) + "</div></div>" : "") +
        '<section class="card-ca"><h2 class="card-title">History</h2>' + CA.history((f.history || []).slice().reverse()) + "</section></div></div>";
    }
  });
  function statementBox(f, draft) {
    if (!f.aiStatement) return "";
    var st = f.aiStatementState;
    if (st === "pending" && draft) return '<div class="ai-box"><span class="ai-tag"><i class="bi bi-stars"></i> Simulated AI draft · A07 · NC statement</span><span class="small">' + esc(f.aiStatement) + '</span><span class="rationale">Built from the auditor\'s note and evidence for clause ' + esc(f.clause) + ".</span><div class=\"d-flex gap-2\">" +
      CA.btn({ text: "Accept", action: "f-stmt", data: { id: f.id, d: "accepted" }, roles: "la au", size: "btn-sm", cls: "btn-okay" }) + CA.btn({ text: "Edit", action: "f-stmt", data: { id: f.id, d: "edit" }, roles: "la au", size: "btn-sm" }) + CA.btn({ text: "Reject", action: "f-stmt", data: { id: f.id, d: "rejected" }, roles: "la au", size: "btn-sm", cls: "btn-danger-soft" }) + "</div></div>";
    return '<div class="ai-box ' + (st === "rejected" ? "rejected" : "approved") + '"><span class="' + (st === "rejected" ? "small-muted" : "human-tag") + '">AI statement ' + esc(st === "rejected" ? "rejected" : st === "edited" ? "edited & accepted" : "accepted") + (f.stmtBy ? " · " + esc(f.stmtBy) : "") + "</span></div>";
  }
  function gradeBox(f, draft, G) {
    var sug = CA.GRADES.filter(function (g) { return g.key === f.aiGrade; })[0];
    if (f.grade && f.gradeConfirmedBy) return '<div class="ai-box approved"><span class="human-tag"><i class="bi bi-person-check"></i> Grade confirmed by Lead Auditor</span><b>' + esc(CA.gradeLabel(f.grade)) + '</b><span class="approval-stamp">' + esc(f.gradeConfirmedBy) + "</span>" + (f.grade !== f.aiGrade ? '<span class="small-muted">AI had suggested ' + esc(CA.gradeLabel(f.aiGrade)) + ".</span>" : "") +
      (draft ? CA.btn({ text: "Change grade", action: "f-grade-reset", data: { id: f.id }, roles: "la", size: "btn-sm" }) : "") + "</div>";
    return '<div class="ai-box"><span class="ai-tag"><i class="bi bi-stars"></i> Simulated AI suggested grade · A07</span><b>' + esc(sug ? sug.label : "—") + '</b><span class="small">' + esc(CA.SIM.gradeReason[f.aiGrade] || "") + '</span><span class="rationale">Severity is never decided automatically. The Lead Auditor confirms or changes the grade.</span>' +
      (draft ? '<div class="d-flex gap-2 flex-wrap align-items-center">' + CA.btn({ text: "Accept grade", action: "f-grade", data: { id: f.id, g: f.aiGrade }, roles: "la", size: "btn-sm", cls: "btn-okay" }) +
        (CA.can("la") ? '<select class="form-select form-select-sm" style="width:auto" data-change="f-grade-sel" data-id="' + f.id + '" aria-label="Change grade"><option value="">Change grade…</option>' + G.map(function (g) { return '<option value="' + g.key + '">' + g.label + "</option>"; }).join("") + "</select>" : "") + "</div>" : "") + "</div>";
  }
  function saveForm(f) {
    var form = document.getElementById("f-form");
    if (!form) return true;
    var d = CA.formData(form);
    if (d.requirement != null) { f.requirement = d.requirement; f.evidence = d.evidence; f.statement = d.statement; f.owner = d.owner; }
    return form;
  }
  CA.on("f-save", function (el) { var f = CA.finding(el.dataset.id); saveForm(f); f.history.push({ ts: CA.stamp(), who: CA.me().user, what: "Draft saved" }); CA.log("Saved", f.id, "Finding draft"); CA.store.save(); CA.toast("Finding draft saved"); CA.render(); });
  CA.on("f-stmt", function (el) {
    var f = CA.finding(el.dataset.id), d = el.dataset.d; saveForm(f);
    if (d === "accepted" || d === "edit") f.statement = f.aiStatement;
    f.aiStatementState = d === "edit" ? "edited" : d; f.stmtBy = CA.me().user + " · " + CA.stamp();
    CA.aiLog("A07", f.id, "Finding statement", d === "rejected" ? "Rejected" : d === "edit" ? "Edited & accepted" : "Accepted");
    CA.log(d === "rejected" ? "Rejected AI suggestion" : "Accepted AI suggestion", f.id, "Finding statement");
    CA.store.save(); CA.render();
    if (d === "edit") setTimeout(function () { var t = document.getElementById("f-statement"); if (t) { t.focus(); t.setSelectionRange(t.value.length, t.value.length); } }, 50);
  });
  function setGrade(f, g) {
    saveForm(f);
    f.grade = g; f.gradeConfirmedBy = CA.me().user + " (Lead Auditor) · " + CA.stamp();
    f.history.push({ ts: CA.stamp(), who: CA.me().user, what: "Grade confirmed: " + CA.gradeLabel(g) + (g !== f.aiGrade ? " (AI suggested " + CA.gradeLabel(f.aiGrade) + ")" : "") });
    CA.aiLog("A07", f.id, "Suggested grade " + CA.gradeLabel(f.aiGrade), g === f.aiGrade ? "Accepted" : "Changed to " + CA.gradeLabel(g));
    CA.log("Confirmed grade", f.id, CA.gradeLabel(g)); CA.store.save();
    CA.toast("Grade confirmed: " + CA.gradeLabel(g)); CA.render();
  }
  CA.on("f-grade", function (el) { setGrade(CA.finding(el.dataset.id), el.dataset.g); });
  CA.on("f-grade-sel", function (el) { if (el.value) setGrade(CA.finding(el.dataset.id), el.value); });
  CA.on("f-grade-reset", function (el) { var f = CA.finding(el.dataset.id); f.grade = ""; f.gradeConfirmedBy = ""; CA.render(); });
  CA.on("f-confirm", function (el) {
    var f = CA.finding(el.dataset.id), form = saveForm(f);
    if (form && form.querySelector && !form.checkValidity()) { form.classList.add("was-validated"); CA.toast("Complete requirement, evidence, statement and owner.", "warn"); return; }
    if (!f.grade || !f.gradeConfirmedBy) { CA.toast("Confirm the grade first. The Lead Auditor decides severity.", "warn"); return; }
    CA.confirm("Confirm and send " + f.id + "?", "Grade <b>" + esc(CA.gradeLabel(f.grade)) + "</b>. The auditee (" + esc(f.owner) + ") receives it to acknowledge or dispute, by Teams card and email (" + "simulated" + ").", "Confirm & send", function () {
      f.status = "Sent to auditee"; f.history.push({ ts: CA.stamp(), who: CA.me().user, what: "Confirmed and sent to auditee (Teams + email simulated)" });
      CA.log("Confirmed", f.id, "Finding confirmed and sent to " + f.owner);
      CA.S.notifications.unshift({ id: "N" + Date.now(), text: "New finding " + f.id + " (" + CA.gradeLabel(f.grade) + ") — acknowledge or dispute", route: "finding/" + f.id, roles: "ae" });
      CA.store.save(); CA.toast("Finding sent to auditee (simulated Teams card + email)"); CA.render();
    });
  });
  CA.on("f-ack", function (el) {
    var f = CA.finding(el.dataset.id), nc = f.grade === "min" || f.grade === "maj";
    CA.confirm("Acknowledge " + f.id + "?", nc ? "A corrective action request (CAR) opens automatically by rule. Action plan due: <b>" + CA.d(CA.addDays(CA.DEMO_TODAY, 30)) + "</b> (30 days after acknowledgement)." : "Observations and AFIs do not require a CAR. You can still raise an optional improvement action.", "Acknowledge", function () {
      f.status = "Acknowledged"; f.history.push({ ts: CA.stamp(), who: CA.me().user, what: "Acknowledged by auditee" });
      CA.log("Acknowledged", f.id, "By auditee");
      if (nc) {
        var id = CA.nextCarId(); f.car = id; f.status = "CAR open"; f.due = CA.addDays(CA.DEMO_TODAY, 30);
        CA.S.cars.unshift({ id: id, finding: f.id, bu: f.bu, owner: f.owner, state: "Root cause & plan", due: f.due, correction: "", extent: "", whys: ["", "", "", "", ""], fishbone: {}, causeCat: "", rootCause: "", action: "", actionOwner: f.owner, actionDue: "", evidence: [], history: [{ ts: CA.stamp(), who: "Workflow engine", what: "CAR opened automatically on acknowledgement (rule)" }] });
        CA.ruleLog("Opened", id, "CAR opened by rule for " + f.id + "; action plan due " + f.due);
        CA.store.save(); CA.toast(id + " opened by rule. Due " + CA.d(f.due) + "."); CA.go("car/" + id); return;
      }
      CA.store.save(); CA.render();
    }, "btn-okay");
  });
  CA.on("f-dispute", function (el) {
    var f = CA.finding(el.dataset.id);
    CA.modal({ title: "Dispute " + f.id, okText: "Send dispute", body: '<form novalidate>' + CA.field({ name: "reason", label: "Reason and supporting evidence", type: "textarea", required: true }) + "</form>",
      onOk: function (b) { var d = CA.formData(b.querySelector("form")); f.status = "Disputed"; f.history.push({ ts: CA.stamp(), who: CA.me().user, what: "Disputed: " + d.reason }); CA.log("Disputed", f.id, d.reason); CA.toast("Dispute sent to the Lead Auditor", "warn"); CA.render(); } });
  });
  CA.on("f-revise", function (el) { var f = CA.finding(el.dataset.id); f.status = "Draft"; f.history.push({ ts: CA.stamp(), who: CA.me().user, what: "Reopened for revision after dispute" }); CA.log("Reopened", f.id, "After dispute"); CA.render(); });
})(window.CA);
