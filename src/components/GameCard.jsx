import Linescore from './Linescore';
import { getTeamColors } from '../utils/teamColors';

function TeamLogo({ teamId, teamName, size = 48 }) {
  const src = `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
  return (
    <img
      src={src}
      alt={teamName}
      width={size}
      height={size}
      className="team-logo"
      onError={(e) => { e.target.style.display = 'none'; }}
    />
  );
}

function StatusBadge({ status }) {
  const code = status?.abstractGameCode;
  const detail = status?.detailedState || status?.abstractGameState || 'Scheduled';

  let cls = 'badge badge-scheduled';
  let label = detail;

  if (code === 'F') {
    cls = 'badge badge-final';
    label = 'Final';
    if (detail.includes('Postponed')) {
      cls = 'badge badge-postponed';
      label = 'Postponed';
    }
  } else if (code === 'L') {
    cls = 'badge badge-live';
    label = detail;
  }

  return <span className={cls}>{label}</span>;
}

export default function GameCard({ game }) {
  const away = game.teams?.away;
  const home = game.teams?.home;
  const awayTeam = away?.team;
  const homeTeam = home?.team;
  const linescore = game.linescore;
  const status = game.status;
  const decisions = game.decisions;
  const isFinal = status?.abstractGameCode === 'F';
  const isLive = status?.abstractGameCode === 'L';
  const awayScore = away?.score;
  const homeScore = home?.score;

  const awayColors = getTeamColors(awayTeam?.id);
  const homeColors = getTeamColors(homeTeam?.id);

  // Determine winner for score highlighting
  const awayWon = isFinal && awayScore > homeScore;
  const homeWon = isFinal && homeScore > awayScore;

  const accentColor = awayColors.primary;

  // Game time
  const gameTime = game.gameDate
    ? new Date(game.gameDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })
    : '';

  return (
    <div
      className="game-card"
      style={{ '--away-color': awayColors.primary, '--home-color': homeColors.primary }}
    >
      <div className="card-header">
        <StatusBadge status={status} />
        {!isFinal && !isLive && <span className="game-time">{gameTime}</span>}
      </div>

      <div className="matchup">
        {/* Away team */}
        <div className={`team-block away ${awayWon ? 'winner' : ''}`}>
          <TeamLogo teamId={awayTeam?.id} teamName={awayTeam?.name} />
          <div className="team-info">
            <span className="team-abbr" style={{ color: awayColors.primary }}>{awayTeam?.abbreviation}</span>
            <span className="team-name">{awayTeam?.teamName}</span>
          </div>
          {(isFinal || isLive) && (
            <span className={`score ${awayWon ? 'score-winner' : ''}`} style={awayWon ? { color: awayColors.primary } : {}}>
              {awayScore ?? '-'}
            </span>
          )}
        </div>

        <div className="vs-divider">
          {isFinal || isLive ? '' : 'vs'}
        </div>

        {/* Home team */}
        <div className={`team-block home ${homeWon ? 'winner' : ''}`}>
          {(isFinal || isLive) && (
            <span className={`score ${homeWon ? 'score-winner' : ''}`} style={homeWon ? { color: homeColors.primary } : {}}>
              {homeScore ?? '-'}
            </span>
          )}
          <div className="team-info team-info-right">
            <span className="team-abbr" style={{ color: homeColors.primary }}>{homeTeam?.abbreviation}</span>
            <span className="team-name">{homeTeam?.teamName}</span>
          </div>
          <TeamLogo teamId={homeTeam?.id} teamName={homeTeam?.name} />
        </div>
      </div>

      {/* Linescore */}
      {(isFinal || isLive) && linescore && (
        <Linescore
          linescore={linescore}
          awayTeam={awayTeam}
          homeTeam={homeTeam}
          accentColor={accentColor}
        />
      )}

      {/* Decisions */}
      {isFinal && decisions && (
        <div className="decisions">
          {decisions.winner && (
            <span className="decision">
              <span className="decision-label">W</span>
              {decisions.winner.fullName}
            </span>
          )}
          {decisions.loser && (
            <span className="decision">
              <span className="decision-label">L</span>
              {decisions.loser.fullName}
            </span>
          )}
          {decisions.save && (
            <span className="decision">
              <span className="decision-label">S</span>
              {decisions.save.fullName}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
