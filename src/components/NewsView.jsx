import { useState, useEffect } from 'react';
import { getTeamColors } from '../utils/teamColors';
import { teamSlugs } from '../utils/teamSlugs';

const ALL_TEAMS = Object.entries(teamSlugs).map(([id, slug]) => ({
  id: Number(id),
  slug,
  ...getTeamColors(Number(id)),
})).sort((a, b) => a.name.localeCompare(b.name));

function formatPubDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function ArticleCard({ article }) {
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="article-card"
    >
      {article.thumbnail && (
        <img
          src={article.thumbnail}
          alt=""
          className="article-thumb"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      <div className="article-body">
        <p className="article-date">
          {article.source && <span className="article-source">{article.source} · </span>}
          {formatPubDate(article.pubDate)}
        </p>
        <h3 className="article-title">{article.title}</h3>
        {article.description && (
          <p className="article-desc">{article.description}</p>
        )}
      </div>
    </a>
  );
}

function TeamPicker({ selectedId, onSelect }) {
  const [query, setQuery] = useState('');
  const filtered = query.trim()
    ? ALL_TEAMS.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
    : ALL_TEAMS;

  return (
    <div className="team-picker-wrap">
      <input
        className="team-search"
        type="text"
        placeholder="Filter teams…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="team-picker">
        {filtered.map((team) => {
          const isActive = team.id === selectedId;
          return (
            <button
              key={team.id}
              className={`team-pick-btn ${isActive ? 'active' : ''}`}
              style={isActive ? { '--pick-color': team.primary, borderColor: team.primary, color: team.primary, background: `${team.primary}18` } : { '--pick-color': team.primary }}
              onClick={() => onSelect(team.id)}
            >
              <img
                src={`https://www.mlbstatic.com/team-logos/${team.id}.svg`}
                alt={team.name}
                width={24}
                height={24}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span>{team.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function NewsView({ favoriteTeamId }) {
  const [selectedTeamId, setSelectedTeamId] = useState(favoriteTeamId || 147);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const team = getTeamColors(selectedTeamId);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setArticles([]);

    fetch(`/api/news?teamId=${selectedTeamId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed: ${r.status}`);
        return r.json();
      })
      .then((data) => setArticles(data.articles || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedTeamId]);

  return (
    <div className="news-view">
      <TeamPicker selectedId={selectedTeamId} onSelect={setSelectedTeamId} />

      <div className="news-header" style={{ '--team-color': team.primary }}>
        <img
          src={`https://www.mlbstatic.com/team-logos/${selectedTeamId}.svg`}
          alt={team.name}
          width={36}
          height={36}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <h2 className="news-team-name" style={{ color: team.primary }}>
          {team.name} News
        </h2>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner" />
          Loading news…
        </div>
      )}

      {error && (
        <div className="error">Failed to load news: {error}</div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="empty">No recent news found for this team.</div>
      )}

      {!loading && !error && articles.length > 0 && (
        <div className="articles-list">
          {articles.map((article, i) => (
            <ArticleCard key={i} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
