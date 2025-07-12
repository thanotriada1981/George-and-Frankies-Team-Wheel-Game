/**
 * Current NBA Rosters Integration System
 * Connects ESPN current roster data with our existing database
 */

class CurrentRostersIntegration {
    constructor() {
        this.currentRosters = {};
        this.loadedTeams = 0;
        this.totalTeams = 30;
        this.initialized = false;
    }

    /**
     * Initialize the current rosters integration
     */
    async initialize() {
        try {
            console.log('📊 Initializing Current NBA Rosters Integration...');
            
            await this.loadAllCurrentRosters();
            
            this.initialized = true;
            console.log(`✅ Current Rosters Integration initialized with ${this.loadedTeams}/${this.totalTeams} teams`);
            
            return true;
        } catch (error) {
            console.error('❌ Error initializing Current Rosters Integration:', error);
            this.initialized = false;
            return false;
        }
    }

    /**
     * Load all current roster files
     */
    async loadAllCurrentRosters() {
        const teamFiles = [
            'atlanta-hawks-current.json',
            'boston-celtics-current.json',
            'brooklyn-nets-current.json',
            'charlotte-hornets-current.json',
            'chicago-bulls-current.json',
            'cleveland-cavaliers-current.json',
            'dallas-mavericks-current.json',
            'denver-nuggets-current.json',
            'detroit-pistons-current.json',
            'golden-state-warriors-current.json',
            'houston-rockets-current.json',
            'indiana-pacers-current.json',
            'la-clippers-current.json',
            'los-angeles-lakers-current.json',
            'memphis-grizzlies-current.json',
            'miami-heat-current.json',
            'milwaukee-bucks-current.json',
            'minnesota-timberwolves-current.json',
            'new-orleans-pelicans-current.json',
            'new-york-knicks-current.json',
            'oklahoma-city-thunder-current.json',
            'orlando-magic-current.json',
            'philadelphia-76ers-current.json',
            'phoenix-suns-current.json',
            'portland-trail-blazers-current.json',
            'sacramento-kings-current.json',
            'san-antonio-spurs-current.json',
            'toronto-raptors-current.json',
            'utah-jazz-current.json',
            'washington-wizards-current.json'
        ];

        for (const teamFile of teamFiles) {
            try {
                const response = await fetch(`data/current-rosters/teams/${teamFile}`);
                if (response.ok) {
                    const teamData = await response.json();
                    this.currentRosters[teamData.team.name] = teamData;
                    this.loadedTeams++;
                    console.log(`✅ Loaded current roster: ${teamData.team.name} (${teamData.roster.length} players)`);
                } else {
                    console.log(`⚠️ Current roster not found: ${teamFile}`);
                }
            } catch (error) {
                console.warn(`⚠️ Error loading current roster ${teamFile}:`, error);
            }
        }
    }

    /**
     * Get current roster for a team
     * @param {string} teamName - Team name
     * @returns {Array} Current roster data
     */
    getCurrentRoster(teamName) {
        if (!this.initialized) {
            console.warn('⚠️ Current Rosters Integration not initialized');
            return [];
        }

        const teamData = this.currentRosters[teamName];
        if (!teamData) {
            console.warn(`⚠️ No current roster found for: ${teamName}`);
            return [];
        }

        return teamData.roster.map(player => ({
            name: player.name,
            position: player.position,
            jersey_number: player.jersey_number,
            status: player.status,
            years_pro: player.years_pro,
            college: player.college,
            roster_status: player.roster_status,
            team: teamName,
            current_team: true
        }));
    }

    /**
     * Get starting lineup for a team
     * @param {string} teamName - Team name
     * @returns {Array} Starting lineup players
     */
    getStartingLineup(teamName) {
        const roster = this.getCurrentRoster(teamName);
        return roster.filter(player => player.roster_status === 'Starter');
    }

    /**
     * Get bench players for a team
     * @param {string} teamName - Team name
     * @returns {Array} Bench players
     */
    getBenchPlayers(teamName) {
        const roster = this.getCurrentRoster(teamName);
        return roster.filter(player => player.roster_status === 'Bench');
    }

    /**
     * Search for a player across all current rosters
     * @param {string} playerName - Player name to search for
     * @returns {Object|null} Player data with current team
     */
    findPlayerCurrentTeam(playerName) {
        if (!this.initialized) return null;

        for (const [teamName, teamData] of Object.entries(this.currentRosters)) {
            const player = teamData.roster.find(p => 
                p.name.toLowerCase() === playerName.toLowerCase() ||
                p.name.toLowerCase().includes(playerName.toLowerCase())
            );
            
            if (player) {
                return {
                    ...player,
                    current_team: teamName,
                    team_abbreviation: teamData.team.abbreviation
                };
            }
        }

        return null;
    }

    /**
     * Check if a player has changed teams
     * @param {string} playerName - Player name
     * @param {string} oldTeamName - Previous team name
     * @returns {Object} Change information
     */
    checkPlayerTeamChange(playerName, oldTeamName) {
        const currentData = this.findPlayerCurrentTeam(playerName);
        
        if (!currentData) {
            return {
                player: playerName,
                found: false,
                changed: false,
                old_team: oldTeamName,
                current_team: null,
                status: 'Not found in current rosters'
            };
        }

        const hasChanged = currentData.current_team !== oldTeamName;
        
        return {
            player: playerName,
            found: true,
            changed: hasChanged,
            old_team: oldTeamName,
            current_team: currentData.current_team,
            status: hasChanged ? 'Team changed' : 'Same team',
            player_data: currentData
        };
    }

    /**
     * Get roster comparison between old and current data
     * @param {string} teamName - Team name
     * @param {Array} oldRoster - Previous roster data
     * @returns {Object} Roster comparison
     */
    compareRosters(teamName, oldRoster) {
        const currentRoster = this.getCurrentRoster(teamName);
        
        const currentPlayerNames = currentRoster.map(p => p.name.toLowerCase());
        const oldPlayerNames = oldRoster.map(p => p.name.toLowerCase());
        
        const additions = currentRoster.filter(p => 
            !oldPlayerNames.includes(p.name.toLowerCase())
        );
        
        const departures = oldRoster.filter(p => 
            !currentPlayerNames.includes(p.name.toLowerCase())
        );
        
        const retained = currentRoster.filter(p => 
            oldPlayerNames.includes(p.name.toLowerCase())
        );

        return {
            team: teamName,
            current_total: currentRoster.length,
            old_total: oldRoster.length,
            additions: additions,
            departures: departures,
            retained: retained,
            roster_turnover: Math.round((additions.length / Math.max(oldRoster.length, 1)) * 100)
        };
    }

    /**
     * Get team roster statistics
     * @param {string} teamName - Team name
     * @returns {Object} Roster statistics
     */
    getTeamRosterStats(teamName) {
        if (!this.currentRosters[teamName]) return null;

        const teamData = this.currentRosters[teamName];
        const roster = teamData.roster;
        
        // Calculate experience distribution
        const experienceRanges = {
            rookie: roster.filter(p => p.years_pro === 0).length,
            young: roster.filter(p => p.years_pro >= 1 && p.years_pro <= 3).length,
            prime: roster.filter(p => p.years_pro >= 4 && p.years_pro <= 10).length,
            veteran: roster.filter(p => p.years_pro > 10).length
        };

        // Position distribution
        const positions = {};
        roster.forEach(player => {
            positions[player.position] = (positions[player.position] || 0) + 1;
        });

        return {
            ...teamData.roster_stats,
            experience_distribution: experienceRanges,
            position_distribution: positions,
            average_experience: Math.round(
                roster.reduce((sum, p) => sum + (p.years_pro || 0), 0) / roster.length
            )
        };
    }

    /**
     * Get all teams that need roster updates
     * @returns {Array} Teams missing current roster data
     */
    getTeamsNeedingUpdates() {
        const allTeamNames = [
            'Atlanta Hawks', 'Boston Celtics', 'Brooklyn Nets', 'Charlotte Hornets',
            'Chicago Bulls', 'Cleveland Cavaliers', 'Dallas Mavericks', 'Denver Nuggets',
            'Detroit Pistons', 'Golden State Warriors', 'Houston Rockets', 'Indiana Pacers',
            'LA Clippers', 'Los Angeles Lakers', 'Memphis Grizzlies', 'Miami Heat',
            'Milwaukee Bucks', 'Minnesota Timberwolves', 'New Orleans Pelicans', 'New York Knicks',
            'Oklahoma City Thunder', 'Orlando Magic', 'Philadelphia 76ers', 'Phoenix Suns',
            'Portland Trail Blazers', 'Sacramento Kings', 'San Antonio Spurs', 'Toronto Raptors',
            'Utah Jazz', 'Washington Wizards'
        ];

        return allTeamNames.filter(teamName => !this.currentRosters[teamName]);
    }

    /**
     * Get validation report
     * @returns {Object} Current roster collection status
     */
    getValidationReport() {
        const needingUpdates = this.getTeamsNeedingUpdates();
        
        return {
            teams_collected: this.loadedTeams,
            total_teams: this.totalTeams,
            coverage_percentage: Math.round((this.loadedTeams / this.totalTeams) * 100),
            teams_available: Object.keys(this.currentRosters),
            teams_needing_collection: needingUpdates,
            total_players: Object.values(this.currentRosters).reduce((sum, team) => sum + team.roster.length, 0),
            is_complete: this.loadedTeams === this.totalTeams,
            priority_teams_missing: needingUpdates.filter(team => 
                ['Los Angeles Lakers', 'Golden State Warriors', 'Boston Celtics', 
                 'Miami Heat', 'Dallas Mavericks'].includes(team)
            ),
            recommendations: this.generateCollectionRecommendations()
        };
    }

    /**
     * Generate recommendations for roster collection
     * @returns {Array} Collection recommendations
     */
    generateCollectionRecommendations() {
        const recommendations = [];
        const needingUpdates = this.getTeamsNeedingUpdates();
        
        if (needingUpdates.length === 30) {
            recommendations.push('Start with high-priority teams: Lakers, Warriors, Celtics');
            recommendations.push('Use ESPN NBA players page with browser collection script');
        } else if (needingUpdates.length > 20) {
            recommendations.push('Continue systematic collection - good progress!');
            recommendations.push('Focus on competitive teams next');
        } else if (needingUpdates.length > 10) {
            recommendations.push('Over halfway done - keep going!');
            recommendations.push('Verify existing data is still current');
        } else if (needingUpdates.length > 0) {
            recommendations.push(`Only ${needingUpdates.length} teams remaining!`);
            recommendations.push('Complete collection for full database');
        } else {
            recommendations.push('Collection complete! Set up regular maintenance');
            recommendations.push('Monitor trades and roster changes');
        }

        return recommendations;
    }
}

// Global instance
if (typeof window !== 'undefined') {
    window.CurrentRostersIntegration = CurrentRostersIntegration;
    window.currentRosters = new CurrentRostersIntegration();
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CurrentRostersIntegration;
} 