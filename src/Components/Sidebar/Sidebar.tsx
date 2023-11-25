import './Sidebar.scss';
import AppTitle from '../AppTitle/AppTitle';
import NavRail from './NavRail';
import { ClickAwayListener, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useEffect, useState } from 'react';
import { MOBILE_WIDTH } from '../../AppConstants';

interface SidebarProps {
    is404?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ is404 }) => {
    const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            const newScreenWidth = window.innerWidth;
            setScreenWidth(newScreenWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const isMobile = screenWidth <= MOBILE_WIDTH;

    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(!isMobile);

    const handleClose = () => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <>
            {isMobile && (
                <IconButton className="expand-sidebar" onClick={() => setIsSidebarOpen(true)}>
                    <MenuIcon sx={{ color: 'white' }} />
                </IconButton>
            )}

            {isSidebarOpen && (
                <ClickAwayListener onClickAway={handleClose}>
                    <section className="sidebar" id="sidebar">
                        <AppTitle />
                        {!is404 && <NavRail handleClose={handleClose} />}
                    </section>
                </ClickAwayListener>
            )}
        </>
    );
};

export default Sidebar;
