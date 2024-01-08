import { useState } from 'react';
import { Office } from '../../Types/dataTypes';
import './OfficeToggle.scss';

interface OfficeToggleProps {
    onOfficeClick: (office: Office) => void;
    hasBorder?: boolean;
}

const OfficeToggle: React.FC<OfficeToggleProps> = ({ onOfficeClick, hasBorder }) => {
    const [activeOffice, setActiveOffice] = useState<Office>(Office.PGH);

    const handleOfficeClick = (office: Office) => {
        setActiveOffice(office);
        onOfficeClick(office);
    };

    const getClass = (office: Office): string => {
        return `toggle-btn ${hasBorder && 'bordered'} ${office.toLowerCase()} ${
            activeOffice === office && 'active-toggle'
        }`;
    };

    return (
        <div className="office-toggle">
            <div onClick={() => handleOfficeClick(Office.PGH)} className={getClass(Office.PGH)}>
                PGH
            </div>
            <div onClick={() => handleOfficeClick(Office.DC)} className={getClass(Office.DC)}>
                DC
            </div>
        </div>
    );
};

export default OfficeToggle;
