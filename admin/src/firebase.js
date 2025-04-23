import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"


const firebaseConfig = {
  apiKey: "AIzaSyDaF5OHf-A4uWpNNuE9Jy7K-ipyFkkPTOI",
  authDomain: "electronic-stores.firebaseapp.com",
  databaseURL: "https://electronic-stores-default-rtdb.firebaseio.com",
  projectId: "electronic-stores",
  storageBucket: "electronic-stores.firebasestorage.app",
  messagingSenderId: "1054071262992",
  appId: "1:1054071262992:web:11bf641ae6632594615f95",
  measurementId: "G-868VZKHSD8"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { app, db, auth, storage }
