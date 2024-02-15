import {
    getFirestore,
    collection,
    getDocs,
    doc,
    updateDoc,
    query,
    where,
    setDoc,
} from 'firebase/firestore';
import { HeadToHead, NewBasePlayer, NewPlayer, Player } from '../Types/dataTypes';
import { app } from '../Security/firebase';
import { getOldPlayers } from './players';

export const firestore = getFirestore(app);

async function getHead2HeadData(playerId: string): Promise<Record<string, HeadToHead>> {
    const head2HeadRef = collection(firestore, `Players/${playerId}/head2head`);
    const snapshot = await getDocs(head2HeadRef);
    const head2HeadData: Record<string, HeadToHead> = {};

    snapshot.docs.forEach((doc) => {
        head2HeadData[doc.id] = doc.data() as HeadToHead;
    });
    return head2HeadData;
}

async function migrateHead2HeadData(playerId: string, head2HeadData: Record<string, HeadToHead>) {
    const head2HeadCollectionRef = collection(firestore, `newPlayers/${playerId}/head2head`);
    for (const [opponentId, data] of Object.entries(head2HeadData)) {
        const head2HeadDocRef = doc(head2HeadCollectionRef, opponentId); // Use opponentId as doc ID
        await setDoc(head2HeadDocRef, data);
    }
}

async function transformAndMigratePlayer(player: Player) {
    const head2HeadData = await getHead2HeadData(player.id);

    const newPlayer: NewBasePlayer = {
        bio: {
            firstName: player.firstName,
            lastName: player.lastName,
            country: player.country,
            playStyle: player.playStyle,
            turnedPro: player.turnedPro,
            office: player.office,
            email: player.email,
        },
        seasonStats: {
            elo: player.elo,
            wins: player.wins,
            losses: player.losses,
            overallRanking: player.overallRanking,
            divisionRanking: player.divisionRanking,
        },
        lifetimeElo: player.elo,
        lifetimeWins: player.wins,
        lifetimeLosses: player.losses,
        accolades: {
            // This would require additional logic or assumptions
            tournamentStats: {
                'Ark Open': {
                    bestFinish: null,
                    wins: 0,
                    losses: 0,
                },
                'DC Open': {
                    bestFinish: null,
                    wins: 0,
                    losses: 0,
                },
                Govimbledon: {
                    bestFinish: null,
                    wins: 0,
                    losses: 0,
                },
                'PGH Open': {
                    bestFinish: null,
                    wins: 0,
                    losses: 0,
                },
            }, // You need to provide logic on how to fill this
            overallTitles: 0, // Placeholder, adjust as needed
            divisionTitles: 0, // Placeholder, adjust as needed
            bestOverallFinish: null, // Placeholder, adjust as needed
            bestDivisionalFinish: null, // Placeholder, adjust as needed
        },
    };

    // Update Firestore document
    const playerDocRef = doc(firestore, 'newPlayers', player.id);
    await setDoc(playerDocRef, newPlayer);
    await migrateHead2HeadData(player.id, head2HeadData);
}

// Execute migration
export async function migratePlayers() {
    const players = await getOldPlayers();
    if (players) {
        for (const player of players) {
            await transformAndMigratePlayer(player);
        }
    }
}

async function updateRankings(players: NewPlayer[], rankingField: string): Promise<void> {
    players.sort((a, b) => b.seasonStats.elo - a.seasonStats.elo);
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        if (player.id) {
            const playerRef = doc(firestore, 'newPlayers', player.id);
            const updateData = {
                [`seasonStats.${rankingField}`]: i + 1,
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
            collection(firestore, 'newPlayers'),
            where('office', '==', office),
        );
        const officePlayersSnapshot = await getDocs(officePlayersQuery);
        const officePlayers = officePlayersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as NewBasePlayer),
        }));

        await updateRankings(officePlayers, 'divisionRanking');
    }
};

export const updateOverallRankings = async (): Promise<void> => {
    const allPlayersQuery = query(collection(firestore, 'newPlayers'));
    const allPlayersSnapshot = await getDocs(allPlayersQuery);
    const allPlayers = allPlayersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as NewBasePlayer),
    }));
    await updateRankings(allPlayers, 'overallRanking');
};
