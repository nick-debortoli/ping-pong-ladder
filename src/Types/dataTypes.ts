export interface BasePlayer {
    firstName: string;
    lastName: string;
    email: string;
    elo: number;
    wins: number;
    losses: number;
    office: string;
    overallRanking: number;
    divisionRanking: number;
    country: string;
    playStyle: 'RH' | 'LH';
    turnedPro: number;
}

export interface Player extends BasePlayer {
    id: string;
}

export interface Standing
    extends Omit<
        Player,
        | 'email'
        | 'office'
        | 'overallRanking'
        | 'divisionRanking'
        | 'country'
        | 'playStyle'
        | 'turnedPro'
    > {
    rank: number;
}

export enum Office {
    PGH = 'PGH',
    DC = 'DC',
    InterOffice = 'Inter-Office',
}

export interface Result {
    playerA: Player | '';
    playerB: Player | '';
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

export interface BugSubmission {
    type: string;
    name: string;
    email: string;
    description: string;
}

export enum PlayerTabs {
    BIOS = 'bios',
    H2H = 'h2h',
}
