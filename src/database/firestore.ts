import { getFirestore, addDoc, collection, getDocs } from "firebase/firestore";
import { Player, BasePlayer } from "../Types/dataTypes";
import { app } from '../Security/firebase';

export const firestore = getFirestore(app);

export const addPlayer = async (playerInfo: BasePlayer): Promise<void> => {
  const { firstName, lastName, email, elo, wins, losses } = playerInfo;
  try {
    const playersRef = collection(firestore, "Players");

    await addDoc(playersRef, {
      firstName,
      lastName,
      email,
      elo,
      wins, 
      losses
    });
  } catch (error) {
    console.error("Error adding player: ", error);
  }
};

export const getPlayers = async (): Promise<Array<Player> | null> => {
  try {
    const playersRef = collection(firestore, "Players");
    const playersList: Array<Player> = [];

    const querySnapshot = await getDocs(playersRef);
    querySnapshot.forEach((doc) => {
      const playerData = doc.data() as BasePlayer; // Assuming your Player type matches the structure in your Firestore documents
      const player: Player = {
        id: doc.id,
        ...playerData,
      };
      playersList.push(player);
    });


    return playersList;
  } catch (error) {
    console.error("Error adding player: ", error);
  } 

  return null;

}