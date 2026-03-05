import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAnalytics, logEvent } from "firebase/analytics";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export const requestForToken = async () => {
    if (!messaging) return null;

    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            const currentToken = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
            });
            if (currentToken) {
                console.log("FCM Token:", currentToken);
                return currentToken;
            }
        }
    } catch (err) {
        console.log("An error occurred while retrieving token.", err);
    }
    return null;
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) return;
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });

export const trackEvent = (eventName, params) => {
    if (analytics) {
        logEvent(analytics, eventName, params);
    }
};

export default app;
