import Results from "./Results";
import SubmitResults from "./SubmitResults";
import './ResultsContainer.scss';

const ResultsContainer: React.FC = () => {
    return (
        <div className="results-container">
            <Results />
            <SubmitResults />
        </div>
    )
}

export default ResultsContainer;