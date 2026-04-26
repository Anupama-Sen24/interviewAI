import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";



const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
    authDomain: "interviewai-28530.firebaseapp.com",
    projectId: "interviewai-28530",
    storageBucket: "interviewai-28530.firebasestorage.app",
    messagingSenderId: "774652458497",
    appId: "1:774652458497:web:765f4ec6e3a623c95c7200"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider }