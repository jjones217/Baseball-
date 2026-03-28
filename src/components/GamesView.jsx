import { useState, useEffect } from 'react';
import { fetchSchedule, formatDate, classifyDate } from '../utils/api';
import DateNav from './DateNav';
import GameCard from './GameCard';

export default function GamesView({ selectedDate, onDateChange }) {
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
        <div className="error">
          Failed to load games: {error}
        </div>
      )}

      {!loading && !error && games.length === 0 && (
        <div className="empty">No games scheduled for this date.</div>
      )}

      {!loading && !error && games.length > 0 && (
        <div className="games-grid">
          {games.map((game) => (
            <GameCard key={game.gamePk} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
