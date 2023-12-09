export const isRecentMatch = (date: string): boolean => {
    const matchTime = new Date(date);
    const now = new Date();

    const timeDifferenceMillis = Math.abs(matchTime.getTime() - now.getTime());
    const timeDifferenceMinutes = timeDifferenceMillis / (1000 * 60);

    return timeDifferenceMinutes <= 3;
};
