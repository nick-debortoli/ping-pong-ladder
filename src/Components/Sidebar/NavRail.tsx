import './NavRail.scss';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined';
// import Person4OutlinedIcon from '@mui/icons-material/Person4Outlined';
import NavItem from './NavItem';

import { STANDINGS, RESULTS } from '../../AppConstants';

const NavRail: React.FC = () => {
    return (
        <nav className="side-nav">
            <ul>
                <NavItem
                    icon={<FormatListNumberedOutlinedIcon />}
                    section={STANDINGS}
                    hasIndicator={false}
                />
                <NavItem
                    icon={<AccountTreeOutlinedIcon />}
                    section={RESULTS}
                    hasIndicator={false}
                />
                {/* <NavItem icon={<Person4OutlinedIcon />} section={PLAYERS} hasIndicator={false} />  */}
            </ul>
        </nav>
    );
};

export default NavRail;
