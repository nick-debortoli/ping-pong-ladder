import { useEffect, useState } from 'react';
import StandingsRow from './StandingsRow';
import StandingsHeading from './StandingsHeading';
import { Office, Standing } from '../../Types/dataTypes';
import './StandingsContainer.scss';
import { usePlayers } from '../../Contexts/PlayersContext';
import OfficeTabs from './OfficeTabs';
import { calculateWinPercentage } from '../../Utils/playerUtils';

const StandingsContainer: React.FC = () => {
    const [standingsData, setStandingsData] = useState<Standing[] | null>(null);
    const [focusedOffice, setFocusedOffice] = useState<Office>(Office.PGH);
    const { players } = usePlayers();

    useEffect(() => {
        const fetchData = async () => {
            const filteredPlayers =
                focusedOffice !== Office.InterOffice
                    ? players?.filter((player) => player.office === focusedOffice)
                    : players;

            const sortedPlayers = filteredPlayers
                .slice()
                .sort((playerA, playerB) => playerB.elo - playerA.elo);

            const standings: Standing[] = sortedPlayers
                .filter((player) => player.wins !== 0 || player.losses !== 0)
                .map((player, index) => ({
                    id: player.id,
                    firstName: player.firstName,
                    lastName: player.lastName,
                    wins: player.wins,
                    losses: player.losses,
                    elo: player.elo,
                    turnedPro: player.turnedPro,
                    rank: index + 1,
                    winningPercentage: calculateWinPercentage(player),
                }));

            setStandingsData(standings);
        };

        fetchData();
    }, [players, focusedOffice]);

    const handleOfficeSelect = (office: Office): void => {
        setFocusedOffice(office);
    };

    return (
        <div className="standings-container">
            <OfficeTabs focusedOffice={focusedOffice} handleSelect={handleOfficeSelect} />
            <StandingsHeading />
            {standingsData &&
                standingsData.map((standing, index) => (
                    <StandingsRow standing={standing} key={`standing-${index}`} />
                ))}
        </div>
    );
};

export default StandingsContainer;
