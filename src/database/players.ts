import { firestore, updateDivisionRankings, updateOverallRankings } from './firestore';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { Player, BasePlayer } from '../Types/dataTypes';
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
