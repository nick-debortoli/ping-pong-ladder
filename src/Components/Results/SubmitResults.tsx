import "./SubmitResults.scss";
import { useState } from "react";
import { usePlayers } from "../../Contexts/PlayersContext";
import { Result } from "../../Types/dataTypes";

const SubmitResults: React.FC = () => {
  const [resultsData, setResultsData] = useState<Result>({
    playerA: "",
    playerB: "",
    playerAScore: 0,
    playerBScore: 0,
    winner: "",
  });

  const { players } = usePlayers();

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "playerA" || name === "playerB" || name === "winner") {
      console.log(name, value)
      const selectedPlayer  = players.find((player) => player.id === value);
      console.log(selectedPlayer)

      setResultsData({ ...resultsData, [name]: selectedPlayer });
    } else {
      setResultsData({ ...resultsData, [name]: value });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Form Data:", resultsData);
  };

  const getPlayerName = (playerType: string): string => {
    const { playerA, playerB } = resultsData;
    if (playerType === "A" && !!playerA) {
      return `${playerA.firstName} ${playerA.lastName}`;
    } else if (playerType === "B" && !!playerB) {
      return `${playerB.firstName} ${playerB.lastName}`;
    }

    return "";
  };

  const getPlayerId = (playerType: string): string => {
    const { playerA, playerB } = resultsData;
    if (playerType === "A" && !!playerA) {
      return playerA.id;
    } else if (playerType === "B" && !!playerB) {
      return playerB.id;

    }

    return "";
  };


  return (
    <div className="submit-results">
      <h3 className="submit-title">Submit Results</h3>
      <form className="results-form" onSubmit={handleSubmit}>
        <label>
          Player One:
          <select
            name="playerA"
            value={getPlayerId("A")}
            onChange={handleChange}
          >
            <option value=""> </option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.firstName} {player.lastName}
              </option>
            ))}
          </select>
        </label>

        <label>
          Player Two:
          <select
            name="playerB"
            value={getPlayerId("B")}
            onChange={handleChange}
          >
            <option value=""> </option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.firstName} {player.lastName}
              </option>
            ))}
          </select>
        </label>

        <label>
          Player One Score:
          <input
            type="number"
            name="playerAScore"
            value={resultsData.playerAScore}
            onChange={handleChange}
          />
        </label>

        <label>
          Player Two Score:
          <input
            type="number"
            name="playerBScore"
            value={resultsData.playerBScore}
            onChange={handleChange}
          />
        </label>

        <div>
          <label>
            Winner:
            <input
              type="radio"
              name="winner"
              value={getPlayerId("A")}
              checked={resultsData.winner === resultsData.playerA}
              onChange={handleChange}
            />
            {getPlayerName("A") || "Player One"}
            <input
              type="radio"
              name="winner"
              value={getPlayerId("B")}
              checked={resultsData.winner === resultsData.playerB}
              onChange={handleChange}
            />
            {getPlayerName("B") || "Player Two"}
          </label>
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default SubmitResults;
