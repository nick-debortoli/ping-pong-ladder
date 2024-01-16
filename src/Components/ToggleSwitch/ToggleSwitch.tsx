import { SetStateAction, useState } from 'react';
import './ToggleSwitch.scss';

interface ToggleSwitchProps {
    setTab: React.Dispatch<SetStateAction<any>>;
    tabOptions: any[];
    hasBorder?: boolean;
    style?: Record<string, string>;
    width?: string;
}

const LEFT = 'left';
const RIGHT = 'right';

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    setTab,
    tabOptions,
    hasBorder,
    style,
    width,
}) => {
    const [activeTab, setActiveTab] = useState<string>(LEFT);

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
        if (tab === LEFT) {
            setTab(tabOptions[0]);
        } else {
            setTab(tabOptions[1]);
        }
    };

    const getClass = (tab: string): string => {
        return `toggle-btn ${hasBorder && 'bordered'} ${tab.toLowerCase()} ${
            activeTab === tab && 'active-toggle'
        }`;
    };

    return (
        <div className="toggle-switch" style={style}>
            <div onClick={() => handleTabClick(LEFT)} className={getClass(LEFT)} style={{ width }}>
                {tabOptions[0]}
            </div>
            <div
                onClick={() => handleTabClick(RIGHT)}
                className={getClass(RIGHT)}
                style={{ width }}
            >
                {tabOptions[1]}
            </div>
        </div>
    );
};

export default ToggleSwitch;
