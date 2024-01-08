import { firestore } from './firestore';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { Tournament } from '../Types/dataTypes';

export const getTournaments = async (): Promise<Array<Tournament> | null> => {
    try {
        const tournamnetsRef = collection(firestore, 'Tournaments');
        const querySnapshot = await getDocs(tournamnetsRef);

        const tournamnetList: Array<Tournament> = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            const startDate = data.startDate ? data.startDate.toDate() : data.startDate;
            const endDate = data.endDate ? data.endDate.toDate() : data.endDate;
            const seedsLock = data.seedsLock ? data.seedsLock.toDate() : data.seedsLock;

            return {
                ...(data as Tournament),
                startDate,
                endDate,
                seedsLock,
            };
        });

        return tournamnetList;
    } catch (error) {
        console.error('Error fetching tournamnets: ', error);
        return null;
    }
};

export const getActiveTournament = async (): Promise<Tournament | null> => {
    try {
        const tournamnetsRef = collection(firestore, 'Tournaments');
        const querySnapshot = await getDocs(tournamnetsRef);

        const tournamnetList: Array<Tournament> = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            const startDate = data.startDate ? data.startDate.toDate() : data.startDate;
            const endDate = data.endDate ? data.endDate.toDate() : data.endDate;
            const seedsLock = data.seedsLock ? data.seedsLock.toDate() : data.seedsLock;

            return {
                ...(data as Tournament),
                startDate,
                endDate,
                seedsLock,
            };
        });

        const activeTournament = tournamnetList.find((tournament) => tournament.isActive === true);

        return activeTournament || null;
    } catch (error) {
        console.error('Error fetching tournaments: ', error);
        return null;
    }
};

export const updateTournamentInfo = async (tournament: Tournament): Promise<void> => {
    try {
        const tournamnetsRef = collection(firestore, 'Tournaments');
        const querySnapshot = await getDocs(tournamnetsRef);

        if (!querySnapshot.empty) {
            // Find the correct tournament document using the unique identifier (e.g., name or id)
            const tournamentDoc = querySnapshot.docs.find(
                (doc) => doc.data().name === tournament.name,
            );

            if (tournamentDoc) {
                const tournamentDocRef = doc(firestore, 'Tournaments', tournamentDoc.id);

                // Update the document with the new tournament data
                await updateDoc(tournamentDocRef, {
                    ...tournament,
                });
            }
        }
    } catch (error) {
        console.error('Error updating tournament information: ', error);
        throw error; // You can choose to re-throw the error or handle it as needed.
    }
};
