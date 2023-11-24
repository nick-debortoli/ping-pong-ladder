interface EloReturn {
    winnerElo: number;
    loserElo: number;
}

const expected = (eloA: number, eloB: number): number => {
    return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
};

const eloFn = (oldElo: number, expected: number, score: number, k = 32): number => {
    return oldElo + k * (score - expected);
};

export const calculateElo = (winnerElo: number, loserElo: number): EloReturn => {
    const playerElos: EloReturn = { winnerElo, loserElo };
    const expectedWinner = expected(winnerElo, loserElo);
    const expectedLoser = expected(loserElo, winnerElo);

    playerElos.winnerElo = eloFn(winnerElo, expectedWinner, 1);
    playerElos.loserElo = eloFn(loserElo, expectedLoser, 0);

    playerElos.winnerElo = Math.round(playerElos.winnerElo);
    playerElos.loserElo = Math.round(playerElos.loserElo);

    return playerElos;
};
