# 🌐 Online Multiplayer Guide
## George and Frankie's Team Wheel Game

### 🎮 What's New: Real-Time Online Multiplayer!

Your NBA Team Wheel game now supports **real-time online multiplayer**! Friends can join from different devices and play together in real-time.

## 🚀 Quick Test (Demo Mode)

**For immediate testing without Firebase setup:**

1. Open the game in your browser
2. Select "Multiplayer" → "Online Multiplayer"
3. The game will run in **demo mode** (simulated multiplayer)
4. You can test the full flow and UI

## 🔥 Full Setup (Real Firebase Multiplayer)

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Name it "nba-team-wheel"
4. **Disable Google Analytics** (not needed)
5. Click "Create project"

### Step 2: Enable Realtime Database
1. In Firebase console, click "Realtime Database" in left menu
2. Click "Create Database"
3. Choose **"Start in test mode"**
4. Select location (e.g., us-central1)
5. Click "Done"

### Step 3: Get Your Configuration
1. Click the gear icon → "Project settings"
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. App nickname: "Team Wheel"
5. **Don't check** "Set up Firebase Hosting"
6. Click "Register app"
7. **Copy the `firebaseConfig` object**

### Step 4: Configure Your App
1. Open `firebase-setup.js` in your project
2. Replace the placeholder config with your real config:
```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:your-app-id"
};
```
3. Rename `firebase-setup.js` to `firebase-config.js`
4. Add to `index.html` after Firebase SDK:
```html
<script src="firebase-config.js"></script>
```

## 🎯 How Online Multiplayer Works

### For George (Host):
1. 📱 Open game on iPad
2. 🎮 Click "Multiplayer" → "Online Multiplayer"
3. ⚙️ Set game settings (players: 2-4, rounds: 1-10)
4. 🔗 **Copy the game link automatically generated**
5. 📤 Send link to friends via text/email
6. 👥 Wait for friends to join (see them appear in real-time)
7. 🚀 Click "Start Game" when everyone's joined
8. 🎯 Take turns spinning - system tracks whose turn it is
9. 📊 See live scores and rosters as game progresses
10. 🏆 View final results and play again!

### For Friends (Players):
1. 🔗 Click the link George sent
2. 📝 Enter your name
3. ⏳ Wait in lobby for George to start
4. 🎮 Take turns spinning when it's your turn
5. 👀 Watch other players' turns in real-time
6. 🏆 See final results together

## 🎮 Game Features

### ✅ Real-Time Features:
- **Live player joining/leaving**
- **Turn-based gameplay** with automatic rotation
- **Real-time score updates**
- **Live roster building** - see everyone's teams
- **Instant result sharing**
- **Synchronized game state** across all devices

### ✅ Game Flow:
1. **Random starting player** each round
2. **Position-based roster building** (PG, SG, SF, PF, C, 2 UTIL, Coach)
3. **NBA2K ratings-based scoring** for each team selection
4. **Round-by-round results** with individual and total scores
5. **Grand champion** determined by total score across all rounds

### ✅ Smart Features:
- **Automatic reconnection** if someone loses connection
- **Turn timeouts** to keep game moving
- **Host controls** for game management
- **Mobile-friendly** UI works on all devices

## 🧪 Testing Guide

### Local Testing:
```bash
# Start local server
python3 -m http.server 8080
# Open: http://localhost:8080
```

### Demo Mode Testing:
1. Click "Online Multiplayer"
2. System will show: "Running in demo mode"
3. Full UI works, but no real-time sync
4. Perfect for testing flow and interface

### Real Multiplayer Testing:
1. Deploy to Vercel with Firebase config
2. Open on multiple devices
3. Create game on one device
4. Join from other devices using the link
5. Test full gameplay flow

## 📱 Device Compatibility

### ✅ Supported:
- **iOS Safari** (iPad, iPhone)
- **Android Chrome** (phones, tablets)
- **Desktop Chrome, Firefox, Safari**
- **Any device with modern browser**

### ✅ Network Requirements:
- **Internet connection** for real-time sync
- **No special ports** - works with any WiFi/cellular
- **Automatic reconnection** handles temporary disconnects

## 🔧 Troubleshooting

### Firebase Issues:
```
Error: Firebase not initialized
→ Check firebase-config.js is included
→ Verify your Firebase config is correct
→ Ensure Realtime Database is enabled
```

### Connection Issues:
```
Players can't join
→ Check if game link was copied correctly
→ Verify all players have internet connection
→ Try refreshing and creating new game
```

### Game State Issues:
```
Turn indicator stuck
→ Refresh page to rejoin game
→ Host can restart if needed
→ Check browser console for errors
```

## 📊 Technical Architecture

### Real-Time Database Structure:
```
games/
  ├── GAME123/
  │   ├── players/
  │   │   ├── player1: {name, roster, scores}
  │   │   └── player2: {name, roster, scores}
  │   ├── settings: {sport, rounds, players}
  │   ├── gameState: "playing"
  │   ├── currentRound: 1
  │   └── currentPlayerIndex: 0
```

### File Organization:
```
js/
├── core/           # Main game logic
├── multiplayer/    # Online multiplayer system
├── features/       # Effects, sounds, battles
└── utils/          # Data loading, database
```

## 🎯 Ready to Test!

Your online multiplayer system is ready! Start with demo mode to test the interface, then set up Firebase for real multiplayer magic.

**Demo Mode**: Works immediately for UI testing
**Real Mode**: Requires 5-minute Firebase setup for true multiplayer

Let's get George and his friends playing online! 🏀🎮 