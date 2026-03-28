import { useState, useEffect } from 'react';
import { fetchBoxScore } from '../utils/api';
import { getTeamColors } from '../utils/teamColors';

function buildRoster(teamData, type) {
  const players = teamData?.players || {};
  const ids = teamData?.[type] || [];          // e.g. batters / pitchers array
  return ids
    .map((id) => players[`ID${id}`])
    .filter(Boolean);
}

function BattingTable({ teamData, teamColors }) {
  const batters = buildRoster(teamData, 'batters');
  const totals  = teamData?.teamStats?.batting || {};

  return (
    <div className="bs-table-wrap">
      <table className="bs-table">
        <thead>
          <tr>
            <th className="bs-name">Batter</th>
            <th>AB</th><th>R</th><th>H</th><th>RBI</th><th>BB</th><th>SO</th><th>AVG</th>
          </tr>
        </thead>
        <tbody>
          {batters.map((p) => {
            const b   = p.stats?.batting || {};
            const pos = p.position?.abbreviation || '';
            const ord = p.battingOrder ? parseInt(p.battingOrder) : 999;
            const isSub = p.battingOrder && p.battingOrder.toString().slice(-1) !== '0';
            return (
              <tr key={p.person?.id} className={isSub ? 'bs-sub' : ''}>
                <td className="bs-name">
                  {isSub && <span className="bs-sub-indent"> </span>}
                  <span className="bs-pos" style={{ color: teamColors.primary }}>{pos}</span>
                  {p.person?.fullName}
                </td>
                <td>{b.atBats ?? '–'}</td>
                <td>{b.runs ?? '–'}</td>
                <td>{b.hits ?? '–'}</td>
                <td>{b.rbi ?? '–'}</td>
                <td>{b.baseOnBalls ?? '–'}</td>
                <td>{b.strikeOuts ?? '–'}</td>
                <td className="bs-avg">{b.avg ?? '–'}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bs-totals">
            <td className="bs-name">Totals</td>
            <td>{totals.atBats ?? '–'}</td>
            <td>{totals.runs ?? '–'}</td>
            <td>{totals.hits ?? '–'}</td>
            <td>{totals.rbi ?? '–'}</td>
            <td>{totals.baseOnBalls ?? '–'}</td>
            <td>{totals.strikeOuts ?? '–'}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function PitchingTable({ teamData, teamColors }) {
  const pitchers = buildRoster(teamData, 'pitchers');
  const totals   = teamData?.teamStats?.pitching || {};

  return (
    <div className="bs-table-wrap">
      <table className="bs-table">
        <thead>
          <tr>
            <th className="bs-name">Pitcher</th>
            <th>IP</th><th>H</th><th>R</th><th>ER</th><th>BB</th><th>SO</th><th>ERA</th>
          </tr>
        </thead>
        <tbody>
          {pitchers.map((p) => {
            const pt = p.stats?.pitching || {};
            const note = p.gameStatus?.isCurrentPitcher ? ' *' : '';
            return (
              <tr key={p.person?.id}>
                <td className="bs-name">
                  {p.person?.fullName}{note}
                </td>
                <td>{pt.inningsPitched ?? '–'}</td>
                <td>{pt.hits ?? '–'}</td>
                <td>{pt.runs ?? '–'}</td>
                <td>{pt.earnedRuns ?? '–'}</td>
                <td>{pt.baseOnBalls ?? '–'}</td>
                <td>{pt.strikeOuts ?? '–'}</td>
                <td className="bs-avg">{pt.era ?? '–'}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bs-totals">
            <td className="bs-name">Totals</td>
            <td>{totals.inningsPitched ?? '–'}</td>
            <td>{totals.hits ?? '–'}</td>
            <td>{totals.runs ?? '–'}</td>
            <td>{totals.earnedRuns ?? '–'}</td>
            <td>{totals.baseOnBalls ?? '–'}</td>
            <td>{totals.strikeOuts ?? '–'}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function TeamBoxScore({ teamData, teamInfo }) {
  const [view, setView] = useState('batting');
  const colors = getTeamColors(teamInfo?.id);

  return (
    <div className="bs-team">
      <div className="bs-team-header">
        <img
          src={`https://www.mlbstatic.com/team-logos/${teamInfo?.id}.svg`}
          alt={teamInfo?.name}
          width={22} height={22}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <span className="bs-team-name" style={{ color: colors.primary }}>
          {teamInfo?.teamName || teamInfo?.name}
        </span>
        <div className="bs-view-toggle">
          <button
            className={`bs-toggle-btn ${view === 'batting' ? 'active' : ''}`}
            onClick={() => setView('batting')}
          >
            Batting
          </button>
          <button
            className={`bs-toggle-btn ${view === 'pitching' ? 'active' : ''}`}
            onClick={() => setView('pitching')}
          >
            Pitching
          </button>
        </div>
      </div>
      {view === 'batting'
        ? <BattingTable  teamData={teamData} teamColors={colors} />
        : <PitchingTable teamData={teamData} teamColors={colors} />
      }
    </div>
  );
}

export default function BoxScore({ gamePk, awayTeam, homeTeam }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetchBoxScore(gamePk)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [gamePk]);

  if (loading) return <div className="loading" style={{ padding: '1rem 0' }}><div className="spinner" /> Loading box score…</div>;
  if (error)   return <div className="error" style={{ margin: '0.5rem 0' }}>Failed to load box score: {error}</div>;
  if (!data)   return null;

  return (
    <div className="box-score">
      <TeamBoxScore teamData={data.teams?.away} teamInfo={awayTeam} />
      <TeamBoxScore teamData={data.teams?.home} teamInfo={homeTeam} />
    </div>
  );
}
