// import { useState } from "react";
import { PlayerTabs } from '../../Types/dataTypes';
import PlayerBios from './PlayerBios';
import './PlayersContainer.scss'

const PlayersContainer: React.FC = () => {
    // const [ currentTab, setCurrentTab ] = useState<PlayerTabs>(PlayerTabs.BIOS);
    const currentTab = PlayerTabs.BIOS;

    return (
        <div className="players-container">{currentTab === PlayerTabs.BIOS && <PlayerBios />}</div>
    );
};

export default PlayersContainer;
