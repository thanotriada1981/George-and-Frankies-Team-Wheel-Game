/**
 * NBA 2K25 Player Rating Lookup System
 * For George & Frankie's Team Wheel Battle System
 * 
 * This system provides easy access to player ratings and calculations
 * for determining team strength and battle winners.
 */

class PlayerRatingLookup {
    constructor() {
        this.ratingsData = null;
        this.playerIndex = new Map();
        this.teamRosters = new Map();
        this.initialized = false;
    }

    /**
     * Initialize the lookup system by loading ratings data
     */
    async initialize() {
        try {
            // Load the ratings data from JSON file - Fixed path
            const response = await fetch('database/nba/teams/nba_teams_data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.ratingsData = await response.json();
            
            // Validate data structure
            if (!this.ratingsData || !this.ratingsData.teams) {
                throw new Error('Invalid data structure: missing teams data');
            }
            
            // Build player index for fast lookups
            this.buildPlayerIndex();
            
            // Build team rosters for easy access
            this.buildTeamRosters();
            
            this.initialized = true;
            console.log('✅ Player Rating Lookup System initialized successfully');
            console.log(`📊 Loaded ${Object.keys(this.ratingsData.teams).length} teams`);
            console.log(`👥 Indexed ${this.playerIndex.size} players`);
            
        } catch (error) {
            console.error('❌ Error initializing Player Rating Lookup System:', error);
            console.warn('🔄 Falling back to basic battle system');
            this.initialized = false;
        }
    }

    /**
     * Build an index of all players for fast name-based lookups
     */
    buildPlayerIndex() {
        this.playerIndex.clear();
        
        // Index all players from all teams
        Object.entries(this.ratingsData.teams).forEach(([teamName, teamData]) => {
            if (teamData.roster && teamData.roster.players) {
                teamData.roster.players.forEach(player => {
                    const key = this.normalizePlayerName(player.name);
                    this.playerIndex.set(key, {
                        ...player,
                        team: teamName,
                        overall: player.nba2k26Rating || player.overall || 0
                    });
                });
            }
        });
        
        console.log(`📊 Indexed ${this.playerIndex.size} players for fast lookup`);
    }

    /**
     * Build team rosters for easy team-based operations
     */
    buildTeamRosters() {
        this.teamRosters.clear();
        
        Object.entries(this.ratingsData.teams).forEach(([teamName, teamData]) => {
            if (teamData.roster && teamData.roster.players) {
                this.teamRosters.set(teamName, teamData.roster.players);
            }
        });
        
        console.log(`🏀 Built rosters for ${this.teamRosters.size} teams`);
    }

    /**
     * Normalize player name for consistent lookups
     */
    normalizePlayerName(name) {
        // Defensive programming - handle undefined/null names
        if (!name || typeof name !== 'string') {
            console.warn('⚠️ Invalid player name provided to normalizePlayerName:', name);
            return 'unknown_player';
        }
        
        return name.toLowerCase()
                   .replace(/[^a-z0-9\s]/g, '')
                   .replace(/\s+/g, '_');
    }

    /**
     * Get player rating by name
     * @param {string} playerName - The player's name
     * @returns {Object|null} Player data with rating, position, team
     */
    getPlayerRating(playerName) {
        if (!this.initialized) {
            console.error('❌ Rating lookup system not initialized');
            return null;
        }

        // Defensive programming - handle invalid player names
        if (!playerName || typeof playerName !== 'string') {
            console.warn('⚠️ Invalid player name provided to getPlayerRating:', playerName);
            return null;
        }

        const key = this.normalizePlayerName(playerName);
        const player = this.playerIndex.get(key);
        
        if (!player) {
            console.warn(`⚠️  Player not found: ${playerName}`);
            return null;
        }

        return {
            name: player.name,
            overall: player.overall,
            position: player.position,
            team: player.team,
            tier: this.getRatingTier(player.overall)
        };
    }

    /**
     * Get all players from a specific team
     * @param {string} teamName - The team name
     * @returns {Array} Array of player objects
     */
    getTeamRoster(teamName) {
        if (!this.initialized) {
            console.error('❌ Rating lookup system not initialized');
            return [];
        }

        const roster = this.teamRosters.get(teamName);
        if (!roster) {
            console.warn(`⚠️  Team not found: ${teamName}`);
            return [];
        }

        return roster.map(player => ({
            ...player,
            team: teamName,
            tier: this.getRatingTier(player.overall)
        }));
    }

    /**
     * Calculate team overall rating
     * @param {Object} team - Team object with player positions
     * @returns {Object} Team rating breakdown
     */
    calculateTeamRating(team) {
        if (!this.initialized) {
            console.error('❌ Rating lookup system not initialized');
            return { total: 0, breakdown: {} };
        }

        const positions = ['pg', 'sg', 'sf', 'pf', 'c'];
        const benchPositions = ['sixth', 'seventh'];
        
        let totalRating = 0;
        let playerCount = 0;
        const breakdown = {
            starters: 0,
            bench: 0,
            chemistry: 0,
            bonuses: 0
        };

        // Calculate starting lineup rating (70% weight)
        positions.forEach(position => {
            const player = team[position];
            if (player) {
                const rating = this.getPlayerRating(player.name);
                if (rating) {
                    breakdown.starters += rating.overall;
                    playerCount++;
                }
            }
        });

        // Calculate bench rating (20% weight)
        benchPositions.forEach(position => {
            const player = team[position];
            if (player) {
                const rating = this.getPlayerRating(player.name);
                if (rating) {
                    breakdown.bench += rating.overall * 0.8; // Bench weighted less
                }
            }
        });

        // Calculate team chemistry and bonuses (10% weight)
        breakdown.chemistry = this.calculateTeamChemistry(team);
        breakdown.bonuses = this.calculateTeamBonuses(team);

        // Apply default weights (since battle_weights not in data)
        const weights = {
            overall_rating: 0.7,
            position_importance: 0.2,
            team_chemistry: 0.05,
            clutch_factor: 0.05
        };
        
        totalRating = 
            (breakdown.starters * weights.overall_rating) +
            (breakdown.bench * weights.position_importance) +
            (breakdown.chemistry * weights.team_chemistry) +
            (breakdown.bonuses * weights.clutch_factor);

        return {
            total: Math.round(totalRating),
            breakdown: breakdown,
            playerCount: playerCount,
            teamName: team.playerName || 'Unknown Team'
        };
    }

    /**
     * Calculate team chemistry bonus
     * @param {Object} team - Team object
     * @returns {number} Chemistry bonus points
     */
    calculateTeamChemistry(team) {
        let chemistryBonus = 0;
        const players = [];
        
        // Collect all players
        ['pg', 'sg', 'sf', 'pf', 'c', 'sixth', 'seventh'].forEach(position => {
            if (team[position]) {
                const rating = this.getPlayerRating(team[position].name);
                if (rating) {
                    players.push(rating);
                }
            }
        });

        // Perfect position balance bonus
        if (players.length >= 5) {
            chemistryBonus += 5;
        }

        // Star player bonus (3+ players 85+)
        const starPlayers = players.filter(p => p.overall >= 85);
        if (starPlayers.length >= 3) {
            chemistryBonus += 8;
        }

        // Balanced team bonus (all starters 80+)
        const starters = players.slice(0, 5);
        if (starters.length === 5 && starters.every(p => p.overall >= 80)) {
            chemistryBonus += 6;
        }

        return chemistryBonus;
    }

    /**
     * Calculate team bonuses based on player compositions
     * @param {Object} team - Team object
     * @returns {number} Bonus points
     */
    calculateTeamBonuses(team) {
        let bonuses = 0;
        const players = [];
        
        // Collect all players with ratings
        ['pg', 'sg', 'sf', 'pf', 'c', 'sixth', 'seventh'].forEach(position => {
            if (team[position]) {
                const rating = this.getPlayerRating(team[position].name);
                if (rating) {
                    players.push(rating);
                }
            }
        });

        // Big Three bonus (3 players 90+)
        const elitePlayers = players.filter(p => p.overall >= 90);
        if (elitePlayers.length >= 3) {
            bonuses += 10;
        }

        // Superstar bonus (1 player 95+)
        const superstars = players.filter(p => p.overall >= 95);
        if (superstars.length >= 1) {
            bonuses += 15;
        }

        // Deep bench bonus (7+ players)
        if (players.length >= 7) {
            bonuses += 3;
        }

        return bonuses;
    }

    /**
     * Get rating tier for a player
     * @param {number} overall - Player's overall rating
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
     * Compare two teams for battle system
     * @param {Object} team1 - First team
     * @param {Object} team2 - Second team
     * @returns {Object} Battle comparison result
     */
    compareBattleTeams(team1, team2) {
        if (!this.initialized) {
            console.error('❌ Rating lookup system not initialized');
            return null;
        }

        const team1Rating = this.calculateTeamRating(team1);
        const team2Rating = this.calculateTeamRating(team2);

        const winner = team1Rating.total > team2Rating.total ? team1 : team2;
        const margin = Math.abs(team1Rating.total - team2Rating.total);

        return {
            team1: {
                name: team1.playerName || 'Team 1',
                rating: team1Rating
            },
            team2: {
                name: team2.playerName || 'Team 2',
                rating: team2Rating
            },
            winner: {
                name: winner.playerName || 'Winner',
                margin: margin,
                rating: winner === team1 ? team1Rating.total : team2Rating.total
            },
            battleType: this.getBattleType(margin)
        };
    }

    /**
     * Get battle type based on point margin
     * @param {number} margin - Point difference between teams
     * @returns {string} Battle type description
     */
    getBattleType(margin) {
        if (margin <= 5) return 'Nail-biter';
        if (margin <= 15) return 'Close battle';
        if (margin <= 30) return 'Clear winner';
        return 'Blowout';
    }

    /**
     * Get top players by position
     * @param {string} position - Position (PG, SG, SF, PF, C)
     * @param {number} limit - Number of players to return
     * @returns {Array} Top players at position
     */
    getTopPlayersByPosition(position, limit = 10) {
        if (!this.initialized) {
            console.error('❌ Rating lookup system not initialized');
            return [];
        }

        const positionPlayers = Array.from(this.playerIndex.values())
            .filter(player => player.position === position)
            .sort((a, b) => b.overall - a.overall)
            .slice(0, limit);

        return positionPlayers.map(player => ({
            ...player,
            tier: this.getRatingTier(player.overall)
        }));
    }

    /**
     * Get team strength analysis
     * @param {string} teamName - Team name
     * @returns {Object} Team analysis
     */
    getTeamAnalysis(teamName) {
        if (!this.initialized) {
            console.error('❌ Rating lookup system not initialized');
            return null;
        }

        const roster = this.getTeamRoster(teamName);
        if (!roster.length) {
            return null;
        }

        const analysis = {
            teamName: teamName,
            playerCount: roster.length,
            averageRating: Math.round(roster.reduce((sum, p) => sum + p.overall, 0) / roster.length),
            topPlayer: roster.reduce((max, p) => p.overall > max.overall ? p : max),
            positionBreakdown: {},
            strengths: [],
            weaknesses: []
        };

        // Position breakdown
        ['PG', 'SG', 'SF', 'PF', 'C'].forEach(pos => {
            const posPlayers = roster.filter(p => p.position === pos);
            if (posPlayers.length > 0) {
                analysis.positionBreakdown[pos] = {
                    count: posPlayers.length,
                    averageRating: Math.round(posPlayers.reduce((sum, p) => sum + p.overall, 0) / posPlayers.length),
                    topPlayer: posPlayers.reduce((max, p) => p.overall > max.overall ? p : max)
                };
            }
        });

        // Determine strengths and weaknesses
        const superstars = roster.filter(p => p.overall >= 95);
        const allStars = roster.filter(p => p.overall >= 90);
        const weakPlayers = roster.filter(p => p.overall < 75);

        if (superstars.length > 0) {
            analysis.strengths.push(`${superstars.length} Superstar${superstars.length > 1 ? 's' : ''}`);
        }
        if (allStars.length >= 3) {
            analysis.strengths.push('Multiple All-Stars');
        }
        if (analysis.averageRating >= 82) {
            analysis.strengths.push('High team rating');
        }
        if (weakPlayers.length > 2) {
            analysis.weaknesses.push('Weak depth');
        }
        if (analysis.averageRating < 78) {
            analysis.weaknesses.push('Low overall talent');
        }

        return analysis;
    }

    /**
     * Search for players by name (fuzzy matching)
     * @param {string} searchTerm - Search term
     * @param {number} limit - Max results
     * @returns {Array} Matching players
     */
    searchPlayers(searchTerm, limit = 10) {
        if (!this.initialized) {
            console.error('❌ Rating lookup system not initialized');
            return [];
        }

        const normalizedSearch = searchTerm.toLowerCase();
        const results = [];

        this.playerIndex.forEach((player, key) => {
            const name = player.name.toLowerCase();
            if (name.includes(normalizedSearch) || key.includes(normalizedSearch)) {
                results.push({
                    ...player,
                    tier: this.getRatingTier(player.overall)
                });
            }
        });

        return results
            .sort((a, b) => b.overall - a.overall)
            .slice(0, limit);
    }
}

// Create global instance
const playerRatingLookup = new PlayerRatingLookup();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PlayerRatingLookup, playerRatingLookup };
}

// Auto-initialize when used in browser
if (typeof window !== 'undefined') {
    window.playerRatingLookup = playerRatingLookup;
    
    // Initialize automatically when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        playerRatingLookup.initialize();
    });
}

/**
 * Quick access functions for battle system
 */
const BattleRatingHelpers = {
    /**
     * Quick team battle comparison
     */
    quickBattle: (team1, team2) => {
        return playerRatingLookup.compareBattleTeams(team1, team2);
    },

    /**
     * Get player rating quickly
     */
    getPlayerOVR: (playerName) => {
        const player = playerRatingLookup.getPlayerRating(playerName);
        return player ? player.overall : 0;
    },

    /**
     * Calculate team total quickly
     */
    getTeamTotal: (team) => {
        const rating = playerRatingLookup.calculateTeamRating(team);
        return rating.total;
    }
};

// Export helpers
if (typeof window !== 'undefined') {
    window.BattleRatingHelpers = BattleRatingHelpers;
} 