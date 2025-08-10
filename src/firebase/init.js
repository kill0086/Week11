import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyC-YFfX8YD-z_ryJ0GahrwGTLWoMbjxLwA",
    authDomain: "week7-keqing.firebaseapp.com",
    projectId: "week7-keqing",
    storageBucket: "week7-keqing.appspot.com",
    messagingSenderId: "43564186429",
    appId: "1:43564186429:web:d2457efa8f28876127e354"
};

initializeApp(firebaseConfig);
const db = getFirestore();
export default db
