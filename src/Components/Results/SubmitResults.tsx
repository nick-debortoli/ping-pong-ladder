import { useState } from 'react';
import './SubmitResults.scss';
import SubmitSeasonResult from './SubmitSeasonResult';
import { SUBMISSION } from '../../AppConstants';
import SubmitTournamentResult from './SubmitTournamentResult';
interface SubmitResultsProps {
    handleReloadResults: (status: boolean) => void;
}

const SubmitResults: React.FC<SubmitResultsProps> = ({ handleReloadResults }) => {
    const [activeTab, setActiveTab] = useState<SUBMISSION>(SUBMISSION.SEASON);

    return (
        <div className="submit-results">
            <div className="tabs">
                <button
                    className={`results-toggle-btn left-toggle ${
                        activeTab === SUBMISSION.SEASON ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab(SUBMISSION.SEASON)}
                >
                    Season
                </button>
                <button
                    className={`results-toggle-btn right-toggle ${
                        activeTab === SUBMISSION.TOURNAMENT ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab(SUBMISSION.TOURNAMENT)}
                >
                    Tournament
                </button>
            </div>
            {activeTab === SUBMISSION.SEASON ? (
                <SubmitSeasonResult handleReloadResults={handleReloadResults} />
            ) : (
                <SubmitTournamentResult handleReloadResults={handleReloadResults} />
            )}
        </div>
    );
};

export default SubmitResults;
