import './MatchHistoryRow.scss';
import { MatchInfo } from '../../../Types/dataTypes';
import { usePlayers } from '../../../Contexts/PlayersContext';
import { formatDateToString } from '../../../Utils/dateUtils';

interface MatchHistoryRowProps {
    match: MatchInfo;
}
const MatchHistoryRow: React.FC<MatchHistoryRowProps> = ({ match }) => {
    const { getPlayerById } = usePlayers();
    const { date, winnerId, event, winnerScore, loserScore } = match;
    const winner = getPlayerById(winnerId);
    return (
        <div className="match-history-row">
            <div className="match-history-cell">{formatDateToString(date)}</div>
            <div className="match-history-cell">{`${winner?.bio.firstName} ${winner?.bio.lastName}`}</div>
            <div className="match-history-cell">{event || 'Regular Season'}</div>
            <div className="match-history-cell">{`${winnerScore}-${loserScore}`}</div>
        </div>
    );
};

export default MatchHistoryRow;
