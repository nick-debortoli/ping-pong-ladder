import { useEffect, useState } from 'react';
import { getRecentMatches } from '../../database/matches';
import './Results.scss';
import { MatchInfo } from '../../Types/dataTypes';
import { usePlayers } from '../../Contexts/PlayersContext';
import { formatDateToString, formatDateToTime } from '../../Utils/dateUtils';

interface ResultsProps {
    reloadResults: boolean;
    handleReloadResults: (status: boolean) => void;
}

const Results: React.FC<ResultsProps> = ({ reloadResults, handleReloadResults }) => {
    const [recentMatches, setRecentMatches] = useState<MatchInfo[]>([]);
    const { getPlayerById } = usePlayers();

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const matchesData = await getRecentMatches();
                if (matchesData) {
                    setRecentMatches(matchesData);
                }
            } catch (error) {
                console.error('Error fetching matches: ', error);
            } finally {
                handleReloadResults(false);
            }
        };

        fetchMatches();
    }, [reloadResults, handleReloadResults]);

    const formatPlayerName = (id: string): string => {
        const player = getPlayerById(id);
        if (!player) return '';
        return `${player.firstName} ${player.lastName}`;
    };

    return (
        <div className="results">
            <h3 className="results-title">Recent Matches</h3>
            {recentMatches.map((match: MatchInfo, index) => (
                <div className="recent-result" key={`match-${index}`}>
                    <div className="player-info-container">
                        <div className="player-info">
                            <p className="player-name">{formatPlayerName(match.winnerId)}</p>
                            <p className="player-score">{match.winnerScore}</p>
                        </div>

                        <p className="defeated">def</p>
                        <div className="player-info">
                            <p className="player-name">{formatPlayerName(match.loserId)}</p>
                            <p className="player-score">{match.loserScore}</p>
                        </div>
                    </div>
                    <div className="match-info">
                        <p>Date: {formatDateToString(match.date)}</p>
                        <p>Time: {formatDateToTime(match.date)}</p>
                        <p>Location: {match.office}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Results;
