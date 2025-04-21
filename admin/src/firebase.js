import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"


const firebaseConfig = {
    apiKey: "AIzaSyAVNpOcZtMQrAwlh7oo2SIHLN0MvqklvpQ",
    authDomain: "sivaraj-stores.firebaseapp.com",
    databaseURL: "https://sivaraj-stores-default-rtdb.firebaseio.com",
    projectId: "sivaraj-stores",
    storageBucket: "sivaraj-stores.appspot.com",
    messagingSenderId: "215727300380",
    appId: "1:215727300380:web:b4d9c3a2d4a2b8432ba4d9",
    measurementId: "G-EVYKXZHKN5"
  };


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { app, db, auth, storage }
