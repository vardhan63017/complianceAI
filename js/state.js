/* Central in-memory demo store, persisted to localStorage so a page refresh keeps the demo.
   No server, no network: "Reset demo" restores the seed. */
(function (CA) {
  var KEY = "intertec-compliance-ai-prototype-v1";
  var state = null;

  CA.store = {
    load: function () {
      try {
        var raw = localStorage.getItem(KEY);
        state = raw ? JSON.parse(raw) : CA.seed();
        if (!state || state.version !== 1) state = CA.seed();
      } catch (e) { state = CA.seed(); }
      return state;
    },
    save: function () { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked: demo still works in memory */ } },
    reset: function () { var sess = state && state.session; state = CA.seed(); state.session = sess; CA.store.save(); }
  };
  Object.defineProperty(CA, "S", { get: function () { return state; } });

  // ---------- lookups ----------
  function by(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  CA.bu = function (id) { return by(state.bus, id); };
  CA.audit = function (id) { return by(state.audits, id); };
  CA.finding = function (id) { return by(state.findings, id); };
  CA.car = function (id) { return by(state.cars, id); };
  CA.auditor = function (id) { return by(state.auditors, id); };
  CA.slot = function (id) { return by(state.slots, id); };
  CA.programme = function (id) { return by(state.programmes, id); };
  CA.report = function (id) { return by(state.reports, id); };
  CA.byId = by;

  // ---------- session / role ----------
  CA.role = function () { return state.session ? state.session.role : null; };
  CA.me = function () { var r = CA.role(); return r ? CA.ROLES[r] : null; };
  CA.can = function (roles) { var r = CA.role(); return !!r && roles.split(" ").indexOf(r) > -1; };

  // ---------- demo clock ----------
  // Demo date is fixed (CA.DEMO_TODAY); time-of-day is the real local time so approvals get a realistic stamp.
  CA.stamp = function () {
    var d = new Date();
    return CA.DEMO_TODAY + " " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  };

  // ---------- audit trail ----------
  CA.log = function (action, record, detail) {
    var me = CA.me();
    state.trail.unshift({ ts: CA.stamp(), actor: me ? me.user : "System", role: me ? me.label : "Workflow rule", action: action, record: record, detail: detail || "" });
    CA.store.save();
  };
  CA.ruleLog = function (action, record, detail) {
    state.trail.unshift({ ts: CA.stamp(), actor: "Workflow engine", role: "Deterministic rule", action: action, record: record, detail: detail || "" });
  };
  CA.aiLog = function (agent, record, what, decision) {
    var me = CA.me();
    state.aiLog.unshift({ ts: CA.stamp(), agent: agent, record: record, what: what, decision: decision || "Pending human review", by: decision ? (me ? me.user : "") : "" });
  };

  // ---------- scoring (deterministic, source-stated TPL-59 weights) ----------
  CA.points = { sat: 3, obs: 2, afi: 2, min: 1, maj: 0 };
  CA.score = function (counts) {
    var applicable = 0, earned = 0;
    Object.keys(CA.points).forEach(function (k) { var n = counts[k] || 0; applicable += n; earned += n * CA.points[k]; });
    return { applicable: applicable, earned: earned, max: applicable * 3, pct: applicable ? earned / (applicable * 3) * 100 : null };
  };
  CA.auditCounts = function (a) {
    var c = { sat: 0, obs: 0, afi: 0, min: 0, maj: 0, na: 0, open: 0 };
    if (!a || !a.checklist) return c;
    CA.checklistItems(a).forEach(function (it) {
      var r = a.responses[it.id];
      if (!r || !r.result) c.open++; else c[r.result]++;
    });
    return c;
  };
  // Items that made it into the approved checklist (accepted or edited; rejected items are dropped).
  CA.checklistItems = function (a) {
    if (!a.checklist) return [];
    return a.checklist.items.filter(function (it) { return it.state === "accepted" || it.state === "edited"; });
  };
  CA.orgAverage = function (field) {
    var sum = 0; state.bus.forEach(function (b) { sum += b[field]; });
    return sum / state.bus.length;
  };

  // ---------- dates ----------
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  CA.d = function (iso) { if (!iso) return "—"; var p = iso.slice(0, 10).split("-"); return +p[2] + " " + MON[+p[1] - 1] + " " + p[0]; };
  CA.addDays = function (iso, n) { var d = new Date(iso.slice(0, 10) + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  CA.daysBetween = function (a, b) { return Math.round((Date.parse(b.slice(0, 10) + "T00:00:00Z") - Date.parse(a.slice(0, 10) + "T00:00:00Z")) / 86400000); };
  CA.dow = function (iso) { return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(iso + "T00:00:00Z").getUTCDay()]; };

  // ---------- escalation (deterministic rule; AI never sets these dates) ----------
  CA.ESCALATION = [
    { off: -7, label: "Reminder", to: "Action owner" },
    { off: 0, label: "Due date", to: "Action owner" },
    { off: 1, label: "+1 overdue", to: "Action owner, cc BU manager" },
    { off: 7, label: "+7 escalate", to: "Line manager" },
    { off: 14, label: "+14 escalate", to: "Top management" }
  ];
  CA.overdueTier = function (due) {
    var late = CA.daysBetween(due, CA.DEMO_TODAY);
    if (late >= 14) return { late: late, tier: "+14", cls: "bad", to: "Top management" };
    if (late >= 7) return { late: late, tier: "+7", cls: "bad", to: "Line manager" };
    if (late >= 1) return { late: late, tier: "+1", cls: "warn", to: "Action owner + BU manager" };
    return { late: late, tier: "", cls: "", to: "" };
  };

  // A CAR is overdue only while the owner still owes work; once verified it waits on the effectiveness window instead.
  CA.carOverdue = function (c) {
    return c.state !== "Closed" && c.state !== "Effectiveness review" && CA.overdueTier(c.due).late >= 1;
  };

  // ---------- id counters ----------
  CA.nextFindingId = function (auditId) {
    var n = state.findings.filter(function (f) { return f.audit === auditId; }).length + 1;
    return "F-" + auditId + "-" + String(n).padStart(2, "0");
  };
  CA.nextCarId = function () {
    var n = state.cars.filter(function (c) { return c.id.indexOf("CAR-2027-") === 0; }).length + 1;
    return "CAR-2027-" + String(n).padStart(4, "0");
  };
})(window.CA);
