export interface BasePlayer {
  firstName: string;
  lastName: string;
  email: string;
  elo: number;
  wins: number;
  losses: number;
  office: string;
}

export interface Player extends BasePlayer {
  id: string;
}

export interface Standing extends Omit<Player, "email"> {
  rank: number;
}

export enum Office {
  InterOffice = "Inter-Office",
  PGH = "PGH",
  DC = "DC",
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
  loserBScore: number;
  winnerId: string;
  loserId: string;
  office: Office;
}
