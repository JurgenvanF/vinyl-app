"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmBAiDw2nWxOH3FdwyW_0r_e62Nf_ksEY",
  authDomain: "vinyl-app-4c743.firebaseapp.com",
  projectId: "vinyl-app-4c743",
  storageBucket: "vinyl-app-4c743.firebasestorage.app",
  messagingSenderId: "725412718133",
  appId: "1:725412718133:web:82e7a1a1431dbec6ba737c",
  measurementId: "G-0W3531RB2Q",
};

// initialize Firebase app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// initialize Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);
