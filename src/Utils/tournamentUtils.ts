import {
    BracketMatch,
    NewPlayer,
    Office,
    Round,
    Tournament,
    TournamentNameToImage,
    TournamentNames,
    TournamentStats,
} from '../Types/dataTypes';

function generateSeeds(numPlayers: number) {
    const seeds: (number | null)[] = [];
    const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(numPlayers)));

    // Initialize the seeds array with placeholders
    for (let i = 0; i < nextPowerOfTwo; i++) {
        seeds.push(i < numPlayers ? i + 1 : null);
    }

    function shuffleSeeds(arr) {
        for (let i = 1; i < arr.length; i *= 2) {
            const result: number[] = [];
            for (let j = 0; j < arr.length; j += i * 2) {
                const left = arr.slice(j, j + i);
                const right = arr.slice(j + i, j + 2 * i);
                for (let k = 0; k < i; k++) {
                    if (left[k] !== undefined) result.push(left[k]);
                    if (right[k] !== undefined) result.push(right[k]);
                }
            }
            arr = result;
        }
        return arr;
    }

    return shuffleSeeds(seeds);
}

export const generateTournamentMatchups = (playerIds: string[]): [BracketMatch[], number] => {
    const seeds = generateSeeds(playerIds.length);
    const matchups: BracketMatch[] = [];
    let matchNumber = 1;

    for (let i = 0; i < seeds.length / 2; i++) {
        const seed1 = seeds[i];
        const player1 =
            seed1 !== null && seed1 <= playerIds.length
                ? { seed: seed1, playerId: playerIds[seed1 - 1] }
                : 'Bye';

        const seed2 = seeds[seeds.length - 1 - i];
        const player2 =
            seed2 !== null && seed2 <= playerIds.length
                ? { seed: seed2, playerId: playerIds[seed2 - 1] }
                : 'Bye';

        matchups.push({
            player1,
            player2,
            matchId: matchNumber++,
        });
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

        if (roundNumber === numberOfRounds) {
            emptyRound.push({ matchId: matchNumber++, player1: null, player2: null });
        }

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

export const getTotalTitlesWon = (
    tournamentStats: Record<TournamentNames, TournamentStats>,
): number => {
    let totalTitles = 0;

    Object.values(tournamentStats).forEach((stats) => {
        if (stats.bestFinish && stats.bestFinish.round === 'Win') {
            totalTitles += stats.bestFinish.years.length;
        }
    });

    return totalTitles;
};

export const tournamentLongToShorthand = (round: string | undefined): string => {
    if (!round) {
        return 'N/A';
    }

    switch (round) {
        case 'Win':
            return 'W';
        case 'Finals':
            return 'F';
        case 'Semifinals':
            return 'SF';
        case 'Quarterfinals':
            return 'QF';
        default:
            return `R${round.split(' ')[1]}`;
    }
};

export const countMatchesByTournamentAndOffice = (
    tournament: Tournament,
    office: Office,
): number => {
    let totalMatches = 0;

    const rounds: Round | undefined = tournament.rounds[office];
    if (rounds) {
        Object.values(rounds).forEach((matches: BracketMatch[]) => {
            totalMatches += matches.length;
        });
    }

    return totalMatches;
};

export const isThirdPlaceMatch = (
    tournament: Tournament,
    office: Office,
    matchId: number,
): boolean => {
    const matchCount = countMatchesByTournamentAndOffice(tournament, office);
    return matchId === matchCount;
};

export const isPlayerInThirdPlaceMatch = (
    player: NewPlayer | undefined,
    tournament: Tournament | null,
    office: Office | undefined,
): boolean => {
    if (!player || !office) return false;
    const allMatches = Object.values(tournament?.rounds[office] || {}).flat();

    return allMatches.some((match) => {
        const typedMatch = match as BracketMatch;
        const isPlayerInMatch =
            (typedMatch.player1 !== 'Bye' && typedMatch.player1?.playerId === player.id) ||
            (typedMatch.player2 !== 'Bye' && typedMatch.player2?.playerId === player.id);
        const isMatchIdForThirdPlace = typedMatch.matchId === allMatches.length;
        return isPlayerInMatch && isMatchIdForThirdPlace;
    });
};
