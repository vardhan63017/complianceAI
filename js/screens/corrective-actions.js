/* Actions: CAR list, CAR workspace, CAR review & verification, effectiveness check, overdue board.
   Due dates and escalations are deterministic rules; A08/A09/A10 only draft and suggest. */
(function (CA) {
  var esc = CA.esc;
  var CAR_STEPS = ["Acknowledged", "Root cause & plan", "Plan review", "Implementation", "Verification", "Effectiveness check", "Closed"];
  var IDX = { "Root cause & plan": 1, "Returned": 1, "Reopened": 1, "Plan review": 2, "Implementation": 3, "Evidence submitted": 4, "Effectiveness review": 5, "Closed": 7 };
  var CAUSES = ["People / competence", "Process / method", "Tools / systems", "Materials / inputs", "Measurement", "Environment", "Management / resources"];
  CA.CAR_STEPS = CAR_STEPS;

  function carHead(c, tab) {
    var f = CA.finding(c.finding), t = CA.overdueTier(c.due), bad = c.state === "Returned" || c.state === "Reopened";
    return CA.head({ crumbs: [["Actions"], ["Corrective actions", "cars"], [c.id]], title: "Corrective action " + c.id, chips: (f ? CA.gradeChip(f.grade) : "") + CA.chip(c.state) + CA.chip("Due " + CA.d(c.due), CA.carOverdue(c) ? "bad" : "") + (t.tier && CA.carOverdue(c) ? CA.chip(t.tier + " escalation", t.cls) : "") }) +
      CA.timeline(CAR_STEPS, IDX[c.state] != null ? IDX[c.state] : 1, bad ? 1 : undefined) +
      '<nav class="tabs-ca"><a href="#/car/' + c.id + '"' + (tab === "w" ? ' aria-current="page"' : "") + '>CAR workspace</a><a href="#/car/' + c.id + '/review"' + (tab === "r" ? ' aria-current="page"' : "") + '>Review &amp; verification</a><a href="#/effectiveness/' + c.id + '"' + (tab === "e" ? ' aria-current="page"' : "") + ">Effectiveness check</a></nav>";
  }

  CA.route("cars", {
    title: "Corrective actions", roles: "pm la au ae", nav: "cars",
    render: function () {
      var rows = CA.S.cars.filter(function (c) { return CA.role() !== "ae" || c.bu === "BU-01"; });
      return CA.head({ crumbs: [["Actions"], ["Corrective actions"]], title: CA.role() === "ae" ? "My corrective actions" : "Corrective actions", chips: CA.chip(rows.filter(function (c) { return c.state !== "Closed"; }).length + " open"),
        sub: "A finding is the issue identified in the audit. A Corrective Action Request (CAR) manages the response: correction, root cause, corrective action, evidence, verification and effectiveness. CARs open automatically by rule when an NC is acknowledged." }) +
        (rows.length ? CA.table([
          { k: "id", label: "CAR", fmt: function (c) { return CA.idLink("car/" + c.id, c.id); } }, { k: "finding", label: "Finding", fmt: function (c) { return CA.idLink("finding/" + c.finding, c.finding); } },
          { k: "bu", label: "BU", sv: function (c) { return CA.bu(c.bu).name; }, fmt: function (c) { return esc(CA.bu(c.bu).name); } }, { k: "owner", label: "Action owner" },
          { k: "due", label: "Due", fmt: function (c) { var t = CA.overdueTier(c.due); return CA.d(c.due) + (CA.carOverdue(c) ? ' <span class="chip ' + t.cls + '">' + t.late + "d late</span>" : ""); } },
          { k: "state", label: "State", fmt: function (c) { return CA.chip(c.state); } }
        ], rows, { id: "t-cars", rowRoute: function (c) { return "car/" + c.id; } }) : '<section class="card-ca">' + CA.empty("tools", "No corrective actions", "CARs open when a Minor or Major NC is acknowledged by the auditee.") + "</section>");
    }
  });

  // ---------- workspace ----------
  CA.route("car/:id", {
    title: function (p) { return p.id; }, roles: "pm la au ae", nav: "cars",
    render: function (p) {
      var c = CA.car(p.id); if (!c) return CA.empty("question-circle", "CAR not found", esc(p.id));
      var f = CA.finding(c.finding), planEdit = CA.can("ae") && /Root cause|Returned|Reopened/.test(c.state), evEdit = CA.can("ae") && c.state === "Implementation";
      c.fishbone = c.fishbone || {}; c.whys = c.whys || ["", "", "", "", ""];
      var lastReturn = (c.history || []).filter(function (h) { return /Returned|Not effective|Reopened/.test(h.what); }).slice(-1)[0];
      return carHead(c, "w") +
        (lastReturn && /Returned|Reopened/.test(c.state) ? '<div class="sim-banner" style="border-color:var(--bad);background:var(--bad-soft);color:var(--bad);border-style:solid"><i class="bi bi-arrow-return-left"></i><span><b>' + esc(lastReturn.what) + "</b> — " + esc(lastReturn.who) + " · " + esc(lastReturn.ts) + "</span></div>" : "") +
        (!CA.can("ae") && /Root cause|Returned|Reopened|Implementation/.test(c.state) ? '<div class="info-banner"><i class="bi bi-person"></i><span>The auditee / action owner completes this workspace. ' + CA.btn({ text: "View as Auditee / Action Owner", action: "switch-role", data: { role: "ae" }, size: "btn-sm" }) + "</span></div>" : "") +
        '<div class="grid g-side"><form class="grid" data-form="car" data-id="' + c.id + '" novalidate>' +
        '<section class="card-ca"><h2 class="card-title"><span class="chip ink">1</span> Immediate correction / containment</h2><fieldset' + (planEdit ? "" : " disabled") + ">" + CA.field({ name: "correction", label: "What was done straight away to contain the issue?", type: "textarea", rows: 2, value: c.correction, required: true }) + "</fieldset></section>" +
        '<section class="card-ca"><h2 class="card-title"><span class="chip ink">2</span> Extent of the issue</h2><fieldset' + (planEdit ? "" : " disabled") + ">" + CA.field({ name: "extent", label: "Where else could this occur? What did you check?", type: "textarea", rows: 2, value: c.extent, placeholder: "Where applicable" }) + "</fieldset></section>" +
        '<section class="card-ca"><h2 class="card-title"><span class="chip ink">3</span> Root-cause analysis <span class="sp"></span><span class="small-muted">Five Whys · Fishbone</span></h2><fieldset class="grid gap-3"' + (planEdit ? "" : " disabled") + ">" +
        '<div class="grid gap-2">' + c.whys.map(function (w, i) { return CA.field({ name: "why" + i, suffix: "", label: "Why " + (i + 1) + (i === 0 ? " — why did the issue happen?" : ""), value: w, required: i < 2, placeholder: i === 0 ? "e.g. Quotes were sent without review" : i < 2 ? "Ask why again" : "Optional" }); }).join("") + "</div>" +
        '<details' + (Object.keys(c.fishbone).length ? " open" : "") + '><summary class="small"><b>Fishbone (optional)</b> — list contributing causes by category</summary><div class="fishbone mt-2">' + CAUSES.slice(0, 6).map(function (k, i) { return '<div class="bone"><label class="form-label" for="fb' + i + '"><b>' + esc(k) + '</b></label><textarea class="form-control form-control-sm" rows="2" id="fb' + i + '" name="fb' + i + '">' + esc(c.fishbone["fb" + i] || "") + "</textarea></div>"; }).join("") + "</div></details>" +
        '<div class="row g-2">' + CA.field({ name: "causeCat", label: "Cause category", type: "select", value: c.causeCat, required: true, placeholder: "Choose…", options: CAUSES, col: "col-md-5", help: "Category list pending decision D-11 (Intertec's seven vs 6M)." }) + CA.field({ name: "rootCause", label: "Root cause statement", type: "textarea", rows: 2, value: c.rootCause, required: true, col: "col-md-7" }) + "</div></fieldset>" +
        (planEdit ? '<div class="ai-box"><span class="ai-tag"><i class="bi bi-stars"></i> Simulated AI coach · A08 RCA &amp; CAPA Coach</span><span class="small">' + esc(CA.SIM.coach.text) + '</span><div class="d-flex gap-2">' + CA.btn({ text: "Use suggested category", action: "car-coach", data: { id: c.id }, size: "btn-sm" }) + '<button type="button" class="btn btn-soft btn-sm" data-action="car-coach-ignore">Ignore</button></div></div>' : "") + "</section>" +
        '<section class="card-ca"><h2 class="card-title"><span class="chip ink">4</span> Corrective action</h2><fieldset class="row g-2"' + (planEdit ? "" : " disabled") + ">" + CA.field({ name: "action", label: "Action to remove the cause and prevent recurrence", type: "textarea", rows: 2, value: c.action, required: true, col: "col-12" }) +
        CA.field({ name: "actionOwner", label: "Action owner", value: c.actionOwner || c.owner, required: true, col: "col-md-6" }) + CA.field({ name: "actionDue", label: "Planned completion date", type: "date", value: c.actionDue, required: true, min: CA.DEMO_TODAY, col: "col-md-6", help: "CAR response due by rule: " + CA.d(c.due) + "." }) + "</fieldset></section>" +
        '<section class="card-ca"><h2 class="card-title"><span class="chip ink">5</span> Implementation evidence ' + (c.state === "Implementation" ? CA.chip("Open", "warn") : "") + "</h2>" +
        (c.evidence && c.evidence.length ? '<div class="list-ca">' + c.evidence.map(function (e) { return '<div class="li-ca"><i class="bi bi-paperclip"></i><span class="sp">' + esc(e) + "<small>Filename only — not uploaded " + "</small></span></div>"; }).join("") + "</div>" : '<p class="small-muted mb-0">No evidence yet.</p>') +
        (evEdit ? '<div class="row g-2"><div class="col-md-7"><label class="form-label" for="car-file">Add evidence file</label><input class="form-control" type="file" id="car-file" data-change="car-file" data-id="' + c.id + '"><div class="form-text">Only the filename is kept ' + CA.sim() + "</div></div>" + CA.field({ name: "implemented", label: "Implementation date", type: "date", value: c.implemented || "", col: "col-md-5" }) + "</div>" : c.implemented ? '<div class="small">Implemented: <b>' + CA.d(c.implemented) + "</b></div>" : "") + "</section>" +
        '<div class="d-flex gap-2 flex-wrap">' + (planEdit ? '<button class="btn btn-soft" type="submit" name="act" value="save" formnovalidate>Save draft</button><button class="btn btn-ink" type="submit" name="act" value="submit"><i class="bi bi-send"></i> Submit plan for review</button>' : "") +
        (evEdit ? '<button class="btn btn-soft" type="submit" name="act" value="save-ev" formnovalidate>Save</button><button class="btn btn-ink" type="submit" name="act" value="evidence" formnovalidate><i class="bi bi-send-check"></i> Submit implementation evidence</button>' : "") +
        (/Plan review|Evidence submitted/.test(c.state) ? '<a class="btn btn-ink" href="#/car/' + c.id + '/review">Go to auditor review →</a>' : "") + (c.state === "Effectiveness review" ? '<a class="btn btn-ink" href="#/effectiveness/' + c.id + '">Go to effectiveness check →</a>' : "") + "</div></form>" +
        '<aside class="grid" style="align-content:start">' +
        (f ? '<section class="card-ca fill"><h2 class="card-title">Finding</h2>' + CA.idLink("finding/" + f.id, f.id) + '<span class="small">' + esc(f.statement || f.aiStatement) + "</span>" + CA.gradeChip(f.grade) + '<span class="small-muted">Clause ' + esc(f.clause) + " · " + esc(CA.bu(f.bu).name) + "</span></section>" : "") +
        escalationCard(c) + followUpCard(c) +
        '<section class="card-ca"><h2 class="card-title">History</h2>' + CA.history((c.history || []).slice().reverse()) + "</section></aside></div>";
    }
  });
  function escalationCard(c) {
    var today = CA.DEMO_TODAY;
    return '<section class="card-ca"><h2 class="card-title"><i class="bi bi-alarm"></i> Deadlines &amp; escalation</h2><div class="list-ca">' + CA.ESCALATION.map(function (e) {
      var d = CA.addDays(c.due, e.off), passed = d <= today && (e.off <= 0 ? c.state !== "Closed" : CA.carOverdue(c));
      return '<div class="li-ca"' + (passed && e.off > 0 ? ' style="border-color:var(--bad)"' : "") + '><span class="mono small" style="width:70px">' + (e.off === 0 ? "Due" : (e.off > 0 ? "+" : "") + e.off + " d") + '</span><span class="sp">' + esc(e.label) + "<small>" + CA.d(d) + " · " + esc(e.to) + "</small></span>" + (passed ? CA.chip(e.off > 0 ? "Triggered" : "Passed", e.off > 0 ? "bad" : "") : "") + "</div>";
    }).join("") + '</div><p class="small-muted mb-0"><b>Timing basis:</b> deterministic workflow rule, offsets from the CAR due date (explanation reference: due −7 reminder, +1, +7, +14). Calendar vs UAE working-day counting to be confirmed against the BRD. The AI never calculates these dates.</p></section>';
  }
  function followUpCard(c) {
    if (c.state === "Closed") return "";
    return '<section class="card-ca"><h2 class="card-title"><i class="bi bi-microsoft-teams"></i> Follow-up message</h2><div class="ai-box"><span class="ai-tag"><i class="bi bi-stars"></i> Simulated AI wording · A09 Follow-up</span><span class="small">' + esc(CA.SIM.followUp(c.id, CA.d(c.due))) + "</span></div>" + CA.btn({ text: "Send reminder now (simulated)", icon: "send", action: "car-remind", data: { id: c.id }, roles: "pm la au", size: "btn-sm" }) + "</section>";
  }
  CA.on("car-coach", function (el) { var c = CA.car(el.dataset.id), s = document.getElementById("f-causeCat"); if (s) s.value = CA.SIM.coach.cat; CA.aiLog("A08", c.id, "Suggested cause category " + CA.SIM.coach.cat, "Accepted"); CA.toast("Category set to " + CA.SIM.coach.cat + " — you can still change it. Save to keep it.", "ai"); });
  CA.on("car-coach-ignore", function (el) { el.closest(".ai-box").remove(); CA.toast("Suggestion dismissed", "info"); });
  CA.on("car-remind", function (el) { var c = CA.car(el.dataset.id); c.history.push({ ts: CA.stamp(), who: CA.me().user, what: "Reminder sent to " + c.owner + " (Teams + email simulated; wording drafted by A09)" }); CA.log("Reminder sent", c.id, "Simulated Teams card + email"); CA.toast("Reminder sent to " + esc(c.owner) + " (simulated)", "info"); CA.render(); });
  CA.on("car-file", function (el) {
    var c = CA.car(el.dataset.id), n = el.files && el.files[0] ? el.files[0].name : "";
    if (!n) return; c.evidence = c.evidence || []; c.evidence.push(n);
    c.history.push({ ts: CA.stamp(), who: CA.me().user, what: "Evidence filename added: " + n }); CA.log("Attached", c.id, n + " (not uploaded)"); CA.store.save();
    CA.toast("Added " + esc(n) + " (filename only, nothing uploaded)", "info"); CA.render();
  });
  CA.onForm("car", function (form, d, submitter) {
    var c = CA.car(form.dataset.id), act = submitter ? submitter.value : "save";
    if (act === "save" || act === "submit") {
      c.correction = d.correction; c.extent = d.extent; c.whys = [0, 1, 2, 3, 4].map(function (i) { return d["why" + i] || ""; });
      c.fishbone = {}; for (var i = 0; i < 6; i++) if (d["fb" + i]) c.fishbone["fb" + i] = d["fb" + i];
      c.causeCat = d.causeCat; c.rootCause = d.rootCause; c.action = d.action; c.actionOwner = d.actionOwner; c.actionDue = d.actionDue;
      var f = CA.finding(c.finding); if (f) { f.rootCause = c.rootCause; f.causeCat = c.causeCat; }
    }
    if (act === "submit") {
      c.state = "Plan review"; c.history.push({ ts: CA.stamp(), who: CA.me().user, what: "Root cause & action plan submitted for review" });
      CA.log("Submitted", c.id, "Action plan submitted for auditor review"); CA.store.save(); CA.toast("Plan submitted. The auditor reviews it next."); CA.render(); return;
    }
    if (act === "evidence" || act === "save-ev") {
      if (d.implemented) c.implemented = d.implemented;
      if (act === "evidence") {
        if (!c.evidence || !c.evidence.length) { CA.toast("Add at least one evidence file first.", "warn"); return; }
        if (!c.implemented) { CA.toast("Enter the implementation date.", "warn"); return; }
        c.state = "Evidence submitted"; c.history.push({ ts: CA.stamp(), who: CA.me().user, what: "Implementation evidence submitted (" + c.evidence.length + " file" + (c.evidence.length > 1 ? "s" : "") + ")" });
        CA.log("Submitted", c.id, "Implementation evidence"); CA.store.save(); CA.toast("Evidence submitted for auditor verification."); CA.render(); return;
      }
    }
    CA.log("Saved", c.id, "CAR draft"); CA.store.save(); CA.toast("Saved"); CA.render();
  });

  // ---------- review & verification ----------
  CA.route("car/:id/review", {
    title: function (p) { return p.id + " review"; }, roles: "pm la au ae", nav: "cars",
    render: function (p) {
      var c = CA.car(p.id); if (!c) return CA.empty("question-circle", "CAR not found", esc(p.id));
      var plan = c.state === "Plan review", ev = c.state === "Evidence submitted";
      var fits = c.causeCat && c.action ? (/approver|mandatory|backup|gate|workflow|procedure/i.test(c.action) ? "The action addresses the stated root cause (" + c.rootCause.slice(0, 80) + (c.rootCause.length > 80 ? "…" : "") + ")." : "The action does not clearly address the stated root cause. Consider returning it.") : "";
      return carHead(c, "r") +
        '<div class="grid g2"><section class="card-ca"><h2 class="card-title">Submitted plan</h2><dl class="row small mb-0">' +
        [["Correction", c.correction], ["Extent", c.extent || "—"], ["Five Whys", c.whys.filter(Boolean).map(function (w, i) { return (i + 1) + ". " + w; }).join("  ") || "—"], ["Cause category", c.causeCat || "—"], ["Root cause", c.rootCause || "—"], ["Corrective action", c.action || "—"], ["Owner / date", (c.actionOwner || c.owner) + " · " + (c.actionDue ? CA.d(c.actionDue) : "—")]].map(function (r) { return '<dt class="col-4">' + r[0] + '</dt><dd class="col-8">' + esc(r[1]) + "</dd>"; }).join("") + "</dl>" +
        (fits ? '<div class="ai-box"><span class="ai-tag"><i class="bi bi-stars"></i> Simulated AI check · A08</span><span class="small">' + esc(fits) + '</span><span class="rationale">The auditor accepts or returns. A08 never closes a CAR.</span></div>' : "") +
        (plan ? '<div class="d-flex gap-2">' + CA.btn({ text: "Return to owner", action: "car-return", data: { id: c.id, stage: "plan" }, roles: "au la", cls: "btn-danger-soft" }) + CA.btn({ text: "Accept plan", icon: "check2", action: "car-accept", data: { id: c.id }, roles: "au la", cls: "btn-okay" }) + "</div>" : "") + "</section>" +
        '<section class="card-ca"><h2 class="card-title">Implementation evidence</h2>' + (c.evidence && c.evidence.length ? '<div class="list-ca">' + c.evidence.map(function (e) { return '<div class="li-ca"><i class="bi bi-file-earmark"></i><span class="sp">' + esc(e) + '</span><button class="btn btn-soft btn-sm" data-action="sim-open" data-n="' + esc(e) + '">Open</button></div>'; }).join("") + "</div>" : '<p class="small-muted mb-0">No evidence submitted yet.</p>') +
        (c.implemented ? '<div class="small">Implemented: <b>' + CA.d(c.implemented) + "</b></div>" : "") +
        (ev ? '<div class="info-banner"><i class="bi bi-info-circle"></i><span>Verification confirms the action was implemented. It does <b>not</b> mean it was effective — that is checked 60–90 days later.</span></div><div class="d-flex gap-2">' + CA.btn({ text: "Return — more evidence needed", action: "car-return", data: { id: c.id, stage: "evidence" }, roles: "au la", cls: "btn-danger-soft" }) + CA.btn({ text: "Verify implementation", icon: "patch-check", action: "car-verify", data: { id: c.id }, roles: "au la", cls: "btn-okay" }) + "</div>" : "") +
        (c.verifiedBy ? '<div class="ai-box approved"><span class="human-tag"><i class="bi bi-person-check"></i> Implementation verified</span><span class="approval-stamp">' + esc(c.verifiedBy) + "</span></div>" : "") + "</section></div>" +
        (!plan && !ev ? '<div class="info-banner"><i class="bi bi-hourglass"></i><span>Nothing waiting for review. Current state: <b>' + esc(c.state) + "</b>.</span></div>" : "");
    }
  });
  CA.on("sim-open", function (el) { CA.toast("Opening " + esc(el.dataset.n) + " — simulated; the prototype keeps filenames only.", "info"); });
  CA.on("car-accept", function (el) {
    var c = CA.car(el.dataset.id); c.state = "Implementation"; c.planAcceptedBy = CA.me().user + " · " + CA.stamp();
    c.history.push({ ts: CA.stamp(), who: CA.me().user, what: "Action plan accepted" }); CA.log("Accepted", c.id, "Action plan"); CA.store.save(); CA.toast("Plan accepted. The owner implements and uploads evidence."); CA.render();
  });
  CA.on("car-return", function (el) {
    var c = CA.car(el.dataset.id), stage = el.dataset.stage;
    CA.modal({ title: "Return " + c.id, okText: "Return", body: '<form novalidate>' + CA.field({ name: "reason", label: "What needs to change?", type: "textarea", required: true }) + "</form>",
      onOk: function (b) { var d = CA.formData(b.querySelector("form")); c.state = stage === "plan" ? "Returned" : "Implementation"; c.history.push({ ts: CA.stamp(), who: CA.me().user, what: "Returned: " + d.reason }); CA.log("Returned", c.id, d.reason); CA.store.save(); CA.toast("Returned to the action owner", "warn"); CA.render(); } });
  });
  CA.on("car-verify", function (el) {
    var c = CA.car(el.dataset.id);
    c.state = "Effectiveness review"; c.verifiedBy = CA.me().user + " · " + CA.stamp();
    c.history.push({ ts: CA.stamp(), who: CA.me().user, what: "Implementation verified; effectiveness check scheduled " + CA.d(CA.addDays(c.implemented, 60)) + " – " + CA.d(CA.addDays(c.implemented, 90)) + " (rule)" });
    CA.log("Verified", c.id, "Implementation verified; effectiveness window set by rule"); CA.store.save(); CA.toast("Verified. Effectiveness check scheduled for 60–90 days after implementation."); CA.render();
  });

  // ---------- effectiveness ----------
  CA.route("effectiveness", {
    title: "Effectiveness checks", roles: "pm la au", nav: "effectiveness",
    render: function () {
      var rows = CA.S.cars.filter(function (c) { return c.state === "Effectiveness review" || c.effectiveness; });
      return CA.head({ crumbs: [["Actions"], ["Effectiveness checks"]], title: "Effectiveness checks", sub: "Fixes are re-checked 60–90 days after implementation and tested for recurrence. An action being submitted or verified is not the same as it being effective." }) +
        (rows.length ? CA.table([
          { k: "id", label: "CAR", fmt: function (c) { return CA.idLink("effectiveness/" + c.id, c.id); } }, { k: "bu", label: "BU", fmt: function (c) { return esc(CA.bu(c.bu).name); } },
          { k: "implemented", label: "Implemented", fmt: function (c) { return CA.d(c.implemented); } },
          { k: "w", label: "Review window (60–90 d)", sort: false, fmt: function (c) { return c.implemented ? CA.d(CA.addDays(c.implemented, 60)) + " – " + CA.d(CA.addDays(c.implemented, 90)) : "—"; } },
          { k: "effectiveness", label: "Decision", fmt: function (c) { return c.effectiveness ? CA.chip(c.effectiveness.decision, c.effectiveness.decision === "Effective" ? "ok" : "bad") : CA.chip("Pending", "warn"); } }
        ], rows, { id: "t-eff", rowRoute: function (c) { return "effectiveness/" + c.id; } }) : '<section class="card-ca">' + CA.empty("patch-check", "No effectiveness checks due", "Checks appear after a CAR's implementation is verified.") + "</section>");
    }
  });
  CA.route("effectiveness/:id", {
    title: function (p) { return "Effectiveness · " + p.id; }, roles: "pm la au", nav: "effectiveness",
    render: function (p) {
      var c = CA.car(p.id); if (!c) return CA.empty("question-circle", "CAR not found", esc(p.id));
      var f = CA.finding(c.finding), open = c.state === "Effectiveness review";
      if (!c.implemented) return carHead(c, "e") + '<section class="card-ca">' + CA.empty("hourglass", "Not ready for an effectiveness check", "The action must be implemented and verified first. Current state: " + esc(c.state) + ".", '<a class="btn btn-ink btn-sm" href="#/car/' + c.id + '">Open CAR workspace</a>') + "</section>";
      var w1 = CA.addDays(c.implemented, 60), w2 = CA.addDays(c.implemented, 90), early = CA.DEMO_TODAY < w1;
      return carHead(c, "e") + '<div class="grid g2"><section class="card-ca"><h2 class="card-title">What was fixed</h2><dl class="row small mb-0">' +
        '<dt class="col-4">Original finding</dt><dd class="col-8">' + (f ? CA.idLink("finding/" + f.id, f.id) + " · " + esc(f.statement || f.aiStatement) : "—") + '</dd><dt class="col-4">Approved action</dt><dd class="col-8">' + esc(c.action || "—") + '</dd><dt class="col-4">Implemented</dt><dd class="col-8">' + CA.d(c.implemented) + '</dd><dt class="col-4">Review window</dt><dd class="col-8">' + CA.d(w1) + " – " + CA.d(w2) + " (60–90 days, rule)</dd></dl>" +
        (early && open ? '<div class="sim-banner"><i class="bi bi-skip-forward"></i><span><b>Demo time-skip:</b> the window opens ' + CA.d(w1) + ". In the prototype you can record the decision now to complete the journey.</span></div>" : "") + "</section>" +
        '<section class="card-ca"><h2 class="card-title">Effectiveness review</h2>' +
        (open ? '<div class="ai-box"><span class="ai-tag"><i class="bi bi-stars"></i> Simulated AI suggestion · A10 Effectiveness Verifier</span><span class="small">' + esc(CA.SIM.effectiveness) + "</span></div>" +
          '<form data-form="eff" data-id="' + c.id + '" novalidate class="grid gap-2"><fieldset class="grid gap-2"' + (CA.can("la au") ? "" : " disabled") + ">" + CA.field({ name: "evidence", label: "Evidence reviewed", type: "textarea", rows: 2, required: true, value: "12 quotations issued after implementation sampled; all had signed contract review." }) +
          CA.field({ name: "recurrence", label: "Recurrence / repeat issue check", type: "select", required: true, value: "", placeholder: "Choose…", options: ["No recurrence found", "Recurrence found", "Inconclusive — more sampling needed"] }) +
          CA.field({ name: "comment", label: "Comment (required for Not effective / Reopen)", type: "textarea", rows: 2 }) + "</fieldset>" +
          (CA.can("la au") ? '<div class="d-flex gap-2 flex-wrap"><button class="btn btn-okay" type="submit" name="act" value="Effective"><i class="bi bi-check2-circle"></i> Effective — close CAR</button><button class="btn btn-danger-soft" type="submit" name="act" value="Not effective">Not effective</button><button class="btn btn-soft" type="submit" name="act" value="Reopen">Reopen for more action</button></div>' : CA.btn({ text: "Record decision", roles: "la au" })) + "</form>" :
          c.effectiveness ? '<div class="ai-box ' + (c.effectiveness.decision === "Effective" ? "approved" : "") + '"><span class="human-tag"' + (c.effectiveness.decision === "Effective" ? "" : ' style="color:var(--bad)"') + '><i class="bi bi-person-check"></i> ' + esc(c.effectiveness.decision) + '</span><span class="small">' + esc(c.effectiveness.recurrence) + " · " + esc(c.effectiveness.evidence) + '</span><span class="approval-stamp">' + esc(c.effectiveness.by) + "</span></div>" : '<p class="small-muted">Not open. State: ' + esc(c.state) + "</p>") + "</section></div>" +
        '<section class="card-ca"><h2 class="card-title">History / timeline</h2>' + CA.history((c.history || []).slice().reverse()) + "</section>";
    }
  });
  CA.onForm("eff", function (form, d, submitter) {
    var c = CA.car(form.dataset.id), dec = submitter.value;
    if (dec !== "Effective" && !d.comment) { CA.toast("Add a comment for " + dec + ".", "warn"); return; }
    if (dec === "Effective" && d.recurrence === "Recurrence found") { CA.toast("Recurrence was found — the action cannot be rated Effective.", "warn"); return; }
    c.effectiveness = { decision: dec === "Reopen" ? "Reopened" : dec, recurrence: d.recurrence, evidence: d.evidence, comment: d.comment, by: CA.me().user + " (" + CA.me().label + ") · " + CA.stamp() };
    CA.aiLog("A10", c.id, "Suggested rating Effective", dec === "Effective" ? "Accepted" : "Overridden: " + dec);
    if (dec === "Effective") {
      c.state = "Closed"; c.history.push({ ts: CA.stamp(), who: CA.me().user, what: "Rated Effective — CAR closed" });
      var f = CA.finding(c.finding); if (f) { f.status = "Closed"; f.history && f.history.push({ ts: CA.stamp(), who: CA.me().user, what: "Closed after effectiveness check" }); }
      CA.log("Closed", c.id, "Effectiveness: Effective");
      CA.toast(c.id + " rated Effective and closed.");
    } else if (dec === "Not effective") {
      c.state = "Reopened"; c.history.push({ ts: CA.stamp(), who: CA.me().user, what: "Not effective: " + d.comment + " — new root-cause analysis required" });
      CA.log("Not effective", c.id, d.comment); CA.toast(c.id + " rated Not effective and reopened for a new root cause.", "warn");
    } else {
      c.state = "Implementation"; c.history.push({ ts: CA.stamp(), who: CA.me().user, what: "Reopened: " + d.comment + " — additional action / evidence required" });
      CA.log("Reopened", c.id, d.comment); CA.toast(c.id + " reopened for additional action.", "warn");
    }
    CA.store.save(); CA.render();
  });

  // ---------- overdue board ----------
  CA.route("overdue", {
    title: "Overdue board", roles: "pm ex be", nav: "overdue",
    render: function () {
      var S = CA.S, open = S.cars.filter(function (c) { return c.state !== "Closed" && c.state !== "Effectiveness review"; }).map(function (c) { return Object.assign({ t: CA.overdueTier(c.due) }, c); });
      var cols = [["+1", "+1 day · action owner, cc BU manager", "warn"], ["+7", "+7 days · line manager", "bad"], ["+14", "+14 days · top management", "bad"]];
      var dueSoon = open.filter(function (c) { return c.t.late < 1 && c.t.late >= -7; });
      return CA.head({ crumbs: [["Actions"], ["Overdue board"]], title: "Overdue board", chips: CA.chip("Demo date " + CA.d(CA.DEMO_TODAY)), sub: "Overdue CARs by escalation tier. Tiers are deterministic workflow rules (offsets from the due date); A09 only drafts the wording of reminders." }) +
        '<section class="card-ca"><h2 class="card-title">Escalation policy ' + CA.src("Explanation reference") + '</h2><div class="esc-track">' +
        [["Due −7", "Reminder", "Action owner"], ["Due", "Action plan due", "30 days after ack."], ["+1 day", "Overdue", "Owner, cc BU manager"], ["+7 days", "Escalate", "Line manager"], ["+14 days", "Escalate", "Top management"], ["+60–90 days", "Effectiveness check", "After implementation"]].map(function (e, i) { return '<div class="esc-pt ' + (i >= 2 && i <= 4 ? "passed" + (i > 2 ? " red" : "") : i === 5 ? "next" : "") + '"><span class="day">' + e[0] + '</span><span class="pin"></span><b>' + e[1] + "</b><small>" + e[2] + "</small></div>"; }).join("") +
        '</div><p class="small-muted mb-0">Working-day vs calendar-day basis: the explanation reference states "+1 day / +7 days / +14 days"; the SLA engine runs on a UAE calendar. Exact basis to be confirmed against the BRD. This demo counts calendar days.</p></section>' +
        '<div class="grid g3">' + cols.map(function (col) {
          var list = open.filter(function (c) { return c.t.tier === col[0]; });
          return '<section class="card-ca"><h2 class="card-title">' + CA.chip(col[0], col[2]) + " " + esc(col[1]) + '<span class="sp"></span><span class="mono small-muted">' + list.length + "</span></h2>" + (list.length ? list.map(function (c) {
            return '<div class="li-ca" style="display:grid;gap:4px"><div class="d-flex gap-2 align-items-center"><a class="id-link" href="#/car/' + c.id + '">' + c.id + "</a>" + CA.chip(c.t.late + " days late", col[2]) + '</div><span class="small">' + esc(CA.bu(c.bu).name) + " · owner " + esc(c.owner) + '</span><span class="small-muted">' + esc(c.state) + " · due " + CA.d(c.due) + '</span><div class="d-flex gap-2">' + CA.btn({ text: "Send reminder (simulated)", action: "car-remind", data: { id: c.id }, roles: "pm", size: "btn-sm" }) + CA.btn({ text: "Extension", action: "car-extend", data: { id: c.id }, roles: "pm", size: "btn-sm" }) + "</div></div>";
          }).join("") : '<p class="small-muted mb-0">None.</p>') + "</section>";
        }).join("") + "</div>" +
        '<section class="card-ca"><h2 class="card-title">Due in the next 7 days</h2>' + (dueSoon.length ? '<div class="list-ca">' + dueSoon.map(function (c) { return '<a class="li-ca" href="#/car/' + c.id + '"><span class="mono">' + c.id + '</span><span class="sp">' + esc(CA.bu(c.bu).name) + "<small>Due " + CA.d(c.due) + "</small></span></a>"; }).join("") + "</div>" : '<p class="small-muted mb-0">None.</p>') + "</section>";
    }
  });
  CA.on("car-extend", function (el) {
    var c = CA.car(el.dataset.id);
    CA.modal({ title: "Extension for " + c.id, okText: "Approve extension", body: '<form novalidate class="grid gap-2">' + CA.field({ name: "due", label: "New due date", type: "date", required: true, min: CA.DEMO_TODAY, value: CA.addDays(CA.DEMO_TODAY, 14) }) + CA.field({ name: "reason", label: "Reason", type: "textarea", required: true }) + '<p class="small-muted mb-0">Escalation timers restart from the new date (rule). The decision and reason are logged.</p></form>',
      onOk: function (b) { var d = CA.formData(b.querySelector("form")); var old = c.due; c.due = d.due; c.history.push({ ts: CA.stamp(), who: CA.me().user, what: "Extension approved: " + CA.d(old) + " → " + CA.d(d.due) + " (" + d.reason + ")" }); CA.log("Extended", c.id, CA.d(old) + " → " + CA.d(d.due)); CA.store.save(); CA.toast("Extension approved for " + c.id); CA.render(); } });
  });
})(window.CA);
