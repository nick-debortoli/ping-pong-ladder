import { useEffect, useState } from 'react';
import { NewPlayer } from '../../../Types/dataTypes';
import './H2HPlayerCard.scss';
import { usePlayers } from '../../../Contexts/PlayersContext';
import { getTotalTitlesWon } from '../../../Utils/tournamentUtils';

interface H2HPlayerCardProps {
    isFirstCard?: boolean;
    playerId: string | null;
    isWinner: boolean;
}
const H2HPlayerCard: React.FC<H2HPlayerCardProps> = ({ playerId, isFirstCard, isWinner }) => {
    const [player, setPlayer] = useState<NewPlayer | null>(null);
    const { getPlayerById } = usePlayers();

    useEffect(() => {
        if (playerId) {
            const newPlayer = getPlayerById(playerId);
            setPlayer(newPlayer);
        } else {
            setPlayer(null);
        }
    }, [playerId, getPlayerById]);

    return (
        <div
            className={`h2h-player-card ${isFirstCard && 'first-card'} ${
                isWinner ? 'h2h-winner' : ''
            }`}
        >
            {player && (
                <>
                    <div className="h2h-player-container">
                        <h2 className="player-name">{`${player.bio.firstName} ${player.bio.lastName}`}</h2>
                        <div className="h2h-card">
                            <div className="h2h-row">
                                <span className="h2h-label">Rank</span>
                                <span>{player.seasonStats.overallRanking}</span>
                            </div>
                            <div className="h2h-row">
                                <span className="h2h-label">Division</span>
                                <span>{player.bio.office}</span>
                            </div>
                            <div className="h2h-row">
                                <span className="h2h-label">Style</span>
                                <span>{player.bio.playStyle === 'RH' ? 'Right' : 'Left'}</span>
                            </div>
                            <div className="h2h-row">
                                <span className="h2h-label">Tournament Titles</span>
                                <span>{getTotalTitlesWon(player.accolades.tournamentStats)}</span>
                            </div>
                            <div className="h2h-row">
                                <span className="h2h-label">Divisional Titles</span>
                                <span>{player.accolades.divisionTitles}</span>
                            </div>
                            <div className="h2h-row">
                                <span className="h2h-label">Overall Titles</span>
                                <span>{player.accolades.overallTitles}</span>
                            </div>
                            <div className="h2h-row">
                                <span className="h2h-label">Turned Pro</span>
                                <span>{player.bio.turnedPro}</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default H2HPlayerCard;
