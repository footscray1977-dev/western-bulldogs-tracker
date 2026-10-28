// Coverage check: every player-list member must appear on every player tab.
// Run:  node tests/coverage.js            (checks all tabs, exits non-zero on gap)
// Tab renders run in a minimal DOM stub; each tab is rendered in a child
// process and the player names found there are asserted against the roster.
const { execFileSync } = require("child_process");

const TABS = ["squad", "leaders", "players", "compare", "advanced", "ranks", "moves"];

function renderNames(tab) {
  const src = `
const fs = require('fs');
function el() { return { innerHTML:'', textContent:'', style:{}, value:'', attrs:{},
  setAttribute(k,v){this.attrs[k]=v}, getAttribute(k){return k in this.attrs?this.attrs[k]:null},
  addEventListener(){}, click(){}, querySelectorAll(){ return []; } }; }
const ids = {};
const tabs = ${JSON.stringify(TABS)}.map(t => { const e = el(); e.attrs={'data-tab':t,'aria-selected':'false'}; return e; });
const handlers = {};
global.window = { addEventListener(ev,fn){ handlers[ev]=fn; } };
global.location = { _h:'', set hash(v){ this._h=v; }, get hash(){ return this._h; } };
global.document = { getElementById: id => ids[id] || (ids[id]=el()),
  querySelectorAll: sel => sel==='.tab' ? tabs : [], createElement: () => ({ click(){} }),
  addEventListener: (ev,fn) => { handlers[ev]=fn; }, body: { className:'' } };
global.localStorage = { _s:{wb27: JSON.stringify({tab:'${tab}'})},
  getItem(k){return this._s[k]||null}, setItem(k,v){this._s[k]=v} };
global.Blob = function(){}; global.URL = { createObjectURL:()=>'x', revokeObjectURL(){} };
eval(fs.readFileSync('data/players.js','utf8'));
eval(fs.readFileSync('data/stats2026.js','utf8'));
eval(fs.readFileSync('data/advanced.js','utf8'));
eval(fs.readFileSync('app.js','utf8'));
handlers.DOMContentLoaded();
const html = ids.content.innerHTML;
// names visible to a reader: <strong>, <option>, and plain-text mentions
const found = new Set();
for (const m of html.matchAll(/<strong[^>]*>([^<]+)<\\/strong>/g)) found.add(m[1]);
for (const m of html.matchAll(/<div class='pname'>([^<]+)<\\/div>/g)) found.add(m[1]);
for (const m of html.matchAll(/<option[^>]*>([^<]+)<\\/option>/g)) found.add(m[1]);
console.log(JSON.stringify({ names: [...found], html }));
`;
  return JSON.parse(execFileSync(process.execPath, ["-e", src], { cwd: __dirname + "/.." }).toString());
}

// Roster expectations per tab. Moves covers movers (ins+outs); timeline/about
// are narrative and exempt; every other player tab must name all 37.
const players = require("child_process").execFileSync(process.execPath, ["-e",
  "global.window={};require('./data/players.js');const d=window.BULLDOGS_DATA;" +
  "console.log(JSON.stringify({squad:[...d.ins,...d.retained].map(p=>p.name)," +
  "moves:[...d.ins,...d.outs].map(p=>p.name)}))"], { cwd: __dirname + "/.." }).toString();

const { squad, moves } = JSON.parse(players);
const expect = { squad, leaders: squad, players: squad, compare: squad, advanced: squad, ranks: squad, moves };

let failures = 0;
for (const tab of TABS) {
  const { names, html } = renderNames(tab);
  const uncut = html.match(/Also on the list[^.]*\./);
  if (uncut) for (const n of expect[tab]) if (uncut[0].includes(n)) names.push(n);
  const missing = expect[tab].filter((n) => !names.includes(n));
  if (missing.length) {
    failures++;
    console.log(`FAIL ${tab}: missing ${missing.length}: ${missing.join("; ")}`);
  } else {
    console.log(`ok ${tab}: all ${expect[tab].length} present`);
  }
}
if (failures) { console.log(`${failures} tab(s) with gaps`); process.exit(1); }
console.log("coverage complete: every player on every tab");
