import { firestore, updateDivisionRankings, updateOverallRankings } from './firestore';
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import {
    NewPlayer,
    NewBasePlayer,
    Player,
    BasePlayer,
    BestFinish,
    TournamentNames,
    TournamentStats,
    Accolades,
    HeadToHead,
} from '../Types/dataTypes';
import { standardizeToUSA } from '../Utils/stringUtils';
import { BASE_ELO } from '../AppConstants';
import { findActiveTournament } from './tournaments';
import { getRoundName } from '../Utils/tournamentUtils';

export const addPlayer = async (playerInfo: NewBasePlayer): Promise<void> => {
    playerInfo.bio.country = standardizeToUSA(playerInfo.bio.country);
    try {
        const playersRef = collection(firestore, 'newPlayers');

        const q = query(playersRef, where('email', '==', playerInfo.bio.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            console.error('Player with this email already exists');
            return;
        }

        await addDoc(playersRef, playerInfo);

        await updateDivisionRankings(playerInfo.bio.office);
        await updateOverallRankings();
    } catch (error) {
        console.error('Error adding player: ', error);
    }
};

export const getOldPlayers = async (): Promise<Array<Player> | null> => {
    try {
        const playersRef = collection(firestore, 'Players');
        const querySnapshot = await getDocs(playersRef);

        const playersList: Array<Player> = [];

        for (const doc of querySnapshot.docs) {
            const playerData = {
                id: doc.id,
                ...(doc.data() as BasePlayer),
            };

            const head2HeadRef = collection(firestore, `Players/${doc.id}/head2head`);
            const head2HeadSnapshot = await getDocs(head2HeadRef);
            const head2HeadData: Record<string, HeadToHead> = {};
            head2HeadSnapshot.docs.forEach((doc) => {
                head2HeadData[doc.id] = doc.data() as HeadToHead;
            });

            playersList.push({
                ...playerData,
                head2head: head2HeadData,
            });
        }

        return playersList;
    } catch (error) {
        console.error('Error fetching players: ', error);
        return null;
    }
};

export const getPlayers = async (): Promise<Array<NewPlayer> | null> => {
    try {
        const playersRef = collection(firestore, 'newPlayers');
        const querySnapshot = await getDocs(playersRef);

        const playersList: Array<NewPlayer> = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as NewBasePlayer),
        }));

        return playersList;
    } catch (error) {
        console.error('Error fetching players: ', error);
        return null;
    }
};
const roundNameIsBetterThan = (
    currentBestRound: string,
    newRound: string,
    totalRounds: number,
): boolean => {
    const roundToNumericSignificance = (roundName: string, totalRounds: number): number => {
        const roundNumber = roundName.split(' ')[1];
        switch (roundName) {
            case 'Win':
                return totalRounds + 1;
            case 'Finals':
                return totalRounds;
            case 'Semifinals':
                return totalRounds - 1;
            case 'Quarterfinals':
                return totalRounds - 2;
            default:
                if (Number(roundNumber)) {
                    return Number(roundNumber);
                }
                return 0;
        }
    };

    const currentBestRoundSignificance = roundToNumericSignificance(currentBestRound, totalRounds);
    const newRoundSignificance = roundToNumericSignificance(newRound, totalRounds);

    return newRoundSignificance > currentBestRoundSignificance;
};
const calculatePlayerAccoladesInTournament = async (
    playerId: string,
    currentStats: Record<TournamentNames, TournamentStats>,
) => {
    const activeTournament = await findActiveTournament();

    if (!activeTournament) {
        console.log('No active tournament found');
        return null;
    }

    let wins = 0;
    let losses = 0;
    let bestFinish: BestFinish | null = currentStats[activeTournament.name]?.bestFinish || null;

    for (const officeRounds of Object.values(activeTournament.rounds)) {
        for (const [roundName, matches] of Object.entries(officeRounds)) {
            const roundCount = Object.entries(officeRounds).length;
            const formattedRoundName = getRoundName(roundName, roundCount);
            for (const match of matches) {
                const isPlayer1 =
                    match.player1 !== null &&
                    match.player1 !== 'Bye' &&
                    match.player1.playerId === playerId;
                const isPlayer2 =
                    match.player2 !== null &&
                    match.player2 !== 'Bye' &&
                    match.player2.playerId === playerId;

                if (isPlayer1 || isPlayer2) {
                    if (
                        match.scores1 &&
                        match.scores2 &&
                        match.scores1.length &&
                        match.scores2.length
                    ) {
                        for (
                            let index = 0;
                            index < Math.max(match.scores1.length, match.scores2.length);
                            index++
                        ) {
                            const score1 = match.scores1[index] ?? 0;
                            const score2 = match.scores2[index] ?? 0;

                            if (score1 > score2 && isPlayer1) wins++;
                            else if (score1 < score2 && isPlayer1) losses++;
                            else if (score2 > score1 && isPlayer2) wins++;
                            else if (score2 < score1 && isPlayer2) losses++;
                        }
                    }

                    const playerWon =
                        match.winner === playerId ||
                        match.player2 === 'Bye' ||
                        match.player1 === 'Bye';

                    if (playerWon) {
                        if (isPlayer1 && match.player2 === 'Bye') {
                            wins += 2;
                        }

                        if (isPlayer2 && match.player1 === 'Bye') {
                            wins += 2;
                        }

                        if (formattedRoundName === 'Finals') {
                            bestFinish = {
                                round: 'Win',
                                years: [new Date().getFullYear()],
                            };
                            break;
                        }
                    }

                    if (
                        !bestFinish ||
                        roundNameIsBetterThan(bestFinish.round, formattedRoundName, roundCount)
                    ) {
                        bestFinish = {
                            round: formattedRoundName,
                            years: [new Date().getFullYear()],
                        };
                    } else if (
                        bestFinish.round === formattedRoundName &&
                        !bestFinish.years.includes(new Date().getFullYear())
                    ) {
                        bestFinish.years.push(new Date().getFullYear());
                    }

                    // Break from the loop if a match result is found for the player
                    if (playerWon || (match.winner !== null && match.winner !== 'Bye')) {
                        break;
                    }
                }
            }
        }
    }

    const updatedStats: Record<TournamentNames, TournamentStats> = {
        ...currentStats,
        [activeTournament.name]: {
            wins,
            losses,
            bestFinish,
        },
    };

    return updatedStats;
};

const calculateSeasonAccolades = (player: NewPlayer): Omit<Accolades, 'tournamentStats'> => {
    const { accolades: currentAccolades } = player;
    const { bestDivisionalFinish, bestOverallFinish, divisionTitles, overallTitles } =
        currentAccolades;
    const { divisionRanking, overallRanking } = player.seasonStats;
    const newAccolades: Omit<Accolades, 'tournamentStats'> = {
        bestDivisionalFinish:
            bestDivisionalFinish && bestDivisionalFinish < divisionRanking
                ? bestDivisionalFinish
                : divisionRanking,
        bestOverallFinish:
            bestOverallFinish && bestOverallFinish < overallRanking
                ? bestOverallFinish
                : overallRanking,
        divisionTitles: divisionRanking === 1 ? divisionTitles + 1 : divisionTitles,
        overallTitles: overallRanking === 1 ? overallTitles + 1 : overallTitles,
    };
    return newAccolades;
};

const updatePlayerAccolades = async (player: NewPlayer) => {
    const playerRef = doc(firestore, 'newPlayers', player.id);
    const seasonAccolades = calculateSeasonAccolades(player);
    const { bestDivisionalFinish, bestOverallFinish, divisionTitles, overallTitles } =
        seasonAccolades;
    const tournamentUpdate = {
        'accolades.bestDivisionalFinish': bestDivisionalFinish,
        'accolades.bestOverallFinish': bestOverallFinish,
        'accolades.divisionTitles': divisionTitles,
        'accolades.overallTitles': overallTitles,
    };

    try {
        await updateDoc(playerRef, tournamentUpdate);
    } catch (error) {
        console.error('Error updated tournament stats:', error);
    }
};

const updatePlayerTournamentStats = async (
    playerId: string,
    currentStats: Record<TournamentNames, TournamentStats>,
): Promise<void> => {
    const playerRef = doc(firestore, 'newPlayers', playerId);
    const tournamentAccolades = await calculatePlayerAccoladesInTournament(playerId, currentStats);
    const tournamentUpdate = {
        'accolades.tournamentStats': tournamentAccolades,
    };

    try {
        await updateDoc(playerRef, tournamentUpdate);
    } catch (error) {
        console.error('Error updated tournament stats:', error);
    }
};

const resetSeasonStatsForPlayer = async (playerId: string): Promise<void> => {
    const playerRef = doc(firestore, 'newPlayers', playerId);

    // Object containing the paths to the fields you want to update
    const seasonResetUpdate = {
        'seasonStats.wins': 0,
        'seasonStats.losses': 0,
        'seasonStats.elo': BASE_ELO,
        'seasonStats.divisionRanking': 0,
        'seasonStats.overallRanking': 0,
    };

    try {
        await updateDoc(playerRef, seasonResetUpdate);
    } catch (error) {
        console.error('Error resetting season stats:', error);
    }
};

export const resetSeason = async (): Promise<void> => {
    const players = await getPlayers();
    if (players) {
        const updates = players.map(async (player) => {
            if (player.id) {
                await resetSeasonStatsForPlayer(player.id);
                await updatePlayerTournamentStats(player.id, player.accolades.tournamentStats);
                await updatePlayerAccolades(player);
            }
        });

        try {
            await Promise.all(updates);
            console.log('Season stats reset for all players');
        } catch (error) {
            console.error('Error resetting season stats for players:', error);
        }
    }
};
