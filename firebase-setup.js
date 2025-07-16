/**
 * Firebase Configuration for Online Multiplayer
 * 
 * To enable online multiplayer:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project called "nba-team-wheel"
 * 3. Enable Realtime Database
 * 4. Replace the config below with your actual Firebase config
 * 5. Rename this file to firebase-config.js and include it in index.html
 */

// REPLACE THIS WITH YOUR ACTUAL FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "nba-team-wheel.firebaseapp.com",
    databaseURL: "https://nba-team-wheel-default-rtdb.firebaseio.com/",
    projectId: "nba-team-wheel",
    storageBucket: "nba-team-wheel.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:your-app-id-here"
};

// Initialize Firebase when this script loads
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    console.log('🔥 Firebase initialized with real config');
} else {
    console.warn('🔥 Firebase SDK not loaded. Make sure Firebase scripts are included in HTML.');
}

/**
 * SETUP INSTRUCTIONS:
 * 
 * Step 1: Create Firebase Project
 * - Go to https://console.firebase.google.com
 * - Click "Create a project"
 * - Name it "nba-team-wheel" or your preferred name
 * - Follow the setup wizard
 * 
 * Step 2: Enable Realtime Database
 * - In your Firebase console, go to "Realtime Database"
 * - Click "Create Database"
 * - Choose "Start in test mode" for now
 * - Select a location close to your users
 * 
 * Step 3: Get Your Config
 * - Go to Project Settings (gear icon)
 * - Scroll down to "Your apps"
 * - Click "Web" icon to add a web app
 * - Register your app with nickname "Team Wheel"
 * - Copy the firebaseConfig object
 * 
 * Step 4: Update This File
 * - Replace the firebaseConfig above with your real config
 * - Rename this file to firebase-config.js
 * - Include it in your index.html:
 *   <script src="firebase-config.js"></script>
 * 
 * Step 5: Deploy and Test
 * - Deploy to Vercel
 * - Test online multiplayer with friends!
 * 
 * Note: The game will work in demo mode without Firebase,
 * but real-time multiplayer requires Firebase setup.
 */ 