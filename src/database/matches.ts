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
import { Player, MatchInfo, Result } from '../Types/dataTypes';
import { calculateElo } from '../Utils/eloUtils';
import { isRecentMatch } from '../Utils/matchUtils';

const updateRecentMatchesArray = (newMatchId, existingRecentMatches, maxMatches = 3) => {
    // Create a new array starting with the new match ID
    let updatedMatches = [newMatchId];

    // Add existing match IDs, ensuring the total length doesn't exceed maxMatches
    if (existingRecentMatches && existingRecentMatches.length) {
        // Concatenate the existing matches after the new match ID
        updatedMatches = updatedMatches.concat(existingRecentMatches);

        // If the array exceeds the maximum length, truncate it
        if (updatedMatches.length > maxMatches) {
            updatedMatches = updatedMatches.slice(0, maxMatches);
        }
    }

    return updatedMatches;
};

export const addMatch = async (matchInfo: Result): Promise<void> => {
    const { playerA, playerB, playerAScore, playerBScore, office } = matchInfo;

    if (typeof playerA !== 'object' || !playerA.id || typeof playerB !== 'object' || !playerB.id) {
        throw new Error('Invalid player data');
    }

    try {
        const matchesRef = collection(firestore, 'Matches');
        const date = new Date().toISOString();
        let winner: Player, loser: Player, winnerScore: number, loserScore: number;

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
        });

        // Update head-to-head stats for both players
        const headToHeadWinnerRef = doc(firestore, `Players/${winner.id}/head2head`, loser.id);
        const headToHeadLoserRef = doc(firestore, `Players/${loser.id}/head2head`, winner.id);

        const headToHeadWinnerSnapshot = await getDoc(headToHeadWinnerRef);
        const headToHeadWinnerData = headToHeadWinnerSnapshot.data();
        const existingWinnerMatches = headToHeadWinnerData
            ? headToHeadWinnerData.recentMatchIds
            : [];
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

        const newElos = calculateElo(winner.elo, loser.elo);

        // Update the winner's wins and Elo
        const winnerRef = doc(firestore, 'Players', winner.id);
        await updateDoc(winnerRef, {
            wins: increment(1),
            elo: newElos.winnerElo,
        });

        // Update the loser's losses and Elo
        const loserRef = doc(firestore, 'Players', loser.id);
        await updateDoc(loserRef, {
            losses: increment(1),
            elo: newElos.loserElo,
        });

        // Update division rankings for the player offices
        await updateDivisionRankings(winner.office, loser.office);

        // Update overall rankings for all players
        await updateOverallRankings();
    } catch (error) {
        console.error('Error adding match: ', error);
    }
};

export const checkRecentMatches = async (resultsData: Result): Promise<boolean> => {
    const { playerA, playerB, playerAScore, playerBScore } = resultsData;

    let winner: Player, loser: Player, winnerScore: number, loserScore: number;
    if (playerAScore > playerBScore) {
        winner = playerA as Player;
        loser = playerB as Player;
        winnerScore = playerAScore;
        loserScore = playerBScore;
    } else {
        winner = playerB as Player;
        loser = playerA as Player;
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
