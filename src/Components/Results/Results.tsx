import { useEffect, useState } from "react";
import { getRecentMatches } from "../../database/firestore";
import "./Results.scss";
import { MatchInfo } from "../../Types/dataTypes";
import { usePlayers } from "../../Contexts/PlayersContext";
import { formatDateToString } from "../../Utils/dateUtils";

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
      <h3 className="results-title">Recent Matches</h3>
      {recentMatches.map((match: MatchInfo) => (
        <div className="recent-result">
          <div className="player-info-container">
            <div className="player-info">
              <p className="player-name">{getPlayerName(match.winnerId)}</p>
              <p className="player-score">{match.winnerScore}</p>
            </div>

            <p className="defeated">def</p>
            <div className="player-info">
              <p className="player-name">{getPlayerName(match.loserId)}</p>
              <p className="player-score">{match.loserScore}</p>
            </div>
          </div>
          <div className="match-info">
            <p>Date: {formatDateToString(match.date)}</p>
            <p>Location: {match.office}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Results;
