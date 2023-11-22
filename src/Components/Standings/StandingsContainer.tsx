import { useEffect, useState } from 'react';
import StandingsRow from './StandingsRow';
import StandingsHeading from './StandingsHeading';
import { Standing } from '../../Types/dataTypes';
import './StandingsContainer.scss';
import { usePlayers } from '../../Contexts/PlayersContext';

const StandingsContainer: React.FC = () => {
    const [standingsData, setStandingsData] = useState<Standing[] | null>(null);
    const { players } = usePlayers();

    useEffect(() => {
        const fetchData = async () => {
            const sortedPlayers = players
                .slice()
                .sort((playerA, playerB) => playerB.elo - playerA.elo);

            const standings: Standing[] = sortedPlayers.map((player, index) => ({
                id: player.id,
                firstName: player.firstName,
                lastName: player.lastName,
                wins: player.wins,
                losses: player.losses,
                elo: player.elo,
                rank: index + 1,
            }));

            setStandingsData(standings);
        };

        fetchData();
    }, [players]);

    return (
        <div className="standings-container">
            <StandingsHeading />
            {standingsData &&
                standingsData.map((standing, index) => (
                    <StandingsRow standing={standing} key={`standing-${index}`} />
                ))}
        </div>
    );
};

export default StandingsContainer;
