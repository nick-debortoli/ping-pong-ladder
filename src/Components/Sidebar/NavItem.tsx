import { ReactNode } from 'react';
import './NavItem.scss';
import { useSectionContext } from '../../Contexts/SectionContext';

interface NavItemProps {
    icon: ReactNode;
    section: string;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, section, onClick }) => {
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
        </li>
    );
};

export default NavItem;
