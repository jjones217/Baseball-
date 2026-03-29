import { useState, useEffect } from 'react';
import { fetchDailyStats, formatDate, parseLocalDate } from '../utils/api';
import { getTeamColors } from '../utils/teamColors';

function hitterScore(s) {
  return (s.homeRuns || 0) * 4 + (s.rbi || 0) * 2 + (s.hits || 0) + (s.stolenBases || 0) * 1.5 + (s.baseOnBalls || 0) * 0.5;
}

function pitcherScore(s) {
  const ip = parseFloat(s.inningsPitched || 0);
  return ip * 3 - (s.earnedRuns || 0) * 2 + (s.strikeOuts || 0) * 0.5;
}

function hitterLine(s) {
  const parts = [`${s.hits}-${s.atBats}`];
  if (s.doubles)      parts.push(`${s.doubles} 2B`);
  if (s.triples)      parts.push(`${s.triples} 3B`);
  if (s.homeRuns)     parts.push(`${s.homeRuns} HR`);
  if (s.rbi)          parts.push(`${s.rbi} RBI`);
  if (s.stolenBases)  parts.push(`${s.stolenBases} SB`);
  if (s.baseOnBalls)  parts.push(`${s.baseOnBalls} BB`);
  return parts.join(', ');
}

function pitcherLine(s) {
  return [
    `${s.inningsPitched} IP`,
    `${s.hits} H`,
    `${s.runs} R`,
    `${s.baseOnBalls} BB`,
    `${s.strikeOuts} K`,
  ].join(', ');
}

function PerformerRow({ name, team, line, favoriteTeamId }) {
  const colors = getTeamColors(team?.id);
  const isFav  = team?.id === favoriteTeamId;
  return (
    <div className={`tp-row ${isFav ? 'fav-row' : ''}`} style={isFav ? { '--fav-color': colors.primary } : {}}>
      <span className="tp-name">{name}</span>
      <span className="tp-team" style={{ color: colors.primary }}>{team?.abbreviation}</span>
      <span className="tp-line">{line}</span>
    </div>
  );
}

export default function TopPerformers({ season, favoriteTeamId }) {
  const [hitters,  setHitters]  = useState([]);
  const [pitchers, setPitchers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [date,     setDate]     = useState(() => formatDate(new Date()));

  const today = formatDate(new Date());

  function changeDate(delta) {
    const d = parseLocalDate(date);
    d.setDate(d.getDate() + delta);
    setDate(formatDate(d));
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchDailyStats(date, season)
      .then(({ hitting, pitching }) => {
        const topHitters = hitting
          .filter(s => (s.stat?.atBats || 0) >= 1)
          .sort((a, b) => hitterScore(b.stat) - hitterScore(a.stat))
          .slice(0, 8);

        const topPitchers = pitching
          .filter(s => parseFloat(s.stat?.inningsPitched || 0) >= 1)
          .sort((a, b) => pitcherScore(b.stat) - pitcherScore(a.stat))
          .slice(0, 6);

        setHitters(topHitters);
        setPitchers(topPitchers);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [date, season]);

  const label = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : '—';

  const dateNav = (
    <div className="date-nav" style={{ paddingTop: '0.5rem', paddingBottom: '0.25rem' }}>
      <button className="date-btn" onClick={() => changeDate(-1)}>‹</button>
      <span className="date-label">{label}</span>
      <button className="date-btn" onClick={() => changeDate(1)} disabled={date >= today}>›</button>
    </div>
  );

  if (loading) return (
    <div className="leader-section">
      {dateNav}
      <div className="loading" style={{ padding: '1.5rem 0' }}><div className="spinner" /> Loading…</div>
    </div>
  );

  if (error || (hitters.length === 0 && pitchers.length === 0)) return (
    <div className="leader-section">
      {dateNav}
      <p className="sl-empty" style={{ padding: '1rem 0' }}>No data available for this date.</p>
    </div>
  );

  return (
    <div className="leader-section tp-section">
      {dateNav}
      <div className="tp-columns">
        {hitters.length > 0 && (
          <div className="tp-group">
            <div className="tp-group-label">Hitters</div>
            {hitters.map((s, i) => (
              <PerformerRow
                key={s.player?.id ?? i}
                name={s.player?.fullName}
                team={s.team}
                line={hitterLine(s.stat)}
                favoriteTeamId={favoriteTeamId}
              />
            ))}
          </div>
        )}
        {pitchers.length > 0 && (
          <div className="tp-group">
            <div className="tp-group-label">Pitchers</div>
            {pitchers.map((s, i) => (
              <PerformerRow
                key={s.player?.id ?? i}
                name={s.player?.fullName}
                team={s.team}
                line={pitcherLine(s.stat)}
                favoriteTeamId={favoriteTeamId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
