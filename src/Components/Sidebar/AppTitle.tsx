import PPIcon from '../../assets/ppIcon.svg';
import GoviniText from '../../assets/govini-web-logo.png';
import GoviniFlame from '../../assets/ghost-flame.svg'
import './AppTitle.scss';

const AppTitle: React.FC = () => {
    return (
    <div className='app-title'>
        <span className='app-icon'>
            <img className='flame' src={GoviniFlame} />
            <img className='pong-icon' src={PPIcon} />
            <img className='govini-text' src={GoviniText} />
        </span>
        <h3 className='app-subtitle'>PING PONG LADDER</h3>
    </div>
        
    )
}

export default AppTitle;