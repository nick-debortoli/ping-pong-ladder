import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { NewPlayer, HeadToHead } from '../Types/dataTypes';
import { firestore } from '../database/firestore';
import { onSnapshot, collection, getDocs } from 'firebase/firestore';
import { getPlayers } from '../database/players';

interface PlayersContextProps {
    players: Array<NewPlayer>;
    loading: boolean;
    getPlayerById: (id: string) => NewPlayer | null;
    getTopPlayer: () => NewPlayer;
    getH2HByOpponent: (playerId: string, opponentId: string) => HeadToHead | null;
}

const PlayersContext = createContext<PlayersContextProps | undefined>(undefined);

interface PlayerProviderProps {
    children: ReactNode;
}

export const PlayersProvider: React.FC<PlayerProviderProps> = ({ children }) => {
    const [players, setPlayers] = useState<Array<NewPlayer>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayers = async () => {
            const playersRef = collection(firestore, 'newPlayers');

            const unsubscribe = onSnapshot(
                playersRef,
                async (snapshot) => {
                    const playersData: Array<NewPlayer> = [];

                    for (const doc of snapshot.docs) {
                        const playerData = doc.data() as Omit<NewPlayer, 'id'>;
                        const id = doc.id;

                        // Fetch head2head data for each player
                        const head2HeadRef = collection(firestore, `newPlayers/${id}/head2head`);
                        const head2HeadSnapshot = await getDocs(head2HeadRef);
                        const head2HeadData: Record<string, HeadToHead> = {};
                        head2HeadSnapshot.docs.forEach((doc) => {
                            head2HeadData[doc.id] = doc.data() as HeadToHead;
                        });

                        // Add head2head data to the player
                        playersData.push({
                            id,
                            ...playerData,
                            head2head: head2HeadData,
                        });
                    }

                    setPlayers(playersData);
                    setLoading(false);
                },
                (error) => {
                    console.error('Error listening to players collection: ', error);
                    setLoading(false);
                },
            );

            try {
                const playersData = await getPlayers();
                if (playersData) {
                    setPlayers(playersData);
                }
                setLoading(false);
            } catch (error) {
                // Handle error case
                console.error('Error fetching players: ', error);
                setLoading(false);
            }

            return () => unsubscribe();
        };

        fetchPlayers();
    }, []);

    const getPlayerById = (id: string): NewPlayer | null => {
        const playerById = players.find((player) => player.id === id);
        if (playerById) {
            return playerById;
        }
        return null;
    };

    const getTopPlayer = (): NewPlayer => {
        const topPlayer = players.find((player) => player.seasonStats.overallRanking === 1);
        if (topPlayer) {
            return topPlayer;
        }

        return players[0];
    };

    const getH2HByOpponent = (playerId: string, opponentId: string): HeadToHead | null => {
        const playerData = getPlayerById(playerId);
        const headToHeadData = playerData?.head2head;
        if (headToHeadData) {
            return headToHeadData[opponentId];
        }
        return null;
    };

    return (
        <PlayersContext.Provider
            value={{
                players,
                loading,
                getPlayerById,
                getTopPlayer,
                getH2HByOpponent,
            }}
        >
            {children}
        </PlayersContext.Provider>
    );
};

export const usePlayers = () => {
    const context = useContext(PlayersContext);
    if (!context) {
        throw new Error('usePlayers must be used within a PlayersProvider');
    }
    return context;
};
