/**
 * NBA 2K Official Data Integration
 * Connects 2kratings.com data with our existing database system
 */

class NBA2KOfficialIntegration {
    constructor() {
        this.officialData = {};
        this.loadedTeams = 0;
        this.totalTeams = 30;
        this.initialized = false;
    }

    /**
     * Initialize the NBA 2K official data integration
     */
    async initialize() {
        try {
            console.log('🔗 Initializing NBA 2K Official Data Integration...');
            
            // Load all available team files
            await this.loadAllTeamData();
            
            this.initialized = true;
            console.log(`✅ NBA 2K Official Integration initialized with ${this.loadedTeams}/${this.totalTeams} teams`);
            
            return true;
        } catch (error) {
            console.error('❌ Error initializing NBA 2K Official Integration:', error);
            this.initialized = false;
            return false;
        }
    }

    /**
     * Load all team data from NBA 2K official files
     */
    async loadAllTeamData() {
        const teamFiles = [
            'atlanta-hawks.json',
            'boston-celtics.json',
            'brooklyn-nets.json',
            'charlotte-hornets.json',
            'chicago-bulls.json',
            'cleveland-cavaliers.json',
            'dallas-mavericks.json',
            'denver-nuggets.json',
            'detroit-pistons.json',
            'golden-state-warriors.json',
            'houston-rockets.json',
            'indiana-pacers.json',
            'la-clippers.json',
            'los-angeles-lakers.json',
            'memphis-grizzlies.json',
            'miami-heat.json',
            'milwaukee-bucks.json',
            'minnesota-timberwolves.json',
            'new-orleans-pelicans.json',
            'new-york-knicks.json',
            'oklahoma-city-thunder.json',
            'orlando-magic.json',
            'philadelphia-76ers.json',
            'phoenix-suns.json',
            'portland-trail-blazers.json',
            'sacramento-kings.json',
            'san-antonio-spurs.json',
            'toronto-raptors.json',
            'utah-jazz.json',
            'washington-wizards.json'
        ];

        for (const teamFile of teamFiles) {
            try {
                const response = await fetch(`data/nba2k-official/teams/${teamFile}`);
                if (response.ok) {
                    const teamData = await response.json();
                    this.officialData[teamData.team.name] = teamData;
                    this.loadedTeams++;
                    console.log(`✅ Loaded ${teamData.team.name} (${teamData.roster.length} players)`);
                } else {
                    console.log(`⚠️ Team file not found: ${teamFile}`);
                }
            } catch (error) {
                console.warn(`⚠️ Error loading ${teamFile}:`, error);
            }
        }
    }

    /**
     * Get enhanced player rating using NBA 2K official data
     * @param {string} playerName - Player name
     * @param {string} teamName - Team name
     * @returns {Object} Enhanced player rating data
     */
    getEnhancedPlayerRating(playerName, teamName = null) {
        if (!this.initialized) {
            console.warn('⚠️ NBA 2K Official Integration not initialized');
            return null;
        }

        // Search by team first if provided
        if (teamName && this.officialData[teamName]) {
            const player = this.findPlayerInTeam(playerName, this.officialData[teamName]);
            if (player) return this.formatPlayerData(player, teamName);
        }

        // Search across all teams
        for (const [team, teamData] of Object.entries(this.officialData)) {
            const player = this.findPlayerInTeam(playerName, teamData);
            if (player) return this.formatPlayerData(player, team);
        }

        return null;
    }

    /**
     * Find player in team data
     * @param {string} playerName - Player name to search for
     * @param {Object} teamData - Team data object
     * @returns {Object|null} Player data if found
     */
    findPlayerInTeam(playerName, teamData) {
        return teamData.roster.find(player => 
            player.name.toLowerCase() === playerName.toLowerCase() ||
            player.name.toLowerCase().includes(playerName.toLowerCase()) ||
            playerName.toLowerCase().includes(player.name.toLowerCase())
        );
    }

    /**
     * Format player data for use in battle system
     * @param {Object} player - Player data from NBA 2K files
     * @param {string} teamName - Team name
     * @returns {Object} Formatted player data
     */
    formatPlayerData(player, teamName) {
        return {
            name: player.name,
            overall: player.ratings.overall,
            position: player.position,
            team: teamName,
            tier: this.getRatingTier(player.ratings.overall),
            enhanced_data: {
                three_point: player.ratings.three_point,
                dunk: player.ratings.dunk,
                height: player.height,
                nationality: player.nationality,
                player_type: player.player_type,
                archetype: player.archetype,
                jersey_number: player.jersey_number
            },
            source: 'NBA2K_Official'
        };
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
     * Get all players from a team with NBA 2K official data
     * @param {string} teamName - Team name
     * @returns {Array} Array of enhanced player data
     */
    getTeamRoster(teamName) {
        if (!this.initialized || !this.officialData[teamName]) {
            return [];
        }

        return this.officialData[teamName].roster.map(player => 
            this.formatPlayerData(player, teamName)
        );
    }

    /**
     * Get team statistics from NBA 2K official data
     * @param {string} teamName - Team name
     * @returns {Object} Team statistics
     */
    getTeamStats(teamName) {
        if (!this.initialized || !this.officialData[teamName]) {
            return null;
        }

        return this.officialData[teamName].team_stats;
    }

    /**
     * Compare teams using NBA 2K official data
     * @param {string} team1Name - First team name
     * @param {string} team2Name - Second team name
     * @returns {Object} Team comparison data
     */
    compareTeams(team1Name, team2Name) {
        const team1Stats = this.getTeamStats(team1Name);
        const team2Stats = this.getTeamStats(team2Name);

        if (!team1Stats || !team2Stats) {
            return null;
        }

        return {
            team1: {
                name: team1Name,
                stats: team1Stats
            },
            team2: {
                name: team2Name,
                stats: team2Stats
            },
            comparison: {
                average_rating_difference: team1Stats.average_overall - team2Stats.average_overall,
                predicted_winner: team1Stats.average_overall > team2Stats.average_overall ? team1Name : team2Name,
                competitiveness: Math.abs(team1Stats.average_overall - team2Stats.average_overall) < 5 ? 'Very Competitive' : 'Clear Favorite'
            }
        };
    }

    /**
     * Get top players across all teams
     * @param {number} limit - Number of top players to return
     * @returns {Array} Top players by overall rating
     */
    getTopPlayers(limit = 10) {
        if (!this.initialized) return [];

        const allPlayers = [];
        
        for (const [teamName, teamData] of Object.entries(this.officialData)) {
            teamData.roster.forEach(player => {
                allPlayers.push(this.formatPlayerData(player, teamName));
            });
        }

        return allPlayers
            .sort((a, b) => b.overall - a.overall)
            .slice(0, limit);
    }

    /**
     * Search players by name across all teams
     * @param {string} searchTerm - Search term
     * @param {number} limit - Maximum results to return
     * @returns {Array} Matching players
     */
    searchPlayers(searchTerm, limit = 20) {
        if (!this.initialized) return [];

        const results = [];
        const searchLower = searchTerm.toLowerCase();

        for (const [teamName, teamData] of Object.entries(this.officialData)) {
            teamData.roster.forEach(player => {
                if (player.name.toLowerCase().includes(searchLower)) {
                    results.push(this.formatPlayerData(player, teamName));
                }
            });
        }

        return results
            .sort((a, b) => b.overall - a.overall)
            .slice(0, limit);
    }

    /**
     * Get validation report on data coverage
     * @returns {Object} Validation report
     */
    getValidationReport() {
        return {
            teams_loaded: this.loadedTeams,
            total_teams: this.totalTeams,
            coverage_percentage: Math.round((this.loadedTeams / this.totalTeams) * 100),
            teams_available: Object.keys(this.officialData),
            total_players: Object.values(this.officialData).reduce((sum, team) => sum + team.roster.length, 0),
            is_complete: this.loadedTeams === this.totalTeams,
            recommendations: this.generateRecommendations()
        };
    }

    /**
     * Generate recommendations for data improvement
     * @returns {Array} Recommendations
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (this.loadedTeams < this.totalTeams) {
            recommendations.push(`Collect data for ${this.totalTeams - this.loadedTeams} remaining teams`);
        }
        
        if (this.loadedTeams === 0) {
            recommendations.push('Start data collection using the browser script on 2kratings.com');
        }
        
        if (this.loadedTeams > 0 && this.loadedTeams < 30) {
            recommendations.push('Continue systematic collection for all 30 NBA teams');
        }
        
        if (this.loadedTeams === 30) {
            recommendations.push('Data collection complete! Consider setting up regular updates');
        }

        return recommendations;
    }
}

// Global instance for use throughout the application
if (typeof window !== 'undefined') {
    window.NBA2KOfficialIntegration = NBA2KOfficialIntegration;
    window.nba2kOfficial = new NBA2KOfficialIntegration();
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NBA2KOfficialIntegration;
} 