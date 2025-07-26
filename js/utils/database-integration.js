/**
 * Unified Database Integration for NBA Team Wheel
 * Ensures proper data loading and integration across all systems
 */

class UnifiedNBADatabase {
    constructor() {
        this.mainTeamsData = null;
        this.playerRatings = null;
        this.currentRosters = null;
        this.teamInfo = null;
        this.playerRatingLookup = null;
        this.initialized = false;
        this.teamNameMappings = {};
    }

    /**
     * Initialize all database components
     */
    async initialize() {
        try {
            console.log('🚀 Initializing Unified NBA Database...');

            // Load all data sources in parallel
            const [mainData, ratingsData, rostersData, teamInfoData] = await Promise.all([
                this.loadMainTeamsData(),
                this.loadPlayerRatings(),
                this.loadCurrentRosters(),
                this.loadTeamInfo()
            ]);

            this.mainTeamsData = mainData;
            this.playerRatings = ratingsData;
            this.currentRosters = rostersData;
            this.teamInfo = teamInfoData;

            // Create team name mappings to handle inconsistencies
            this.createTeamNameMappings();

            // Initialize player rating lookup
            if (typeof PlayerRatingLookup !== 'undefined') {
                this.playerRatingLookup = new PlayerRatingLookup();
                await this.playerRatingLookup.initialize();
            }

            this.initialized = true;
            console.log('✅ Unified NBA Database initialized successfully!');
            console.log(`📊 Loaded ${this.mainTeamsData.teams.length} teams from main database`);
            console.log(`⚔️ Loaded ${Object.keys(this.playerRatings.teams).length} teams with battle ratings`);
            console.log(`👥 Loaded ${Object.keys(this.currentRosters.rosters).length} team rosters`);

            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Unified NBA Database:', error);
            this.initialized = false;
            return false;
        }
    }

    /**
     * Load main teams data
     */
    async loadMainTeamsData() {
        const response = await fetch('database/nba/teams/nba_teams_data.json');
        if (!response.ok) throw new Error(`Failed to load main teams data: ${response.status}`);
        return await response.json();
    }

    /**
     * Load NBA 2K26 player ratings from unified data
     */
    async loadPlayerRatings() {
        const response = await fetch('database/nba/teams/nba_teams_data.json');
        if (!response.ok) throw new Error(`Failed to load player ratings: ${response.status}`);
        return await response.json();
    }

    /**
     * Load current NBA rosters
     */
    async loadCurrentRosters() {
        const response = await fetch('database/nba/players/rosters.json');
        if (!response.ok) throw new Error(`Failed to load rosters: ${response.status}`);
        return await response.json();
    }

    /**
     * Load team info database
     */
    async loadTeamInfo() {
        const response = await fetch('database/nba/teams/team-info.json');
        if (!response.ok) throw new Error(`Failed to load team info: ${response.status}`);
        return await response.json();
    }

    /**
     * Create mappings between different team name formats
     */
    createTeamNameMappings() {
        if (!this.mainTeamsData || !this.playerRatings) return;

        this.teamNameMappings = {};
        
        // Map from main teams data names to NBA 2K25 names
        this.mainTeamsData.teams.forEach(team => {
            const mainName = team.name;
            const abbrev = team.abbreviation;
            
            // Find matching team in ratings database
            const ratingTeamName = Object.keys(this.playerRatings.teams).find(name => {
                return name === mainName || 
                       name.includes(team.city) || 
                       name.includes(mainName.split(' ').pop()); // Last word match
            });

            if (ratingTeamName) {
                this.teamNameMappings[mainName] = ratingTeamName;
                this.teamNameMappings[abbrev] = ratingTeamName;
            }
        });

        console.log('🔗 Created team name mappings:', Object.keys(this.teamNameMappings).length, 'mappings');
    }

    /**
     * Get unified team data combining all sources
     * @param {string} teamIdentifier - Team name or abbreviation
     * @returns {Object} Complete team data
     */
    getUnifiedTeamData(teamIdentifier) {
        if (!this.initialized) {
            console.warn('⚠️ Database not initialized');
            return null;
        }

        // Find team in main data
        const mainTeam = this.mainTeamsData.teams.find(team => 
            team.name === teamIdentifier || 
            team.abbreviation === teamIdentifier
        );

        if (!mainTeam) {
            console.warn(`⚠️ Team not found: ${teamIdentifier}`);
            return null;
        }

        // Get ratings data
        const ratingsTeamName = this.teamNameMappings[mainTeam.name];
        const ratingsData = ratingsTeamName ? this.playerRatings.teams[ratingsTeamName] : null;

        // Get current roster data
        const rosterData = this.currentRosters.rosters[mainTeam.abbreviation];

        // Get team info
        const teamInfo = this.teamInfo.teams.find(team => 
            team.abbreviation === mainTeam.abbreviation
        );

        return {
            main: mainTeam,
            ratings: ratingsData,
            roster: rosterData,
            info: teamInfo,
            hasRatings: !!ratingsData,
            hasRoster: !!rosterData
        };
    }

    /**
     * Get player rating with fallback system
     * @param {string} playerName - Player name
     * @param {string} teamIdentifier - Team name or abbreviation  
     * @param {string} position - Player position
     * @returns {Object} Player rating data
     */
    getPlayerRatingWithFallback(playerName, teamIdentifier = null, position = null) {
        // Try to get from NBA 2K25 database first
        if (this.playerRatingLookup && this.playerRatingLookup.initialized) {
            const rating = this.playerRatingLookup.getPlayerRating(playerName);
            if (rating) {
                return rating;
            }
        }

        // Fallback: Try direct lookup in ratings data
        if (teamIdentifier && this.playerRatings) {
            const unifiedTeam = this.getUnifiedTeamData(teamIdentifier);
            if (unifiedTeam && unifiedTeam.ratings) {
                const player = unifiedTeam.ratings.players.find(p => 
                    p.name.toLowerCase() === playerName.toLowerCase()
                );
                if (player) {
                    return {
                        name: player.name,
                        overall: player.overall,
                        position: player.position,
                        team: teamIdentifier,
                        tier: this.getRatingTier(player.overall)
                    };
                }
            }
        }

        // Final fallback: Generate reasonable rating based on position
        const fallbackRating = this.generateFallbackRating(position);
        console.log(`🔄 Using fallback rating for ${playerName}: ${fallbackRating}`);
        
        return {
            name: playerName,
            overall: fallbackRating,
            position: position || 'Unknown',
            team: teamIdentifier || 'Unknown',
            tier: this.getRatingTier(fallbackRating),
            isFallback: true
        };
    }

    /**
     * Generate reasonable fallback rating based on position
     * @param {string} position - Player position
     * @returns {number} Rating between 70-85
     */
    generateFallbackRating(position) {
        const positionRatings = {
            'Point Guard': 78,
            'Shooting Guard': 76,
            'Small Forward': 77,
            'Power Forward': 75,
            'Center': 74,
            'Head Coach': 80
        };

        const baseRating = positionRatings[position] || 76;
        // Add some randomness (+/- 5 points)
        return baseRating + Math.floor(Math.random() * 11) - 5;
    }

    /**
     * Get rating tier from overall rating
     * @param {number} overall - Overall rating
     * @returns {string} Rating tier
     */
    getRatingTier(overall) {
        if (overall >= 95) return 'Superstar';
        if (overall >= 90) return 'All-Star';
        if (overall >= 85) return 'Starter';
        if (overall >= 80) return 'Role Player';
        if (overall >= 75) return 'Bench';
        if (overall >= 70) return 'Reserve';
        return 'Development';
    }

    /**
     * Get all teams with their unified data
     * @returns {Array} Array of unified team data
     */
    getAllTeamsWithData() {
        if (!this.initialized) return [];

        return this.mainTeamsData.teams.map(team => 
            this.getUnifiedTeamData(team.name)
        ).filter(team => team !== null);
    }

    /**
     * Validate database integrity
     * @returns {Object} Validation results
     */
    validateDatabaseIntegrity() {
        const results = {
            mainTeamsCount: this.mainTeamsData ? this.mainTeamsData.teams.length : 0,
            ratingsTeamsCount: this.playerRatings ? Object.keys(this.playerRatings.teams).length : 0,
            rostersTeamsCount: this.currentRosters ? Object.keys(this.currentRosters.rosters).length : 0,
            mappingsCount: Object.keys(this.teamNameMappings).length,
            missingRatings: [],
            isComplete: false
        };

        if (this.mainTeamsData && this.playerRatings) {
            // Check which teams are missing ratings
            this.mainTeamsData.teams.forEach(team => {
                const hasRatings = !!this.teamNameMappings[team.name];
                if (!hasRatings) {
                    results.missingRatings.push(team.name);
                }
            });

            results.isComplete = results.missingRatings.length === 0;
        }

        return results;
    }
}

// Global instance
window.UnifiedNBADatabase = UnifiedNBADatabase;

// Auto-initialize when included
if (typeof window !== 'undefined') {
    window.unifiedNBADB = new UnifiedNBADatabase();
} 