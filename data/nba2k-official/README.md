# NBA 2K Official Ratings Data Collection

## 📊 Data Source: [2kratings.com](https://www.2kratings.com/)

This folder contains the official NBA 2K26 player ratings and team data collected directly from 2kratings.com.

## 🎯 Data Collection Plan

### Step 1: Team List (All 30 NBA Teams)
We need to collect data for all teams. Based on the website structure:

**Eastern Conference:**
- Atlantic: Boston Celtics, Brooklyn Nets, New York Knicks, Philadelphia 76ers, Toronto Raptors
- Central: Chicago Bulls, Cleveland Cavaliers, Detroit Pistons, Indiana Pacers, Milwaukee Bucks  
- Southeast: Atlanta Hawks, Charlotte Hornets, Miami Heat, Orlando Magic, Washington Wizards

**Western Conference:**
- Northwest: Denver Nuggets, Minnesota Timberwolves, Oklahoma City Thunder, Portland Trail Blazers, Utah Jazz
- Pacific: Golden State Warriors, LA Clippers, Los Angeles Lakers, Phoenix Suns, Sacramento Kings
- Southwest: Dallas Mavericks, Houston Rockets, Memphis Grizzlies, New Orleans Pelicans, San Antonio Spurs

### Step 2: Data Fields to Collect

For each player, collect:
- **Name**: Full player name
- **Overall Rating (OVR)**: Main 2K rating (85, 91, etc.)
- **3PT Rating**: Three-point shooting rating  
- **DNK Rating**: Dunking ability rating
- **Position**: Player position (PG, SG, SF, PF, C)
- **Height**: Player height (6'1", 7'2", etc.)
- **Nationality**: Country flag/nationality
- **Player Type**: Description from 2K (e.g., "Offense-Heavy Point", "2-Way Inside-Out Scorer")
- **Jersey Number**: Player's jersey number

### Step 3: File Structure

Each team will have its own JSON file:
```
data/nba2k-official/teams/
├── atlanta-hawks.json
├── boston-celtics.json
├── brooklyn-nets.json
└── ... (all 30 teams)
```

### Step 4: Collection Process

1. **Navigate to 2kratings.com**
2. **Select each team** from the left sidebar
3. **Copy player data** systematically
4. **Save to team JSON file** using the template below

## 📋 JSON Template

Use this structure for each team file:

```json
{
  "team": {
    "name": "Atlanta Hawks",
    "abbreviation": "ATL", 
    "city": "Atlanta",
    "conference": "Eastern",
    "division": "Southeast"
  },
  "data_source": {
    "website": "https://www.2kratings.com/",
    "collection_date": "2025-01-06",
            "game_version": "NBA 2K26"
  },
  "roster": [
    {
      "name": "Trae Young",
      "jersey_number": 11,
      "position": "PG",
      "height": "6'1\"",
      "nationality": "USA",
      "ratings": {
        "overall": 91,
        "three_point": 85,
        "dunk": 30
      },
      "player_type": "Offense-Heavy Point",
      "archetype": "Primary ball handler with elite shooting"
    }
  ]
}
```

## 🔄 Next Steps

1. **Start with a few teams** to test the template
2. **Verify data accuracy** by comparing with game
3. **Complete all 30 teams** systematically  
4. **Update integration** to use this official data
5. **Set up regular updates** when 2K releases rating changes

## 📝 Notes

- Keep file names consistent (lowercase, hyphens)
- Double-check player names for exact spelling
- Include bench players and reserves, not just starters
- Note any special ratings or badges if available
- Record collection date for data freshness tracking 