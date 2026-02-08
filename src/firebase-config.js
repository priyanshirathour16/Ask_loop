// src/firebase-config.js

import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDNYQxKlbTSON8GquGY8cCDiByXabFCZ5M",
  authDomain: "looppanel-454d7.firebaseapp.com",
  projectId: "looppanel-454d7",
  storageBucket: "looppanel-454d7.firebasestorage.app",
  messagingSenderId: "207161971448",
  appId: "1:207161971448:web:286669b7e718b7d3e9610d",
  measurementId: "G-R6VYF5E0Q2",
};



const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

