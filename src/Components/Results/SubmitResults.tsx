import "./SubmitResults.scss";
import { useState } from "react";

interface ResultsData {
  playerA: string;
  playerB: string;
  winner: string;
}
const SubmitResults: React.FC = () => {
  const [resultsData, setResultsData] = useState<ResultsData>({
    playerA: '',
    playerB: '',
    winner: ''
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setResultsData({ ...resultsData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Form Data:", resultsData);
  };

  return (
    <div className="submit-results">
      <h3 className="submit-title">Submit Results</h3>
      <form className='results-form' onSubmit={handleSubmit}>
        <label>
          Player One:
          <select name="playerA" value={""} onChange={handleChange}>
            <option value="andrew">Andrew Rost</option>
            <option value="nick">Nick DeBortoli</option>
          </select>
        </label>

        <label>
          Player Two:
          <select name="playerB" value={""} onChange={handleChange}>
            <option value="andrew">Andrew Rost</option>
            <option value="nick">Nick DeBortoli</option>
          </select>
        </label>

        <label>
          Player One Score:
          <input
            type="number"
            name="playerAScore"
            value={21}
            onChange={handleChange}
          />
        </label>

        <label>
          Player Two Score:
          <input
            type="number"
            name="playerBScore"
            value={21}
            onChange={handleChange}
          />
        </label>

        <div>
          <label>
            Radio Options:
            <input
              type="radio"
              name="winner"
              value="Nick DeBortoli"
              checked={resultsData.winner === "Nick DeBortoli"}
              onChange={handleChange}
            />
            Nick DeBortoli
            <input
              type="radio"
              name="winner"
              value="Andrew Rost"
              checked={resultsData.winner === "Andrew Rost"}
              onChange={handleChange}
            />
            Andrew Rost
          </label>
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default SubmitResults;
