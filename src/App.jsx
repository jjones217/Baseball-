import { useState } from 'react';
import GamesView from './components/GamesView';
import Standings from './components/Standings';
import NewsView from './components/NewsView';
import StatsLeaders from './components/StatsLeaders';
import { getDefaultDate } from './utils/api';
import { getFavoriteTeamId, setFavoriteTeamId } from './utils/favorites';
import './App.css';

const CURRENT_SEASON = new Date().getFullYear();

export default function App() {
  const [tab, setTab] = useState('games');
  const [selectedDate, setSelectedDate] = useState(getDefaultDate());
  const [favoriteTeamId, setFavoriteTeam] = useState(() => getFavoriteTeamId());

  function handleSetFavorite(teamId) {
    setFavoriteTeamId(teamId);
    setFavoriteTeam(teamId);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <img
              src="/navhawk-logo.svg"
              alt="NavHawk"
              className="brand-icon"
            />
            <div className="brand-text">
              <span className="brand-name">NavHawk</span>
              <span className="brand-sub">MLB Recap</span>
            </div>
          </div>

          <nav className="app-nav">
            <button
              className={`nav-btn ${tab === 'games' ? 'active' : ''}`}
              onClick={() => setTab('games')}
            >
              Scores
            </button>
            <button
              className={`nav-btn ${tab === 'standings' ? 'active' : ''}`}
              onClick={() => setTab('standings')}
            >
              Standings
            </button>
            <button
              className={`nav-btn ${tab === 'leaders' ? 'active' : ''}`}
              onClick={() => setTab('leaders')}
            >
              Leaders
            </button>
            <button
              className={`nav-btn ${tab === 'news' ? 'active' : ''}`}
              onClick={() => setTab('news')}
            >
              News
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {tab === 'games' && (
          <GamesView
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            favoriteTeamId={favoriteTeamId}
            onSetFavorite={handleSetFavorite}
          />
        )}
        {tab === 'standings' && (
          <Standings season={CURRENT_SEASON} />
        )}
        {tab === 'leaders' && (
          <StatsLeaders season={CURRENT_SEASON} favoriteTeamId={favoriteTeamId} />
        )}
        {tab === 'news' && (
          <NewsView favoriteTeamId={favoriteTeamId} />
        )}
      </main>

      <footer className="app-footer">
        <span>Data via MLB Stats API · NavHawk {CURRENT_SEASON}</span>
      </footer>
    </div>
  );
}
