import './MainContent.scss';
import ContentContainer from './ContentContainer';
import { useSectionContext } from '../../Contexts/SectionContext';

const MainContent: React.FC = () => {
    const { currentSection } = useSectionContext();

    return (
        <div className="main-content">
            <h1 className="section-title">{currentSection}</h1>
            <ContentContainer />
        </div>
    );
};

export default MainContent;
