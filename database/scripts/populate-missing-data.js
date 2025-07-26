/**
 * 🏀 POPULATE MISSING NBA DATA
 * Script to populate missing age and nba2k26Rating data in nba_teams_data.json
 * 
 * This script will:
 * 1. Load the current database
 * 2. Identify players missing age or ratings
 * 3. Provide a structure for manual updates
 * 4. Update the database with new data
 */

const fs = require('fs');
const path = require('path');

class MissingDataPopulator {
    constructor() {
        this.databasePath = path.join(__dirname, '../nba_teams_data.json');
        this.database = null;
        this.missingData = [];
    }

    /**
     * Initialize and load the database
     */
    async initialize() {
        try {
            console.log('🏀 Loading NBA database...');
            this.database = JSON.parse(fs.readFileSync(this.databasePath, 'utf8'));
            
            console.log('✅ Database loaded successfully');
            console.log(`📊 Total teams: ${Object.keys(this.database.teams).length}`);
            
            return true;
        } catch (error) {
            console.error('❌ Error loading database:', error);
            return false;
        }
    }

    /**
     * Scan for missing data
     */
    scanForMissingData() {
        console.log('🔍 Scanning for missing data...');
        
        this.missingData = [];
        
        Object.entries(this.database.teams).forEach(([teamName, team]) => {
            if (team.roster && team.roster.players) {
                team.roster.players.forEach((player, index) => {
                    const missing = [];
                    
                    if (!player.age || player.age === null) {
                        missing.push('age');
                    }
                    
                    if (!player.nba2k26Rating || player.nba2k26Rating === null) {
                        missing.push('nba2k26Rating');
                    }
                    
                    if (missing.length > 0) {
                        this.missingData.push({
                            team: teamName,
                            player: player.name,
                            playerIndex: index,
                            missing: missing,
                            currentData: player
                        });
                    }
                });
            }
        });
        
        console.log(`📊 Found ${this.missingData.length} players with missing data`);
        return this.missingData;
    }

    /**
     * Generate a template for manual data entry
     */
    generateDataTemplate() {
        console.log('\n📝 MISSING DATA TEMPLATE:');
        console.log('==========================================');
        
        this.missingData.forEach((item, index) => {
            console.log(`\n${index + 1}. ${item.player} (${item.team})`);
            console.log(`   Missing: ${item.missing.join(', ')}`);
            console.log(`   Current data:`, item.currentData);
            console.log(`   Template:`);
            console.log(`   {
     "team": "${item.team}",
     "player": "${item.player}",
     "age": null, // Add age here
     "nba2k26Rating": null, // Add rating here
     "notes": "Add any additional notes"
   }`);
        });
        
        console.log('\n==========================================');
    }

    /**
     * Update player data with provided information
     * @param {string} teamName - Team name
     * @param {string} playerName - Player name
     * @param {Object} newData - New data to add
     */
    updatePlayerData(teamName, playerName, newData) {
        try {
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

            // Update the player data
            if (newData.age !== undefined) {
                team.roster.players[playerIndex].age = newData.age;
            }
            
            if (newData.nba2k26Rating !== undefined) {
                team.roster.players[playerIndex].nba2k26Rating = newData.nba2k26Rating;
            }
            
            if (newData.notes) {
                team.roster.players[playerIndex].notes = newData.notes;
            }

            // Update last modified timestamp
            team.roster.players[playerIndex].lastUpdated = new Date().toISOString();

            console.log(`✅ Updated ${playerName} on ${teamName}`);
            return true;

        } catch (error) {
            console.error(`❌ Error updating ${playerName}:`, error);
            return false;
        }
    }

    /**
     * Batch update multiple players
     * @param {Array} updates - Array of update objects
     */
    batchUpdate(updates) {
        console.log(`🔄 Processing ${updates.length} updates...`);
        
        let successCount = 0;
        let errorCount = 0;
        
        updates.forEach((update, index) => {
            try {
                const success = this.updatePlayerData(
                    update.team,
                    update.player,
                    {
                        age: update.age,
                        nba2k26Rating: update.nba2k26Rating,
                        notes: update.notes
                    }
                );
                
                if (success) {
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                console.error(`❌ Error in update ${index + 1}:`, error);
                errorCount++;
            }
        });
        
        console.log(`✅ Batch update complete: ${successCount} successful, ${errorCount} errors`);
        return { successCount, errorCount };
    }

    /**
     * Update team statistics after data changes
     */
    updateAllTeamStats() {
        console.log('📊 Updating team statistics...');
        
        Object.entries(this.database.teams).forEach(([teamName, team]) => {
            if (team.roster && team.roster.players) {
                const players = team.roster.players;
                const ratings = players.map(p => p.nba2k26Rating).filter(r => r > 0);
                const ages = players.map(p => p.age).filter(a => a > 0);

                team.roster.teamStats = {
                    playerCount: players.length,
                    averageRating: ratings.length > 0 ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0,
                    averageAge: ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0,
                    lastUpdated: new Date().toISOString()
                };
            }
        });
        
        console.log('✅ Team statistics updated');
    }

    /**
     * Save the updated database
     */
    saveDatabase() {
        try {
            // Update metadata
            this.database.metadata.lastUpdated = new Date().toISOString();
            this.database.metadata.dataCompleteness = this.calculateDataCompleteness();
            
            // Save to file
            fs.writeFileSync(this.databasePath, JSON.stringify(this.database, null, 2));
            
            console.log('✅ Database saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Error saving database:', error);
            return false;
        }
    }

    /**
     * Calculate data completeness percentage
     */
    calculateDataCompleteness() {
        let totalPlayers = 0;
        let playersWithAge = 0;
        let playersWithRating = 0;
        
        Object.values(this.database.teams).forEach(team => {
            if (team.roster && team.roster.players) {
                team.roster.players.forEach(player => {
                    totalPlayers++;
                    if (player.age && player.age > 0) playersWithAge++;
                    if (player.nba2k26Rating && player.nba2k26Rating > 0) playersWithRating++;
                });
            }
        });
        
        return {
            totalPlayers,
            playersWithAge,
            playersWithRating,
            ageCompleteness: Math.round((playersWithAge / totalPlayers) * 100),
            ratingCompleteness: Math.round((playersWithRating / totalPlayers) * 100)
        };
    }

    /**
     * Generate a report of missing data
     */
    generateReport() {
        const completeness = this.calculateDataCompleteness();
        
        console.log('\n📊 DATA COMPLETENESS REPORT:');
        console.log('==========================================');
        console.log(`Total Players: ${completeness.totalPlayers}`);
        console.log(`Players with Age: ${completeness.playersWithAge} (${completeness.ageCompleteness}%)`);
        console.log(`Players with Rating: ${completeness.playersWithRating} (${completeness.ratingCompleteness}%)`);
        console.log('==========================================');
        
        if (this.missingData.length > 0) {
            console.log('\n❌ PLAYERS WITH MISSING DATA:');
            this.missingData.forEach((item, index) => {
                console.log(`${index + 1}. ${item.player} (${item.team}) - Missing: ${item.missing.join(', ')}`);
            });
        }
    }
}

// Example usage function
async function populateMissingData() {
    const populator = new MissingDataPopulator();
    await populator.initialize();
    
    // Scan for missing data
    populator.scanForMissingData();
    
    // Generate report
    populator.generateReport();
    
    // Generate template for manual entry
    populator.generateDataTemplate();
    
    // Example batch update (you would replace this with actual data)
    const exampleUpdates = [
        {
            team: "Golden State Warriors",
            player: "Stephen Curry",
            age: 36,
            nba2k26Rating: 96,
            notes: "Updated from 2K ratings"
        },
        {
            team: "Los Angeles Lakers", 
            player: "LeBron James",
            age: 40,
            nba2k26Rating: 95,
            notes: "Updated from 2K ratings"
        }
    ];
    
    // Uncomment to run batch update
    // populator.batchUpdate(exampleUpdates);
    // populator.updateAllTeamStats();
    // populator.saveDatabase();
}

// Export for use
module.exports = MissingDataPopulator;

// Run if called directly
if (require.main === module) {
    populateMissingData();
} 