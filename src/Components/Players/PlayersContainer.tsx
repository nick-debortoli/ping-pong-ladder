import { useState } from 'react';
import { PlayerTabs } from '../../Types/dataTypes';
import PlayerBios from './PlayerBios';
import './PlayersContainer.scss';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import Head2Head from './Head2Head';

const PlayersContainer: React.FC = () => {
    const [currentTab, setCurrentTab] = useState<PlayerTabs>(PlayerTabs.BIOS);

    return (
        <div className="players-container">
            <div className="players-top-bar">
                <ToggleSwitch
                    setTab={setCurrentTab}
                    tabOptions={[PlayerTabs.BIOS, PlayerTabs.H2H]}
                    hasBorder={true}
                    width="30px"
                />
            </div>

            {currentTab === PlayerTabs.BIOS ? <PlayerBios /> : <Head2Head />}
        </div>
    );
};

export default PlayersContainer;
