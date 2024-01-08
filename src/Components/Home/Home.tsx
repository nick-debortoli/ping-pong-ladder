import MainContent from '../MainContent/MainContent';
import Sidebar from '../Sidebar/Sidebar';
import './Home.scss';
import SettingsMenu from '../SettingsMenu/SettingsMenu';

const Home: React.FC = () => {
    return (
        <div className="home">
            <SettingsMenu />
            <Sidebar />
            <MainContent />
        </div>
    );
};

export default Home;
