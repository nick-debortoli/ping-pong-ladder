import {
    getFirestore,
    addDoc,
    collection,
    getDocs,
    doc,
    updateDoc,
    increment,
    query,
    orderBy,
    limit,
    where,
    getDoc,
    setDoc,
} from 'firebase/firestore';
import { Player, BasePlayer, MatchInfo, Result, BugSubmission } from '../Types/dataTypes';
import { app } from '../Security/firebase';
import { calculateElo } from '../Utils/eloUtils';

export const firestore = getFirestore(app);

async function updateRankings(players: Player[], rankingField: string): Promise<void> {
    players.sort((a, b) => b.elo - a.elo);
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        if (player.id) {
            const playerRef = doc(firestore, 'Players', player.id);
            const updateData = {
                [rankingField]: i + 1,
            };
            await updateDoc(playerRef, updateData);
        }
    }
}

export const updateDivisionRankings = async (
    officeOne: string,
    officeTwo?: string,
): Promise<void> => {
    const offices: string[] = [];
    offices.push(officeOne);

    if (officeTwo && officeOne !== officeTwo) {
        offices.push(officeTwo);
    }

    for (const i in offices) {
        const office = offices[i];
        const officePlayersQuery = query(
            collection(firestore, 'Players'),
            where('office', '==', office),
        );
        const officePlayersSnapshot = await getDocs(officePlayersQuery);
        const officePlayers = officePlayersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as BasePlayer),
        }));
        await updateRankings(officePlayers, 'divisionRanking');
    }
};

export const updateOverallRankings = async (): Promise<void> => {
    const allPlayersQuery = query(collection(firestore, 'Players'));
    const allPlayersSnapshot = await getDocs(allPlayersQuery);
    const allPlayers = allPlayersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as BasePlayer),
    }));
    await updateRankings(allPlayers, 'overallRanking');
};

export const addPlayer = async (playerInfo: BasePlayer): Promise<void> => {
    try {
        const playersRef = collection(firestore, 'Players');
        await addDoc(playersRef, playerInfo);

        await updateDivisionRankings(playerInfo.office);
        await updateOverallRankings();
    } catch (error) {
        console.error('Error adding player: ', error);
    }
};

export const getPlayers = async (): Promise<Array<Player> | null> => {
    try {
        const playersRef = collection(firestore, 'Players');
        const querySnapshot = await getDocs(playersRef);

        const playersList: Array<Player> = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as BasePlayer),
        }));

        return playersList;
    } catch (error) {
        console.error('Error fetching players: ', error);
        return null;
    }
};

function updateRecentMatchesArray(newMatchId, existingRecentMatches, maxMatches = 3) {
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
}

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

export const getRecentMatches = async (): Promise<Array<MatchInfo> | null> => {
    try {
        const matchesRef = collection(firestore, 'Matches');
        const matchesQuery = query(matchesRef, orderBy('date', 'desc'), limit(5));
        const querySnapshot = await getDocs(matchesQuery);

        const matchesList: Array<MatchInfo> = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as MatchInfo),
        }));

        return matchesList;
    } catch (error) {
        console.error('Error fetching matches: ', error);
        return null;
    }
};

export const addBug = async (bugInfo: BugSubmission): Promise<void> => {
    try {
        const bugsRef = collection(firestore, 'Bugs');
        await addDoc(bugsRef, bugInfo);
    } catch (error) {
        console.error('Error adding bug: ', error);
    }
};
