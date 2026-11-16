/* Admin: lists & scoring, SLAs & notifications, users & access, AI settings, audit trail, data import.
   Display / demo-state only — no real permission enforcement or import backend. */
(function (CA) {
  var esc = CA.esc;

  CA.route("admin/lists", {
    title: "Lists & scoring", roles: "ad be", nav: "admin/lists",
    render: function () {
      return CA.head({ crumbs: [["Admin"], ["Lists & scoring"]], title: "Lists & scoring", chips: CA.chip("Configuration display"), sub: "Picklists, grade labels, cause categories and scoring rules, configurable without code in production. Shown read-only in the prototype." }) +
        '<div class="grid g2"><section class="card-ca"><h2 class="card-title">Scoring model ' + CA.src("BRD TPL-59") + "</h2>" + CA.table([
          { k: "label", label: "Result" }, { k: "pts", label: "Points", num: true }, { k: "note", label: "Note" }
        ], CA.GRADES.concat([{ label: "Not applicable / Not audited", pts: "excluded", note: "Left out of the score" }]), { id: "t-grades" }) +
        '<div class="formula">Compliance % = earned ÷ (3 × applicable) × 100</div><p class="small-muted mb-0">Organisation figure = simple average across BU audits. Decision D-10 (keep Satisfied / AFI labels or adopt ISO terms Conform / OFI) is open.</p></section>' +
        '<section class="card-ca"><h2 class="card-title">Cause categories</h2><div class="list-ca">' + ["People / competence", "Process / method", "Tools / systems", "Materials / inputs", "Measurement", "Environment", "Management / resources"].map(function (c) { return '<div class="li-ca">' + esc(c) + "</div>"; }).join("") + '</div><p class="small-muted mb-0">Illustrative list. Decision D-11: Intertec\'s seven categories vs 6M.</p></section>' +
        '<section class="card-ca"><h2 class="card-title">Audit types</h2><div class="d-flex flex-wrap gap-2">' + ["Internal Audit (IQA1 / IQA2)", "External surveillance (SV1)", "Supplier audit", "Follow-up audit"].map(function (x) { return CA.chip(x); }).join("") + "</div></section>" +
        '<section class="card-ca"><h2 class="card-title">Finding grades</h2><div class="d-flex flex-wrap gap-2">' + CA.GRADES.map(function (g) { return CA.chip(g.label, g.cls); }).join("") + "</div></section></div>";
    }
  });

  CA.route("admin/sla", {
    title: "SLAs & notifications", roles: "ad pm", nav: "admin/sla",
    render: function () {
      var rows = [
        ["Report issue", "5 working days after fieldwork", "Lead Auditor → Programme Manager", "Explanation ref."],
        ["Action plan (Minor NC)", "30 days after acknowledgement", "Action owner", "Explanation ref."],
        ["Major NC closure verified", "Within 90 days", "Auditor", "Explanation ref."],
        ["Reminder", "7 days before due", "Action owner", "Explanation ref."],
        ["Overdue +1", "1 day after due", "Action owner, cc BU manager", "Explanation ref."],
        ["Escalation +7", "7 days after due", "Line manager", "Explanation ref."],
        ["Escalation +14", "14 days after due", "Top management", "Explanation ref."],
        ["Effectiveness check", "60–90 days after implementation", "Auditor", "Explanation ref."]
      ];
      return CA.head({ crumbs: [["Admin"], ["SLAs & notifications"]], title: "SLAs & notifications", chips: CA.chip("Deterministic rules"), sub: "The workflow / SLA engine owns all timers (UAE calendar in production). AI can draft notification wording but never sets dates." }) +
        '<section class="card-ca"><h2 class="card-title">SLA rules</h2>' + CA.table([{ k: 0, label: "Rule" }, { k: 1, label: "Timing" }, { k: 2, label: "Notifies" }, { k: 3, label: "Source", fmt: function (r) { return CA.src(r[3]); } }], rows, { id: "t-sla" }) +
        '<p class="small-muted mb-0">Open question: calendar days vs UAE working days for +1 / +7 / +14 — confirm against the BRD.</p></section>' +
        '<section class="card-ca"><h2 class="card-title">Notification channels</h2><div class="grid g3">' + [["In-app", "Live in prototype"], ["Microsoft Teams cards", "Simulated"], ["Email (Outlook)", "Simulated"]].map(function (c) { return '<div class="li-ca"><span class="sp">' + c[0] + "</span>" + (c[1] === "Simulated" ? CA.sim() : CA.chip(c[1], "ok")) + "</div>"; }).join("") + "</div>" +
        '<div class="ai-box"><span class="ai-tag"><i class="bi bi-stars"></i> Template wording · A09 drafts, admin approves</span><span class="small">' + esc(CA.SIM.followUp("{CAR}", "{due date}")) + "</span></div></section>";
    }
  });

  CA.route("admin/users", {
    title: "Users & access", roles: "ad", nav: "admin/users",
    render: function () {
      var roles = Object.keys(CA.ROLES).map(function (k) { return CA.ROLES[k].label; });
      return CA.head({ crumbs: [["Admin"], ["Users & access"]], title: "Users & access", chips: CA.sim("Entra ID provisioning simulated") + CA.demo("Fictional users"), sub: "Role assignment for the demo. Production uses Microsoft Entra ID sign-in and server-side permission checks; this prototype's role switcher is a visual simulation only." }) +
        CA.table([
          { k: "name", label: "Name" }, { k: "email", label: "Email", fmt: function (u) { return '<span class="mono">' + esc(u.email) + "</span>"; } }, { k: "role", label: "Role" },
          { k: "status", label: "Status", fmt: function (u) { return CA.chip(u.status); } },
          { k: "x", label: "", sort: false, fmt: function (u) { return u.status === "Awaiting role" ? '<select class="form-select form-select-sm" style="width:auto" data-change="assign-role" data-email="' + esc(u.email) + '" aria-label="Assign role to ' + esc(u.name) + '"><option value="">Assign role…</option>' + roles.map(function (r) { return "<option>" + esc(r) + "</option>"; }).join("") + "</select>" : ""; } }
        ], CA.S.users, { id: "t-users", flash: CA.ui.flash }) +
        '<section class="card-ca fill"><h2 class="card-title">Role → screen access (demo)</h2><div class="table-wrap"><table class="table-ca"><thead><tr><th>Menu section</th>' + Object.keys(CA.ROLES).map(function (k) { return '<th title="' + esc(CA.ROLES[k].label) + '">' + k.toUpperCase() + "</th>"; }).join("") + "</tr></thead><tbody>" +
        CA.NAV.slice(0, 7).map(function (g) { return "<tr><td>" + esc(g[0]) + "</td>" + Object.keys(CA.ROLES).map(function (k) { var n = g[1].filter(function (i) { return i[3].split(" ").indexOf(k) > -1; }).length; return "<td>" + (n ? n + "/" + g[1].length : "—") + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>" +
        '<p class="small-muted mb-0">' + Object.keys(CA.ROLES).map(function (k) { return k.toUpperCase() + " = " + esc(CA.ROLES[k].label); }).join(" · ") + "</p></section>";
    }
  });
  CA.on("assign-role", function (el) {
    if (!el.value) return;
    var u = CA.S.users.filter(function (x) { return x.email === el.dataset.email; })[0];
    u.role = el.value; u.status = "Active"; CA.ui.flash = null;
    CA.log("Assigned role", u.email, el.value + " (simulated Entra ID group)"); CA.store.save(); CA.toast(esc(u.name) + " is now " + esc(el.value) + " (simulated)"); CA.render();
  });

  CA.route("admin/ai", {
    title: "AI settings", roles: "ad be", nav: "admin/ai",
    render: function () {
      var S = CA.S;
      return CA.head({ crumbs: [["Admin"], ["AI settings"]], title: "AI settings", chips: CA.chip("12 agents") + CA.sim("No model is called"), sub: "Switch each agent on or off (the audit continues manually), see the suggestion log and human decisions. Production safety rules: licensed text only, personal data removed before model calls, approved Azure region, no training on customer data." }) +
        '<section class="card-ca"><h2 class="card-title">Agents</h2>' + CA.table([
          { k: "id", label: "ID", fmt: function (a) { return '<span class="mono">' + a.id + "</span>"; } }, { k: "name", label: "Agent" }, { k: "purpose", label: "Purpose" },
          { k: "rel", label: "Release", fmt: function (a) { return a.r1 ? CA.chip(a.rel, "ai") : CA.chip(a.rel, "future"); } },
          { k: "control", label: "Human control" },
          { k: "on", label: "Enabled", sort: false, fmt: function (a) { return a.r1 ? '<div class="form-check form-switch m-0"><input class="form-check-input" type="checkbox" role="switch" id="ag-' + a.id + '" data-change="agent-toggle" data-id="' + a.id + '"' + (S.agentsOn[a.id] ? " checked" : "") + (CA.can("ad") ? "" : " disabled") + '><label class="visually-hidden" for="ag-' + a.id + '">Enable ' + esc(a.name) + "</label></div>" : '<span class="small-muted">Not in R1</span>'; } }
        ], CA.AGENTS, { id: "t-agents" }) + "</section>" +
        '<section class="card-ca"><h2 class="card-title">Suggestion log <span class="sp"></span><span class="small-muted">' + S.aiLog.length + " entries this session</span></h2>" +
        (S.aiLog.length ? CA.table([{ k: "ts", label: "Time" }, { k: "agent", label: "Agent", fmt: function (r) { return '<span class="mono">' + esc(r.agent) + "</span>"; } }, { k: "record", label: "Record", fmt: function (r) { return '<span class="mono">' + esc(r.record) + "</span>"; } }, { k: "what", label: "Suggestion" }, { k: "decision", label: "Human decision", fmt: function (r) { return CA.chip(r.decision, /Accepted|Edited/.test(r.decision) ? "ok" : /Rejected|Overridden|Changed/.test(r.decision) ? "warn" : "ai"); } }, { k: "by", label: "By" }], S.aiLog.slice(0, 60), { id: "t-ailog" }) : CA.empty("stars", "No AI suggestions yet", "Generate a checklist or run applicability to see entries here.")) + "</section>" +
        '<div class="info-banner"><i class="bi bi-clipboard-data"></i><span>Release quality bar (explanation reference): ≥ 95% clause coverage, ≥ 80% of checkpoints accepted without major edits, zero invented clause references. Evaluation results are not simulated here.</span></div>';
    }
  });
  CA.on("agent-toggle", function (el) {
    CA.S.agentsOn[el.dataset.id] = el.checked;
    CA.log(el.checked ? "Enabled" : "Disabled", el.dataset.id, "AI agent " + (el.checked ? "on" : "off") + " — workflow continues manually when off"); CA.store.save();
    CA.toast(el.dataset.id + " " + (el.checked ? "enabled" : "disabled") + ". (Display only — the prototype's simulated suggestions still appear.)", "info");
  });

  CA.route("admin/trail", {
    title: "Audit trail", roles: "ad be pm", nav: "admin/trail",
    render: function () {
      var q = (CA.ui.trailQ || "").toLowerCase();
      var rows = CA.S.trail.filter(function (t) { return !q || (t.actor + " " + t.action + " " + t.record + " " + t.detail).toLowerCase().indexOf(q) > -1; });
      return CA.head({ crumbs: [["Admin"], ["Audit trail"]], title: "Audit trail viewer", chips: CA.chip(CA.S.trail.length + " events"), sub: "Who did what, to which record, and when. Every human approval of an AI suggestion is logged here. Production keeps old / new values for 7 years (explanation reference)." }) +
        '<div class="filters"><input class="form-control" type="search" placeholder="Filter by actor, action, record…" value="' + esc(CA.ui.trailQ || "") + '" data-change="trail-q" aria-label="Filter audit trail"><span class="small-muted">' + rows.length + " shown · timestamps use the fixed demo date + your local time</span></div>" +
        CA.table([{ k: "ts", label: "Timestamp" }, { k: "actor", label: "Actor" }, { k: "role", label: "Role" }, { k: "action", label: "Action" }, { k: "record", label: "Record", fmt: function (t) { return '<span class="mono">' + esc(t.record) + "</span>"; } }, { k: "detail", label: "Detail" }], rows.slice(0, 200), { id: "t-trail" });
    }
  });
  CA.on("trail-q", function (el) { CA.ui.trailQ = el.value; CA.render(); });

  CA.route("admin/import", {
    title: "Data import", roles: "ad", nav: "admin/import",
    render: function () {
      var r = CA.ui.importRes;
      return CA.head({ crumbs: [["Admin"], ["Data import"]], title: "Data import", chips: CA.sim("No import backend"), sub: "R1 includes migrating Excel history (Internal Audit Plan, TPL-59 reports, Audit Summary) so H2-24 → H1-26 trends carry on. Here, selecting a file shows only its name and a mock validation result." }) +
        '<form class="card-ca" data-form="import" novalidate><h2 class="card-title">Upload workbook</h2><div class="row g-3">' +
        CA.field({ name: "kind", label: "Workbook type", type: "select", required: true, placeholder: "Choose…", options: ["Internal Audit Plan (.xlsx)", "TPL-59 Audit Report (.xlsx)", "Audit Summary (.xlsx)"], col: "col-md-5" }) +
        CA.field({ name: "file", label: "File", type: "file", required: true, col: "col-md-7", help: "The file never leaves your computer." }) +
        '</div><button class="btn btn-ink" type="submit" style="justify-self:start"><i class="bi bi-check2-square"></i> Validate (simulated)</button></form>' +
        (r ? '<section class="card-ca"><h2 class="card-title">Validation result · ' + esc(r.file) + " " + CA.sim() + "</h2>" + CA.table([{ k: 0, label: "Sheet" }, { k: 1, label: "Rows", num: true }, { k: 2, label: "Result", fmt: function (x) { return CA.chip(x[2], /OK/.test(x[2]) ? "ok" : "warn"); } }, { k: 3, label: "Notes" }], r.rows, { id: "t-imp" }) +
          '<div class="d-flex gap-2"><button class="btn btn-soft" data-action="import-clear">Discard</button><button class="btn btn-okay" data-action="import-commit">Import (simulated)</button></div></section>' : "");
    }
  });
  CA.onForm("import", function (form, d) {
    var rows = /Plan/.test(d.kind) ? [["Auditor list", 6, "OK", ""], ["Master schedule", 19, "OK", ""], ["Cycle plan", 19, "2 warnings", "2 rows with duration outside 30–90 min"]] :
      /TPL-59/.test(d.kind) ? [["Checklist", 59, "OK", "Mapped to ISO 9001:2015 clauses"], ["Results", 59, "1 warning", "1 row with blank result treated as Not audited"]] :
        [["NC register", 41, "OK", ""], ["Compliance %", 19, "OK", "Average 93.2% reproduced for IA_01_26"], ["Charts", 4, "Skipped", "Charts are rebuilt live, not imported"]];
    CA.ui.importRes = { file: d.file, rows: rows };
    CA.log("Validated", "Import", d.kind + " · " + d.file + " (simulated)"); CA.toast("Validated " + esc(d.file) + " (simulated — nothing uploaded)", "info"); CA.render();
  });
  CA.on("import-clear", function () { CA.ui.importRes = null; CA.render(); });
  CA.on("import-commit", function () { CA.log("Imported", "Import", CA.ui.importRes.file + " (simulated)"); CA.ui.importRes = null; CA.toast("Import recorded in the audit trail (simulated — no data changed)", "info"); CA.render(); });
})(window.CA);
