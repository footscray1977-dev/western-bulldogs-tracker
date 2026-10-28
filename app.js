(function () {
  "use strict";
  var DATA = window.BULLDOGS_DATA;
  var FW = window.FW2026 || {};
  [DATA.ins, DATA.retained, DATA.outs].forEach(function (list) {
    list.forEach(function (p) {
      var s = FW[p.name] || {};
      ["avgK", "avgHB", "avgD", "avgM", "avgG", "avgT", "avgAF", "avgSC", "rankBest", "rankCat"].forEach(function (k) {
        if (p[k] === undefined) p[k] = s[k] === undefined ? null : s[k];
      });
    });
  });
  var state = { tab: "squad", q: "", pos: "All", sortKey: "grade", sortDir: -1 };
  var GRADE_RANK = { "A+": 7, "A": 6, "B+": 5, "B": 4, "C+": 3, "C": 2, "D": 1 };
  var GRADES = ["A+", "A", "B+", "B", "C+", "C", "D"];
  var lastRows = [];

  try {
    var saved = JSON.parse(localStorage.getItem("wb27") || "null");
    if (saved) {
      if (saved.tab) state.tab = saved.tab;
      if (saved.q) state.q = saved.q;
      if (saved.pos) state.pos = saved.pos;
      if (saved.gradeBand) state.gradeBand = saved.gradeBand;
      if (saved.sortKey) state.sortKey = saved.sortKey;
      if (saved.sortDir) state.sortDir = saved.sortDir;
    }
  } catch (e) { /* private mode */ }
  function save() {
    try { localStorage.setItem("wb27", JSON.stringify(state)); } catch (e) { /* private mode */ }
  }

  function $(id) { return document.getElementById(id); }

  var TABS = ["squad", "players", "moves", "timeline", "about"];
  var suppressHash = false;

  function rowsForTab() {
    if (state.tab === "moves") {
      return DATA.ins.map(function (p) { p._s = "in"; return p; })
        .concat(DATA.outs.map(function (p) { p._s = "out"; return p; }));
    }
    var squad = DATA.ins.map(function (p) { p._s = "in"; return p; })
      .concat(DATA.retained.map(function (p) { p._s = "ret"; return p; }));
    return squad;
  }

  function parseHash() {
    try {
      var m = (location.hash || "").match(/^#\/(\w+)/);
      if (m && TABS.indexOf(m[1]) > -1) return m[1];
    } catch (e) { /* no location */ }
    return null;
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

  function bandOf(r) { return r.grade ? r.grade.charAt(0) : "–"; }

  function bandsHTML(squad) {
    var counts = { All: squad.length };
    squad.forEach(function (r) {
      var b = bandOf(r);
      counts[b] = (counts[b] || 0) + 1;
    });
    var order = ["All", "A", "B", "C", "D", "–"];
    var labels = { All: "All grades", A: "A band", B: "B band", C: "C band", D: "D band", "–": "Unrated" };
    return '<div class="gbands" role="group" aria-label="Filter by grade band">' + order.filter(function (b) {
      return counts[b];
    }).map(function (b) {
      return '<button class="gbtn" data-band="' + esc(b) + '" aria-pressed="' + (state.gradeBand === b) + '">' +
        esc(labels[b]) + "<small>" + counts[b] + "</small></button>";
    }).join("") + "</div>";
  }

  function render() {
    renderPosFilter();
    if (!state.gradeBand) state.gradeBand = "All";
    var rows = rowsForTab().filter(function (r) {
      var q = state.q.toLowerCase();
      var hitQ = !q || r.name.toLowerCase().indexOf(q) > -1;
      var hitP = state.pos === "All" || (r.pos || "").split("/").indexOf(state.pos) > -1;
      var hitB = state.gradeBand === "All" || bandOf(r) === state.gradeBand;
      return hitQ && hitP && hitB;
    });
    rows.sort(function (a, b) {
      var k = state.sortKey;
      if (k === "grade") {
        var ar = GRADE_RANK[a.grade] || 0, br = GRADE_RANK[b.grade] || 0;
        if (ar !== br) return (ar - br) * state.sortDir;
        return String(a.name).localeCompare(String(b.name));
      }
      var av = (a[k] === null || a[k] === undefined) ? "" : a[k];
      var bv = (b[k] === null || b[k] === undefined) ? "" : b[k];
      if (k === "avgD" || k === "rankBest") {
        if (av === "" && bv === "") return String(a.name).localeCompare(String(b.name));
        if (av === "") return 1;
        if (bv === "") return -1;
      }
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * state.sortDir;
      return String(av).localeCompare(String(bv)) * state.sortDir;
    });

    var host = $("content");
    if (state.tab === "players") { renderPlayers(host, rows); return; }
    if (state.tab === "moves") { renderMoves(host, rows); return; }

    lastRows = rows;
    var squad = rowsForTab();
    var maxGames = Math.max.apply(null, squad.map(function (r) { return r.games || 0; }).concat([1]));

    var th = function (k, label) {
      var a = state.sortKey === k ? ' <span class="arrow">' + (state.sortDir === 1 ? "▲" : "▼") + "</span>" : "";
      var sel = state.sortKey === k ? (state.sortDir === 1 ? "ascending" : "descending") : "none";
      return '<th data-k="' + k + '" aria-sort="' + sel + '">' + label + a + "</th>";
    };
    var html = leadersHTML(squad) + shapeHTML(squad) + bandsHTML(squad) +
      '<div class="tscroll"><table><thead><tr>' +
      th("name", "Player") + th("_s", "Status") + th("pos", "Pos") + th("grade", "Grade") +
      th("games", "Games") + th("goals", "Goals") + th("avgD", "2026 Avg") + th("rankBest", "AFL Rank") +
      th("ht", "Ht") + th("dob", "Born") +
      "</tr></thead><tbody>" +
      rows.map(function (r, i) {
        var cls = r._s === "in" ? "in-row" : "ret-row";
        var dash = function (v) { return (v === null || v === undefined || v === "") ? "–" : v; };
        var tip = esc(r.honours || r.via || r.note || "");
        var face = r.img ? "<img class='face' src='" + r.img + "' alt='' loading='lazy' onerror='this.remove()'>" : "";
        var pct = r.games ? Math.max(3, Math.round(r.games / maxGames * 100)) : 0;
        return "<tr class='" + cls + "' data-i='" + i + "'><td><span class='who'>" + face + "<span><strong" + (tip ? " title='" + tip + "'" : "") + ">" + esc(r.name) + "</strong>" +
          (r.role ? ' <span class="muted">(' + esc(r.role) + ")</span>" : "") +
          (r.num ? ' <span class="muted">#' + esc(r.num) + "</span>" : "") + "</span></span></td>" +
          "<td>" + pill(r._s) + "</td>" +
          "<td>" + esc(r.pos || "–") + "</td>" +
          "<td><span class='grade g" + esc((r.grade || "u").replace("+", "p")) + "'>" + dash(r.grade) + "</span></td>" +
          "<td><span class='gcell'><span class='gbar'><i style='width:" + pct + "%'></i></span>" + dash(r.games) + "</span></td>" +
          "<td>" + dash(r.goals) + "</td>" +
          "<td>" + (r.avgD === null || r.avgD === undefined ? "–" : r.avgD.toFixed(1)) + "</td>" +
          "<td>" + (r.rankBest ? "<span class='rank'>#" + r.rankBest + " " + esc(r.rankCat || "") + "</span>" : "–") + "</td>" +
          "<td>" + dash(r.ht) + "</td>" +
          "<td class='muted'>" + dash(r.dob) + "</td></tr>";
      }).join("") + "</tbody></table></div>" +
      '<div class="count muted">Click a row for the full player profile. 2026 averages + AFL ranks via Footywire; grades via Draftguru.</div>' +
      '<div class="count">' + rows.length + " of " + squad.length + " on the 2027 list view</div>";
    host.innerHTML = html;

    Array.prototype.forEach.call(host.querySelectorAll("th"), function (th) {
      th.addEventListener("click", function () {
        var k = th.getAttribute("data-k");
        if (state.sortKey === k) state.sortDir *= -1;
        else { state.sortKey = k; state.sortDir = 1; }
        save();
        render();
      });
    });
    Array.prototype.forEach.call(host.querySelectorAll("tbody tr"), function (tr) {
      tr.addEventListener("click", function () { openModal(lastRows[+tr.getAttribute("data-i")]); });
    });
    Array.prototype.forEach.call(host.querySelectorAll(".gbtn"), function (b) {
      b.addEventListener("click", function () {
        state.gradeBand = b.getAttribute("data-band");
        save();
        render();
      });
    });
  }

  function cardHTML(r, i) {
    var cls = r._s === "in" ? "in-row" : (r._s === "out" ? "out-row" : "ret-row");
    var rec = (r.games !== undefined && r.games !== null) ? r.games + " games, " + r.goals + " goals" : "";
    return '<div class="card ' + cls + '" data-i="' + i + '"><h3>' +
      (r.img ? "<img class='face big' src='" + r.img + "' alt='' loading='lazy' onerror='this.remove()'>" : "") +
      esc(r.name) + "</h3>" +
      '<div class="via">' + esc(r.via || r.move || "") + (rec ? " · " + rec : "") + "</div>" +
      '<div class="muted">' + esc(r.note || r.detail || "") + "</div>" +
      (r.honours ? '<div class="muted">Honours: ' + esc(r.honours) + "</div>" : "") + "</div>";
  }

  function wireCards(host) {
    Array.prototype.forEach.call(host.querySelectorAll(".card, .pcard"), function (c) {
      c.addEventListener("click", function () { openModal(lastRows[+c.getAttribute("data-i")]); });
    });
  }

  function renderPlayers(host, rows) {
    lastRows = rows;
    host.innerHTML = '<div class="pgrid">' + rows.map(function (r, i) {
      var sub = (r.avgD ? r.avgD.toFixed(1) + " avg" : (r.games + " games")) +
        (r.rankBest ? " · #" + r.rankBest + " " + esc(r.rankCat || "") : "");
      return '<div class="pcard" data-i="' + i + '">' +
        (r.img ? "<img src='" + r.img + "' alt='' loading='lazy' onerror='this.remove()'>" : "") +
        "<div class='pname'>" + esc(r.name) + "</div>" +
        "<div class='pmeta'>" + pill(r._s) + " <span class='muted'>" + esc(r.pos || "") + "</span></div>" +
        "<div class='pstat'>" + sub + "</div></div>";
    }).join("") + "</div>" +
      '<div class="count">' + rows.length + " players. Click a card for the full profile.</div>";
    wireCards(host);
  }

  function renderMoves(host, rows) {
    lastRows = rows;
    var ins = rows.filter(function (r) { return r._s === "in"; });
    var outs = rows.filter(function (r) { return r._s === "out"; });
    var group = function (title, list) {
      return "<h2 class='movetitle'>" + title + " (" + list.length + ")</h2>" +
        '<div class="cards">' + list.map(function (r) { return cardHTML(r, rows.indexOf(r)); }).join("") + "</div>";
    };
    host.innerHTML = group("Arrivals — trade & free agency", ins) + group("Departures — delisted & retired", outs);
    wireCards(host);
  }

  function maxBy(rows, k) {
    return rows.reduce(function (best, r) {
      return ((r[k] || 0) > (best[k] || 0)) ? r : best;
    }, rows[0] || {});
  }

  function bestAvg(squad) {
    var elig = squad.filter(function (r) { return r.avgD && (r.g2026 || 0) >= 5; });
    return maxBy(elig.length ? elig : squad, "avgD");
  }

  function leadersHTML(squad) {
    var g = maxBy(squad, "games"), gl = maxBy(squad, "goals"), y = bestAvg(squad);
    var elite = squad.filter(function (r) { return r.grade === "A+" || r.grade === "A"; }).length;
    var cell = function (label, name, val) {
      return '<div class="lead"><div class="l">' + label + "</div>" +
        '<div class="v">' + esc(name || "–") + "</div>" +
        '<div class="s">' + esc(val || "") + "</div></div>";
    };
    return '<div class="leaders">' +
      cell("Most career games", g.name, (g.games || 0) + " games") +
      cell("Most career goals", gl.name, (gl.goals || 0) + " goals") +
      cell("Best 2026 average", y.name, (y.avgD ? y.avgD.toFixed(1) : "–") + " disp per game") +
      '<div class="lead"><div class="l">Elite grades (A+/A)</div><div class="v">' + elite + " players</div>" +
      '<div class="s">of ' + squad.length + " on the list</div></div></div>";
  }

  function shapeHTML(squad) {
    var counts = {}, pos = {};
    squad.forEach(function (r) {
      counts[r.grade || "–"] = (counts[r.grade || "–"] || 0) + 1;
      var p = (r.pos || "–").split("/")[0];
      pos[p] = (pos[p] || 0) + 1;
    });
    var max = Math.max.apply(null, Object.keys(counts).map(function (k) { return counts[k]; }));
    var bars = GRADES.concat(["–"]).filter(function (g) { return counts[g]; }).map(function (g) {
      return '<div class="brow"><span class="bl">' + esc(g) + "</span>" +
        '<span class="btrack"><i style="width:' + Math.round(counts[g] / max * 100) + '%"></i></span>' +
        '<span class="bv">' + counts[g] + "</span></div>";
    }).join("");
    var line = { Def: "Def", Mid: "Mid", Fwd: "Fwd", Ruck: "Ruck", Wing: "Wing" };
    var chips = Object.keys(pos).sort().map(function (p) {
      var cls = line[p] ? "line-" + p : "line-other";
      return '<span class="chip ' + cls + '">' + esc(p) + " · <strong>" + pos[p] + "</strong></span>";
    }).join("");
    return '<div class="panel"><div><h3>Grade spread</h3>' + bars + "</div>" +
      "<div><h3>Positional mix</h3><div class='chips'>" + chips + "</div></div></div>";
  }

  function openModal(r) {
    if (!r) return;
    var dash = function (v) { return (v === null || v === undefined || v === "") ? "–" : v; };
    var avgLine = (r.avgD === null || r.avgD === undefined)
      ? ((r.g2026 !== undefined && r.g2026 !== null) ? r.g2026 + " games" : "–")
      : r.avgD.toFixed(1) + " disp · " + (r.avgAF !== null && r.avgAF !== undefined ? r.avgAF.toFixed(1) + " AF" : "no fantasy avg");
    var rows = [
      ["Status", pill(r._s)], ["Position", dash(r.pos)], ["Grade", dash(r.grade)],
      ["Guernsey", r.num ? "#" + esc(r.num) : "TBC"], ["Born", dash(r.dob)],
      ["Height", dash(r.ht)], ["Drafted", dash(r.drafted)],
      ["Career", (r.games !== undefined && r.games !== null) ? r.games + " games · " + r.goals + " goals" : "–"],
      ["2026 average", avgLine],
      ["AFL rank", r.rankBest ? "#" + r.rankBest + " " + esc(r.rankCat || "") + " per game" : "Unranked"]
    ].map(function (kv) {
      return '<div class="mrow"><span>' + kv[0] + "</span><span>" + kv[1] + "</span></div>";
    }).join("");
    $("modalBody").innerHTML =
      '<div class="mhead">' +
      (r.img ? "<img class='mface' src='" + r.img + "' alt='' onerror='this.remove()'>" : "") +
      "<div><h2>" + esc(r.name) + "</h2>" +
      '<div class="muted">' + esc(r.via || r.move || "") + (r.role ? " · " + esc(r.role) : "") + "</div>" +
      "<div>" + pill(r._s) + "</div></div></div>" +
      '<div class="mgrid">' + rows + "</div>" +
      (r.honours ? "<h3>Honours</h3><div class='mhon'>" + esc(r.honours) + "</div>" : "") +
      ((r.note || r.detail) ? "<p class='muted mnote'>" + esc(r.note || r.detail) + "</p>" : "");
    $("modal").setAttribute("aria-hidden", "false");
  }

  function closeModal() { $("modal").setAttribute("aria-hidden", "true"); }

  function renderTimeline() {
    $("content").innerHTML = '<ol class="timeline">' + DATA.timeline.map(function (t) {
      return '<li><span class="twhen">' + esc(t.when) + "</span>" +
        "<div><strong>" + esc(t.what) + "</strong><p class='muted'>" + esc(t.detail) + "</p></div></li>";
    }).join("") + "</ol>";
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function exportCSV() {
    var rows = rowsForTab();
    var head = ["name", "status", "pos", "num", "grade", "dob", "ht", "games", "goals", "g2026", "gl2026", "avg_disp_2026", "avg_fantasy_2026", "afl_rank", "rank_cat", "via_or_move", "note"];
    var lines = [head.join(",")].concat(rows.map(function (r) {
      var dash = function (v) { return (v === null || v === undefined) ? "" : v; };
      return [r.name, r._s, r.pos || "", dash(r.num), dash(r.grade), dash(r.dob), dash(r.ht),
        dash(r.games), dash(r.goals), dash(r.g2026), dash(r.gl2026), dash(r.avgD), dash(r.avgAF),
        dash(r.rankBest), dash(r.rankCat),
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

    var showTab = function (name, fromHash) {
      if (TABS.indexOf(name) === -1) name = "squad";
      Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (x) {
        x.setAttribute("aria-selected", x.getAttribute("data-tab") === name ? "true" : "false");
      });
      state.tab = name;
      var searchOn = (name === "squad" || name === "players");
      var posOn = (name === "squad");
      $("search").style.display = searchOn ? "" : "none";
      $("posFilter").style.display = posOn ? "" : "none";
      $("exportBtn").style.display = (name === "about" || name === "timeline") ? "none" : "";
      save();
      if (!fromHash) {
        try {
          suppressHash = true;
          location.hash = "#/" + name;
        } catch (e) { /* no location */ }
      }
      if (name === "about") { renderGuide(); return; }
      if (name === "timeline") { renderTimeline(); return; }
      render();
    };
    try {
      window.addEventListener("hashchange", function () {
        if (suppressHash) { suppressHash = false; return; }
        var h = parseHash();
        if (h && h !== state.tab) showTab(h, true);
      });
    } catch (e) { /* no window */ }
    Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (t) {
      t.addEventListener("click", function () {
        state.pos = "All";
        showTab(t.getAttribute("data-tab"));
      });
    });
    $("search").value = state.q || "";
    $("search").addEventListener("input", function (e) { state.q = e.target.value; save(); render(); });
    $("posFilter").addEventListener("change", function (e) { state.pos = e.target.value; save(); render(); });
    $("exportBtn").addEventListener("click", exportCSV);
    $("darkBtn").addEventListener("click", function () {
      var dark = document.body.className.indexOf("dark") === -1;
      document.body.className = dark ? "dark" : "";
      try { localStorage.setItem("wb27dark", dark ? "1" : "0"); } catch (e) { /* private mode */ }
    });
    try {
      if (localStorage.getItem("wb27dark") === "1") document.body.className = "dark";
    } catch (e) { /* private mode */ }
    $("modalClose").addEventListener("click", closeModal);
    $("modal").addEventListener("click", function (e) { if (e.target === $("modal")) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });

    var foot = $("sources");
    foot.innerHTML = "Sources: " + DATA.meta.sources.map(function (s) {
      return '<a href="' + s.url + '" target="_blank" rel="noopener">' + esc(s.label) + "</a>";
    }).join(" · ");
    var start = parseHash() || (TABS.indexOf(state.tab) > -1 ? state.tab : "squad");
    showTab(start, true);
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
