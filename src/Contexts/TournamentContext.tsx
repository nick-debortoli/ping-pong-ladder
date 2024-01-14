import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { Tournament } from '../Types/dataTypes';
import { firestore } from '../database/firestore';
import { onSnapshot, collection } from 'firebase/firestore';
import { getTournaments } from '../database/tournaments';

interface TournamentContextProps {
    tournaments: Tournament[];
    loading: boolean;
    getActiveTournament: () => Tournament | null;
}

const TournamentContext = createContext<TournamentContextProps | undefined>(undefined);

interface TournamentProviderProps {
    children: ReactNode;
}

export const TournamentProvider: React.FC<TournamentProviderProps> = ({ children }) => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchTournaments = async () => {
            const tournamentsRef = collection(firestore, 'Tournaments');

            const unsubscribe = onSnapshot(
                tournamentsRef,
                (snapshot) => {
                    const tournamentsData: Array<Tournament> = snapshot.docs.map((doc) => {
                        const tournamntData = doc.data() as Tournament;
                        return {
                            ...tournamntData,
                        };
                    });

                    setTournaments(tournamentsData);
                    setLoading(false);
                },
                (error) => {
                    console.error('Error listening to tournaments collection: ', error);
                    setLoading(false);
                },
            );

            try {
                const tournamentsData = await getTournaments();
                if (tournamentsData) {
                    setTournaments(tournamentsData);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching tournaments: ', error);
                setLoading(false);
            }

            return () => unsubscribe();
        };

        fetchTournaments();
    }, []);

    const getActiveTournament = (): Tournament | null => {
        const activeTournament = tournaments.find((tournament) => tournament.isActive === true);
        return activeTournament || null;
    };

    return (
        <TournamentContext.Provider
            value={{
                tournaments,
                loading,
                getActiveTournament,
            }}
        >
            {children}
        </TournamentContext.Provider>
    );
};

export const useTournaments = () => {
    const context = useContext(TournamentContext);
    if (!context) {
        throw new Error('useTournaments must be used within a TournamentProvider');
    }
    return context;
};
