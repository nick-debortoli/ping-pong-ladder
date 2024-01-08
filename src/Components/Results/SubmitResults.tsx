import './SubmitResults.scss';
import { useState } from 'react';
import { usePlayers } from '../../Contexts/PlayersContext';
import { Office, Player, Result } from '../../Types/dataTypes';
import { addMatch, checkRecentMatches } from '../../database/matches';

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

        resultsData.playerAScore = Number(resultsData.playerAScore);
        resultsData.playerBScore = Number(resultsData.playerBScore);

        const results = resultsData;

        setPlayersList(defaultPlayers);
        setResultsData(defaultResultsData);
        handleReloadResults(true);
        setIsValidResult(false);

        const isSubmitted = await checkRecentMatches(results);

        const isWithinTwo = Math.abs(resultsData.playerAScore - resultsData.playerBScore) === 2;
        const areBothOver21 = resultsData.playerAScore >= 21 && resultsData.playerBScore >= 21;

        if (isTie) {
            alert('You can not submit a tie');
        } else if (isSubmitted) {
            alert('This match was recently submitted - check with your opponent!');
        } else if (
            (resultsData.playerAScore === 21 ||
                resultsData.playerAScore === 11 ||
                resultsData.playerBScore === 21 ||
                resultsData.playerBScore === 11) &&
            !areBothOver21
        ) {
            await addMatch(resultsData);
        } else if (Math.max(resultsData.playerAScore, resultsData.playerBScore) < 21) {
            const confirmation = window.confirm(
                'Are you sure? You submitted a score less than 21.',
            );
            if (confirmation) {
                await addMatch(resultsData);
            }
        } else if (!isWithinTwo) {
            const confirmation = window.confirm('Are you sure? The games have to be won by two.');
            if (confirmation) {
                await addMatch(resultsData);
            }
        } else if (resultsData.playerAScore > 30 || resultsData.playerBScore > 30) {
            const confirmation = window.confirm('Are you sure? That is a high score.');
            if (confirmation) {
                await addMatch(resultsData);
            }
        } else {
            await addMatch(resultsData);
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
