/* Library: organisation, locations & BUs, universe register, standards, crosswalk,
   baseline checkpoints, checklist templates, auditor directory & profile. */
(function (CA) {
  var esc = CA.esc;
  CA.ui = CA.ui || {};
  var COPYRIGHT = '<div class="info-banner"><i class="bi bi-c-circle"></i><span><b>ISO standards are copyrighted.</b> This prototype shows clause identifiers and short illustrative paraphrases only — no standard text. Production depends on licensed copies uploaded by Intertec or an approved licensing model.</span></div>';
  var CLAUSE_GROUPS = [["4", "Context of the organisation"], ["5", "Leadership"], ["6", "Planning"], ["7", "Support"], ["8", "Operation"], ["9", "Performance evaluation"], ["10", "Improvement"]];
  CA.CLAUSE_GROUPS = CLAUSE_GROUPS;

  // ---------- Organisation & sectors ----------
  CA.route("org", {
    title: "Organisation & sectors", roles: "ad pm be", nav: "org",
    render: function () {
      var S = CA.S, byC = {};
      S.bus.forEach(function (b) { byC[b.country] = (byC[b.country] || 0) + 1; });
      return CA.head({ crumbs: [["Library"], ["Organisation & sectors"]], title: "Organisation & sectors", chips: CA.demo("Illustrative structure"), sub: "Top of the audit universe. The organisation structure here is sample data, not an authoritative Intertec mapping." }) +
        '<div class="grid g4 stagger">' + Object.keys(byC).map(function (c) { return CA.kpi(String(byC[c]), c + " business units", c === "UAE" ? CA.demo() : ""); }).join("") + "</div>" +
        '<section class="card-ca"><h2 class="card-title">Organisation <span class="sp"></span>' + CA.btn({ text: "Add sector", icon: "plus", action: "add-sector", roles: "ad pm be", size: "btn-sm" }) + "</h2>" +
        '<div class="list-ca"><div class="li-ca"><i class="bi bi-building"></i><span class="sp"><b>Intertec Systems</b><small>Q&amp;BE owns the audit programme · ~19 BUs across UAE, Bahrain, KSA and Oman (source-stated)</small></span>' + CA.src() + "</div></div>" +
        CA.table([{ k: "id", label: "ID", fmt: function (r) { return '<span class="mono">' + r.id + "</span>"; } }, { k: "name", label: "Sector" }, { k: "entities", label: "Covers" }], S.sectors, { id: "t-sec", flash: CA.ui.flash }) + "</section>";
    }
  });
  CA.on("add-sector", function () {
    CA.modal({ title: "Add sector", okText: "Save sector", body: '<form novalidate class="grid gap-2">' + CA.field({ name: "name", label: "Sector name", required: true }) + CA.field({ name: "entities", label: "Covers", required: true, placeholder: "e.g. Professional services" }) + "</form>",
      onOk: function (b) { var d = CA.formData(b.querySelector("form")), id = "SEC-" + String(CA.S.sectors.length + 1).padStart(2, "0"); CA.S.sectors.push({ id: id, name: d.name, entities: d.entities }); CA.ui.flash = id; CA.log("Created", id, "Sector " + d.name); CA.toast("Sector " + esc(d.name) + " added"); CA.render(); } });
  });

  // ---------- Locations & BUs ----------
  CA.route("locations", {
    title: "Locations & business units", roles: "ad pm be", nav: "locations",
    render: function () {
      var S = CA.S;
      return CA.head({ crumbs: [["Library"], ["Locations & BUs"]], title: "Locations & business units", chips: CA.demo(), actions: CA.btn({ text: "Add location", icon: "plus", action: "add-location", roles: "ad pm be", cls: "btn-ink" }) }) +
        '<section class="card-ca"><h2 class="card-title">Locations</h2>' + CA.table([
          { k: "id", label: "ID", fmt: function (r) { return '<span class="mono">' + r.id + "</span>"; } }, { k: "country", label: "Country" }, { k: "city", label: "City" }, { k: "site", label: "Site" },
          { k: "n", label: "BUs", num: true, sv: function (r) { return S.bus.filter(function (b) { return b.location === r.city; }).length; }, fmt: function (r) { return String(S.bus.filter(function (b) { return b.location === r.city; }).length); } }
        ], S.locations, { id: "t-loc", flash: CA.ui.flash }) + '<p class="small-muted mb-0">"Microsoft Teams (remote audit)" is used as a location in the existing cycle plan template.</p></section>' +
        '<section class="card-ca"><h2 class="card-title">Business units by location <span class="sp"></span><a class="small" href="#/universe">Open universe register →</a></h2><div class="grid g3">' +
        S.locations.filter(function (l) { return l.city !== "Remote"; }).map(function (l) {
          var bus = S.bus.filter(function (b) { return b.location === l.city; });
          return '<div class="card-ca fill"><b>' + esc(l.city + ", " + l.country) + '</b><div class="d-flex flex-wrap gap-1">' + bus.map(function (b) { return '<a class="chip" href="#/bu/' + b.id + '">' + esc(b.name) + "</a>"; }).join("") + "</div></div>";
        }).join("") + "</div></section>";
    }
  });
  CA.on("add-location", function () {
    CA.modal({ title: "Add location", okText: "Save location", body: '<form novalidate class="row g-2">' + CA.field({ name: "country", label: "Country", type: "select", required: true, placeholder: "Choose…", options: ["UAE", "Bahrain", "KSA", "Oman"], col: "col-6" }) + CA.field({ name: "city", label: "City", required: true, col: "col-6" }) + CA.field({ name: "site", label: "Site name", required: true, col: "col-12" }) + "</form>",
      onOk: function (b) { var d = CA.formData(b.querySelector("form")), id = "LOC-" + d.city.slice(0, 3).toUpperCase() + (CA.S.locations.length + 1); CA.S.locations.push({ id: id, country: d.country, city: d.city, site: d.site, sector: "Technology services" }); CA.ui.flash = id; CA.log("Created", id, d.site); CA.toast("Location " + esc(d.site) + " added"); CA.render(); } });
  });

  // ---------- Universe register ----------
  CA.route("universe", {
    title: "Audit universe", roles: "ad pm be", nav: "universe",
    render: function () {
      var S = CA.S, f = CA.ui.uni || (CA.ui.uni = { q: "", country: "", std: "" });
      var rows = S.bus.filter(function (b) {
        return (!f.country || b.country === f.country) && (!f.std || b.standards.indexOf(f.std) > -1) && (!f.q || (b.name + " " + b.location + " " + b.processes + " " + b.manager).toLowerCase().indexOf(f.q.toLowerCase()) > -1);
      });
      var stds = ["ISO 9001", "ISO/IEC 20000-1", "ISO/IEC 27001", "ISO 14001", "ISO 45001"];
      return CA.head({ crumbs: [["Library"], ["Universe register"]], title: "Audit universe", chips: CA.chip(S.bus.length + " BUs") + CA.demo("Sample BU records"),
        actions: CA.btn({ text: "Add BU", icon: "plus-lg", action: "bu-form", roles: "ad pm be", cls: "btn-ink" }),
        sub: "The master register of what can be audited: countries, locations, business units, processes and the standards each is audited against. Scope mappings shown are illustrative, not authoritative Intertec mappings." }) +
        '<div class="filters" role="search"><input class="form-control" type="search" placeholder="Search BU, process, manager…" value="' + esc(f.q) + '" data-change="uni-filter" data-k="q" aria-label="Search universe">' +
        '<select class="form-select" data-change="uni-filter" data-k="country" aria-label="Country"><option value="">All countries</option>' + ["UAE", "Bahrain", "KSA", "Oman"].map(function (c) { return "<option" + (f.country === c ? " selected" : "") + ">" + c + "</option>"; }).join("") + "</select>" +
        '<select class="form-select" data-change="uni-filter" data-k="std" aria-label="Standard"><option value="">All standards</option>' + stds.map(function (c) { return "<option" + (f.std === c ? " selected" : "") + ">" + c + "</option>"; }).join("") + "</select>" +
        (f.q || f.country || f.std ? '<button class="btn btn-link btn-sm" data-action="uni-clear">Clear filters</button>' : "") + '<span class="small-muted ms-auto">' + rows.length + " of " + S.bus.length + "</span></div>" +
        CA.table([
          { k: "id", label: "ID", fmt: function (b) { return '<span class="mono">' + b.id + "</span>"; } },
          { k: "name", label: "Business unit", fmt: function (b) { return CA.link("bu/" + b.id, b.name); } },
          { k: "country", label: "Country" }, { k: "location", label: "Location" }, { k: "processes", label: "Departments / processes" },
          { k: "manager", label: "BU manager" },
          { k: "standards", label: "Applicable standards", sort: false, fmt: function (b) { return b.standards.map(function (s) { return CA.chip(s); }).join(" "); } },
          { k: "e", label: "", sort: false, fmt: function (b) { return CA.btn({ text: "Edit", action: "bu-form", data: { id: b.id }, roles: "ad pm be", size: "btn-sm" }); } }
        ], rows, { id: "t-uni", flash: CA.ui.flash });
    }
  });
  CA.on("uni-filter", function (el) { CA.ui.uni[el.dataset.k] = el.value; CA.render(); });
  CA.on("uni-clear", function () { CA.ui.uni = { q: "", country: "", std: "" }; CA.render(); });
  CA.on("bu-form", function (el) {
    var b = el.dataset.id ? CA.bu(el.dataset.id) : null;
    var stds = ["ISO 9001", "ISO/IEC 20000-1", "ISO/IEC 27001", "ISO 14001", "ISO 45001"];
    CA.modal({ title: b ? "Edit " + esc(b.name) : "Add business unit", okText: b ? "Save changes" : "Add BU", size: "modal-lg",
      body: '<form novalidate class="row g-3">' +
        CA.field({ name: "name", label: "Business unit name", value: b && b.name, required: true, col: "col-md-6" }) +
        CA.field({ name: "manager", label: "BU owner / manager", value: b && b.manager, required: true, col: "col-md-6", help: "Use fictional names in the demo." }) +
        CA.field({ name: "country", label: "Country", type: "select", value: b && b.country, required: true, placeholder: "Choose…", options: ["UAE", "Bahrain", "KSA", "Oman"], col: "col-md-4" }) +
        CA.field({ name: "location", label: "Location", type: "select", value: b && b.location, required: true, placeholder: "Choose…", options: CA.S.locations.filter(function (l) { return l.city !== "Remote"; }).map(function (l) { return l.city; }), col: "col-md-4" }) +
        CA.field({ name: "processes", label: "Departments / processes", value: b && b.processes, required: true, col: "col-md-4" }) +
        '<fieldset class="col-12"><legend class="form-label req">Applicable standards (scope mapping)</legend><div class="d-flex flex-wrap gap-3">' + stds.map(function (s, i) { return '<div class="form-check"><input class="form-check-input" type="checkbox" data-multi="1" name="standards" value="' + s + '" id="bs' + i + '"' + (!b && s === "ISO 9001" || b && b.standards.indexOf(s) > -1 ? " checked" : "") + '><label class="form-check-label" for="bs' + i + '">' + s + "</label></div>"; }).join("") + "</div></fieldset></form>",
      onOk: function (body) {
        var d = CA.formData(body.querySelector("form"));
        if (!d.standards.length) { CA.toast("Select at least one applicable standard.", "warn"); return false; }
        if (b) { Object.assign(b, { name: d.name, manager: d.manager, country: d.country, location: d.location, processes: d.processes, standards: d.standards }); CA.ui.flash = b.id; CA.log("Updated", b.id, "BU " + d.name); CA.toast("Saved " + esc(d.name)); }
        else {
          var id = "BU-" + String(CA.S.bus.length + 1).padStart(2, "0");
          CA.S.bus.push({ id: id, name: d.name, country: d.country, location: d.location, processes: d.processes, manager: d.manager, standards: d.standards, h126: 90, h225: 90, nc: [0, 0, 0, 0], demo: true, added: true });
          CA.ui.flash = id; CA.log("Created", id, "BU " + d.name + " added to universe"); CA.toast("Business unit " + esc(d.name) + " added to the universe");
        }
        CA.store.save(); CA.render();
      } });
  });

  // ---------- Standards library ----------
  CA.route("standards", {
    title: "Standards library", roles: "pm la be ad", nav: "standards",
    render: function (p, q) {
      var S = CA.S, sel = q.sel || "STD-9001-26", st = CA.byId(S.standards, sel) || S.standards[1];
      var pending = S.crosswalk.filter(function (c) { return c.state !== "Approved"; }).length;
      return CA.head({ crumbs: [["Library"], ["Standards library"]], title: "Standards library", chips: CA.chip(S.standards.length + " standard editions"),
        actions: CA.btn({ text: "Upload licensed text", icon: "cloud-upload", action: "upload-std", roles: "be ad" }) + CA.btn({ text: "Open crosswalk", icon: "arrow-left-right", href: "crosswalk", cls: "btn-ink" }),
        sub: "Standards named in the BRD and current auditor workbook, their editions, licence status and clause structure." }) + COPYRIGHT +
        '<div class="grid g-side"><section class="card-ca"><h2 class="card-title">Catalogue</h2>' + CA.table([
          { k: "code", label: "Standard", fmt: function (s) { return "<b>" + esc(s.code) + "</b>:" + esc(s.edition); } }, { k: "name", label: "Title" },
          { k: "status", label: "Status", fmt: function (s) { return CA.chip(s.status, /new/.test(s.status) ? "ai" : /transition/.test(s.status) ? "warn" : "ok"); } },
          { k: "licence", label: "Source / licence", fmt: function (s) { return CA.chip(s.licence, /pending/i.test(s.licence) ? "warn" : "ok"); } },
          { k: "checkpoints", label: "Checkpoints", num: true }
        ], S.standards, { id: "t-std", rowRoute: function (s) { return "standards?sel=" + s.id; } }) + "</section>" +
        '<section class="card-ca"><h2 class="card-title">' + esc(st.code + ":" + st.edition) + "</h2><p class=\"small muted mb-0\">" + esc(st.note) + '</p><div class="small-muted">Clause structure (high-level sections, identifiers only)</div><div class="list-ca">' +
        CLAUSE_GROUPS.map(function (g) { return '<div class="li-ca"><span class="mono" style="width:24px">' + g[0] + '</span><span class="sp">' + esc(g[1]) + "</span></div>"; }).join("") + "</div>" +
        (st.code === "ISO 9001" ? '<a class="btn btn-soft btn-sm" href="#/checkpoints">Baseline checkpoints (' + st.checkpoints + ")</a>" : '<p class="small-muted mb-0">Checkpoints are drafted once the licensed text is uploaded.</p>') + "</section></div>" +
        '<div class="grid g2"><section class="card-ca"><h2 class="card-title"><i class="bi bi-arrow-left-right"></i> ISO 9001:2015 → 2026 delta</h2>' +
        '<p class="small mb-0">ISO 9001:2026 published <b>' + CA.FACTS.iso2026Published + "</b>; certificates must move off the 2015 edition by <b>" + CA.FACTS.iso2015TransitionEnd + "</b>. " + CA.src("Source-stated (explanation reference)") + '</p><p class="small muted mb-0">TPL-59 still maps to 2015 clauses. The crosswalk shows which clauses changed and which checkpoints are affected.</p>' +
        '<div class="d-flex gap-2 flex-wrap">' + CA.chip(S.crosswalk.length + " clause mappings") + CA.chip(pending + " awaiting impact approval", pending ? "warn" : "ok") + CA.demo("Illustrative mappings") + '</div><a class="btn btn-ink btn-sm" style="justify-self:start" href="#/crosswalk">Review change impact</a></section>' +
        '<section class="card-ca"><h2 class="card-title"><i class="bi bi-broadcast"></i> Standards Watch · A01 ' + CA.chip("R1 basic", "ai") + CA.future("R2 full") + "</h2>" +
        '<div class="ai-box"><span class="ai-tag"><i class="bi bi-stars"></i> Simulated AI suggestion · A01</span><span class="small"><b>Edition change detected:</b> ISO 9001:2026 supersedes ISO 9001:2015. 6 clauses mapped; 5 checkpoints potentially affected.</span><span class="rationale">Source context: licensed copy uploaded (demo). The owner approves every change before checkpoints are updated.</span></div>' +
        '<p class="small-muted mb-0">R1 provides basic edition tracking and the 2015 → 2026 delta. Continuous monitoring of amendments across all standards is planned for R2.</p></section></div>';
    }
  });
  CA.on("upload-std", function () {
    CA.modal({ title: "Upload licensed standard text", okText: "Validate file (simulated)", body: '<form novalidate class="grid gap-2"><div class="sim-banner"><i class="bi bi-plug"></i><span>Simulated. The file stays on your computer; only its name is shown. Production ingests licensed text (Docling / LlamaIndex) into the clause store.</span></div>' + CA.field({ name: "std", label: "Standard edition", type: "select", options: CA.S.standards.map(function (s) { return [s.id, s.code + ":" + s.edition]; }), required: true }) + CA.field({ name: "file", label: "Licensed copy (PDF)", type: "file", required: true }) + '<div class="form-check"><input class="form-check-input" type="checkbox" required id="lic-ok"><label class="form-check-label small" for="lic-ok">I confirm Intertec holds a licence for this copy.</label></div></form>',
      onOk: function (b) { var d = CA.formData(b.querySelector("form")), s = CA.byId(CA.S.standards, d.std); s.licence = "Licensed copy uploaded (demo)"; CA.log("Uploaded", s.id, "Licensed text file '" + d.file + "' (simulated, not uploaded)"); CA.toast("Validated " + esc(d.file) + " for " + esc(s.code + ":" + s.edition) + " (simulated, nothing uploaded)", "info"); CA.render(); } });
  });

  // ---------- Edition crosswalk ----------
  CA.route("crosswalk", {
    title: "Edition crosswalk", roles: "be pm la", nav: "crosswalk",
    render: function () {
      var S = CA.S;
      return CA.head({ crumbs: [["Library"], ["Standards", "standards"], ["Edition crosswalk"]], title: "ISO 9001:2015 → 2026 crosswalk", chips: CA.chip("A01 Standards Watch", "ai") + CA.demo("Illustrative mappings — not the authoritative crosswalk") }) + COPYRIGHT +
        '<section class="card-ca"><h2 class="card-title">Clause mappings &amp; change impact</h2>' + CA.table([
          { k: "from", label: "2015 clause", fmt: function (r) { return '<span class="mono">' + esc(r.from) + "</span>"; } },
          { k: "to", label: "2026 clause", fmt: function (r) { return '<span class="mono">' + esc(r.to) + "</span>"; } },
          { k: "change", label: "Change", fmt: function (r) { return CA.chip(r.change, r.change === "Unchanged" ? "" : r.change === "Restructured" ? "bad" : "warn"); } },
          { k: "topic", label: "Topic (illustrative paraphrase)" }, { k: "impact", label: "Affected checkpoints" },
          { k: "state", label: "Review", fmt: function (r) { return (r.state === "AI draft" ? CA.chip("Simulated AI draft", "ai") : CA.chip(r.state)) + (r.by ? '<div class="approval-stamp">' + esc(r.by) + (r.at ? " · " + esc(r.at) : "") + "</div>" : ""); } },
          { k: "a", label: "", sort: false, fmt: function (r) { return r.state === "Approved" ? "" : CA.btn({ text: "Approve impact", action: "cw-approve", data: { id: r.id }, roles: "be", size: "btn-sm", cls: "btn-okay" }) + " " + CA.btn({ text: "Return", action: "cw-return", data: { id: r.id }, roles: "be", size: "btn-sm" }); } }
        ], S.crosswalk, { id: "t-cw", flash: CA.ui.flash }) + '<p class="small-muted mb-0">Approving an impact marks the affected baseline checkpoints for update. The Business Excellence Manager owns this decision; A01 only drafts the mapping.</p></section>';
    }
  });
  CA.on("cw-approve", function (el) { var r = CA.byId(CA.S.crosswalk, el.dataset.id); r.state = "Approved"; r.by = CA.me().user; r.at = CA.stamp(); CA.ui.flash = r.id; CA.aiLog("A01", r.id, "Crosswalk mapping " + r.from + " → " + r.to, "Accepted"); CA.log("Approved", r.id, "Change impact " + r.from + " → " + r.to); CA.toast("Change impact approved for clause " + esc(r.to)); CA.render(); });
  CA.on("cw-return", function (el) { var r = CA.byId(CA.S.crosswalk, el.dataset.id); r.state = "Impact review"; r.by = ""; CA.log("Returned", r.id, "Returned for rework"); CA.toast("Returned for rework", "warn"); CA.render(); });

  // ---------- Baseline checkpoints ----------
  CA.route("checkpoints", {
    title: "Baseline checkpoints", roles: "be pm", nav: "checkpoints",
    render: function () {
      var S = CA.S, f = CA.ui.cpf || "all";
      var rows = S.checkpoints.filter(function (c) { return f === "all" || c.state === f; });
      var drafts = S.checkpoints.filter(function (c) { return c.state === "ai-draft"; }).length;
      return CA.head({ crumbs: [["Library"], ["Baseline checkpoints"]], title: "Baseline checkpoint review", chips: CA.chip("ISO 9001:2026") + CA.chip(drafts + " AI drafts", drafts ? "ai" : "ok"),
        actions: CA.btn({ text: "Draft checkpoints for clause 7.5 (A02)", icon: "stars", action: "cp-generate", roles: "be", cls: "btn-ai", disabled: !!CA.byId(S.checkpoints, "CP-9001-26-751") }),
        sub: "Reusable, approved and versioned checkpoint library. Audit-specific checklists are assembled from these. A02 drafts from licensed content; the BE Manager approves each version." }) +
        '<div class="tabs-ca" role="tablist">' + [["all", "All"], ["ai-draft", "AI drafts"], ["approved", "Approved"], ["rejected", "Rejected"]].map(function (t) { return '<button role="tab" aria-selected="' + (f === t[0]) + '" data-action="cp-filter" data-f="' + t[0] + '">' + t[1] + " · " + (t[0] === "all" ? S.checkpoints.length : S.checkpoints.filter(function (c) { return c.state === t[0]; }).length) + "</button>"; }).join("") + "</div>" +
        '<div class="grid">' + (rows.length ? rows.map(cpCard).join("") : CA.empty("inbox", "Nothing here", "No checkpoints in this state.")) + "</div>";
    }
  });
  function cpCard(c) {
    var ai = c.state === "ai-draft", rej = c.state === "rejected";
    return '<article class="ai-box ' + (ai ? "" : rej ? "rejected" : "approved") + '"><div class="row-head">' +
      (ai ? '<span class="ai-tag"><i class="bi bi-stars"></i> Simulated AI draft · A02</span>' : rej ? '<span class="human-tag" style="color:var(--bad)"><i class="bi bi-x-circle"></i> Rejected</span>' : '<span class="human-tag"><i class="bi bi-person-check"></i> Approved baseline</span>') +
      CA.chip("Clause " + c.clause) + '<span class="mono small-muted">' + c.id + " · " + esc(c.version) + '</span><span class="sp"></span>' + CA.chip("Weight " + c.weight) + "</div>" +
      '<b class="q">' + esc(c.text) + '</b><div class="small"><b>Guidance:</b> ' + esc(c.guidance) + '</div><div class="small"><b>Expected evidence:</b> ' + esc(c.evidence) + "</div>" +
      (c.rationale && ai ? '<div class="rationale">Why: ' + esc(c.rationale) + "</div>" : "") +
      (c.reviewer ? '<div class="approval-stamp">' + (rej ? "Rejected" : "Approved") + " by " + esc(c.reviewer) + " · " + esc(c.reviewedAt) + "</div>" : "") +
      (ai ? '<div class="d-flex gap-2">' + CA.btn({ text: "Accept", icon: "check-lg", action: "cp-decide", data: { id: c.id, d: "approved" }, roles: "be", size: "btn-sm", cls: "btn-okay" }) + CA.btn({ text: "Edit", icon: "pencil", action: "cp-edit", data: { id: c.id }, roles: "be", size: "btn-sm" }) + CA.btn({ text: "Reject", icon: "x-lg", action: "cp-decide", data: { id: c.id, d: "rejected" }, roles: "be", size: "btn-sm", cls: "btn-danger-soft" }) + "</div>" : "") + "</article>";
  }
  CA.on("cp-filter", function (el) { CA.ui.cpf = el.dataset.f; CA.render(); });
  CA.on("cp-decide", function (el) {
    var c = CA.byId(CA.S.checkpoints, el.dataset.id);
    c.state = el.dataset.d; c.reviewer = CA.me().user; c.reviewedAt = CA.stamp();
    if (c.state === "approved") c.version = c.version.replace("-draft", "");
    CA.aiLog("A02", c.id, "Baseline checkpoint " + c.clause, c.state === "approved" ? "Accepted" : "Rejected");
    CA.log(c.state === "approved" ? "Approved" : "Rejected", c.id, "Baseline checkpoint " + c.version);
    CA.store.save(); CA.toast("Checkpoint " + c.id + " " + (c.state === "approved" ? "approved as " + c.version : "rejected"), c.state === "approved" ? "ok" : "warn"); CA.render();
  });
  CA.on("cp-edit", function (el) {
    var c = CA.byId(CA.S.checkpoints, el.dataset.id);
    CA.modal({ title: "Edit checkpoint " + c.id, okText: "Save & approve", size: "modal-lg", body: '<form novalidate class="grid gap-2">' + CA.field({ name: "text", label: "Checkpoint description", type: "textarea", value: c.text, required: true }) + CA.field({ name: "guidance", label: "Guidance", type: "textarea", rows: 2, value: c.guidance, required: true }) + CA.field({ name: "evidence", label: "Expected evidence", value: c.evidence, required: true }) + CA.field({ name: "weight", label: "Weight", type: "number", value: String(c.weight), min: "1", max: "3", required: true }) + "</form>",
      onOk: function (b) { var d = CA.formData(b.querySelector("form")); Object.assign(c, { text: d.text, guidance: d.guidance, evidence: d.evidence, weight: +d.weight, state: "approved", reviewer: CA.me().user, reviewedAt: CA.stamp(), version: c.version.replace("-draft", "") }); CA.aiLog("A02", c.id, "Baseline checkpoint " + c.clause, "Edited & accepted"); CA.log("Edited & approved", c.id, c.version); CA.toast("Edited and approved " + c.id); CA.render(); } });
  });
  CA.on("cp-generate", function (el) {
    el.disabled = true; el.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Drafting (simulated)…';
    setTimeout(function () {
      CA.S.checkpoints.push({ id: "CP-9001-26-751", clause: "7.5", text: "Confirm documented information needed by the BU is controlled, current and accessible.", guidance: "Check version control on two key documents (illustrative paraphrase).", evidence: "Document register, version history", weight: 3, state: "ai-draft", version: "v1.0-draft", reviewer: "", reviewedAt: "", rationale: "Drafted from licensed clause content for 7.5 (simulated retrieval)." });
      CA.ui.cpf = "ai-draft"; CA.aiLog("A02", "CP-9001-26-751", "Drafted checkpoint for clause 7.5"); CA.log("AI drafted", "CP-9001-26-751", "A02 simulated suggestion"); CA.toast("A02 drafted 1 checkpoint for review (simulated)", "ai"); CA.render();
    }, 1200);
  });

  // ---------- Checklist templates ----------
  CA.route("templates", {
    title: "Checklist templates", roles: "pm la be", nav: "templates",
    render: function () {
      return CA.head({ crumbs: [["Library"], ["Checklist templates"]], title: "Checklist template library", sub: "Reusable templates by standard, process and audit type, with versions. TPL-59 is the legacy Excel checklist (59 checkpoints mapped to ISO 9001:2015, source-stated)." }) +
        CA.table([
          { k: "id", label: "ID", fmt: function (t) { return '<span class="mono">' + t.id + "</span>"; } }, { k: "name", label: "Template" }, { k: "standard", label: "Standard" }, { k: "type", label: "Audit type" },
          { k: "version", label: "Version" }, { k: "items", label: "Items", num: true }, { k: "state", label: "Status", fmt: function (t) { return CA.chip(t.state, /Approved/.test(t.state) ? "ok" : /Draft/.test(t.state) ? "warn" : ""); } },
          { k: "a", label: "", sort: false, fmt: function (t) { return t.id === "TPL-59" ? '<span class="small-muted">Read-only history</span>' : CA.btn({ text: "Use in checklist builder", href: "audit/IA-2027-001/checklist", size: "btn-sm" }); } }
        ], CA.S.templates, { id: "t-tpl" }) +
        '<div class="info-banner"><i class="bi bi-info-circle"></i><span><b>Baseline vs audit-specific:</b> templates and baseline checkpoints are approved, versioned and reusable. An audit-specific checklist is assembled for one audit from approved checkpoints plus scope, BU context and prior findings (A04).</span></div>';
    }
  });

  // ---------- Auditor directory & profile ----------
  CA.route("auditors", {
    title: "Auditor directory", roles: "pm be la", nav: "auditors",
    render: function () {
      var S = CA.S, f = CA.ui.audf || "";
      var rows = S.auditors.filter(function (a) { return !f || a.standards.indexOf(f) > -1; });
      return CA.head({ crumbs: [["Library"], ["Auditor directory"]], title: "Auditor directory", chips: CA.demo("Fictional people"), sub: "Competence, experience, department, location and availability. The impartiality check (24-month cooling-off rule) is a deterministic system check flagged for human review." }) +
        '<div class="filters"><select class="form-select" data-change="aud-filter" aria-label="Filter by standard"><option value="">All standards</option>' + ["ISO 9001", "ISO/IEC 20000-1", "ISO/IEC 27001", "ISO 14001", "ISO 45001"].map(function (s) { return "<option" + (f === s ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select></div>" +
        CA.table([
          { k: "name", label: "Name", fmt: function (a) { return CA.link("auditor/" + a.id, a.name) + '<div class="small-muted">' + esc(a.role) + "</div>"; } },
          { k: "quals", label: "Qualifications", sort: false, fmt: function (a) { return a.quals.map(function (q) { return '<div class="small">' + esc(q) + "</div>"; }).join(""); } },
          { k: "exp", label: "Experience (yrs)", num: true }, { k: "dept", label: "Department" }, { k: "location", label: "Location" },
          { k: "availability", label: "Availability", fmt: function (a) { return CA.chip(a.availability, a.availability === "Available" ? "ok" : "warn"); } },
          { k: "imp", label: "Impartiality", sort: false, fmt: function (a) { return a.prevDept ? CA.chip("Check: ex-" + a.prevDept.split(" ")[0], "warn") : CA.chip("No conflicts", "ok"); } },
          { k: "x", label: "", sort: false, fmt: function (a) { return CA.btn({ text: "Assign", action: "assign-auditor", data: { id: a.id }, roles: "pm", size: "btn-sm" }); } }
        ], rows, { id: "t-aud", rowRoute: function (a) { return "auditor/" + a.id; } });
    }
  });
  CA.on("aud-filter", function (el) { CA.ui.audf = el.value; CA.render(); });
  CA.route("auditor/:id", {
    title: function (p) { var a = CA.auditor(p.id); return a ? a.name : "Auditor"; }, roles: "pm be la au", nav: "auditors",
    render: function (p) {
      var a = CA.auditor(p.id); if (!a) return CA.empty("person-x", "Auditor not found", esc(p.id));
      var slots = CA.S.slots.filter(function (s) { return s.auditor === a.id || s.lead === a.id; });
      return CA.head({ crumbs: [["Library"], ["Auditors", "auditors"], [a.name]], title: a.name, chips: CA.chip(a.role, "ai") + CA.demo("Fictional"), actions: CA.btn({ text: "Assign to audit", icon: "calendar-plus", action: "assign-auditor", data: { id: a.id }, roles: "pm", cls: "btn-ink" }) }) +
        '<div class="grid g3 stagger">' + CA.kpi(String(a.exp), "Years auditing") + CA.kpi(String(a.audits), "Audits completed") + CA.kpi(CA.d(a.certExpiry), "Certificate valid to", CA.daysBetween(CA.DEMO_TODAY, a.certExpiry) < 120 ? CA.chip("Expiry alert", "warn") : "") + "</div>" +
        '<div class="grid g2"><section class="card-ca"><h2 class="card-title">Competence</h2><div class="list-ca">' + a.quals.map(function (q) { return '<div class="li-ca"><i class="bi bi-award"></i><span class="sp">' + esc(q) + "</span></div>"; }).join("") + '</div><dl class="row small mb-0"><dt class="col-5">Department</dt><dd class="col-7">' + esc(a.dept) + '</dd><dt class="col-5">Location</dt><dd class="col-7">' + esc(a.location) + '</dd><dt class="col-5">Availability</dt><dd class="col-7">' + esc(a.availability) + ' · Outlook free/busy ' + CA.sim() + '</dd></dl></section>' +
        '<section class="card-ca"><h2 class="card-title">Impartiality</h2>' + (a.prevDept ? '<div class="info-banner" style="border-color:var(--warn)"><i class="bi bi-exclamation-triangle text-warning"></i><span>Previously in <b>' + esc(a.prevDept) + "</b>. The 24-month cooling-off rule blocks auditing that area until Jan 2028 unless a reviewer records an override reason.</span></div>" : '<p class="small mb-0">No own-department or recent-department conflicts found by the rule check.</p>') +
        '<h3 class="h6 mt-2 mb-0">H1-2027 assignments</h3><div class="list-ca">' + (slots.length ? slots.map(function (s) { return '<a class="li-ca" href="#/audit/' + s.audit + '"><span class="sp">' + esc(s.dept) + " · " + esc(s.location) + "<small>" + CA.d(s.date) + " " + s.time + (s.lead === a.id ? " · as Lead Auditor" : "") + "</small></span></a>"; }).join("") : '<p class="small-muted">None.</p>') + "</div></section></div>";
    }
  });
  CA.on("assign-auditor", function (el) {
    var a = CA.auditor(el.dataset.id);
    CA.modal({ title: "Assign " + esc(a.name), okText: "Assign", body: '<form novalidate class="grid gap-2">' + CA.field({ name: "slot", label: "Cycle-plan slot", type: "select", required: true, placeholder: "Choose slot…", options: CA.S.slots.map(function (s) { return [s.id, s.dept + " · " + CA.d(s.date) + " " + s.time + " (now: " + CA.auditor(s.auditor).name + ")"]; }) }) + '<p class="small-muted mb-0">The impartiality rule runs when you assign. Changes stay in Draft until the plan is published.</p></form>',
      onOk: function (b) { var d = CA.formData(b.querySelector("form")); CA.assignSlot(CA.slot(d.slot), a.id); CA.go("cycle"); } });
  });
  CA.assignSlot = function (slot, auditorId) {
    var a = CA.auditor(auditorId), bu = CA.bu(slot.bu);
    slot.auditor = auditorId; slot.override = "";
    var conflict = a.dept === bu.name || (a.prevDept && a.prevDept.indexOf(bu.name) === 0);
    slot.flag = conflict ? "Impartiality check: " + a.name + (a.dept === bu.name ? " belongs to this department." : " worked in " + bu.name + " within 24 months.") + " Reassign or record an override reason." : "";
    slot.status = "Edited"; if (slot.invite === "Sent") slot.invite = "Update pending";
    var au = CA.audit(slot.audit); if (au) au.auditor = auditorId;
    CA.log("Assigned", slot.id, a.name + " → " + bu.name + (conflict ? " (impartiality flag raised)" : ""));
    CA.toast(conflict ? "Assigned, but the impartiality rule raised a flag for review." : "Assigned " + esc(a.name) + " to " + esc(bu.name), conflict ? "warn" : "ok");
  };
})(window.CA);
