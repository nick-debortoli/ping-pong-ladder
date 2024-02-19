import { useEffect, useState } from 'react';
import { NewPlayer } from '../../../Types/dataTypes';
import './PlayerCard.scss';
import { getHeadshot } from '../../../Utils/playerUtils';
import { Person } from '@mui/icons-material';
import PlayerCardLeft from './PlayerCardLeft';
import PlayerCardRight from './PlayerCardRight';

interface PlayerCardProps {
    player: NewPlayer;
}
const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
    const [headshot, setHeadshot] = useState<string | null>(null);

    useEffect(() => {
        getHeadshot(player)
            .then((headshotUrl) => {
                headshotUrl = null;
                setHeadshot(headshotUrl);
            })
            .catch((error) => {
                console.error('Error fetching headshot:', error);
                setHeadshot(null);
            });
    }, [player]);

    return (
        <div className="player-card">
            <PlayerCardLeft player={player} />
            <div className="center-column">
                <span className="player-headshot">
                    {headshot ? (
                        <img
                            src={headshot}
                            alt={`${player.bio.firstName} ${player.bio.lastName}'s headshot`}
                        />
                    ) : (
                        <Person className="default-icon" />
                    )}
                </span>
            </div>
            <PlayerCardRight player={player} />
        </div>
    );
};

export default PlayerCard;
