# NBA Team Wheel - Current Roster Collection Strategy

## Goal: Collect REAL 2024-25 season rosters with only essential game data

### Data Sources:
- **Primary**: ESPN.com team roster pages
- **Ratings**: NBA 2K25 official ratings from 2kratings.com

### Essential Data Points (ONLY these 5):
1. **Player Name** - Full name as displayed
2. **Jersey Number** - Current number
3. **Position(s)** - All positions they can play (PG, SG, SF, PF, C)
4. **NBA 2K Rating** - Overall rating (60-99 scale)
5. **Photo Path** - Standardized file path for headshot

### Data Structure Template:
```json
{
  "name": "Stephen Curry",
  "jersey": "30",
  "positions": ["PG"],
  "rating": 96,
  "photo": "assets/players/nba/stephen_curry.jpg"
}
```

### Collection Process:

#### Step 1: Get Current ESPN Roster
- Go to: `https://www.espn.com/nba/team/roster/_/name/{team-code}`
- Extract: Name, Jersey #, Position from roster table
- Verify current 2024-25 season data

#### Step 2: Get NBA 2K25 Ratings
- Go to: `https://www.2kratings.com/nba2k25-player-ratings`
- Search for each player to get overall rating
- Use current ratings, not outdated ones

#### Step 3: Photo Standardization
- Save as: `assets/players/nba/{first_name}_{last_name}.jpg`
- Lowercase, underscores for spaces
- 200x200px headshots preferred

### Teams to Collect (30 total):

**Western Conference:**
- Los Angeles Lakers ✅ (DONE)
- Golden State Warriors ✅ (DONE)
- Phoenix Suns
- Sacramento Kings
- LA Clippers
- Denver Nuggets
- Minnesota Timberwolves
- Oklahoma City Thunder
- Dallas Mavericks
- New Orleans Pelicans
- Memphis Grizzlies
- Houston Rockets
- San Antonio Spurs
- Utah Jazz
- Portland Trail Blazers

**Eastern Conference:**
- Boston Celtics
- New York Knicks
- Philadelphia 76ers
- Cleveland Cavaliers
- Orlando Magic
- Indiana Pacers
- Miami Heat
- Atlanta Hawks
- Chicago Bulls
- Milwaukee Bucks
- Brooklyn Nets
- Toronto Raptors
- Charlotte Hornets
- Washington Wizards
- Detroit Pistons

### Quality Control:
- ✅ Verify current 2024-25 season rosters
- ✅ Cross-check trades/signings from summer 2024
- ✅ Ensure jersey numbers are current
- ✅ Validate 2K ratings are from NBA 2K25
- ✅ Remove any unnecessary data (age, salary, etc.)

### File Output:
- Location: `data/current-rosters/teams/{team-name}-2024-25.json`
- Format: Clean JSON with only essential data
- Size goal: Keep files under 10KB each 