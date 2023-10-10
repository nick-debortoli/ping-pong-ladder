export interface BasePlayer {
    firstName: string;
    lastName: string;
    email: string;
    elo: number;
    wins: number;
    losses: number;
}

export interface Player extends BasePlayer {
    id: string;
}

export interface Standing extends Omit<Player, "email"> {
    rank: number;
}

export interface Result {
    playerA: Player | '';
    playerB: Player | '';
    playerAScore: number;
    playerBScore: number;
    winner: Player | '';
}