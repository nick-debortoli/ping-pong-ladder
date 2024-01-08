import { Player } from '../Types/dataTypes';

export const getHeadshot = async (player: Player): Promise<string | null> => {
    const playerFilename = `/assets/headshots/${player.lastName}${player.firstName}.png`;

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

export const getFlag = async (player: Player): Promise<string | null> => {
    const flagFilename = `/assets/flags/${player.country.toLowerCase()}.png`;

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

export const calculateWinPercentage = (player: Player): number => {
    const totalMatches = player.wins + player.losses;
    if (totalMatches === 0) {
        return 0;
    }
    return Math.round((player.wins / totalMatches) * 100);
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
