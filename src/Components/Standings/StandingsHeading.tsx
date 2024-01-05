import './StandingsHeading.scss';

const StandingsHeading: React.FC = () => {
    return (
        <div className="standings-heading">
            <span className="standings-title">Rank</span>
            <span className="standings-title">Player</span>
            <span className="standings-title">Elo</span>
            <span className="standings-title">Win %</span>
            <span className="standings-title">W-L</span>
        </div>
    );
};

export default StandingsHeading;
