/* Report builder (A11 Report Narrator drafts; approval workflow decides), reports list, distribution & archive. */
(function (CA) {
  var esc = CA.esc;
  var R_STEPS = ["Draft", "Technical review", "Approval", "Issued & archived"];
  var R_IDX = { "Draft": 0, "Technical review": 1, "Approval": 2, "Approved": 3, "Issued": 4 };

  function addWorkdays(iso, n) { var d = iso; while (n > 0) { d = CA.addDays(d, 1); var w = new Date(d + "T00:00:00Z").getUTCDay(); if (w !== 0 && w !== 6) n--; } return d; }

  CA.route("audit/:id/report", {
    title: "Report builder", roles: "pm la ae ex be", nav: "reports",
    render: function (p) {
      var a = CA.audit(p.id); if (!a) return CA.empty("question-circle", "Audit not found", esc(p.id));
      var head = CA.auditHead(a, "report"), r = a.report;
      if (!a.checklist || a.checklist.state !== "Approved") return head + '<section class="card-ca">' + CA.empty("file-earmark-lock", "No report yet", "The report is generated from captured audit data: approve the checklist and record fieldwork first.", '<a class="btn btn-ink btn-sm" href="#/audit/' + a.id + '">Open audit record</a>') + "</section>";
      var c = CA.auditCounts(a);
      if (!r) return head + '<section class="card-ca"><h2 class="card-title"><i class="bi bi-file-earmark-text"></i> Generate report</h2>' +
        (c.open ? '<div class="info-banner"><i class="bi bi-exclamation-circle"></i><span>' + c.open + " checklist question(s) are unanswered. Complete fieldwork first.</span></div>" + '<a class="btn btn-ink btn-sm" style="justify-self:start" href="#/audit/' + a.id + '/fieldwork">Go to fieldwork</a>' :
          '<div class="ai-box"><span class="ai-tag"><i class="bi bi-stars"></i> A11 Report Narrator · simulated</span><span class="small">The report body is assembled from captured data (scope, results, evidence notes, findings). A11 drafts only the executive summary for the Lead Auditor to edit.' + (a.fieldwork !== "Submitted" ? " Generating locks the fieldwork responses." : "") + '</span><div id="rep-gen">' + CA.btn({ text: "Generate report", icon: "stars", action: "rep-generate", data: { id: a.id }, roles: "la", cls: "btn-ai" }) + "</div></div>") + "</section>";
      var idx = R_IDX[r.state], issued = r.state === "Issued";
      var acts = "";
      if (r.state === "Draft") acts = CA.btn({ text: "Submit for technical review", icon: "send", action: "rep-move", data: { id: a.id, to: "Technical review" }, roles: "la", cls: "btn-ink" });
      if (r.state === "Technical review") acts = CA.btn({ text: "Return to draft", action: "rep-return", data: { id: a.id }, roles: "be" }) + CA.btn({ text: "Complete technical review", icon: "check2", action: "rep-move", data: { id: a.id, to: "Approval" }, roles: "be", cls: "btn-okay" });
      if (r.state === "Approval") acts = CA.btn({ text: "Return to draft", action: "rep-return", data: { id: a.id }, roles: "pm" }) + CA.btn({ text: "Approve report", icon: "check2-circle", action: "rep-move", data: { id: a.id, to: "Approved" }, roles: "pm", cls: "btn-okay" });
      if (r.state === "Approved") acts = CA.btn({ text: "Issue, e-sign & distribute", icon: "send-check", action: "rep-issue", data: { id: a.id }, roles: "pm", cls: "btn-ink" });
      return head + '<div class="d-flex flex-wrap gap-2 align-items-center no-print">' + CA.timeline(R_STEPS, issued ? 4 : Math.min(idx, 3)) + '<span class="sp"></span>' + (issued ? "" : CA.chip("Due " + CA.d(r.due) + " (5 working days)", CA.DEMO_TODAY > r.due ? "bad" : "warn")) +
        '<button class="btn btn-soft btn-sm" data-action="print"><i class="bi bi-printer"></i> Print</button><button class="btn btn-soft btn-sm" data-action="sim-export"><i class="bi bi-file-earmark-word"></i> Word / PDF (simulated)</button>' + acts + "</div>" +
        '<div class="grid g-side"><div>' + paper(a) + '</div><aside class="grid no-print" style="align-content:start">' + summaryBox(a) +
        '<section class="card-ca"><h2 class="card-title">Approval path</h2><div class="list-ca">' + R_STEPS.map(function (s, i) {
          var st = i < (issued ? 4 : idx) ? "Done" : i === idx && !issued ? "Now" : "Next";
          var who = ["Lead Auditor", "Technical reviewer (Q&BE)", "Audit Programme Manager", "System (simulated e-sign)"][i];
          var stamp = (r.log || []).filter(function (l) { return l.step === s; })[0];
          return '<div class="li-ca">' + CA.chip(st, st === "Done" ? "ok" : st === "Now" ? "ai" : "") + '<span class="sp">' + s + "<small>" + who + (stamp ? " · " + esc(stamp.who) + " · " + esc(stamp.ts) : "") + "</small></span></div>";
        }).join("") + "</div></section>" +
        '<section class="card-ca"><h2 class="card-title">Sends to</h2><div class="list-ca"><div class="li-ca"><i class="bi bi-envelope"></i><span class="sp">' + esc(CA.bu(a.bu).manager) + "<small>Email with secure link + Teams post</small></span></div>" +
        '<div class="li-ca"><i class="bi bi-folder2"></i><span class="sp">SharePoint › 2027 › Audit Report › ' + esc(CA.bu(a.bu).name.split(" ")[0]) + "_Sent<small>Archive folder</small></span></div></div>" + (issued ? '<a class="btn btn-soft btn-sm" style="justify-self:start" href="#/distribution">Distribution log →</a>' : "") + '<span class="small-muted">All distribution is ' + CA.sim("simulated") + "</span></section></aside></div>";
    }
  });
  function summaryBox(a) {
    var r = a.report;
    if (r.summaryState === "pending") return '<div class="ai-box"><span class="ai-tag"><i class="bi bi-stars"></i> Simulated AI draft · A11 executive summary</span><span class="small">' + esc(r.aiSummary) + '</span><div class="d-flex gap-2">' + CA.btn({ text: "Accept", action: "rep-sum", data: { id: a.id, d: "accept" }, roles: "la", size: "btn-sm", cls: "btn-okay" }) + CA.btn({ text: "Edit", action: "rep-sum", data: { id: a.id, d: "edit" }, roles: "la", size: "btn-sm" }) + CA.btn({ text: "Reject & write my own", action: "rep-sum", data: { id: a.id, d: "reject" }, roles: "la", size: "btn-sm", cls: "btn-danger-soft" }) + "</div></div>";
    return '<div class="ai-box approved"><span class="human-tag"><i class="bi bi-person-check"></i> Executive summary ' + esc(r.summaryState) + "</span><span class=\"approval-stamp\">" + esc(r.summaryBy || "") + "</span>" + (r.state === "Draft" ? CA.btn({ text: "Edit summary & conclusion", action: "rep-sum", data: { id: a.id, d: "edit" }, roles: "la", size: "btn-sm" }) : "") + "</div>";
  }
  function paper(a) {
    var r = a.report, bu = CA.bu(a.bu), sl = CA.slot(a.slot), c = CA.auditCounts(a), s = CA.score(c), items = CA.checklistItems(a);
    var fs = CA.S.findings.filter(function (f) { return f.audit === a.id; });
    var ncs = fs.filter(function (f) { return f.grade === "min" || f.grade === "maj"; }), ofis = fs.filter(function (f) { return f.grade === "obs" || f.grade === "afi"; });
    var good = items.filter(function (it) { return a.responses[it.id] && a.responses[it.id].good; });
    var GL = { sat: "Satisfied", obs: "Observation", afi: "AFI", min: "Minor NC", maj: "Major NC", na: "N/A" };
    return '<article class="report-paper" aria-label="Report preview"><div class="watermark">PROTOTYPE · ILLUSTRATIVE DATA · ' + (r.state === "Issued" ? "ISSUED (SIMULATED E-SIGNATURE)" : r.state.toUpperCase()) + "</div>" +
      '<div><div class="small-muted">Intertec Systems · Quality &amp; Business Excellence · Internal Audit Report</div><h2>' + esc(a.title) + "</h2></div>" +
      '<dl class="report-meta"><dt>Audit ID</dt><dd>' + a.id + "</dd><dt>Report ID</dt><dd>RPT-" + a.id + "</dd><dt>Business unit</dt><dd>" + esc(bu.name) + "</dd><dt>Location</dt><dd>" + esc(sl.location) + ", " + esc(bu.country) + "</dd><dt>Standard</dt><dd>" + esc(a.standard) + "</dd><dt>Cycle / type</dt><dd>" + esc(a.cycle) + " · " + esc(a.type) + "</dd><dt>Date</dt><dd>" + CA.d(sl.date) + " " + sl.time + " (" + sl.mins + " min)</dd><dt>Team</dt><dd>" + esc(CA.auditor(a.lead).name) + " (Lead), " + esc(CA.auditor(a.auditor).name) + "</dd><dt>Auditee</dt><dd>" + esc(bu.manager) + "</dd><dt>Generated</dt><dd>" + esc(r.generatedAt) + "</dd></dl>" +
      "<section><h3>Scope</h3><p class=\"mb-1\">" + esc(a.scope.objective) + "</p><p class=\"mb-1\"><b>Boundaries:</b> " + esc(a.scope.boundaries) + "</p><p class=\"mb-0\"><b>Exclusions:</b> " + esc(a.scope.exclusions || "None") + "</p></section>" +
      "<section><h3>Executive summary</h3><p class=\"mb-0\">" + (r.summaryState === "pending" ? '<i style="color:#2a44c8">[AI draft awaiting Lead Auditor review — not part of the report until accepted]</i>' : esc(r.summary)) + "</p></section>" +
      "<section><h3>Compliance summary</h3><p class=\"mb-1\"><b style=\"font-size:1.3rem\">" + (s.pct == null ? "–" : s.pct.toFixed(1) + "%") + "</b> against the 90% target · " + s.applicable + " applicable checkpoints</p><p class=\"mb-0 mono\" style=\"font-size:.78rem\">(" + c.sat + "×3 + " + c.obs + "×2 + " + c.afi + "×2 + " + c.min + "×1 + " + c.maj + "×0) ÷ (3 × " + s.applicable + ") = " + s.earned + " ÷ " + s.max + "</p></section>" +
      "<section><h3>Checklist results</h3><table><thead><tr><th>Clause</th><th>Question</th><th>Result</th><th>Evidence / observation</th></tr></thead><tbody>" + items.map(function (it) { var rr = a.responses[it.id] || {}; return "<tr><td>" + esc(it.clause) + "</td><td>" + esc(it.q) + "</td><td>" + (GL[rr.result] || "—") + "</td><td>" + esc(rr.note || "") + (rr.file ? " [" + esc(rr.file) + "]" : "") + "</td></tr>"; }).join("") + "</tbody></table></section>" +
      "<section><h3>Nonconformities</h3>" + (ncs.length ? "<table><thead><tr><th>ID</th><th>Clause</th><th>Grade</th><th>Statement</th><th>CAR</th></tr></thead><tbody>" + ncs.map(function (f) { return "<tr><td>" + f.id + "</td><td>" + esc(f.clause) + "</td><td>" + CA.gradeLabel(f.grade) + "</td><td>" + esc(f.statement || "(statement pending)") + "</td><td>" + (f.car || "—") + "</td></tr>"; }).join("") + "</tbody></table>" : "<p class=\"mb-0\">None raised.</p>") + "</section>" +
      "<section><h3>Opportunities for improvement &amp; observations</h3>" + (ofis.length ? "<ul class=\"mb-0\">" + ofis.map(function (f) { return "<li>" + f.id + " · " + CA.gradeLabel(f.grade) + " · " + esc(f.statement || f.evidence) + "</li>"; }).join("") + "</ul>" : (c.obs + c.afi ? "<p class=\"mb-0\">" + (c.obs + c.afi) + " checklist result(s) graded Observation / AFI without a separate finding (see checklist results).</p>" : "<p class=\"mb-0\">None.</p>")) + "</section>" +
      "<section><h3>Good practices</h3>" + (good.length ? "<ul class=\"mb-0\">" + good.map(function (it) { return "<li>Clause " + esc(it.clause) + ": " + esc(a.responses[it.id].note) + "</li>"; }).join("") + "</ul>" : "<p class=\"mb-0\">None recorded.</p>") + "</section>" +
      "<section><h3>Conclusion</h3><p class=\"mb-0\">" + esc(r.conclusion) + "</p></section>" +
      (r.state === "Issued" ? '<section><h3>Approval</h3><p class="mb-0">Approved by ' + esc(r.approvedBy) + ". Issued " + esc(r.issuedAt) + ". E-signature simulated.</p></section>" : "") + "</article>";
  }
  CA.on("print", function () { window.print(); });
  CA.on("rep-generate", function (el) {
    var a = CA.audit(el.dataset.id), box = document.getElementById("rep-gen");
    box.innerHTML = '<div class="d-flex align-items-center gap-2"><span class="spinner-border spinner-border-sm text-primary"></span><span class="small">Assembling report from captured data; A11 drafting summary (simulated)…</span></div><div class="skeleton mt-2" style="width:80%"></div>';
    setTimeout(function () {
      if (a.fieldwork !== "Submitted") { a.fieldwork = "Submitted"; a.fieldworkAt = CA.stamp(); CA.log("Locked", a.id, "Fieldwork responses locked for reporting"); }
      var s = CA.score(CA.auditCounts(a));
      a.report = { state: "Draft", generatedAt: CA.stamp(), due: addWorkdays(CA.DEMO_TODAY, 5), aiSummary: CA.SIM.summary, summary: "", summaryState: "pending", conclusion: "The audit found the Sales BU's processes " + (s.pct >= 90 ? "conform overall, with a compliance score of " : "need improvement, with a compliance score of ") + (s.pct == null ? "–" : s.pct.toFixed(1) + "%") + " against the 90% target. Corrective actions are tracked in Compliance AI.", log: [{ step: "Draft", who: CA.me().user, ts: CA.stamp() }] };
      a.status = "Report";
      CA.aiLog("A11", "RPT-" + a.id, "Drafted executive summary"); CA.log("Generated", "RPT-" + a.id, "Report draft generated from captured data; A11 summary (simulated)"); CA.store.save();
      CA.toast("Report draft generated. Review the AI summary before submitting.", "ai"); CA.render();
    }, 1400);
  });
  CA.on("rep-sum", function (el) {
    var a = CA.audit(el.dataset.id), r = a.report, d = el.dataset.d;
    if (d === "accept") { r.summary = r.aiSummary.replace(" (Simulated AI draft — edit before approval.)", ""); r.summaryState = "accepted"; r.summaryBy = CA.me().user + " · " + CA.stamp(); CA.aiLog("A11", "RPT-" + a.id, "Executive summary", "Accepted"); CA.log("Accepted AI suggestion", "RPT-" + a.id, "Executive summary"); CA.store.save(); CA.render(); return; }
    CA.modal({ title: "Executive summary & conclusion", okText: "Save", size: "modal-lg", body: '<form novalidate class="grid gap-2">' + CA.field({ name: "summary", label: "Executive summary", type: "textarea", rows: 5, required: true, value: d === "reject" ? "" : (r.summary || r.aiSummary.replace(" (Simulated AI draft — edit before approval.)", "")) }) + CA.field({ name: "conclusion", label: "Conclusion", type: "textarea", rows: 3, required: true, value: r.conclusion }) + "</form>",
      onOk: function (b) { var f = CA.formData(b.querySelector("form")); r.summary = f.summary; r.conclusion = f.conclusion; r.summaryState = d === "reject" ? "written by Lead Auditor" : "edited & accepted"; r.summaryBy = CA.me().user + " · " + CA.stamp(); CA.aiLog("A11", "RPT-" + a.id, "Executive summary", d === "reject" ? "Rejected" : "Edited & accepted"); CA.log("Edited", "RPT-" + a.id, "Executive summary"); CA.store.save(); CA.render(); } });
  });
  CA.on("rep-move", function (el) {
    var a = CA.audit(el.dataset.id), r = a.report, to = el.dataset.to;
    if (r.summaryState === "pending") { CA.toast("Accept, edit or reject the AI executive summary first.", "warn"); return; }
    CA.confirm(to === "Approved" ? "Approve report?" : "Move report to " + to + "?", "Recorded with your name, role and time.", to === "Approved" ? "Approve" : "Confirm", function () {
      var fromStep = r.state;
      r.state = to; r.log = r.log || [];
      r.log.push({ step: to === "Approval" ? "Technical review" : to === "Approved" ? "Approval" : to === "Technical review" ? "Draft" : to, who: CA.me().user, ts: CA.stamp() });
      if (to === "Approved") r.approvedBy = CA.me().user + " (" + CA.me().label + ") · " + CA.stamp();
      CA.log(to === "Approved" ? "Approved" : "Moved", "RPT-" + a.id, fromStep + " → " + to); CA.store.save();
      CA.toast("Report: " + to); CA.render();
    }, to === "Approved" || to === "Approval" ? "btn-okay" : "btn-ink");
  });
  CA.on("rep-return", function (el) {
    var a = CA.audit(el.dataset.id);
    CA.modal({ title: "Return report to draft", okText: "Return", body: '<form novalidate>' + CA.field({ name: "reason", label: "Comments for the Lead Auditor", type: "textarea", required: true }) + "</form>",
      onOk: function (b) { var d = CA.formData(b.querySelector("form")); a.report.state = "Draft"; CA.log("Returned", "RPT-" + a.id, d.reason); CA.toast("Returned to draft", "warn"); CA.render(); } });
  });
  CA.on("rep-issue", function (el) {
    var a = CA.audit(el.dataset.id), r = a.report, bu = CA.bu(a.bu);
    CA.confirm("Issue report?", "The report is locked, e-signed and distributed to " + esc(bu.manager) + " by email + Teams, then filed in SharePoint. <b>All simulated</b> — nothing leaves your browser.", "Issue & distribute", function () {
      r.state = "Issued"; r.issuedAt = CA.stamp(); r.log.push({ step: "Issued & archived", who: CA.me().user, ts: r.issuedAt });
      var s = CA.score(CA.auditCounts(a));
      r.distribution = [["Email with secure link", bu.manager, "Delivered (simulated)"], ["Teams post", "Sales BU channel", "Posted (simulated)"], ["SharePoint archive", "2027 › Audit Report › " + bu.name.split(" ")[0] + "_Sent", "Filed (simulated)"]];
      CA.S.reports.unshift({ id: "RPT-" + a.id, audit: a.id, bu: a.bu, title: a.title, state: "Issued", score: s.pct, issued: CA.DEMO_TODAY, archive: "SharePoint › 2027 › Audit Report › " + bu.name.split(" ")[0] + "_Sent", reads: "Awaiting read receipt (simulated)" });
      a.status = "Closed";
      CA.log("Issued", "RPT-" + a.id, "Issued, e-signed and distributed (simulated)"); CA.store.save();
      CA.toast("Report issued and archived (simulated email, Teams and SharePoint)."); CA.render();
      setTimeout(function () { var rr = CA.report("RPT-" + a.id); if (rr) { rr.reads = "Read by " + bu.manager + " (simulated)"; CA.store.save(); } }, 2000);
    });
  });

  CA.route("reports", {
    title: "Reports", roles: "pm la ae ex be", nav: "reports",
    render: function () {
      var S = CA.S, live = S.audits.filter(function (a) { return a.report && a.report.state !== "Issued"; });
      var issued = S.reports.filter(function (r) { return CA.role() !== "ae" || r.bu === "BU-01"; });
      return CA.head({ crumbs: [["Audits"], ["Reports"]], title: "Audit reports", sub: "Reports are generated from captured audit data and follow Draft → Technical review → Approval → Issued within 5 working days." }) +
        (CA.role() !== "ae" ? '<section class="card-ca"><h2 class="card-title">In progress</h2>' + (live.length ? CA.table([
          { k: "id", label: "Audit", fmt: function (a) { return CA.idLink("audit/" + a.id + "/report", a.id); } }, { k: "title", label: "Title" }, { k: "st", label: "State", sort: false, fmt: function (a) { return CA.chip(a.report.state); } }, { k: "due", label: "Due", sort: false, fmt: function (a) { return CA.d(a.report.due); } }
        ], live, { id: "t-rlive", rowRoute: function (a) { return "audit/" + a.id + "/report"; } }) : '<p class="small-muted mb-0">No reports in progress. Generate one from an audit record (e.g. ' + CA.link("audit/IA-2027-001/report", "IA-2027-001") + ").</p>") + "</section>" : "") +
        '<section class="card-ca"><h2 class="card-title">Issued</h2>' + CA.table([
          { k: "id", label: "Report", fmt: function (r) { return '<span class="mono">' + r.id + "</span>"; } }, { k: "title", label: "Title" },
          { k: "score", label: "Compliance", num: true, fmt: function (r) { return r.score == null ? "–" : r.score.toFixed(1) + "%"; } }, { k: "issued", label: "Issued", fmt: function (r) { return CA.d(r.issued); } }, { k: "archive", label: "Archive" }
        ], issued, { id: "t-rep", rowRoute: function (r) { return CA.audit(r.audit) ? "audit/" + r.audit + "/report" : "distribution"; } }) + '<p class="small-muted mb-0">2026 reports shown as migrated history (illustrative).</p></section>';
    }
  });

  CA.route("distribution", {
    title: "Distribution & archive", roles: "pm la be", nav: "distribution",
    render: function () {
      var S = CA.S;
      return CA.head({ crumbs: [["Audits"], ["Distribution & archive"]], title: "Distribution & archive", chips: CA.sim("Email, Teams, SharePoint simulated"), sub: "Replaces manual filing into ~19 OneDrive folders. Issued reports are emailed with a secure link, posted to Teams and filed in the BU's SharePoint folder." }) +
        CA.table([
          { k: "id", label: "Report", fmt: function (r) { return '<span class="mono">' + r.id + "</span>"; } }, { k: "title", label: "Title" }, { k: "issued", label: "Issued", fmt: function (r) { return CA.d(r.issued); } },
          { k: "archive", label: "Archive folder", fmt: function (r) { return '<i class="bi bi-folder2"></i> ' + esc(r.archive); } }, { k: "reads", label: "Read receipt", fmt: function (r) { return CA.chip(r.reads, /Read by/.test(r.reads) ? "ok" : "warn"); } },
          { k: "x", label: "", sort: false, fmt: function (r) { return CA.btn({ text: "Re-send (simulated)", action: "redistribute", data: { id: r.id }, roles: "pm la", size: "btn-sm" }); } }
        ], S.reports, { id: "t-dist" }) +
        S.audits.filter(function (a) { return a.report && a.report.distribution; }).map(function (a) {
          return '<section class="card-ca"><h2 class="card-title">Distribution log · RPT-' + a.id + "</h2>" + CA.table([{ k: 0, label: "Channel" }, { k: 1, label: "Recipient / location" }, { k: 2, label: "Status", fmt: function (r) { return CA.chip(r[2], "sim"); } }], a.report.distribution, { id: "t-dl" + a.id }) + "</section>";
        }).join("");
    }
  });
  CA.on("redistribute", function (el) { CA.log("Re-sent", el.dataset.id, "Distribution repeated (simulated)"); CA.toast("Re-sent " + esc(el.dataset.id) + " (simulated)", "info"); });
})(window.CA);
