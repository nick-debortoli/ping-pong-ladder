import { FormData } from '../Types/dataTypes';

export const standardizeToUSA = (input: string): string => {
    const usaSynonyms = [
        'United States',
        'United States of America',
        'US',
        'U.S.',
        'U.S.A.',
        'USA',
        'America',
    ];

    const normalizedInput = input.trim().toLowerCase();
    const normalizedUSA = usaSynonyms.map((name) => name.toLowerCase());

    if (normalizedUSA.includes(normalizedInput)) {
        return 'USA';
    } else {
        return input;
    }
};

export const trimFormInput = (player: FormData): FormData => {
    return {
        ...player,
        firstName: player.firstName.trim(),
        lastName: player.lastName.trim(),
        email: player.email.trim(),
        country: player.country.trim(),
    };
};
