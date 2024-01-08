interface HeadToHead {
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
}

type BestFinish = {
    round: string;
    year: number;
};

interface TournamentStats {
    bestFinish: BestFinish;
    wins: number;
    losses: number;
}

export interface NewPlayer extends PlayerStats {
    seasonStats: PlayerStats;
    overallRanking: number;
    divisionRanking: number;
    bio: PlayerBio;
    head2head: Record<string, HeadToHead>[];
    tournamentStats: Record<TournamentNames, TournamentStats>;
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

export interface BracketMatch {
    player1: { seed: number; player: Player } | null;
    player2: { seed: number; player: Player } | null;
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

enum TournamentNames {
    ArkOpen = 'Ark Open',
    DCOpen = 'DC Open',
    Govimbledon = 'Govimbledon',
    PghOpen = 'PGH Open',
}

export interface Tournament {
    name: TournamentNames;
    isActive: boolean;
    seedsLock: string;
    startDate: string;
    endDate: string;
    topSeedPercentage: number;
    seeds: { [Office.DC]: string[]; [Office.PGH]: string[] };
    results: MatchInfo[];
}
