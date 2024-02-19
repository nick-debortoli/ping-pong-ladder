import { useEffect, useState } from 'react';
import { NewPlayer } from '../../../Types/dataTypes';
import './PlayerCard.scss';
import { getFlag } from '../../../Utils/playerUtils';

interface PlayerCardLeftProps {
    player: NewPlayer;
}

const PlayerCardLeft: React.FC<PlayerCardLeftProps> = ({ player }) => {
    const [flag, setFlag] = useState<string | null>(null);

    useEffect(() => {
        getFlag(player)
            .then((flagUrl) => {
                setFlag(flagUrl);
            })
            .catch((error) => {
                console.error('Error fetching flag:', error);
                setFlag(null);
            });
    }, [player]);

    return (
        <div className="left-column">
            <div className="name">
                <span className="first-name">{player.bio.firstName}</span>
                <span className="last-name">{player.bio.lastName}</span>
            </div>
            <div className="flag-bio-container">
                {flag && (
                    <div className="country">
                        <img
                            src={flag}
                            alt={`${player.bio.firstName} ${player.bio.lastName}'s country`}
                        />
                    </div>
                )}
                <div className="bio-container">
                    <div className="stat-labels">
                        <span>Division:</span>
                        <span>Turned Pro:</span>
                        <span>Play Style:</span>
                    </div>
                    <div className="stat-values">
                        <span>{player.bio.office}</span>
                        <span>{player.bio.turnedPro}</span>
                        <span>{player.bio.playStyle === 'RH' ? 'Right' : 'Left'}</span>
                    </div>
                </div>
            </div>

            <div className={`rank ${!flag && 'no-country'}`}>
                <div className="rank-container">
                    <span className="vertical">Overall Rank</span>
                    <span className="number">{player.seasonStats.overallRanking || 'U/R'}</span>
                </div>
                <div className="rank-container">
                    <span className="vertical">Division Rank</span>
                    <span className="number division-number">
                        {player.seasonStats.divisionRanking || 'U/R'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PlayerCardLeft;
