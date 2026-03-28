import { useState } from 'react';
import Linescore from './Linescore';
import BoxScore from './BoxScore';
import Lineup from './Lineup';
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

function StarButton({ teamId, isFav, onSetFavorite }) {
  return (
    <button
      className={`star-btn ${isFav ? 'starred' : ''}`}
      onClick={(e) => { e.stopPropagation(); onSetFavorite(teamId); }}
      title={isFav ? 'Your favorite team' : 'Set as favorite team'}
      aria-label={isFav ? 'Favorite team' : 'Set as favorite'}
    >
      {isFav ? '★' : '☆'}
    </button>
  );
}

export default function GameCard({ game, isFavorite, favoriteTeamId, onSetFavorite }) {
  const [expanded,       setExpanded]       = useState(false);
  const [lineupExpanded, setLineupExpanded] = useState(false);
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

  const awayWon = isFinal && awayScore > homeScore;
  const homeWon = isFinal && homeScore > awayScore;

  const accentColor = awayColors.primary;

  const favTeamColors = isFavorite
    ? (awayTeam?.id === favoriteTeamId ? awayColors : homeColors)
    : null;

  const gameTime = game.gameDate
    ? new Date(game.gameDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })
    : '';

  return (
    <div
      className={`game-card ${isFavorite ? 'game-card-favorite' : ''}`}
      style={{
        '--away-color': awayColors.primary,
        '--home-color': homeColors.primary,
        ...(isFavorite && { '--fav-color': favTeamColors.primary }),
      }}
    >
      {isFavorite && <div className="fav-bar" style={{ background: favTeamColors.primary }} />}

      <div className="card-header">
        <StatusBadge status={status} />
        {!isFinal && !isLive && <span className="game-time">{gameTime}</span>}
        {!isFinal && !isLive && (
          <button
            className={`boxscore-btn ${lineupExpanded ? 'active' : ''}`}
            onClick={() => setLineupExpanded((e) => !e)}
          >
            Lineup {lineupExpanded ? '▲' : '▼'}
          </button>
        )}
        {(isFinal || isLive) && (
          <button
            className={`boxscore-btn ${expanded ? 'active' : ''}`}
            onClick={() => setExpanded((e) => !e)}
          >
            Box Score {expanded ? '▲' : '▼'}
          </button>
        )}
      </div>

      <div className="matchup">
        {/* Away team */}
        <div className={`team-block away ${awayWon ? 'winner' : ''}`}>
          <div className="logo-star">
            <TeamLogo teamId={awayTeam?.id} teamName={awayTeam?.name} />
            {onSetFavorite && (
              <StarButton
                teamId={awayTeam?.id}
                isFav={awayTeam?.id === favoriteTeamId}
                onSetFavorite={onSetFavorite}
              />
            )}
          </div>
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
          <div className="logo-star logo-star-right">
            <TeamLogo teamId={homeTeam?.id} teamName={homeTeam?.name} />
            {onSetFavorite && (
              <StarButton
                teamId={homeTeam?.id}
                isFav={homeTeam?.id === favoriteTeamId}
                onSetFavorite={onSetFavorite}
              />
            )}
          </div>
        </div>
      </div>

      {(isFinal || isLive) && linescore && (
        <Linescore linescore={linescore} awayTeam={awayTeam} homeTeam={homeTeam} accentColor={accentColor} />
      )}

      {lineupExpanded && !isFinal && !isLive && (
        <Lineup game={game} />
      )}

      {expanded && (isFinal || isLive) && (
        <BoxScore gamePk={game.gamePk} awayTeam={awayTeam} homeTeam={homeTeam} />
      )}

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
