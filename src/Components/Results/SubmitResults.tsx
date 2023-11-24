import './SubmitResults.scss';
import { useState } from 'react';
import { usePlayers } from '../../Contexts/PlayersContext';
import { Office, Player, Result } from '../../Types/dataTypes';
import { addMatch } from '../../database/firestore';

interface SubmitResultsProps {
    handleReloadResults: (status: boolean) => void;
}

const SubmitResults: React.FC<SubmitResultsProps> = ({ handleReloadResults }) => {
    const defaultResultsData: Result = {
        playerA: '',
        playerB: '',
        playerAScore: 0,
        playerBScore: 0,
        office: Office.PGH,
    };

    const [resultsData, setResultsData] = useState<Result>(defaultResultsData);
    const [isValidResult, setIsValidResult] = useState<boolean>(false);

    const { players } = usePlayers();
    const defaultPlayers = players
        .filter((player) => player.office === Office.PGH)
        .sort((a, b) => a.firstName.localeCompare(b.firstName));
    const [playersList, setPlayersList] = useState<Player[]>(defaultPlayers);

    const handleOfficeChange = (office: string) => {
        let newPlayers = players.sort((a, b) => a.firstName.localeCompare(b.firstName));

        if (office === Office.PGH || office === Office.DC) {
            newPlayers = players
                .filter((player) => player.office === office)
                .sort((a, b) => a.firstName.localeCompare(b.firstName));
        }

        setPlayersList(newPlayers);
    };

    const determineValidResult = (): void => {
        const { playerA, playerB, playerAScore, playerBScore } = resultsData;
        const isValid =
            typeof playerA === 'object' &&
            typeof playerB === 'object' &&
            playerAScore !== playerBScore;

        setIsValidResult(isValid);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'playerA' || name === 'playerB' || name === 'winner') {
            const selectedPlayer = players.find((player) => player.id === value);
            setResultsData({ ...resultsData, [name]: selectedPlayer });
        } else if (name === 'matchLocation') {
            handleOfficeChange(value);
            setResultsData({ ...resultsData, office: value });
        } else {
            setResultsData({ ...resultsData, [name]: value });
        }
        determineValidResult();
    };

    const handleSubmit = async (e): Promise<void> => {
        e.preventDefault();

        const isTie = resultsData.playerAScore === resultsData.playerBScore;

        if (isTie) {
            alert('You can not submit a tie');
        } else {
            resultsData.playerAScore = Number(resultsData.playerAScore);
            resultsData.playerBScore = Number(resultsData.playerBScore);

            await addMatch(resultsData);
            setPlayersList(defaultPlayers);
            setResultsData(defaultResultsData);
            handleReloadResults(true);
            setIsValidResult(false);
        }
    };

    const getPlayerName = (playerType: string): string => {
        const { playerA, playerB } = resultsData;
        if (playerType === 'A' && !!playerA) {
            return `${playerA.firstName} ${playerA.lastName}`;
        } else if (playerType === 'B' && !!playerB) {
            return `${playerB.firstName} ${playerB.lastName}`;
        }

        return '';
    };

    const getPlayerId = (playerType: string): string => {
        const { playerA, playerB } = resultsData;
        if (playerType === 'A' && !!playerA) {
            return playerA.id;
        } else if (playerType === 'B' && !!playerB) {
            return playerB.id;
        }

        return '';
    };

    return (
        <div className="submit-results">
            <h3 className="submit-title">Submit Results</h3>
            <form className="results-form" onSubmit={handleSubmit}>
                <label>
                    Match Location:
                    <select name="matchLocation" value={resultsData.office} onChange={handleChange}>
                        {Object.values(Office).map((office) => (
                            <option key={office} value={office}>
                                {office}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Player One:
                    <select name="playerA" value={getPlayerId('A')} onChange={handleChange}>
                        <option value=""> </option>
                        {playersList.map((player) => (
                            <option
                                key={player.id}
                                value={player.id}
                                disabled={getPlayerId('B') === player.id}
                            >
                                {player.firstName} {player.lastName}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Player Two:
                    <select name="playerB" value={getPlayerId('B')} onChange={handleChange}>
                        <option value=""> </option>
                        {playersList.map((player) => (
                            <option
                                key={player.id}
                                value={player.id}
                                disabled={getPlayerId('A') === player.id}
                            >
                                {player.firstName} {player.lastName}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    {resultsData.playerA ? getPlayerName('A') : 'Player One'} Score:
                    <input
                        type="number"
                        name="playerAScore"
                        value={resultsData.playerAScore}
                        onChange={handleChange}
                    />
                </label>

                <label>
                    {resultsData.playerB ? getPlayerName('B') : 'Player Two'} Score:
                    <input
                        type="number"
                        name="playerBScore"
                        value={resultsData.playerBScore}
                        onChange={handleChange}
                    />
                </label>

                <button type="submit" className={isValidResult ? '' : 'disabled'}>
                    Submit
                </button>
            </form>
        </div>
    );
};

export default SubmitResults;
