import './MainContent.scss';
import ContentContainer from './ContentContainer';
import { useAppContext } from '../../AppContext';

const MainContent: React.FC = () => {
    const { currentSection } = useAppContext();

    return (
        <div className="main-content">
            <h1 className='section-title'>{currentSection}</h1>
            <ContentContainer />
        </div>
    )
}

export default MainContent;