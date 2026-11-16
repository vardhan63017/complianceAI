/* App shell: login, top bar, role-aware sidebar, guided demo, global event delegation. */
(function (CA) {
  var esc = CA.esc;
  var ALL = "pm la au ae be ex ad";

  // Sidebar: the 43 wireframe screens grouped as in compliance-ai-wireframe.html, plus prototype guide pages.
  CA.NAV = [
    ["Home", [["home", "Home dashboard", "house", ALL], ["tasks", "My tasks", "check2-square", ALL]]],
    ["Plan", [["programmes", "Programmes", "kanban", "pm be ex"], ["coverage", "Clause coverage", "grid-3x3-gap", "pm be"], ["cycle", "Cycle plan builder", "calendar-week", "pm"], ["calendar", "Audit calendar", "calendar3", "pm la au"]]],
    ["Audits", [["audits", "My audits", "clipboard-check", "pm la au"], ["findings", "Findings register", "flag", "pm la au be"], ["reports", "Reports", "file-earmark-text", "pm la ae ex be"], ["distribution", "Distribution & archive", "archive", "pm la be"], ["external-portal", "External auditor portal", "person-badge", "pm be", "R2"]]],
    ["Actions", [["cars", "Corrective actions", "tools", "pm la au ae"], ["effectiveness", "Effectiveness checks", "patch-check", "pm la au"], ["overdue", "Overdue board", "alarm", "pm ex be"]]],
    ["Library", [["org", "Organisation & sectors", "diagram-3", "ad pm be"], ["locations", "Locations & BUs", "geo-alt", "ad pm be"], ["universe", "Universe register", "globe2", "ad pm be"], ["standards", "Standards library", "journal-bookmark", "pm la be ad"], ["crosswalk", "Edition crosswalk", "arrow-left-right", "be pm la"], ["checkpoints", "Baseline checkpoints", "list-check", "be pm"], ["templates", "Checklist templates", "files", "pm la be"], ["auditors", "Auditor directory", "people", "pm be la"], ["obligations", "Obligation register", "bank", "be pm", "R2"], ["qualification", "Qualification assessment", "speedometer2", "be pm", "R2"]]],
    ["Insights", [["dashboard", "Management dashboard", "bar-chart-line", "pm la ex be"], ["std-reports", "Standard reports", "table", "pm ex be"], ["copilot", "Insights Copilot", "chat-square-text", "pm ex be", "R2"]]],
    ["Admin", [["admin/lists", "Lists & scoring", "sliders", "ad be"], ["admin/sla", "SLAs & notifications", "bell", "ad pm"], ["admin/users", "Users & access", "person-gear", "ad"], ["admin/ai", "AI settings", "cpu", "ad be"], ["admin/trail", "Audit trail", "clock-history", "ad be pm"], ["admin/import", "Data import", "upload", "ad"], ["admin/tenant", "Tenant console", "buildings", "ad", "R3"]]],
    ["Prototype guide", [["lifecycle", "Audit lifecycle", "arrow-repeat", ALL], ["agents", "AI agents (12)", "stars", ALL], ["outside", "Teams & Outlook", "chat-dots", ALL], ["roadmap", "Release roadmap", "signpost-split", ALL], ["inventory", "Screen inventory", "grid", ALL]]]
  ];
  CA.ALL = ALL;

  // ---------- guided demo (brief §12, 18 steps) ----------
  function salesCar() { return CA.S.cars.filter(function (c) { return c.finding && c.finding.indexOf("F-IA-2027-001-") === 0; })[0]; }
  function salesFinding() { return CA.S.findings.filter(function (f) { return f.audit === "IA-2027-001"; })[0]; }
  CA.GUIDE = [
    { t: "Sign in → Dashboard", r: "pm", to: "home", hint: "Sign-in is simulated. Each role lands on a dashboard tailored to it." },
    { t: "Audit Universe", r: "pm", to: "universe", hint: "The master register: countries, locations, BUs, processes and their standards. Try Add BU." },
    { t: "Standards Library", r: "be", to: "standards", hint: "Standards named in the BRD, editions, licence status and the ISO 9001:2015 → 2026 delta." },
    { t: "Scope & applicability", r: "la", to: "audit/IA-2027-001/scope", hint: "Define scope. A03 proposes applicability with a reason; confirm or override. Nothing is excluded silently." },
    { t: "AI Checklist Builder", r: "la", to: "audit/IA-2027-001/checklist", hint: "Audit details and prior findings feed the checklist." },
    { t: "Generate checklist", r: "la", to: "audit/IA-2027-001/checklist", hint: "Press Generate checklist. The AI is simulated and returns deterministic sample suggestions." },
    { t: "Review & approve checklist", r: "la", to: "audit/IA-2027-001/checklist", hint: "Accept, edit or reject each suggestion, then Approve checklist. Your name and time are logged." },
    { t: "Audit Programme", r: "pm", to: "programmes", hint: "Submit PRG-2027 for review. Approval needs the BE Manager (use the lock button to switch)." },
    { t: "Build the cycle plan", r: "pm", to: "cycle", hint: "A05 proposed auditors and slots. Resolve the impartiality flag on HR; edit any slot." },
    { t: "Publish schedule", r: "pm", to: "cycle", hint: "Publish & send invites. Outlook / Teams invitations are simulated." },
    { t: "Open the audit record", r: "la", to: "audit/IA-2027-001", hint: "One record per audit: scope, agenda, team, checklist and status timeline." },
    { t: "Fieldwork", r: "au", to: "audit/IA-2027-001/fieldwork", hint: "Record a result and note per question; attach a sample file (only the filename is kept)." },
    { t: "Raise finding → confirm grade", r: "la", to: function () { var f = salesFinding(); return f ? "finding/" + f.id : "audit/IA-2027-001/findings"; }, hint: "Raise a finding on 8.2.3. A07 drafts wording and a grade; the Lead Auditor confirms." },
    { t: "Create CAR → root cause", r: "ae", to: function () { var c = salesCar(), f = salesFinding(); return c ? "car/" + c.id : f ? "finding/" + f.id : "cars"; }, hint: "Auditee acknowledges the finding (opens CAR-2027-0001), then enters correction, root cause and action." },
    { t: "Evidence → auditor review", r: "au", to: function () { var c = salesCar(); return c ? "car/" + c.id + "/review" : "cars"; }, hint: "Auditor accepts or returns the plan, then verifies implementation evidence." },
    { t: "Effectiveness review", r: "la", to: function () { var c = salesCar(); return c ? "effectiveness/" + c.id : "effectiveness"; }, hint: "60–90 days later: Effective / Not effective / Reopen. Submitted ≠ effective." },
    { t: "Generate & issue report", r: "la", to: "audit/IA-2027-001/report", hint: "Draft → technical review → approval → issued & archived. Distribution is simulated." },
    { t: "Management dashboard", r: "ex", to: "dashboard", hint: "93.2% org average vs the 90% target. Click a bar to drill down to a BU." }
  ];
  function applyGuide() {
    var g = CA.GUIDE[CA.S.guide.step];
    CA.S.session.role = g.r;
    CA.store.save();
    CA.go(typeof g.to === "function" ? g.to() : g.to);
  }
  CA.on("guide-start", function () { CA.S.guide = { on: true, step: 0 }; applyGuide(); });
  CA.on("guide-next", function () { if (CA.S.guide.step < CA.GUIDE.length - 1) { CA.S.guide.step++; applyGuide(); } });
  CA.on("guide-prev", function () { if (CA.S.guide.step > 0) { CA.S.guide.step--; applyGuide(); } });
  CA.on("guide-jump", function (el) { CA.S.guide = { on: true, step: +el.dataset.step }; applyGuide(); });
  CA.on("guide-exit", function () { CA.S.guide.on = false; CA.store.save(); CA.render(); });
  CA.on("guide-list", function () {
    CA.modal({
      title: "Guided demo · 18 steps", cancelText: "Close",
      body: '<p class="small-muted">Follows one illustrative audit: Sales BU, Dubai, ISO 9001:2026, H1-2027 IQA1, IA-2027-001. Each step switches to the role that does the work.</p><div class="list-ca">' +
        CA.GUIDE.map(function (g, i) { return '<button type="button" class="li-ca text-start" data-action="guide-jump" data-step="' + i + '" data-bs-dismiss="modal"><span class="mono" style="width:28px">' + (i + 1) + '</span><span class="sp">' + esc(g.t) + "<small>" + esc(CA.ROLES[g.r].label) + "</small></span></button>"; }).join("") + "</div>"
    });
  });

  function guideBar() {
    var g = CA.S.guide;
    if (!g.on) return "";
    var s = CA.GUIDE[g.step];
    return '<div class="guide-bar no-print" role="region" aria-label="Guided demo"><span class="step-n">GUIDED DEMO · STEP ' + (g.step + 1) + " / " + CA.GUIDE.length + "</span><b>" + esc(s.t) + '</b><span class="hint">' + esc(s.hint) + '</span><span class="sp"></span>' +
      '<button class="btn btn-sm btn-outline-light" data-action="guide-list"><i class="bi bi-list-ol"></i> All steps</button>' +
      '<button class="btn btn-sm btn-outline-light" data-action="guide-prev"' + (g.step === 0 ? " disabled" : "") + '>← Back</button>' +
      (g.step < CA.GUIDE.length - 1 ? '<button class="btn btn-sm btn-light" data-action="guide-next">Next step →</button>' : '<button class="btn btn-sm btn-light" data-action="guide-exit">Finish</button>') +
      '<button class="btn btn-sm btn-link text-white" data-action="guide-exit" aria-label="Exit guided demo"><i class="bi bi-x-lg"></i></button>' +
      '<div class="guide-progress"><i style="width:' + ((g.step + 1) / CA.GUIDE.length * 100) + '%"></i></div></div>';
  }

  // ---------- login ----------
  function loginView() {
    var words = "One system for every ISO audit, with".split(" ");
    var h = words.map(function (w, i) { return '<span class="reveal-word" style="animation-delay:' + (i * 0.06) + 's">' + esc(w) + "</span>"; }).join(" ");
    return '<div class="login-wrap"><section class="login-art" aria-label="About Compliance AI"><div class="login-grid"></div><div class="login-glow"></div>' +
      '<div style="position:relative" class="brand text-white"><span class="brand-mark" style="background:#fff;color:#0f1630"><i class="bi bi-shield-check"></i></span><span>Compliance AI<small style="color:#aab3cc">INTERTEC SYSTEMS · Q&amp;BE</small></span></div>' +
      '<div style="position:relative;display:grid;gap:16px"><h1>' + h + ' <span class="reveal-word" style="animation-delay:.45s"><em>AI that drafts</em></span> <span class="reveal-word" style="animation-delay:.55s">and people who decide.</span></h1>' +
      "<p>Interactive prototype of the audit-management product: universe, standards, AI-tailored checklists, planning, fieldwork, findings, reports, corrective actions and dashboards — one governed record.</p></div>" +
      '<div class="login-facts"><div><b>~19</b><span>BUs · UAE, Bahrain, KSA, Oman</span></div><div><b>12</b><span>AI agents, all human-approved</span></div><div><b>26 Apr 2027</b><span>R1 planned go-live</span></div></div></section>' +
      '<section class="login-form"><form class="login-card" data-form="login" novalidate>' +
      '<div><h2 class="mb-1" style="font-size:1.5rem">Sign in</h2><p class="small-muted mb-0">Prototype for stakeholder demonstration. Not production.</p></div>' +
      '<div class="sim-banner"><i class="bi bi-plug"></i><span><b>Simulated sign-in.</b> No Entra ID / SSO call is made. Pick a demo role; password is <code>demo</code>.</span></div>' +
      CA.field({ name: "role", label: "Demo role", type: "select", value: "pm", options: Object.keys(CA.ROLES).map(function (k) { return [k, CA.ROLES[k].label]; }) }) +
      CA.field({ name: "email", label: "Email", type: "email", value: CA.ROLES.pm.email, required: true, invalid: "Enter a valid email address." }) +
      CA.field({ name: "password", label: "Password", type: "password", value: "", required: true, placeholder: "demo", invalid: "Password is required (use: demo)." }) +
      '<div class="d-flex justify-content-between align-items-center"><div class="form-check"><input class="form-check-input" type="checkbox" name="remember" id="f-remember" checked><label class="form-check-label small" for="f-remember">Remember me</label></div><a href="#/home" data-action="forgot" class="small">Forgot password?</a></div>' +
      '<div id="login-err" class="text-danger small" role="alert"></div>' +
      '<button class="btn btn-ink py-2" type="submit"><i class="bi bi-box-arrow-in-right"></i> Sign in</button>' +
      '<button class="btn btn-ai py-2" type="button" data-action="login-guided"><i class="bi bi-play-circle"></i> Sign in and start the guided demo</button>' +
      '<details class="small-muted"><summary>Demo credentials</summary><table class="table-ca mt-2"><tbody>' + Object.keys(CA.ROLES).map(function (k) { return "<tr><td>" + esc(CA.ROLES[k].label) + '</td><td class="mono">' + esc(CA.ROLES[k].email) + "</td></tr>"; }).join("") + '</tbody></table><p class="mt-2 mb-0">Password for all: <code>demo</code>. Names are fictional.</p></details>' +
      "</form></section></div>";
  }
  function doLogin(form, guided) {
    var d = CA.formData(form), err = form.querySelector("#login-err");
    if (!guided && d.password !== "demo") { err.textContent = "Incorrect password. This is a demo: use the password \"demo\"."; return; }
    CA.S.session = { role: d.role || "pm", remember: !!d.remember };
    CA.log("Signed in", "Session", "Simulated sign-in as " + CA.ROLES[CA.S.session.role].label);
    if (guided) { CA.S.guide = { on: true, step: 0 }; }
    CA.store.save();
    CA.toast("Signed in as " + esc(CA.me().user) + " · " + esc(CA.me().label) + " (simulated)");
    CA.go("home");
  }
  CA.onForm("login", function (form) { doLogin(form, false); });
  CA.on("login-guided", function (el) { var f = el.closest("form"); f.querySelector("[name=password]").value = "demo"; doLogin(f, true); });
  CA.on("forgot", function (el, ev) { ev.preventDefault(); CA.modal({ title: "Reset password", body: '<div class="sim-banner"><i class="bi bi-plug"></i><span>Simulated. Production uses Microsoft Entra ID single sign-on, so password reset is handled by your Microsoft account. No email is sent.</span></div>', cancelText: "Close" }); });
  CA.on("login-role", function (el) { var f = el.closest("form"); f.querySelector("[name=email]").value = CA.ROLES[el.value].email; });

  // ---------- top bar ----------
  function topbar() {
    var me = CA.me(), role = CA.role();
    var notes = CA.S.notifications.filter(function (n) { return n.roles.split(" ").indexOf(role) > -1; });
    return '<header class="topbar no-print"><button class="icon-btn nav-toggle" data-action="nav-toggle" aria-label="Open menu"><i class="bi bi-list"></i></button>' +
      '<a class="brand" href="#/home"><span class="brand-mark"><i class="bi bi-shield-check"></i></span><span>Compliance AI<small>INTERTEC · PROTOTYPE</small></span></a>' +
      '<div class="global-search" role="search"><i class="bi bi-search"></i><input class="form-control" id="gsearch" type="search" placeholder="Search audits, findings, CARs, BUs…" aria-label="Global search" data-input="search" autocomplete="off"><div class="search-results d-none" id="search-results"></div></div>' +
      '<span class="sp"></span><span class="demo-date" title="Fixed demo clock used for SLA and overdue illustration"><i class="bi bi-clock"></i> Demo date ' + CA.d(CA.DEMO_TODAY) + "</span>" +
      '<div class="dropdown"><button class="icon-btn" data-bs-toggle="dropdown" aria-label="Notifications (' + notes.length + ')" aria-expanded="false"><i class="bi bi-bell"></i>' + (notes.length ? '<span class="dot">' + notes.length + "</span>" : "") + '</button><div class="dropdown-menu dropdown-menu-end notif-menu"><h6 class="dropdown-header">Notifications · ' + esc(me.label) + "</h6>" +
      (notes.length ? notes.map(function (n) { return '<a class="dropdown-item" href="#/' + n.route + '">' + esc(n.text) + "<small>In-app notification (Teams / email copies simulated)</small></a>"; }).join("") : '<span class="dropdown-item-text small-muted">Nothing new.</span>') + "</div></div>" +
      '<button class="icon-btn" data-action="help" aria-label="Help"><i class="bi bi-question-lg"></i></button>' +
      '<label class="role-switch" for="role-select"><span>Viewing as</span><select class="form-select form-select-sm" id="role-select" data-change="role-switch" title="Role switching is a visual simulation, not real security">' +
      Object.keys(CA.ROLES).map(function (k) { return '<option value="' + k + '"' + (k === role ? " selected" : "") + ">" + esc(CA.ROLES[k].label) + "</option>"; }).join("") + "</select></label>" +
      '<div class="dropdown"><button class="icon-btn" data-bs-toggle="dropdown" aria-label="User menu" aria-expanded="false"><i class="bi bi-person"></i></button><div class="dropdown-menu dropdown-menu-end">' +
      '<span class="dropdown-item-text"><b>' + esc(me.user) + '</b><br><span class="small-muted">' + esc(me.label) + "</span></span><hr class=\"dropdown-divider\">" +
      '<button class="dropdown-item" data-action="guide-start"><i class="bi bi-play-circle"></i> Start guided demo</button>' +
      '<button class="dropdown-item" data-action="reset-demo"><i class="bi bi-arrow-counterclockwise"></i> Reset demo data</button>' +
      '<button class="dropdown-item" data-action="logout"><i class="bi bi-box-arrow-right"></i> Sign out</button></div></div></header>';
  }
  function sidebar(cur) {
    var role = CA.role();
    var openCars = CA.S.cars.filter(function (c) { return c.state !== "Closed"; }).length;
    return '<nav class="sidebar no-print" aria-label="Main menu">' + CA.NAV.map(function (g) {
      var items = g[1].filter(function (i) { return i[3].split(" ").indexOf(role) > -1; });
      if (!items.length) return "";
      return '<div class="nav-group"><span class="label">' + esc(g[0]) + "</span>" + items.map(function (i) {
        var active = cur === i[0] ? ' aria-current="page"' : "";
        var extra = i[4] ? '<span class="rel">' + i[4] + "</span>" : i[0] === "cars" ? '<span class="cnt">' + openCars + "</span>" : "";
        return '<a class="nav-link-ca" href="#/' + i[0] + '"' + active + '><i class="bi bi-' + i[2] + '"></i>' + esc(i[1]) + extra + "</a>";
      }).join("") + "</div>";
    }).join("") + '<div class="info-banner mt-3" style="font-size:.76rem"><i class="bi bi-info-circle"></i><span>Frontend-only prototype. All data is illustrative unless marked source-stated. Integrations and AI are simulated.</span></div></nav>';
  }
  function accessDenied(route) {
    var allowed = route.roles.split(" ");
    return '<div class="page">' + CA.head({ crumbs: [["Home", "home"]], title: "Not available for this role" }) +
      '<div class="card-ca">' + CA.empty("shield-lock", "The " + CA.me().label + " role does not see this screen", "Role-based navigation is simulated for the demo. This screen is used by: " + esc(allowed.map(function (r) { return CA.ROLES[r].label; }).join(", ")) + ".",
        '<div class="d-flex gap-2 flex-wrap justify-content-center">' + allowed.slice(0, 3).map(function (r) { return '<button class="btn btn-soft btn-sm" data-action="switch-role" data-role="' + r + '">View as ' + esc(CA.ROLES[r].label) + "</button>"; }).join("") + "</div>") + "</div></div>";
  }

  // ---------- render ----------
  CA.charts = [];
  CA.render = function (navigated) {
    var root = document.getElementById("app");
    CA.charts.forEach(function (c) { try { c.destroy(); } catch (e) {} });
    CA.charts = [];
    var h = CA.parseHash();
    if (!CA.S.session) {
      root.innerHTML = loginView();
      document.title = "Sign in · Compliance AI prototype";
      return;
    }
    var m = CA.match(h.path);
    var html, route = m && m.route;
    if (!m) html = '<div class="page">' + CA.head({ crumbs: [["Home", "home"]], title: "Page not found" }) + '<div class="card-ca">' + CA.empty("signpost", "No screen at #/" + esc(h.path), "Use the menu or go back to the dashboard.", '<a class="btn btn-ink btn-sm" href="#/home">Go to Home</a>') + "</div></div>";
    else if (route.roles !== ALL && route.roles.split(" ").indexOf(CA.role()) === -1) html = accessDenied(route);
    else {
      try { html = '<div class="page">' + route.render(m.params, h.query) + "</div>"; }
      catch (e) { console.error(e); html = '<div class="page"><div class="card-ca">' + CA.empty("bug", "This screen could not render", esc(e.message)) + "</div></div>"; }
    }
    var scrollY = window.scrollY;
    root.innerHTML = topbar() + guideBar() + '<div class="shell">' + sidebar(route && route.nav ? route.nav : h.path) + '<main class="main" id="main" tabindex="-1">' + html + "</main></div>";
    var main = document.getElementById("main");
    if (navigated) { main.firstElementChild && main.firstElementChild.classList.add("page-enter"); window.scrollTo(0, 0); document.body.classList.remove("nav-open"); }
    else window.scrollTo(0, scrollY);
    document.title = (route ? (typeof route.title === "function" ? route.title(m.params) : route.title) : "Not found") + " · Compliance AI prototype";
    if (route && route.mount && html.indexOf("Not available for this role") === -1) route.mount(main, m.params, h.query);
    CA.animateCounters(main);
  };

  // ---------- global actions ----------
  CA.on("role-switch", function (el) { switchRole(el.value); });
  CA.on("switch-role", function (el) { switchRole(el.dataset.role); });
  function switchRole(r) {
    CA.S.session.role = r;
    CA.store.save();
    CA.toast("Now viewing as " + esc(CA.ROLES[r].label) + " · " + esc(CA.ROLES[r].user) + " (role switch is simulated)", "info");
    CA.render();
  }
  CA.on("need-role", function (el) {
    var r = el.dataset.role;
    CA.confirm("Needs a different role", "This action is done by the <b>" + esc(CA.ROLES[r].label) + "</b> in the workflow. Switch to that role to continue? <br><span class=\"small-muted\">Demo role switching is a visual simulation, not real permission control.</span>", "Switch to " + esc(CA.ROLES[r].label), function () { switchRole(r); });
  });
  CA.on("logout", function () { CA.log("Signed out", "Session", ""); CA.S.session = null; CA.S.guide.on = false; CA.store.save(); location.hash = "#/home"; CA.render(); });
  CA.on("reset-demo", function () { CA.confirm("Reset demo data?", "All changes you made in this browser are discarded and the seed data is restored.", "Reset", function () { CA.store.reset(); CA.toast("Demo data reset", "info"); CA.go("home"); }, "btn-danger-soft"); });
  CA.on("nav-toggle", function () { document.body.classList.toggle("nav-open"); });
  CA.on("help", function () {
    CA.modal({
      title: "How to read this prototype", cancelText: "Close", okText: "Start guided demo", onOk: function () { CA.actions["guide-start"](); },
      body: '<div class="grid gap-2">' +
        '<div class="ai-box"><span class="ai-tag"><i class="bi bi-stars"></i> Simulated AI suggestion</span><span class="small">Blue dashed panels are AI drafts waiting for a person. Nothing changes a compliance record until a named person accepts it.</span></div>' +
        '<div class="ai-box approved"><span class="human-tag"><i class="bi bi-person-check"></i> Human-approved record</span><span class="small">Green-edged panels are reviewed / approved records, stamped with who and when.</span></div>' +
        "<div>" + CA.sim() + ' <span class="small">No real system call (Entra ID, Outlook, Teams, SharePoint, LLM).</span></div>' +
        "<div>" + CA.demo() + ' <span class="small">Invented values.</span> ' + CA.src() + ' <span class="small">From the source documents.</span></div>' +
        "<div>" + CA.future("R2") + ' <span class="small">Not in Release 1; preview only.</span></div>' +
        '<p class="small-muted mb-0">Rules decide workflow states, due dates, escalations, permissions and the compliance score. AI only drafts and suggests.</p></div>'
    });
  });

  // global search
  CA.on("search", function (el) {
    var q = el.value.trim().toLowerCase(), box = document.getElementById("search-results");
    if (q.length < 2) { box.classList.add("d-none"); return; }
    var S = CA.S, res = [];
    S.audits.forEach(function (a) { if ((a.id + " " + a.title).toLowerCase().indexOf(q) > -1) res.push(["Audit", a.id + " · " + a.title, "audit/" + a.id]); });
    S.findings.forEach(function (f) { if ((f.id + " " + f.statement + " " + f.clause).toLowerCase().indexOf(q) > -1) res.push(["Finding", f.id + " · " + f.statement, "finding/" + f.id]); });
    S.cars.forEach(function (c) { if ((c.id + " " + c.finding).toLowerCase().indexOf(q) > -1) res.push(["CAR", c.id + " · " + c.state, "car/" + c.id]); });
    S.bus.forEach(function (b) { if ((b.name + " " + b.location + " " + b.id).toLowerCase().indexOf(q) > -1) res.push(["BU", b.name + " · " + b.location, "bu/" + b.id]); });
    S.auditors.forEach(function (a) { if (a.name.toLowerCase().indexOf(q) > -1) res.push(["Auditor", a.name, "auditor/" + a.id]); });
    S.standards.forEach(function (s) { if ((s.code + " " + s.edition + " " + s.name).toLowerCase().indexOf(q) > -1) res.push(["Standard", s.code + ":" + s.edition, "standards"]); });
    box.innerHTML = res.length ? res.slice(0, 12).map(function (r) { return '<a href="#/' + r[2] + '"><span class="type">' + r[0] + "</span><span>" + esc(r[1]) + "</span></a>"; }).join("") : '<div class="p-3 small-muted">No matches for "' + esc(q) + '"</div>';
    box.classList.remove("d-none");
  });
  document.addEventListener("click", function (e) {
    var box = document.getElementById("search-results");
    if (box && !e.target.closest(".global-search")) box.classList.add("d-none");
  });

  // ---------- delegation ----------
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-action]");
    if (!el) return;
    var fn = CA.actions[el.dataset.action];
    if (!fn) return;
    if (el.tagName === "A" && el.dataset.action !== "go") e.preventDefault();
    fn(el, e);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var el = e.target.closest("th.sortable, tr.clickable");
    if (el && e.target === el) { e.preventDefault(); el.click(); }
    if (e.key === "Escape") document.body.classList.remove("nav-open");
  });
  document.addEventListener("submit", function (e) {
    var form = e.target.closest("form[data-form]");
    if (!form) return;
    e.preventDefault();
    var skip = e.submitter && e.submitter.hasAttribute("formnovalidate");
    if (!skip && !form.checkValidity()) {
      form.classList.add("was-validated");
      var bad = form.querySelector(":invalid");
      if (bad) bad.focus();
      CA.toast("Please complete the required fields.", "warn");
      return;
    }
    var fn = CA.forms[form.dataset.form];
    if (fn) fn(form, CA.formData(form), e.submitter);
  });
  document.addEventListener("change", function (e) {
    var el = e.target.closest("[data-change]");
    if (el && CA.actions[el.dataset.change]) CA.actions[el.dataset.change](el, e);
  });
  document.addEventListener("input", function (e) {
    var el = e.target.closest("[data-input]");
    if (el && CA.actions[el.dataset.input]) CA.actions[el.dataset.input](el, e);
  });

  // ---------- boot ----------
  document.addEventListener("DOMContentLoaded", function () {
    CA.store.load();
    if (CA.S.session && CA.S.session.remember === false) { /* still keep session within the tab for the demo */ }
    CA.render(true);
    // login role select → email autofill
    document.addEventListener("change", function (e) { if (e.target.id === "f-role") CA.actions["login-role"](e.target); });
  });
})(window.CA);
