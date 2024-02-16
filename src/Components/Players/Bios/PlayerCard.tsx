import { useEffect, useState } from 'react';
import { NewPlayer } from '../../../Types/dataTypes';
import './PlayerCard.scss';
import { calculateWinPercentage, getFlag, getHeadshot } from '../../../Utils/playerUtils';
import { Person } from '@mui/icons-material';

interface PlayerCardProps {
    player: NewPlayer;
}
const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
    const [headshot, setHeadshot] = useState<string | null>(null);
    const [flag, setFlag] = useState<string | null>(null);

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
        <div className="player-card">
            <div className="left-column">
                <div className="name">
                    <span className="first-name">{player.bio.firstName}</span>
                    <span className="last-name">{player.bio.lastName}</span>
                </div>
                {flag && (
                    <div className="country">
                        <img
                            src={flag}
                            alt={`${player.bio.firstName} ${player.bio.lastName}'s country`}
                        />
                    </div>
                )}
                <div className={`rank ${!flag && 'no-country'}`}>
                    <div className="rank-container">
                        <span className="vertical">Overall Rank</span>
                        <span className="number">{player.seasonStats.overallRanking}</span>
                    </div>
                    <div className="rank-container">
                        <span className="vertical">Division Rank</span>
                        <span className="number division-number">
                            {player.seasonStats.divisionRanking}
                        </span>
                    </div>
                </div>
            </div>
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
            <div className="right-column">
                <div className="stats">
                    <div className="stat-labels">
                        <span>Division: </span>
                        <span>Turned Pro: </span>
                        <span>Play Style: </span>
                        <span>Win Pct: </span>
                    </div>
                    <div className="stat-values">
                        <span>{player.bio.office}</span>
                        <span>{player.bio.turnedPro}</span>
                        <span>{player.bio.playStyle === 'RH' ? 'Right' : 'Left'}</span>
                        <span>{calculateWinPercentage(player)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerCard;
