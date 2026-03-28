import { getTeamColors } from '../utils/teamColors';

function LineupColumn({ players, team, probablePitcher }) {
  const colors = getTeamColors(team?.id);
  return (
    <div className="lineup-col">
      <div className="lineup-team-name" style={{ color: colors.primary }}>
        {team?.teamName || team?.name}
      </div>
      {players && players.length > 0 ? (
        <ol className="lineup-list">
          {players.map((p, i) => {
            const name = p.fullName ?? p.person?.fullName ?? '—';
            const pos  = p.position?.abbreviation ?? p.primaryPosition?.abbreviation ?? '—';
            const key  = p.id ?? p.person?.id ?? i;
            return (
              <li key={key} className="lineup-row">
                <span className="lineup-pos" style={{ color: colors.primary }}>{pos}</span>
                <span className="lineup-name">{name}</span>
              </li>
            );
          })}
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

export default function Lineup({ game }) {
  const lineups = game.lineups;
  // MLB API uses awayTeam/homeTeam keys; fallback to away/home
  const awayPlayers = lineups?.awayTeam ?? lineups?.away;
  const homePlayers = lineups?.homeTeam ?? lineups?.home;
  const awayTeam = game.teams?.away?.team;
  const homeTeam = game.teams?.home?.team;
  const awayProbable = game.teams?.away?.probablePitcher;
  const homeProbable = game.teams?.home?.probablePitcher;

  return (
    <div className="lineup-wrap">
      <LineupColumn players={awayPlayers} team={awayTeam} probablePitcher={awayProbable} />
      <div className="lineup-divider" />
      <LineupColumn players={homePlayers} team={homeTeam} probablePitcher={homeProbable} />
    </div>
  );
}
