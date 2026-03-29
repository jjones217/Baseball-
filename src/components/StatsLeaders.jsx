import { useState, useEffect } from 'react';
import { fetchLeaders } from '../utils/api';
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

const HITTER_CATS   = ['battingAverage', 'homeRuns', 'rbi', 'hits', 'stolenBases'];
const STARTER_CATS  = ['earnedRunAverage', 'wins', 'strikeouts', 'inningsPitched', 'walksAndHitsPerInningPitched'];
const RELIEVER_CATS = ['saves', 'holds', 'earnedRunAverage', 'strikeouts', 'inningsPitched'];

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

function LeaderTable({ title, players, cols, loading, favoriteTeamId }) {
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
                  <th key={col.key} className={col.primary ? 'sl-primary' : ''}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.length === 0 ? (
                <tr><td colSpan={cols.length + 2} className="sl-empty">No data available</td></tr>
              ) : players.map((p, i) => (
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

// Starters fetched via STARTER_CATS will have wins; relievers won't
const isStarter  = (p) => p.stats.wins != null;
// Relievers fetched via RELIEVER_CATS will have saves or holds; starters won't
const isReliever = (p) => p.stats.saves != null || p.stats.holds != null;
const isPitcher  = (p) => p.position?.type === 'Pitcher' || p.position?.abbreviation === 'P';
const isHitter   = (p) => !isPitcher(p);

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
    const opts = (extra = {}) => ({ startDate, endDate, limit: 15, ...extra });

    Promise.all([
      fetchLeaders(HITTER_CATS,   season, opts()),
      fetchLeaders(STARTER_CATS,  season, opts({ playerPool: activeDays === 0 ? 'qualified' : '' })),
      fetchLeaders(RELIEVER_CATS, season, opts()),
    ])
      .then(([h, sp, rp]) => {
        const sc = getSortConfig(activeDays);
        setHitters(sortBy(h.filter(isHitter),    sc.hitter.key,   sc.hitter.dir).slice(0, 10));
        setStarters(sortBy(sp.filter(isStarter),  sc.starter.key,  sc.starter.dir).slice(0, 5));
        setRelievers(sortBy(rp.filter(isReliever),sc.reliever.key, sc.reliever.dir).slice(0, 5));
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
          <LeaderTable title="Top 10 Hitters"           players={applyFilters(hitters)}   cols={hitterCols}   loading={loading} favoriteTeamId={favoriteTeamId} />
          <LeaderTable title="Top 5 Starting Pitchers"  players={applyFilters(starters)}  cols={starterCols}  loading={loading} favoriteTeamId={favoriteTeamId} />
          <LeaderTable title="Top 5 Relievers"          players={applyFilters(relievers)} cols={relieverCols} loading={loading} favoriteTeamId={favoriteTeamId} />
        </>
      )}
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
