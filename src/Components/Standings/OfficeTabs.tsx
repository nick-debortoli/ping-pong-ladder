import { Office } from '../../Types/dataTypes';
import './OfficeTabs.scss';

interface OfficeTabsProps {
    focusedOffice: Office;
    handleSelect: (office: Office) => void;
}
const OfficeTabs: React.FC<OfficeTabsProps> = ({ focusedOffice, handleSelect }) => {
    const offices = [Office.PGH, Office.DC, Office.InterOffice];

    return (
        <div className="office-tabs">
            {offices.map((office) => (
                <button
                    key={office}
                    className={`tab ${focusedOffice === office ? 'active' : ''}`}
                    onClick={() => handleSelect(office)}
                >
                    {office === Office.InterOffice ? 'Overall' : office}
                </button>
            ))}
        </div>
    );
};

export default OfficeTabs;
