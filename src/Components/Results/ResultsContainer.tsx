import Results from './Results';
import SubmitResults from './SubmitResults';
import './ResultsContainer.scss';
import { useState } from 'react';

const ResultsContainer: React.FC = () => {
    const [reloadResults, setReloadResults] = useState<boolean>(false);

    const handleReloadResults = (status: boolean): void => {
        setReloadResults(status);
    };

    return (
        <div className="results-container">
            <Results reloadResults={reloadResults} handleReloadResults={handleReloadResults} />
            <SubmitResults handleReloadResults={handleReloadResults} />
        </div>
    );
};

export default ResultsContainer;
