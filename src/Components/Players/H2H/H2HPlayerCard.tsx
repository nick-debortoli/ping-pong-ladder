import { useEffect, useState } from 'react';
import { Player } from '../../../Types/dataTypes';
import './H2HPlayerCard.scss';
import { usePlayers } from '../../../Contexts/PlayersContext';

interface H2HPlayerCardProps {
    isFirstCard?: boolean;
    playerId: string | null;
    isWinner: boolean;
}
const H2HPlayerCard: React.FC<H2HPlayerCardProps> = ({ playerId, isFirstCard, isWinner }) => {
    const [player, setPlayer] = useState<Player | null>(null);
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
                        <h2 className="player-name">{`${player.firstName} ${player.lastName}`}</h2>
                        <div className="h2h-card"></div>
                    </div>
                </>
            )}
        </div>
    );
};

export default H2HPlayerCard;
