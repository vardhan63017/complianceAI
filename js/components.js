/* Shared UI helpers. Screens return HTML strings; behaviour is wired through
   data-action / data-form delegation so re-rendering never leaks listeners. */
(function (CA) {
  CA.actions = {};
  CA.forms = {};
  CA.on = function (name, fn) { CA.actions[name] = fn; };
  CA.onForm = function (name, fn) { CA.forms[name] = fn; };

  var esc = CA.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  };

  // ---------- chips ----------
  var STATUS_CLS = {
    "approved": "ok", "accepted": "ok", "edited": "ok", "issued": "ok", "closed": "ok", "published": "ok", "effective": "ok", "verified": "ok", "confirmed": "ok", "acknowledged": "ok", "active": "ok", "sent": "ok", "accepted invite": "ok", "completed": "ok", "submitted": "ok", "available": "ok",
    "draft": "warn", "in review": "warn", "impact review": "warn", "technical review": "warn", "pending": "warn", "planned": "", "plan review": "warn", "implementation": "warn", "root cause & plan": "warn", "evidence submitted": "warn", "effectiveness review": "warn", "fieldwork": "warn", "awaiting role": "warn", "not sent": "", "returned": "bad", "reopened": "bad", "not effective": "bad", "overdue": "bad", "rejected": "bad", "disputed": "bad", "car open": "warn",
    "ai draft": "ai", "ai-draft": "ai", "ai proposed": "ai", "simulated": "sim", "planned r2": "future", "planned r3": "future"
  };
  CA.chip = function (text, cls) {
    var c = cls != null ? cls : (STATUS_CLS[String(text).toLowerCase()] || "");
    return '<span class="chip ' + c + '">' + esc(text) + "</span>";
  };
  CA.sim = function (txt) { return '<span class="chip sim" title="No real system is called in this prototype"><i class="bi bi-plug"></i>' + esc(txt || "Simulated") + "</span>"; };
  CA.demo = function (txt) { return '<span class="chip demo" title="Invented for the demo">' + esc(txt || "Illustrative demo data") + "</span>"; };
  CA.src = function (txt) { return '<span class="chip ok" title="Stated in the source documents"><i class="bi bi-patch-check"></i>' + esc(txt || "Source-stated") + "</span>"; };
  CA.future = function (rel) { return '<span class="chip future"><i class="bi bi-hourglass-split"></i>Planned ' + esc(rel) + "</span>"; };
  CA.gradeChip = function (g) {
    var G = CA.GRADES.filter(function (x) { return x.key === g; })[0];
    if (g === "na") return CA.chip("Not applicable", "");
    return G ? CA.chip(G.short || G.label, G.cls) : CA.chip("—", "");
  };
  CA.gradeLabel = function (g) { var G = CA.GRADES.filter(function (x) { return x.key === g; })[0]; return g === "na" ? "Not applicable" : G ? G.label : "—"; };

  // ---------- layout pieces ----------
  CA.head = function (o) {
    var crumbs = (o.crumbs || []).map(function (c, i, arr) {
      return (c[1] ? '<a href="#/' + c[1] + '">' + esc(c[0]) + "</a>" : "<span>" + esc(c[0]) + "</span>") + (i < arr.length - 1 ? '<span aria-hidden="true">›</span>' : "");
    }).join("");
    return '<nav class="crumbs" aria-label="Breadcrumb">' + crumbs + "</nav>" +
      '<div class="page-head"><h1>' + esc(o.title) + "</h1>" + (o.chips || "") + '<span class="sp"></span>' + (o.actions || "") + "</div>" +
      (o.sub ? '<p class="page-sub">' + o.sub + "</p>" : "");
  };
  CA.kpi = function (value, label, extra, cls) {
    var m = String(value).match(/^(\d+(?:\.\d+)?)(%?)$/);
    var num = m ? ' data-count="' + m[1] + '"' : "";
    return '<div class="kpi ' + (cls || "") + '"><b' + num + ">" + esc(value) + "</b><span>" + label + "</span>" + (extra ? '<div class="src">' + extra + "</div>" : "") + "</div>";
  };
  CA.timeline = function (steps, nowIdx, badIdx) {
    return '<div class="timeline-ca" role="list" aria-label="Workflow status">' + steps.map(function (s, i) {
      var c = i < nowIdx ? "done" : i === nowIdx ? "now" : "";
      if (badIdx === i) c = "now bad";
      return (i ? '<span class="ln ' + (i <= nowIdx ? "done" : "") + '"></span>' : "") + '<span class="st ' + c + '" role="listitem"' + (i === nowIdx ? ' aria-current="step"' : "") + ">" + esc(s) + "</span>";
    }).join("") + "</div>";
  };
  CA.history = function (items) {
    if (!items || !items.length) return '<p class="small-muted">No history yet.</p>';
    return '<ul class="history">' + items.map(function (h) {
      return '<li class="' + (h.cls || "") + '"><span>' + esc(h.what) + "<small>" + esc(h.ts) + " · " + esc(h.who) + "</small></span></li>";
    }).join("") + "</ul>";
  };
  CA.empty = function (icon, title, text, action) {
    return '<div class="empty"><i class="bi bi-' + icon + ' big"></i><b>' + esc(title) + '</b><span class="small-muted">' + text + "</span>" + (action || "") + "</div>";
  };
  CA.link = function (route, text, cls) { return '<a href="#/' + route + '" class="' + (cls || "") + '">' + esc(text) + "</a>"; };
  CA.idLink = function (route, id) { return '<a class="id-link" href="#/' + route + '">' + esc(id) + "</a>"; };

  // Role-gated button. If the current role cannot act, render a locked button that offers to switch role.
  CA.btn = function (o) {
    var roles = o.roles;
    var allowed = !roles || CA.can(roles);
    var attrs = Object.keys(o.data || {}).map(function (k) { return " data-" + k + '="' + esc(o.data[k]) + '"'; }).join("");
    if (!allowed) {
      var first = roles.split(" ")[0];
      return '<button type="button" class="btn btn-locked ' + (o.size || "") + '" data-action="need-role" data-role="' + first + '" title="Requires: ' + esc(roles.split(" ").map(function (r) { return CA.ROLES[r].label; }).join(" or ")) + '"><i class="bi bi-lock"></i> ' + esc(o.text) + "</button>";
    }
    var tag = o.href ? "a" : "button";
    return "<" + tag + (o.href ? ' href="#/' + o.href + '"' : ' type="' + (o.submit ? "submit" : "button") + '"') + ' class="btn ' + (o.cls || "btn-soft") + " " + (o.size || "") + '"' +
      (o.action ? ' data-action="' + o.action + '"' : "") + attrs + (o.disabled ? " disabled" : "") + (o.title ? ' title="' + esc(o.title) + '"' : "") + ">" +
      (o.icon ? '<i class="bi bi-' + o.icon + '"></i> ' : "") + esc(o.text) + "</" + tag + ">";
  };

  // ---------- table with sort ----------
  // cols: [{k, label, num, sort:false, fmt(row)}]; opts: {rowRoute(row), id}
  CA.table = function (cols, rows, opts) {
    opts = opts || {};
    var id = opts.id || "t" + Math.random().toString(36).slice(2, 7);
    var sort = CA._sorts[id];
    if (sort) {
      var col = cols.filter(function (c) { return c.k === sort.k; })[0];
      if (col) rows = rows.slice().sort(function (a, b) {
        var x = col.sv ? col.sv(a) : a[col.k], y = col.sv ? col.sv(b) : b[col.k];
        if (x == null) x = ""; if (y == null) y = "";
        return (x > y ? 1 : x < y ? -1 : 0) * sort.dir;
      });
    }
    var th = cols.map(function (c) {
      var s = c.sort === false ? "" : " sortable";
      var ic = sort && sort.k === c.k ? (sort.dir > 0 ? ' <i class="bi bi-caret-up-fill"></i>' : ' <i class="bi bi-caret-down-fill"></i>') : "";
      var aria = sort && sort.k === c.k ? (sort.dir > 0 ? "ascending" : "descending") : "none";
      return '<th class="' + (c.num ? "num" : "") + s + '"' + (s ? ' data-action="sort" data-table="' + id + '" data-k="' + c.k + '" tabindex="0" aria-sort="' + aria + '"' : "") + ' scope="col">' + esc(c.label) + ic + "</th>";
    }).join("");
    var body = rows.length ? rows.map(function (r) {
      var route = opts.rowRoute ? opts.rowRoute(r) : null;
      return "<tr" + (route ? ' class="clickable' + (opts.flash === r.id ? " flash" : "") + '" data-action="go" data-route="' + route + '"' : (opts.flash === r.id ? ' class="flash"' : "")) + ">" + cols.map(function (c) {
        return '<td class="' + (c.num ? "num" : "") + (c.cls ? " " + c.cls(r) : "") + '">' + (c.fmt ? c.fmt(r) : esc(r[c.k])) + "</td>";
      }).join("") + "</tr>";
    }).join("") : '<tr><td colspan="' + cols.length + '">' + CA.empty("search", "No matching records", "Try clearing the filters.") + "</td></tr>";
    return '<div class="table-wrap"><table class="table-ca" id="' + id + '"><thead><tr>' + th + "</tr></thead><tbody>" + body + "</tbody></table></div>";
  };
  CA._sorts = {};
  CA.on("sort", function (el) {
    var id = el.dataset.table, k = el.dataset.k, cur = CA._sorts[id];
    CA._sorts[id] = { k: k, dir: cur && cur.k === k ? -cur.dir : 1 };
    CA.render();
  });

  // ---------- toasts ----------
  CA.toast = function (msg, type) {
    var wrap = document.getElementById("toasts");
    var icon = { ok: "check-circle-fill", warn: "exclamation-triangle-fill", ai: "stars", bad: "x-circle-fill", info: "info-circle-fill" }[type || "ok"];
    var t = document.createElement("div");
    t.className = "toast-ca " + (type || "ok");
    t.setAttribute("role", "status");
    t.innerHTML = '<i class="bi bi-' + icon + '"></i><span>' + msg + "</span>";
    wrap.appendChild(t);
    setTimeout(function () { t.classList.add("out"); setTimeout(function () { t.remove(); }, 300); }, 3600);
  };

  // ---------- modal / confirm ----------
  var modalEl, modalObj, modalOk;
  CA.modal = function (o) {
    modalEl = modalEl || document.getElementById("app-modal");
    modalObj = modalObj || new bootstrap.Modal(modalEl);
    modalEl.querySelector(".modal-dialog").className = "modal-dialog modal-dialog-scrollable " + (o.size || "");
    modalEl.querySelector(".modal-title").innerHTML = o.title;
    modalEl.querySelector(".modal-body").innerHTML = o.body;
    var foot = modalEl.querySelector(".modal-footer");
    foot.innerHTML = (o.cancel === false ? "" : '<button type="button" class="btn btn-soft" data-bs-dismiss="modal">' + (o.cancelText || "Cancel") + "</button>") +
      (o.okText ? '<button type="button" class="btn ' + (o.okCls || "btn-ink") + '" id="modal-ok">' + o.okText + "</button>" : "");
    modalOk = o.onOk;
    var okBtn = foot.querySelector("#modal-ok");
    if (okBtn) okBtn.addEventListener("click", function () {
      var body = modalEl.querySelector(".modal-body");
      var form = body.querySelector("form");
      if (form && !form.checkValidity()) { form.classList.add("was-validated"); return; }
      var res = modalOk ? modalOk(body) : true;
      if (res !== false) modalObj.hide();
    });
    modalObj.show();
  };
  CA.confirm = function (title, text, okText, onOk, okCls) {
    CA.modal({ title: title, body: "<p>" + text + "</p>", okText: okText || "Confirm", okCls: okCls, onOk: function () { onOk(); } });
  };

  // ---------- form helpers ----------
  CA.formData = function (form) {
    var o = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name) return;
      if (el.type === "checkbox") { if (el.dataset.multi) { o[el.name] = o[el.name] || []; if (el.checked) o[el.name].push(el.value); } else o[el.name] = el.checked; }
      else if (el.type === "radio") { if (el.checked) o[el.name] = el.value; }
      else if (el.type === "file") { o[el.name] = el.files && el.files[0] ? el.files[0].name : ""; }
      else if (el.multiple) { o[el.name] = Array.prototype.filter.call(el.options, function (op) { return op.selected; }).map(function (op) { return op.value; }); }
      else o[el.name] = el.value.trim();
    });
    return o;
  };
  CA.field = function (o) {
    var id = "f-" + o.name + (o.suffix || "");
    var req = o.required ? " required" : "";
    var lab = '<label class="form-label' + (o.required ? " req" : "") + '" for="' + id + '">' + esc(o.label) + "</label>";
    var input;
    if (o.type === "select") {
      input = '<select class="form-select" id="' + id + '" name="' + o.name + '"' + req + (o.multiple ? " multiple size=\"" + (o.size || 4) + "\"" : "") + ">" + (o.placeholder ? '<option value="">' + esc(o.placeholder) + "</option>" : "") +
        o.options.map(function (op) { var v = Array.isArray(op) ? op[0] : op, l = Array.isArray(op) ? op[1] : op; var sel = Array.isArray(o.value) ? o.value.indexOf(v) > -1 : o.value === v; return '<option value="' + esc(v) + '"' + (sel ? " selected" : "") + ">" + esc(l) + "</option>"; }).join("") + "</select>";
    } else if (o.type === "textarea") {
      input = '<textarea class="form-control" id="' + id + '" name="' + o.name + '" rows="' + (o.rows || 3) + '"' + req + (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : "") + (o.readonly ? " readonly" : "") + ">" + esc(o.value || "") + "</textarea>";
    } else {
      input = '<input class="form-control' + (o.readonly ? " rule-field" : "") + '" id="' + id + '" name="' + o.name + '" type="' + (o.type || "text") + '" value="' + esc(o.value || "") + '"' + req + (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : "") + (o.min ? ' min="' + o.min + '"' : "") + (o.max ? ' max="' + o.max + '"' : "") + (o.readonly ? " readonly" : "") + (o.pattern ? ' pattern="' + o.pattern + '"' : "") + ">";
    }
    return '<div class="' + (o.col || "") + '">' + lab + input + (o.help ? '<div class="form-text">' + o.help + "</div>" : "") + (o.required ? '<div class="invalid-feedback">' + esc(o.invalid || "This field is required.") + "</div>" : "") + "</div>";
  };

  // ---------- number counters (respect reduced motion) ----------
  CA.animateCounters = function (root) {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    Array.prototype.forEach.call(root.querySelectorAll("[data-count]"), function (el) {
      var target = parseFloat(el.dataset.count), dec = (String(el.dataset.count).split(".")[1] || "").length;
      var suffix = el.textContent.replace(/^[\d.,\s]+/, "");
      if (reduce || isNaN(target)) return;
      var t0 = null, dur = 700;
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * e).toFixed(dec) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  };
})(window.CA);
