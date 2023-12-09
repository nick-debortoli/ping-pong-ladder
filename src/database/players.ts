import { firestore, updateDivisionRankings, updateOverallRankings } from './firestore';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { Player, BasePlayer } from '../Types/dataTypes';

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
