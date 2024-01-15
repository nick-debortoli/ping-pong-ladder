import {
    BracketMatch,
    Round,
    Tournament,
    TournamentNameToImage,
    TournamentNames,
} from '../Types/dataTypes';

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

export const generateTournamentMatchups = (playerIds: string[]): [BracketMatch[], number] => {
    const seeds = generateSeeds(playerIds.length);

    const totalSlots = seeds.length;
    const matchups: BracketMatch[] = [];

    const extendedPlayers: Array<string | null> = [...playerIds];
    while (extendedPlayers.length < totalSlots) {
        extendedPlayers.push(null);
    }

    let matchNumber = 1;
    // Create matchups
    for (let i = 0; i < seeds.length / 2; i++) {
        const seed1 = seeds[i];
        const seed2 = seeds[seeds.length - i - 1];

        const player1 = seed1 !== null ? extendedPlayers[seed1 - 1] : null;
        const player2 = seed2 !== null ? extendedPlayers[seed2 - 1] : null;

        matchups.push({
            player1: player1 ? { seed: seed1, playerId: player1 } : 'Bye',
            player2: player2 ? { seed: seed2, playerId: player2 } : 'Bye',
            matchId: matchNumber,
        });

        matchNumber++;

        if (matchups.length - 1 === playerIds.length / 2) {
            break;
        }
    }
    return [matchups, matchNumber];
};

const getNextPowerOf2 = (number: number): number => {
    let power = 1;
    while (power < number) {
        power *= 2;
    }
    return power;
};

const countMatchesBefore = (totalMatches: number, level: number): number => {
    if (level === 1) {
        return 0;
    }

    const totalNodes = totalMatches - 1;

    let height = 0;
    while ((1 << height) - 1 < totalNodes) {
        height++;
    }

    const totalNodesAtAndAbove = (1 << height) - 1;

    const nodesAtAndAboveLevel = (1 << (height - level + 1)) - 1;

    const nodesToLeft = totalNodesAtAndAbove - nodesAtAndAboveLevel;

    return nodesToLeft;
};

export const getNextMatchId = (playersCount: number, matchId: number, round: number): number => {
    const roundedPlayersCount = getNextPowerOf2(playersCount);
    const firstMatchInRound = countMatchesBefore(roundedPlayersCount, round) + 1;

    const relativeMatchId = matchId - firstMatchInRound;

    const nextRoundMatchId = Math.floor(relativeMatchId / 2);

    const firstMatchInNextRound = countMatchesBefore(roundedPlayersCount, round + 1) + 1;

    return firstMatchInNextRound + nextRoundMatchId;
};

export const generateTournamentRounds = (playerIds: string[]): Round => {
    const [matchups, startingMatchNumber] = generateTournamentMatchups(playerIds);
    const rounds: { [key: string]: BracketMatch[] } = {};
    rounds['round1'] = matchups;

    const numberOfRounds = Math.ceil(Math.log2(playerIds.length)) - 1;

    let matchNumber = startingMatchNumber;
    for (let roundNumber = 1; roundNumber <= numberOfRounds; roundNumber++) {
        const currentRoundKey = `round${roundNumber}`;
        const roundKey = `round${roundNumber + 1}`;
        const emptyRound: BracketMatch[] = Array(matchups.length / 2 ** roundNumber)
            .fill(null)
            .map(() => ({ matchId: matchNumber++, player1: null, player2: null }));

        rounds[currentRoundKey].forEach((match) => {
            if (match.player1 === 'Bye') {
                const nextMatchId = match.matchId
                    ? getNextMatchId(playerIds.length, match.matchId, roundNumber)
                    : null;

                const nextMatch = emptyRound.find((m) => m.matchId === nextMatchId);
                if (nextMatch) {
                    nextMatch.player2 = match.player2;
                }
            } else if (match.player2 === 'Bye') {
                const nextMatchId = match.matchId
                    ? getNextMatchId(playerIds.length, match.matchId, roundNumber)
                    : null;

                const nextMatch = emptyRound.find((m) => m.matchId === nextMatchId);

                if (nextMatch) {
                    nextMatch.player1 = match.player1;
                }
            }
        });

        rounds[roundKey] = emptyRound;
    }

    return rounds;
};

export const getTournamentLogo = async (name: TournamentNames): Promise<string | null> => {
    const svgName = TournamentNameToImage[name];
    const logoFilename = `/assets/tournaments/${svgName}.svg`;

    try {
        const response = await fetch(logoFilename);

        if (response.status === 200) {
            return logoFilename;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
};

export const getRoundName = (roundInput: string, totalRounds: number): string => {
    if (totalRounds < 1) {
        throw new Error('Total rounds must be at least 1.');
    }

    const match = roundInput.match(/^round(\d+)$/i);
    if (!match) {
        throw new Error(
            "Invalid round input format. Expected format: 'roundX' where X is a number.",
        );
    }

    const roundNumber = parseInt(match[1], 10);
    if (isNaN(roundNumber) || roundNumber < 1 || roundNumber > totalRounds) {
        throw new Error(
            'Round number must be a valid integer between 1 and the total number of rounds.',
        );
    }

    if (roundNumber === totalRounds) {
        return 'Finals';
    } else if (roundNumber === totalRounds - 1) {
        return 'Semifinals';
    } else if (totalRounds >= 4 && roundNumber === totalRounds - 2) {
        return 'Quarterfinals';
    } else {
        return `Round ${roundNumber}`;
    }
};

export const findMatchAndRoundById = (
    tournament: Tournament,
    playerId: string,
): [BracketMatch, string] | null => {
    let highestMatch: [BracketMatch, string] | null = null;

    for (const office in tournament.rounds) {
        const rounds: Round = tournament.rounds[office];

        for (const round in rounds) {
            for (const match of rounds[round]) {
                const isPlayerInMatch =
                    (match.player1 !== null &&
                        match.player1 !== 'Bye' &&
                        match.player1.playerId === playerId) ||
                    (match.player2 !== null &&
                        match.player2 !== 'Bye' &&
                        match.player2.playerId === playerId);

                // Check if matchId is not null and is the highest so far
                if (isPlayerInMatch && match.matchId !== null) {
                    if (
                        !highestMatch ||
                        (highestMatch[0].matchId !== null &&
                            match.matchId > highestMatch[0].matchId)
                    ) {
                        highestMatch = [match, round];
                    }
                }
            }
        }
    }

    return highestMatch;
};
