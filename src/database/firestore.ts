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
} from 'firebase/firestore';
import { Player, BasePlayer, MatchInfo, Result } from '../Types/dataTypes';
import { app } from '../Security/firebase';
import { calculateElo } from '../Utils/eloUtils';

export const firestore = getFirestore(app);

export const addPlayer = async (playerInfo: BasePlayer): Promise<void> => {
    try {
        const playersRef = collection(firestore, 'Players');
        await addDoc(playersRef, playerInfo);
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
    winnerOffice: string,
    loserOffice: string,
): Promise<void> => {
    const offices: string[] = [];
    offices.push(winnerOffice);

    if (winnerOffice !== loserOffice) {
        offices.push(loserOffice);
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

        await addDoc(matchesRef, {
            winnerScore,
            loserScore,
            winnerId: winner.id,
            loserId: loser.id,
            date,
            office,
        });

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
