import './AdminContainer.scss';
import SeasonSettings from './SeasonSettings';
import TournamentSettings from './TournamentSettings';

const AdminContainer: React.FC = () => {
    return (
        <div className="admin-container">
            <div className="admin-settings-container">
                <SeasonSettings />
            </div>
            <div className="admin-settings-container">
                <TournamentSettings />
            </div>
        </div>
    );
};

export default AdminContainer;
