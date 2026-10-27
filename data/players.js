// ============================================================================
// WESTERN BULLDOGS 2027 TRACKER — DATA FILE
// ----------------------------------------------------------------------------
// This is the ONLY file you need to edit to keep the tracker up to date.
// • To add a draftee / signing: push a new object into retained (or ins).
// • To move a player out: move their object into outs with a `move` note.
// • Stat fields per player: num, grade (Draftguru), dob, ht, games/goals
//   (career totals), g2026/gl2026 (2026 games/goals), drafted, honours.
// • After editing, commit + push; Vercel redeploys automatically.
// Sources: AFL.com.au ins-and-outs (Oct 2026); Draftguru Bulldogs 2026 list;
// westernbulldogs.com.au list-changes news.
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

  // ---- RETAINED: Draftguru 2026-list snapshot -------------------------------
  retained: [
    { name: "Marcus Bontempelli", pos: "Mid", num: "4", grade: "A+", dob: "24 Nov 95", ht: "194cm", games: 282, goals: 284, g2026: 24, gl2026: 31, drafted: "#4 National 2013", honours: "AA: 2016, 2019, 2020, 2021, 2023, 2024, 2025; MVP: 2021, 2023, 2024; AFLCA: 2019; B&F: 2016, 2017, 2019, 2021, 2023, 2024; AFLCA Young: 2015; AFLPA 1st: 2014; AA40: 2017, 2022; Prem: 2016", role: "Captain" },
    { name: "Ed Richards", pos: "Mid", num: "20", grade: "A", dob: "3 Jul 99", ht: "185cm", games: 172, goals: 80, g2026: 24, gl2026: 22, drafted: "#16 National 2017", honours: "AA: 2025; B&F: 2025" },
    { name: "Bailey Dale", pos: "Def", num: "31", grade: "A", dob: "22 Jul 96", ht: "182cm", games: 198, goals: 89, g2026: 20, gl2026: 2, drafted: "#45 National 2014", honours: "AA: 2021, 2025; AA40: 2024" },
    { name: "Aaron Naughton", pos: "Fwd", num: "33", grade: "B+", dob: "30 Nov 99", ht: "194cm", games: 190, goals: 337, g2026: 24, gl2026: 51, drafted: "#9 National 2017", honours: "" },
    { name: "Sam Darcy", pos: "Fwd", num: "10", grade: "B+", dob: "19 Jul 03", ht: "205cm", games: 51, goals: 101, g2026: 6, gl2026: 12, drafted: "#2 National 2021", honours: "AA40: 2025" },
    { name: "Tim English", pos: "Ruck", num: "44", grade: "B+", dob: "10 Aug 97", ht: "205cm", games: 171, goals: 96, g2026: 17, gl2026: 6, drafted: "#19 National 2016", honours: "AA: 2023" },
    { name: "Matthew Kennedy", pos: "Mid", num: "8", grade: "B", dob: "6 Apr 97", ht: "188cm", games: 165, goals: 89, g2026: 24, gl2026: 11, drafted: "#13 National 2015", honours: "" },
    { name: "Ryley Sanders", pos: "Mid", num: "9", grade: "C+", dob: "21 Jan 05", ht: "186cm", games: 58, goals: 18, g2026: 23, gl2026: 5, drafted: "#6 National 2023", honours: "Larke: 2023" },
    { name: "Rhylee West", pos: "Fwd", num: "14", grade: "C+", dob: "12 Jul 00", ht: "181cm", games: 105, goals: 103, g2026: 24, gl2026: 18, drafted: "#26 National 2018", honours: "" },
    { name: "Cody Weightman", pos: "Fwd", num: "3", grade: "B", dob: "15 Jan 01", ht: "178cm", games: 87, goals: 133, g2026: 11, gl2026: 7, drafted: "#15 National 2019", honours: "" },
    { name: "Rory Lobb", pos: "Fwd/Ruck", num: "7", grade: "B", dob: "9 Feb 93", ht: "206cm", games: 221, goals: 180, g2026: 22, gl2026: 5, drafted: "#29 National 2013", honours: "" },
    { name: "Jedd Busslinger", pos: "Def", num: "5", grade: "C", dob: "11 Mar 04", ht: "196cm", games: 15, goals: 0, g2026: 8, gl2026: 0, drafted: "#13 National 2022", honours: "" },
    { name: "Jordan Croft", pos: "Fwd", num: "16", grade: "D", dob: "12 May 05", ht: "201cm", games: 19, goals: 17, g2026: 17, gl2026: 13, drafted: "#15 National 2023", honours: "" },
    { name: "James O'Donnell", pos: "Def", num: "18", grade: "C+", dob: "31 Aug 02", ht: "197cm", games: 69, goals: 7, g2026: 21, gl2026: 0, drafted: "Unregistered 2022", honours: "" },
    { name: "Connor Budarick", pos: "Def", num: "19", grade: "C+", dob: "6 Apr 01", ht: "175cm", games: 71, goals: 8, g2026: 16, gl2026: 1, drafted: "#16 Rookie 2019", honours: "Hun-Har: 2019" },
    { name: "Lachlan Carmichael", pos: "Mid", num: "2", grade: "D", dob: "27 Aug 07", ht: "184cm", games: 2, goals: 0, g2026: 2, gl2026: 0, drafted: "#21 National 2025", honours: "" },
    { name: "Cooper Hynes", pos: "Mid/Fwd", num: "6", grade: "C", dob: "28 Feb 06", ht: "190cm", games: 31, goals: 16, g2026: 23, gl2026: 12, drafted: "#20 National 2024", honours: "" },
    { name: "Lachie Jaques", pos: "Def", num: "11", grade: "D", dob: "1 Jun 06", ht: "185cm", games: 10, goals: 0, g2026: 10, gl2026: 0, drafted: "#29 National 2024", honours: "" },
    { name: "Will Darcy", pos: "Fwd", num: "15", grade: "D", dob: "14 Mar 07", ht: "196cm", games: 0, goals: 0, g2026: 0, gl2026: 0, drafted: "#60 National 2025", honours: "" },
    { name: "Arthur Jones", pos: "Fwd", num: "32", grade: "C", dob: "18 Jul 03", ht: "179cm", games: 38, goals: 34, g2026: 20, gl2026: 27, drafted: "#43 National 2021", honours: "" },
    { name: "Laitham Vandermeer", pos: "Fwd", num: "23", grade: "C+", dob: "3 Feb 99", ht: "180cm", games: 89, goals: 45, g2026: 2, gl2026: 1, drafted: "#37 National 2018", honours: "" },
    { name: "Bailey Williams", pos: "Def", num: "34", grade: "B", dob: "10 Oct 97", ht: "187cm", games: 193, goals: 50, g2026: 19, gl2026: 7, drafted: "#48 National 2015", honours: "" },
    { name: "Sam Davidson", pos: "Wing", num: "42", grade: "C+", dob: "13 Dec 01", ht: "191cm", games: 37, goals: 21, g2026: 18, gl2026: 8, drafted: "#51 National 2024", honours: "" },
    { name: "Joel Freijah", pos: "Def", num: "27", grade: "B", dob: "14 Nov 05", ht: "191cm", games: 61, goals: 31, g2026: 25, gl2026: 12, drafted: "#45 National 2023", honours: "" },
    { name: "Luke Cleary", pos: "Def", num: "36", grade: "C+", dob: "5 Mar 02", ht: "189cm", games: 25, goals: 2, g2026: 2, gl2026: 0, drafted: "#61 National 2021", honours: "" },
    { name: "Lachie Bramble", pos: "Def", num: "29", grade: "C+", dob: "19 Apr 98", ht: "181cm", games: 102, goals: 13, g2026: 25, gl2026: 4, drafted: "", honours: "" },
    { name: "Will Lewis", pos: "Ruck/Fwd", num: "28", grade: "D", dob: "5 May 99", ht: "195cm", games: 13, goals: 15, g2026: 13, gl2026: 15, drafted: "SSP 2025", honours: "" },
    { name: "Louis Emmett", pos: "Ruck", num: "25", grade: "D", dob: "23 Mar 07", ht: "200cm", games: 7, goals: 0, g2026: 7, gl2026: 0, drafted: "#27 National 2025", honours: "" },
    { name: "Buku Khamis", pos: "Fwd/Def", num: "24", grade: "C+", dob: "24 Mar 00", ht: "189cm", games: 66, goals: 21, g2026: 25, gl2026: 1, drafted: "Unregistered 2018", honours: "" },
    { name: "Josh Dolan", pos: "Fwd", num: "26", grade: "C", dob: "11 Nov 06", ht: "177cm", games: 24, goals: 6, g2026: 13, gl2026: 5, drafted: "#31 National 2024", honours: "" },
    { name: "Luke Kennedy", pos: "Mid", num: "35", grade: "D", dob: "11 Oct 06", ht: "180cm", games: 8, goals: 2, g2026: 8, gl2026: 2, drafted: "#62 National 2024", honours: "" },
    { name: "Caleb May", pos: "Ruck", num: "22", grade: "D", dob: "13 May 05", ht: "208cm", games: 0, goals: 0, g2026: 0, gl2026: 0, drafted: "#9 Mid-Season 2025", honours: "" },
    { name: "Michael Sellwood", pos: "Def", num: "37", grade: "D", dob: "2 Oct 03", ht: "186cm", games: 24, goals: 0, g2026: 24, gl2026: 0, drafted: "#5 Mid-Season 2024", honours: "" },
  ],

  // ---- OUT: delistings, retirements ----------------------------------------
  outs: [
    { name: "Oskar Baker", move: "Delisted", detail: "Former Demon; first delisting wave post-season.", num: "13", grade: "C", dob: "25 May 98", ht: "182cm", games: 57, goals: 23, g2026: 9, gl2026: 9, drafted: "#48 National 2017", honours: "" },
    { name: "Harvey Gallagher", move: "Delisted", detail: "No.39 pick 2022; 28 AFL games.", num: "12", grade: "C+", dob: "26 Sep 03", ht: "179cm", games: 28, goals: 10, g2026: 3, gl2026: 1, drafted: "#39 National 2022", honours: "" },
    { name: "Lachlan Smith", move: "Delisted", detail: "2 AFL games.", num: "40", grade: "D", dob: "5 Oct 05", ht: "203cm", games: 2, goals: 0, g2026: 2, gl2026: 0, drafted: "#47 National 2023", honours: "" },
    { name: "Zac Walker", move: "Delisted", detail: "2025 mid-season pick; 24 VFL games, no AFL debut.", num: "41", grade: "D", dob: "3 Mar 06", ht: "191cm", games: 0, goals: 0, g2026: 0, gl2026: 0, drafted: "#12 Mid-Season 2024", honours: "" },
    { name: "Nick Coffield", move: "Delisted", detail: "Former top-10 pick; departed after trade period.", num: "17", grade: "B", dob: "23 Oct 99", ht: "191cm", games: 77, goals: 2, g2026: 13, gl2026: 0, drafted: "#8 National 2017", honours: "" },
    { name: "Ryan Gardner", move: "Delisted", detail: "Key defender; 58 games for the club.", num: "43", grade: "B", dob: "1 Jun 97", ht: "197cm", games: 58, goals: 4, g2026: 4, gl2026: 1, drafted: "#59 National 2015", honours: "" },
    { name: "Lachie McNeil", move: "Delisted", detail: "86 games, 47 goals since 2021 rookie draft.", num: "30", grade: "C+", dob: "2 Sep 01", ht: "182cm", games: 86, goals: 47, g2026: 11, gl2026: 5, drafted: "#11 Rookie 2020", honours: "" },
    { name: "Riley Garcia", move: "Delisted — rookie re-draft committed", detail: "Club committed to re-selecting in Nov Rookie Draft.", num: "38", grade: "C", dob: "30 Jan 01", ht: "175cm", games: 39, goals: 15, g2026: 0, gl2026: 0, drafted: "#62 National 2019", honours: "" },
    { name: "Tom Liberatore", move: "Retired", detail: "Club great; midfield mainstay.", num: "21", grade: "A", dob: "16 May 92", ht: "181cm", games: 268, goals: 93, g2026: 11, gl2026: 2, drafted: "#41 National 2010", honours: "B&F: 2014; AA40: 2014, 2023, 2025; Prem: 2016" },
    { name: "Adam Treloar", move: "Retired", detail: "All-Australian 2024.", num: "1", grade: "A", dob: "9 Mar 93", ht: "180cm", games: 263, goals: 158, g2026: 5, gl2026: 2, drafted: "GWS Underage 2010", honours: "AA: 2024; AA40: 2016, 2017, 2019" },
    { name: "James Harmes", move: "Retired", detail: "Premiership Demon turned Bulldog.", num: "", grade: "B", dob: "5 Oct 95", ht: "185cm", games: 174, goals: 94, g2026: 0, gl2026: 0, drafted: "#2 Rookie 2013", honours: "Prem: 2021" },
  ]
};
