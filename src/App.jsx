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
            <svg className="brand-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="13" stroke="#c9a96e" strokeWidth="1.5" fill="none"/>
              <path d="M8 16 Q10 10 16 16 Q22 22 24 16" stroke="#c9a96e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M8 16 Q10 22 16 16 Q22 10 24 16" stroke="#8a6d3b" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7"/>
              <circle cx="16" cy="16" r="2" fill="#c9a96e" opacity="0.4"/>
            </svg>
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
