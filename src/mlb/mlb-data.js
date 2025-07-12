/**
 * MLB Team Data Framework
 * For George and Frankie's Dream Team Builder Game
 * 
 * This framework provides MLB team data and starting positions for baseball team building
 */

// =============================================================================
// ⚾ MLB DATA CONFIGURATION
// =============================================================================

const MLB_CONFIG = {
    // MLB specific settings
    TOTAL_TEAMS: 30,
    LEAGUES: {
        AMERICAN: {
            EAST: ['Baltimore Orioles', 'Boston Red Sox', 'New York Yankees', 'Tampa Bay Rays', 'Toronto Blue Jays'],
            CENTRAL: ['Chicago White Sox', 'Cleveland Guardians', 'Detroit Tigers', 'Kansas City Royals', 'Minnesota Twins'],
            WEST: ['Houston Astros', 'Los Angeles Angels', 'Oakland Athletics', 'Seattle Mariners', 'Texas Rangers']
        },
        NATIONAL: {
            EAST: ['Atlanta Braves', 'Miami Marlins', 'New York Mets', 'Philadelphia Phillies', 'Washington Nationals'],
            CENTRAL: ['Chicago Cubs', 'Cincinnati Reds', 'Milwaukee Brewers', 'Pittsburgh Pirates', 'St. Louis Cardinals'],
            WEST: ['Arizona Diamondbacks', 'Colorado Rockies', 'Los Angeles Dodgers', 'San Diego Padres', 'San Francisco Giants']
        }
    },
    
    // Starting positions for MLB teams
    STARTING_POSITIONS: {
        // Batting Order (9 positions)
        'C': { name: 'Catcher', side: 'fielding', importance: 0.12, batting_order: 8 },
        '1B': { name: 'First Base', side: 'fielding', importance: 0.1, batting_order: 4 },
        '2B': { name: 'Second Base', side: 'fielding', importance: 0.09, batting_order: 2 },
        '3B': { name: 'Third Base', side: 'fielding', importance: 0.11, batting_order: 5 },
        'SS': { name: 'Shortstop', side: 'fielding', importance: 0.12, batting_order: 6 },
        'LF': { name: 'Left Field', side: 'fielding', importance: 0.08, batting_order: 7 },
        'CF': { name: 'Center Field', side: 'fielding', importance: 0.1, batting_order: 1 },
        'RF': { name: 'Right Field', side: 'fielding', importance: 0.09, batting_order: 3 },
        'DH': { name: 'Designated Hitter', side: 'batting', importance: 0.08, batting_order: 9 },
        
        // Pitching Staff
        'SP1': { name: 'Starting Pitcher 1 (Ace)', side: 'pitching', importance: 0.15, rotation: 1 },
        'SP2': { name: 'Starting Pitcher 2', side: 'pitching', importance: 0.12, rotation: 2 },
        'SP3': { name: 'Starting Pitcher 3', side: 'pitching', importance: 0.1, rotation: 3 },
        'SP4': { name: 'Starting Pitcher 4', side: 'pitching', importance: 0.08, rotation: 4 },
        'SP5': { name: 'Starting Pitcher 5', side: 'pitching', importance: 0.07, rotation: 5 },
        'CL': { name: 'Closer', side: 'pitching', importance: 0.12, bullpen_role: 'closer' },
        'SU': { name: 'Setup Man', side: 'pitching', importance: 0.08, bullpen_role: 'setup' },
        'RP1': { name: 'Relief Pitcher 1', side: 'pitching', importance: 0.06, bullpen_role: 'middle' },
        'RP2': { name: 'Relief Pitcher 2', side: 'pitching', importance: 0.05, bullpen_role: 'middle' },
        
        // Management
        'MGR': { name: 'Manager', side: 'management', importance: 0.15 },
        'COACH': { name: 'Pitching Coach', side: 'management', importance: 0.08 }
    }
};

// =============================================================================
// ⚾ MLB TEAM DATA
// =============================================================================

const MLB_TEAMS = [
    // American League East
    {
        id: 1,
        name: 'Baltimore Orioles',
        abbreviation: 'BAL',
        city: 'Baltimore',
        state: 'Maryland',
        league: 'American',
        division: 'East',
        color_primary: '#DF4601',
        color_secondary: '#000000',
        logo_file: 'assets/logos/mlb/baltimore_orioles.svg',
        founded: 1901,
        world_series_wins: 3,
        ballpark: 'Oriole Park at Camden Yards',
        roster: [] // TODO: Add real player data
    },
    {
        id: 2,
        name: 'Boston Red Sox',
        abbreviation: 'BOS',
        city: 'Boston',
        state: 'Massachusetts',
        league: 'American',
        division: 'East',
        color_primary: '#BD3039',
        color_secondary: '#0C2340',
        logo_file: 'assets/logos/mlb/boston_red_sox.svg',
        founded: 1901,
        world_series_wins: 9,
        ballpark: 'Fenway Park',
        roster: [] // TODO: Add real player data
    },
    {
        id: 3,
        name: 'New York Yankees',
        abbreviation: 'NYY',
        city: 'New York',
        state: 'New York',
        league: 'American',
        division: 'East',
        color_primary: '#0C2340',
        color_secondary: '#C4CED4',
        logo_file: 'assets/logos/mlb/new_york_yankees.svg',
        founded: 1901,
        world_series_wins: 27,
        ballpark: 'Yankee Stadium',
        roster: [] // TODO: Add real player data
    },
    {
        id: 4,
        name: 'Tampa Bay Rays',
        abbreviation: 'TB',
        city: 'St. Petersburg',
        state: 'Florida',
        league: 'American',
        division: 'East',
        color_primary: '#092C5C',
        color_secondary: '#8FBCE6',
        logo_file: 'assets/logos/mlb/tampa_bay_rays.svg',
        founded: 1998,
        world_series_wins: 0,
        ballpark: 'Tropicana Field',
        roster: [] // TODO: Add real player data
    },
    {
        id: 5,
        name: 'Toronto Blue Jays',
        abbreviation: 'TOR',
        city: 'Toronto',
        state: 'Ontario',
        league: 'American',
        division: 'East',
        color_primary: '#134A8E',
        color_secondary: '#1D2D5C',
        logo_file: 'assets/logos/mlb/toronto_blue_jays.svg',
        founded: 1977,
        world_series_wins: 2,
        ballpark: 'Rogers Centre',
        roster: [] // TODO: Add real player data
    }
    // TODO: Add remaining 25 MLB teams
];

// =============================================================================
// ⚾ MLB DATA MANAGER
// =============================================================================

class MLBDataManager {
    constructor() {
        this.teams = MLB_TEAMS;
        this.positions = MLB_CONFIG.STARTING_POSITIONS;
        this.playerStats = new Map();
        this.initialized = false;
    }
    
    // Initialize MLB data
    async initialize() {
        try {
            console.log('⚾ Initializing MLB data...');
            
            // TODO: Load real MLB data from API
            await this.loadMLBData();
            
            this.initialized = true;
            console.log('✅ MLB data initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Error initializing MLB data:', error);
            return false;
        }
    }
    
    // Load MLB data (placeholder for real implementation)
    async loadMLBData() {
        console.log('📡 Loading MLB data...');
        
        // TODO: Implement real MLB data loading
        // This could use ESPN API, MLB API, or other data sources
        
        // For now, using placeholder data
        console.log('⚠️ Using placeholder MLB data');
        return true;
    }
    
    // Get all MLB teams
    getAllTeams() {
        return this.teams;
    }
    
    // Get team by ID
    getTeamById(id) {
        return this.teams.find(team => team.id === id);
    }
    
    // Get team by name
    getTeamByName(name) {
        return this.teams.find(team => team.name === name);
    }
    
    // Get teams by league
    getTeamsByLeague(league) {
        return this.teams.filter(team => team.league === league);
    }
    
    // Get teams by division
    getTeamsByDivision(league, division) {
        return this.teams.filter(team => 
            team.league === league && team.division === division
        );
    }
    
    // Get starting positions
    getStartingPositions() {
        return this.positions;
    }
    
    // Get positions by side
    getPositionsBySide(side) {
        return Object.entries(this.positions)
            .filter(([key, pos]) => pos.side === side)
            .reduce((obj, [key, pos]) => {
                obj[key] = pos;
                return obj;
            }, {});
    }
    
    // Get fielding positions
    getFieldingPositions() {
        return this.getPositionsBySide('fielding');
    }
    
    // Get pitching positions
    getPitchingPositions() {
        return this.getPositionsBySide('pitching');
    }
    
    // Get starting rotation
    getStartingRotation() {
        return Object.entries(this.positions)
            .filter(([key, pos]) => pos.side === 'pitching' && key.startsWith('SP'))
            .sort((a, b) => a[1].rotation - b[1].rotation)
            .reduce((obj, [key, pos]) => {
                obj[key] = pos;
                return obj;
            }, {});
    }
    
    // Get bullpen positions
    getBullpenPositions() {
        return Object.entries(this.positions)
            .filter(([key, pos]) => pos.side === 'pitching' && pos.bullpen_role)
            .reduce((obj, [key, pos]) => {
                obj[key] = pos;
                return obj;
            }, {});
    }
    
    // Generate mock MLB roster
    generateMockRoster(teamName) {
        const positions = Object.keys(this.positions);
        const roster = [];
        
        // Generate players for each position
        positions.forEach(position => {
            const positionInfo = this.positions[position];
            
            if (position === 'MGR' || position === 'COACH') {
                roster.push({
                    name: this.generateCoachName(),
                    position: position,
                    experience: Math.floor(Math.random() * 20) + 5,
                    isCoach: true
                });
            } else {
                roster.push({
                    name: this.generatePlayerName(),
                    position: position,
                    number: Math.floor(Math.random() * 99) + 1,
                    height: this.generatePlayerHeight(position),
                    weight: this.generatePlayerWeight(position),
                    experience: Math.floor(Math.random() * 15) + 1,
                    batting_average: this.generateBattingAverage(position),
                    era: this.generateERA(position),
                    isCoach: false
                });
            }
        });
        
        return roster;
    }
    
    // Generate player name
    generatePlayerName() {
        const firstNames = ['Mike', 'Aaron', 'Mookie', 'Fernando', 'Jacob', 'Gerrit', 'Ronald', 'Juan', 'Freddie', 'Nolan'];
        const lastNames = ['Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        return `${firstName} ${lastName}`;
    }
    
    // Generate coach name
    generateCoachName() {
        const firstNames = ['Tony', 'Dave', 'Buck', 'Joe', 'Aaron', 'Gabe', 'Kevin', 'Scott', 'Craig', 'Ron'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson'];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        return `${firstName} ${lastName}`;
    }
    
    // Generate player height based on position
    generatePlayerHeight(position) {
        const heights = {
            'C': () => Math.floor(Math.random() * 4) + 72, // 6'0" - 6'3"
            '1B': () => Math.floor(Math.random() * 4) + 72, // 6'0" - 6'3"
            '2B': () => Math.floor(Math.random() * 4) + 68, // 5'8" - 5'11"
            '3B': () => Math.floor(Math.random() * 4) + 70, // 5'10" - 6'1"
            'SS': () => Math.floor(Math.random() * 4) + 70, // 5'10" - 6'1"
            'LF': () => Math.floor(Math.random() * 4) + 70, // 5'10" - 6'1"
            'CF': () => Math.floor(Math.random() * 4) + 70, // 5'10" - 6'1"
            'RF': () => Math.floor(Math.random() * 4) + 72, // 6'0" - 6'3"
            'DH': () => Math.floor(Math.random() * 4) + 72, // 6'0" - 6'3"
            'SP1': () => Math.floor(Math.random() * 4) + 72, // 6'0" - 6'3"
            'SP2': () => Math.floor(Math.random() * 4) + 72, // 6'0" - 6'3"
            'SP3': () => Math.floor(Math.random() * 4) + 72, // 6'0" - 6'3"
            'SP4': () => Math.floor(Math.random() * 4) + 72, // 6'0" - 6'3"
            'SP5': () => Math.floor(Math.random() * 4) + 72, // 6'0" - 6'3"
            'CL': () => Math.floor(Math.random() * 4) + 70, // 5'10" - 6'1"
            'SU': () => Math.floor(Math.random() * 4) + 70, // 5'10" - 6'1"
            'RP1': () => Math.floor(Math.random() * 4) + 70, // 5'10" - 6'1"
            'RP2': () => Math.floor(Math.random() * 4) + 70 // 5'10" - 6'1"
        };
        
        const heightInches = heights[position] ? heights[position]() : 70;
        const feet = Math.floor(heightInches / 12);
        const inches = heightInches % 12;
        
        return `${feet}'${inches}"`;
    }
    
    // Generate player weight based on position
    generatePlayerWeight(position) {
        const weights = {
            'C': () => Math.floor(Math.random() * 40) + 200, // 200-240 lbs
            '1B': () => Math.floor(Math.random() * 40) + 200, // 200-240 lbs
            '2B': () => Math.floor(Math.random() * 30) + 170, // 170-200 lbs
            '3B': () => Math.floor(Math.random() * 30) + 185, // 185-215 lbs
            'SS': () => Math.floor(Math.random() * 30) + 175, // 175-205 lbs
            'LF': () => Math.floor(Math.random() * 30) + 180, // 180-210 lbs
            'CF': () => Math.floor(Math.random() * 30) + 175, // 175-205 lbs
            'RF': () => Math.floor(Math.random() * 30) + 190, // 190-220 lbs
            'DH': () => Math.floor(Math.random() * 40) + 200, // 200-240 lbs
            'SP1': () => Math.floor(Math.random() * 30) + 180, // 180-210 lbs
            'SP2': () => Math.floor(Math.random() * 30) + 180, // 180-210 lbs
            'SP3': () => Math.floor(Math.random() * 30) + 180, // 180-210 lbs
            'SP4': () => Math.floor(Math.random() * 30) + 180, // 180-210 lbs
            'SP5': () => Math.floor(Math.random() * 30) + 180, // 180-210 lbs
            'CL': () => Math.floor(Math.random() * 30) + 175, // 175-205 lbs
            'SU': () => Math.floor(Math.random() * 30) + 175, // 175-205 lbs
            'RP1': () => Math.floor(Math.random() * 30) + 175, // 175-205 lbs
            'RP2': () => Math.floor(Math.random() * 30) + 175 // 175-205 lbs
        };
        
        const weight = weights[position] ? weights[position]() : 180;
        return `${weight} lbs`;
    }
    
    // Generate batting average (for position players)
    generateBattingAverage(position) {
        if (position.includes('SP') || position === 'CL' || position === 'SU' || position.includes('RP')) {
            return null; // Pitchers don't have batting averages in AL (DH rule)
        }
        
        const baseAverage = 0.250; // Base batting average
        const variance = 0.050; // +/- 50 points
        const average = baseAverage + (Math.random() * variance * 2) - variance;
        
        return Math.max(0.180, Math.min(0.350, average)).toFixed(3);
    }
    
    // Generate ERA (for pitchers)
    generateERA(position) {
        if (!position.includes('SP') && position !== 'CL' && position !== 'SU' && !position.includes('RP')) {
            return null; // Position players don't have ERAs
        }
        
        const baseERA = 3.50; // Base ERA
        const variance = 1.50; // +/- 1.50 ERA
        const era = baseERA + (Math.random() * variance * 2) - variance;
        
        return Math.max(1.00, Math.min(6.00, era)).toFixed(2);
    }
}

// =============================================================================
// 🎯 GLOBAL MLB DATA INSTANCE
// =============================================================================

// Initialize global MLB data manager
const MLBData = new MLBDataManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MLBData, MLB_CONFIG, MLB_TEAMS };
} 