import { ReactNode } from "react";
import './NavItem.scss';
import { useAppContext } from "../../AppContext";

interface NavItemProps {
    icon: ReactNode;
    section: string;
    hasIndicator: boolean;
}


const NavItem: React.FC<NavItemProps> = ({icon, section, hasIndicator}) => {
    const { currentSection, changeSection } = useAppContext();

    const itemClass = `list-item ${currentSection === section ? 'focused-list-item' : ''}`

    return (
        <li className={itemClass} onClick={() => changeSection(section)}>
            {icon}
            {section}
            {hasIndicator && 
                <div className="notification-indicator">
                    1
                </div>
            }
        </li>
    )
}

export default NavItem;