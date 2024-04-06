import { ReactNode, useEffect, useState } from 'react';
import { usePlayers } from '../../Contexts/PlayersContext';
import { BracketMatch, BracketPlayer, NewPlayer, Office, Tournament } from '../../Types/dataTypes';
import { getFlag } from '../../Utils/playerUtils';
import { isThirdPlaceMatch } from '../../Utils/tournamentUtils';

interface MatchProps {
    match: BracketMatch;
    tournament: Tournament;
    activeOffice: Office;
}
const Match: React.FC<MatchProps> = ({ match, tournament, activeOffice }) => {
    const { getPlayerById } = usePlayers();
    const { matchId, player1, player2, scores1, scores2, winner } = match;
    const isThirdPlace = isThirdPlaceMatch(tournament, activeOffice, matchId || 0);

    const getPlayerInfo = async (player: BracketPlayer | 'Bye' | null) => {
        if (!player || player === 'Bye') {
            return player;
        }

        const playerInfo: NewPlayer | null = getPlayerById(player.playerId);

        if (!playerInfo || !player.seed) return null;

        const flag = await getFlag(playerInfo);
        const { firstName, lastName, country } = playerInfo.bio;

        const showSeed =
            player.seed <=
            Math.floor(
                (tournament.seeds[activeOffice].length * tournament.topSeedPercentage) / 100,
            );

        return (
            <>
                {flag && <img src={flag} alt={`${country} flag`} className="player-flag" />}
                {`${firstName[0]}. ${lastName}`}{' '}
                {showSeed && <span className="player-seed">({player.seed})</span>}
            </>
        );
    };

    const [player1Info, setPlayer1Info] = useState<ReactNode | null>(null);
    const [player2Info, setPlayer2Info] = useState<ReactNode | null>(null);

    useEffect(() => {
        getPlayerInfo(player1).then(setPlayer1Info);
        getPlayerInfo(player2).then(setPlayer2Info);
    }, [match]);

    const getPlayerClass = (player: BracketPlayer | 'Bye' | null): string => {
        if (player && player !== 'Bye') {
            if (winner && winner === player.playerId) {
                return 'round-winner';
            } else if (winner) {
                return 'round-loser';
            } else if (
                player1 === 'Bye' &&
                player2 &&
                player2 !== 'Bye' &&
                player.playerId === player2.playerId
            ) {
                return 'round-winner';
            } else if (
                player2 === 'Bye' &&
                player1 &&
                player1 !== 'Bye' &&
                player.playerId === player1.playerId
            ) {
                return 'round-winner';
            }
        }

        return '';
    };

    return (
        <div className={`match-container ${isThirdPlace ? 'third-place' : ''}`}>
            {isThirdPlace && <span>Third Place Match</span>}
            <div className="match">
                <div className="players">
                    <span className={`player ${getPlayerClass(player1)}`}>{player1Info}</span>
                    <span className={`player ${getPlayerClass(player2)}`}>{player2Info}</span>
                </div>
                <div className="scores-container">
                    <div className="scores top-score">
                        {scores1?.map((score, index) => (
                            <span
                                key={`score1-${index}`}
                                className={`score ${
                                    scores2 && scores2[index] > score && 'low-score'
                                }`}
                            >
                                {score}
                            </span>
                        ))}
                    </div>
                    <div className="scores">
                        {' '}
                        {scores2?.map((score, index) => (
                            <span
                                key={`score2-${index}`}
                                className={`score ${
                                    scores1 && scores1[index] > score && 'low-score'
                                }`}
                            >
                                {score}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Match;
