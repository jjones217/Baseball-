import { useState, useEffect } from 'react';
import { fetchLeaders } from '../utils/api';
import { getTeamColors } from '../utils/teamColors';

const HITTER_CATS   = ['battingAverage', 'homeRuns', 'rbi', 'hits', 'stolenBases'];
const STARTER_CATS  = ['earnedRunAverage', 'wins', 'strikeouts', 'inningsPitched', 'walksAndHitsPerInningPitched'];
const RELIEVER_CATS = ['saves', 'holds', 'earnedRunAverage', 'strikeouts'];

function PlayerRow({ rank, player, cols, favoriteTeamId }) {
  const teamId = player.team?.id;
  const isFav = teamId === favoriteTeamId;
  const colors = getTeamColors(teamId);

  return (
    <tr className={isFav ? 'fav-row' : ''} style={isFav ? { '--fav-color': colors.primary } : {}}>
      <td className="sl-rank">{rank}</td>
      <td className="sl-player">
        {isFav && <span className="sl-star">★</span>}
        <span className="sl-name">{player.person?.fullName}</span>
        <span className="sl-team" style={{ color: colors.primary }}>
          {player.team?.abbreviation || player.team?.name}
        </span>
      </td>
      {cols.map((col) => (
        <td key={col.key} className={`sl-stat ${col.primary ? 'sl-primary' : ''}`}>
          {player.stats[col.key] ?? '—'}
        </td>
      ))}
    </tr>
  );
}

function LeaderTable({ title, players, cols, loading, error, favoriteTeamId }) {
  return (
    <div className="leader-section">
      <h3 className="leader-title">{title}</h3>
      {loading && <div className="loading" style={{ padding: '1.5rem 0' }}><div className="spinner" /> Loading…</div>}
      {error   && <div className="error">{error}</div>}
      {!loading && !error && (
        <div className="sl-table-wrap">
          <table className="sl-table">
            <thead>
              <tr>
                <th className="sl-rank">#</th>
                <th className="sl-player">Player</th>
                {cols.map((col) => (
                  <th key={col.key} className={col.primary ? 'sl-primary' : ''}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <PlayerRow
                  key={p.person?.id ?? i}
                  rank={i + 1}
                  player={p}
                  cols={cols}
                  favoriteTeamId={favoriteTeamId}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function StatsLeaders({ season, favoriteTeamId }) {
  const [hitters,   setHitters]   = useState([]);
  const [starters,  setStarters]  = useState([]);
  const [relievers, setRelievers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetchLeaders(HITTER_CATS,   season, { limit: 10 }),
      fetchLeaders(STARTER_CATS,  season, { limit: 10, playerPool: 'qualified' }),
      fetchLeaders(RELIEVER_CATS, season, { limit: 10 }),
    ])
      .then(([h, sp, rp]) => {
        // Sort each group by primary stat, take top N
        setHitters(sortBy(h,  'battingAverage', 'desc').slice(0, 10));
        setStarters(sortBy(sp, 'earnedRunAverage', 'asc').slice(0, 5));
        setRelievers(sortBy(rp, 'saves', 'desc').slice(0, 5));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [season]);

  const hitterCols = [
    { key: 'battingAverage',  label: 'AVG',  primary: true },
    { key: 'homeRuns',        label: 'HR' },
    { key: 'rbi',             label: 'RBI' },
    { key: 'hits',            label: 'H' },
    { key: 'stolenBases',     label: 'SB' },
  ];

  const starterCols = [
    { key: 'earnedRunAverage',              label: 'ERA',  primary: true },
    { key: 'wins',                          label: 'W' },
    { key: 'strikeouts',                    label: 'K' },
    { key: 'inningsPitched',                label: 'IP' },
    { key: 'walksAndHitsPerInningPitched',  label: 'WHIP' },
  ];

  const relieverCols = [
    { key: 'saves',             label: 'SV',  primary: true },
    { key: 'holds',             label: 'HLD' },
    { key: 'earnedRunAverage',  label: 'ERA' },
    { key: 'strikeouts',        label: 'K' },
  ];

  if (error) return <div className="error" style={{ marginTop: '1.5rem' }}>{error}</div>;

  return (
    <div className="stats-wrap">
      <LeaderTable
        title="Top 10 Hitters"
        players={hitters}
        cols={hitterCols}
        loading={loading}
        favoriteTeamId={favoriteTeamId}
      />
      <LeaderTable
        title="Top 5 Starting Pitchers"
        players={starters}
        cols={starterCols}
        loading={loading}
        favoriteTeamId={favoriteTeamId}
      />
      <LeaderTable
        title="Top 5 Relievers"
        players={relievers}
        cols={relieverCols}
        loading={loading}
        favoriteTeamId={favoriteTeamId}
      />
    </div>
  );
}

function sortBy(players, statKey, dir) {
  return [...players].sort((a, b) => {
    const av = parseFloat(a.stats[statKey]) || 0;
    const bv = parseFloat(b.stats[statKey]) || 0;
    return dir === 'asc' ? av - bv : bv - av;
  });
}
