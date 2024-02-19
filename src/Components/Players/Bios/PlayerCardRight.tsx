import { BestFinish, NewPlayer } from '../../../Types/dataTypes';
import { calculateWinPercentage } from '../../../Utils/playerUtils';
import { tournamentLongToShorthand } from '../../../Utils/tournamentUtils';
import './PlayerCard.scss';

interface PlayerCardRightProps {
    player: NewPlayer;
}

const getTourneyYears = (bestFinish: BestFinish | null): string | null => {
    if (!bestFinish) {
        return '';
    }

    return bestFinish.years.join(',');
};
const TournamentStats: React.FC<PlayerCardRightProps> = ({ player }) => {
    const { tournamentStats } = player.accolades;
    const arkBestFinish = tournamentStats['Ark Open'].bestFinish;
    const govimbledonBestFinish = tournamentStats['Govimbledon'].bestFinish;
    const dcBestFinish = tournamentStats['DC Open'].bestFinish;
    const pghBestFinish = tournamentStats['PGH Open'].bestFinish;
    return (
        <div className="tournament-stats">
            <span>
                {tournamentLongToShorthand(arkBestFinish?.round)}
                <span className="tourney-years">{getTourneyYears(arkBestFinish)}</span>
            </span>
            <span>
                {tournamentLongToShorthand(govimbledonBestFinish?.round)}
                <span className="tourney-years">{getTourneyYears(govimbledonBestFinish)}</span>
            </span>
            <span>
                {tournamentLongToShorthand(dcBestFinish?.round)}
                <span className="tourney-years">{getTourneyYears(dcBestFinish)}</span>
            </span>
            <span>
                {tournamentLongToShorthand(pghBestFinish?.round)}
                <span className="tourney-years">{getTourneyYears(pghBestFinish)}</span>
            </span>
        </div>
    );
};

const PlayerCardRight: React.FC<PlayerCardRightProps> = ({ player }) => {
    return (
        <div className="right-column">
            <div className="stats stats-container">
                <div className="stat-title">Stats</div>
                <div className="stat-labels">
                    <br />
                    <span>Wins:</span>
                    <span>Losses:</span>
                    <span>Win Pct:</span>
                    <span>Elo:</span>
                </div>
                <div className="season-values">
                    <div className="stats-subtitle">Season</div>
                    <span>{player.seasonStats.wins}</span>
                    <span>{player.seasonStats.losses}</span>
                    <span>{calculateWinPercentage(player)}%</span>
                    <span>{player.seasonStats.elo}</span>
                </div>
                <div className="all-time-values">
                    <div className="stats-subtitle">All-Time</div>
                    <span>{player.lifetimeWins}</span>
                    <span>{player.lifetimeLosses}</span>
                    <span>{calculateWinPercentage(player, true)}%</span>
                    <span>{player.lifetimeElo}</span>
                </div>
            </div>
            <div className="stats accolades-container">
                <div className="stat-title">Accolades</div>
                <div className="stat-labels">
                    <span>Ark Open:</span>
                    <span>Govimbledon:</span>
                    <span>DC Open:</span>
                    <span>PGH Open:</span>
                </div>
                <TournamentStats player={player} />
                <div className="season-stats">
                    <div className="accolades-subtitle">Best Season</div>
                    <span className="stat-labels">
                        <span>Overall Rank:</span> {player.accolades.bestOverallFinish}
                    </span>
                    <span className="stat-labels">
                        <span>Divisional Rank:</span> {player.accolades.bestDivisionalFinish}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PlayerCardRight;
