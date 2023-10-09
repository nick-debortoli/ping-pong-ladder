import { useEffect, useState } from "react";
import StandingsRow from "./StandingsRow";
import StandingsHeading from "./StandingsHeading";
import { getPlayers } from "../../database/firestore";
import { Player, Standing } from "../../Types/dataTypes";
import './StandingsContainer.scss';

const StandingsContainer: React.FC = () => {
  const [standingsData, setStandingsData] = useState<Standing[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const players: Player[] | null = await getPlayers();

        if (players === null) {
          setStandingsData(null);
          return;
        }

        const sortedPlayers = players
          .slice()
          .sort((playerA, playerB) => playerB.elo - playerA.elo);
        const standings: Standing[] = sortedPlayers.map((player, index) => ({
          firstName: player.firstName,
          lastName: player.lastName,
          wins: player.wins,
          losses: player.losses,
          elo: player.elo,
          rank: index + 1,
        }));

        setStandingsData(standings);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setStandingsData(null);
      }
    };

    fetchData();
  }, []); 

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
