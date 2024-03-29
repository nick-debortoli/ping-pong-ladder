import { firestore } from './firestore';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { BracketMatch, Office, Tournament } from '../Types/dataTypes';

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

export const updateTournamentInfo = async (tournament: Tournament): Promise<void> => {
    try {
        const tournamnetsRef = collection(firestore, 'Tournaments');
        const querySnapshot = await getDocs(tournamnetsRef);

        if (!querySnapshot.empty) {
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

export const updateTournamentRoundsByName = async (
    updatedRoundsObject: { [key: string]: BracketMatch[] },
    tournamentName: string,
    activeOffice: Office,
): Promise<void> => {
    try {
        const tournamentsRef = collection(firestore, 'Tournaments');
        const querySnapshot = await getDocs(tournamentsRef);

        const tournamentDoc = querySnapshot.docs.find((doc) => doc.data().name === tournamentName);
        if (tournamentDoc) {
            const tournamentDocRef = doc(firestore, 'Tournaments', tournamentDoc.id);
            const roundsKey = `rounds.${activeOffice}`; // Dynamically create the key for updating

            await updateDoc(tournamentDocRef, {
                [roundsKey]: updatedRoundsObject,
            });
        } else {
            console.error('Tournament not found with the given name: ', tournamentName);
        }
    } catch (error) {
        console.error('Error updating tournament rounds: ', error);
        throw error;
    }
};

export const findActiveTournament = async (): Promise<Tournament | null> => {
    const tournamentsRef = collection(firestore, 'Tournaments');
    const q = query(tournamentsRef, where('isActive', '==', true));
    const querySnapshot = await getDocs(q);

    // Assuming there is only one active tournament at a time
    if (!querySnapshot.empty) {
        return {
            ...(querySnapshot.docs[0].data() as Tournament),
        };
    } else {
        return null;
    }
};
