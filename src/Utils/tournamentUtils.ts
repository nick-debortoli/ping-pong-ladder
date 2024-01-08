import { BracketMatch, Player } from '../Types/dataTypes';

export const calculateBracket = (players: Player[]): BracketMatch[] => {
    const totalPlayers = players.length;
    const rounds = Math.ceil(Math.log2(totalPlayers));
    const numOfByes = Math.pow(2, rounds) - totalPlayers;

    const matches: BracketMatch[] = [];
    for (let i = 0; i < totalPlayers; i++) {
        if (i < numOfByes) {
            matches.push({ player1: { seed: i + 1, player: players[i] }, player2: null }); // Bye
        } else {
            const opponentIndex = totalPlayers - 1 - (i - numOfByes);
            if (opponentIndex > i) {
                matches.push({
                    player1: { seed: i + 1, player: players[i] },
                    player2: { seed: opponentIndex + 1, player: players[opponentIndex] },
                });
            }
        }
    }
    return matches;
};
