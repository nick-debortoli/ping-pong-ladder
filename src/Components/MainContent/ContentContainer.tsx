import './ContentContainer.scss';
import { useSectionContext } from '../../Contexts/SectionContext';
import { ReactElement } from 'react';
import { STANDINGS, RESULTS } from '../../AppConstants';
import StandingsContainer from '../Standings/StandingsContainer';
import ResultsContainer from '../Results/ResultsContainer';

const ContentContainer: React.FC = () => {
    const { currentSection } = useSectionContext();
    let content: ReactElement;

    switch(currentSection) {
        case STANDINGS:
            content = <StandingsContainer />;
            break;
        case RESULTS:
            content = <ResultsContainer />;
            break;
        default:
            content = <></>;
    }

    return (
        <div className="content-container">
            {content}
        </div>
    )
}

export default ContentContainer;