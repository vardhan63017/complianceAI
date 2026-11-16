/* Home dashboard, My tasks, Management dashboard, BU drill-down, Standard reports. */
(function (CA) {
  var esc = CA.esc;

  // ---------- derived tasks per role (live from demo state) ----------
  CA.tasksFor = function (role) {
    var S = CA.S, t = [];
    var sales = CA.audit("IA-2027-001"), prg = CA.programme("PRG-2027");
    var f = S.findings.filter(function (x) { return x.audit === "IA-2027-001"; });
    var cars = S.cars;
    var overdue = cars.filter(function (c) { return CA.carOverdue(c); });
    if (role === "pm") {
      if (prg.status === "Draft") t.push(["Submit programme PRG-2027 for review", "Draft · H1 + H2 2027", "programmes"]);
      if (S.cyclePlan.status !== "Published") t.push(["Review and publish H1-2027 cycle plan", "19 slots proposed by A05 · 1 impartiality flag", "cycle"]);
      if (sales.report && sales.report.state === "Approval") t.push(["Approve report: Sales – Dubai", "Due within 5 working days", "audit/IA-2027-001/report"]);
      if (overdue.length) t.push(["Review overdue corrective actions (" + overdue.length + ")", "Escalation tiers set by rule", "overdue"]);
    }
    if (role === "la") {
      if (!sales.scope || !sales.scope.confirmed) t.push(["Confirm scope & applicability: Sales – Dubai", "A03 suggestions waiting", "audit/IA-2027-001/scope"]);
      if (!sales.checklist || sales.checklist.state !== "Approved") t.push(["Generate and approve checklist: Sales – Dubai", "A04 · ISO 9001:2026", "audit/IA-2027-001/checklist"]);
      f.filter(function (x) { return x.status === "Draft"; }).forEach(function (x) { t.push(["Confirm grade: " + x.id, "AI suggested " + CA.gradeLabel(x.aiGrade), "finding/" + x.id]); });
      if (sales.report && /Draft|Technical review/.test(sales.report.state)) t.push(["Finish report: Sales – Dubai", sales.report.state, "audit/IA-2027-001/report"]);
      cars.filter(function (c) { return c.state === "Effectiveness review"; }).forEach(function (c) { t.push(["Effectiveness review: " + c.id, "60–90 days after implementation", "effectiveness/" + c.id]); });
    }
    if (role === "au") {
      if (sales.checklist && sales.checklist.state === "Approved") {
        var c = CA.auditCounts(sales);
        if (c.open) t.push(["Complete fieldwork: Sales – Dubai", c.open + " questions left", "audit/IA-2027-001/fieldwork"]);
      } else t.push(["Fieldwork opens once the checklist is approved", "Sales – Dubai · 10 May 2027", "audit/IA-2027-001"]);
      cars.filter(function (x) { return x.state === "Plan review" || x.state === "Evidence submitted"; }).forEach(function (x) { t.push(["Review " + x.id, x.state, "car/" + x.id + "/review"]); });
    }
    if (role === "ae") {
      f.filter(function (x) { return x.status === "Sent to auditee"; }).forEach(function (x) { t.push(["Respond to finding " + x.id, CA.gradeLabel(x.grade) + " · acknowledge or dispute", "finding/" + x.id]); });
      cars.filter(function (x) { return x.bu === "BU-01" && /Root cause|Returned|Implementation|Reopened/.test(x.state); }).forEach(function (x) { t.push(["Corrective action " + x.id, x.state + " · due " + CA.d(x.due), "car/" + x.id]); });
      if (!t.length) t.push(["Your next audit: Sales – Dubai", "Mon 10 May 2027 · 09:30 · 90 min", "audit/IA-2027-001"]);
    }
    if (role === "be") {
      var cw = S.crosswalk.filter(function (x) { return x.state !== "Approved"; }).length;
      if (cw) t.push(["Review ISO 9001:2026 change impact (" + cw + ")", "A01 Standards Watch", "crosswalk"]);
      var cp = S.checkpoints.filter(function (x) { return x.state === "ai-draft"; }).length;
      if (cp) t.push(["Approve baseline checkpoints (" + cp + " AI drafts)", "A02 Checkpoint Generator", "checkpoints"]);
      if (prg.status === "In review") t.push(["Approve programme PRG-2027", "Submitted by Nadia Farouk", "programme/PRG-2027"]);
    }
    if (role === "ex") {
      t.push(["Management summary is ready", "IA_01_26 · organisation 93.2% vs 90% target", "dashboard"]);
      overdue.filter(function (c) { return CA.overdueTier(c.due).tier === "+14"; }).forEach(function (c) { t.push(["Escalated to you: " + c.id, CA.overdueTier(c.due).late + " days overdue (+14 tier)", "overdue"]); });
    }
    if (role === "ad") {
      var w = S.users.filter(function (u) { return u.status === "Awaiting role"; }).length;
      if (w) t.push([w + " users waiting for role assignment", "Entra ID provisioning simulated", "admin/users"]);
      t.push(["Review data import validation", "Excel history H2-24 to H1-26", "admin/import"]);
    }
    return t;
  };

  function kpisFor(role) {
    var S = CA.S, open = S.cars.filter(function (c) { return c.state !== "Closed"; }).length;
    var openF = S.findings.filter(function (f) { return !/Closed/.test(f.status); }).length;
    var done = S.audits.filter(function (a) { return a.report && a.report.state === "Issued"; }).length;
    var inProg = S.audits.filter(function (a) { return a.checklist; }).length;
    var overdue = S.cars.filter(function (c) { return CA.carOverdue(c); }).length;
    var org = CA.kpi("93.2%", "Organisation compliance · " + CA.FACTS.orgAvgCycle, CA.src("Source-stated · target 90%"), "accent good");
    if (role === "pm" || role === "ex" || role === "be") return [
      CA.kpi("19", "Business units in scope", CA.src()), org,
      CA.kpi(String(S.slots.length), "H1-2027 audits planned", CA.demo()),
      CA.kpi(done + " / " + inProg, "Audits issued / in progress", CA.demo()),
      CA.kpi(String(openF), "Open findings", CA.demo()),
      CA.kpi(String(open), "Open CARs · " + overdue + " overdue", CA.demo(), overdue ? "bad" : "")
    ];
    if (role === "la") return [CA.kpi("3", "My audits this cycle", CA.demo()), CA.kpi(String(S.findings.filter(function (f) { return f.status === "Draft"; }).length), "Findings to confirm", CA.demo()), CA.kpi(String(S.audits.filter(function (a) { return a.report && a.report.state !== "Issued"; }).length), "Reports in progress", CA.demo()), CA.kpi(String(S.cars.filter(function (c) { return c.state === "Effectiveness review"; }).length), "Effectiveness reviews", CA.demo())];
    if (role === "au") { var c = CA.auditCounts(CA.audit("IA-2027-001")); return [CA.kpi("2", "Audits assigned", CA.demo()), CA.kpi(String(c.open), "Questions left (IA-2027-001)", CA.demo()), CA.kpi(String(S.cars.filter(function (x) { return x.state === "Evidence submitted" || x.state === "Plan review"; }).length), "CAR reviews", CA.demo()), CA.kpi("Mar 2028", "IQA certificate valid to", CA.demo())]; }
    if (role === "ae") return [CA.kpi("91.4%", "Sales BU compliance (IA_01_26)", CA.demo("Illustrative BU value")), CA.kpi(String(S.cars.filter(function (x) { return x.bu === "BU-01" && x.state !== "Closed"; }).length), "My open actions", CA.demo()), CA.kpi("0", "Overdue", CA.demo()), CA.kpi("10 May", "Next audit", CA.demo())];
    return [CA.kpi(String(S.users.filter(function (u) { return u.status === "Active"; }).length), "Active users", CA.demo()), CA.kpi(Object.keys(S.agentsOn).filter(function (k) { return S.agentsOn[k]; }).length + " / 12", "AI agents switched on", CA.demo()), CA.kpi("0", "Failed integrations (simulated)", CA.sim()), CA.kpi(String(S.trail.length), "Audit-trail events", CA.demo())];
  }

  function taskList(role, limit) {
    var t = CA.tasksFor(role);
    if (!t.length) return CA.empty("check2-circle", "Nothing waiting on you", "All caught up for this role.");
    return '<div class="list-ca">' + t.slice(0, limit || 99).map(function (x) {
      return '<a class="li-ca" href="#/' + x[2] + '"><i class="bi bi-circle"></i><span class="sp">' + esc(x[0]) + "<small>" + esc(x[1]) + '</small></span><span class="btn btn-soft btn-sm">Open</span></a>';
    }).join("") + "</div>";
  }

  CA.route("home", {
    title: "Home", roles: CA.ALL, nav: "home",
    render: function () {
      var role = CA.role(), me = CA.me(), S = CA.S;
      var up = S.slots.slice().sort(function (a, b) { return a.date > b.date ? 1 : -1; }).filter(function (s) { return s.date >= CA.DEMO_TODAY; }).slice(0, 5);
      var overdue = S.cars.filter(function (c) { return CA.carOverdue(c); });
      var showCharts = /pm|ex|be|la/.test(role);
      return CA.head({ crumbs: [["Home"]], title: "Good morning, " + me.user.split(" ")[0], chips: CA.chip(me.label, "ai"),
        actions: S.guide.on ? "" : '<button class="btn btn-ai btn-sm" data-action="guide-start"><i class="bi bi-play-circle"></i> Start guided demo</button>' }) +
        '<div class="grid ' + (kpisFor(role).length > 4 ? "g3" : "g4") + ' stagger">' + kpisFor(role).join("") + "</div>" +
        '<div class="grid g-side"><div class="grid">' +
        '<section class="card-ca"><h2 class="card-title"><i class="bi bi-inbox"></i> Waiting on me <span class="sp"></span><a class="small" href="#/tasks">All tasks</a></h2>' + taskList(role, 5) + "</section>" +
        (showCharts ? '<section class="card-ca"><h2 class="card-title">BU compliance vs 90% target ' + CA.chip(CA.FACTS.orgAvgCycle) + CA.demo("BU values illustrative") + '<span class="sp"></span><a class="small" href="#/dashboard">Management dashboard →</a></h2><div class="chart-box sm"><canvas id="ch-home-bu" aria-label="Bar chart of BU compliance against the 90% target"></canvas></div><p class="chart-note mb-0">Organisation average 93.2% is source-stated; BU values are illustrative and chosen so their simple average reproduces it. Click a bar to drill down.</p></section>' : "") +
        '<section class="card-ca"><h2 class="card-title"><i class="bi bi-activity"></i> Recent activity</h2>' + CA.history(S.trail.slice(0, 6).map(function (x) { return { what: x.action + " · " + x.record + (x.detail ? " — " + x.detail : ""), ts: x.ts, who: x.actor, cls: /Approved|Verified|Published|Issued/.test(x.action) ? "ok" : /AI|Generated/.test(x.action) ? "ai" : "" }; })) + "</section>" +
        "</div><div class=\"grid\">" +
        '<section class="card-ca"><h2 class="card-title"><i class="bi bi-calendar-event"></i> Coming up</h2><div class="list-ca">' + up.map(function (s) {
          var b = CA.bu(s.bu);
          return '<a class="li-ca" href="#/audit/' + s.audit + '"><span class="sp">' + esc(b.name) + " – " + esc(s.location) + "<small>" + CA.dow(s.date) + " " + CA.d(s.date) + " · " + s.time + " · " + s.mins + " min</small></span>" + CA.chip(s.invite === "Sent" ? "Invite sent" : s.status, s.invite === "Sent" ? "ok" : "ai") + "</a>";
        }).join("") + '</div><span class="small-muted">Outlook calendar sync is ' + CA.sim("simulated") + "</span></section>" +
        '<section class="card-ca"><h2 class="card-title"><i class="bi bi-alarm"></i> Overdue actions</h2>' + (overdue.length ? '<div class="list-ca">' + overdue.map(function (c) {
          var t = CA.overdueTier(c.due);
          return '<a class="li-ca" href="#/car/' + c.id + '"><span class="sp"><span class="mono">' + c.id + "</span><small>" + esc(CA.bu(c.bu).name) + " · " + t.late + " days late</small></span>" + CA.chip(t.tier + " tier", t.cls) + "</a>";
        }).join("") + "</div>" : '<p class="small-muted mb-0">None.</p>') + '<span class="small-muted">Tiers +1 / +7 / +14 are deterministic workflow rules.</span></section>' +
        "</div></div>";
    },
    mount: function (root) { var c = root.querySelector("#ch-home-bu"); if (c) CA.chartBU(c, "h126"); }
  });

  CA.route("tasks", {
    title: "My tasks", roles: CA.ALL, nav: "tasks",
    render: function () {
      return CA.head({ crumbs: [["Home", "home"], ["My tasks"]], title: "My tasks", chips: CA.chip(CA.me().label, "ai"), sub: "Every approval, review and reply waiting on you, in one list. Tasks are derived live from the demo state." }) +
        '<section class="card-ca">' + taskList(CA.role()) + "</section>" +
        '<section class="card-ca fill"><h2 class="card-title">Tasks for other roles</h2><div class="grid g3">' + Object.keys(CA.ROLES).filter(function (r) { return r !== CA.role(); }).map(function (r) {
          var n = CA.tasksFor(r).length;
          return '<button class="li-ca text-start" data-action="switch-role" data-role="' + r + '"><span class="sp">' + esc(CA.ROLES[r].label) + "<small>" + n + " open task" + (n === 1 ? "" : "s") + "</small></span><i class=\"bi bi-arrow-right\"></i></button>";
        }).join("") + "</div></section>";
    }
  });

  // ---------- charts ----------
  var C = { ai: "#2a44c8", aiSoft: "#aab4e8", ok: "#1d8656", bad: "#c03d2a", warn: "#d39a2f", ink: "#131927", grey: "#8a93a6", maj: "#9e2a1a", min: "#e0735a", obs: "#d9a23b", afi: "#8fa0c8" };
  function baseOpts(extra) {
    var o = { responsive: true, maintainAspectRatio: false, animation: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? false : { duration: 500 },
      plugins: { legend: { labels: { boxWidth: 12, font: { family: "IBM Plex Sans", size: 11 } } }, tooltip: { titleFont: { family: "IBM Plex Sans" }, bodyFont: { family: "IBM Plex Sans" } } },
      scales: { x: { ticks: { font: { family: "IBM Plex Mono", size: 10 }, autoSkip: false, maxRotation: 60, minRotation: 0 }, grid: { display: false } }, y: { ticks: { font: { family: "IBM Plex Mono", size: 10 } }, grid: { color: "#eef1f5" } } } };
    return Object.assign(o, extra || {});
  }
  function shortName(n) { return n.replace("Quality (Q&BE)", "Quality").replace("Managed Services", "Managed Svc").replace(" – ", "·").replace("Abu Dhabi", "AUH").replace("Bahrain", "BAH").replace("Oman", "OMN"); }
  function mk(canvas, cfg) { if (!window.Chart) { canvas.parentNode.innerHTML = '<p class="small-muted">Chart.js did not load (offline?). Data is still available in the tables.</p>'; return null; } var ch = new Chart(canvas, cfg); CA.charts.push(ch); return ch; }

  CA.chartBU = function (canvas, field, filterCountry) {
    var bus = CA.S.bus.filter(function (b) { return !filterCountry || b.country === filterCountry; });
    return mk(canvas, { type: "bar", data: { labels: bus.map(function (b) { return shortName(b.name); }), datasets: [
      { type: "line", label: "Target 90% (source-stated)", data: bus.map(function () { return 90; }), borderColor: C.ink, borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0, order: 0 },
      { label: "Compliance % (illustrative)", data: bus.map(function (b) { return b[field]; }), backgroundColor: bus.map(function (b) { return b[field] < 90 ? C.bad : C.ai; }), borderRadius: 3, order: 1 }
    ] }, options: baseOpts({ scales: Object.assign(baseOpts().scales, { y: { min: 80, max: 100, ticks: { callback: function (v) { return v + "%"; }, font: { family: "IBM Plex Mono", size: 10 } } } }),
      onClick: function (e, els) { var el = els.filter(function (x) { return x.datasetIndex === 1; })[0] || els[0]; if (el) CA.go("bu/" + bus[el.index].id); },
      onHover: function (e, els) { e.native.target.style.cursor = els.length ? "pointer" : "default"; } }) });
  };
  CA.chartNC = function (canvas) {
    var bus = CA.S.bus.filter(function (b) { return b.nc.some(function (n) { return n > 0; }); });
    var ds = [["Major NC", 0, C.maj], ["Minor NC", 1, C.min], ["Observation", 2, C.obs], ["AFI", 3, C.afi]].map(function (d) { return { label: d[0], data: bus.map(function (b) { return b.nc[d[1]]; }), backgroundColor: d[2], borderRadius: 2 }; });
    return mk(canvas, { type: "bar", data: { labels: bus.map(function (b) { return shortName(b.name); }), datasets: ds }, options: baseOpts({ scales: { x: { stacked: true, grid: { display: false }, ticks: { font: { family: "IBM Plex Mono", size: 10 }, autoSkip: false, maxRotation: 60 } }, y: { stacked: true, ticks: { precision: 0 } } }, onClick: function (e, els) { if (els[0]) CA.go("bu/" + bus[els[0].index].id); } }) });
  };
  CA.chartHalf = function (canvas) {
    var bus = CA.S.bus;
    return mk(canvas, { type: "bar", data: { labels: bus.map(function (b) { return shortName(b.name); }), datasets: [
      { label: "H2-2025", data: bus.map(function (b) { return b.h225; }), backgroundColor: C.aiSoft, borderRadius: 2 },
      { label: "H1-2026 (IA_01_26)", data: bus.map(function (b) { return b.h126; }), backgroundColor: C.ai, borderRadius: 2 }
    ] }, options: baseOpts({ scales: Object.assign(baseOpts().scales, { y: { min: 80, max: 100, ticks: { callback: function (v) { return v + "%"; } } } }), onClick: function (e, els) { if (els[0]) CA.go("bu/" + bus[els[0].index].id); } }) });
  };
  CA.PROCESS_TREND = { labels: ["H2-24", "H1-25", "H2-25", "H1-26"], series: [["4 Context", [92, 93, 94, 95]], ["5 Leadership", [94, 95, 95, 96]], ["6 Planning", [88, 89, 91, 90]], ["7 Support", [90, 91, 92, 93]], ["8 Operation", [89, 90, 91, 92]], ["9 Evaluation", [91, 92, 93, 94]], ["10 Improvement", [90, 90, 92, 93]]] };
  CA.chartProcess = function (canvas) {
    var cols = ["#2a44c8", "#8a6ad8", "#d08a2c", "#2f9e6e", "#c03d2a", "#5b7cfa", "#6b7489"];
    return mk(canvas, { type: "line", data: { labels: CA.PROCESS_TREND.labels, datasets: CA.PROCESS_TREND.series.map(function (s, i) { return { label: s[0], data: s[1], borderColor: cols[i], backgroundColor: cols[i], tension: .3, pointRadius: 3, borderWidth: 2 }; }).concat([{ label: "Target 90%", data: CA.PROCESS_TREND.labels.map(function () { return 90; }), borderColor: C.ink, borderDash: [5, 4], pointRadius: 0, borderWidth: 1.2 }]) },
      options: baseOpts({ scales: Object.assign(baseOpts().scales, { y: { min: 84, max: 100, ticks: { callback: function (v) { return v + "%"; } } } }) }) });
  };

  // ---------- scoring explainer (reused on dashboard and report) ----------
  CA.scoreCalc = function (id) {
    var W = CA.FACTS.workedExample;
    var d = { sat: W.sat, obs: 2, afi: 0, min: W.min, maj: W.maj };
    return '<section class="card-ca" id="' + id + '"><h2 class="card-title"><i class="bi bi-calculator"></i> How compliance % is calculated ' + CA.src("BRD TPL-59 model") + "</h2>" +
      '<div class="grid g2"><div><table class="table-ca"><thead><tr><th>Result</th><th class="num">Points</th><th class="num">Count</th></tr></thead><tbody>' +
      CA.GRADES.map(function (g) { return "<tr><td>" + esc(g.label) + '<div class="small-muted">' + esc(g.note) + '</div></td><td class="num mono">× ' + g.pts + '</td><td class="num"><input type="number" min="0" max="200" class="form-control form-control-sm text-end" style="width:80px;display:inline-block" value="' + d[g.key] + '" data-input="calc" data-k="' + g.key + '" aria-label="' + esc(g.label) + ' count"></td></tr>'; }).join("") +
      '</tbody></table><p class="small-muted mt-2 mb-0">"Not applicable" and "Not audited" checkpoints are left out of the score.</p></div>' +
      '<div class="grid" style="align-content:start"><span class="small-muted">Audit compliance</span><div class="big-pct" data-calc="pct">92.9%</div><div data-calc="verdict"></div>' +
      '<div class="meter"><div class="fill" data-calc="fill" style="width:92.9%"></div><div class="target" title="90% target"></div></div>' +
      '<div class="formula">Compliance % = earned points ÷ (3 × applicable checkpoints) × 100</div><div class="formula" data-calc="formula"></div>' +
      '<p class="small mb-0"><b>BRD worked example:</b> 47 applicable · 42 Satisfied · 2 Major NC · 1 Minor NC · 2 Observation/AFI → (42×3)+(2×0)+(1×1)+(2×2) = 131 ÷ 141 = <b>92.9%</b>.</p>' +
      '<p class="small-muted mb-0">Organisation figure = simple average across BU audits (source-stated: 93.2% for IA_01_26). A weighted aggregate is not used without product-owner approval.</p>' +
      '<button class="btn btn-soft btn-sm justify-self-start" style="justify-self:start" data-action="calc-reset" data-calc-id="' + id + '">Reset to BRD worked example</button></div></div></section>';
  };
  function recalc(box) {
    var c = {};
    Array.prototype.forEach.call(box.querySelectorAll("[data-input=calc]"), function (i) { var v = parseInt(i.value, 10); c[i.dataset.k] = isNaN(v) || v < 0 ? 0 : Math.min(200, v); });
    var s = CA.score(c);
    var pct = s.pct == null ? null : Math.round(s.pct * 10) / 10;
    box.querySelector("[data-calc=pct]").textContent = pct == null ? "–" : pct.toFixed(1) + "%";
    var fill = box.querySelector("[data-calc=fill]");
    fill.style.width = (pct || 0) + "%"; fill.style.background = pct >= 90 ? "var(--ok)" : pct >= 75 ? "var(--warn)" : "var(--bad)";
    box.querySelector("[data-calc=verdict]").innerHTML = pct == null ? CA.chip("Add at least one checkpoint") : pct >= 90 ? CA.chip("Meets 90% target", "ok") : CA.chip("Below 90% target", "bad");
    box.querySelector("[data-calc=formula]").textContent = "(" + CA.GRADES.map(function (g) { return (c[g.key] || 0) + "×" + g.pts; }).join(" + ") + ") ÷ (3 × " + s.applicable + ") = " + s.earned + " ÷ " + s.max + (pct != null ? " = " + pct.toFixed(1) + "%" : "");
  }
  CA.on("calc", function (el) { recalc(el.closest("section")); });
  CA.on("calc-reset", function (el) {
    var box = document.getElementById(el.dataset.calcId), W = CA.FACTS.workedExample, d = { sat: W.sat, obs: 2, afi: 0, min: W.min, maj: W.maj };
    Array.prototype.forEach.call(box.querySelectorAll("[data-input=calc]"), function (i) { i.value = d[i.dataset.k]; });
    recalc(box);
  });
  CA.mountCalc = function (root) { Array.prototype.forEach.call(root.querySelectorAll("[data-calc=pct]"), function (p) { recalc(p.closest("section")); }); };

  // ---------- management dashboard ----------
  CA.route("dashboard", {
    title: "Management dashboard", roles: "pm la ex be", nav: "dashboard",
    render: function (p, q) {
      var S = CA.S, avg = CA.orgAverage("h126"), cycle = q.cycle || "h126";
      var below = S.bus.filter(function (b) { return b.h126 < 90; });
      var openNC = S.bus.reduce(function (n, b) { return n + b.nc[0] + b.nc[1]; }, 0);
      var overdue = S.cars.filter(function (c) { return CA.carOverdue(c); }).length;
      var cur = S.audits.filter(function (a) { return a.checklist && CA.auditCounts(a).open < CA.checklistItems(a).length; });
      return CA.head({ crumbs: [["Insights"], ["Management dashboard"]], title: "Compliance performance", chips: CA.chip(CA.FACTS.orgAvgCycle + " · H1-2026") + CA.demo("Chart values illustrative"),
        actions: '<div class="btn-group btn-group-sm" role="group" aria-label="Cycle"><a class="btn ' + (cycle === "h126" ? "btn-ink" : "btn-soft") + '" href="#/dashboard">IA_01_26 (H1-2026)</a><a class="btn ' + (cycle === "h127" ? "btn-ink" : "btn-soft") + '" href="#/dashboard?cycle=h127">H1-2027 (in progress)</a></div>' + CA.btn({ text: "Export (simulated)", icon: "download", action: "sim-export" }),
        sub: "Replaces the four charts Q&amp;BE rebuilds by hand each cycle. Click any bar to drill down to a business unit." }) +
        (cycle === "h127" ? h127View(cur) :
        '<div class="grid g5 stagger">' +
        CA.kpi(avg.toFixed(1) + "%", "Organisation compliance (simple average of BU audits)", CA.src("93.2% source-stated"), "accent good") +
        CA.kpi("90%", "Target", CA.src()) +
        CA.kpi((S.bus.length - below.length) + " / " + S.bus.length, "BUs at or above target", CA.demo()) +
        CA.kpi(String(openNC), "Nonconformities raised (Major + Minor)", CA.demo()) +
        CA.kpi(String(overdue), "Overdue corrective actions", CA.demo(), overdue ? "bad" : "") + "</div>" +
        '<div class="grid g2">' +
        '<section class="card-ca"><h2 class="card-title">1 · Business Unit compliance vs 90% target</h2><div class="chart-box"><canvas id="ch-bu" aria-label="BU compliance bar chart"></canvas></div><p class="chart-note mb-0">Red bars are below target. Click a bar to drill down.</p></section>' +
        '<section class="card-ca"><h2 class="card-title">2 · BU-wise NC distribution</h2><div class="chart-box"><canvas id="ch-nc" aria-label="NC distribution stacked bar chart"></canvas></div><p class="chart-note mb-0">Counts by grade per BU (BUs with findings only).</p></section>' +
        '<section class="card-ca"><h2 class="card-title">3 · BU performance, half against half</h2><div class="chart-box"><canvas id="ch-half" aria-label="Half-year comparison chart"></canvas></div><p class="chart-note mb-0">H2-2025 vs H1-2026. History before go-live would come from the Excel migration.</p></section>' +
        '<section class="card-ca"><h2 class="card-title">4 · Process compliance score trend</h2><div class="chart-box"><canvas id="ch-proc" aria-label="Process compliance trend line chart"></canvas></div><p class="chart-note mb-0">By ISO clause group across half-years (illustrative).</p></section></div>' +
        '<section class="card-ca"><h2 class="card-title">Below-target BUs <span class="sp"></span><span class="small-muted">Drill-down</span></h2>' + CA.table([
          { k: "name", label: "Business unit", fmt: function (b) { return CA.link("bu/" + b.id, b.name); } }, { k: "location", label: "Location" }, { k: "h225", label: "H2-2025", num: true, fmt: function (b) { return b.h225.toFixed(1) + "%"; } },
          { k: "h126", label: "H1-2026", num: true, fmt: function (b) { return '<b class="text-danger">' + b.h126.toFixed(1) + "%</b>"; } }, { k: "nc", label: "Major / Minor NC", sort: false, fmt: function (b) { return b.nc[0] + " / " + b.nc[1]; } }
        ], below, { id: "t-below", rowRoute: function (b) { return "bu/" + b.id; } }) + "</section>") +
        '<div class="grid g2">' + CA.scoreCalc("calc-dash") +
        '<section class="card-ca"><h2 class="card-title"><i class="bi bi-stars"></i> Ask about this data ' + CA.future("R2") + '</h2><div class="future-banner"><i class="bi bi-hourglass-split"></i><span>The <b>A12 Insights Copilot</b> (plain-language questions over audit data, answers cite records) is planned for R2 as beta and R3 GA. It is not live in Release 1.</span></div><a class="btn btn-soft btn-sm" style="justify-self:start" href="#/copilot">Preview the planned Copilot panel</a></section></div>';
    },
    mount: function (root, p, q) {
      if (!q.cycle || q.cycle === "h126") { CA.chartBU(root.querySelector("#ch-bu"), "h126"); CA.chartNC(root.querySelector("#ch-nc")); CA.chartHalf(root.querySelector("#ch-half")); CA.chartProcess(root.querySelector("#ch-proc")); }
      CA.mountCalc(root);
    }
  });
  function h127View(cur) {
    var rows = CA.S.audits.map(function (a) { var c = CA.auditCounts(a), s = CA.score(c); return { id: a.id, title: a.title, status: a.report ? "Report: " + a.report.state : a.checklist ? "Fieldwork" : a.status, pct: s.applicable ? s.pct : null, open: c.open, bu: a.bu }; });
    var scored = rows.filter(function (r) { return r.pct != null; });
    var avg = scored.length ? scored.reduce(function (n, r) { return n + r.pct; }, 0) / scored.length : null;
    return '<div class="info-banner"><i class="bi bi-info-circle"></i><span>H1-2027 is live demo data: scores are calculated from fieldwork results you record in this prototype, with the same formula. Only audits with at least one graded checkpoint are averaged.</span></div>' +
      '<div class="grid g4 stagger">' + CA.kpi(avg == null ? "–" : avg.toFixed(1) + "%", "Average of scored H1-2027 audits", CA.demo("Live demo calculation"), "accent") + CA.kpi("90%", "Target", CA.src()) + CA.kpi(scored.length + " / " + rows.length, "Audits with results", CA.demo()) + CA.kpi(String(CA.S.findings.filter(function (f) { return f.audit.indexOf("IA-2027") === 0; }).length), "H1-2027 findings", CA.demo()) + "</div>" +
      '<section class="card-ca"><h2 class="card-title">H1-2027 audits</h2>' + CA.table([
        { k: "id", label: "Audit", fmt: function (r) { return CA.idLink("audit/" + r.id, r.id); } }, { k: "title", label: "Title" }, { k: "status", label: "Status", fmt: function (r) { return CA.chip(r.status); } },
        { k: "pct", label: "Compliance", num: true, fmt: function (r) { return r.pct == null ? '<span class="small-muted">not scored</span>' : r.pct.toFixed(1) + "%"; } }
      ], rows, { id: "t-h127", rowRoute: function (r) { return "audit/" + r.id; } }) + "</section>";
  }
  CA.on("sim-export", function () { CA.toast("Export generated (simulated). In production this would produce Excel / PowerPoint via the document service.", "info"); });

  // ---------- BU drill-down ----------
  CA.route("bu/:id", {
    title: function (p) { var b = CA.bu(p.id); return b ? b.name : "BU"; }, roles: "pm la ex be ad ae", nav: "dashboard",
    render: function (p) {
      var b = CA.bu(p.id);
      if (!b) return CA.empty("question-circle", "Unknown business unit", esc(p.id));
      var S = CA.S, audits = S.audits.filter(function (a) { return a.bu === b.id; }), fs = S.findings.filter(function (f) { return f.bu === b.id; }), cs = S.cars.filter(function (c) { return c.bu === b.id; });
      return CA.head({ crumbs: [["Insights"], ["Dashboard", "dashboard"], [b.name]], title: b.name + " · " + b.location, chips: CA.chip(b.id) + CA.demo("Illustrative BU record") }) +
        '<div class="grid g4 stagger">' + CA.kpi(b.h126.toFixed(1) + "%", "IA_01_26 compliance", CA.demo(), b.h126 < 90 ? "bad" : "good") + CA.kpi(b.h225.toFixed(1) + "%", "H2-2025 compliance", CA.demo()) + CA.kpi((b.h126 - b.h225 >= 0 ? "+" : "") + (b.h126 - b.h225).toFixed(1) + " pts", "Half-on-half change") + CA.kpi(b.nc[0] + " / " + b.nc[1] + " / " + b.nc[2] + " / " + b.nc[3], "Major / Minor / Obs / AFI") + "</div>" +
        '<div class="grid g2"><section class="card-ca"><h2 class="card-title">Audits</h2>' + (audits.length ? '<div class="list-ca">' + audits.map(function (a) { return '<a class="li-ca" href="#/audit/' + a.id + '"><span class="sp"><span class="mono">' + a.id + "</span><small>" + esc(a.title) + "</small></span>" + CA.chip(a.report ? a.report.state : a.status) + "</a>"; }).join("") + "</div>" : '<p class="small-muted">No H1-2027 audits.</p>') +
        '<p class="small-muted mb-0">Earlier cycles: see Reports for issued audit reports.</p></section>' +
        '<section class="card-ca"><h2 class="card-title">Findings &amp; corrective actions</h2>' + (fs.length ? '<div class="list-ca">' + fs.map(function (f) { var car = f.car ? CA.car(f.car) : null; return '<a class="li-ca" href="#/finding/' + f.id + '"><span class="sp"><span class="mono">' + f.id + "</span> · clause " + esc(f.clause) + "<small>" + esc(f.statement) + "</small></span>" + CA.gradeChip(f.grade) + (car ? CA.chip(car.state) : "") + "</a>"; }).join("") + "</div>" : '<p class="small-muted mb-0">No findings recorded in the demo for this BU.</p>') +
        (cs.length ? "" : "") + "</section></div>" +
        '<section class="card-ca fill"><h2 class="card-title">Profile</h2><dl class="row mb-0 small"><dt class="col-sm-3">Country / location</dt><dd class="col-sm-9">' + esc(b.country + " · " + b.location) + '</dd><dt class="col-sm-3">Processes</dt><dd class="col-sm-9">' + esc(b.processes) + '</dd><dt class="col-sm-3">BU manager</dt><dd class="col-sm-9">' + esc(b.manager) + ' (fictional)</dd><dt class="col-sm-3">Standards</dt><dd class="col-sm-9">' + esc(b.standards.join(", ")) + "</dd></dl></section>";
    }
  });

  // ---------- standard reports ----------
  var STD_REPORTS = [
    ["programme", "Programme status", "Slots by status, invites, completion against the cycle plan."],
    ["register", "Findings register", "All findings with grade, owner, CAR and repeat flags."],
    ["utilisation", "Auditor utilisation", "Assignments per auditor this cycle, hours and standards."],
    ["mr", "Management review pack", "Headline compliance, NC trends, overdue actions and effectiveness results."]
  ];
  CA.route("std-reports", {
    title: "Standard reports", roles: "pm ex be", nav: "std-reports",
    render: function () {
      return CA.head({ crumbs: [["Insights"], ["Standard reports"]], title: "Standard reports", chips: CA.sim("Generation simulated"), sub: "Pre-built reports. In production the document service renders Word / PDF / PowerPoint; here a preview is built in the browser." }) +
        '<div class="grid g2">' + STD_REPORTS.map(function (r) { return '<section class="card-ca"><h2 class="card-title"><i class="bi bi-file-earmark-bar-graph"></i> ' + esc(r[1]) + '</h2><p class="small muted mb-0">' + esc(r[2]) + '</p><div class="d-flex gap-2"><button class="btn btn-ink btn-sm" data-action="std-report" data-r="' + r[0] + '">Generate preview</button><button class="btn btn-soft btn-sm" data-action="sim-export">Download (simulated)</button></div></section>'; }).join("") + "</div>";
    }
  });
  CA.on("std-report", function (el) {
    var S = CA.S, r = el.dataset.r, body;
    if (r === "programme") { var by = {}; S.slots.forEach(function (s) { by[s.status] = (by[s.status] || 0) + 1; }); body = '<table class="table-ca"><thead><tr><th>Status</th><th class="num">Slots</th></tr></thead><tbody>' + Object.keys(by).map(function (k) { return "<tr><td>" + esc(k) + '</td><td class="num">' + by[k] + "</td></tr>"; }).join("") + "</tbody></table><p class=\"small-muted mt-2\">Cycle plan: " + esc(S.cyclePlan.status) + "</p>"; }
    else if (r === "register") body = '<table class="table-ca"><thead><tr><th>ID</th><th>BU</th><th>Clause</th><th>Grade</th><th>Status</th></tr></thead><tbody>' + S.findings.map(function (f) { return '<tr><td class="mono">' + f.id + "</td><td>" + esc(CA.bu(f.bu).name) + "</td><td>" + esc(f.clause) + "</td><td>" + CA.gradeChip(f.grade) + "</td><td>" + esc(f.status) + "</td></tr>"; }).join("") + "</tbody></table>";
    else if (r === "utilisation") body = '<table class="table-ca"><thead><tr><th>Auditor</th><th class="num">H1-2027 slots</th><th class="num">Minutes</th></tr></thead><tbody>' + S.auditors.map(function (a) { var sl = S.slots.filter(function (s) { return s.auditor === a.id; }); return "<tr><td>" + esc(a.name) + '</td><td class="num">' + sl.length + '</td><td class="num">' + sl.reduce(function (n, s) { return n + s.mins; }, 0) + "</td></tr>"; }).join("") + "</tbody></table>";
    else body = '<ul class="small"><li>Organisation compliance IA_01_26: <b>93.2%</b> vs 90% target (source-stated)</li><li>BUs at or above target: 17 / 19 (illustrative)</li><li>Open corrective actions: ' + S.cars.filter(function (c) { return c.state !== "Closed"; }).length + "</li><li>Effectiveness reviews pending: " + S.cars.filter(function (c) { return c.state === "Effectiveness review"; }).length + "</li></ul>";
    CA.log("Generated", "Standard report", el.closest("section").querySelector("h2").textContent.trim() + " (simulated)");
    CA.modal({ title: "Preview · " + esc(el.closest("section").querySelector("h2").textContent), body: '<div class="watermark mb-2">PROTOTYPE PREVIEW · ILLUSTRATIVE DATA</div>' + body, cancelText: "Close", size: "modal-lg" });
  });
})(window.CA);
