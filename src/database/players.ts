import { firestore, updateDivisionRankings, updateOverallRankings } from './firestore';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { Player, BasePlayer, HeadToHead } from '../Types/dataTypes';
import { standardizeToUSA } from '../Utils/stringUtils';

export const addPlayer = async (playerInfo: BasePlayer): Promise<void> => {
    playerInfo.country = standardizeToUSA(playerInfo.country);
    try {
        const playersRef = collection(firestore, 'Players');

        const q = query(playersRef, where('email', '==', playerInfo.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            console.error('Player with this email already exists');
            return;
        }

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
