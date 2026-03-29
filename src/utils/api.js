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

function normalizeHitting(s) {
  return {
    battingAverage: s.avg          ?? s.battingAverage,
    homeRuns:       s.homeRuns,
    rbi:            s.rbi,
    hits:           s.hits,
    stolenBases:    s.stolenBases,
    baseOnBalls:    s.baseOnBalls,
    atBats:         s.atBats,
    doubles:        s.doubles,
    triples:        s.triples,
    gamesPlayed:    s.gamesPlayed,
  };
}

function normalizePitching(s) {
  return {
    earnedRunAverage:             s.era  ?? s.earnedRunAverage,
    wins:                         s.wins,
    strikeouts:                   s.strikeOuts ?? s.strikeouts,
    inningsPitched:               s.inningsPitched,
    walksAndHitsPerInningPitched: s.whip ?? s.walksAndHitsPerInningPitched,
    saves:                        s.saves,
    holds:                        s.holds,
    earnedRuns:                   s.earnedRuns,
    gamesStarted:                 s.gamesStarted,
    gamesPlayed:                  s.gamesPitched ?? s.gamesPlayed,
    baseOnBalls:                  s.baseOnBalls,
    hits:                         s.hits,
    runs:                         s.runs,
  };
}

// Returns complete stat lines for all players — no partial-category merging
export async function fetchStatLeaders(group, season, { limit = 400, playerPool = '', startDate = '', endDate = '' } = {}) {
  const statsType = startDate ? 'byDateRange' : 'season';
  // Build URL manually — URLSearchParams encodes '/' and ',' which breaks MLB API date and hydrate params
  let url = `${BASE_URL}/stats?stats=${statsType}&gameType=R&season=${season}&hydrate=person,team&limit=${limit}&group=${group}`;
  if (playerPool) url += `&playerPool=${playerPool}`;
  if (startDate)  url += `&startDate=${startDate}`;
  if (endDate)    url += `&endDate=${endDate}`;
  console.log('[fetchStatLeaders] url:', url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Stats fetch failed: ${res.status}`);
  const data = await res.json();

  console.log('[fetchStatLeaders] data.stats length:', data.stats?.length, 'entries:', data.stats?.map(s => `${s.type?.displayName}/${s.group?.displayName}:${s.splits?.length}`));

  // Collect splits from all stats entries (response index can vary by group/type)
  const splits = (data.stats || []).flatMap(s => s.splits || []);

  // Deduplicate by player ID (byDateRange can return multiple rows per player)
  const seen = new Set();
  const unique = splits.filter(split => {
    const id = split.player?.id;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const result = unique.map(split => ({
    person:   split.player,
    team:     split.team,
    position: split.player?.primaryPosition,
    stats:    group === 'hitting' ? normalizeHitting(split.stat) : normalizePitching(split.stat),
  }));
  const allTeamIds = [...new Set(result.map(p => p.team?.id))].sort((a,b) => a-b);
  console.log(`[fetchStatLeaders] group=${group} total=${result.length} teams represented:`, allTeamIds);
  console.log(`[fetchStatLeaders] team 118 (Royals) players:`, result.filter(p => p.team?.id === 118).map(p => p.person?.fullName));
  return result;
}

export async function fetchDailyStats(dateStr, season) {
  // dateStr is YYYY-MM-DD; MLB stats endpoint wants MM/DD/YYYY
  const [y, m, d] = dateStr.split('-');
  const mlbDate = `${m}/${d}/${y}`;
  const base = `${BASE_URL}/stats?stats=byDateRange&gameType=R&startDate=${mlbDate}&endDate=${mlbDate}&season=${season}&hydrate=person,team&limit=100`;
  const [hRes, pRes] = await Promise.all([
    fetch(`${base}&group=hitting`),
    fetch(`${base}&group=pitching`),
  ]);
  if (!hRes.ok || !pRes.ok) throw new Error('Daily stats fetch failed');
  const [hData, pData] = await Promise.all([hRes.json(), pRes.json()]);
  return {
    hitting:  hData.stats?.[0]?.splits || [],
    pitching: pData.stats?.[0]?.splits || [],
  };
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
