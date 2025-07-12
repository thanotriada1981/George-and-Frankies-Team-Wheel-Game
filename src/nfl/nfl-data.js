/**
 * NFL Team Data Framework
 * For George and Frankie's Dream Team Builder Game
 * 
 * This framework provides NFL team data and starting positions for football team building
 */

// =============================================================================
// 🏈 NFL DATA CONFIGURATION
// =============================================================================

const NFL_CONFIG = {
    // NFL specific settings
    TOTAL_TEAMS: 32,
    DIVISIONS: {
        AFC: {
            NORTH: ['Baltimore Ravens', 'Cincinnati Bengals', 'Cleveland Browns', 'Pittsburgh Steelers'],
            SOUTH: ['Houston Texans', 'Indianapolis Colts', 'Jacksonville Jaguars', 'Tennessee Titans'],
            EAST: ['Buffalo Bills', 'Miami Dolphins', 'New England Patriots', 'New York Jets'],
            WEST: ['Denver Broncos', 'Kansas City Chiefs', 'Las Vegas Raiders', 'Los Angeles Chargers']
        },
        NFC: {
            NORTH: ['Chicago Bears', 'Detroit Lions', 'Green Bay Packers', 'Minnesota Vikings'],
            SOUTH: ['Atlanta Falcons', 'Carolina Panthers', 'New Orleans Saints', 'Tampa Bay Buccaneers'],
            EAST: ['Dallas Cowboys', 'New York Giants', 'Philadelphia Eagles', 'Washington Commanders'],
            WEST: ['Arizona Cardinals', 'Los Angeles Rams', 'San Francisco 49ers', 'Seattle Seahawks']
        }
    },
    
    // Starting positions for NFL teams
    STARTING_POSITIONS: {
        // Offense
        'QB': { name: 'Quarterback', side: 'offense', importance: 0.2 },
        'RB': { name: 'Running Back', side: 'offense', importance: 0.15 },
        'FB': { name: 'Fullback', side: 'offense', importance: 0.05 },
        'WR1': { name: 'Wide Receiver 1', side: 'offense', importance: 0.15 },
        'WR2': { name: 'Wide Receiver 2', side: 'offense', importance: 0.12 },
        'TE': { name: 'Tight End', side: 'offense', importance: 0.1 },
        'LT': { name: 'Left Tackle', side: 'offense', importance: 0.08 },
        'LG': { name: 'Left Guard', side: 'offense', importance: 0.06 },
        'C': { name: 'Center', side: 'offense', importance: 0.07 },
        'RG': { name: 'Right Guard', side: 'offense', importance: 0.06 },
        'RT': { name: 'Right Tackle', side: 'offense', importance: 0.08 },
        
        // Defense
        'DE1': { name: 'Defensive End 1', side: 'defense', importance: 0.12 },
        'DE2': { name: 'Defensive End 2', side: 'defense', importance: 0.12 },
        'DT1': { name: 'Defensive Tackle 1', side: 'defense', importance: 0.1 },
        'DT2': { name: 'Defensive Tackle 2', side: 'defense', importance: 0.1 },
        'OLB1': { name: 'Outside Linebacker 1', side: 'defense', importance: 0.1 },
        'OLB2': { name: 'Outside Linebacker 2', side: 'defense', importance: 0.1 },
        'MLB': { name: 'Middle Linebacker', side: 'defense', importance: 0.12 },
        'CB1': { name: 'Cornerback 1', side: 'defense', importance: 0.12 },
        'CB2': { name: 'Cornerback 2', side: 'defense', importance: 0.12 },
        'SS': { name: 'Strong Safety', side: 'defense', importance: 0.1 },
        'FS': { name: 'Free Safety', side: 'defense', importance: 0.1 },
        
        // Special Teams
        'K': { name: 'Kicker', side: 'special', importance: 0.08 },
        'P': { name: 'Punter', side: 'special', importance: 0.05 },
        'COACH': { name: 'Head Coach', side: 'coaching', importance: 0.15 }
    }
};

// =============================================================================
// 🏈 NFL TEAM DATA
// =============================================================================

const NFL_TEAMS = [
    // AFC North
    {
        id: 1,
        name: 'Baltimore Ravens',
        abbreviation: 'BAL',
        city: 'Baltimore',
        state: 'Maryland',
        conference: 'AFC',
        division: 'North',
        color_primary: '#241773',
        color_secondary: '#000000',
        logo_file: 'assets/logos/nfl/baltimore_ravens.svg',
        founded: 1996,
        super_bowl_wins: 2,
        roster: [] // TODO: Add real player data
    },
    {
        id: 2,
        name: 'Cincinnati Bengals',
        abbreviation: 'CIN',
        city: 'Cincinnati',
        state: 'Ohio',
        conference: 'AFC',
        division: 'North',
        color_primary: '#FB4F14',
        color_secondary: '#000000',
        logo_file: 'assets/logos/nfl/cincinnati_bengals.svg',
        founded: 1968,
        super_bowl_wins: 0,
        roster: [] // TODO: Add real player data
    },
    {
        id: 3,
        name: 'Cleveland Browns',
        abbreviation: 'CLE',
        city: 'Cleveland',
        state: 'Ohio',
        conference: 'AFC',
        division: 'North',
        color_primary: '#311D00',
        color_secondary: '#FF3C00',
        logo_file: 'assets/logos/nfl/cleveland_browns.svg',
        founded: 1946,
        super_bowl_wins: 0,
        roster: [] // TODO: Add real player data
    },
    {
        id: 4,
        name: 'Pittsburgh Steelers',
        abbreviation: 'PIT',
        city: 'Pittsburgh',
        state: 'Pennsylvania',
        conference: 'AFC',
        division: 'North',
        color_primary: '#FFB612',
        color_secondary: '#101820',
        logo_file: 'assets/logos/nfl/pittsburgh_steelers.svg',
        founded: 1933,
        super_bowl_wins: 6,
        roster: [] // TODO: Add real player data
    }
    // TODO: Add remaining 28 NFL teams
];

// =============================================================================
// 🏈 NFL DATA MANAGER
// =============================================================================

class NFLDataManager {
    constructor() {
        this.teams = NFL_TEAMS;
        this.positions = NFL_CONFIG.STARTING_POSITIONS;
        this.playerStats = new Map();
        this.initialized = false;
    }
    
    // Initialize NFL data
    async initialize() {
        try {
            console.log('🏈 Initializing NFL data...');
            
            // TODO: Load real NFL data from API
            await this.loadNFLData();
            
            this.initialized = true;
            console.log('✅ NFL data initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Error initializing NFL data:', error);
            return false;
        }
    }
    
    // Load NFL data (placeholder for real implementation)
    async loadNFLData() {
        console.log('📡 Loading NFL data...');
        
        // TODO: Implement real NFL data loading
        // This could use ESPN API, NFL API, or other data sources
        
        // For now, using placeholder data
        console.log('⚠️ Using placeholder NFL data');
        return true;
    }
    
    // Get all NFL teams
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
    
    // Get teams by conference
    getTeamsByConference(conference) {
        return this.teams.filter(team => team.conference === conference);
    }
    
    // Get teams by division
    getTeamsByDivision(conference, division) {
        return this.teams.filter(team => 
            team.conference === conference && team.division === division
        );
    }
    
    // Get starting positions
    getStartingPositions() {
        return this.positions;
    }
    
    // Get positions by side of ball
    getPositionsBySide(side) {
        return Object.entries(this.positions)
            .filter(([key, pos]) => pos.side === side)
            .reduce((obj, [key, pos]) => {
                obj[key] = pos;
                return obj;
            }, {});
    }
    
    // Get offensive positions
    getOffensivePositions() {
        return this.getPositionsBySide('offense');
    }
    
    // Get defensive positions
    getDefensivePositions() {
        return this.getPositionsBySide('defense');
    }
    
    // Get special teams positions
    getSpecialTeamsPositions() {
        return this.getPositionsBySide('special');
    }
    
    // Generate mock NFL roster
    generateMockRoster(teamName) {
        const positions = Object.keys(this.positions);
        const roster = [];
        
        // Generate players for each position
        positions.forEach(position => {
            const positionInfo = this.positions[position];
            
            if (position === 'COACH') {
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
                    isCoach: false
                });
            }
        });
        
        return roster;
    }
    
    // Generate player name
    generatePlayerName() {
        const firstNames = ['Tom', 'Patrick', 'Aaron', 'Josh', 'Lamar', 'Dak', 'Russell', 'Kyler', 'Joe', 'Justin'];
        const lastNames = ['Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        return `${firstName} ${lastName}`;
    }
    
    // Generate coach name
    generateCoachName() {
        const firstNames = ['Bill', 'Andy', 'Sean', 'Kyle', 'Mike', 'John', 'Dan', 'Matt', 'Ron', 'Doug'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson'];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        return `${firstName} ${lastName}`;
    }
    
    // Generate player height based on position
    generatePlayerHeight(position) {
        const heights = {
            'QB': () => Math.floor(Math.random() * 4) + 72, // 6'0" - 6'3"
            'RB': () => Math.floor(Math.random() * 4) + 68, // 5'8" - 5'11"
            'WR1': () => Math.floor(Math.random() * 4) + 70, // 5'10" - 6'1"
            'WR2': () => Math.floor(Math.random() * 4) + 70, // 5'10" - 6'1"
            'TE': () => Math.floor(Math.random() * 4) + 74, // 6'2" - 6'5"
            'LT': () => Math.floor(Math.random() * 4) + 76, // 6'4" - 6'7"
            'LG': () => Math.floor(Math.random() * 4) + 74, // 6'2" - 6'5"
            'C': () => Math.floor(Math.random() * 4) + 74, // 6'2" - 6'5"
            'RG': () => Math.floor(Math.random() * 4) + 74, // 6'2" - 6'5"
            'RT': () => Math.floor(Math.random() * 4) + 76, // 6'4" - 6'7"
            'DE1': () => Math.floor(Math.random() * 4) + 74, // 6'2" - 6'5"
            'DE2': () => Math.floor(Math.random() * 4) + 74, // 6'2" - 6'5"
            'DT1': () => Math.floor(Math.random() * 4) + 73, // 6'1" - 6'4"
            'DT2': () => Math.floor(Math.random() * 4) + 73, // 6'1" - 6'4"
            'OLB1': () => Math.floor(Math.random() * 4) + 72, // 6'0" - 6'3"
            'OLB2': () => Math.floor(Math.random() * 4) + 72, // 6'0" - 6'3"
            'MLB': () => Math.floor(Math.random() * 4) + 72, // 6'0" - 6'3"
            'CB1': () => Math.floor(Math.random() * 4) + 68, // 5'8" - 5'11"
            'CB2': () => Math.floor(Math.random() * 4) + 68, // 5'8" - 5'11"
            'SS': () => Math.floor(Math.random() * 4) + 70, // 5'10" - 6'1"
            'FS': () => Math.floor(Math.random() * 4) + 70, // 5'10" - 6'1"
            'K': () => Math.floor(Math.random() * 4) + 68, // 5'8" - 5'11"
            'P': () => Math.floor(Math.random() * 4) + 70 // 5'10" - 6'1"
        };
        
        const heightInches = heights[position] ? heights[position]() : 70;
        const feet = Math.floor(heightInches / 12);
        const inches = heightInches % 12;
        
        return `${feet}'${inches}"`;
    }
    
    // Generate player weight based on position
    generatePlayerWeight(position) {
        const weights = {
            'QB': () => Math.floor(Math.random() * 40) + 200, // 200-240 lbs
            'RB': () => Math.floor(Math.random() * 40) + 180, // 180-220 lbs
            'WR1': () => Math.floor(Math.random() * 30) + 170, // 170-200 lbs
            'WR2': () => Math.floor(Math.random() * 30) + 170, // 170-200 lbs
            'TE': () => Math.floor(Math.random() * 40) + 240, // 240-280 lbs
            'LT': () => Math.floor(Math.random() * 50) + 300, // 300-350 lbs
            'LG': () => Math.floor(Math.random() * 40) + 290, // 290-330 lbs
            'C': () => Math.floor(Math.random() * 40) + 290, // 290-330 lbs
            'RG': () => Math.floor(Math.random() * 40) + 290, // 290-330 lbs
            'RT': () => Math.floor(Math.random() * 50) + 300, // 300-350 lbs
            'DE1': () => Math.floor(Math.random() * 40) + 250, // 250-290 lbs
            'DE2': () => Math.floor(Math.random() * 40) + 250, // 250-290 lbs
            'DT1': () => Math.floor(Math.random() * 50) + 280, // 280-330 lbs
            'DT2': () => Math.floor(Math.random() * 50) + 280, // 280-330 lbs
            'OLB1': () => Math.floor(Math.random() * 40) + 220, // 220-260 lbs
            'OLB2': () => Math.floor(Math.random() * 40) + 220, // 220-260 lbs
            'MLB': () => Math.floor(Math.random() * 40) + 230, // 230-270 lbs
            'CB1': () => Math.floor(Math.random() * 30) + 170, // 170-200 lbs
            'CB2': () => Math.floor(Math.random() * 30) + 170, // 170-200 lbs
            'SS': () => Math.floor(Math.random() * 30) + 190, // 190-220 lbs
            'FS': () => Math.floor(Math.random() * 30) + 190, // 190-220 lbs
            'K': () => Math.floor(Math.random() * 30) + 170, // 170-200 lbs
            'P': () => Math.floor(Math.random() * 30) + 180 // 180-210 lbs
        };
        
        const weight = weights[position] ? weights[position]() : 200;
        return `${weight} lbs`;
    }
}

// =============================================================================
// 🎯 GLOBAL NFL DATA INSTANCE
// =============================================================================

// Initialize global NFL data manager
const NFLData = new NFLDataManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NFLData, NFL_CONFIG, NFL_TEAMS };
} 