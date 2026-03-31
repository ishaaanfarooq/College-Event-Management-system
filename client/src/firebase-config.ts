import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAnalytics, logEvent } from "firebase/analytics";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "your_api_key";
const app = isConfigured ? initializeApp(firebaseConfig) : null;
const messaging = typeof window !== "undefined" && app ? getMessaging(app) : null;
const analytics = typeof window !== "undefined" && app ? getAnalytics(app) : null;

export const requestForToken = async () => {
    if (!messaging) return null;

    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            const currentToken = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
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
