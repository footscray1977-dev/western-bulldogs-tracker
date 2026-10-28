(function () {
  "use strict";
  var DATA = window.BULLDOGS_DATA;
  var state = { tab: "squad", q: "", pos: "All", sortKey: "name", sortDir: 1 };

  function $(id) { return document.getElementById(id); }

  function rowsForTab() {
    if (state.tab === "ins") return DATA.ins.map(function (p) { p._s = "in"; return p; });
    if (state.tab === "outs") return DATA.outs.map(function (p) { p._s = "out"; return p; });
    var squad = DATA.ins.map(function (p) { p._s = "in"; return p; })
      .concat(DATA.retained.map(function (p) { p._s = "ret"; return p; }));
    return squad;
  }

  function positions(rows) {
    var set = {};
    rows.forEach(function (r) { (r.pos || "").split("/").forEach(function (x) { if (x) set[x] = 1; }); });
    return ["All"].concat(Object.keys(set).sort());
  }

  function renderPosFilter() {
    var sel = $("posFilter");
    var opts = positions(rowsForTab());
    sel.innerHTML = opts.map(function (p) {
      return '<option value="' + p + '"' + (p === state.pos ? " selected" : "") + ">" + p + "</option>";
    }).join("");
  }

  function pill(s) {
    if (s === "in") return '<span class="pill in">IN</span>';
    if (s === "out") return '<span class="pill out">OUT</span>';
    return '<span class="pill ret">RETAINED</span>';
  }

  function render() {
    renderPosFilter();
    var rows = rowsForTab().filter(function (r) {
      var q = state.q.toLowerCase();
      var hitQ = !q || r.name.toLowerCase().indexOf(q) > -1;
      var hitP = state.pos === "All" || (r.pos || "").split("/").indexOf(state.pos) > -1;
      return hitQ && hitP;
    });
    rows.sort(function (a, b) {
      var k = state.sortKey;
      var av = (a[k] === null || a[k] === undefined) ? "" : a[k];
      var bv = (b[k] === null || b[k] === undefined) ? "" : b[k];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * state.sortDir;
      return String(av).localeCompare(String(bv)) * state.sortDir;
    });

    var host = $("content");
    if (state.tab === "ins" || state.tab === "outs") {
      host.innerHTML = '<div class="cards">' + rows.map(function (r) {
        var cls = r._s === "in" ? "in-row" : "out-row";
        var rec = (r.games !== undefined && r.games !== null) ? r.games + " games, " + r.goals + " goals" : "";
        return '<div class="card ' + cls + '"><h3>' +
          (r.img ? "<img class='face big' src='" + r.img + "' alt='' loading='lazy' onerror='this.remove()'>" : "") +
          esc(r.name) + "</h3>" +
          '<div class="via">' + esc(r.via || r.move || "") + (rec ? " · " + rec : "") + "</div>" +
          '<div class="muted">' + esc(r.note || r.detail || "") + "</div>" +
          (r.honours ? '<div class="muted">Honours: ' + esc(r.honours) + "</div>" : "") + "</div>";
      }).join("") + "</div>" +
        '<div class="count">' + rows.length + " players</div>";
      return;
    }

    var arrow = function (k) { return state.sortKey === k ? ' <span class="arrow">' + (state.sortDir === 1 ? "▲" : "▼") + "</span>" : ""; };
    var html = '<table><thead><tr>' +
      '<th data-k="name">Player' + arrow("name") + "</th>" +
      '<th data-k="_s">Status' + arrow("_s") + "</th>" +
      '<th data-k="pos">Pos' + arrow("pos") + "</th>" +
      '<th data-k="grade">Grade' + arrow("grade") + "</th>" +
      '<th data-k="games">Games' + arrow("games") + "</th>" +
      '<th data-k="goals">Goals' + arrow("goals") + "</th>" +
      '<th data-k="g2026">2026 G·Gl' + arrow("g2026") + "</th>" +
      '<th data-k="ht">Ht' + arrow("ht") + "</th>" +
      '<th data-k="dob">Born' + arrow("dob") + "</th>" +
      "</tr></thead><tbody>" +
      rows.map(function (r) {
        var cls = r._s === "in" ? "in-row" : "ret-row";
        var dash = function (v) { return (v === null || v === undefined || v === "") ? "–" : v; };
        var tip = esc(r.honours || r.via || r.note || "");
        var face = r.img ? "<img class='face' src='" + r.img + "' alt='' loading='lazy' onerror='this.remove()'>" : "";
        return "<tr class='" + cls + "'><td><span class='who'>" + face + "<span><strong" + (tip ? " title='" + tip + "'" : "") + ">" + esc(r.name) + "</strong>" +
          (r.role ? ' <span class="muted">(' + esc(r.role) + ")</span>" : "") +
          (r.num ? ' <span class="muted">#' + esc(r.num) + "</span>" : "") + "</span></span></td>" +
          "<td>" + pill(r._s) + "</td>" +
          "<td>" + esc(r.pos || "–") + "</td>" +
          "<td>" + dash(r.grade) + "</td>" +
          "<td>" + dash(r.games) + "</td>" +
          "<td>" + dash(r.goals) + "</td>" +
          "<td>" + dash(r.g2026) + " · " + dash(r.gl2026) + "</td>" +
          "<td>" + dash(r.ht) + "</td>" +
          "<td class='muted'>" + dash(r.dob) + "</td></tr>";
      }).join("") + "</tbody></table>" +
      '<div class="count muted">Hover a name for honours / arrival note. Grades via Draftguru 2026 list.</div>' +
      '<div class="count">' + rows.length + " of " + rowsForTab().length + " on the 2027 list view</div>";
    host.innerHTML = html;

    Array.prototype.forEach.call(host.querySelectorAll("th"), function (th) {
      th.addEventListener("click", function () {
        var k = th.getAttribute("data-k");
        if (state.sortKey === k) state.sortDir *= -1;
        else { state.sortKey = k; state.sortDir = 1; }
        render();
      });
    });
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function exportCSV() {
    var rows = rowsForTab();
    var head = ["name", "status", "pos", "num", "grade", "dob", "ht", "games", "goals", "g2026", "gl2026", "via_or_move", "note"];
    var lines = [head.join(",")].concat(rows.map(function (r) {
      var dash = function (v) { return (v === null || v === undefined) ? "" : v; };
      return [r.name, r._s, r.pos || "", dash(r.num), dash(r.grade), dash(r.dob), dash(r.ht),
        dash(r.games), dash(r.goals), dash(r.g2026), dash(r.gl2026),
        r.via || r.move || "", ((r.note || r.detail || "") + (r.honours ? " | " + r.honours : "")).replace(/,/g, ";")].map(function (c) {
        return '"' + String(c).replace(/"/g, '""') + '"';
      }).join(",");
    }));
    var blob = new Blob([lines.join("\n")], { type: "text/csv" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "western-bulldogs-2027-" + state.tab + ".csv";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  function init() {
    $("metaLine").textContent = DATA.meta.tradePeriod + " — senior list view ahead of " + DATA.meta.season + ".";
    $("updatedLine").textContent = "Last updated " + DATA.meta.lastUpdated + ". Edit data/players.js to update — no rebuild needed.";
    $("statIn").textContent = DATA.ins.length;
    $("statOut").textContent = DATA.outs.length;
    var delisted = DATA.outs.filter(function (o) { return (o.move || "").indexOf("Delisted") === 0; }).length;
    var retired = DATA.outs.filter(function (o) { return o.move === "Retired"; }).length;
    $("statDel").textContent = delisted;
    $("statRet").textContent = retired;
    $("statSquad").textContent = DATA.ins.length + DATA.retained.length;

    Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (t) {
      t.addEventListener("click", function () {
        Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (x) { x.setAttribute("aria-selected", "false"); });
        t.setAttribute("aria-selected", "true");
        state.tab = t.getAttribute("data-tab");
        state.pos = "All";
        var showTools = (state.tab === "squad");
        $("search").style.display = showTools ? "" : "none";
        $("posFilter").style.display = showTools ? "" : "none";
        if (state.tab === "guide") { renderGuide(); return; }
        render();
      });
    });
    $("search").addEventListener("input", function (e) { state.q = e.target.value; render(); });
    $("posFilter").addEventListener("change", function (e) { state.pos = e.target.value; render(); });
    $("exportBtn").addEventListener("click", exportCSV);

    var foot = $("sources");
    foot.innerHTML = "Sources: " + DATA.meta.sources.map(function (s) {
      return '<a href="' + s.url + '" target="_blank" rel="noopener">' + esc(s.label) + "</a>";
    }).join(" · ");
    render();
  }

  function renderGuide() {
    $("content").innerHTML =
      '<div class="guide"><h3>Keeping this tracker up to date</h3>' +
      "<ol>" +
      "<li>Open <code>data/players.js</code> in any text editor.</li>" +
      "<li>Add draftees to <code>retained</code>, e.g. <code>{ name: \"New Draftee\", pos: \"Mid\" }</code>.</li>" +
      "<li>Move departures into <code>outs</code> with a <code>move</code> label.</li>" +
      "<li>Fill in new draftees' <code>num</code>, <code>dob</code>, <code>ht</code> and <code>drafted</code> details as confirmed, then refresh this page.</li>" +
      "<li>Commit and push — if connected to GitHub + Vercel, the live site updates itself:</li>" +
      "</ol>" +
      "<pre>git add -A && git commit -m \"Update list\" && git push</pre>" +
      "<p class='muted'>Send me your data tables any time and I will merge them into this file for you.</p></div>";
  }

  document.addEventListener("DOMContentLoaded", init);
})();
