import { useState, useEffect, useMemo } from 'react';
import { fetchSchedule, formatDate, classifyDate } from '../utils/api';
import DateNav from './DateNav';
import GameCard from './GameCard';

export default function GamesView({ selectedDate, onDateChange, favoriteTeamId, onSetFavorite }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchSchedule(selectedDate)
      .then(setGames)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const dateClass = classifyDate(selectedDate);
  const dateLabel =
    dateClass === 'today' ? "Today's Games" :
    dateClass === 'yesterday' ? "Yesterday's Games" :
    'Games';

  const sorted = useMemo(() => {
    if (!favoriteTeamId) return games;
    return [...games].sort((a, b) => {
      const aFav = a.teams?.away?.team?.id === favoriteTeamId || a.teams?.home?.team?.id === favoriteTeamId;
      const bFav = b.teams?.away?.team?.id === favoriteTeamId || b.teams?.home?.team?.id === favoriteTeamId;
      return aFav === bFav ? 0 : aFav ? -1 : 1;
    });
  }, [games, favoriteTeamId]);

  return (
    <div className="games-view">
      <DateNav selectedDate={selectedDate} onDateChange={onDateChange} />

      <h2 className="section-title">{dateLabel}</h2>

      {loading && (
        <div className="loading">
          <div className="spinner" />
          Loading games…
        </div>
      )}

      {error && (
        <div className="error">Failed to load games: {error}</div>
      )}

      {!loading && !error && games.length === 0 && (
        <div className="empty">No games scheduled for this date.</div>
      )}

      {!loading && !error && sorted.length > 0 && (
        <div className="games-grid">
          {sorted.map((game) => {
            const isFav =
              game.teams?.away?.team?.id === favoriteTeamId ||
              game.teams?.home?.team?.id === favoriteTeamId;
            return (
              <GameCard
                key={game.gamePk}
                game={game}
                isFavorite={isFav}
                favoriteTeamId={favoriteTeamId}
                onSetFavorite={onSetFavorite}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
