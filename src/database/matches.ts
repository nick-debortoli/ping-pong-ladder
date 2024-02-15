import { firestore, updateDivisionRankings, updateOverallRankings } from './firestore';
import {
    addDoc,
    collection,
    getDocs,
    doc,
    updateDoc,
    increment,
    query,
    limit,
    where,
    getDoc,
    setDoc,
    orderBy,
} from 'firebase/firestore';
import { MatchInfo, Result, BracketMatch, Tournament, Round, NewPlayer } from '../Types/dataTypes';
import { calculateElo } from '../Utils/eloUtils';
import { isRecentMatch } from '../Utils/matchUtils';
import { getNextMatchId, getRoundName } from '../Utils/tournamentUtils';
import { updateTournamentInfo } from './tournaments';

const updateRecentMatchesArray = (newMatchId, existingRecentMatches, maxMatches = 3) => {
    let updatedMatches = [newMatchId];

    if (existingRecentMatches && existingRecentMatches.length) {
        updatedMatches = updatedMatches.concat(existingRecentMatches);

        if (updatedMatches.length > maxMatches) {
            updatedMatches = updatedMatches.slice(0, maxMatches);
        }
    }

    return updatedMatches;
};

const updateRoundWithMatch = (newRounds: Round, match: BracketMatch) => {
    for (const roundKey in newRounds) {
        if (Object(newRounds).hasOwnProperty(roundKey)) {
            const round = newRounds[roundKey];
            const matchIndex = round.findIndex((m) => m.matchId === match.matchId);

            if (matchIndex !== -1) {
                round[matchIndex] = match;
                break; // Exit the loop once the match is found and updated
            }
        }
    }
};

const determineRoundWinner = (
    scoresPlayer1: number[],
    scoresPlayer2: number[],
    player1: string,
    player2: string,
    winningGame: number,
): { winner: string | null; winsPlayer1: number; winsPlayer2: number } => {
    let winsPlayer1 = 0,
        winsPlayer2 = 0;

    for (let i = 0; i < scoresPlayer1.length; i++) {
        if (scoresPlayer1[i] > scoresPlayer2[i]) {
            winsPlayer1++;
        } else if (scoresPlayer1[i] < scoresPlayer2[i]) {
            winsPlayer2++;
        }

        if (winsPlayer1 === winningGame) {
            return { winner: player1, winsPlayer1, winsPlayer2 };
        } else if (winsPlayer2 === winningGame) {
            return { winner: player2, winsPlayer1, winsPlayer2 };
        }
    }

    return { winner: null, winsPlayer1, winsPlayer2 };
};

const advanceToNextRound = (
    newRounds: Round,
    currentMatchId: number,
    nextMatchId: number,
    winnerSeed: number,
    winnerId: string,
): void => {
    for (const round in newRounds) {
        for (const match of newRounds[round]) {
            if (match.matchId === nextMatchId) {
                if (currentMatchId % 2 === 0) {
                    match.player2 = { seed: winnerSeed, playerId: winnerId };
                } else {
                    match.player1 = { seed: winnerSeed, playerId: winnerId };
                }
            }
        }
    }
};

export const addTournamentMatch = async (
    matchInfo: Result,
    tournament: Tournament | null,
    match: BracketMatch | null,
    round: string | null,
): Promise<void> => {
    if (!match || !round || !tournament) return;

    const { playerA, playerB, playerAScore, playerBScore, office } = matchInfo;
    const { player1, player2, matchId } = match;

    if (player1 === 'Bye' || player2 === 'Bye' || !player1 || !player2 || !matchId) return;

    if (
        typeof playerA !== 'object' ||
        !playerA?.id ||
        typeof playerB !== 'object' ||
        !playerB?.id
    ) {
        throw new Error('Invalid player data');
    }

    await addMatch(matchInfo);

    const newRounds = tournament.rounds[office];
    const roundName = getRoundName(round, Math.ceil(Math.log2(tournament.seeds[office].length)));

    const player1Score = player1.playerId === playerA.id ? playerAScore : playerBScore;
    const player2Score = player2.playerId === playerA.id ? playerAScore : playerBScore;

    if (!match.scores1) {
        match.scores1 = [];
    }

    if (!match.scores2) {
        match.scores2 = [];
    }

    match.scores1.push(player1Score);
    match.scores2.push(player2Score);

    const winningGame = roundName === 'Finals' || roundName == 'Semifinals' ? 3 : 2;

    const roundResults = determineRoundWinner(
        match.scores1,
        match.scores2,
        player1.playerId,
        player2.playerId,
        winningGame,
    );

    if (roundResults.winner) {
        const { winner: winnerId } = roundResults;
        match.winner = winnerId;
        const roundRegex = round.match(/round(\d+)/);
        let roundNumber = 1;
        if (roundRegex) {
            roundNumber = parseInt(roundRegex[1], 10);
        }

        const nextMatchId = getNextMatchId(tournament.seeds[office].length, matchId, roundNumber);
        const winnerSeed = player1.playerId === winnerId ? player1.seed : player2.seed;
        if (winnerSeed) {
            advanceToNextRound(newRounds, matchId, nextMatchId, winnerSeed, winnerId);
        }
    }

    updateRoundWithMatch(newRounds, match);

    const newTournament = { ...tournament, rounds: { ...tournament.rounds, [office]: newRounds } };
    await updateTournamentInfo(newTournament);
};

const updateHeadToHead = async (winner, winnerScore, loser, loserScore, matchDocRef) => {
    const headToHeadWinnerRef = doc(firestore, `newPlayers/${winner.id}/head2head`, loser.id);
    const headToHeadLoserRef = doc(firestore, `newPlayers/${loser.id}/head2head`, winner.id);

    const headToHeadWinnerSnapshot = await getDoc(headToHeadWinnerRef);
    const headToHeadWinnerData = headToHeadWinnerSnapshot.data();
    const existingWinnerMatches = headToHeadWinnerData ? headToHeadWinnerData.recentMatchIds : [];
    const headToHeadLoserSnapshot = await getDoc(headToHeadLoserRef);
    const headToHeadLoserData = headToHeadLoserSnapshot.data();
    const existingLoserMatches = headToHeadLoserData ? headToHeadLoserData.recentMatchIds : [];

    if (headToHeadWinnerSnapshot.exists()) {
        await updateDoc(headToHeadWinnerRef, {
            wins: increment(1),
            pointsFor: increment(winnerScore),
            pointsAgainst: increment(loserScore),
            recentMatchIds: updateRecentMatchesArray(matchDocRef.id, existingWinnerMatches),
        });
    } else {
        await setDoc(headToHeadWinnerRef, {
            wins: 1,
            losses: 0,
            pointsFor: winnerScore,
            pointsAgainst: loserScore,
            recentMatchIds: updateRecentMatchesArray(matchDocRef.id, existingWinnerMatches),
        });
    }

    if (headToHeadLoserSnapshot.exists()) {
        await updateDoc(headToHeadLoserRef, {
            losses: increment(1),
            pointsFor: increment(loserScore),
            pointsAgainst: increment(winnerScore),
            recentMatchIds: updateRecentMatchesArray(matchDocRef.id, existingLoserMatches),
        });
    } else {
        await setDoc(headToHeadLoserRef, {
            wins: 0,
            losses: 1,
            pointsFor: loserScore,
            pointsAgainst: winnerScore,
            recentMatchIds: updateRecentMatchesArray(matchDocRef.id, existingLoserMatches),
        });
    }
};

export const addMatch = async (matchInfo: Result): Promise<void> => {
    const { playerA, playerB, playerAScore, playerBScore, office, event } = matchInfo;
    if (
        typeof playerA !== 'object' ||
        !playerA?.id ||
        typeof playerB !== 'object' ||
        !playerB?.id
    ) {
        throw new Error('Invalid player data');
    }

    try {
        const matchesRef = collection(firestore, 'Matches');
        const date = new Date().toISOString();
        let winner: NewPlayer, loser: NewPlayer, winnerScore: number, loserScore: number;

        if (playerAScore > playerBScore) {
            winner = playerA;
            loser = playerB;
            winnerScore = playerAScore;
            loserScore = playerBScore;
        } else {
            winner = playerB;
            loser = playerA;
            winnerScore = playerBScore;
            loserScore = playerAScore;
        }

        const matchDocRef = await addDoc(matchesRef, {
            winnerScore,
            loserScore,
            winnerId: winner.id,
            loserId: loser.id,
            date,
            office,
            event: event || null,
        });

        // Update head-to-head stats for both players
        await updateHeadToHead(winner, winnerScore, loser, loserScore, matchDocRef);

        const newElos = calculateElo(
            winner.seasonStats.elo,
            loser.seasonStats.elo,
            winner.lifetimeElo,
            loser.lifetimeElo,
        );

        // Update the winner's wins and Elo
        const winnerRef = doc(firestore, 'newPlayers', winner.id);
        await updateDoc(winnerRef, {
            'seasonStats.wins': increment(1),
            'seasonStats.elo': newElos.winnerSeasonElo,
            lifetimeWins: increment(1),
            lifetimeElo: newElos.winnerElo,
        });

        // Update the loser's losses and Elo
        const loserRef = doc(firestore, 'newPlayers', loser.id);
        await updateDoc(loserRef, {
            'seasonStats.losses': increment(1),
            'seasonStats.elo': newElos.loserSeasonElo,
            lifetimeLosses: increment(1),
            lifetimeElo: newElos.loserElo,
        });

        // Update division rankings for the player offices
        await updateDivisionRankings(winner.bio.office, loser.bio.office);

        // Update overall rankings for all players
        await updateOverallRankings();
    } catch (error) {
        console.error('Error adding match: ', error);
    }
};

export const checkRecentMatches = async (resultsData: Result): Promise<boolean> => {
    const { playerA, playerB, playerAScore, playerBScore } = resultsData;

    let winner: NewPlayer, loser: NewPlayer, winnerScore: number, loserScore: number;
    if (playerAScore > playerBScore) {
        winner = playerA as NewPlayer;
        loser = playerB as NewPlayer;
        winnerScore = playerAScore;
        loserScore = playerBScore;
    } else {
        winner = playerB as NewPlayer;
        loser = playerA as NewPlayer;
        winnerScore = playerBScore;
        loserScore = playerAScore;
    }

    // Define the criteria for matching recent matches
    const matchesCollection = collection(firestore, 'Matches');
    const recentMatchesQuery = query(
        matchesCollection,
        ...[
            where('winnerId', '==', winner.id),
            where('loserId', '==', loser.id),
            where('winnerScore', '==', winnerScore),
            where('loserScore', '==', loserScore),
            orderBy('date', 'desc'), // Order by matchDate in descending order (latest first)
            limit(10), // Limit the query to the latest 10 matches
        ],
    );

    // Fetch recent matches
    const querySnapshot = await getDocs(recentMatchesQuery);

    // Check the dates within 3 minutes
    for (const doc of querySnapshot.docs) {
        const matchData = doc.data();
        if (isRecentMatch(matchData.date)) {
            return true;
        }
    }

    return false;
};

export const getRecentMatches = async (): Promise<Array<MatchInfo> | null> => {
    try {
        const matchesRef = collection(firestore, 'Matches');

        const matchesQuery = query(matchesRef, orderBy('date', 'desc'), limit(20));
        const querySnapshot = await getDocs(matchesQuery);

        const matchesList: Array<MatchInfo> = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as MatchInfo),
        }));

        return matchesList.length > 0 ? matchesList : [];
    } catch (error) {
        console.error('Error fetching matches: ', error);
        return null;
    }
};
