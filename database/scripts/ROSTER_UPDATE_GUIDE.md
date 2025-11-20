# 🏀 Complete Roster Update Guide - November 2025

## 📋 Overview
This guide will help you update all 30 NBA team rosters with current 2025-26 season data from 2kratings.com.

**Time Required:** ~1-2 hours for all 30 teams
**Last Updated:** November 2025

---

## 🚀 Quick Start Instructions

### Step 1: Prepare the Collection Script

1. Open the file: `database/scripts/nba-2k26-collection-script-enhanced.js`
2. Copy the ENTIRE contents of that file to your clipboard

### Step 2: Visit 2kratings.com Teams Page

1. Go to: **https://www.2kratings.com/current-teams**
2. You should see all 30 NBA teams listed

### Step 3: Collect Data for Each Team

**For EACH of the 30 teams, do the following:**

1. **Click on a team** (e.g., "Atlanta Hawks")
2. **Open Browser Console:**
   - Chrome/Edge: Press `F12` or `Ctrl+Shift+J` (Windows) / `Cmd+Option+J` (Mac)
   - Firefox: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
   - Safari: Enable Developer menu first, then `Cmd+Option+C`

3. **Paste the script** from Step 1 into the console

4. **Run the function:** Type `collectSimplified2K26Data()` and press Enter

5. **Copy the JSON output:**
   - The script will output formatted JSON data
   - Look for the section between the `==========================================` lines
   - Copy EVERYTHING between those lines

6. **Save the data:**
   - Create a new file: `database/collected-data-2025-nov/[team-name]-2k26-data.json`
   - Paste the JSON data
   - Save the file

7. **Repeat** for the next team

---

## 📝 All 30 Teams Checklist

Copy this checklist and mark teams as you complete them:

### Eastern Conference

**Atlantic Division:**
- [ ] Boston Celtics
- [ ] Brooklyn Nets
- [ ] New York Knicks
- [ ] Philadelphia 76ers
- [ ] Toronto Raptors

**Central Division:**
- [ ] Chicago Bulls
- [ ] Cleveland Cavaliers
- [ ] Detroit Pistons
- [ ] Indiana Pacers
- [ ] Milwaukee Bucks

**Southeast Division:**
- [ ] Atlanta Hawks
- [ ] Charlotte Hornets
- [ ] Miami Heat
- [ ] Orlando Magic
- [ ] Washington Wizards

### Western Conference

**Northwest Division:**
- [ ] Denver Nuggets
- [ ] Minnesota Timberwolves
- [ ] Oklahoma City Thunder
- [ ] Portland Trail Blazers
- [ ] Utah Jazz

**Pacific Division:**
- [ ] Golden State Warriors
- [ ] LA Clippers
- [ ] Los Angeles Lakers
- [ ] Phoenix Suns
- [ ] Sacramento Kings

**Southwest Division:**
- [ ] Dallas Mavericks
- [ ] Houston Rockets
- [ ] Memphis Grizzlies
- [ ] New Orleans Pelicans
- [ ] San Antonio Spurs

---

## 🔄 After Collecting All Team Data

Once you have all 30 team JSON files in `database/collected-data-2025-nov/`:

### Run the Merge Script

```bash
cd database/scripts
node merge-collected-rosters.js
```

This will:
1. Read all 30 team JSON files
2. Merge them into the main `database/nba/teams/nba_teams_data.json`
3. Preserve team colors, logos, and coach information
4. Create a backup of the old data
5. Generate a change report showing trades and rating updates

---

## 🎯 Tips for Faster Collection

1. **Keep the console script copied** - Don't re-copy for each team
2. **Use keyboard shortcuts:**
   - `Ctrl/Cmd + L` to clear console between teams
   - `Ctrl/Cmd + A` to select all JSON output
   - `Ctrl/Cmd + C` to copy

3. **Batch teams by division** - Helps keep track of progress

4. **Verify as you go:**
   - Check that player count looks reasonable (12-17 players per team)
   - Check that top players have correct ratings (e.g., Giannis ~98, LeBron ~94)

---

## ⚠️ Troubleshooting

### Issue: "No players found"
**Solution:** The page structure might be different. Try:
1. Scroll down to ensure all players are loaded
2. Check if you're on a team roster page (not team stats or schedule)
3. Look for a "Roster" or "Players" tab and click it first

### Issue: Script returns errors
**Solution:**
1. Make sure you're on the actual team page (URL should be `/teams/[team-name]`)
2. Wait for the page to fully load before running the script
3. Try refreshing the page and running again

### Issue: Player ratings seem wrong
**Solution:**
1. Check the page header - make sure it says "NBA 2K26" not 2K25 or older
2. Look for a dropdown to select "Current Rosters" vs "Launch Rosters"

---

## 📊 Expected Results

After collection, each team JSON should have:
- **Team name** (e.g., "Los Angeles Lakers")
- **12-17 players** (standard NBA roster size)
- **Player data** including:
  - Name
  - Jersey number
  - Position
  - Overall rating (50-99)
  - Detailed attributes (inside, outside, playmaking, athleticism, defending, rebounding)
  - Physical stats (height, weight)

---

## 🎉 Once Complete

After running the merge script, you'll have:
- ✅ Updated rosters with all trades and signings
- ✅ Current November 2025 ratings reflecting performance
- ✅ Ready-to-play game data
- ✅ Backup of old data for reference

**Ready to update? Let's do this!** 🏀
