const BASE_URL = 'https://statsapi.mlb.com/api/v1';

export async function fetchSchedule(date) {
  const url = `${BASE_URL}/schedule?sportId=1&date=${date}&hydrate=linescore,decisions,team,probablePitcher`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Schedule fetch failed: ${res.status}`);
  const data = await res.json();
  const games = [];
  for (const dateEntry of data.dates || []) {
    for (const game of dateEntry.games || []) {
      games.push(game);
    }
  }
  return games;
}

export async function fetchStandings(season) {
  const url = `${BASE_URL}/standings?leagueId=103,104&season=${season}&standingsTypes=regularSeason&hydrate=team`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Standings fetch failed: ${res.status}`);
  const data = await res.json();
  return data.records || [];
}

export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Returns 'yesterday', 'today', or 'other'
export function classifyDate(dateStr) {
  const today = new Date();
  const todayStr = formatDate(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);
  if (dateStr === todayStr) return 'today';
  if (dateStr === yesterdayStr) return 'yesterday';
  return 'other';
}

export async function fetchLeaders(categories, season, { limit = 10, playerPool = '', startDate = '', endDate = '' } = {}) {
  const params = new URLSearchParams({
    leaderCategories: categories.join(','),
    season,
    sportId: 1,
    limit,
    hydrate: 'person,team',
    leaderGameTypes: 'R',
    ...(playerPool  && { playerPool }),
    ...(startDate   && { startDate }),
    ...(endDate     && { endDate }),
  });
  const res = await fetch(`${BASE_URL}/stats/leaders?${params}`);
  if (!res.ok) throw new Error(`Leaders fetch failed: ${res.status}`);
  const data = await res.json();

  // Build a map: { personId -> { person, team, stats: { category: value } } }
  const map = new Map();
  for (const board of data.leagueLeaders || []) {
    const cat = board.leaderCategory;
    for (const entry of board.leaders || []) {
      const id = entry.person?.id;
      if (!id) continue;
      if (!map.has(id)) map.set(id, { person: entry.person, team: entry.team, position: entry.person?.primaryPosition, stats: {} });
      map.get(id).stats[cat] = entry.value;
    }
  }
  return Array.from(map.values());
}

export async function fetchBoxScore(gamePk) {
  const res = await fetch(`${BASE_URL}/game/${gamePk}/boxscore`);
  if (!res.ok) throw new Error(`Box score fetch failed: ${res.status}`);
  return res.json();
}

export function getDefaultDate() {
  const now = new Date();
  const hour = now.getHours();
  // Before noon ET, show yesterday
  if (hour < 12) {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return formatDate(yesterday);
  }
  return formatDate(now);
}
