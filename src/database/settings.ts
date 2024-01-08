import { firestore } from './firestore';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { Season } from '../Types/dataTypes';

export const getSeasonInfo = async (): Promise<Season | null> => {
    try {
        const settingsRef = collection(firestore, 'Settings');
        const querySnapshot = await getDocs(settingsRef);

        const seasonList: Array<Season> = querySnapshot.docs.map((doc) => ({
            seasonStartDate: doc.data().seasonStartDate.toDate(),
            seasonEndDate: doc.data().seasonEndDate.toDate(),
        }));

        return seasonList[0];
    } catch (error) {
        console.error('Error fetching season: ', error);
        return null;
    }
};

export const updateSeasonInfo = async (season: Season): Promise<void> => {
    try {
        const settingsRef = collection(firestore, 'Settings');
        const querySnapshot = await getDocs(settingsRef);

        if (!querySnapshot.empty) {
            const settingsDoc = querySnapshot.docs[0];
            const settingsDocRef = doc(firestore, 'Settings', settingsDoc.id);

            // Update the document with the new season data
            await updateDoc(settingsDocRef, {
                seasonStartDate: season.seasonStartDate,
                seasonEndDate: season.seasonEndDate,
            });
        }
    } catch (error) {
        console.error('Error updating season information: ', error);
        throw error; // You can choose to re-throw the error or handle it as needed.
    }
};
