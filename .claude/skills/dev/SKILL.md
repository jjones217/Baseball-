---
name: dev
description: Developer implementation guide — conventions, API patterns, and key files for the NavHawk MLB Recap app
---

# Developer

You are the developer for the NavHawk MLB Recap app. Implement the requested changes following the existing patterns and conventions in the codebase.

## When invoked:

1. **Read before writing** — Always read the relevant files before making changes. Understand existing code before modifying it.

2. **Follow existing patterns** — Match the style, naming conventions, and architecture already in place. Don't introduce new abstractions unless necessary.

3. **MLB Stats API conventions**
   - Base URL: `https://statsapi.mlb.com/api/v1`
   - Build URLs manually (never use `URLSearchParams` for date or hydrate params — it encodes `/` and `,` which breaks the API)
   - Date format: `MM/DD/YYYY`
   - `hydrate=person,team` for player + team data in stats calls
   - `byDateRange` requires `startDate` and `endDate`; `season` requires `playerPool=qualified` for qualified leaders
   - Append `&group=hitting` or `&group=pitching` at the end of the URL

4. **Component conventions**
   - Components in `src/components/`, utils in `src/utils/`
   - Lazy-load heavy data (box scores, lineups) on user interaction, not on mount
   - Client-side team/position filtering — fetch all data once, filter in render
   - Use `flatMap` across `data.stats` entries for stats API responses (index can vary)
   - Deduplicate players by ID for `byDateRange` responses

5. **Stat key normalization**
   - `/stats` endpoint uses: `avg`, `era`, `strikeOuts`, `whip`
   - Use `normalizeHitting()` and `normalizePitching()` in `src/utils/api.js` to map to consistent keys

6. **Styling**
   - CSS in `src/index.css` (global) and `src/App.css`
   - Mobile breakpoint: `≤600px` — bottom tab bar replaces top nav
   - Team colors via `getTeamColors(teamId)` from `src/utils/teamColors.js`
   - Gold accent: `#c9a96e`, dark background: `#1a1a2e`

7. **After implementing**
   - Commit with a clear message describing what and why
   - Push to `claude/mlb-recap-app-c4jzi`
   - Do not create a PR unless asked

## Key files

- `src/App.jsx` — Root, tab navigation, season constant
- `src/components/GamesView.jsx` — Scores tab, date nav
- `src/components/GameCard.jsx` — Individual game card, expand/collapse
- `src/components/BoxScore.jsx` — Batting/pitching toggle in expanded card
- `src/components/Lineup.jsx` — Pre-game lineup display
- `src/components/StatsLeaders.jsx` — Leaders tab, all 4 filters
- `src/components/TopPerformers.jsx` — Daily top performers with date nav
- `src/components/Standings.jsx` — Standings tab
- `src/components/NewsView.jsx` — News tab
- `src/utils/api.js` — All MLB API fetch functions
- `src/utils/teamColors.js` — Team color map and `getTeamColors()`
