import { useState, useEffect } from 'react';
import { getTeamColors } from '../utils/teamColors';
import { teamSlugs } from '../utils/teamSlugs';

const ALL_TEAMS = Object.entries(teamSlugs).map(([id, slug]) => ({
  id: Number(id),
  slug,
  ...getTeamColors(Number(id)),
})).sort((a, b) => a.name.localeCompare(b.name));

const MLB_GOLD = '#c9a96e';

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

export default function NewsView({ favoriteTeamId }) {
  const [selectedTeamId, setSelectedTeamId] = useState(favoriteTeamId || 0);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAllTeams = selectedTeamId === 0;
  const team = isAllTeams ? null : getTeamColors(selectedTeamId);
  const headerColor = isAllTeams ? MLB_GOLD : team.primary;
  const headerName = isAllTeams ? 'MLB News' : `${team.name} News`;

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
      <div className="news-filter">
        <select
          className="leaders-select"
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(Number(e.target.value))}
        >
          <option value={0}>All Teams</option>
          {ALL_TEAMS.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="news-header">
        {!isAllTeams && (
          <img
            src={`https://www.mlbstatic.com/team-logos/${selectedTeamId}.svg`}
            alt={team.name}
            width={36}
            height={36}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
        <h2 className="news-team-name" style={{ color: headerColor }}>
          {headerName}
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
        <div className="empty">No recent news found.</div>
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
