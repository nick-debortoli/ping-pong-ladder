import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { getPlayers } from "../database/firestore";
import { Player } from "../Types/dataTypes";
import { firestore } from "../database/firestore";
import { onSnapshot, collection } from "firebase/firestore";

interface PlayersContextProps {
  players: Array<Player>;
  loading: boolean;
}

const PlayersContext = createContext<PlayersContextProps | undefined>(
  undefined
);

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayersProvider: React.FC<PlayerProviderProps> = ({
  children,
}) => {
  const [players, setPlayers] = useState<Array<Player>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      const playersRef = collection(firestore, "Players");

      const unsubscribe = onSnapshot(
        playersRef,
        (snapshot) => {
          const playersData: Array<Player> = snapshot.docs.map((doc) => {
            const playerData = doc.data() as Omit<Player, "id">;
            return {
              id: doc.id,
              ...playerData,
            };
          });

          setPlayers(playersData);
          setLoading(false);
        },
        (error) => {
          console.error("Error listening to players collection: ", error);
          setLoading(false);
        }
      );

      try {
        const playersData = await getPlayers();
        if (playersData) {
          setPlayers(playersData);
        }
        setLoading(false);
      } catch (error) {
        // Handle error case
        console.error("Error fetching players: ", error);
        setLoading(false);
      }

      return () => unsubscribe();
    };

    fetchPlayers();

    // No need to clean up, as this effect runs once after the initial render
  }, []); // Empty dependency array ensures that this effect runs once after the initial render

  return (
    <PlayersContext.Provider value={{ players, loading }}>
      {children}
    </PlayersContext.Provider>
  );
};

export const usePlayers = () => {
  const context = useContext(PlayersContext);
  if (!context) {
    throw new Error("usePlayers must be used within a PlayersProvider");
  }
  return context;
};
