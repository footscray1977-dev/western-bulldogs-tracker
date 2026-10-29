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
    var saved = JSON.parse(localStorage.getItem("wb28") || "null");
    if (saved) {
      if (saved.tab) state.tab = saved.tab;
      if (saved.q) state.q = saved.q;
      if (saved.pos) state.pos = saved.pos;
      if (saved.gradeBand) state.gradeBand = saved.gradeBand;
      if (saved.view) state.view = saved.view;
      if (saved.grouped !== undefined) state.grouped = saved.grouped;
      if (saved.lfam) state.lfam = saved.lfam;
      if (saved.lsort) state.lsort = saved.lsort;
      if (saved.ldir) state.ldir = saved.ldir;
      if (saved.cmpA) state.cmpA = saved.cmpA;
      if (saved.cmpB) state.cmpB = saved.cmpB;
      if (saved.advM) state.advM = saved.advM;
      if (saved.rplayer) state.rplayer = saved.rplayer;
      if (saved.sortKey) state.sortKey = saved.sortKey;
      if (saved.sortDir) state.sortDir = saved.sortDir;
    }
  } catch (e) { /* private mode */ }
  function save() {
    try { localStorage.setItem("wb28", JSON.stringify(state)); } catch (e) { /* private mode */ }
  }

  function $(id) { return document.getElementById(id); }

  var TABS = ["squad", "leaders", "players", "compare", "advanced", "ranks", "ratings", "moves", "timeline"];
  var TRAITS = [
    ["avgD", "Engine (disposals)"], ["avgK", "Kicking volume"], ["avgHB", "Handball game"],
    ["avgM", "Marking"], ["avgT", "Tackling"], ["avgG", "Scoreboard (goals)"],
    ["avgAF", "Fantasy impact"], ["MG", "Metres gained"], ["SI", "Score involvements"],
    ["CP", "Contested ball"], ["CL", "Clearances"], ["I5", "Inside 50s"]
  ];
  var ADV = window.ADV || { metrics: {}, ranks: {} };
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

  function initials(n) {
    return String(n || "?").split(" ").map(function (w) { return w.charAt(0); }).join("").slice(0, 2).toUpperCase();
  }

  function faceHTML(r, cls) {
    cls = cls || "face";
    if (r && r.img) return "<img class='" + cls + "' src='" + r.img + "' alt='' loading='lazy' onerror='this.remove()'>";
    return "<span class='" + cls + " fb' aria-hidden='true'>" + esc(initials(r && r.name)) + "</span>";
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
    if (state.grouped === undefined) state.grouped = false;
    var season = state.view === "season";
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
      var face = faceHTML(r);
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

  function wireCards(host) {
    Array.prototype.forEach.call(host.querySelectorAll(".pcard"), function (c) {
      c.addEventListener("click", function () { openModal(lastRows[+c.getAttribute("data-i")]); });
    });
  }

  function renderPlayers(host, rows) {
    lastRows = rows;
    host.innerHTML = '<div class="pgrid">' + rows.map(function (r, i) {
      var sub = (r.avgD ? r.avgD.toFixed(1) + " avg" : (r.games + " games")) +
        (r.rankBest ? " · #" + r.rankBest + " " + esc(r.rankCat || "") : "");
      return '<div class="pcard" data-i="' + i + '">' +
        faceHTML(r) +
        "<div class='pname'>" + esc(r.name) + "</div>" +
        "<div class='pmeta'>" + pill(r._s) + " <span class='muted'>" + esc(r.pos || "") + "</span></div>" +
        "<div class='pstat'>" + sub + "</div></div>";
    }).join("") + "</div>" +
      '<div class="count">' + rows.length + " players. Click a card for the full profile.</div>";
    wireCards(host);
  }

  var ORDER = { "10 Feb 2026": 0, "Sep 2026": 1, "9 Oct 2026": 2, "Oct 2026": 3, "Nov 2026": 4 };

  function renderMoves(host, rows) {
    if (!state.mkind) state.mkind = "All";
    if (!state.msort) { state.msort = "date"; state.mdir = 1; }
    lastRows = rows;
    var kinds = ["All", "Arrival", "Delisted", "Retired"];
    var list = rows.filter(function (r) { return state.mkind === "All" || r.kind === state.mkind; });
    list.sort(function (a, b) {
      var k = state.msort, d = state.mdir, c = 0;
      if (k === "date") c = (ORDER[a.date] || 0) - (ORDER[b.date] || 0);
      else c = String(a.name).localeCompare(String(b.name));
      if (c === 0) c = String(a.name).localeCompare(String(b.name));
      return c * d;
    });
    var kpill = function (r) {
      var cls = r.kind === "Arrival" ? "in" : (r.kind === "Retired" ? "ret" : "out");
      return "<span class='pill " + cls + "'>" + esc(r.kind || "–") + "</span>";
    };
    var nArr = rows.filter(function (r) { return r._s === "in"; }).length;
    var nFA = rows.filter(function (r) { return r._s === "in" && (r.via || "").indexOf("Free agent") === 0; }).length;
    var nTr = rows.filter(function (r) { return r._s === "in" && (r.via || "").indexOf("Trade") === 0; }).length;
    var nDel = rows.filter(function (r) { return r.move === "Delisted" || (r.move || "").indexOf("Delisted") === 0; }).length;
    var nRet = rows.filter(function (r) { return r.move === "Retired"; }).length;
    host.innerHTML =
      '<div class="leaders">' +
      '<div class="lead"><div class="l">2026 list</div><div class="v">44 players</div><div class="s">Draftguru 2026 list</div></div>' +
      '<div class="lead"><div class="l">Arrivals</div><div class="v">+' + nArr + '</div><div class="s">' + nFA + ' free agents, ' + nTr + ' trades</div></div>' +
      '<div class="lead"><div class="l">Delisted</div><div class="v">−' + nDel + '</div><div class="s">incl. Garcia rookie re-draft</div></div>' +
      '<div class="lead"><div class="l">Retired</div><div class="v">−' + nRet + '</div><div class="s">Liberatore, Treloar, Harmes</div></div></div>' +
      '<div class="gbands" role="group" aria-label="Filter moves by type">' +
      kinds.map(function (k) {
        var n = k === "All" ? rows.length : rows.filter(function (r) { return r.kind === k; }).length;
        return '<button class="gbtn" data-mkind="' + k + '" aria-pressed="' + (state.mkind === k) + '">' + k + "<small>" + n + "</small></button>";
      }).join("") + "</div>" +
      '<div class="tscroll"><table><thead><tr>' +
      "<th data-mk='date'>Date" + (state.msort === "date" ? ' <span class="arrow">' + (state.mdir === 1 ? "▲" : "▼") + "</span>" : "") + "</th>" +
      "<th data-mk='name'>Player" + (state.msort === "name" ? ' <span class="arrow">' + (state.mdir === 1 ? "▲" : "▼") + "</span>" : "") + "</th>" +
      "<th>Type</th><th>Via / detail</th>" +
      "</tr></thead><tbody>" +
      list.map(function (r) {
        return "<tr data-i='" + rows.indexOf(r) + "'><td>" + esc(r.date || "–") + "</td>" +
          "<td><strong>" + esc(r.name) + "</strong></td><td>" + kpill(r) + "</td>" +
          "<td class='muted'>" + esc(r.via || r.move || "") + (r.detail || r.note ? " — " + esc(r.detail || r.note) : "") + "</td></tr>";
      }).join("") + "</tbody></table></div>" +
      '<div class="count">' + list.length + " of " + rows.length + " moves. Click a row for the full profile.</div>";
    Array.prototype.forEach.call(host.querySelectorAll("[data-mkind]"), function (b) {
      b.addEventListener("click", function () { state.mkind = b.getAttribute("data-mkind"); save(); renderMoves(host); });
    });
    Array.prototype.forEach.call(host.querySelectorAll("[data-mk]"), function (th) {
      th.addEventListener("click", function () {
        var k = th.getAttribute("data-mk");
        if (state.msort === k) state.mdir *= -1;
        else { state.msort = k; state.mdir = 1; }
        save(); renderMoves(host);
      });
    });
    Array.prototype.forEach.call(host.querySelectorAll("tbody tr"), function (tr) {
      tr.addEventListener("click", function () { openModal(lastRows[+tr.getAttribute("data-i")]); });
    });
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

  function peers(line) {
    return DATA.ins.concat(DATA.retained).filter(function (p) { return lineOf(p) === line; });
  }

  function percentile(r, k) {
    if (r[k] === null || r[k] === undefined) return null;
    var group = peers(lineOf(r)).filter(function (p) { return p[k] !== null && p[k] !== undefined; });
    if (group.length < 3) return null;
    var below = group.filter(function (p) { return p[k] < r[k]; }).length;
    return Math.round(below / (group.length - 1) * 100);
  }

  var PCT_STATS = [["avgD", "Disposals"], ["avgM", "Marks"], ["avgT", "Tackles"], ["avgG", "Goals"], ["avgAF", "Fantasy"]];

  function pctBarsHTML(r) {
    var bars = PCT_STATS.map(function (s) {
      var p = percentile(r, s[0]);
      if (p === null) return "";
      return '<div class="prow"><span class="pl">' + s[1] + "</span>" +
        '<span class="ptrack"><i style="width:' + p + '%"></i></span>' +
        '<span class="pv">P' + p + "</span></div>";
    }).join("");
    if (!bars) return "";
    return "<h3>2026 vs " + esc(LINE_NAMES[lineOf(r)].toLowerCase()) + " (percentile)</h3>" +
      '<div class="pbars">' + bars + "</div>";
  }

  function avgStripHTML(r) {
    var chips = [["avgK", "Kicks"], ["avgHB", "Handballs"], ["avgD", "Disposals"], ["avgM", "Marks"], ["avgG", "Goals"], ["avgT", "Tackles"], ["avgAF", "Fantasy"], ["avgSC", "S'Coach"]];
    var any = chips.some(function (c) { return r[c[0]] !== null && r[c[0]] !== undefined; });
    if (!any) return "";
    return "<h3>2026 averages</h3><div class='avgstrip'>" + chips.map(function (c) {
      var v = r[c[0]];
      return "<span class='avgchip'><strong>" + (v === null || v === undefined ? "–" : v.toFixed(1)) + "</strong>" + c[1] + "</span>";
    }).join("") + "</div>";
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
      faceHTML(r, "mface") +
      "<div><h2>" + esc(r.name) + "</h2>" +
      '<div class="muted">' + esc(r.via || r.move || "") + (r.role ? " · " + esc(r.role) : "") + "</div>" +
      "<div>" + pill(r._s) + "</div></div></div>" +
      '<div class="mgrid">' + rows + "</div>" +
      avgStripHTML(r) +
      "<h3>Record</h3><table class='rectable'><thead><tr><th></th><th>Games</th><th>Goals</th><th>Avg Disp</th></tr></thead><tbody>" +
      "<tr><td>2026</td><td>" + dash(r.g2026) + "</td><td>" + dash(r.gl2026) + "</td><td>" + (r.avgD ? r.avgD.toFixed(1) : "–") + "</td></tr>" +
      "<tr><td>Career</td><td>" + dash(r.games) + "</td><td>" + dash(r.goals) + "</td><td>–</td></tr>" +
      "</tbody></table>" +
      pctBarsHTML(r) +
      "<p><button class='gbtn' data-ratings='" + esc(r.name) + "'>Full trait ratings →</button></p>" +
      "<h3>2027 game log</h3><p class='muted mnote'>Round-by-round lines land here after the season opener — no invented numbers, ever.</p>" +
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
      .concat(DATA.retained.map(function (p) { p._s = "ret"; return p; }));
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
        var face = faceHTML(r);
        return "<tr data-i='" + i + "'><td>" + (i + 1) + "</td><td><span class='who'>" + face +
          "<strong>" + esc(r.name) + "</strong></span></td>" +
          fam.cols.map(function (c) { return "<td>" + cell(r, c[0]) + "</td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table></div>" +
      '<div class="count muted">All ' + pool.length + ' on the list, including players yet to record a 2026 average — they sort last with dashes. ' + 'Averages via Footywire; ranks are best per-game league ranks. Hover a header for the definition.</div>';
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

  function squadList() {
    return DATA.ins.map(function (p) { p._s = "in"; return p; })
      .concat(DATA.retained.map(function (p) { p._s = "ret"; return p; }));
  }

  var SQUAD_NAMES = null;
  function isCurrent(n) {
    if (!SQUAD_NAMES) {
      SQUAD_NAMES = {};
      squadList().forEach(function (p) { SQUAD_NAMES[p.name] = true; });
    }
    return !!SQUAD_NAMES[n];
  }

  function renderCompare(host) {
    var list = squadList();
    if (!state.cmpA || !list.some(function (p) { return p.name === state.cmpA; })) state.cmpA = "Marcus Bontempelli";
    if (!state.cmpB || !list.some(function (p) { return p.name === state.cmpB; })) state.cmpB = "Zak Butters";
    var A = list.filter(function (p) { return p.name === state.cmpA; })[0];
    var B = list.filter(function (p) { return p.name === state.cmpB; })[0];
    var opts = function (sel, cur) {
      return '<select data-cmp="' + sel + '">' + list.map(function (p) {
        return '<option value="' + esc(p.name) + '"' + (p.name === cur ? " selected" : "") + ">" + esc(p.name) + "</option>";
      }).join("") + "</select>";
    };
    var dash = function (v) { return (v === null || v === undefined || v === "") ? "–" : v; };
    var num = function (v) { return (v === null || v === undefined) ? "–" : (Math.round(v * 10) / 10); };
    var bars = [["avgD", "Disposals"], ["avgG", "Goals"], ["avgT", "Tackles"], ["avgAF", "Fantasy"]].map(function (s) {
      var av = A[s[0]], bv = B[s[0]];
      var max = Math.max(av || 0, bv || 0, 0.01);
      var bar = function (v, cls) {
        return '<span class="cbar"><i class="' + cls + '" style="width:' + Math.round((v || 0) / max * 100) + '%"></i></span>';
      };
      return '<div class="cmprow"><span>' + num(av) + "</span><span class='cplab'>" + s[1] + "</span><span>" + num(bv) + "</span></div>" +
        '<div class="cmprow bars"><span>' + bar(av, "a") + "</span><span></span><span>" + bar(bv, "b") + "</span></div>";
    }).join("");
    var face = function (p) {
      return faceHTML(p, "mface") +
        "<h2>" + esc(p.name) + "</h2><div>" + pill(p._s) + "</div>" +
        '<div class="muted">' + esc(p.pos || "") + (p.grade ? " · " + esc(p.grade) : "") + "</div>";
    };
    var statRow = function (label, a, b) {
      return "<tr><td>" + a + "</td><td class='clab'>" + label + "</td><td>" + b + "</td></tr>";
    };
    host.innerHTML =
      '<div class="cmphead">' + opts("A", A.name) + '<span class="vs">vs</span>' + opts("B", B.name) + "</div>" +
      '<div class="cmpgrid"><div>' + face(A) + "</div><div>" + face(B) + "</div></div>" +
      '<div class="tscroll"><table class="cmptable"><tbody>' +
      statRow("Career games", dash(A.games), dash(B.games)) +
      statRow("Career goals", dash(A.goals), dash(B.goals)) +
      statRow("2026 games", dash(A.g2026), dash(B.g2026)) +
      statRow("Height", dash(A.ht), dash(B.ht)) +
      statRow("Drafted", dash(A.drafted), dash(B.drafted)) +
      statRow("AFL rank", A.rankBest ? "#" + A.rankBest + " " + esc(A.rankCat || "") : "–", B.rankBest ? "#" + B.rankBest + " " + esc(B.rankCat || "") : "–") +
      "</tbody></table></div>" +
      "<h3>2026 averages head-to-head</h3>" + bars +
      '<div class="count muted">No verdicts — just numbers. Honours live on each profile.</div>';
    Array.prototype.forEach.call(host.querySelectorAll("[data-cmp]"), function (s) {
      s.addEventListener("change", function () {
        state[s.getAttribute("data-cmp") === "A" ? "cmpA" : "cmpB"] = s.value;
        save(); renderCompare(host);
      });
    });
  }

  function byName(n) {
    var all = DATA.ins.concat(DATA.retained, DATA.outs);
    for (var i = 0; i < all.length; i++) if (all[i].name === n) return all[i];
    return null;
  }

  function renderAdvanced(host) {
    var codes = Object.keys(ADV.metrics);
    if (!state.advM || !ADV.metrics[state.advM]) state.advM = codes[0];
    var m = ADV.metrics[state.advM];
    var list = Object.keys(m.rows).filter(isCurrent).map(function (n) {
      return { name: n, rank: m.rows[n].rank || null, avg: ("avg" in m.rows[n]) ? m.rows[n].avg : null,
               rankTot: m.rows[n].rankTot || null, cut: !!m.rows[n].rank };
    }).sort(function (a, b) { return (a.avg || -1) - (b.avg || -1); }).reverse();
    squadList().forEach(function (p) {
      if (!m.rows[p.name]) list.push({ name: p.name, rank: null, avg: null, rankTot: null, cut: false });
    });
    lastRows = list.map(function (e) { return byName(e.name); }).filter(Boolean);
    host.innerHTML =
      '<div class="gbands" role="group" aria-label="Advanced metrics">' +
      codes.map(function (c) {
        return '<button class="gbtn" data-adv="' + c + '" aria-pressed="' + (state.advM === c) + '">' + esc(ADV.metrics[c].label) + "</button>";
      }).join("") + "</div>" +
      '<div class="tscroll"><table><thead><tr><th>#</th><th>Player</th><th>' +
      esc(m.label) + " avg</th><th>AFL rank</th></tr></thead><tbody>" +
      list.map(function (e) {
        var r = byName(e.name);
        var face = faceHTML(r);
        return "<tr data-n='" + esc(e.name) + "'><td>" + (list.indexOf(e) + 1) + "</td>" +
          "<td><span class='who'>" + face + "<strong>" + esc(e.name) + "</strong></span></td>" +
          "<td>" + (e.avg !== null && e.avg !== undefined ? e.avg + (m.unit ? " " + esc(m.unit) : "") : "–") + "</td>" +
          "<td>" + (e.cut ? "<span class='rank'>#" + e.rank + "</span>"
            : (e.rankTot ? "<span class='muted'>#" + e.rankTot + " totals</span>" : "<span class='muted'>outside cut</span>")) + "</td></tr>";
      }).join("") + "</tbody></table></div>" +
      '<div class="count muted">All ' + list.length + ' on the 2027 list — departed players excluded. Gold badges are per-game league ranks; grey ranks are season-totals ranks (averages shown are per-game). Unranked players finished outside the published cuts or did not play.</div>';
    Array.prototype.forEach.call(host.querySelectorAll("[data-adv]"), function (b) {
      b.addEventListener("click", function () { state.advM = b.getAttribute("data-adv"); save(); renderAdvanced(host); });
    });
    Array.prototype.forEach.call(host.querySelectorAll("tbody tr"), function (tr) {
      tr.addEventListener("click", function () {
        var r = byName(tr.getAttribute("data-n"));
        if (r) openModal(r);
      });
    });
  }

  function renderRanks(host) {
    var all = [];
    Object.keys(ADV.ranks).forEach(function (n) {
      if (!isCurrent(n)) return;
      ADV.ranks[n].forEach(function (e) { all.push({ name: n, rank: e.rank, cat: e.cat }); });
    });
    all.sort(function (a, b) { return a.rank - b.rank || String(a.name).localeCompare(String(b.name)); });
    lastRows = all.map(function (e) { return byName(e.name); }).filter(Boolean);
    var ranked = {};
    all.forEach(function (e) { ranked[e.name] = true; });
    var rest = squadList().filter(function (p) { return !ranked[p.name]; })
      .map(function (p) { return p.name; }).sort();
    var unranked = rest.map(function (n) { return byName(n); }).filter(Boolean);
    lastRows = lastRows.concat(unranked);
    host.innerHTML =
      '<div class="tscroll"><table><thead><tr><th>#</th><th>AFL rank</th><th>Player</th><th>Category</th></tr></thead><tbody>' +
      all.map(function (e, i) {
        return "<tr data-i='" + i + "'><td>" + (i + 1) + "</td><td><span class='rank'>#" + e.rank + "</span></td>" +
          "<td><strong>" + esc(e.name) + "</strong></td><td>" + esc(e.cat) + " per game</td></tr>";
      }).join("") +
      unranked.map(function (r, j) {
        var face = faceHTML(r);
        return "<tr data-i='" + (all.length + j) + "'><td>" + (all.length + j + 1) + "</td><td>–</td>" +
          "<td><span class='who'>" + face + "<strong>" + esc(r.name) + "</strong></span></td>" +
          "<td class='muted'>Unranked · outside cuts or yet to debut</td></tr>";
      }).join("") + "</tbody></table></div>" +
      '<div class="count muted">' + all.length + " top-ranking entries held by Bulldogs in 2026, best first, then all " +
      unranked.length + " remaining list players with no ranked cut. Per-game leaderboards via Footywire. Click a row for the profile.</div>";
    Array.prototype.forEach.call(host.querySelectorAll("tbody tr"), function (tr) {
      tr.addEventListener("click", function () { openModal(lastRows[+tr.getAttribute("data-i")]); });
    });
  }

  function traitValue(r, key) {
    if (r[key] !== null && r[key] !== undefined) return r[key];
    var m = ADV.metrics[key];
    if (m && m.rows[r.name]) return m.rows[r.name].avg;
    return null;
  }

  function tierOf(p) {
    if (p === null) return null;
    if (p >= 90) return "Elite";
    if (p >= 65) return "Above average";
    if (p >= 35) return "Average";
    if (p >= 15) return "Below average";
    return "Poor";
  }
  var TIER_CLS = { "Elite": "t-elite", "Above average": "t-above", "Average": "t-avg", "Below average": "t-below", "Poor": "t-poor" };

  function pctVsLine(r, key, val) {
    if (val === null) return null;
    var group = peers(lineOf(r)).map(function (p) { return traitValue(p, key); })
      .filter(function (x) { return x !== null; });
    if (group.length < 3) return null;
    var below = group.filter(function (x) { return x < val; }).length;
    return Math.round(below / (group.length - 1) * 100);
  }

  function renderRatings(host) {
    var list = squadList();
    if (!state.rplayer || !list.some(function (p) { return p.name === state.rplayer; })) state.rplayer = "Marcus Bontempelli";
    var r = byName(state.rplayer);
    var cards = TRAITS.map(function (t) {
      var v = traitValue(r, t[0]);
      var p = pctVsLine(r, t[0], v);
      var tier = tierOf(p);
      return '<div class="tcard"><div class="thead">' + esc(t[1]) + "</div>" +
        (tier ? "<span class='tier " + TIER_CLS[tier] + "'>" + tier + "</span>" +
          '<div class="ptrack"><i style="width:' + p + '%"></i></div>' +
          "<div class='tval'>P" + p + " vs " + esc(LINE_NAMES[lineOf(r)].toLowerCase()) +
          " · " + v + " avg</div>"
          : "<span class='tier t-na'>Unrated</span><div class='tval muted'>no 2026 data</div>") + "</div>";
    }).join("");
    var elite = TRAITS.filter(function (t) {
      var p = pctVsLine(r, t[0], traitValue(r, t[0]));
      return p !== null && p >= 90;
    }).map(function (t) { return t[1]; });
    host.innerHTML =
      '<div class="cmphead"><select data-rplayer>' + list.map(function (p) {
        return '<option value="' + esc(p.name) + '"' + (p.name === r.name ? " selected" : "") + ">" + esc(p.name) + "</option>";
      }).join("") + "</select></div>" +
      '<div class="mhead">' +
      faceHTML(r, "mface") +
      "<div><h2>" + esc(r.name) + "</h2>" +
      '<div class="muted">' + esc(r.pos || "") + (r.grade ? " · grade " + esc(r.grade) : "") + "</div>" +
      (elite.length ? "<div class='muted'>Elite traits: <strong>" + elite.map(esc).join(", ") + "</strong></div>" : "") +
      "</div></div>" +
      '<div class="tgrid">' + cards + "</div>" +
      '<div class="count muted">Draft-prospect style, computed — never official Champion Data ratings. ' +
      "Elite = top 10% of Bulldogs in the same line (CD's own elite band); Above average ≥65th percentile, Average ≥35th, Below average ≥15th, Poor below that. " +
      "Speed, endurance and leap need combine testing and are honestly left out.</div>" +
      "<h3>All " + list.length + " players</h3>" +
      '<div class="pindex">' + list.map(function (p) {
        return "<button class='pidx" + (p.name === r.name ? " on" : "") + "' data-rp='" + esc(p.name) + "'>" + esc(p.name) + "</button>";
      }).join("") + "</div>";
    Array.prototype.forEach.call(host.querySelectorAll("[data-rplayer]"), function (s) {
      s.addEventListener("change", function () { state.rplayer = s.value; save(); renderRatings(host); });
    });
    Array.prototype.forEach.call(host.querySelectorAll("[data-rp]"), function (b) {
      b.addEventListener("click", function () { state.rplayer = b.getAttribute("data-rp"); save(); renderRatings(host); });
    });
  }

  function tlPhoto(t) {
    var s = t.what + " " + t.detail;
    var m = [["Butters", "images/butters.jpg"], ["Butts", "images/butts.jpg"],
      ["Maginness", "images/maginness.jpg"], ["O'Keeffe", "images/okeeffe.jpg"],
      ["O’Keeffe", "images/okeeffe.jpg"], ["Bontempelli", "images/spot-bont.avif"],
      ["Liberatore", null], ["Treloar", null], ["Harmes", null]];
    for (var i = 0; i < m.length; i++) {
      if (s.indexOf(m[i][0]) >= 0) {
        if (!m[i][1]) return "";
        return "<img class='tlphoto' src='" + m[i][1] + "' alt='' loading='lazy' onerror='this.remove()'>";
      }
    }
    return "";
  }
  function renderTimeline() {
    $("content").innerHTML = '<ol class="timeline">' + DATA.timeline.map(function (t) {
      var ph = tlPhoto(t);
      return '<li' + (ph ? ' class="arrival"' : '') + '><span class="twhen">' + esc(t.when) + "</span>" + ph +
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
      $("exportBtn").style.display = (name === "timeline") ? "none" : "";
      save();
      if (!fromHash) {
        try {
          suppressHash = true;
          location.hash = "#/" + name;
        } catch (e) { /* no location */ }
      }
      if (name === "timeline") { renderTimeline(); return; }
      if (name === "leaders") { renderLeaders($("content")); return; }
      if (name === "compare") { renderCompare($("content")); return; }
      if (name === "advanced") { renderAdvanced($("content")); return; }
      if (name === "ranks") { renderRanks($("content")); return; }
      if (name === "ratings") { renderRatings($("content")); return; }
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
    document.addEventListener("click", function (e) {
      var t = e.target;
      while (t && !t.getAttribute) t = t.parentNode;
      var n = t && t.getAttribute ? t.getAttribute("data-ratings") : null;
      if (!n) return;
      state.rplayer = n; save(); closeModal();
      try { location.hash = "#/ratings"; } catch (err) { /* no location */ }
    });

    var foot = $("sources");
    foot.innerHTML = "Sources: " + DATA.meta.sources.map(function (s) {
      return '<a href="' + s.url + '" target="_blank" rel="noopener">' + esc(s.label) + "</a>";
    }).join(" · ");
    var start = parseHash() || (TABS.indexOf(state.tab) > -1 ? state.tab : "squad");
    showTab(start, true);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
