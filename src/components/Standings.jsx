import { useState, useEffect } from 'react';
import { fetchStandings } from '../utils/api';
import { getTeamColors } from '../utils/teamColors';

const DIVISION_NAMES = {
  200: 'AL West',
  201: 'AL East',
  202: 'AL Central',
  203: 'NL West',
  204: 'NL East',
  205: 'NL Central',
};

// AL: East → Central → West, NL: East → Central → West
const DIVISION_ORDER = [201, 202, 200, 204, 205, 203];

function StandingsTable({ record }) {
  const divisionName = DIVISION_NAMES[record.division?.id] || record.division?.name || 'Unknown';
  const teams = record.teamRecords || [];

  return (
    <div className="standings-division">
      <h3 className="division-title">{divisionName}</h3>
      <div className="standings-table-wrap">
        <table className="standings-table">
          <thead>
            <tr>
              <th className="st-team">Team</th>
              <th>W</th>
              <th>L</th>
              <th>PCT</th>
              <th>GB</th>
              <th className="st-hide-sm">L10</th>
              <th className="st-hide-sm">STRK</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((tr, i) => {
              const team = tr.team;
              const colors = getTeamColors(team?.id);
              const isFirst = i === 0;
              return (
                <tr key={team?.id} className={isFirst ? 'standings-leader' : ''}>
                  <td className="st-team">
                    <span
                      className="st-dot"
                      style={{ background: colors.primary }}
                    />
                    <span className="st-abbr">{team?.abbreviation}</span>
                    <span className="st-name">{team?.teamName}</span>
                  </td>
                  <td>{tr.wins}</td>
                  <td>{tr.losses}</td>
                  <td>{tr.winningPercentage}</td>
                  <td>{tr.gamesBack === '-' ? '—' : tr.gamesBack}</td>
                  <td className="st-hide-sm">{tr.records?.splitRecords?.find(r => r.type === 'lastTen')?.wins ?? '?'}-{tr.records?.splitRecords?.find(r => r.type === 'lastTen')?.losses ?? '?'}</td>
                  <td className="st-hide-sm">{tr.streak?.streakCode || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Standings({ season }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchStandings(season)
      .then(setRecords)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [season]);

  if (loading) return <div className="loading">Loading standings…</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!records.length) return <div className="empty">No standings data.</div>;

  const sorted = DIVISION_ORDER
    .map(id => records.find(r => r.division?.id === id))
    .filter(Boolean);

  const alDivisions = sorted.filter(r => [200, 201, 202].includes(r.division?.id));
  const nlDivisions = sorted.filter(r => [203, 204, 205].includes(r.division?.id));

  return (
    <div className="standings-wrap">
      <div className="standings-league">
        <h2 className="league-title">American League</h2>
        <div className="standings-grid">
          {alDivisions.map(r => <StandingsTable key={r.division?.id} record={r} />)}
        </div>
      </div>
      <div className="standings-league">
        <h2 className="league-title">National League</h2>
        <div className="standings-grid">
          {nlDivisions.map(r => <StandingsTable key={r.division?.id} record={r} />)}
        </div>
      </div>
    </div>
  );
}
