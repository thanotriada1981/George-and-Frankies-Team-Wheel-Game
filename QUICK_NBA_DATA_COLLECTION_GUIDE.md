# 🏀 COMPLETE NBA 2025-26 DATA COLLECTION GUIDE

## 🎯 **Mission: Collect Fresh NBA Data Post-July 1st, 2025**

### **Data Sources:**
1. **ESPN.com** → Current rosters with all trades/signings
2. **2kratings.com** → NBA 2K26 player ratings

---

## 🚀 **STEP 1: ESPN ROSTER COLLECTION**

### **Process:**
1. Navigate to: `https://www.espn.com/nba/teams`
2. Click on each team (start with priority teams below)
3. Click "Roster" tab
4. Open browser console (F12)
5. Copy/paste script: `data/current-rosters/espn-collection-script-enhanced.js`
6. Run: `collectEnhancedESPNData()`
7. Copy JSON output
8. Save to: `data/current-rosters/teams/[team-name]-current.json`

### **Priority Collection Order:**
1. **Los Angeles Lakers** (major free agency moves)
2. **Golden State Warriors** (roster changes)
3. **Boston Celtics** (defending champions)
4. **Miami Heat** (always active in trades)
5. **Dallas Mavericks** (Finals team)
6. **Oklahoma City Thunder** (young core)
7. **Minnesota Timberwolves** (emerging team)
8. **New York Knicks** (big market moves)
9. **Philadelphia 76ers** (potential changes)
10. **Phoenix Suns** (veteran additions)

### **Expected Output Format:**
```json
{
  "team": {
    "name": "Los Angeles Lakers",
    "abbreviation": "LAL",
    "city": "Los Angeles"
  },
  "data_source": {
    "website": "https://www.espn.com/nba/teams",
    "collection_date": "2025-07-16",
    "season": "2025-26"
  },
  "roster": [
    {
      "name": "LeBron James",
      "position": "SF",
      "jersey_number": "23",
      "status": "active",
      "roster_status": "starter"
    }
  ]
}
```

---

## 🎮 **STEP 2: NBA 2K26 RATINGS COLLECTION**

### **Process:**
1. Navigate to: `https://www.2kratings.com/`
2. Click on "NBA 2K26 Teams" 
3. Select each team
4. Open browser console (F12)
5. Copy/paste script: `data/nba2k-official/nba-2k26-collection-script-enhanced.js`
6. Run: `collectEnhanced2K26Data()`
7. Copy JSON output
8. Save to: `data/nba2k-official/teams/[team-name].json`

### **Expected Output Format:**
```json
{
  "team": {
    "name": "Los Angeles Lakers",
    "abbreviation": "LAL"
  },
  "data_source": {
    "website": "https://www.2kratings.com/",
    "collection_date": "2025-07-16",
    "game_version": "NBA 2K26"
  },
  "roster": [
    {
      "name": "LeBron James",
      "position": "SF",
      "overall_rating": 85,
      "jersey_number": "23",
      "detailed_ratings": {
        "three_point_shot": 82,
        "driving_dunk": 88,
        "basketball_iq": 95
      }
    }
  ]
}
```

---

## 📋 **COMPLETE TEAM COLLECTION CHECKLIST**

### **Eastern Conference:**
- [ ] **Atlantic Division**
  - [ ] Boston Celtics
  - [ ] Brooklyn Nets  
  - [ ] New York Knicks
  - [ ] Philadelphia 76ers
  - [ ] Toronto Raptors

- [ ] **Central Division**
  - [ ] Chicago Bulls
  - [ ] Cleveland Cavaliers
  - [ ] Detroit Pistons
  - [ ] Indiana Pacers
  - [ ] Milwaukee Bucks

- [ ] **Southeast Division**
  - [ ] Atlanta Hawks
  - [ ] Charlotte Hornets
  - [ ] Miami Heat
  - [ ] Orlando Magic
  - [ ] Washington Wizards

### **Western Conference:**
- [ ] **Northwest Division**
  - [ ] Denver Nuggets
  - [ ] Minnesota Timberwolves
  - [ ] Oklahoma City Thunder
  - [ ] Portland Trail Blazers
  - [ ] Utah Jazz

- [ ] **Pacific Division**
  - [ ] Golden State Warriors
  - [ ] LA Clippers
  - [ ] Los Angeles Lakers
  - [ ] Phoenix Suns
  - [ ] Sacramento Kings

- [ ] **Southwest Division**
  - [ ] Dallas Mavericks
  - [ ] Houston Rockets
  - [ ] Memphis Grizzlies
  - [ ] New Orleans Pelicans
  - [ ] San Antonio Spurs

---

## 🔄 **AUTOMATED COLLECTION WORKFLOW**

### **For Each Team:**
1. **ESPN Collection** (5-10 minutes per team)
   - Navigate to team roster page
   - Run enhanced script
   - Save JSON data
   - Verify player count (should be 15-20 players)

2. **2K26 Collection** (5-10 minutes per team)
   - Navigate to 2kratings team page
   - Run enhanced script  
   - Save JSON data
   - Verify ratings (should be 50-99 range)

3. **Data Validation**
   - Check player names match between sources
   - Verify roster size is realistic
   - Confirm recent trades are reflected

---

## 📊 **QUALITY CONTROL CHECKLIST**

### **ESPN Data Validation:**
- [ ] Team name correctly identified
- [ ] 12-20 players in roster
- [ ] Positions assigned (PG, SG, SF, PF, C)
- [ ] Jersey numbers present
- [ ] Recent trades/signings included
- [ ] Active/injured status noted

### **2K26 Data Validation:**
- [ ] Team name matches ESPN data
- [ ] Overall ratings 50-99 range
- [ ] Player names consistent with ESPN
- [ ] Position data available
- [ ] Detailed attributes present (when available)

---

## 🎯 **TARGET COMPLETION**

### **Phase 1: Priority Teams (Complete First)**
- **Target:** 10 teams by end of day
- **Focus:** Lakers, Warriors, Celtics, Heat, Mavericks
- **Expected Time:** 2-3 hours total

### **Phase 2: Conference Completion**
- **Target:** 30 teams total
- **Timeline:** 1-2 days
- **Validation:** Cross-reference rosters for accuracy

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues:**
1. **ESPN Script Issues:**
   - Refresh page and try again
   - Check if on roster tab
   - Try alternative ESPN URLs

2. **2K Ratings Issues:**
   - Ensure on NBA 2K26 section
   - Check for page structure changes
   - Try team-specific URLs

3. **Data Format Issues:**
   - Verify JSON is valid
   - Check for special characters
   - Ensure proper file naming

### **Emergency Fallback:**
- Manual data entry for critical teams
- Use existing data as template
- Focus on key players first

---

## ✅ **SUCCESS METRICS**

- [ ] All 30 teams collected from both sources
- [ ] Data includes post-July 1st roster moves
- [ ] Player ratings reflect NBA 2K26 updates
- [ ] Files properly saved and organized
- [ ] Data validated for accuracy

**Let's collect this data systematically and get the NBA Team Wheel updated with fresh 2025-26 season information!** 🏀🔥 