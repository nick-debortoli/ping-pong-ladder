import {
  getFirestore,
  addDoc,
  collection,
  getDocs,
  doc,
  updateDoc,
  increment,
  query,
  orderBy,
  limit,
  where,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import {
  Player,
  BasePlayer,
  MatchInfo,
  Result,
  Office,
} from "../Types/dataTypes";
import { app } from "../Security/firebase";

export const firestore = getFirestore(app);

export const addPlayer = async (playerInfo: BasePlayer): Promise<void> => {
  const { firstName, lastName, email, elo, wins, losses, office } = playerInfo;
  try {
    const playersRef = collection(firestore, "Players");

    await addDoc(playersRef, {
      firstName,
      lastName,
      email,
      elo,
      wins,
      losses,
      office,
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
};

const calculateOverallRanking = async (playerId: string): Promise<number> => {
  const playersRef = collection(firestore, "Players");
  const querySnapshot = await getDocs(query(playersRef));

  const players = querySnapshot.docs.map((doc) => doc.data() as Player);
  players.sort((a, b) => b.elo - a.elo);

  return players.findIndex((p) => p.id === playerId) + 1;
};

const calculateDivisionRankings = async (playerId: string): Promise<number> => {
  const playerRef = doc(firestore, "Players", playerId);
  const playerDoc = await getDoc(playerRef);
  const playerData = playerDoc.data() as Player;

  const playersRef = collection(firestore, "Players");
  const q = query(playersRef, where("office", "==", playerData.office));
  const querySnapshot = await getDocs(q);

  const players = querySnapshot.docs.map((doc) => doc.data() as Player);
  players.sort((a, b) => b.elo - a.elo);

  return players.findIndex((p) => p.id === playerId) + 1;
};

const calculateElo = async (playerId: string): Promise<number> => {
  const playerRef = doc(firestore, "Players", playerId);
  const playerDoc = await getDoc(playerRef);
  const playerData = playerDoc.data() as Player;
  return playerData.elo;
};

const calculateWinPercentage = async (playerId: string): Promise<number> => {
  const playerRef = doc(firestore, "Players", playerId);
  const playerDoc = await getDoc(playerRef);
  const playerData = playerDoc.data() as Player;

  const totalMatches = playerData.wins + playerData.losses;
  return totalMatches > 0 ? (playerData.wins / totalMatches) * 100 : 0;
};

const updatePlayerHistory = async (winnerId, loserId): Promise<void> => {
  [winnerId, loserId].forEach(async (playerId) => {
    const newElo = calculateElo(playerId);
    const newDivisionalRanking = calculateDivisionRankings(playerId);
    const newOverallRanking = calculateOverallRanking(playerId);
    const newWinPercentage = calculateWinPercentage(playerId);
    const playerRef = doc(firestore, "Players", playerId);
    const newHistoryEntry = {
      date: new Date().toISOString(),
      elo: newElo,
      winPercentage: newWinPercentage,
      divisionRanking: newDivisionalRanking,
      overallRanking: newOverallRanking,
    };
    await updateDoc(playerRef, {
      history: arrayUnion(newHistoryEntry),
    });
  });
};

const updatePlayerWinsAndLosses = async (
  winnerId: string,
  loserId: string
): Promise<void> => {
  const winnerRef = doc(firestore, "Players", winnerId);
  const loserRef = doc(firestore, "Players", loserId);
  await Promise.all([
    updateDoc(winnerRef, { wins: increment(1) }),
    updateDoc(loserRef, { losses: increment(1) }),
  ]);
};

const addMatchToFirestore = async (
  office: Office,
  winnerId: string,
  loserId: string,
  winnerScore: number,
  loserScore: number
): Promise<void> => {
  const matchesRef = collection(firestore, "Matches");
  await addDoc(matchesRef, {
    winnerScore,
    loserScore,
    winnerId,
    loserId,
    date: new Date().toISOString(),
    office,
  });
};

export const addMatch = async (matchInfo: Result): Promise<void> => {
  const { playerA, playerB, playerAScore, playerBScore, office } = matchInfo;

  if (
    typeof playerA !== "object" ||
    !playerA.id ||
    typeof playerB !== "object" ||
    !playerB.id
  ) {
    throw new Error("Invalid player data");
  }

  let winnerId, loserId, winnerScore, loserScore;

  if (playerAScore > playerBScore) {
    winnerId = playerA.id;
    loserId = playerB.id;
    winnerScore = playerAScore;
    loserScore = playerBScore;
  } else {
    winnerId = playerB.id;
    loserId = playerA.id;
    winnerScore = playerBScore;
    loserScore = playerAScore;
  }

  try {
    await addMatchToFirestore(
      office,
      winnerId,
      loserId,
      winnerScore,
      loserScore
    );
    await updatePlayerWinsAndLosses(winnerId, loserId);
    await updatePlayerHistory(winnerId, loserId);
  } catch (error) {
    console.error("Error adding match: ", error);
  }
};

export const getRecentMatches = async (): Promise<Array<MatchInfo> | null> => {
  try {
    const matchesRef = collection(firestore, "Matches");
    const matchesQuery = query(matchesRef, orderBy("date", "desc"), limit(5));
    const querySnapshot = await getDocs(matchesQuery);

    const matchesList: Array<MatchInfo> = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as MatchInfo),
    }));

    return matchesList;
  } catch (error) {
    console.error("Error fetching matches: ", error);
    return null;
  }
};
