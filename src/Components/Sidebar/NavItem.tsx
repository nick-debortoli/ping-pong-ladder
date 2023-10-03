import { ReactNode } from "react";
import './NavItem.scss';

interface NavItemProps {
    icon: ReactNode;
    text: string;
    hasIndicator: boolean;
}

const NavItem: React.FC<NavItemProps> = ({icon, text, hasIndicator}) => {
    return (
        <li className="list-item">
            {icon}
            {text}
            {hasIndicator && 
                <div className="notification-indicator">
                    1
                </div>
            }
        </li>
    )
}

export default NavItem;