import './Sidebar.scss';
import AppTitle from './AppTitle';
import NavRail from './NavRail';

const Sidebar: React.FC = () => {
    return (
        <section className='sidebar' id='sidebar'>
            <AppTitle />
            <NavRail />
            
      </section>
    )
}

export default Sidebar;