
import { getDatabase } from "firebase/database";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

// Exact configuration provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyA7fc83bFLNVhqnqlNsfwPKzz1hZjbaZKs",
  authDomain: "werewolf-2c523.firebaseapp.com",
  databaseURL: "https://werewolf-2c523-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "werewolf-2c523",
  storageBucket: "werewolf-2c523.firebasestorage.app",
  messagingSenderId: "248951225754",
  appId: "1:248951225754:web:fd44fdda55d52e41334e23",
  measurementId: "G-10QKF3VFDY"
};

// Fix: Initialize the app via the Compat SDK.
// This sets up the global '[DEFAULT]' app instance required for firebase.auth() to work.
const app = firebase.initializeApp(firebaseConfig);

// Export the Modular Database instance
// We pass the compat app instance which is compatible at runtime
export const db = getDatabase(app as any);

// Export the Compat Auth instance
export const auth = firebase.auth();
