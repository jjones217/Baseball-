import { useState, useEffect } from 'react';
import { fetchBoxScore } from '../utils/api';
import { getTeamColors } from '../utils/teamColors';

function buildBatters(teamData) {
  const players = teamData?.players || {};
  const batterIds = teamData?.batters || [];
  return batterIds
    .map((id) => players[`ID${id}`])
    .filter(Boolean)
    .filter((p) => p.battingOrder)
    .filter((p) => String(p.battingOrder).endsWith('0')) // starters only, not subs
    .sort((a, b) => Number(a.battingOrder) - Number(b.battingOrder));
}

function LineupColumn({ teamData, team, probablePitcher }) {
  const colors = getTeamColors(team?.id);
  const batters = buildBatters(teamData);

  return (
    <div className="lineup-col">
      <div className="lineup-team-name" style={{ color: colors.primary }}>
        {team?.teamName || team?.name}
      </div>
      {batters.length > 0 ? (
        <ol className="lineup-list">
          {batters.map((p) => (
            <li key={p.person?.id} className="lineup-row">
              <span className="lineup-pos" style={{ color: colors.primary }}>
                {p.position?.abbreviation || '—'}
              </span>
              <span className="lineup-name">{p.person?.fullName}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="lineup-tbd">Lineup not yet posted</p>
      )}
      {probablePitcher && (
        <div className="lineup-sp">
          <span className="lineup-pos" style={{ color: colors.primary }}>SP</span>
          <span className="lineup-name">{probablePitcher.fullName}</span>
        </div>
      )}
    </div>
  );
}

export default function Lineup({ gamePk, awayTeam, homeTeam, awayProbable, homeProbable }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetchBoxScore(gamePk)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [gamePk]);

  if (loading) return <div className="loading" style={{ padding: '1rem' }}><div className="spinner" /> Loading lineup…</div>;
  if (error)   return <div className="lineup-wrap"><p className="lineup-tbd">Lineup not available</p></div>;

  return (
    <div className="lineup-wrap">
      <LineupColumn teamData={data?.teams?.away} team={awayTeam} probablePitcher={awayProbable} />
      <div className="lineup-divider" />
      <LineupColumn teamData={data?.teams?.home} team={homeTeam} probablePitcher={homeProbable} />
    </div>
  );
}
