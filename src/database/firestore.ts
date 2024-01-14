import {
    getFirestore,
    collection,
    getDocs,
    doc,
    updateDoc,
    query,
    where,
} from 'firebase/firestore';
import { Player, BasePlayer } from '../Types/dataTypes';
import { app } from '../Security/firebase';

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
    console.log(officeOne);

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
