import './MatchHistoryHeading.scss';

const MatchHistoryHeading: React.FC = () => {
    return (
        <div className="match-history-heading">
            <span className="match-history-title">Date</span>
            <span className="match-history-title">Winner</span>
            <span className="match-history-title">Event</span>
            <span className="match-history-title">Score</span>
        </div>
    );
};

export default MatchHistoryHeading;
