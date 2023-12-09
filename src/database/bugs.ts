import { addDoc, collection } from '@firebase/firestore';
import { BugSubmission } from '../Types/dataTypes';
import { firestore } from './firestore';

export const addBug = async (bugInfo: BugSubmission): Promise<void> => {
    try {
        const bugsRef = collection(firestore, 'Bugs');
        await addDoc(bugsRef, bugInfo);
    } catch (error) {
        console.error('Error adding bug: ', error);
    }
};
