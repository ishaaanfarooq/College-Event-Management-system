const admin = require("firebase-admin");
const path = require("path");

// Firebase Admin SDK initialization
// The user needs to provide 'firebase-service-account.json' in the server folder
const serviceAccountPath = path.join(__dirname, "../firebase-service-account.json");

try {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
    console.log("Firebase Admin SDK initialized successfully");
} catch (error) {
    console.error("Firebase Admin SDK initialization failed:", error.message);
    console.log("Push notifications will not be sent until 'firebase-service-account.json' is provided.");
}

const sendPushNotification = async (token, title, body, data = {}) => {
    if (!token) return;

    const message = {
        notification: { title, body },
        token: token,
        data: data
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("Successfully sent message:", response);
        return response;
    } catch (error) {
        console.error("Error sending message:", error);
    }
};

module.exports = { sendPushNotification };
