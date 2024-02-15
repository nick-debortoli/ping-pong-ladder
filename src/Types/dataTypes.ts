export interface HeadToHead {
    losses: number;
    wins: number;
    pointsFor: number;
    pointsAgainst: number;
    recentMatchIds: string[];
}

interface PlayerBio {
    firstName: string;
    lastName: string;
    country: string;
    playStyle: 'RH' | 'LH';
    turnedPro: number;
    office: string;
    email: string;
}

interface PlayerStats {
    elo: number;
    wins: number;
    losses: number;
    divisionRanking: number;
    overallRanking: number;
}

export type BestFinish = {
    round: string;
    years: number[];
};

export interface TournamentStats {
    bestFinish: BestFinish | null;
    wins: number;
    losses: number;
}

export interface Accolades {
    tournamentStats: Record<TournamentNames, TournamentStats>;
    overallTitles: number;
    divisionTitles: number;
    bestOverallFinish: number | null;
    bestDivisionalFinish: number | null;
}

export interface NewBasePlayer {
    seasonStats: PlayerStats;
    bio: PlayerBio;
    head2head?: Record<string, HeadToHead>;
    accolades: Accolades;
    lifetimeWins: number;
    lifetimeLosses: number;
    lifetimeElo: number;
}

export interface NewPlayer extends NewBasePlayer {
    id: string;
}

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
    head2head?: Record<string, HeadToHead>;
}

export interface Player extends BasePlayer {
    id: string;
}

export interface Standing {
    id: string;
    firstName: string;
    lastName: string;
    wins: number;
    losses: number;
    elo: number;
    rank: number;
    winningPercentage: number;
}

export interface FormData
    extends Omit<
        Player,
        'elo' | 'wins' | 'losses' | 'overallRanking' | 'divisionRanking' | 'id' | 'turnedPro'
    > {}

export enum Office {
    PGH = 'PGH',
    DC = 'DC',
    InterOffice = 'Inter-Office',
}

export interface Result {
    playerA: NewPlayer | '' | null;
    playerB: NewPlayer | '' | null;
    playerAScore: number;
    playerBScore: number;
    office: Office;
    event?: TournamentNames | '';
}

export interface MatchInfo {
    winnerScore: number;
    loserScore: number;
    winnerId: string;
    loserId: string;
    office: Office;
    date: string;
    event?: TournamentNames;
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

export interface Season {
    seasonStartDate: string;
    seasonEndDate: string;
}

export enum TournamentNames {
    ArkOpen = 'Ark Open',
    DCOpen = 'DC Open',
    Govimbledon = 'Govimbledon',
    PghOpen = 'PGH Open',
}

export const TournamentNameToImage = {
    [TournamentNames.ArkOpen]: 'arkOpen',
    [TournamentNames.DCOpen]: 'dcOpen',
    [TournamentNames.Govimbledon]: 'govimbledon',
    [TournamentNames.PghOpen]: 'pghOpen',
};

export type BracketPlayer = {
    seed: number | null;
    playerId: string;
};

export interface BracketMatch {
    matchId: number | null;
    player1: BracketPlayer | 'Bye' | null;
    player2: BracketPlayer | 'Bye' | null;
    scores1?: number[];
    scores2?: number[];
    winner?: string | null;
}

export type Round = {
    [round: string]: BracketMatch[];
};

export interface Tournament {
    name: TournamentNames;
    isActive: boolean;
    seedsLock: string;
    startDate: string;
    endDate: string;
    topSeedPercentage: number;
    seeds: { [Office.DC]: string[]; [Office.PGH]: string[] };
    rounds: { [Office.DC]: Round; [Office.PGH]: Round };
}

export type TournamentHistory = Record<number, Tournament[]>;
