/* Future-release previews (R2 / R3) and prototype guide pages:
   lifecycle, AI agents, Teams & Outlook (outside the app), roadmap, screen inventory. */
(function (CA) {
  var esc = CA.esc;

  // ---------- future previews ----------
  function preview(o) {
    CA.route(o.route, {
      title: o.title + " (Planned " + o.rel + ")", roles: o.roles, nav: o.route,
      render: function () {
        return CA.head({ crumbs: [[o.section], [o.title]], title: o.title, chips: CA.future(o.rel) }) +
          '<div class="future-banner"><i class="bi bi-hourglass-split"></i><span><b>Not in Release 1.</b> ' + o.why + " This is a disabled preview so stakeholders can see where it will live.</span></div>" +
          '<section class="card-ca" aria-disabled="true" style="opacity:.75"><h2 class="card-title">' + esc(o.title) + ' <span class="sp"></span><button class="btn btn-soft btn-sm" disabled>' + esc(o.cta) + "</button></h2>" + o.mock + "</section>" +
          '<a class="btn btn-soft btn-sm" style="justify-self:start" href="#/roadmap">See the release roadmap →</a>';
      }
    });
  }
  var rows = function (cols, data) { return '<div class="table-wrap"><table class="table-ca"><thead><tr>' + cols.map(function (c) { return "<th>" + c + "</th>"; }).join("") + "</tr></thead><tbody>" + data.map(function (r) { return "<tr>" + r.map(function (x) { return "<td>" + x + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>"; };
  preview({ route: "obligations", title: "Obligation register", rel: "R2", section: "Library", roles: "be pm", cta: "Add obligation", why: "The regulatory applicability / obligation register (A03 obligations) arrives in R2.", mock: rows(["Obligation", "Jurisdiction", "Applies to", "Owner"], [["Example data-protection obligation", "UAE", "All BUs", "—"], ["Example health & safety obligation", "KSA", "Logistics", "—"]]) });
  preview({ route: "qualification", title: "Qualification assessment", rel: "R2", section: "Library", roles: "be pm", cta: "Start assessment", why: "Readiness and qualification scoring is an R2 feature.", mock: '<div class="grid g3">' + ["Readiness score", "Gaps to close", "Evidence ready"].map(function (k) { return '<div class="kpi"><b>—</b><span>' + k + "</span></div>"; }).join("") + "</div>" });
  preview({ route: "external-portal", title: "External auditor portal", rel: "R2", section: "Audits", roles: "pm be", cta: "Invite external auditor", why: "Guest access for the certification body (LRQA in the explanation reference) and external-body response packs are R2.", mock: rows(["Pack", "Audit", "Status"], [["SV1 response pack", "External surveillance", "—"]]) });
  preview({ route: "copilot", title: "Insights Copilot panel", rel: "R2", section: "Insights", roles: "pm ex be", cta: "Ask", why: "A12 Insights Copilot is planned as beta in R2 and GA in R3. Answers would be read-only, within the user's access, and cite records.", mock: '<div class="grid gap-2"><input class="form-control" disabled placeholder="e.g. Which BUs had repeat findings on clause 8.2.3?"><div class="ai-box"><span class="ai-tag">Example answer (not generated)</span><span class="small">The answer would cite findings by ID and link to them. No answer is produced in the prototype.</span></div></div>' });
  preview({ route: "admin/tenant", title: "Tenant console", rel: "R3", section: "Admin", roles: "ad", cta: "Onboard tenant", why: "Tenant onboarding / administration, licensing and billing, marketplace listing and Arabic UI are R3 productisation.", mock: rows(["Tenant", "Plan", "Users", "Region"], [["Intertec (internal)", "—", "—", "UAE North"], ["Pilot customer", "—", "—", "—"]]) });

  // ---------- lifecycle (4 phases, 10 steps) ----------
  var PHASES = [
    ["Prepare", "ph-prep", [["1", "Audit Universe & Standards", "universe", "Master register of what can be audited", "—"], ["2", "Standards Library & Standards Watch", "standards", "Editions, clause structure, 2015 → 2026 delta", "A01 · A02"], ["3", "Scope & AI tailoring", "audit/IA-2027-001/scope", "Objective, boundaries, applicability with reasons", "A03"], ["4", "AI Checklist Builder", "audit/IA-2027-001/checklist", "Audit-specific checklist, human-approved", "A04"]]],
    ["Plan", "ph-plan", [["5", "Audit Programme", "programmes", "Half-year coverage and strategy — rules only", "rules only"], ["6", "Auditor allocation & scheduling", "cycle", "Competence, impartiality, slots, invites", "A05"]]],
    ["Audit", "ph-audit", [["7", "Audit execution / fieldwork", "audit/IA-2027-001/fieldwork", "Responses, evidence, observations", "A06 (R2)"], ["8", "Findings & classification", "findings", "Statement, grade confirmed by Lead Auditor", "A07"], ["9", "Audit report", "audit/IA-2027-001/report", "Draft → review → approval → issue", "A11"]]],
    ["Close & learn", "ph-close", [["10", "CAR, follow-up, effectiveness & dashboard", "cars", "Root cause, escalation, 60–90 day check, insight", "A08 · A09 · A10 · A12 (R2)"]]]
  ];
  CA.route("lifecycle", {
    title: "Audit lifecycle", roles: CA.ALL, nav: "lifecycle",
    render: function () {
      return CA.head({ crumbs: [["Prototype guide"], ["Audit lifecycle"]], title: "The audit lifecycle: 4 phases, 10 steps", actions: '<button class="btn btn-ai btn-sm" data-action="guide-start"><i class="bi bi-play-circle"></i> Guided demo (18 steps)</button>',
          sub: "Every audit follows the same loop. Dashboard trends and effectiveness results feed the next cycle's programme. Select a step to open its screen." }) +
        '<div class="grid g4">' + PHASES.map(function (ph) {
          return '<section class="phase"><div class="phase-h"><i class="sw" style="background:var(--' + ph[1] + ')"></i>' + esc(ph[0]) + "</div>" + ph[2].map(function (s) {
            return '<a class="lc-step" href="#/' + s[2] + '"><span class="n">STEP ' + s[0] + " · " + esc(s[4]) + "</span><b>" + esc(s[1]) + "</b><small>" + esc(s[3]) + "</small></a>";
          }).join("") + "</section>";
        }).join("") + "</div>" +
        '<div class="grid g2"><section class="card-ca"><h2 class="card-title">Rules decide <span class="chip">Deterministic</span></h2><ul class="small mb-0"><li>Workflow states and approvals</li><li>Due dates, SLA timers and escalations</li><li>Compliance scores</li><li>Who can see and change what</li></ul></section>' +
        '<section class="card-ca"><h2 class="card-title">AI drafts <span class="chip ai">Suggestion</span></h2><ul class="small mb-0"><li>Checkpoints and tailored checklists</li><li>Auditor matches and draft cycle plan</li><li>Finding wording and suggested grade</li><li>Follow-up messages and report narrative</li></ul></section></div>' +
        '<div class="info-banner"><i class="bi bi-info-circle"></i><span>Framing note: the brief places the report in Phase 3 (Audit); the explanation reference places it under Close &amp; learn. See README "Source discrepancies".</span></div>';
    }
  });

  // ---------- agents ----------
  CA.route("agents", {
    title: "AI agents", roles: CA.ALL, nav: "agents",
    render: function () {
      var S = CA.S;
      return CA.head({ crumbs: [["Prototype guide"], ["AI agents"]], title: "The twelve AI agents", chips: CA.sim("All AI behaviour simulated"),
        sub: "AI drafts and recommends; authorised people decide. The pattern is the same everywhere: suggestion → rationale / source context → human review → accept / edit / reject → approval stamped with name and time → audit-trail event." }) +
        '<div class="grid g4">' + CA.AGENTS.map(function (a) {
          var n = S.aiLog.filter(function (l) { return l.agent === a.id; }).length;
          return '<a class="agent-card ' + (a.r1 ? "" : "r2") + '" href="#/' + a.route + '" style="text-decoration:none;color:inherit"><header><span class="mono">' + a.id + "</span>" + (a.r1 ? CA.chip(a.rel, "ai") : CA.chip(a.rel, "future")) + "</header><b>" + esc(a.name) + "</b><p>" + esc(a.purpose) + '</p><div class="ctl"><i class="bi bi-person-check"></i> ' + esc(a.control) + (n ? ' · <span class="mono">' + n + " logged this session</span>" : "") + "</div></a>";
        }).join("") + "</div>" +
        '<div class="info-banner"><i class="bi bi-exclamation-diamond"></i><span>Release labels follow the project plan: R1 includes A01–A05 and A07–A11 (A01 basic in R1, full in R2). <b>A06 Evidence Analyst and A12 Insights Copilot are R2.</b></span></div>' +
        '<section class="card-ca"><h2 class="card-title">AI never decides</h2><p class="small mb-0">Permissions, final findings, severity, approvals, SLA dates, compliance calculations and closure stay with deterministic rules and named people.</p></section>';
    }
  });

  // ---------- outside the app ----------
  CA.route("outside", {
    title: "Teams & Outlook", roles: CA.ALL, nav: "outside",
    render: function () {
      var S = CA.S, f = S.findings.filter(function (x) { return x.audit === "IA-2027-001"; })[0], c = S.cars.filter(function (x) { return x.finding && x.finding.indexOf("F-IA-2027-001") === 0; })[0];
      var sl = CA.slot("SL-01");
      return CA.head({ crumbs: [["Prototype guide"], ["Teams & Outlook"]], title: "Outside the app", chips: CA.sim("Microsoft Teams / Outlook / SharePoint simulated"), sub: "Most of the ~19 BU managers rarely open Compliance AI: it comes to them as Teams cards, Outlook invites and report emails. These are mock-ups; nothing is sent." }) +
        '<div class="grid g2"><div class="grid" style="align-content:start"><h2 class="h6 mb-0">Outlook invitations</h2>' +
        (S.cyclePlan.status === "Published" ? '<div class="teams-card"><div class="top" style="background:#0f6cbd"><i class="bi bi-envelope"></i> Outlook · Invitation</div><div class="bd"><b>Internal audit: Sales – Dubai (IA-2027-001)</b><span>' + CA.dow(sl.date) + " " + CA.d(sl.date) + " · " + sl.time + " · " + sl.mins + " min · " + esc(sl.location) + '</span><span class="small muted">Teams link included · Organiser: Nadia Farouk · Status: ' + esc(sl.invite) + "</span></div></div>" : '<div class="info-banner"><i class="bi bi-calendar-x"></i><span>No invitations yet — the cycle plan is not published. ' + CA.link("cycle", "Open cycle plan") + "</span></div>") +
        '<h2 class="h6 mb-0 mt-2">Report email</h2>' + (CA.audit("IA-2027-001").report && CA.audit("IA-2027-001").report.state === "Issued" ? '<div class="teams-card"><div class="top" style="background:#0f6cbd"><i class="bi bi-envelope-paper"></i> Outlook · Report issued</div><div class="bd"><b>Audit report RPT-IA-2027-001 issued</b><span class="small">Secure link · filed to SharePoint › 2027 › Audit Report › Sales_Sent</span></div></div>' : '<p class="small-muted">Appears when the IA-2027-001 report is issued.</p>') + "</div>" +
        '<div class="grid" style="align-content:start"><h2 class="h6 mb-0">Microsoft Teams</h2>' +
        (c ? '<div class="teams-card"><div class="top"><i class="bi bi-microsoft-teams"></i> Compliance AI · 9:00 AM</div><div class="bd"><b>Corrective action ' + c.id + " · due " + CA.d(c.due) + '</b><span class="small">' + esc(CA.SIM.followUp(c.id, CA.d(c.due))) + '</span></div><div class="acts"><a class="btn btn-ink btn-sm" href="#/car/' + c.id + '">Update progress</a><a class="btn btn-soft btn-sm" href="#/car/' + c.id + '">Upload evidence</a></div></div>' : "") +
        (f ? '<div class="teams-card"><div class="top"><i class="bi bi-microsoft-teams"></i> Compliance AI</div><div class="bd"><b>New finding for Sales – Dubai</b><span>' + f.id + " · " + (f.grade ? CA.gradeLabel(f.grade) : "grade pending") + " · clause " + esc(f.clause) + '</span></div><div class="acts"><a class="btn btn-soft btn-sm" href="#/finding/' + f.id + '">Open</a></div></div>' : '<p class="small-muted">Finding and reminder cards appear as you progress through the guided demo.</p>') +
        '<p class="small-muted">Card buttons in production update the record directly. Here they open the related screen.</p></div></div>';
    }
  });

  // ---------- roadmap ----------
  CA.route("roadmap", {
    title: "Release roadmap", roles: CA.ALL, nav: "roadmap",
    render: function () {
      var F = CA.FACTS;
      var rel = [
        ["R1 · Audit Cycle MVP", "Build " + F.r1Build + " · planned go-live " + F.r1GoLive, "ok", ["Audit universe masters", "Standards library + ISO 9001:2015 → 2026 delta", "Auditor directory", "Programme & half-year cycle plan", "AI checkpoint / checklist generation per BU", "Online execution (autosave)", "Findings, reports & auto-distribution", "Corrective actions, automated follow-up, effectiveness checks", "Dashboards", "Entra ID SSO, Outlook / Teams / SharePoint integrations", "Excel history migration"], "In this prototype: built as interactive screens; integrations simulated."],
        ["R2 · Qualification & Intelligence", "Planned go-live " + F.r2GoLive, "future", ["Regulatory applicability / obligation register", "Readiness & qualification scoring", "Full Standards Watch", "Risk-based frequency", "Offline execution", "Evidence requests · A06 Evidence Analyst", "A12 Insights Copilot (beta)", "Power BI feed · HR feed", "External-body response packs"], "Shown as Planned R2 previews: " + ["obligations", "qualification", "external-portal", "copilot"].map(function (r) { return CA.link(r, r); }).join(", ") + "."],
        ["R3 · Productisation", "Indicative " + F.r3Window, "future", ["Tenant onboarding / administration", "Licensing & billing model", "Marketplace listing", "Insights Copilot GA", "Arabic UI", "GRC / CAPA connectors"], "Shown as Planned R3 preview: " + CA.link("admin/tenant", "Tenant console") + "."]
      ];
      return CA.head({ crumbs: [["Prototype guide"], ["Release roadmap"]], title: "Release roadmap", chips: CA.src("Project plan dates"), sub: "What is in Release 1 versus later. Future features are labelled and never appear live in R1 screens." }) +
        '<div class="grid g3">' + rel.map(function (r) { return '<section class="card-ca"><span class="mono small" style="color:var(--' + (r[2] === "ok" ? "ok" : "future") + ')">' + esc(r[1]) + "</span><h2 class=\"card-title\">" + esc(r[0]) + '</h2><ul class="small mb-0">' + r[3].map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ul><p class="small-muted mb-0">' + r[4] + "</p></section>"; }).join("") + "</div>" +
        '<section class="card-ca"><h2 class="card-title">Milestones (explanation reference)</h2>' + CA.table([{ k: 0, label: "ID" }, { k: 1, label: "Milestone" }, { k: 2, label: "Date" }], [["M0", "Project kick-off", "26 Oct 2026"], ["M1", "BRD and PRD sign-off", "20 Nov 2026"], ["M2", "Design sign-off", "4 Dec 2026"], ["M3", "R1 feature-complete", "19 Mar 2027"], ["M4", "Test exit + pen test clear", "2 Apr 2027"], ["M5", "UAT sign-off", "16 Apr 2027"], ["M6", "R1 go-live", "26 Apr 2027"], ["M7", "H1-2027 cycle closed in tool", "30 Jun 2027"], ["M8", "R2 go-live", "4 Oct 2027"], ["M9", "Product-ready (indicative)", "17 Dec 2027"]], { id: "t-ms" }) + "</section>";
    }
  });

  // ---------- screen inventory (43 screens from compliance-ai-wireframe.html) ----------
  CA.INVENTORY = [
    ["Home", "Home dashboard", "home", "R1"], ["Home", "My tasks", "tasks", "R1"],
    ["Plan", "Programme list & approval", "programmes", "R1"], ["Plan", "Programme grid", "programme/PRG-2027", "R1"], ["Plan", "Clause coverage report", "coverage", "R1"], ["Plan", "Cycle plan builder", "cycle", "R1"], ["Plan", "Audit calendar", "calendar", "R1"],
    ["Audits", "Audit record", "audit/IA-2027-001", "R1"], ["Audits", "Audit plan & agenda", "audit/IA-2027-001/plan", "R1"], ["Audits", "Meeting record", "audit/IA-2027-001/meeting", "R1"], ["Audits", "Checklist builder", "audit/IA-2027-001/checklist", "R1"], ["Audits", "Fieldwork checklist", "audit/IA-2027-001/fieldwork", "R1"], ["Audits", "Consolidation view", "audit/IA-2027-001/consolidation", "R1"], ["Audits", "Finding editor", "finding/F-IA-2026-001-02", "R1"], ["Audits", "Findings register", "findings", "R1"], ["Audits", "Report builder", "audit/IA-2027-001/report", "R1"], ["Audits", "Distribution & archive", "distribution", "R1"], ["Audits", "External auditor portal", "external-portal", "R2"],
    ["Actions", "CAR workspace", "car/CAR-2026-0014", "R1"], ["Actions", "CAR review & verification", "car/CAR-2026-0004/review", "R1"], ["Actions", "Effectiveness check", "effectiveness/CAR-2026-0004", "R1"], ["Actions", "Overdue board", "overdue", "R1"],
    ["Library", "Organisation & sectors", "org", "R1"], ["Library", "Locations & business units", "locations", "R1"], ["Library", "Universe register", "universe", "R1"], ["Library", "Standards library", "standards", "R1"], ["Library", "Edition crosswalk (2015 → 2026)", "crosswalk", "R1"], ["Library", "Baseline checkpoint review", "checkpoints", "R1"], ["Library", "Checklist template library", "templates", "R1"], ["Library", "Auditor directory", "auditors", "R1"], ["Library", "Auditor profile", "auditor/AUD-01", "R1"], ["Library", "Obligation register", "obligations", "R2"], ["Library", "Qualification assessment", "qualification", "R2"],
    ["Insights", "Management dashboard", "dashboard", "R1"], ["Insights", "Standard reports", "std-reports", "R1"], ["Insights", "Insights Copilot panel", "copilot", "R2"],
    ["Admin", "Lists & scoring", "admin/lists", "R1"], ["Admin", "SLAs & notifications", "admin/sla", "R1"], ["Admin", "Users & access", "admin/users", "R1"], ["Admin", "AI settings", "admin/ai", "R1"], ["Admin", "Audit trail viewer", "admin/trail", "R1"], ["Admin", "Data import", "admin/import", "R1"], ["Admin", "Tenant console", "admin/tenant", "R3"]
  ];
  CA.route("inventory", {
    title: "Screen inventory", roles: CA.ALL, nav: "inventory",
    render: function () {
      var inv = CA.INVENTORY;
      return CA.head({ crumbs: [["Prototype guide"], ["Screen inventory"]], title: "Screen inventory · " + inv.length + " planned screens", chips: CA.chip("Mapped to compliance-ai-wireframe.html"),
          sub: "The exact menu sections and screen names from the source wireframe. Each row opens the implemented screen. Prototype-only helper pages (lifecycle, agents, Teams & Outlook, roadmap, this inventory, BU drill-down, scope step) are extra and not counted." }) +
        CA.table([{ k: 0, label: "Menu section" }, { k: 1, label: "Wireframe screen name" }, { k: 2, label: "Route", fmt: function (r) { return '<a class="mono" href="#/' + r[2] + '">#/' + esc(r[2]) + "</a>"; } }, { k: 3, label: "Release", fmt: function (r) { return r[3] === "R1" ? CA.chip("R1 · interactive", "ok") : CA.future(r[3]); } }], inv, { id: "t-inv", rowRoute: function (r) { return r[2]; } }) +
        '<section class="card-ca fill"><h2 class="card-title">Outside the app (wireframe section)</h2><p class="small mb-0">Teams cards for findings, reminders and evidence upload · Outlook invites with Teams links · report emails with secure links · SharePoint archive folders → ' + CA.link("outside", "Teams & Outlook mock-ups") + " (simulated).</p></section>";
    }
  });
})(window.CA);
