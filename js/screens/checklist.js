/* Scope & applicability (A03) and AI Checklist Builder (A04) — the priority journey screens.
   All "AI" output is deterministic mock data from CA.SIM, clearly labelled as simulated. */
(function (CA) {
  var esc = CA.esc;
  var WIZ = [["Audit details", "scope"], ["Scope & activities", "scope"], ["Prior findings & context", "scope"], ["Generate checklist", "checklist"], ["Review suggestions", "checklist"], ["Approve checklist", "checklist"]];

  function wizard(a, now) {
    var done = -1;
    if (a.scope && a.scope.confirmed) done = 2;
    if (a.checklist) done = 3;
    if (a.checklist && !a.checklist.items.some(function (i) { return i.state === "pending"; })) done = 4;
    if (a.checklist && a.checklist.state === "Approved") done = 5;
    return '<nav class="wizard" aria-label="Checklist builder steps">' + WIZ.map(function (w, i) {
      var cls = i <= done ? "done" : "", isNow = i === now;
      return '<a href="#/audit/' + a.id + "/" + w[1] + '" class="' + cls + (isNow ? " now" : "") + '"' + (isNow ? ' aria-current="step"' : "") + '><span class="n">STEP ' + (i + 1) + (i <= done ? " ✓" : "") + "</span><b>" + w[0] + "</b></a>";
    }).join("") + "</nav>";
  }

  // ---------- Scope & applicability ----------
  CA.route("audit/:id/scope", {
    title: "Scope & applicability", roles: "pm la au", nav: "audits",
    render: function (p) {
      var a = CA.audit(p.id); if (!a) return CA.empty("question-circle", "Audit not found", esc(p.id));
      var bu = CA.bu(a.bu), sl = CA.slot(a.slot);
      a.scope = a.scope || { objective: "", boundaries: "", activities: [], exclusions: "", confirmed: false };
      var sc = a.scope, locked = sc.confirmed, canEdit = CA.can("la pm") && !locked;
      var acts = ["Quotations", "Contract review", "Customer communication", "Customer feedback", "Pricing", "Tender management"];
      var prior = CA.S.findings.filter(function (f) { return f.bu === a.bu && f.historic; });
      return CA.auditHead(a, "scope") + wizard(a, sc.confirmed ? 2 : 1) +
        '<form data-form="scope" data-id="' + a.id + '" novalidate class="grid"><div class="grid g2">' +
        '<section class="card-ca"><h2 class="card-title"><span class="chip ink">1</span> Audit details</h2><dl class="row small mb-0">' +
        '<dt class="col-4">Audit ID</dt><dd class="col-8 mono">' + a.id + " " + CA.demo("Illustrative ID") + '</dd><dt class="col-4">Business unit</dt><dd class="col-8">' + esc(bu.name) + '</dd><dt class="col-4">Location</dt><dd class="col-8">' + esc(sl.location) + ", " + esc(bu.country) + '</dd><dt class="col-4">Cycle</dt><dd class="col-8">' + esc(a.cycle) + '</dd><dt class="col-4">Audit type</dt><dd class="col-8">' + esc(a.type) + '</dd><dt class="col-4">Lead / auditor</dt><dd class="col-8">' + esc(CA.auditor(a.lead).name) + " / " + esc(CA.auditor(a.auditor).name) + "</dd></dl>" +
        CA.field({ name: "standard", label: "Standard & edition", type: "select", value: a.standard, options: ["ISO 9001:2026", "ISO 9001:2015"], required: true, help: "Demo default is the edition configured in demo data (ISO 9001:2026)." }) + "</section>" +
        '<section class="card-ca"><h2 class="card-title"><span class="chip ink">2</span> Scope &amp; activities</h2><fieldset class="grid gap-2"' + (canEdit ? "" : " disabled") + ">" +
        CA.field({ name: "objective", label: "Audit objective", type: "textarea", rows: 2, value: sc.objective, required: true }) +
        CA.field({ name: "boundaries", label: "Boundaries (what is in scope)", type: "textarea", rows: 2, value: sc.boundaries, required: true }) +
        '<fieldset><legend class="form-label req">Activities / processes</legend><div class="d-flex flex-wrap gap-3">' + acts.map(function (x, i) { return '<div class="form-check"><input class="form-check-input" type="checkbox" data-multi="1" name="activities" value="' + x + '" id="act' + i + '"' + (sc.activities.indexOf(x) > -1 ? " checked" : "") + '><label class="form-check-label small" for="act' + i + '">' + x + "</label></div>"; }).join("") + "</div></fieldset>" +
        CA.field({ name: "exclusions", label: "Exclusions (with justification)", type: "textarea", rows: 2, value: sc.exclusions, placeholder: "Exclusions come from the applicability decisions below; add any other justified exclusion." }) + "</fieldset></section></div>" +
        applicabilityCard(a, canEdit) +
        '<section class="card-ca"><h2 class="card-title"><span class="chip ink">3</span> Prior findings &amp; relevant context</h2><p class="small muted mb-0">Fed to A04 so the checklist weights areas with past problems.</p><div class="list-ca">' +
        (prior.length ? prior.map(function (f) { return '<label class="li-ca"><input class="form-check-input me-1" type="checkbox" checked disabled><span class="sp"><span class="mono">' + f.id + "</span> · clause " + esc(f.clause) + " · " + CA.gradeLabel(f.grade) + "<small>" + esc(f.statement) + "</small></span>" + CA.chip(f.status) + "</label>"; }).join("") : '<p class="small-muted">No prior findings for this BU.</p>') +
        '<div class="li-ca"><i class="bi bi-arrow-left-right"></i><span class="sp">ISO 9001:2015 → 2026 changed clauses<small>From the crosswalk (CW-01, CW-02, CW-04)</small></span>' + CA.link("crosswalk", "View") + "</div></div></section>" +
        '<div class="d-flex gap-2 flex-wrap">' + (locked ? '<div class="ai-box approved w-100"><span class="human-tag"><i class="bi bi-person-check"></i> Scope confirmed</span><span class="small">' + esc(sc.confirmedBy) + " · " + esc(sc.confirmedAt) + '</span></div><a class="btn btn-ink" href="#/audit/' + a.id + '/checklist">Continue to checklist builder →</a>' + CA.btn({ text: "Reopen scope", action: "scope-reopen", data: { id: a.id }, roles: "la" }) :
          (CA.can("la pm") ? '<button class="btn btn-soft" type="submit" name="act" value="save" formnovalidate>Save draft</button><button class="btn btn-ink" type="submit" name="act" value="confirm"' + (CA.can("la") ? "" : " disabled title=\"Lead Auditor confirms\"") + '><i class="bi bi-check2-circle"></i> Confirm scope &amp; continue</button>' : CA.btn({ text: "Confirm scope", roles: "la" }))) + "</div></form>";
    }
  });
  function applicabilityCard(a, canEdit) {
    if (!a.applicability) {
      return '<section class="card-ca"><h2 class="card-title"><i class="bi bi-stars"></i> Applicability · A03 Applicability &amp; Obligations</h2>' +
        '<div class="ai-box"><span class="ai-tag"><i class="bi bi-stars"></i> Not run yet</span><span class="small">A03 proposes which clauses / checkpoints apply to this BU, location and activity, with a one-line reason. Missing information becomes a question, never an assumption.</span><div>' +
        CA.btn({ text: "Run applicability check (simulated)", icon: "stars", action: "run-a03", data: { id: a.id }, roles: "la pm", cls: "btn-ai" }) + "</div></div></section>";
    }
    return '<section class="card-ca"><h2 class="card-title"><i class="bi bi-stars"></i> Applicability · A03 <span class="sp"></span>' + CA.chip("Simulated AI suggestion", "ai") + "</h2>" +
      '<p class="small muted mb-0">Confirm or override each recommendation. A "not applicable" proposal is never applied silently: it needs a named person and a reason.</p>' +
      '<div class="table-wrap"><table class="table-ca"><thead><tr><th>Clause</th><th>Topic</th><th>AI recommendation &amp; reason</th><th>Human decision</th><th>Reason (required for N/A or override)</th></tr></thead><tbody>' +
      a.applicability.map(function (r, i) {
        var na = r.rec !== "Applicable";
        return "<tr><td class=\"mono\">" + esc(r.clause) + "</td><td>" + esc(r.topic) + '</td><td class="ai-cell"><b>' + esc(r.rec) + '</b><div class="small">' + esc(r.reason) + "</div></td><td>" +
          '<select class="form-select form-select-sm" name="dec' + i + '" aria-label="Decision for ' + esc(r.clause) + '"' + (canEdit ? "" : " disabled") + '><option value="">Decide…</option><option value="applicable"' + (r.decision === "applicable" ? " selected" : "") + ">" + (na ? "Override: applicable" : "Confirm: applicable") + '</option><option value="na"' + (r.decision === "na" ? " selected" : "") + ">" + (na ? "Confirm: not applicable" : "Override: not applicable") + "</option></select>" +
          (r.by ? '<div class="approval-stamp">' + esc(r.by) + "</div>" : "") + "</td><td>" +
          '<input class="form-control form-control-sm" name="why' + i + '" value="' + esc(r.why || "") + '" placeholder="' + (na ? "Why not applicable?" : "Only if overriding") + '"' + (canEdit ? "" : " disabled") + "></td></tr>";
      }).join("") + "</tbody></table></div></section>";
  }
  CA.on("run-a03", function (el) {
    var a = CA.audit(el.dataset.id);
    el.disabled = true; el.innerHTML = '<span class="spinner-border spinner-border-sm"></span> A03 checking applicability (simulated)…';
    setTimeout(function () {
      a.applicability = CA.SIM.applicability.map(function (r) { return Object.assign({}, r, { decision: "", why: "", by: "" }); });
      CA.aiLog("A03", a.id, "Applicability suggestions for " + a.applicability.length + " clauses");
      CA.log("AI suggested", a.id, "A03 applicability (simulated)"); CA.store.save();
      CA.toast("A03 returned " + a.applicability.length + " applicability suggestions — 1 proposed not applicable needs your decision.", "ai"); CA.render();
    }, 1300);
  });
  CA.onForm("scope", function (form, d, submitter) {
    var a = CA.audit(form.dataset.id), sc = a.scope;
    a.standard = d.standard;
    if (d.objective != null) { sc.objective = d.objective; sc.boundaries = d.boundaries; sc.activities = d.activities || []; sc.exclusions = d.exclusions; }
    if (!sc.activities.length) { CA.toast("Select at least one activity / process.", "warn"); return; }
    var confirm = submitter && submitter.value === "confirm";
    if (a.applicability) {
      var missing = [];
      a.applicability.forEach(function (r, i) {
        r.decision = d["dec" + i] || ""; r.why = d["why" + i] || "";
        var override = (r.rec === "Applicable") !== (r.decision === "applicable");
        if (r.decision && (r.decision === "na" || override) && !r.why) missing.push(r.clause);
        if (r.decision) r.by = CA.me().user + " · " + CA.stamp();
      });
      if (missing.length) { CA.toast("Add a reason for clause " + missing.join(", ") + " (not applicable or override).", "warn"); CA.store.save(); CA.render(); return; }
      var nas = a.applicability.filter(function (r) { return r.decision === "na"; });
      sc.exclusions = nas.map(function (r) { return r.clause + " " + r.topic + " — " + r.why; }).join("; ") || sc.exclusions;
    }
    if (confirm) {
      if (!a.applicability) { CA.toast("Run the applicability check first.", "warn"); return; }
      if (a.applicability.some(function (r) { return !r.decision; })) { CA.toast("Decide every applicability recommendation before confirming.", "warn"); CA.store.save(); CA.render(); return; }
      sc.confirmed = true; sc.confirmedBy = CA.me().user + " (" + CA.me().label + ")"; sc.confirmedAt = CA.stamp();
      a.applicability.forEach(function (r) { CA.aiLog("A03", a.id, "Applicability " + r.clause, (r.rec === "Applicable") === (r.decision === "applicable") ? "Accepted" : "Overridden"); });
      CA.log("Confirmed", a.id, "Scope & applicability confirmed"); CA.store.save();
      CA.toast("Scope confirmed. Continue to the checklist builder."); CA.go("audit/" + a.id + "/checklist");
    } else { CA.log("Saved", a.id, "Scope draft"); CA.store.save(); CA.toast("Scope draft saved"); CA.render(); }
  });
  CA.on("scope-reopen", function (el) { var a = CA.audit(el.dataset.id); a.scope.confirmed = false; CA.log("Reopened", a.id, "Scope reopened"); CA.render(); });

  // ---------- Checklist builder ----------
  var STATE_LBL = { pending: "Pending review", accepted: "Accepted", edited: "Edited & accepted", rejected: "Rejected" };
  CA.route("audit/:id/checklist", {
    title: "AI Checklist Builder", roles: "pm la au", nav: "audits",
    render: function (p) {
      var a = CA.audit(p.id); if (!a) return CA.empty("question-circle", "Audit not found", esc(p.id));
      var cl = a.checklist;
      if (!a.scope || !a.scope.confirmed) return CA.auditHead(a, "checklist") + wizard(a, 3) + '<section class="card-ca">' + CA.empty("signpost-split", "Confirm scope first", "The checklist is tailored from the confirmed scope, applicability decisions and prior findings (steps 1–3).", '<a class="btn btn-ink btn-sm" href="#/audit/' + a.id + '/scope">Go to scope &amp; applicability</a>') + "</section>";
      var head = CA.auditHead(a, "checklist");
      if (!cl) return head + wizard(a, 3) +
        '<section class="card-ca"><h2 class="card-title"><span class="chip ink">4</span> Generate checklist</h2><div id="gen-area">' +
        '<div class="ai-box"><span class="ai-tag"><i class="bi bi-stars"></i> A04 Checklist Builder · simulated</span><span class="small">Uses the confirmed scope (' + esc(a.scope.activities.join(", ")) + "), " + esc(a.standard) + ", applicability decisions, changed clauses and prior findings. The prototype returns a deterministic 10-item sample — no model is called.</span><div>" +
        CA.btn({ text: "Generate checklist", icon: "stars", action: "gen-checklist", data: { id: a.id }, roles: "la", cls: "btn-ai" }) + "</div></div>" + flowNote() + "</div></section>";
      var items = cl.items, n = function (s) { return items.filter(function (i) { return i.state === s; }).length; };
      var pending = n("pending"), approved = cl.state === "Approved";
      return head + wizard(a, approved ? 5 : 4) +
        '<div class="d-flex flex-wrap gap-2 align-items-center">' + CA.chip(items.length + " items drafted in " + cl.secs + " s (simulated)", "ai") + CA.chip(n("accepted") + n("edited") + " accepted", "ok") + CA.chip(n("rejected") + " rejected", n("rejected") ? "bad" : "") + CA.chip(pending + " pending", pending ? "warn" : "ok") + '<span class="sp"></span>' +
        (approved ? "" : CA.btn({ text: "Accept all pending (except flagged)", action: "accept-all", data: { id: a.id }, roles: "la", size: "btn-sm" }) + CA.btn({ text: "Approve checklist", icon: "check2-circle", action: "approve-checklist", data: { id: a.id }, roles: "la", cls: "btn-okay" })) + "</div>" +
        (approved ? '<div class="ai-box approved"><span class="human-tag"><i class="bi bi-person-check"></i> Checklist approved · ' + esc(cl.approvedBy) + " · " + esc(cl.approvedAt) + '</span><span class="small">' + CA.checklistItems(a).length + " questions in the audit-specific checklist. Rejected items are kept in the log but excluded.</span><div><a class=\"btn btn-ink btn-sm\" href=\"#/audit/" + a.id + '/fieldwork">Go to fieldwork →</a></div></div>' : "") +
        '<div class="grid g-side"><div class="grid">' + items.map(function (it) { return itemCard(a, it, approved); }).join("") + "</div>" +
        '<aside class="grid" style="align-content:start"><section class="card-ca fill"><h2 class="card-title">Source context</h2>' + CA.chip(a.standard) + '<p class="small mb-0">Each question links back to its clause in Intertec\'s licensed copy. The prototype shows clause IDs only — <b>no ISO text</b> (copyright).</p><p class="small muted mb-0">Guardrail: every clause reference is checked against the standard. Items whose reference cannot be verified are <b>flagged, not hidden</b>.</p></section>' +
        '<section class="card-ca"><h2 class="card-title">Legend</h2><div class="ai-box p-2"><span class="ai-tag">AI draft</span><span class="small">Waiting for a person</span></div><div class="ai-box approved p-2"><span class="human-tag">Accepted</span><span class="small">Human-reviewed</span></div><div class="ai-box rejected p-2"><span class="small">Rejected — excluded</span></div></section>' +
        '<section class="card-ca"><h2 class="card-title">Baseline vs audit-specific</h2><p class="small mb-0">Baseline checkpoints are the reusable, approved library (' + CA.link("checkpoints", "view") + "). This checklist is assembled for <b>" + a.id + "</b> only, from approved checkpoints plus scope, BU context and prior findings.</p></section></aside></div>";
    }
  });
  function flowNote() {
    return '<div class="small-muted mt-2">What happens on Generate (production design): 1 job queued → 2 retrieve licensed clause text, BU context, last findings → 3 draft questions → 4 guardrails check clause references → 5 human review → 6 record &amp; log.</div>';
  }
  function itemCard(a, it, approved) {
    var st = it.state, box = st === "pending" ? (it.guard ? "flagged" : "") : st === "rejected" ? "rejected" : "approved";
    var flagCls = it.guard ? "bad" : /Repeat|Prior/.test(it.flag) ? "warn" : /2026/.test(it.flag) ? "ai" : it.na ? "" : "";
    var acts = approved ? "" : st === "pending" ?
      (it.guard ? "" : CA.btn({ text: "Accept", icon: "check-lg", action: "item-decide", data: { id: a.id, item: it.id, d: "accepted" }, roles: "la", size: "btn-sm", cls: "btn-okay" })) +
      CA.btn({ text: "Edit", icon: "pencil", action: "item-edit", data: { id: a.id, item: it.id }, roles: "la", size: "btn-sm" }) +
      CA.btn({ text: "Reject", icon: "x-lg", action: "item-decide", data: { id: a.id, item: it.id, d: "rejected" }, roles: "la", size: "btn-sm", cls: "btn-danger-soft" }) :
      CA.btn({ text: "Undo", icon: "arrow-counterclockwise", action: "item-decide", data: { id: a.id, item: it.id, d: "pending" }, roles: "la", size: "btn-sm" });
    return '<article class="ai-box ' + box + '" aria-label="Checklist item ' + it.id + '"><div class="row-head">' +
      (st === "pending" ? '<span class="ai-tag"><i class="bi bi-stars"></i> Simulated AI suggestion</span>' : st === "rejected" ? '<span class="human-tag" style="color:var(--ink-3)"><i class="bi bi-x-circle"></i> Rejected</span>' : '<span class="human-tag"><i class="bi bi-person-check"></i> ' + STATE_LBL[st] + "</span>") +
      CA.chip("Clause " + it.clause + " (illustrative)") + '<span class="mono small-muted">' + it.id + '</span><span class="sp"></span>' + CA.chip(it.flag, flagCls) + "</div>" +
      '<b class="q" style="font-size:.95rem">' + esc(it.q) + "</b>" +
      '<div class="grid g2" style="gap:6px"><div class="small"><b>Expected evidence:</b> ' + esc(it.evidence) + '</div><div class="small"><b>Guidance:</b> ' + esc(it.guidance) + "</div></div>" +
      '<div class="small"><b>Applicability:</b> ' + (it.na ? '<span class="text-body-secondary">Not applicable — ' + esc(it.naNote || "proposed; needs confirmation") + "</span>" : "Applicable") + "</div>" +
      '<div class="rationale">AI rationale: ' + esc(it.why) + "</div>" +
      (it.by ? '<div class="approval-stamp">' + esc(STATE_LBL[st]) + " by " + esc(it.by) + " · " + esc(it.at) + "</div>" : "") +
      (acts ? '<div class="d-flex gap-2 flex-wrap">' + acts + "</div>" : "") + "</article>";
  }
  CA.on("gen-checklist", function (el) {
    var a = CA.audit(el.dataset.id), area = document.getElementById("gen-area");
    var steps = ["Job queued", "Retrieve context", "Draft questions", "Guardrails", "Human review", "Record & log"];
    area.innerHTML = '<div class="gen-loader" role="status" aria-live="polite"><span class="ai-tag"><i class="bi bi-stars"></i> A04 generating checklist · simulated</span><div class="gen-steps">' + steps.map(function (s, i) { return '<div class="gen-step" data-i="' + i + '"><i class="bar"></i>' + s + "</div>"; }).join("") + '</div><div class="grid gap-2"><div class="skeleton" style="width:90%"></div><div class="skeleton" style="width:70%"></div><div class="skeleton" style="width:80%"></div></div><span class="small-muted" id="gen-msg">Queuing job…</span></div>';
    var msgs = ["Queuing job and checking scope…", "Retrieving licensed clause context, BU profile and 2 prior audits (simulated)…", "Drafting questions with clause references and expected evidence…", "Checking every clause reference against the standard…", "Ready for your review", ""];
    var t0 = Date.now(), i = 0;
    (function tick() {
      var els = area.querySelectorAll(".gen-step");
      if (!els.length) return;
      Array.prototype.forEach.call(els, function (e, j) { e.className = "gen-step" + (j < i ? " done" : j === i ? " active" : ""); });
      var msg = document.getElementById("gen-msg"); if (msg) msg.textContent = msgs[i];
      if (i < 4) { i++; setTimeout(tick, 650); return; }
      var na = a.applicability && a.applicability.filter(function (r) { return r.clause === "8.3"; })[0];
      a.checklist = { state: "Draft", secs: ((Date.now() - t0) / 1000 + 0.4).toFixed(1), items: CA.SIM.checklist.map(function (x) {
        var it = Object.assign({ state: "pending", by: "", at: "" }, x);
        if (it.na && na && na.decision === "applicable") { it.na = false; it.q = "Confirm whether any design and development of solutions is performed by the BU, and how it is controlled."; it.flag = "Overridden to applicable"; it.why = "A03 proposed not applicable; " + na.by.split(" · ")[0] + " overrode: " + na.why; }
        else if (it.na && na && na.decision === "na") { it.naNote = "confirmed by " + na.by.split(" · ")[0] + ": " + na.why; it.flag = "Not applicable (confirmed)"; }
        if (a.standard === "ISO 9001:2015" && /2026/.test(it.flag)) { it.flag = "Baseline"; it.why = "Edition 2015 selected; 2026 change rationale not applied."; }
        return it;
      }) };
      a.status = "Checklist draft";
      CA.aiLog("A04", a.id, "Generated " + a.checklist.items.length + " checklist suggestions"); CA.log("AI generated", a.id, "A04 checklist draft (simulated, " + a.checklist.items.length + " items)"); CA.store.save();
      CA.toast("A04 drafted " + a.checklist.items.length + " suggestions. 1 clause reference could not be verified and is flagged.", "ai");
      CA.render();
    })();
  });
  CA.on("item-decide", function (el) {
    var a = CA.audit(el.dataset.id), it = CA.byId(a.checklist.items, el.dataset.item), d = el.dataset.d;
    it.state = d; it.by = d === "pending" ? "" : CA.me().user; it.at = d === "pending" ? "" : CA.stamp();
    if (d !== "pending") CA.aiLog("A04", a.id + "/" + it.id, "Checklist item " + it.clause, d === "accepted" ? "Accepted" : "Rejected");
    CA.log(d === "pending" ? "Undone" : d === "accepted" ? "Accepted AI suggestion" : "Rejected AI suggestion", a.id + "/" + it.id, "Clause " + it.clause);
    CA.store.save(); CA.render();
  });
  CA.on("item-edit", function (el) {
    var a = CA.audit(el.dataset.id), it = CA.byId(a.checklist.items, el.dataset.item);
    CA.modal({ title: "Edit suggestion " + it.id, okText: "Save & accept", size: "modal-lg",
      body: '<form novalidate class="grid gap-2">' + (it.guard ? '<div class="sim-banner" style="border-color:var(--bad);background:var(--bad-soft);color:var(--bad)"><i class="bi bi-exclamation-octagon"></i><span>Guardrail: the clause reference could not be verified against the standard. Correct the clause or reject the item.</span></div>' : "") +
        CA.field({ name: "clause", label: "Clause reference", value: it.clause, required: true, pattern: "\\d{1,2}(\\.\\d{1,2}){0,3}", invalid: "Use a clause number such as 7.1.6" }) + CA.field({ name: "q", label: "Audit question", type: "textarea", value: it.q, required: true }) + CA.field({ name: "evidence", label: "Expected evidence", value: it.evidence, required: true }) + CA.field({ name: "guidance", label: "Guidance", value: it.guidance, required: true }) +
        (it.guard ? '<div class="form-check"><input class="form-check-input" type="checkbox" id="guard-ok" required><label class="form-check-label small" for="guard-ok">I have checked this clause reference against the licensed standard.</label><div class="invalid-feedback">Confirm the clause check to accept.</div></div>' : "") + "</form>",
      onOk: function (b) {
        var d = CA.formData(b.querySelector("form"));
        Object.assign(it, { clause: d.clause, q: d.q, evidence: d.evidence, guidance: d.guidance, state: "edited", by: CA.me().user, at: CA.stamp() });
        if (it.guard) { it.guard = false; it.flag = "Clause verified by reviewer"; }
        CA.aiLog("A04", a.id + "/" + it.id, "Checklist item " + it.clause, "Edited & accepted"); CA.log("Edited AI suggestion", a.id + "/" + it.id, "Clause " + it.clause); CA.store.save();
        CA.toast("Edited and accepted " + it.id); CA.render();
      } });
  });
  CA.on("accept-all", function (el) {
    var a = CA.audit(el.dataset.id), list = a.checklist.items.filter(function (i) { return i.state === "pending" && !i.guard; });
    if (!list.length) { CA.toast("No unflagged pending items.", "info"); return; }
    CA.confirm("Accept " + list.length + " suggestions?", "You are confirming you have reviewed these " + list.length + " items. Each acceptance is logged with your name. Flagged items still need individual review.", "Accept " + list.length, function () {
      list.forEach(function (it) { it.state = "accepted"; it.by = CA.me().user; it.at = CA.stamp(); CA.aiLog("A04", a.id + "/" + it.id, "Checklist item " + it.clause, "Accepted (bulk)"); });
      CA.log("Accepted AI suggestions", a.id, list.length + " items (bulk review)"); CA.store.save(); CA.render();
    }, "btn-okay");
  });
  CA.on("approve-checklist", function (el) {
    var a = CA.audit(el.dataset.id), items = a.checklist.items;
    var pend = items.filter(function (i) { return i.state === "pending"; });
    if (pend.length) { CA.toast(pend.length + " item(s) still pending review" + (pend.some(function (i) { return i.guard; }) ? " (including a flagged clause reference)" : "") + ". Accept, edit or reject every item first.", "warn"); return; }
    var inc = CA.checklistItems(a).length;
    CA.confirm("Approve checklist for " + a.id + "?", "<b>" + inc + "</b> questions will form the audit-specific checklist; " + items.filter(function (i) { return i.state === "rejected"; }).length + " rejected items are excluded. Approval is recorded with your name, role and time.", "Approve checklist", function () {
      a.checklist.state = "Approved"; a.checklist.approvedBy = CA.me().user + " (" + CA.me().label + ")"; a.checklist.approvedAt = CA.stamp(); a.status = "Checklist approved";
      CA.checklistItems(a).forEach(function (it) { if (it.na) a.responses[it.id] = { result: "na", note: "Not applicable — confirmed during scoping.", file: "" }; });
      CA.log("Approved", a.id, "Audit-specific checklist approved (" + inc + " items)");
      CA.S.notifications.unshift({ id: "N" + Date.now(), text: "Checklist approved for IA-2027-001 — fieldwork can start", route: "audit/" + a.id + "/fieldwork", roles: "au la" });
      CA.store.save(); CA.toast("Checklist approved by " + esc(CA.me().user) + ". Fieldwork is now open."); CA.render();
    }, "btn-okay");
  });
})(window.CA);
