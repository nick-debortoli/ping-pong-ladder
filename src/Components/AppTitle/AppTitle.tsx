import PPIcon from '/assets/ppIcon.svg';
import GoviniText from '/assets/govini-web-logo.png';
import GoviniFlame from '/assets/ghost-flame.svg';
import { useNavigate } from 'react-router-dom';
import './AppTitle.scss';

interface AppTitleProps {
    variant?: string;
}

const AppTitle: React.FC<AppTitleProps> = ({ variant }) => {
    const navigate = useNavigate();

    const handleGoHome = (): void => {
        navigate('/home');
    };

    return (
        <div className={`app-title ${variant}`} onClick={handleGoHome}>
            <span className="app-icon">
                <img className="flame" src={GoviniFlame} />
                <img className="pong-icon" src={PPIcon} />
                <img className="govini-text" src={GoviniText} />
            </span>
            <h3 className="app-subtitle">PING PONG LADDER</h3>
        </div>
    );
};

AppTitle.defaultProps = {
    variant: '',
};

export default AppTitle;
