import { useEffect, useState } from "react";
import { getRecentMatches } from "../../database/firestore";
import "./Results.scss";
import { MatchInfo } from "../../Types/dataTypes";
import { usePlayers } from "../../Contexts/PlayersContext";

const Results: React.FC = () => {
  const [recentMatches, setRecentMatches] = useState<MatchInfo[]>([]);
  const { players } = usePlayers();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const matchesData = await getRecentMatches();
        if (matchesData) {
          setRecentMatches(matchesData);
        }
      } catch (error) {
        console.error("Error fetching matches: ", error);
      }
    };

    fetchMatches();
  }, []);

  const getPlayerName = (id: string): string => {
    const player = players.filter((player) => player.id === id)[0];
    return `${player.firstName} ${player.lastName}`;
  };

  return (
    <div className="results">
      <h3 className="submit-title">Recent Results</h3>
      {recentMatches.map((match: MatchInfo) => (
        <div className="recent-result">
          <div className="player-info-container">
            <div className="player-info">
              <p className="player-name">{getPlayerName(match.winnerId)}</p>
              <p className="player-score">{match.winnerScore}</p>
            </div>

            <p className="defeated">def</p>
            <p className="player-bame">{getPlayerName(match.loserId)}</p>
          </div>
          <div className="match-info"></div>
        </div>
      ))}
    </div>
  );
};

export default Results;
