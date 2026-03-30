export default function Linescore({ linescore, awayTeam, homeTeam, accentColor }) {
  if (!linescore || !linescore.innings || linescore.innings.length === 0) {
    return null;
  }

  const innings = linescore.innings;
  const awayRuns   = linescore.teams?.away?.runs   ?? '—';
  const homeRuns   = linescore.teams?.home?.runs   ?? '—';
  const awayHits   = linescore.teams?.away?.hits   ?? '—';
  const homeHits   = linescore.teams?.home?.hits   ?? '—';
  const awayErrors = linescore.teams?.away?.errors ?? '—';
  const homeErrors = linescore.teams?.home?.errors ?? '—';

  return (
    <div className="linescore-wrap">
      <div className="linescore-scroll">
        <table className="linescore">
          <thead>
            <tr>
              <th className="team-col">Team</th>
              {innings.map((inn) => (
                <th key={inn.num} className="inn-col">{inn.num}</th>
              ))}
              <th className="rhe-col runs-col">R</th>
              <th className="rhe-col">H</th>
              <th className="rhe-col">E</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="team-col">{awayTeam?.abbreviation || 'AWY'}</td>
              {innings.map((inn) => (
                <td key={inn.num} className="inn-col">
                  {inn.away?.runs ?? '—'}
                </td>
              ))}
              <td className="rhe-col runs-col" style={{ color: accentColor }}>{awayRuns}</td>
              <td className="rhe-col">{awayHits}</td>
              <td className="rhe-col">{awayErrors}</td>
            </tr>
            <tr>
              <td className="team-col">{homeTeam?.abbreviation || 'HME'}</td>
              {innings.map((inn) => (
                <td key={inn.num} className="inn-col">
                  {inn.home?.runs ?? 'x'}
                </td>
              ))}
              <td className="rhe-col runs-col" style={{ color: accentColor }}>{homeRuns}</td>
              <td className="rhe-col">{homeHits}</td>
              <td className="rhe-col">{homeErrors}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
