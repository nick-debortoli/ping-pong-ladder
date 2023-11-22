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
} from 'firebase/firestore';
import { Player, BasePlayer, MatchInfo, Result } from '../Types/dataTypes';
import { app } from '../Security/firebase';

export const firestore = getFirestore(app);

export const addPlayer = async (playerInfo: BasePlayer): Promise<void> => {
    const { firstName, lastName, email, elo, wins, losses, office } = playerInfo;
    try {
        const playersRef = collection(firestore, 'Players');

        await addDoc(playersRef, {
            firstName,
            lastName,
            email,
            elo,
            wins,
            losses,
            office,
        });
    } catch (error) {
        console.error('Error adding player: ', error);
    }
};

export const getPlayers = async (): Promise<Array<Player> | null> => {
    try {
        const playersRef = collection(firestore, 'Players');
        const playersList: Array<Player> = [];

        const querySnapshot = await getDocs(playersRef);
        querySnapshot.forEach((doc) => {
            const playerData = doc.data() as BasePlayer; // Assuming your Player type matches the structure in your Firestore documents
            const player: Player = {
                id: doc.id,
                ...playerData,
            };
            playersList.push(player);
        });

        return playersList;
    } catch (error) {
        console.error('Error adding player: ', error);
    }

    return null;
};

export const addMatch = async (matchInfo: Result): Promise<void> => {
    const { playerA, playerB, playerAScore, playerBScore, office } = matchInfo;

    if (typeof playerA !== 'object' || !playerA.id || typeof playerB !== 'object' || !playerB.id) {
        throw new Error('Invalid player data');
    }

    try {
        const matchesRef = collection(firestore, 'Matches');
        const date = new Date().toISOString();
        let winnerId, loserId, winnerScore, loserScore;

        if (playerAScore > playerBScore) {
            winnerId = playerA.id;
            loserId = playerB.id;
            winnerScore = playerAScore;
            loserScore = playerBScore;
        } else {
            winnerId = playerB.id;
            loserId = playerA.id;
            winnerScore = playerBScore;
            loserScore = playerAScore;
        }

        await addDoc(matchesRef, {
            winnerScore,
            loserScore,
            winnerId,
            date,
            loserId,
            office,
        });

        // Update the winner's wins
        const winnerRef = doc(firestore, 'Players', winnerId);
        await updateDoc(winnerRef, {
            wins: increment(1),
        });

        // Update the loser's losses
        const loserRef = doc(firestore, 'Players', loserId);
        await updateDoc(loserRef, {
            losses: increment(1),
        });
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
