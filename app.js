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
      if (saved.view) state.view = saved.view;
      if (saved.minG !== undefined) state.minG = saved.minG;
      if (saved.grouped !== undefined) state.grouped = saved.grouped;
      if (saved.lfam) state.lfam = saved.lfam;
      if (saved.lsort) state.lsort = saved.lsort;
      if (saved.ldir) state.ldir = saved.ldir;
      if (saved.sortKey) state.sortKey = saved.sortKey;
      if (saved.sortDir) state.sortDir = saved.sortDir;
    }
  } catch (e) { /* private mode */ }
  function save() {
    try { localStorage.setItem("wb27", JSON.stringify(state)); } catch (e) { /* private mode */ }
  }

  function $(id) { return document.getElementById(id); }

  var TABS = ["squad", "leaders", "players", "moves", "timeline", "about"];
  var FAMS = {
    general: { label: "General", cols: [["games", "Games", "Career games"], ["goals", "Goals", "Career goals"], ["g2026", "2026 G", "Games played in 2026"], ["avgD", "Avg Disp", "Disposals per game, 2026"], ["rankBest", "AFL Rank", "Best per-game league rank, 2026"]] },
    ball: { label: "Ball winners", cols: [["avgK", "Kicks", "Kicks per game, 2026"], ["avgHB", "Handballs", "Handballs per game, 2026"], ["avgD", "Disposals", "Disposals per game, 2026"], ["avgM", "Marks", "Marks per game, 2026"]] },
    defence: { label: "Defence", cols: [["avgT", "Tackles", "Tackles per game, 2026"], ["avgM", "Marks", "Marks per game, 2026"], ["g2026", "2026 G", "Games played in 2026"]] },
    fantasy: { label: "Fantasy", cols: [["avgAF", "AF Avg", "AFL Fantasy average, 2026"], ["avgSC", "SC Avg", "SuperCoach average, 2026"], ["avgD", "Avg Disp", "Disposals per game, 2026"]] }
  };
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

  function lineOf(r) {
    var p = r.pos || "";
    if (p.indexOf("Ruck") > -1) return "Ruck";
    var first = p.split("/")[0];
    if (first === "Wing") return "Mid";
    if (first === "Def" || first === "Mid" || first === "Fwd") return first;
    return "Mid";
  }
  var LINES = ["Def", "Mid", "Fwd", "Ruck"];
  var LINE_NAMES = { Def: "Defenders", Mid: "Midfielders", Fwd: "Forwards", Ruck: "Rucks" };

  function toolsHTML() {
    var seg = function (key, opts) {
      return opts.map(function (o) {
        return '<button class="gbtn" data-k="' + key + '" data-v="' + o[0] + '" aria-pressed="' + (state[key] === o[0]) + '">' + o[1] + "</button>";
      }).join("");
    };
    return '<div class="gbands" role="group" aria-label="Squad view options">' +
      seg("view", [["career", "Career totals"], ["season", "2026 figures"]]) +
      '<span class="tsep"></span>' +
      seg("minG", [[0, "Any games"], [5, "5+ games"], [10, "10+ games"]]) +
      '<span class="tsep"></span>' +
      '<button class="gbtn" data-k="grouped" data-v="toggle" aria-pressed="' + (state.grouped === true) + '">Group by line</button>' +
      "</div>";
  }

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
    if (!state.view) state.view = "career";
    if (state.minG === undefined) state.minG = 0;
    if (state.grouped === undefined) state.grouped = false;
    var season = state.view === "season";
    var rows = rowsForTab().filter(function (r) {
      var q = state.q.toLowerCase();
      var hitQ = !q || r.name.toLowerCase().indexOf(q) > -1;
      var hitP = state.pos === "All" || (r.pos || "").split("/").indexOf(state.pos) > -1;
      var hitB = state.gradeBand === "All" || bandOf(r) === state.gradeBand;
      var hitM = (r.g2026 || 0) >= state.minG;
      return hitQ && hitP && hitB && hitM;
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
    var gk = season ? "g2026" : "games";
    var maxGames = Math.max.apply(null, squad.map(function (r) { return r[gk] || 0; }).concat([1]));

    var th = function (k, label) {
      var a = state.sortKey === k ? ' <span class="arrow">' + (state.sortDir === 1 ? "▲" : "▼") + "</span>" : "";
      var sel = state.sortKey === k ? (state.sortDir === 1 ? "ascending" : "descending") : "none";
      return '<th data-k="' + k + '" aria-sort="' + sel + '">' + label + a + "</th>";
    };
    var dash = function (v) { return (v === null || v === undefined || v === "") ? "–" : v; };
    var rowHTML = function (r, i) {
      var cls = r._s === "in" ? "in-row" : "ret-row";
      var tip = esc(r.honours || r.via || r.note || "");
      var face = r.img ? "<img class='face' src='" + r.img + "' alt='' loading='lazy' onerror='this.remove()'>" : "";
      var gv = season ? r.g2026 : r.games;
      var gl = season ? r.gl2026 : r.goals;
      var pct = gv ? Math.max(3, Math.round(gv / maxGames * 100)) : 0;
      var avail = r.avail ? ' <span class="pill unav">' + esc(r.avail) + "</span>" : "";
      return "<tr class='" + cls + "' data-i='" + i + "'><td><span class='who'>" + face + "<span><strong" + (tip ? " title='" + tip + "'" : "") + ">" + esc(r.name) + "</strong>" +
        (r.role ? ' <span class="muted">(' + esc(r.role) + ")</span>" : "") +
        (r.num ? ' <span class="muted">#' + esc(r.num) + "</span>" : "") + avail + "</span></span></td>" +
        "<td>" + pill(r._s) + "</td>" +
        "<td>" + esc(r.pos || "–") + "</td>" +
        "<td><span class='grade g" + esc((r.grade || "u").replace("+", "p")) + "'>" + dash(r.grade) + "</span></td>" +
        "<td><span class='gcell'><span class='gbar'><i style='width:" + pct + "%'></i></span>" + dash(gv) + "</span></td>" +
        "<td>" + dash(gl) + "</td>" +
        "<td>" + (r.avgD === null || r.avgD === undefined ? "–" : r.avgD.toFixed(1)) + "</td>" +
        "<td>" + (r.rankBest ? "<span class='rank'>#" + r.rankBest + " " + esc(r.rankCat || "") + "</span>" : "–") + "</td>" +
        "<td>" + dash(r.ht) + "</td>" +
        "<td class='muted'>" + dash(r.dob) + "</td></tr>";
    };
    var body;
    if (state.grouped) {
      body = LINES.map(function (ln) {
        var members = rows.filter(function (r) { return lineOf(r) === ln; });
        if (!members.length) return "";
        return "<tr class='grprow'><td colspan='10'>" + LINE_NAMES[ln] + " · " + members.length + "</td></tr>" +
          members.map(function (r) { return rowHTML(r, rows.indexOf(r)); }).join("");
      }).join("");
    } else {
      body = rows.map(function (r, i) { return rowHTML(r, i); }).join("");
    }
    var html = leadersHTML(squad) + shapeHTML(squad) + bandsHTML(squad) + toolsHTML() +
      '<div class="tscroll"><table><thead><tr>' +
      th("name", "Player") + th("_s", "Status") + th("pos", "Pos") + th("grade", "Grade") +
      th(season ? "g2026" : "games", season ? "2026 G" : "Games") +
      th(season ? "gl2026" : "goals", season ? "2026 Gl" : "Goals") +
      th("avgD", "2026 Avg") + th("rankBest", "AFL Rank") +
      th("ht", "Ht") + th("dob", "Born") +
      "</tr></thead><tbody>" + body + "</tbody></table></div>" +
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
        if (b.getAttribute("data-band") !== null) {
          state.gradeBand = b.getAttribute("data-band");
        } else {
          var k = b.getAttribute("data-k"), v = b.getAttribute("data-v");
          if (k === "grouped") state.grouped = !state.grouped;
          else if (k === "minG") state.minG = +v;
          else state[k] = v;
        }
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
      ["Contract", r.contract ? esc(r.contract) : "TBC"],
      ["Availability", r.avail ? esc(r.avail) : "Available"],
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

  function renderLeaders(host) {
    if (!state.lfam || !FAMS[state.lfam]) state.lfam = "general";
    if (!state.lsort) { state.lsort = "avgD"; state.ldir = -1; }
    var fam = FAMS[state.lfam];
    var pool = DATA.ins.map(function (p) { p._s = "in"; return p; })
      .concat(DATA.retained.map(function (p) { p._s = "ret"; return p; }))
      .filter(function (r) { return (r.g2026 || 0) >= 5; });
    pool.sort(function (a, b) {
      var k = state.lsort, av = a[k], bv = b[k];
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      if (av !== bv) return (av - bv) * state.ldir;
      return String(a.name).localeCompare(String(b.name));
    });
    lastRows = pool;
    var cell = function (r, k) {
      var v = r[k];
      if (v === null || v === undefined) return "–";
      if (k === "rankBest") return "<span class='rank'>#" + v + " " + esc(r.rankCat || "") + "</span>";
      if (typeof v === "number" && (k.indexOf("avg") === 0)) return v.toFixed(1);
      return v;
    };
    var html = '<div class="gbands" role="group" aria-label="Stat families">' +
      Object.keys(FAMS).map(function (f) {
        return '<button class="gbtn" data-lfam="' + f + '" aria-pressed="' + (state.lfam === f) + '">' + FAMS[f].label + "</button>";
      }).join("") + "</div>" +
      '<div class="tscroll"><table><thead><tr><th>#</th><th>Player</th>' +
      fam.cols.map(function (c) {
        var a = state.lsort === c[0] ? ' <span class="arrow">' + (state.ldir === 1 ? "▲" : "▼") + "</span>" : "";
        var sel = state.lsort === c[0] ? (state.ldir === 1 ? "ascending" : "descending") : "none";
        return '<th data-lk="' + c[0] + '" aria-sort="' + sel + '" title="' + esc(c[2]) + '">' + esc(c[1]) + a + "</th>";
      }).join("") + "</tr></thead><tbody>" +
      pool.map(function (r, i) {
        var face = r.img ? "<img class='face' src='" + r.img + "' alt='' loading='lazy' onerror='this.remove()'>" : "";
        return "<tr data-i='" + i + "'><td>" + (i + 1) + "</td><td><span class='who'>" + face +
          "<strong>" + esc(r.name) + "</strong></span></td>" +
          fam.cols.map(function (c) { return "<td>" + cell(r, c[0]) + "</td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table></div>" +
      '<div class="count muted">Minimum 5 games in 2026. Averages via Footywire; ranks are best per-game league ranks. Hover a header for the definition.</div>';
    host.innerHTML = html;
    Array.prototype.forEach.call(host.querySelectorAll("[data-lfam]"), function (b) {
      b.addEventListener("click", function () {
        state.lfam = b.getAttribute("data-lfam");
        var first = FAMS[state.lfam].cols[0][0];
        state.lsort = first; state.ldir = -1;
        save(); renderLeaders(host);
      });
    });
    Array.prototype.forEach.call(host.querySelectorAll("[data-lk]"), function (th) {
      th.addEventListener("click", function () {
        var k = th.getAttribute("data-lk");
        if (state.lsort === k) state.ldir *= -1;
        else { state.lsort = k; state.ldir = -1; }
        save(); renderLeaders(host);
      });
    });
    Array.prototype.forEach.call(host.querySelectorAll("tbody tr"), function (tr) {
      tr.addEventListener("click", function () { openModal(lastRows[+tr.getAttribute("data-i")]); });
    });
  }

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
      if (name === "leaders") { renderLeaders($("content")); return; }
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
