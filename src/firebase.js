import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCUunBTamJam4ZA8OPeurzmLI6aKkCE7lM",
  authDomain: "softball-app-741dc.firebaseapp.com",
  databaseURL: "https://softball-app-741dc-default-rtdb.firebaseio.com",
  projectId: "softball-app-741dc",
  storageBucket: "softball-app-741dc.firebasestorage.app",
  messagingSenderId: "880197828587",
  appId: "1:880197828587:web:d2f65caf0c9781d344a3ae",
  measurementId: "G-PLGVW2465X"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
