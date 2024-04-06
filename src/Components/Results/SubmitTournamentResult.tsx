import { useEffect, useState } from 'react';
import { usePlayers } from '../../Contexts/PlayersContext';
import { BracketMatch, NewPlayer, Office, Result } from '../../Types/dataTypes';
import { addTournamentMatch, checkRecentMatches } from '../../database/matches';
import { useTournaments } from '../../Contexts/TournamentContext';
import { findMatchAndRoundById, isPlayerInThirdPlaceMatch } from '../../Utils/tournamentUtils';

interface SubmitTournamentResultProps {
    handleReloadResults: (status: boolean) => void;
}

const SubmitTournamentResult: React.FC<SubmitTournamentResultProps> = ({ handleReloadResults }) => {
    const defaultResultsData: Result = {
        playerA: '',
        playerB: '',
        event: '',
        playerAScore: 0,
        playerBScore: 0,
        office: Office.PGH,
    };
    const { getPlayerById } = usePlayers();
    const { getActiveTournament } = useTournaments();
    const activeTournament = getActiveTournament();

    const [resultsData, setResultsData] = useState<Result>(defaultResultsData);
    const [isValidResult, setIsValidResult] = useState<boolean>(false);
    const [players, setPlayers] = useState<NewPlayer[]>([]);
    const [match, setMatch] = useState<BracketMatch | null>(null);
    const [round, setRound] = useState<string | null>(null);

    useEffect(() => {
        const playerIds = activeTournament?.seeds[resultsData.office];

        const allMatches = Object.values(activeTournament?.rounds[resultsData.office] || {}).flat();

        const playerList = playerIds
            .map((playerId) => getPlayerById(playerId))
            .filter((player) => {
                const hasLostMatch = allMatches.some((match) => {
                    const typedMatch = match as BracketMatch;

                    return (
                        ((typedMatch.player1 !== 'Bye' &&
                            typedMatch.player1?.playerId === player.id) ||
                            (typedMatch.player2 !== 'Bye' &&
                                typedMatch.player2?.playerId === player.id)) &&
                        !!typedMatch.winner &&
                        typedMatch.winner !== player.id
                    );
                });

                return (
                    !hasLostMatch ||
                    isPlayerInThirdPlaceMatch(player, activeTournament, resultsData.office)
                );
            });
        setPlayers(playerList);
        setResultsData({ ...resultsData, event: activeTournament?.name || '' });
    }, [resultsData.office, activeTournament]);

    const determineValidResult = (): void => {
        const { playerA, playerB, playerAScore, playerBScore } = resultsData;
        const isValid =
            typeof playerA === 'object' &&
            typeof playerB === 'object' &&
            playerA !== null &&
            playerB !== null &&
            playerAScore !== playerBScore;

        setIsValidResult(isValid);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'playerA' || name === 'playerB' || name === 'winner') {
            const selectedPlayer = players.find((player) => player.id === value);
            if (activeTournament && selectedPlayer) {
                const roundInfo = findMatchAndRoundById(activeTournament, selectedPlayer.id);

                const otherPlayerKey = name === 'playerA' ? 'playerB' : 'playerA';

                if (roundInfo) {
                    const [matchById, roundById] = roundInfo;

                    setRound(roundById);
                    setMatch(matchById);
                    const { player1, player2 } = matchById;
                    const hasNoOpponent =
                        player1 === 'Bye' ||
                        player2 === 'Bye' ||
                        player1 === null ||
                        player2 === null;

                    if (hasNoOpponent) {
                        setResultsData({
                            ...resultsData,
                            [name]: selectedPlayer,
                            [otherPlayerKey]: null,
                        });
                    } else {
                        const opponentId =
                            player1?.playerId === selectedPlayer.id
                                ? player2.playerId
                                : player1.playerId;
                        const opponent = getPlayerById(opponentId);
                        setResultsData({
                            ...resultsData,
                            [name]: selectedPlayer,
                            [otherPlayerKey]: opponent,
                        });
                    }
                } else {
                    const otherPlayerKey = name === 'playerA' ? 'playerB' : 'playerA';
                    setResultsData({
                        ...resultsData,
                        [name]: selectedPlayer,
                        [otherPlayerKey]: null,
                    });
                }
            }
        } else if (name === 'matchLocation') {
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
        const playerIds = activeTournament?.seeds[resultsData.office];
        const playerList = playerIds.map((playerId) => getPlayerById(playerId));
        setPlayers(playerList);
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
            await addTournamentMatch(resultsData, activeTournament, match, round);
        } else if (Math.max(resultsData.playerAScore, resultsData.playerBScore) < 21) {
            const confirmation = window.confirm(
                'Are you sure? You submitted a score less than 21.',
            );
            if (confirmation) {
                await addTournamentMatch(resultsData, activeTournament, match, round);
            }
        } else if (!isWithinTwo) {
            const confirmation = window.confirm('Are you sure? The games have to be won by two.');
            if (confirmation) {
                await addTournamentMatch(resultsData, activeTournament, match, round);
            }
        } else if (resultsData.playerAScore > 30 || resultsData.playerBScore > 30) {
            const confirmation = window.confirm('Are you sure? That is a high score.');
            if (confirmation) {
                await addTournamentMatch(resultsData, activeTournament, match, round);
            }
        } else {
            await addTournamentMatch(resultsData, activeTournament, match, round);
        }
    };

    const getPlayerName = (playerType: string): string => {
        const { playerA, playerB } = resultsData;
        if (playerType === 'A' && !!playerA) {
            return `${playerA.bio.firstName} ${playerA.bio.lastName}`;
        } else if (playerType === 'B' && !!playerB) {
            return `${playerB.bio.firstName} ${playerB.bio.lastName}`;
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
        <div className="season-result">
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
                    Event:
                    <input type="string" name="playerAScore" value={resultsData.event} readOnly />
                </label>
                <label>
                    Player One:
                    <select name="playerA" value={getPlayerId('A')} onChange={handleChange}>
                        <option value=""> </option>
                        {players.map((player) => (
                            <option
                                key={player.id}
                                value={player.id}
                                disabled={getPlayerId('B') === player.id}
                            >
                                {player.bio.firstName} {player.bio.lastName}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Player Two:
                    <select name="playerB" value={getPlayerId('B')} onChange={handleChange}>
                        <option value=""> </option>
                        {players.map((player) => (
                            <option
                                key={player.id}
                                value={player.id}
                                disabled={getPlayerId('A') === player.id}
                            >
                                {player.bio.firstName} {player.bio.lastName}
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

export default SubmitTournamentResult;
