export interface PlayerStats {
  overallRanking: number;
  divisionRanking: number;
  winningPercentage: number;
  avgPoints: number;
}
export interface PlayerHistory extends Omit<PlayerStats, "avgPoints"> {
  date: string;
  elo: number;
}

export interface BasePlayer {
  firstName: string;
  lastName: string;
  email: string;
  elo: number;
  wins: number;
  losses: number;
  office: string;
  history: PlayerHistory[];
}

export interface Player extends BasePlayer {
  id: string;
}

export interface Standing extends Omit<Player, "email" | "office" | "history"> {
  rank: number;
}

export enum Office {
  PGH = "PGH",
  DC = "DC",
  InterOffice = "Inter-Office",
}

export interface Result {
  playerA: Player | "";
  playerB: Player | "";
  playerAScore: number;
  playerBScore: number;
  office: Office;
}

export interface MatchInfo {
  winnerScore: number;
  loserScore: number;
  winnerId: string;
  loserId: string;
  office: Office;
  date: string;
}
