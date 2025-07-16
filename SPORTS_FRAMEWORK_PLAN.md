# Multi-Sport Team Wheel Framework

## Current Working Features (PRESERVE):
✅ **Perfect NBA Wheel**: Equal segments, correct colors, centered text, logos outside
✅ **Classic Spin Mode**: 6-second realistic deceleration  
✅ **Multiplayer Setup**: Player names, round-based team building
✅ **Data Integration**: NBA teams, rosters, coaches, NBA2K ratings

## New Clean Structure:

```
sports-team-wheel/
├── index.html                    # Main app (sport-agnostic)
├── css/
│   └── styles.css               # Main styles
├── js/
│   ├── core/
│   │   ├── wheel-engine.js      # Universal wheel logic
│   │   ├── game-logic.js        # Game modes (classic, multiplayer)
│   │   └── sport-selector.js    # Sport switching logic
│   ├── features/
│   │   ├── multiplayer.js       # Multiplayer functionality
│   │   ├── battle-system.js     # Battle/comparison features
│   │   └── effects/
│   │       ├── visual-effects.js
│   │       └── sound-manager.js
│   └── utils/
│       └── data-loader.js       # Universal data loading
├── data/
│   ├── sports-config.json       # Sport definitions & settings
│   ├── nba/
│   │   ├── teams.json          # Clean team data
│   │   ├── rosters/            # Current rosters
│   │   └── ratings/            # NBA2K ratings
│   ├── nfl/
│   │   ├── teams.json          # NFL team data
│   │   └── rosters/            # Current rosters
│   ├── mlb/
│   │   └── teams.json          # MLB team data
│   └── soccer/
│       └── teams.json          # Champions League data
├── assets/
│   └── logos/
│       ├── nba/                # NBA team logos
│       ├── nfl/                # NFL team logos
│       ├── mlb/                # MLB team logos
│       └── soccer/             # Soccer team logos
└── tools/
    ├── data-collection/        # Scripts for roster updates
    └── deployment/             # Deployment configs
```

## Universal Data Schema:

```json
{
  "sport": "nba",
  "teams": [
    {
      "id": "lal",
      "name": "Los Angeles Lakers",
      "abbreviation": "LAL",
      "city": "Los Angeles",
      "colors": {
        "primary": "#552583",
        "secondary": "#FDB927"
      },
      "logo": "assets/logos/nba/lal.svg",
      "roster": [...],
      "ratings_source": "nba2k25"
    }
  ]
}
```

## Roster Requirements by Sport:

### 🏈 NFL (10 positions):
- 1 QB, 2 RB, 3 WR, 1 TE, 1 K, 1 Team Defense, 1 Coach

### 🏀 NBA (8 positions):
- 1 PG, 1 SG, 1 SF, 1 PF, 1 C, 2 Utility Players, 1 Coach

### ⚾ MLB (13 positions):
- 1 C, 1 1B, 1 2B, 1 3B, 1 SS, 3 OF, 1 DH, 2 SP, 1 RP, 1 Manager

### ⚽ Champions League (12 positions):
- 1 GK, 4 DEF, 4 MID, 2 FWD, 1 Manager

## Framework Features:
✅ **Universal Data Schema**: Same structure works for all sports
✅ **Position-Based Drafting**: Each sport has defined roster requirements
✅ **Flexible Expansion**: Easy to add new sports and position types
✅ **Rating Integration**: Support for different rating systems (NBA2K, Madden, FIFA, etc.)

## Implementation Steps:
1. ✅ Preserve current working NBA wheel
2. ✅ Clean up redundant files only
3. ✅ Create sport-agnostic wheel engine with roster requirements
4. ✅ Implement sport selector with position-based team building
5. ✅ Framework ready for NFL, MLB, Soccer expansion 