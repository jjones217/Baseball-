const KEY = 'navhawk_favorite_team';

export function getFavoriteTeamId() {
  try {
    const val = localStorage.getItem(KEY);
    return val ? Number(val) : null;
  } catch {
    return null;
  }
}

export function setFavoriteTeamId(teamId) {
  try {
    localStorage.setItem(KEY, String(teamId));
  } catch {
    // localStorage unavailable (private browsing, strict settings) — silently ignore
  }
}
