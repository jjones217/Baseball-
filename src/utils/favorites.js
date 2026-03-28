const KEY = 'navhawk_favorite_team';

export function getFavoriteTeamId() {
  const val = localStorage.getItem(KEY);
  return val ? Number(val) : null;
}

export function setFavoriteTeamId(teamId) {
  localStorage.setItem(KEY, String(teamId));
}
