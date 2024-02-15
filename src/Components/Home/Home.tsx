import MainContent from '../MainContent/MainContent';
import Sidebar from '../Sidebar/Sidebar';
import './Home.scss';
import SettingsMenu from '../SettingsMenu/SettingsMenu';
import { migratePlayers } from '../../database/firestore';

const Home: React.FC = () => {
    migratePlayers();
    return (
        <div className="home">
            <SettingsMenu />
            <Sidebar />
            <MainContent />
        </div>
    );
};

export default Home;
