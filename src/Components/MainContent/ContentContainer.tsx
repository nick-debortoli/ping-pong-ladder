import './ContentContainer.scss';
import { useSectionContext } from '../../Contexts/SectionContext';
import { ReactElement } from 'react';
import { STANDINGS, RESULTS, PLAYERS, ADMIN, TOURNAMENTS } from '../../AppConstants';
import StandingsContainer from '../Standings/StandingsContainer';
import ResultsContainer from '../Results/ResultsContainer';
import PlayersContainer from '../Players/PlayersContainer';
import AdminContainer from '../AdminPage/AdminContainer';
import TournamentsContainer from '../Tournaments/TournamentsContainer';

const ContentContainer: React.FC = () => {
    const { currentSection } = useSectionContext();
    let content: ReactElement;

    switch (currentSection) {
        case STANDINGS:
            content = <StandingsContainer />;
            break;
        case RESULTS:
            content = <ResultsContainer />;
            break;
        case PLAYERS:
            content = <PlayersContainer />;
            break;
        case ADMIN:
            content = <AdminContainer />;
            break;
        case TOURNAMENTS:
            content = <TournamentsContainer />;
            break;
        default:
            content = <></>;
    }

    return <div className="content-container">{content}</div>;
};

export default ContentContainer;
