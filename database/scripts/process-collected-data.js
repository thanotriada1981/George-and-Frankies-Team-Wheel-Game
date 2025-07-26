/**
 * 🏀 Process Collected NBA 2K26 Data
 * 
 * This script helps you process collected NBA 2K26 data
 * and integrate it into the main database.
 */

const fs = require('fs');
const path = require('path');

function processCollectedData(collectedData, teamName) {
    console.log(`🏀 Processing data for ${teamName}...`);
    
    const processedData = {
        team: teamName,
        players: []
    };
    
    if (!collectedData.players || !Array.isArray(collectedData.players)) {
        console.log('❌ Invalid data format. Expected players array.');
        return null;
    }
    
    collectedData.players.forEach((player, index) => {
        if (player.name && player.overall_rating > 0) {
            const processedPlayer = {
                name: player.name,
                overall_rating: player.overall_rating,
                position: player.position || 'N/A',
                jersey_number: player.jersey_number || 'N/A',
                detailed_attributes: player.detailed_attributes || null,
                physical_stats: player.physical_stats || null
            };
            
            processedData.players.push(processedPlayer);
            console.log(`✅ ${index + 1}. ${player.name} - ${player.overall_rating} OVR`);
        }
    });
    
    return processedData;
}

function saveTeamData(processedData, outputDir = './database/collected-data') {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filename = `${processedData.team.toLowerCase().replace(/\s+/g, '-')}-2k26-data.json`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(processedData, null, 2));
    console.log(`💾 Saved to: ${filepath}`);
    
    return filepath;
}

function updateMainDatabase(teamData, databasePath = './database/nba/teams/nba_teams_data.json') {
    console.log('🔄 Updating main database...');
    
    // Load current database
    const database = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
    
    // Find the team in the database
    const teamKey = Object.keys(database.teams).find(key => 
        database.teams[key].name === teamData.team
    );
    
    if (!teamKey) {
        console.log(`❌ Team "${teamData.team}" not found in database`);
        return false;
    }
    
    // Update players with real 2K26 data
    let updatedCount = 0;
    teamData.players.forEach(collectedPlayer => {
        const dbPlayer = database.teams[teamKey].roster.players.find(p => 
            p.name === collectedPlayer.name
        );
        
        if (dbPlayer) {
            // Update with real data
            dbPlayer.nba2k26Rating = collectedPlayer.overall_rating;
            dbPlayer.detailedAttributes = collectedPlayer.detailed_attributes;
            dbPlayer.physicalStats = collectedPlayer.physical_stats;
            dbPlayer.lastUpdated = new Date().toISOString();
            updatedCount++;
        }
    });
    
    // Update team metadata
    database.metadata.lastUpdated = new Date().toISOString();
    database.metadata.dataSource = "NBA 2K26 Real Data Collection";
    
    // Save updated database
    fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
    
    console.log(`✅ Updated ${updatedCount} players for ${teamData.team}`);
    return true;
}

function processAndSave(collectedData, teamName) {
    console.log(`\n🏀 Processing ${teamName} data...`);
    console.log('=====================================');
    
    // Process the collected data
    const processedData = processCollectedData(collectedData, teamName);
    if (!processedData) {
        console.log('❌ Failed to process data');
        return false;
    }
    
    // Save to individual file
    const savedPath = saveTeamData(processedData);
    
    // Update main database
    const success = updateMainDatabase(processedData);
    
    if (success) {
        console.log(`🎉 Successfully processed ${teamName}!`);
        console.log(`📊 Found ${processedData.players.length} players with real 2K26 data`);
    }
    
    return success;
}

// Example usage function
function showUsage() {
    console.log('🏀 NBA 2K26 Data Processor');
    console.log('============================');
    console.log('');
    console.log('USAGE:');
    console.log('1. Collect data using browser script');
    console.log('2. Save the JSON output');
    console.log('3. Use this script to process it:');
    console.log('');
    console.log('Example:');
    console.log('const collectedData = {');
    console.log('  team: "Los Angeles Lakers",');
    console.log('  players: [');
    console.log('    {');
    console.log('      name: "LeBron James",');
    console.log('      overall_rating: 96,');
    console.log('      detailed_attributes: { inside: 85, outside: 80 }');
    console.log('    }');
    console.log('  ]');
    console.log('};');
    console.log('');
    console.log('processAndSave(collectedData, "Los Angeles Lakers");');
    console.log('');
}

// Export functions
module.exports = {
    processCollectedData,
    saveTeamData,
    updateMainDatabase,
    processAndSave,
    showUsage
};

// Show usage if run directly
if (require.main === module) {
    showUsage();
} 