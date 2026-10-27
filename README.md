# Western Bulldogs 2027 List Tracker

Interactive, updateable dashboard for the Bulldogs playing list after the
2026 AFL Trade Period — arrivals, delistings, retirements and squad view.

## Run it locally

Just open `index.html` in a browser (double-click it). No build step,
no dependencies, works offline.

## Keep it updated

All player data lives in one file: [`data/players.js`](data/players.js).
Edit it in any text editor, refresh the page — done. In-season stat
columns (`age` and future averages) show as "–" until you fill them in.

## Publish to GitHub + Vercel

```bash
cd ~/Desktop/western-bulldogs-tracker
gh repo create western-bulldogs-tracker --public --source=. --push
```

Then in Vercel: **Add New → Project → Import** the
`western-bulldogs-tracker` repo. Framework preset: **Other**. No build
command, output directory is the repo root.

Every later data edit is just:

```bash
git add -A && git commit -m "Update list" && git push
```

Vercel redeploys automatically on each push.

## Data sources (Oct 2026 snapshot)

- AFL.com.au — Ins and outs, every club's list changes
- Draftguru — Bulldogs playing list 2026
- westernbulldogs.com.au — list changes after the trade period

## 2026 trade period — confirmed movements

**In (4):** Zak Butters (FA, Port Adelaide), Jordon Butts (FA, Adelaide),
Finn Maginness (trade, Hawthorn), Hudson O'Keeffe (trade, Carlton).

**Out (11):** Oskar Baker, Nick Coffield, Harvey Gallagher, Riley Garcia
(delisted, rookie re-draft committed), Ryan Gardner, Lachie McNeil,
Lachlan Smith, Zac Walker (delisted); Tom Liberatore, Adam Treloar,
James Harmes (retired).
