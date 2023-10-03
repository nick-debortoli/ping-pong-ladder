import './NavRail.scss';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import Person4OutlinedIcon from '@mui/icons-material/Person4Outlined';
import NavItem from './NavItem';

const NavRail: React.FC = () => {
    return (
        <nav className="side-nav">
            <ul>
                <NavItem icon={<FormatListNumberedOutlinedIcon />} text={'Standings'} hasIndicator={false} />
                <NavItem icon={<AccountTreeOutlinedIcon />} text={'Results'} hasIndicator={false} />
                <NavItem icon={<EmojiEventsOutlinedIcon />} text={'Challenges'} hasIndicator={true} />
                <NavItem icon={<Person4OutlinedIcon />} text={'Players'} hasIndicator={false} />
            </ul>
        </nav>
    )
}

export default NavRail;