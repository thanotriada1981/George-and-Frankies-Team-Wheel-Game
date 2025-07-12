/**
 * NBA Team Wheel - Data Framework
 * For George and Frankie!
 * 
 * This file handles all NBA data retrieval, parsing, and storage
 * using the Ball Don't Lie API (https://balldontlie.io/)
 */

// =============================================================================
// 🏀 NBA DATA FRAMEWORK CONFIGURATION
// =============================================================================

const NBA_CONFIG = {
    // Ball Don't Lie API - Free NBA Data
    API_BASE_URL: 'https://api.balldontlie.io/v1',
    
    // Data refresh settings
    DATA_REFRESH_HOURS: 24, // Refresh roster data every 24 hours
    
    // Storage keys for local data
    STORAGE_KEYS: {
        TEAMS: 'nba_teams_data',
        PLAYERS: 'nba_players_data',
        ROSTERS: 'nba_rosters_data',
        LAST_UPDATE: 'nba_last_update'
    }
};

// =============================================================================
// 🔄 DATA RETRIEVAL FUNCTIONS
// =============================================================================

/**
 * Get all NBA teams from the API
 */
async function fetchAllTeams() {
    try {
        console.log('🏀 Fetching NBA teams...');
        const response = await fetch(`${NBA_CONFIG.API_BASE_URL}/teams`);
        const data = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
            console.log(`✅ Successfully fetched ${data.data.length} teams`);
            return data.data;
        } else {
            throw new Error('Invalid teams data format');
        }
    } catch (error) {
        console.error('❌ Error fetching teams:', error);
        return [];
    }
}

/**
 * Get all NBA players from the API
 */
async function fetchAllPlayers() {
    try {
        console.log('🏀 Fetching NBA players...');
        const allPlayers = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
            const response = await fetch(`${NBA_CONFIG.API_BASE_URL}/players?page=${page}&per_page=100`);
            const data = await response.json();
            
            if (data.data && Array.isArray(data.data)) {
                allPlayers.push(...data.data);
                
                // Check if there are more pages
                hasMore = data.meta && data.meta.next_page !== null;
                page++;
                
                console.log(`📄 Fetched page ${page - 1}, total players: ${allPlayers.length}`);
            } else {
                hasMore = false;
            }
        }
        
        console.log(`✅ Successfully fetched ${allPlayers.length} players`);
        return allPlayers;
    } catch (error) {
        console.error('❌ Error fetching players:', error);
        return [];
    }
}

// =============================================================================
// 📝 DATA PARSING FUNCTIONS
// =============================================================================

/**
 * Parse team data into a clean format
 */
function parseTeamData(teams) {
    return teams.map(team => ({
        id: team.id,
        name: team.name,
        full_name: team.full_name,
        abbreviation: team.abbreviation,
        city: team.city,
        conference: team.conference,
        division: team.division
    }));
}

/**
 * Parse player data into a clean format
 */
function parsePlayerData(players) {
    return players.map(player => ({
        id: player.id,
        first_name: player.first_name,
        last_name: player.last_name,
        full_name: `${player.first_name} ${player.last_name}`,
        position: player.position,
        height: player.height_feet ? `${player.height_feet}'${player.height_inches}"` : 'N/A',
        weight: player.weight_pounds ? `${player.weight_pounds} lbs` : 'N/A',
        team: player.team ? {
            id: player.team.id,
            name: player.team.name,
            abbreviation: player.team.abbreviation,
            city: player.team.city
        } : null
    }));
}

/**
 * Create roster data by organizing players by team
 */
function createRosterData(teams, players) {
    const rosters = {};
    
    // Initialize rosters for each team
    teams.forEach(team => {
        rosters[team.id] = {
            team: team,
            players: []
        };
    });
    
    // Add players to their team rosters
    players.forEach(player => {
        if (player.team && rosters[player.team.id]) {
            rosters[player.team.id].players.push(player);
        }
    });
    
    return rosters;
}

// =============================================================================
// 💾 DATA STORAGE FUNCTIONS
// =============================================================================

/**
 * Save data to localStorage
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`💾 Saved ${key} to storage`);
    } catch (error) {
        console.error(`❌ Error saving ${key}:`, error);
    }
}

/**
 * Load data from localStorage
 */
function loadFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`❌ Error loading ${key}:`, error);
        return null;
    }
}

/**
 * Check if data needs to be refreshed
 */
function needsDataRefresh() {
    const lastUpdate = loadFromStorage(NBA_CONFIG.STORAGE_KEYS.LAST_UPDATE);
    
    if (!lastUpdate) {
        return true; // No data exists
    }
    
    const now = new Date();
    const lastUpdateTime = new Date(lastUpdate);
    const hoursDiff = (now - lastUpdateTime) / (1000 * 60 * 60);
    
    return hoursDiff >= NBA_CONFIG.DATA_REFRESH_HOURS;
}

// =============================================================================
// 🎯 MAIN DATA MANAGEMENT FUNCTIONS
// =============================================================================

/**
 * Initialize NBA data - Main function to get all data
 */
async function initializeNBAData() {
    console.log('🚀 Initializing NBA data...');
    
    // Check if we need to refresh data
    if (!needsDataRefresh()) {
        console.log('✅ Using cached data (still fresh)');
        return {
            teams: loadFromStorage(NBA_CONFIG.STORAGE_KEYS.TEAMS),
            players: loadFromStorage(NBA_CONFIG.STORAGE_KEYS.PLAYERS),
            rosters: loadFromStorage(NBA_CONFIG.STORAGE_KEYS.ROSTERS)
        };
    }
    
    // Fetch fresh data
    console.log('🔄 Fetching fresh data from API...');
    const rawTeams = await fetchAllTeams();
    const rawPlayers = await fetchAllPlayers();
    
    // Parse the data
    const teams = parseTeamData(rawTeams);
    const players = parsePlayerData(rawPlayers);
    const rosters = createRosterData(teams, players);
    
    // Save to storage
    saveToStorage(NBA_CONFIG.STORAGE_KEYS.TEAMS, teams);
    saveToStorage(NBA_CONFIG.STORAGE_KEYS.PLAYERS, players);
    saveToStorage(NBA_CONFIG.STORAGE_KEYS.ROSTERS, rosters);
    saveToStorage(NBA_CONFIG.STORAGE_KEYS.LAST_UPDATE, new Date().toISOString());
    
    console.log('✅ NBA data initialized successfully!');
    console.log(`📊 Total teams: ${teams.length}`);
    console.log(`📊 Total players: ${players.length}`);
    
    return { teams, players, rosters };
}

/**
 * Get roster for a specific team
 */
function getTeamRoster(teamId) {
    const rosters = loadFromStorage(NBA_CONFIG.STORAGE_KEYS.ROSTERS);
    return rosters ? rosters[teamId] : null;
}

/**
 * Get random player from a team
 */
function getRandomPlayerFromTeam(teamId) {
    const roster = getTeamRoster(teamId);
    
    if (!roster || !roster.players || roster.players.length === 0) {
        return null;
    }
    
    const randomIndex = Math.floor(Math.random() * roster.players.length);
    return roster.players[randomIndex];
}

/**
 * Get player stats (placeholder for future expansion)
 */
function getPlayerStats(playerId) {
    // This function will be expanded later to get player statistics
    // For now, it returns basic info
    const players = loadFromStorage(NBA_CONFIG.STORAGE_KEYS.PLAYERS);
    return players ? players.find(p => p.id === playerId) : null;
}

// =============================================================================
// 📤 EXPORT FUNCTIONS FOR USE IN MAIN GAME
// =============================================================================

// Make functions available globally for the main game
window.NBAData = {
    // Main initialization
    initialize: initializeNBAData,
    
    // Data retrieval
    getTeamRoster: getTeamRoster,
    getRandomPlayerFromTeam: getRandomPlayerFromTeam,
    getPlayerStats: getPlayerStats,
    
    // Utility functions
    getAllTeams: () => loadFromStorage(NBA_CONFIG.STORAGE_KEYS.TEAMS),
    getAllPlayers: () => loadFromStorage(NBA_CONFIG.STORAGE_KEYS.PLAYERS),
    getAllRosters: () => loadFromStorage(NBA_CONFIG.STORAGE_KEYS.ROSTERS),
    
    // Data management
    refreshData: () => {
        localStorage.removeItem(NBA_CONFIG.STORAGE_KEYS.LAST_UPDATE);
        return initializeNBAData();
    },
    
    // Debug functions
    clearAllData: () => {
        Object.values(NBA_CONFIG.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('🗑️ All NBA data cleared');
    }
};

console.log('🏀 NBA Data Framework loaded successfully!'); 