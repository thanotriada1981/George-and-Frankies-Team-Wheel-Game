# 🔥 Firebase Setup - Quick Guide

## 1. Create Firebase Project (2 minutes)
1. Go to: https://console.firebase.google.com
2. Click: "Create a project"
3. Name: "nba-team-wheel"
4. **Disable Google Analytics** (not needed)
5. Click: "Create project"

## 2. Enable Realtime Database (1 minute)
1. In left menu: "Realtime Database"
2. Click: "Create Database"
3. Choose: **"Start in test mode"**
4. Location: "us-central1" (or closest to you)
5. Click: "Done"

## 3. Get Your Config (1 minute)
1. Click gear icon → "Project settings"
2. Scroll to "Your apps" section
3. Click web icon `</>`
4. App nickname: "Team Wheel"
5. **Check "Also set up Firebase Hosting"**
6. Click "Register app"
7. **COPY** the config object

## 4. Update Your Code (1 minute)
1. Open `firebase-setup.js`
2. Replace the fake config with your real config
3. Rename file to `firebase-config.js`
4. Commit and push to deploy

## 🚀 Ready to Test!
- Open your Vercel URL
- Click "Online Multiplayer"
- Share the game link with friends
- Play together in real-time!

---

**Your Vercel URL:** https://nba-team-wheel-9rezt7dx5-thano-triadafilopoulos-projects.vercel.app 