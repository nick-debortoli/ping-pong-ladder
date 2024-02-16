import { useEffect, useState } from 'react';
import './MatchHistory.scss';
import { HeadToHead, MatchInfo } from '../../../Types/dataTypes';

import MatchHistoryHeading from './MatchHistoryHeading';
import MatchHistoryRow from './MatchHistoryRow';
import { getMatchesByIds } from '../../../database/matches';

interface MatchHistoryProps {
    headToHead: HeadToHead | null;
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ headToHead }) => {
    const [matches, setMatches] = useState<MatchInfo[] | null>(null);

    useEffect(() => {
        const fetchData = async (h2h: HeadToHead) => {
            const matchList = await getMatchesByIds(h2h.recentMatchIds);
            setMatches(matchList);
        };

        if (headToHead) {
            fetchData(headToHead);
        } else {
            setMatches(null);
        }
    }, [headToHead]);

    return (
        <div className="match-history">
            {matches && (
                <>
                    <h3>Match History</h3>
                    <MatchHistoryHeading />
                    {matches.map((match, index) => (
                        <MatchHistoryRow key={`match-${index}`} match={match} />
                    ))}
                    <br />
                </>
            )}
        </div>
    );
};

export default MatchHistory;
