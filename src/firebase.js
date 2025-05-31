import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBMUxbWLboE6oyGMUpEwuZ8ptHd1Nl75W0",
    authDomain: "runelegacy-e08d5.firebaseapp.com",
    projectId: "runelegacy-e08d5",
    storageBucket: "runelegacy-e08d5.firebasestorage.app",
    messagingSenderId: "1096684448137",
    appId: "1:1096684448137:web:c31fb4f4141353229d9958",
    measurementId: "G-GNJM6LKH01"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
