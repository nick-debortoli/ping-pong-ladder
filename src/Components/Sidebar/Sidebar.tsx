import './Sidebar.scss';
import AppTitle from '../AppTitle/AppTitle';
import NavRail from './NavRail';

interface SidebarProps {
    is404?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ is404 }) => {
    return (
        <section className="sidebar" id="sidebar">
            <AppTitle />
            {!is404 && <NavRail />}
        </section>
    );
};

export default Sidebar;
