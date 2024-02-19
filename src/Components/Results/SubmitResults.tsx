import { useState } from 'react';
import './SubmitResults.scss';
import SubmitSeasonResult from './SubmitSeasonResult';
import { SUBMISSION } from '../../AppConstants';
import SubmitTournamentResult from './SubmitTournamentResult';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import { useTournaments } from '../../Contexts/TournamentContext';
interface SubmitResultsProps {
    handleReloadResults: (status: boolean) => void;
}

const toggleStyles = {
    position: 'absolute',
    fontSize: '0.85em',
    top: '44px',
    right: '12px',
    display: 'flex',
};

const SubmitResults: React.FC<SubmitResultsProps> = ({ handleReloadResults }) => {
    const [activeTab, setActiveTab] = useState<SUBMISSION>(SUBMISSION.SEASON);
    const { getActiveTournament } = useTournaments();
    const activeTournament = getActiveTournament();

    return (
        <div className="submit-results">
            {activeTournament && (
                <ToggleSwitch
                    setTab={setActiveTab}
                    tabOptions={[SUBMISSION.SEASON, SUBMISSION.TOURNAMENT]}
                    style={toggleStyles}
                    width="5em"
                />
            )}
            {activeTab === SUBMISSION.SEASON ? (
                <SubmitSeasonResult handleReloadResults={handleReloadResults} />
            ) : (
                <SubmitTournamentResult handleReloadResults={handleReloadResults} />
            )}
        </div>
    );
};

export default SubmitResults;
