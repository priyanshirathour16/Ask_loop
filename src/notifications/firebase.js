import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDNYQxKlbTSON8GquGY8cCDiByXabFCZ5M",
  authDomain: "looppanel-454d7.firebaseapp.com",
  projectId: "looppanel-454d7",
  storageBucket: "looppanel-454d7.firebasestorage.app",
  messagingSenderId: "207161971448",
  appId: "1:207161971448:web:286669b7e718b7d3e9610d",
  measurementId: "G-R6VYF5E0Q2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(function(error) {
      console.error('Service Worker registration failed:', error);
    });
}



export const generateToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BC3B6_X03H_wgXOz14riIIaW2FDlHr2_LsIVFj_wLhlDtIK4MS53uxlEfJIgQeZvreY8-TsgAhZfpL9YPS5jLn4"
      });
      console.log("Token received:", token);
      return token;
    } else {
      console.error("Notification permission denied");
    }
  } catch (error) {
    console.error("An error occurred while retrieving token:", error);
  }
};
