import { getFirestore, addDoc, collection, getDocs } from "firebase/firestore";
import { Player } from "../Types/dataTypes";
import { app } from '../Security/firebase';

export const firestore = getFirestore(app);

export const addPlayer = async (playerInfo: Player): Promise<void> => {
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

export const getPlayers = async (): Promise<Player[] | null> => {
  try {
    const playersRef = collection(firestore, "Players");
    const playersList: Player[] = [];

    const querySnapshot = await getDocs(playersRef);
    querySnapshot.forEach((doc) => {
      playersList.push(doc.data() as Player)
    });

    return playersList;
  } catch (error) {
    console.error("Error adding player: ", error);
  } 

  return null;

}