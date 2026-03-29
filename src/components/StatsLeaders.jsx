import { useState, useEffect } from 'react';
import { fetchStatLeaders } from '../utils/api';
import { getTeamColors, teamColors } from '../utils/teamColors';
import TopPerformers from './TopPerformers';

const TEAM_LIST = Object.entries(teamColors)
  .map(([id, t]) => ({ id: Number(id), abbr: t.name }))
  .sort((a, b) => a.abbr.localeCompare(b.abbr));

const POS_OPTIONS = ['C', '1B', '2B', '3B', 'SS', 'OF', 'DH'];

function normalizePos(abbr) {
  if (!abbr) return '';
  if (['LF', 'CF', 'RF'].includes(abbr)) return 'OF';
  return abbr;
}

const FILTERS = [
  { label: 'Daily',   days: 'daily' },
  { label: 'Season',  days: 0       },
  { label: 'Last 30', days: 30      },
  { label: 'Last 7',  days: 7       },
];

function getDateRange(days) {
  if (days === 0) return { startDate: '', endDate: '' };
  const end   = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  const fmt = (d) => `${String(d.getMonth() + 1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`;
  return { startDate: fmt(start), endDate: fmt(end) };
}

function PlayerRow({ rank, player, cols, favoriteTeamId }) {
  const teamId = player.team?.id;
  const isFav  = teamId === favoriteTeamId;
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

function LeaderTable({ title, players, cols, loading, favoriteTeamId, limit = 10, defaultSort }) {
  const [sortKey, setSortKey] = useState(() => defaultSort?.key || cols.find(c => c.primary)?.key || cols[0]?.key);
  const [sortDir, setSortDir] = useState(() => defaultSort?.dir || 'desc');

  // Reset sort when default changes (tab switch)
  useEffect(() => {
    if (defaultSort) {
      setSortKey(defaultSort.key);
      setSortDir(defaultSort.dir);
    }
  }, [defaultSort?.key, defaultSort?.dir]);

  function handleHeaderClick(col) {
    if (sortKey === col.key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(col.key);
      // ERA/WHIP/WHIP-like stats sort ascending by default
      setSortDir(['earnedRunAverage', 'walksAndHitsPerInningPitched'].includes(col.key) ? 'asc' : 'desc');
    }
  }

  const sorted = [...players].sort((a, b) => {
    const av = parseFloat(a.stats[sortKey]) || 0;
    const bv = parseFloat(b.stats[sortKey]) || 0;
    return sortDir === 'asc' ? av - bv : bv - av;
  }).slice(0, limit);

  return (
    <div className="leader-section">
      <h3 className="leader-title">{title}</h3>
      {loading && <div className="loading" style={{ padding: '1.5rem 0' }}><div className="spinner" /> Loading…</div>}
      {!loading && (
        <div className="sl-table-wrap">
          <table className="sl-table">
            <thead>
              <tr>
                <th className="sl-rank">#</th>
                <th className="sl-player">Player</th>
                {cols.map((col) => (
                  <th
                    key={col.key}
                    className={`sl-sortable ${sortKey === col.key ? 'sl-sort-active' : ''}`}
                    onClick={() => handleHeaderClick(col)}
                  >
                    {col.label}
                    {sortKey === col.key && (
                      <span className="sl-sort-arrow">{sortDir === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr><td colSpan={cols.length + 2} className="sl-empty">No data available</td></tr>
              ) : sorted.map((p, i) => (
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

// For short date ranges, meaningful sort keys differ from season-long
function getSortConfig(activeDays) {
  if (activeDays > 0 && activeDays <= 7) {
    return {
      hitter:   { key: 'hits',        dir: 'desc' },
      starter:  { key: 'strikeouts',  dir: 'desc' },
      reliever: { key: 'strikeouts',  dir: 'desc' },
    };
  }
  return {
    hitter:   { key: 'battingAverage',   dir: 'desc' },
    starter:  { key: 'earnedRunAverage', dir: 'asc'  },
    reliever: { key: 'saves',            dir: 'desc' },
  };
}

const isPitcher  = (p) => p.position?.type === 'Pitcher';
const isHitter   = (p) => !isPitcher(p);
// Use gamesStarted to separate starters from relievers
const isStarter  = (p) => isPitcher(p) && Number(p.stats.gamesStarted || 0) > 0;
const isReliever = (p) => isPitcher(p) && Number(p.stats.gamesStarted || 0) === 0;

export default function StatsLeaders({ season, favoriteTeamId }) {
  const [activeDays, setActiveDays] = useState('daily');
  const [hitters,    setHitters]    = useState([]);
  const [starters,   setStarters]   = useState([]);
  const [relievers,  setRelievers]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [teamFilter, setTeamFilter] = useState('');
  const [posFilter,  setPosFilter]  = useState('');

  useEffect(() => {
    if (activeDays === 'daily') return; // handled by TopPerformers
    setLoading(true);
    setError(null);
    const { startDate, endDate } = getDateRange(activeDays);
    const pool  = activeDays === 0 ? 'qualified' : '';
    const opts  = (extra = {}) => ({ startDate, endDate, playerPool: pool, ...extra });

    Promise.all([
      fetchStatLeaders('hitting',  season, opts()),
      fetchStatLeaders('pitching', season, opts({ limit: 300 })),
    ])
      .then(([h, p]) => {
        setHitters(h.filter(isHitter));
        setStarters(p.filter(isStarter));
        setRelievers(p.filter(isReliever));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [season, activeDays]);

  const isShortRange = activeDays === 7;

  const hitterCols = [
    { key: 'hits',                        label: 'H',    primary: isShortRange },
    { key: 'battingAverage',              label: 'AVG',  primary: !isShortRange },
    { key: 'homeRuns',                    label: 'HR'  },
    { key: 'rbi',                         label: 'RBI' },
    { key: 'stolenBases',                 label: 'SB'  },
  ];
  const starterCols = isShortRange ? [
    { key: 'strikeouts',                   label: 'K',    primary: true },
    { key: 'inningsPitched',               label: 'IP'  },
    { key: 'earnedRunAverage',             label: 'ERA' },
    { key: 'walksAndHitsPerInningPitched', label: 'WHIP'},
  ] : [
    { key: 'earnedRunAverage',             label: 'ERA',  primary: true },
    { key: 'wins',                         label: 'W'   },
    { key: 'strikeouts',                   label: 'K'   },
    { key: 'inningsPitched',               label: 'IP'  },
    { key: 'walksAndHitsPerInningPitched', label: 'WHIP'},
  ];
  const relieverCols = [
    { key: 'saves',            label: 'SV',  primary: !isShortRange },
    { key: 'strikeouts',       label: 'K',   primary: isShortRange },
    { key: 'holds',            label: 'HLD' },
    { key: 'inningsPitched',   label: 'IP'  },
    { key: 'earnedRunAverage', label: 'ERA' },
  ];

  function applyFilters(players) {
    return players.filter((p) => {
      if (teamFilter && p.team?.id !== Number(teamFilter)) return false;
      if (posFilter && normalizePos(p.position?.abbreviation) !== posFilter) return false;
      return true;
    });
  }

  const filterBar = (
    <div className="leaders-dropdown-bar">
      <select
        className="leaders-select"
        value={teamFilter}
        onChange={(e) => setTeamFilter(e.target.value)}
      >
        <option value="">All Teams</option>
        {TEAM_LIST.map((t) => (
          <option key={t.id} value={t.id}>{t.abbr}</option>
        ))}
      </select>
      <select
        className="leaders-select"
        value={posFilter}
        onChange={(e) => setPosFilter(e.target.value)}
      >
        <option value="">All Positions</option>
        {POS_OPTIONS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="stats-wrap">
      <div className="leaders-filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.days}
            className={`leaders-filter-btn ${activeDays === f.days ? 'active' : ''}`}
            onClick={() => setActiveDays(f.days)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filterBar}

      {activeDays === 'daily' ? (
        <TopPerformers
          season={season}
          favoriteTeamId={favoriteTeamId}
          teamFilter={teamFilter}
          posFilter={posFilter}
        />
      ) : (
        <>
          {error && <div className="error">{error}</div>}
          <LeaderTable title="Top 10 Hitters"          players={applyFilters(hitters)}   cols={hitterCols}   loading={loading} favoriteTeamId={favoriteTeamId} limit={10} defaultSort={getSortConfig(activeDays).hitter} />
          <LeaderTable title="Top 5 Starting Pitchers" players={applyFilters(starters)}  cols={starterCols}  loading={loading} favoriteTeamId={favoriteTeamId} limit={5}  defaultSort={getSortConfig(activeDays).starter} />
          <LeaderTable title="Top 5 Relievers"         players={applyFilters(relievers)} cols={relieverCols} loading={loading} favoriteTeamId={favoriteTeamId} limit={5}  defaultSort={getSortConfig(activeDays).reliever} />
        </>
      )}
    </div>
  );
}

