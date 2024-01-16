import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { HeadToHead, Player } from '../Types/dataTypes';
import { firestore } from '../database/firestore';
import { onSnapshot, collection } from 'firebase/firestore';
import { getPlayers } from '../database/players';

interface PlayersContextProps {
    players: Array<Player>;
    loading: boolean;
    getPlayerById: (id: string) => Player | null;
    getTopPlayer: () => Player;
    getH2HByOpponent: (playerId: string, opponentId: string) => HeadToHead | null;
}

const PlayersContext = createContext<PlayersContextProps | undefined>(undefined);

interface PlayerProviderProps {
    children: ReactNode;
}

export const PlayersProvider: React.FC<PlayerProviderProps> = ({ children }) => {
    const [players, setPlayers] = useState<Array<Player>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayers = async () => {
            const playersRef = collection(firestore, 'Players');

            const unsubscribe = onSnapshot(
                playersRef,
                (snapshot) => {
                    const playersData: Array<Player> = snapshot.docs.map((doc) => {
                        const playerData = doc.data() as Omit<Player, 'id'>;
                        return {
                            id: doc.id,
                            ...playerData,
                        };
                    });

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

    const getPlayerById = (id: string): Player | null => {
        const playerById = players.find((player) => player.id === id);
        if (playerById) {
            return playerById;
        }
        return null;
    };

    const getTopPlayer = (): Player => {
        const topPlayer = players.find((player) => player.overallRanking === 1);
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
                getH2HByOpponent
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
