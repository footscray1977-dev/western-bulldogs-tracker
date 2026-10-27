// ============================================================================
// WESTERN BULLDOGS 2027 TRACKER — DATA FILE
// ----------------------------------------------------------------------------
// This is the ONLY file you need to edit to keep the tracker up to date.
// • To add a draftee / signing: push a new object into RETAINED (or INS).
// • To move a player out: move their object into OUTS with a `move` note.
// • Stat columns (age, ht, games, avgDisp, avgGoals) accept numbers or null.
//   Anything null shows as "–" in the dashboard.
// • After editing, commit + push; Vercel redeploys automatically.
// Source snapshot: AFL.com.au ins-and-outs (Oct 2026) + Bulldogs list news.
// ============================================================================

window.BULLDOGS_DATA = {
  meta: {
    club: "Western Bulldogs",
    season: 2027,
    tradePeriod: "2026 AFL Trade Period (Oct 2026)",
    lastUpdated: "2026-10-28",
    sources: [
      { label: "AFL.com.au — Ins and Outs, every club", url: "https://www.afl.com.au/news/1628837/ins-and-outs-every-clubs-full-list-changes-ahead-of-2027" },
      { label: "Draftguru — Bulldogs playing list 2026", url: "https://www.draftguru.com.au/lists/2026/western-bulldogs" },
      { label: "Bulldogs — list changes after the trade period", url: "https://www.westernbulldogs.com.au/news/2151898" }
    ]
  },

  // ---- IN: 2026 trade / free-agency period --------------------------------
  ins: [
    { name: "Zak Butters", via: "Free agent — Port Adelaide", pos: "Mid/Fwd", age: 26, note: "3× All-Australian. Headline recruit; wore No.9 at Port." },
    { name: "Jordon Butts", via: "Free agent — Adelaide", pos: "Def", age: null, note: "Key defender." },
    { name: "Finn Maginness", via: "Trade — Hawthorn", pos: "Mid", age: null, note: "Inside mid / tagger. Pick-swap deal, 9 Oct." },
    { name: "Hudson O'Keeffe", via: "Trade — Carlton", pos: "Ruck", age: null, note: "Developing ruck." }
  ],

  // ---- RETAINED senior list (positions only — add numbers/stats as confirmed)
  retained: [
    { name: "Marcus Bontempelli", pos: "Mid", role: "Captain" },
    { name: "Ed Richards", pos: "Mid" },
    { name: "Bailey Dale", pos: "Def" },
    { name: "Aaron Naughton", pos: "Fwd" },
    { name: "Sam Darcy", pos: "Fwd" },
    { name: "Tim English", pos: "Ruck" },
    { name: "Matthew Kennedy", pos: "Mid" },
    { name: "Ryley Sanders", pos: "Mid" },
    { name: "Rhylee West", pos: "Fwd" },
    { name: "Cody Weightman", pos: "Fwd" },
    { name: "Rory Lobb", pos: "Fwd/Ruck" },
    { name: "Jedd Busslinger", pos: "Def" },
    { name: "Jordan Croft", pos: "Fwd" },
    { name: "James O'Donnell", pos: "Def" },
    { name: "Connor Budarick", pos: "Def" },
    { name: "Lachlan Carmichael", pos: "Mid" },
    { name: "Cooper Hynes", pos: "Mid/Fwd" },
    { name: "Lachie Jaques", pos: "Def" },
    { name: "Will Darcy", pos: "Fwd" },
    { name: "Arthur Jones", pos: "Fwd" },
    { name: "Laitham Vandermeer", pos: "Fwd" },
    { name: "Bailey Williams", pos: "Def" },
    { name: "Sam Davidson", pos: "Wing" },
    { name: "Joel Freijah", pos: "Def" },
    { name: "Luke Cleary", pos: "Def" },
    { name: "Lachlan Bramble", pos: "Def" },
    { name: "Will Lewis", pos: "Ruck/Fwd" },
    { name: "Louis Emmett", pos: "Ruck" }
  ],

  // ---- OUT: delistings, retirements, rookie commitment ---------------------
  outs: [
    { name: "Oskar Baker", move: "Delisted", detail: "Former Demon; first delisting wave post-season." },
    { name: "Harvey Gallagher", move: "Delisted", detail: "No.39 pick 2022; 28 AFL games." },
    { name: "Lachlan Smith", move: "Delisted", detail: "2 AFL games." },
    { name: "Zac Walker", move: "Delisted", detail: "2025 mid-season pick; 24 VFL games, no AFL debut." },
    { name: "Nick Coffield", move: "Delisted", detail: "Former top-10 pick; departed after trade period." },
    { name: "Ryan Gardner", move: "Delisted", detail: "Key defender; 55 games for the club." },
    { name: "Lachie McNeil", move: "Delisted", detail: "85 games, 47 goals since 2021 rookie draft." },
    { name: "Riley Garcia", move: "Delisted — rookie re-draft committed", detail: "Club committed to re-selecting in Nov Rookie Draft." },
    { name: "Tom Liberatore", move: "Retired", detail: "Club great; midfield mainstay." },
    { name: "Adam Treloar", move: "Retired", detail: "All-Australian 2024." },
    { name: "James Harmes", move: "Retired", detail: "Premiership Demon turned Bulldog." }
  ]
};
