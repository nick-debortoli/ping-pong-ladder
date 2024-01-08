import { BracketMatch } from '../Types/dataTypes';

const generateSeeds = (order: number): (number | null)[] => {
    let adjustedOrder = 1;
    while (adjustedOrder < order) adjustedOrder *= 2;

    const fillBracket = (start: number, end: number): (number | null)[] => {
        if (start === end) return start <= order ? [start] : [null];

        const mid = Math.floor((start + end) / 2);
        const leftBracket = fillBracket(start, mid);
        const rightBracket = fillBracket(mid + 1, end);

        return leftBracket.flatMap((v, i) => [v, rightBracket[i]]);
    };

    return fillBracket(1, adjustedOrder);
};

export const generateTournamentMatchups = (playerIds: string[]): BracketMatch[] => {
    const seeds = generateSeeds(playerIds.length);

    const totalSlots = seeds.length;
    const matchups: BracketMatch[] = [];

    const extendedPlayers: Array<string | null> = [...playerIds];
    while (extendedPlayers.length < totalSlots) {
        extendedPlayers.push(null);
    }

    // Create matchups
    for (let i = 0; i < seeds.length / 2; i++) {
        const seed1 = seeds[i];
        const seed2 = seeds[seeds.length - i - 1];

        const player1 = seed1 !== null ? extendedPlayers[seed1 - 1] : null;
        const player2 = seed2 !== null ? extendedPlayers[seed2 - 1] : null;

        matchups.push({
            player1: player1 ? { seed: seed1, playerId: player1 } : 'Bye',
            player2: player2 ? { seed: seed2, playerId: player2 } : 'Bye',
        });

        if (matchups.length - 1 === playerIds.length / 2) {
            break;
        }
    }
    return matchups;
};

export const generateTournamentRounds = (
    playerIds: string[],
): { [key: string]: BracketMatch[] } => {
    const matchups = generateTournamentMatchups(playerIds);
    const rounds: { [key: string]: BracketMatch[] } = {};
    rounds['round1'] = matchups;

    const numberOfRounds = Math.ceil(Math.log2(playerIds.length)) - 1;

    for (let roundNumber = 1; roundNumber <= numberOfRounds; roundNumber++) {
        const roundKey = `round${roundNumber + 1}`;
        const emptyRound: BracketMatch[] = Array(matchups.length / 2 ** roundNumber)
            .fill(null)
            .map(() => ({ player1: null, player2: null }));

        rounds[roundKey] = emptyRound;
    }

    return rounds;
};
