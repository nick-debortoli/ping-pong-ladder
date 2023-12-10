import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    UserCredential,
} from 'firebase/auth';

const firebaseProdConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY_PROD,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN_PROD,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID_PROD,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET_PROD,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID_PROD,
    appId: import.meta.env.VITE_FIREBASE_APP_ID_PROD,
};

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let config = firebaseConfig;

if (import.meta.env.VITE_ENVIRONMENT === 'prod') {
    config = firebaseProdConfig;
}

// -- Initialize user auth
export const app = initializeApp(config);
export const auth = getAuth(app);

export const signUp = async (email: string, password: string): Promise<void> => {
    try {
        await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) {
        alert(e);
    }
};

export const signIn = async (email: string, password: string): Promise<UserCredential | null> => {
    try {
        const credentials = await signInWithEmailAndPassword(auth, email, password);
        return credentials;
    } catch (e) {
        console.error(e);
        alert('Incorrect email.');
        return null;
    }
};

export function firebaseSignOut() {
    signOut(auth);
}

export function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
}
