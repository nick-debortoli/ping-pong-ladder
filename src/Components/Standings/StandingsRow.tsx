import { Standing } from '../../Types/dataTypes';
import './StandingsRow.scss';

interface StandingsRowProps {
    standing: Standing;
}
const StandingsRow: React.FC<StandingsRowProps> = ({ standing }) => {
    const { rank, firstName, lastName, elo, wins, losses, winningPercentage } = standing;
    return (
        <div className="standings-row">
            <div className="standings-cell">{rank}</div>
            <div className="standings-cell">{`${firstName} ${lastName}`}</div>
            <div className="standings-cell">{elo}</div>
            <div className="standings-cell">{`${winningPercentage}%`}</div>
            <div className="standings-cell">{`${wins}-${losses}`}</div>
        </div>
    );
};

export default StandingsRow;
