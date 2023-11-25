import { ReactNode } from 'react';
import './NavItem.scss';
import { useSectionContext } from '../../Contexts/SectionContext';

interface NavItemProps {
    icon: ReactNode;
    section: string;
    hasIndicator: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, section, hasIndicator, onClick }) => {
    const { currentSection, changeSection } = useSectionContext();

    const handleClick = () => {
        changeSection(section);
        onClick && onClick();
    };

    const itemClass = `list-item ${currentSection === section ? 'focused-list-item' : ''}`;

    return (
        <li className={itemClass} onClick={handleClick}>
            {icon}
            {section}
            {hasIndicator && <div className="notification-indicator">1</div>}
        </li>
    );
};

export default NavItem;
