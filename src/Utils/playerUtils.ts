import { NewPlayer } from '../Types/dataTypes';

export const getHeadshot = async (player: NewPlayer): Promise<string | null> => {
    const playerFilename = `/assets/headshots/${player.bio.lastName}${player.bio.firstName}.png`;

    try {
        const response = await fetch(playerFilename);

        if (response.status === 200) {
            return playerFilename;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
};

export const getFlag = async (player: NewPlayer): Promise<string | null> => {
    const flagFilename = `/assets/flags/${player.bio.country.toLowerCase()}.png`;

    try {
        const response = await fetch(flagFilename);

        if (response.status === 200) {
            return flagFilename;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
};

export const calculateWinPercentage = (player: NewPlayer, allTime: boolean = false): number => {
    if (allTime) {
        const totalMatches = player.lifetimeWins + player.lifetimeLosses;

        if (totalMatches === 0) {
            return 0;
        }
        return Math.round((player.lifetimeWins / totalMatches) * 100);
    }
    const totalMatches = player.seasonStats.wins + player.seasonStats.losses;

    if (totalMatches === 0) {
        return 0;
    }
    return Math.round((player.seasonStats.wins / totalMatches) * 100);
};

export const isAdmin = (uid: string | undefined): boolean => {
    if (!uid) {
        return false;
    }

    if (import.meta.env.VITE_ENVIRONMENT === 'prod') {
        return uid === import.meta.env.VITE_ADMIN_UID_PROD;
    } else {
        return uid === import.meta.env.VITE_ADMIN_UID;
    }
};
