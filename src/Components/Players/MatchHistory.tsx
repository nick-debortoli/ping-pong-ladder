import { useEffect, useState } from 'react';
import './MatchHistory.scss';
import { HeadToHead, MatchInfo } from '../../Types/dataTypes';
import { getMatchesByIds } from '../../database/matches';
import { usePlayers } from '../../Contexts/PlayersContext';

interface MatchHistoryProps {
    playerIds: [string | null, string | null];
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ playerIds }) => {
    const [matches, setMatches] = useState<MatchInfo[] | null>(null);
    const { getH2HByOpponent } = usePlayers();
    const [player1Id, player2Id] = playerIds;

    useEffect(() => {
        const fetchData = async (playerId: string, opponentId: string) => {
            const h2hData: HeadToHead | null = getH2HByOpponent(playerId, opponentId);
            if (h2hData) {
                const matchesList = await getMatchesByIds(h2hData.recentMatchIds);
                if (matchesList) {
                    setMatches(matchesList);
                }
            } else {
                setMatches(null);
            }
        };
        if (player1Id && player2Id) {
            fetchData(player1Id, player2Id);
        } else {
            setMatches(null);
        }
    }, [player1Id, player2Id, getH2HByOpponent]);

    return (
        <div className="match-history">
            {matches && (
                <>
                    <h3>Match History</h3>
                    {matches.map((match, index) => (
                        <div key={`match-${index}`} className="match">
                            {match.winnerId}
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};

export default MatchHistory;
