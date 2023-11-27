import './NavRail.scss';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined';
import Person4OutlinedIcon from '@mui/icons-material/Person4Outlined';
import NavItem from './NavItem';

import { STANDINGS, RESULTS, PLAYERS } from '../../AppConstants';

interface NavRailProp {
    handleClose?: () => void;
}

const NavRail: React.FC<NavRailProp> = ({ handleClose }) => {
    return (
        <nav className="side-nav">
            <ul>
                <NavItem
                    icon={<FormatListNumberedOutlinedIcon />}
                    section={STANDINGS}
                    onClick={handleClose}
                />
                <NavItem
                    icon={<AccountTreeOutlinedIcon />}
                    section={RESULTS}
                    onClick={handleClose}
                />
                <NavItem icon={<Person4OutlinedIcon />} section={PLAYERS} onClick={handleClose} />
            </ul>
        </nav>
    );
};

export default NavRail;
