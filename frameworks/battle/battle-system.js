/**
 * Battle System Framework
 * For George and Frankie's Dream Team Builder Game
 * 
 * This framework provides the foundation for team battles and winner determination
 * based on various NBA statistics and criteria.
 */

// =============================================================================
// ⚔️ BATTLE SYSTEM CONFIGURATION
// =============================================================================

const BATTLE_CONFIG = {
    // Battle criteria and weights
    CRITERIA: {
        OVERALL_RATING: { weight: 0.3, name: 'Overall Rating' },
        OFFENSIVE_POWER: { weight: 0.25, name: 'Offensive Power' },
        DEFENSIVE_STRENGTH: { weight: 0.25, name: 'Defensive Strength' },
        CHEMISTRY: { weight: 0.1, name: 'Team Chemistry' },
        COACHING: { weight: 0.1, name: 'Coaching Quality' }
    },
    
    // Position values for team balance
    POSITION_VALUES: {
        'PG': { importance: 0.2, name: 'Point Guard' },
        'SG': { importance: 0.2, name: 'Shooting Guard' },
        'SF': { importance: 0.2, name: 'Small Forward' },
        'PF': { importance: 0.2, name: 'Power Forward' },
        'C': { importance: 0.2, name: 'Center' }
    },
    
    // Battle modes
    BATTLE_MODES: {
        QUICK_BATTLE: 'quick_battle',
        DETAILED_ANALYSIS: 'detailed_analysis',
        TOURNAMENT: 'tournament'
    }
};

// =============================================================================
// ⚔️ BATTLE SYSTEM MANAGER
// =============================================================================

class BattleSystemManager {
    constructor() {
        this.playerStats = new Map();
        this.teamRatings = new Map();
        this.battleHistory = [];
        this.currentBattle = null;
        
        this.initializePlayerStats();
    }
    
    // Initialize player statistics (TODO: Load from real NBA data)
    initializePlayerStats() {
        console.log('📊 Initializing player statistics...');
        
        // TODO: Load real NBA player statistics
        // For now, we'll use placeholder values
        this.playerStats.set('default', {
            overall: 75,
            offense: 75,
            defense: 75,
            experience: 3,
            chemistry: 75
        });
    }
    
    // Calculate team rating based on roster
    calculateTeamRating(team) {
        console.log('🏆 Calculating team rating for:', team.playerName);
        
        try {
            let totalRating = 0;
            let ratingBreakdown = {
                overall: 0,
                offense: 0,
                defense: 0,
                chemistry: 0,
                coaching: 0
            };
            
            // Calculate ratings for each position
            const positions = ['pg', 'sg', 'sf', 'pf', 'c'];
            let playerCount = 0;
            
            positions.forEach(position => {
                const player = team[position];
                if (player) {
                    const playerStats = this.getPlayerStats(player);
                    ratingBreakdown.overall += playerStats.overall;
                    ratingBreakdown.offense += playerStats.offense;
                    ratingBreakdown.defense += playerStats.defense;
                    ratingBreakdown.chemistry += playerStats.chemistry;
                    playerCount++;
                }
            });
            
            // Calculate bench strength
            const benchPositions = ['sixth', 'seventh'];
            benchPositions.forEach(position => {
                const player = team[position];
                if (player) {
                    const playerStats = this.getPlayerStats(player);
                    ratingBreakdown.overall += playerStats.overall * 0.7; // Bench players weighted less
                    ratingBreakdown.offense += playerStats.offense * 0.7;
                    ratingBreakdown.defense += playerStats.defense * 0.7;
                    ratingBreakdown.chemistry += playerStats.chemistry * 0.7;
                }
            });
            
            // Calculate coaching rating
            if (team.coach) {
                ratingBreakdown.coaching = this.getCoachRating(team.coach);
            }
            
            // Average ratings
            if (playerCount > 0) {
                ratingBreakdown.overall /= playerCount;
                ratingBreakdown.offense /= playerCount;
                ratingBreakdown.defense /= playerCount;
                ratingBreakdown.chemistry /= playerCount;
            }
            
            // Calculate weighted total
            totalRating = 
                (ratingBreakdown.overall * BATTLE_CONFIG.CRITERIA.OVERALL_RATING.weight) +
                (ratingBreakdown.offense * BATTLE_CONFIG.CRITERIA.OFFENSIVE_POWER.weight) +
                (ratingBreakdown.defense * BATTLE_CONFIG.CRITERIA.DEFENSIVE_STRENGTH.weight) +
                (ratingBreakdown.chemistry * BATTLE_CONFIG.CRITERIA.CHEMISTRY.weight) +
                (ratingBreakdown.coaching * BATTLE_CONFIG.CRITERIA.COACHING.weight);
            
            const teamRating = {
                total: Math.round(totalRating),
                breakdown: ratingBreakdown,
                playerName: team.playerName
            };
            
            this.teamRatings.set(team.playerName, teamRating);
            return teamRating;
            
        } catch (error) {
            console.error('❌ Error calculating team rating:', error);
            return {
                total: 50,
                breakdown: { overall: 50, offense: 50, defense: 50, chemistry: 50, coaching: 50 },
                playerName: team.playerName
            };
        }
    }
    
    // Get player statistics
    getPlayerStats(player) {
        // TODO: Implement real NBA player statistics lookup
        const playerKey = `${player.first_name}_${player.last_name}`.toLowerCase();
        
        if (this.playerStats.has(playerKey)) {
            return this.playerStats.get(playerKey);
        }
        
        // Generate stats based on position and experience
        const baseStats = this.generatePlayerStats(player);
        this.playerStats.set(playerKey, baseStats);
        return baseStats;
    }
    
    // Generate player statistics based on position
    generatePlayerStats(player) {
        const position = player.position.toLowerCase();
        let baseRating = 70 + Math.random() * 20; // 70-90 base rating
        
        // Adjust based on position tendencies
        let offense = baseRating;
        let defense = baseRating;
        
        if (position.includes('guard')) {
            offense += 5; // Guards typically better at offense
            defense -= 2;
        } else if (position.includes('forward')) {
            // Forwards are balanced
        } else if (position.includes('center')) {
            defense += 5; // Centers typically better at defense
            offense -= 2;
        }
        
        return {
            overall: Math.round(baseRating),
            offense: Math.round(Math.max(40, Math.min(99, offense))),
            defense: Math.round(Math.max(40, Math.min(99, defense))),
            experience: Math.floor(Math.random() * 10) + 1,
            chemistry: Math.round(baseRating + (Math.random() * 10 - 5))
        };
    }
    
    // Get coach rating
    getCoachRating(coach) {
        // TODO: Implement real NBA coach ratings
        return 70 + Math.random() * 20; // 70-90 coach rating
    }
    
    // Conduct battle between teams
    conductBattle(teams, mode = BATTLE_CONFIG.BATTLE_MODES.QUICK_BATTLE) {
        console.log('⚔️ Conducting battle between', teams.length, 'teams');
        
        try {
            // Calculate ratings for all teams
            const teamRatings = teams.map(team => this.calculateTeamRating(team));
            
            // Determine winner based on mode
            let battleResult;
            
            switch (mode) {
                case BATTLE_CONFIG.BATTLE_MODES.QUICK_BATTLE:
                    battleResult = this.quickBattle(teamRatings);
                    break;
                case BATTLE_CONFIG.BATTLE_MODES.DETAILED_ANALYSIS:
                    battleResult = this.detailedBattle(teamRatings);
                    break;
                case BATTLE_CONFIG.BATTLE_MODES.TOURNAMENT:
                    battleResult = this.tournamentBattle(teamRatings);
                    break;
                default:
                    battleResult = this.quickBattle(teamRatings);
            }
            
            // Save battle to history
            this.battleHistory.push({
                timestamp: new Date(),
                teams: teamRatings,
                result: battleResult,
                mode: mode
            });
            
            return battleResult;
            
        } catch (error) {
            console.error('❌ Error conducting battle:', error);
            return {
                winner: teams[0],
                reason: 'Battle calculation failed',
                scores: []
            };
        }
    }
    
    // Quick battle (simple rating comparison)
    quickBattle(teamRatings) {
        const sortedTeams = [...teamRatings].sort((a, b) => b.total - a.total);
        const winner = sortedTeams[0];
        
        return {
            winner: winner,
            reason: `Highest overall team rating (${winner.total})`,
            scores: sortedTeams.map(team => ({
                player: team.playerName,
                score: team.total,
                rank: sortedTeams.indexOf(team) + 1
            })),
            mode: 'Quick Battle'
        };
    }
    
    // Detailed battle analysis
    detailedBattle(teamRatings) {
        const scores = teamRatings.map(team => {
            // Calculate detailed score with some randomness for excitement
            const randomFactor = 0.9 + (Math.random() * 0.2); // 90-110% of rating
            const detailedScore = team.total * randomFactor;
            
            return {
                player: team.playerName,
                score: Math.round(detailedScore),
                originalRating: team.total,
                breakdown: team.breakdown,
                rank: 0 // Will be set after sorting
            };
        });
        
        // Sort by score
        scores.sort((a, b) => b.score - a.score);
        scores.forEach((score, index) => {
            score.rank = index + 1;
        });
        
        const winner = scores[0];
        
        return {
            winner: teamRatings.find(team => team.playerName === winner.player),
            reason: `Won detailed battle analysis (${winner.score} points)`,
            scores: scores,
            mode: 'Detailed Analysis'
        };
    }
    
    // Tournament-style battle
    tournamentBattle(teamRatings) {
        // TODO: Implement tournament bracket system
        console.log('🏆 Tournament battle not yet implemented, using detailed battle');
        return this.detailedBattle(teamRatings);
    }
    
    // Get battle history
    getBattleHistory() {
        return this.battleHistory;
    }
    
    // Clear battle history
    clearBattleHistory() {
        this.battleHistory = [];
    }
    
    // Export battle results
    exportBattleResults(battleResult) {
        return {
            timestamp: new Date().toISOString(),
            winner: battleResult.winner.playerName,
            total_score: battleResult.winner.total,
            reason: battleResult.reason,
            all_scores: battleResult.scores,
            mode: battleResult.mode
        };
    }
}

// =============================================================================
// 🏆 BATTLE DISPLAY UTILITIES
// =============================================================================

class BattleDisplayManager {
    static createBattleResultHTML(battleResult) {
        const { winner, reason, scores, mode } = battleResult;
        
        let html = `
            <div class="battle-result">
                <h2>🏆 Battle Results</h2>
                <div class="battle-mode">${mode}</div>
                <div class="winner-announcement">
                    <h3>Winner: ${winner.playerName}</h3>
                    <p>${reason}</p>
                </div>
                <div class="battle-scores">
                    <h4>Final Scores:</h4>
                    <ol>
        `;
        
        scores.forEach(score => {
            html += `
                <li class="score-item ${score.rank === 1 ? 'winner' : ''}">
                    ${score.player}: ${score.score} points
                </li>
            `;
        });
        
        html += `
                    </ol>
                </div>
            </div>
        `;
        
        return html;
    }
    
    static createTeamComparisonHTML(teams) {
        // TODO: Implement team comparison display
        return '<div class="team-comparison">Team comparison not yet implemented</div>';
    }
}

// =============================================================================
// 🎯 GLOBAL BATTLE SYSTEM INSTANCE
// =============================================================================

// Initialize global battle system
const BattleSystem = new BattleSystemManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BattleSystem, BattleDisplayManager, BATTLE_CONFIG };
} 