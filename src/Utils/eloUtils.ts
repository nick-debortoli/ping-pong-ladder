interface EloReturn {
    winnerSeasonElo: number;
    loserSeasonElo: number;
    winnerElo: number;
    loserElo: number;
}

const expected = (eloA: number, eloB: number): number => {
    return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
};

const eloFn = (oldElo: number, expected: number, score: number, k = 32): number => {
    return oldElo + k * (score - expected);
};

export const calculateElo = (
    winnerSeasonElo: number,
    loserSeasonElo: number,
    winnerElo: number,
    loserElo: number,
): EloReturn => {
    const playerElos: EloReturn = { winnerSeasonElo, loserSeasonElo, winnerElo, loserElo };
    // -- Overall
    const expectedWinner = expected(winnerElo, loserElo);
    const expectedLoser = expected(loserElo, winnerElo);

    playerElos.winnerElo = eloFn(winnerElo, expectedWinner, 1);
    playerElos.loserElo = eloFn(loserElo, expectedLoser, 0);

    playerElos.winnerElo = Math.round(playerElos.winnerElo);
    playerElos.loserElo = Math.round(playerElos.loserElo);

    // -- Season
    const expectedWinnerSeason = expected(winnerSeasonElo, loserSeasonElo);
    const expectedLoserSeason = expected(loserSeasonElo, winnerSeasonElo);

    playerElos.winnerSeasonElo = eloFn(winnerSeasonElo, expectedWinnerSeason, 1);
    playerElos.loserSeasonElo = eloFn(loserSeasonElo, expectedLoserSeason, 0);

    playerElos.winnerSeasonElo = Math.round(playerElos.winnerSeasonElo);
    playerElos.loserSeasonElo = Math.round(playerElos.loserSeasonElo);

    return playerElos;
};
