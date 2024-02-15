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
                    ? players?.filter((player) => player.bio.office === focusedOffice)
                    : players;

            const sortedPlayers = filteredPlayers
                .slice()
                .sort((playerA, playerB) => playerB.seasonStats.elo - playerA.seasonStats.elo);

            const standings: Standing[] = sortedPlayers
                .filter(
                    (player) => player.seasonStats.wins !== 0 || player.seasonStats.losses !== 0,
                )
                .map((player, index) => ({
                    id: player.id,
                    firstName: player.bio.firstName,
                    lastName: player.bio.lastName,
                    wins: player.seasonStats.wins,
                    losses: player.seasonStats.losses,
                    elo: player.seasonStats.elo,
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
