/**
 * Universal Sports Database Lookup System
 * Works across NBA, NFL, and MLB
 * 
 * Simple Functions for George & Frankie:
 * - getTeamInfo(league, teamId) → Get team details
 * - getPlayerRating(league, playerName) → Get player rating
 * - getTeamRoster(league, teamId) → Get team's players
 * - searchTeams(league, query) → Find teams by name
 * - getAllTeams(league) → Get all teams in a league
 */

class UniversalSportsLookup {
    constructor() {
        this.leagues = {
            'NBA': {
                dataPath: 'database/nba/',
                playerRatings: null,
                teamInfo: null,
                rosters: null
            },
            'NFL': {
                dataPath: 'database/nfl/',
                playerRatings: null,
                teamInfo: null,
                rosters: null
            },
            'MLB': {
                dataPath: 'database/mlb/',
                playerRatings: null,
                teamInfo: null,
                rosters: null
            }
        };
        
        this.initialized = false;
    }

    /**
     * Initialize the database system
     * Loads all necessary data files
     */
    async initialize() {
        try {
            // Load NBA data (currently available)
            await this.loadLeagueData('NBA');
            
            // NFL and MLB will be loaded when data is available
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Failed to initialize Universal Sports Lookup:', error);
            return false;
        }
    }

    /**
     * Load data for a specific league
     * @param {string} league - 'NBA', 'NFL', or 'MLB'
     */
    async loadLeagueData(league) {
        if (!this.leagues[league]) {
            throw new Error(`Unknown league: ${league}`);
        }

        const leagueData = this.leagues[league];
        
        try {
            // Load team information
            const teamInfoPath = `${leagueData.dataPath}teams/team-info.json`;
            const teamResponse = await fetch(teamInfoPath);
            leagueData.teamInfo = await teamResponse.json();

            // Load player ratings if available
            if (league === 'NBA') {
                const ratingsPath = `${leagueData.dataPath}teams/nba_teams_data.json`;
                const ratingsResponse = await fetch(ratingsPath);
                leagueData.playerRatings = await ratingsResponse.json();

                // Load rosters
                const rostersPath = `${leagueData.dataPath}players/rosters.json`;
                const rostersResponse = await fetch(rostersPath);
                leagueData.rosters = await rostersResponse.json();
            }

            return true;
        } catch (error) {
            console.warn(`Could not load all data for ${league}:`, error);
            return false;
        }
    }

    /**
     * Get team information
     * @param {string} league - 'NBA', 'NFL', or 'MLB'
     * @param {string} teamId - Team ID (e.g., 'LAL', 'BOS')
     * @returns {object} Team information
     */
    getTeamInfo(league, teamId) {
        if (!this.leagues[league] || !this.leagues[league].teamInfo) {
            return null;
        }

        const teams = this.leagues[league].teamInfo.teams;
        return teams.find(team => team.id === teamId || team.abbreviation === teamId);
    }

    /**
     * Get all teams in a league
     * @param {string} league - 'NBA', 'NFL', or 'MLB'
     * @returns {array} Array of team objects
     */
    getAllTeams(league) {
        if (!this.leagues[league] || !this.leagues[league].teamInfo) {
            return [];
        }

        return this.leagues[league].teamInfo.teams;
    }

    /**
     * Search teams by name
     * @param {string} league - 'NBA', 'NFL', or 'MLB'
     * @param {string} query - Search query
     * @returns {array} Array of matching teams
     */
    searchTeams(league, query) {
        const teams = this.getAllTeams(league);
        const searchTerm = query.toLowerCase();
        
        return teams.filter(team => 
            team.name.toLowerCase().includes(searchTerm) ||
            team.city.toLowerCase().includes(searchTerm) ||
            team.abbreviation.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Get player rating (NBA only for now)
     * @param {string} league - Currently only 'NBA'
     * @param {string} playerName - Player's name
     * @returns {object} Player rating information
     */
    getPlayerRating(league, playerName) {
        if (league !== 'NBA' || !this.leagues.NBA.playerRatings) {
            return null;
        }

        const players = this.leagues.NBA.playerRatings.players;
        return players.find(player => 
            player.name.toLowerCase() === playerName.toLowerCase()
        );
    }

    /**
     * Get team roster
     * @param {string} league - Currently only 'NBA'
     * @param {string} teamId - Team ID
     * @returns {object} Team roster information
     */
    getTeamRoster(league, teamId) {
        if (league !== 'NBA' || !this.leagues.NBA.rosters) {
            return null;
        }

        return this.leagues.NBA.rosters.rosters[teamId];
    }

    /**
     * Get players by team
     * @param {string} league - Currently only 'NBA'
     * @param {string} teamId - Team ID
     * @returns {array} Array of player objects with ratings
     */
    getTeamPlayers(league, teamId) {
        if (league !== 'NBA') {
            return [];
        }

        const roster = this.getTeamRoster(league, teamId);
        if (!roster) return [];

        const allPlayers = [...roster.starters, ...roster.bench];
        const playersWithRatings = [];

        allPlayers.forEach(playerName => {
            const playerRating = this.getPlayerRating(league, playerName);
            if (playerRating) {
                playersWithRatings.push({
                    name: playerName,
                    rating: playerRating.overall,
                    position: playerRating.position,
                    team: teamId
                });
            }
        });

        return playersWithRatings;
    }

    /**
     * Get league statistics
     * @param {string} league - 'NBA', 'NFL', or 'MLB'
     * @returns {object} League statistics
     */
    getLeagueStats(league) {
        if (!this.leagues[league] || !this.leagues[league].teamInfo) {
            return null;
        }

        const leagueData = this.leagues[league];
        const teamInfo = leagueData.teamInfo;
        
        return {
            totalTeams: teamInfo.teams.length,
            divisions: Object.keys(teamInfo.conferences || teamInfo.leagues || {}).length,
            lastUpdated: teamInfo.metadata.lastUpdated,
            hasPlayerRatings: !!leagueData.playerRatings,
            hasRosters: !!leagueData.rosters
        };
    }
}

// Create global instance
const UniversalLookup = new UniversalSportsLookup();

/**
 * Simple functions for easy use
 */

// Team Functions
function getTeamInfo(league, teamId) {
    return UniversalLookup.getTeamInfo(league, teamId);
}

function getAllTeams(league) {
    return UniversalLookup.getAllTeams(league);
}

function searchTeams(league, query) {
    return UniversalLookup.searchTeams(league, query);
}

// Player Functions (NBA only for now)
function getPlayerRating(league, playerName) {
    return UniversalLookup.getPlayerRating(league, playerName);
}

function getTeamRoster(league, teamId) {
    return UniversalLookup.getTeamRoster(league, teamId);
}

function getTeamPlayers(league, teamId) {
    return UniversalLookup.getTeamPlayers(league, teamId);
}

// League Functions
function getLeagueStats(league) {
    return UniversalLookup.getLeagueStats(league);
}

function getSupportedLeagues() {
    return ['NBA', 'NFL', 'MLB'];
}

// Initialize when loaded
UniversalLookup.initialize().then(success => {
    if (success) {
        console.log('Universal Sports Database initialized successfully');
    } else {
        console.warn('Universal Sports Database initialization had issues');
    }
});

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UniversalSportsLookup,
        getTeamInfo,
        getAllTeams,
        searchTeams,
        getPlayerRating,
        getTeamRoster,
        getTeamPlayers,
        getLeagueStats,
        getSupportedLeagues
    };
} 