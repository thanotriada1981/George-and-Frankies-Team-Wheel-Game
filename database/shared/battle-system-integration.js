/**
 * System Integration with NBA 2K25 Player Ratings
 * For George & Frankie's Team Wheel Battle System
 *
 * This file integrates the new player ratings database with the existing
 * battle system framework, enabling real NBA 2K25 ratings for team battles.
 */

// Import the existing battle system and new rating lookup
// (These would be imported differently in actual implementation)

/**
 * Enhanced Battle System Manager with Real NBA 2K25 Ratings
 */
class EnhancedBattleSystemManager {
  constructor() {
    this.playerRatingLookup = null;
    this.battleHistory = [];
    this.initialized = false;
  }

  /**
   * Initialize the enhanced battle system
   */
  async initialize() {
    try {
      // Check if unified database is available
      if (
        typeof window.unifiedNBADB !== "undefined" &&
        window.unifiedNBADB.initialized
      ) {
        console.log("🔗 Using Unified NBA Database for battle system");
        this.unifiedDB = window.unifiedNBADB;
        this.initialized = true;
      } else {
        // Fallback: Initialize the player rating lookup system directly
        this.playerRatingLookup = new PlayerRatingLookup();
        await this.playerRatingLookup.initialize();
        this.initialized = true;
      }

      console.log(
        "🎮 Enhanced Battle System initialized with NBA 2K25 ratings!"
      );
    } catch (error) {
      console.error("❌ Error initializing Enhanced Battle System:", error);
      console.warn("🔄 Battle system will use fallback ratings");
      this.initialized = true; // Allow battles with fallback system
    }
  }

  /**
   * Get player rating with fallback system
   * @param {string} playerName - Player name
   * @param {string} teamName - Team name
   * @param {string} position - Player position
   * @returns {Object} Player rating data
   */
  getPlayerRatingWithFallback(playerName, teamName = null, position = null) {
    // Use unified database if available
    if (this.unifiedDB && this.unifiedDB.initialized) {
      return this.unifiedDB.getPlayerRatingWithFallback(
        playerName,
        teamName,
        position
      );
    }

    // Fallback to direct player rating lookup
    if (this.playerRatingLookup && this.playerRatingLookup.initialized) {
      const rating = this.playerRatingLookup.getPlayerRating(playerName);
      if (rating) {
        return rating;
      }
    }

    // Final fallback: Generate reasonable rating
    const fallbackRating = this.generateFallbackRating(position);
    console.log(
      `🔄 Battle system fallback rating for ${playerName}: ${fallbackRating}`
    );

    return {
      name: playerName,
      overall: fallbackRating,
      position: position || "Unknown",
      team: teamName || "Unknown",
      tier: this.getRatingTier(fallbackRating),
      isFallback: true,
    };
  }

  /**
   * Generate reasonable fallback rating
   * @param {string} position - Player position
   * @returns {number} Rating between 70-85
   */
  generateFallbackRating(position) {
    const positionRatings = {
      "Point Guard": 78,
      "Shooting Guard": 76,
      "Small Forward": 77,
      "Power Forward": 75,
      Center: 74,
      "Head Coach": 80,
    };

    const baseRating = positionRatings[position] || 76;
    // Add randomness (+/- 5 points)
    return baseRating + Math.floor(Math.random() * 11) - 5;
  }

  /**
   * Get rating tier from overall rating
   * @param {number} overall - Overall rating
   * @returns {string} Rating tier
   */
  getRatingTier(overall) {
    if (overall >= 95) return "Superstar";
    if (overall >= 90) return "All-Star";
    if (overall >= 85) return "Starter";
    if (overall >= 80) return "Role Player";
    if (overall >= 75) return "Bench";
    if (overall >= 70) return "Reserve";
    return "Development";
  }

  /**
   * Calculate team rating using real NBA 2K25 player ratings
   * @param {Object} team - Team object with player positions
   * @returns {Object} Detailed team rating
   */
  calculateRealTeamRating(team) {
    if (!this.initialized) {
      console.error("❌ Enhanced Battle System not initialized");
      return { total: 0, breakdown: {} };
    }

    const positions = ["pg", "sg", "sf", "pf", "c"];
    const benchPositions = ["sixth", "seventh"];

    let totalRating = 0;
    let playerCount = 0;
    const breakdown = {
      starters: [],
      bench: [],
      starterTotal: 0,
      benchTotal: 0,
      chemistry: 0,
      bonuses: 0,
      positionBattles: {},
    };

    // Calculate starting lineup with real ratings
    positions.forEach((position) => {
      const player = team[position];
      if (player) {
        // Use unified database with fallback system
        const rating = this.getPlayerRatingWithFallback(
          player.name,
          team.playerName,
          player.position
        );

        breakdown.starters.push({
          name: player.name,
          position: position.toUpperCase(),
          overall: rating.overall,
          tier: rating.tier,
          isFallback: rating.isFallback || false,
        });
        breakdown.starterTotal += rating.overall;
        breakdown.positionBattles[position] = rating.overall;
        playerCount++;
      }
    });

    // Calculate bench strength with real ratings
    benchPositions.forEach((position) => {
      const player = team[position];
      if (player) {
        // Use unified database with fallback system
        const rating = this.getPlayerRatingWithFallback(
          player.name,
          team.playerName,
          player.position
        );

        breakdown.bench.push({
          name: player.name,
          position: position,
          overall: rating.overall,
          tier: rating.tier,
          isFallback: rating.isFallback || false,
        });
        breakdown.benchTotal += rating.overall * 0.8; // Bench weighted at 80%
      }
    });

    // Calculate team chemistry based on actual player ratings
    breakdown.chemistry = this.calculateAdvancedChemistry(
      breakdown.starters,
      breakdown.bench
    );

    // Calculate bonuses based on real player tiers
    breakdown.bonuses = this.calculateAdvancedBonuses(
      breakdown.starters,
      breakdown.bench
    );

    // Calculate weighted total score
    totalRating =
      breakdown.starterTotal * 0.7 + // Starters 70%
      breakdown.benchTotal * 0.2 + // Bench 20%
      breakdown.chemistry * 0.05 + // Chemistry 5%
      breakdown.bonuses * 0.05; // Bonuses 5%

    return {
      total: Math.round(totalRating),
      breakdown: breakdown,
      playerCount: playerCount,
      teamName: team.playerName || "Unknown Team",
      averageStarter: Math.round(
        breakdown.starterTotal / Math.max(1, breakdown.starters.length)
      ),
    };
  }

  /**
   * Advanced chemistry calculation based on player tiers
   * @param {Array} starters - Starting lineup
   * @param {Array} bench - Bench players
   * @returns {number} Chemistry bonus
   */
  calculateAdvancedChemistry(starters, bench) {
    let chemistry = 0;
    const allPlayers = [...starters, ...bench];

    // Superstar chemistry (95+ overall)
    const superstars = allPlayers.filter((p) => p.overall >= 95);
    if (superstars.length >= 2) {
      chemistry += 15; // Multiple superstars work well together
    }

    // All-Star chemistry (90+ overall)
    const allStars = allPlayers.filter((p) => p.overall >= 90);
    if (allStars.length >= 3) {
      chemistry += 10; // Multiple All-Stars
    }

    // Balanced lineup chemistry
    if (starters.length === 5) {
      const starterRatings = starters.map((p) => p.overall);
      const variance = this.calculateVariance(starterRatings);

      // Lower variance = better balance = more chemistry
      if (variance < 25) {
        chemistry += 8; // Well-balanced lineup
      }
    }

    // Young core chemistry (assuming younger players have lower ratings but potential)
    const youngCore = allPlayers.filter(
      (p) => p.overall >= 75 && p.overall <= 85
    );
    if (youngCore.length >= 3) {
      chemistry += 5; // Young, developing core
    }

    return chemistry;
  }

  /**
   * Advanced bonuses based on real player ratings
   * @param {Array} starters - Starting lineup
   * @param {Array} bench - Bench players
   * @returns {number} Bonus points
   */
  calculateAdvancedBonuses(starters, bench) {
    let bonuses = 0;
    const allPlayers = [...starters, ...bench];

    // Big Three bonus (3+ players 90+)
    const bigThree = allPlayers.filter((p) => p.overall >= 90);
    if (bigThree.length >= 3) {
      bonuses += 20; // Significant bonus for multiple stars
    }

    // Superstar bonus (1+ player 95+)
    const superstars = allPlayers.filter((p) => p.overall >= 95);
    if (superstars.length >= 1) {
      bonuses += 25; // Huge bonus for elite player
    }

    // Elite depth bonus (7+ players 80+)
    const qualityPlayers = allPlayers.filter((p) => p.overall >= 80);
    if (qualityPlayers.length >= 7) {
      bonuses += 12; // Deep, quality roster
    }

    // Championship core bonus (5+ players 85+)
    const championshipCore = allPlayers.filter((p) => p.overall >= 85);
    if (championshipCore.length >= 5) {
      bonuses += 15; // Championship-level roster
    }

    // Perfect lineup bonus (all starters 80+)
    if (starters.length === 5 && starters.every((p) => p.overall >= 80)) {
      bonuses += 10; // No weak links in starting lineup
    }

    return bonuses;
  }

  /**
   * Calculate variance for chemistry calculations
   * @param {Array} ratings - Array of player ratings
   * @returns {number} Variance value
   */
  calculateVariance(ratings) {
    const mean =
      ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    const variance =
      ratings.reduce((sum, rating) => sum + Math.pow(rating - mean, 2), 0) /
      ratings.length;
    return variance;
  }

  /**
   * Conduct detailed battle with real NBA 2K25 ratings
   * @param {Object} team1 - First team
   * @param {Object} team2 - Second team
   * @param {string} mode - Battle mode
   * @returns {Object} Battle results
   */
  conductDetailedBattle(team1, team2, mode = "detailed") {
    if (!this.initialized) {
      console.error("❌ Enhanced Battle System not initialized");
      return null;
    }

    const team1Rating = this.calculateRealTeamRating(team1);
    const team2Rating = this.calculateRealTeamRating(team2);

    const battleResult = {
      teams: {
        team1: {
          name: team1.playerName || "Team 1",
          rating: team1Rating,
        },
        team2: {
          name: team2.playerName || "Team 2",
          rating: team2Rating,
        },
      },
      positionBattles: this.conductPositionBattles(team1Rating, team2Rating),
      winner: null,
      margin: 0,
      battleType: "",
      summary: "",
    };

    // Debug team objects
    console.log("🔍 Team 1 object:", battleResult.teams.team1);
    console.log("🔍 Team 2 object:", battleResult.teams.team2);
    console.log("🔍 Team 1 name:", battleResult.teams.team1.name);
    console.log("🔍 Team 2 name:", battleResult.teams.team2.name);

    // Determine winner
    if (team1Rating.total > team2Rating.total) {
      battleResult.winner = battleResult.teams.team1;
      battleResult.margin = team1Rating.total - team2Rating.total;
      console.log("🏆 Team 1 wins:", battleResult.winner);
    } else {
      battleResult.winner = battleResult.teams.team2;
      battleResult.margin = team2Rating.total - team1Rating.total;
      console.log("🏆 Team 2 wins:", battleResult.winner);
    }

    // Debug winner object
    console.log("🔍 Winner object:", battleResult.winner);
    console.log(
      "🔍 Winner name:",
      battleResult.winner ? battleResult.winner.name : "NO WINNER"
    );

    // Determine battle type
    if (battleResult.margin <= 3) {
      battleResult.battleType = "Nail-biter";
    } else if (battleResult.margin <= 10) {
      battleResult.battleType = "Close battle";
    } else if (battleResult.margin <= 25) {
      battleResult.battleType = "Clear winner";
    } else {
      battleResult.battleType = "Blowout";
    }

    // Generate battle summary
    battleResult.summary = this.generateBattleSummary(battleResult);

    // Save to history
    this.battleHistory.push({
      timestamp: new Date().toISOString(),
      result: battleResult,
      mode: mode,
    });

    return battleResult;
  }

  /**
   * Conduct position-by-position battles
   * @param {Object} team1Rating - Team 1 rating breakdown
   * @param {Object} team2Rating - Team 2 rating breakdown
   * @returns {Object} Position battle results
   */
  conductPositionBattles(team1Rating, team2Rating) {
    const positions = ["pg", "sg", "sf", "pf", "c"];
    const results = {};

    positions.forEach((position) => {
      const team1Player = team1Rating.breakdown.positionBattles[position] || 0;
      const team2Player = team2Rating.breakdown.positionBattles[position] || 0;

      results[position] = {
        team1Rating: team1Player,
        team2Rating: team2Player,
        winner: team1Player > team2Player ? "team1" : "team2",
        margin: Math.abs(team1Player - team2Player),
      };
    });

    // Count position battle wins
    const team1Wins = Object.values(results).filter(
      (r) => r.winner === "team1"
    ).length;
    const team2Wins = Object.values(results).filter(
      (r) => r.winner === "team2"
    ).length;

    results.summary = {
      team1Wins: team1Wins,
      team2Wins: team2Wins,
      totalBattles: positions.length,
    };

    return results;
  }

  /**
   * Generate battle summary text
   * @param {Object} battleResult - Battle result object
   * @returns {string} Battle summary
   */
  generateBattleSummary(battleResult) {
    const winner = battleResult.winner;
    const margin = battleResult.margin;
    const battleType = battleResult.battleType;

    // Defensive programming - ensure winner has a name
    const winnerName = winner && winner.name ? winner.name : "Unknown Team";
    const battleTypeText =
      battleType && battleType.toLowerCase
        ? battleType.toLowerCase()
        : "battle";

    let summary = `${winnerName} wins by ${margin} points in a ${battleTypeText}! `;

    // Add specific details based on battle type
    if (battleType === "Nail-biter") {
      summary +=
        "This was an incredibly close matchup that could have gone either way!";
    } else if (battleType === "Close battle") {
      summary += "Both teams showed strong lineups, but one had the edge.";
    } else if (battleType === "Clear winner") {
      summary += "The better team building strategy paid off significantly.";
    } else if (battleType === "Blowout") {
      summary +=
        "This was a dominant performance showing superior team construction!";
    }

    // Add position battle info
    const positionWins = battleResult.positionBattles.summary;
    summary += ` Position battles: ${positionWins.team1Wins}-${positionWins.team2Wins}`;

    return summary;
  }

  /**
   * Get battle history
   * @returns {Array} Array of past battles
   */
  getBattleHistory() {
    return this.battleHistory;
  }

  /**
   * Get player rating for display
   * @param {string} playerName - Player name
   * @returns {Object} Player rating info
   */
  getPlayerInfo(playerName) {
    if (!this.initialized) {
      return { name: playerName, overall: 75, tier: "Unknown" };
    }

    return (
      this.playerRatingLookup.getPlayerRating(playerName) || {
        name: playerName,
        overall: 75,
        tier: "Unknown",
      }
    );
  }
}

// Quick Battle Functions for Easy Integration
const QuickBattle = {
  /**
   * Simple team vs team battle
   * @param {Object} team1 - First team
   * @param {Object} team2 - Second team
   * @returns {Object} Battle result
   */
  battle: async (team1, team2) => {
    const battleSystem = new EnhancedBattleSystemManager();
    await battleSystem.initialize();
    return battleSystem.conductDetailedBattle(team1, team2);
  },

  /**
   * Get team strength score
   * @param {Object} team - Team object
   * @returns {number} Team strength score
   */
  getTeamStrength: async (team) => {
    const battleSystem = new EnhancedBattleSystemManager();
    await battleSystem.initialize();
    const rating = battleSystem.calculateRealTeamRating(team);
    return rating.total;
  },

  /**
   * Compare two players
   * @param {string} player1Name - First player name
   * @param {string} player2Name - Second player name
   * @returns {Object} Player comparison
   */
  comparePlayerscaling: async (player1Name, player2Name) => {
    const ratingLookup = new PlayerRatingLookup();
    await ratingLookup.initialize();

    const player1 = ratingLookup.getPlayerRating(player1Name);
    const player2 = ratingLookup.getPlayerRating(player2Name);

    return {
      player1: player1,
      player2: player2,
      winner: player1.overall > player2.overall ? player1 : player2,
      margin: Math.abs(player1.overall - player2.overall),
    };
  },
};

// Global initialization for browser use
if (typeof window !== "undefined") {
  window.EnhancedBattleSystemManager = EnhancedBattleSystemManager;
  window.QuickBattle = QuickBattle;
}

// Export for Node.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    EnhancedBattleSystemManager,
    QuickBattle,
  };
}
