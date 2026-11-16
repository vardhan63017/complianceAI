/* Lightweight hash router: #/path/:param?query. Browser back / forward work natively. */
(function (CA) {
  var routes = [];
  CA.route = function (pattern, def) { def.pattern = pattern; def.parts = pattern.split("/"); routes.push(def); };

  CA.parseHash = function () {
    var h = (location.hash || "").replace(/^#\/?/, "");
    var q = {}, qi = h.indexOf("?");
    if (qi > -1) { h.slice(qi + 1).split("&").forEach(function (kv) { var p = kv.split("="); if (p[0]) q[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ""); }); h = h.slice(0, qi); }
    return { path: h || "home", query: q };
  };

  CA.match = function (path) {
    var segs = path.split("/");
    for (var i = 0; i < routes.length; i++) {
      var r = routes[i];
      if (r.parts.length !== segs.length) continue;
      var params = {}, ok = true;
      for (var j = 0; j < segs.length; j++) {
        if (r.parts[j].charAt(0) === ":") params[r.parts[j].slice(1)] = decodeURIComponent(segs[j]);
        else if (r.parts[j] !== segs[j]) { ok = false; break; }
      }
      if (ok) return { route: r, params: params };
    }
    return null;
  };

  CA.go = function (route) {
    var target = "#/" + route;
    if (location.hash === target) CA.render(); else location.hash = target;
  };
  CA.on("go", function (el, ev) {
    if (ev && ev.target.closest("a, button, input, select, label") && ev.target.closest("a, button, input, select, label") !== el) return;
    CA.go(el.dataset.route);
  });

  window.addEventListener("hashchange", function () { CA.render(true); });
})(window.CA);
