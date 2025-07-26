/**
 * 🏀 MASTER NBA DATABASE UPDATER
 * Comprehensive system for updating NBA player data, ratings, and team changes
 * 
 * Features:
 * - Update existing players with new ratings/teams
 * - Add new players to teams
 * - Handle trades (team changes only)
 * - Update ratings based on performance
 * - Maintain data integrity across all updates
 * - Backup system for rollbacks
 */

const fs = require('fs');
const path = require('path');

class MasterDatabaseUpdater {
    constructor() {
        this.databasePath = path.join(__dirname, '../nba_teams_data.json');
        this.backupPath = path.join(__dirname, '../nba_teams_data_backup.json');
        this.database = null;
        this.changes = [];
        this.lastBackup = null;
    }

    /**
     * Initialize the database updater
     */
    async initialize() {
        try {
            console.log('🏀 Initializing Master Database Updater...');
            
            // Load current database
            this.database = JSON.parse(fs.readFileSync(this.databasePath, 'utf8'));
            
            // Create backup if it doesn't exist
            if (!fs.existsSync(this.backupPath)) {
                this.createBackup();
            }
            
            console.log('✅ Master Database Updater initialized');
            console.log(`📊 Loaded ${Object.keys(this.database.teams).length} teams`);
            
            return true;
        } catch (error) {
            console.error('❌ Error initializing database updater:', error);
            return false;
        }
    }

    /**
     * Create a backup of the current database
     */
    createBackup() {
        try {
            const backupData = {
                ...this.database,
                metadata: {
                    ...this.database.metadata,
                    backupDate: new Date().toISOString(),
                    backupNote: 'Automatic backup before updates'
                }
            };
            
            fs.writeFileSync(this.backupPath, JSON.stringify(backupData, null, 2));
            this.lastBackup = new Date().toISOString();
            
            console.log('✅ Database backup created');
        } catch (error) {
            console.error('❌ Error creating backup:', error);
        }
    }

    /**
     * Update player with new data from 2K scraping
     * @param {string} playerName - Player's name
     * @param {string} teamName - Team name
     * @param {Object} newData - New player data from scraping
     */
    updatePlayer(playerName, teamName, newData) {
        try {
            console.log(`🔄 Updating player: ${playerName} on ${teamName}`);
            
            // Find the team
            const team = this.database.teams[teamName];
            if (!team) {
                console.error(`❌ Team not found: ${teamName}`);
                return false;
            }

            // Find the player in the team
            const playerIndex = team.roster.players.findIndex(p => 
                p.name.toLowerCase() === playerName.toLowerCase()
            );

            if (playerIndex === -1) {
                console.log(`➕ Adding new player: ${playerName} to ${teamName}`);
                return this.addNewPlayer(teamName, newData);
            }

            // Update existing player
            const oldPlayer = team.roster.players[playerIndex];
            const updatedPlayer = this.mergePlayerData(oldPlayer, newData);
            
            // Check if team changed
            if (oldPlayer.team && oldPlayer.team !== teamName) {
                console.log(`🔄 Player ${playerName} traded from ${oldPlayer.team} to ${teamName}`);
                this.recordTrade(playerName, oldPlayer.team, teamName);
            }

            team.roster.players[playerIndex] = updatedPlayer;
            
            // Update team stats
            this.updateTeamStats(teamName);
            
            // Record the change
            this.recordChange('UPDATE_PLAYER', {
                player: playerName,
                team: teamName,
                oldData: oldPlayer,
                newData: updatedPlayer
            });

            console.log(`✅ Updated player: ${playerName}`);
            return true;

        } catch (error) {
            console.error(`❌ Error updating player ${playerName}:`, error);
            return false;
        }
    }

    /**
     * Add a new player to a team
     * @param {string} teamName - Team name
     * @param {Object} playerData - Player data from scraping
     */
    addNewPlayer(teamName, playerData) {
        try {
            const team = this.database.teams[teamName];
            if (!team) {
                console.error(`❌ Team not found: ${teamName}`);
                return false;
            }

            const newPlayer = this.formatPlayerData(playerData);
            team.roster.players.push(newPlayer);
            
            // Update team stats
            this.updateTeamStats(teamName);
            
            // Record the change
            this.recordChange('ADD_PLAYER', {
                player: newPlayer.name,
                team: teamName,
                data: newPlayer
            });

            console.log(`✅ Added new player: ${newPlayer.name} to ${teamName}`);
            return true;

        } catch (error) {
            console.error(`❌ Error adding player to ${teamName}:`, error);
            return false;
        }
    }

    /**
     * Handle player trade between teams
     * @param {string} playerName - Player's name
     * @param {string} fromTeam - Team player is leaving
     * @param {string} toTeam - Team player is joining
     */
    handleTrade(playerName, fromTeam, toTeam) {
        try {
            console.log(`🔄 Processing trade: ${playerName} from ${fromTeam} to ${toTeam}`);
            
            // Find player in source team
            const sourceTeam = this.database.teams[fromTeam];
            const targetTeam = this.database.teams[toTeam];
            
            if (!sourceTeam || !targetTeam) {
                console.error(`❌ Team not found: ${fromTeam} or ${toTeam}`);
                return false;
            }

            const playerIndex = sourceTeam.roster.players.findIndex(p => 
                p.name.toLowerCase() === playerName.toLowerCase()
            );

            if (playerIndex === -1) {
                console.error(`❌ Player not found: ${playerName} on ${fromTeam}`);
                return false;
            }

            // Remove player from source team
            const tradedPlayer = sourceTeam.roster.players.splice(playerIndex, 1)[0];
            
            // Update player's team
            tradedPlayer.team = toTeam;
            
            // Add player to target team
            targetTeam.roster.players.push(tradedPlayer);
            
            // Update both team stats
            this.updateTeamStats(fromTeam);
            this.updateTeamStats(toTeam);
            
            // Record the trade
            this.recordTrade(playerName, fromTeam, toTeam);
            this.recordChange('TRADE_PLAYER', {
                player: playerName,
                fromTeam: fromTeam,
                toTeam: toTeam,
                playerData: tradedPlayer
            });

            console.log(`✅ Trade completed: ${playerName} to ${toTeam}`);
            return true;

        } catch (error) {
            console.error(`❌ Error processing trade:`, error);
            return false;
        }
    }

    /**
     * Update player ratings based on performance
     * @param {string} playerName - Player's name
     * @param {string} teamName - Team name
     * @param {number} newRating - New overall rating
     * @param {Object} newAttributes - New detailed attributes
     */
    updatePlayerRatings(playerName, teamName, newRating, newAttributes = {}) {
        try {
            console.log(`⭐ Updating ratings for: ${playerName} on ${teamName}`);
            
            const team = this.database.teams[teamName];
            if (!team) {
                console.error(`❌ Team not found: ${teamName}`);
                return false;
            }

            const playerIndex = team.roster.players.findIndex(p => 
                p.name.toLowerCase() === playerName.toLowerCase()
            );

            if (playerIndex === -1) {
                console.error(`❌ Player not found: ${playerName} on ${teamName}`);
                return false;
            }

            const oldPlayer = team.roster.players[playerIndex];
            const oldRating = oldPlayer.nba2k26Rating;
            
            // Update player ratings
            team.roster.players[playerIndex].nba2k26Rating = newRating;
            
            // Update detailed attributes if provided
            if (Object.keys(newAttributes).length > 0) {
                team.roster.players[playerIndex].detailedAttributes = newAttributes;
            }
            
            // Update team stats
            this.updateTeamStats(teamName);
            
            // Record the change
            this.recordChange('UPDATE_RATINGS', {
                player: playerName,
                team: teamName,
                oldRating: oldRating,
                newRating: newRating,
                newAttributes: newAttributes
            });

            console.log(`✅ Updated ratings: ${playerName} ${oldRating} → ${newRating}`);
            return true;

        } catch (error) {
            console.error(`❌ Error updating ratings for ${playerName}:`, error);
            return false;
        }
    }

    /**
     * Merge old player data with new scraped data
     * @param {Object} oldPlayer - Existing player data
     * @param {Object} newData - New scraped data
     */
    mergePlayerData(oldPlayer, newData) {
        return {
            name: newData.basic_info?.name || oldPlayer.name,
            jerseyNumber: newData.basic_info?.jersey_number || oldPlayer.jerseyNumber,
            position: newData.basic_info?.position || oldPlayer.position,
            age: newData.basic_info?.age || oldPlayer.age,
            nba2k26Rating: newData.ratings?.overall || oldPlayer.nba2k26Rating,
            team: newData.team_info?.team || oldPlayer.team,
            height: newData.basic_info?.height || oldPlayer.height,
            weight: newData.basic_info?.weight || oldPlayer.weight,
            experience: newData.basic_info?.experience || oldPlayer.experience,
            college: newData.basic_info?.college || oldPlayer.college,
            draft_info: newData.basic_info?.draft_info || oldPlayer.draft_info,
            detailedAttributes: newData.attributes || oldPlayer.detailedAttributes,
            badges: newData.badges || oldPlayer.badges,
            physicalStats: newData.physical_stats || oldPlayer.physicalStats,
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Format scraped data into database format
     * @param {Object} scrapedData - Data from 2K scraping
     */
    formatPlayerData(scrapedData) {
        return {
            name: scrapedData.basic_info?.name || 'Unknown Player',
            jerseyNumber: scrapedData.basic_info?.jersey_number || 'N/A',
            position: scrapedData.basic_info?.position || 'N/A',
            age: scrapedData.basic_info?.age || null,
            nba2k26Rating: scrapedData.ratings?.overall || 75,
            team: scrapedData.team_info?.team || 'Unknown Team',
            height: scrapedData.basic_info?.height || '',
            weight: scrapedData.basic_info?.weight || '',
            experience: scrapedData.basic_info?.experience || '',
            college: scrapedData.basic_info?.college || '',
            draft_info: scrapedData.basic_info?.draft_info || '',
            detailedAttributes: scrapedData.attributes || {},
            badges: scrapedData.badges || {},
            physicalStats: scrapedData.physical_stats || {},
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Update team statistics after player changes
     * @param {string} teamName - Team name
     */
    updateTeamStats(teamName) {
        const team = this.database.teams[teamName];
        if (!team || !team.roster.players) return;

        const players = team.roster.players;
        const ratings = players.map(p => p.nba2k26Rating).filter(r => r > 0);
        const ages = players.map(p => p.age).filter(a => a > 0);

        team.roster.teamStats = {
            playerCount: players.length,
            averageRating: ratings.length > 0 ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0,
            averageAge: ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0,
            highestRated: players.reduce((max, p) => p.nba2k26Rating > max.nba2k26Rating ? p : max, players[0]),
            lowestRated: players.reduce((min, p) => p.nba2k26Rating < min.nba2k26Rating ? p : min, players[0]),
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Record a change for audit trail
     * @param {string} changeType - Type of change
     * @param {Object} changeData - Change details
     */
    recordChange(changeType, changeData) {
        this.changes.push({
            timestamp: new Date().toISOString(),
            type: changeType,
            data: changeData
        });
    }

    /**
     * Record a trade
     * @param {string} playerName - Player's name
     * @param {string} fromTeam - Source team
     * @param {string} toTeam - Destination team
     */
    recordTrade(playerName, fromTeam, toTeam) {
        if (!this.database.trades) {
            this.database.trades = [];
        }

        this.database.trades.push({
            player: playerName,
            fromTeam: fromTeam,
            toTeam: toTeam,
            date: new Date().toISOString(),
            season: this.database.metadata.season
        });
    }

    /**
     * Save the updated database
     */
    saveDatabase() {
        try {
            // Update metadata
            this.database.metadata.lastUpdated = new Date().toISOString();
            this.database.metadata.totalChanges = this.changes.length;
            this.database.metadata.lastBackup = this.lastBackup;

            // Save to file
            fs.writeFileSync(this.databasePath, JSON.stringify(this.database, null, 2));
            
            console.log('✅ Database saved successfully');
            console.log(`📊 Total changes: ${this.changes.length}`);
            
            return true;
        } catch (error) {
            console.error('❌ Error saving database:', error);
            return false;
        }
    }

    /**
     * Get change history
     */
    getChangeHistory() {
        return this.changes;
    }

    /**
     * Rollback to last backup
     */
    rollbackToBackup() {
        try {
            if (fs.existsSync(this.backupPath)) {
                const backupData = JSON.parse(fs.readFileSync(this.backupPath, 'utf8'));
                fs.writeFileSync(this.databasePath, JSON.stringify(backupData, null, 2));
                console.log('✅ Rollback to backup completed');
                return true;
            } else {
                console.error('❌ No backup found');
                return false;
            }
        } catch (error) {
            console.error('❌ Error during rollback:', error);
            return false;
        }
    }

    /**
     * Export changes to a log file
     */
    exportChangeLog() {
        const logPath = path.join(__dirname, `../change-log-${new Date().toISOString().split('T')[0]}.json`);
        const logData = {
            exportDate: new Date().toISOString(),
            totalChanges: this.changes.length,
            changes: this.changes
        };
        
        fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
        console.log(`📝 Change log exported to: ${logPath}`);
    }
}

// Export for use
module.exports = MasterDatabaseUpdater;

// Example usage
async function exampleUsage() {
    const updater = new MasterDatabaseUpdater();
    await updater.initialize();

    // Example: Update Stephen Curry's ratings
    const curryData = {
        basic_info: {
            name: "Stephen Curry",
            position: "PG",
            jersey_number: "30",
            age: 36,
            height: "6'3\"",
            weight: "185 lbs"
        },
        ratings: {
            overall: 96
        },
        attributes: {
            three_point_shot: 99,
            mid_range_shot: 88,
            free_throw: 92
        },
        team_info: {
            team: "Golden State Warriors"
        }
    };

    updater.updatePlayer("Stephen Curry", "Golden State Warriors", curryData);
    updater.saveDatabase();
}

// Run example if called directly
if (require.main === module) {
    exampleUsage();
} 