import './NavRail.scss';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined';
import Person4OutlinedIcon from '@mui/icons-material/Person4Outlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import NavItem from './NavItem';

import { STANDINGS, RESULTS, PLAYERS, TOURNAMENTS } from '../../AppConstants';
import { useTournaments } from '../../Contexts/TournamentContext';

interface NavRailProp {
    handleClose?: () => void;
}

const NavRail: React.FC<NavRailProp> = ({ handleClose }) => {
    const { getActiveTournament } = useTournaments();
    const activeTournament = getActiveTournament();

    return (
        <nav className="side-nav">
            <ul>
                <NavItem
                    icon={<FormatListNumberedOutlinedIcon />}
                    section={STANDINGS}
                    onClick={handleClose}
                />
                <NavItem icon={<ReceiptLongIcon />} section={RESULTS} onClick={handleClose} />
                {activeTournament && (
                    <NavItem
                        icon={<AccountTreeOutlinedIcon />}
                        section={TOURNAMENTS}
                        onClick={handleClose}
                    />
                )}
                <NavItem icon={<Person4OutlinedIcon />} section={PLAYERS} onClick={handleClose} />
            </ul>
            {import.meta.env.VITE_ENVIRONMENT !== 'prod' && (
                <div className="dev-tag">DEVELOPMENT</div>
            )}
        </nav>
    );
};

export default NavRail;
