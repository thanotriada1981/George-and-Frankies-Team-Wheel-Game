/**
 * Developer Tools for NBA Team Wheel
 * Testing and debugging functionality
 */

// Test data loading
function testDataLoading() {
    console.log("🧪 Testing data loading functionality...");
    
    if (nbaTeams.length === 0) {
        console.log("❌ No NBA teams loaded yet");
        alert("❌ No NBA teams loaded yet! Try refreshing the page.");
        return;
    }
    
    console.log("✅ NBA teams loaded:", nbaTeams.length);
    console.log("👥 First team roster:", nbaTeams[0]?.roster?.length || 0, "players");
    console.log("🎯 Sample player:", nbaTeams[0]?.roster?.[0]);
    
    // Test loading a specific team
    if (nbaTeams.length > 0) {
        loadPlayersForTeam(nbaTeams[0])
            .then(players => {
                console.log("✅ Test successful! Loaded", players.length, "players");
                console.log("🏆 First player:", players[0]);
                
                // Display results on the page
                alert(`Test Results:\n\n✅ Teams loaded: ${nbaTeams.length}\n🏆 First team: ${nbaTeams[0]?.name}\n👥 Players: ${players.length}\n🎯 First player: ${players[0]?.full_name || players[0]?.first_name + ' ' + players[0]?.last_name}`);
            })
            .catch(error => {
                console.error("❌ Test failed:", error);
                alert("❌ Test failed - check console for details");
            });
    } else {
        alert("❌ No teams loaded!");
    }
}

// Direct test of JSON loading
async function testDirectJSONLoad() {
    try {
        console.log("🔍 Testing direct JSON load...");
        const response = await fetch('data/nba_teams_data.json');
        const data = await response.json();
        console.log("✅ JSON loaded successfully");
        console.log("📊 Teams in JSON:", data.teams.length);
        console.log("🏆 First team in JSON:", data.teams[0].name);
        console.log("👥 First team roster:", data.teams[0].roster.length);
        console.log("🎯 First player:", data.teams[0].roster[0]);
        
        alert(`Direct JSON Test:\n\n✅ Teams in file: ${data.teams.length}\n🏆 First team: ${data.teams[0].name}\n👥 Players: ${data.teams[0].roster.length}\n🎯 First player: ${data.teams[0].roster[0].name}`);
    } catch (error) {
        console.error("❌ Direct JSON test failed:", error);
        alert("❌ Direct JSON test failed - check console");
    }
}

// Test NBA 2K25 database loading
async function testNBA2K25Database() {
    try {
        console.log("🔍 Testing NBA 2K25 database load...");
        
        // Test the correct path
        const response = await fetch('database/nba/players/nba-2k25-master-ratings.json');
        console.log("📊 Response status:", response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log("✅ NBA 2K25 database loaded successfully");
            console.log("📊 Number of teams:", Object.keys(data.teams).length);
            console.log("🏆 First team:", Object.keys(data.teams)[0]);
            console.log("👥 First team players:", data.teams[Object.keys(data.teams)[0]].players.length);
            console.log("🎯 First player:", data.teams[Object.keys(data.teams)[0]].players[0]);
            
            alert(`NBA 2K25 Database Test:\n\n✅ Status: ${response.status}\n📊 Teams: ${Object.keys(data.teams).length}\n🏆 First team: ${Object.keys(data.teams)[0]}\n👥 Players: ${data.teams[Object.keys(data.teams)[0]].players.length}\n🎯 First player: ${data.teams[Object.keys(data.teams)[0]].players[0].name}`);
        } else {
            console.error("❌ NBA 2K25 database failed to load:", response.status);
            alert(`❌ NBA 2K25 database failed to load!\n\nStatus: ${response.status}\nThe file path might be incorrect or the file doesn't exist.`);
        }
    } catch (error) {
        console.error("❌ NBA 2K25 database test failed:", error);
        alert(`❌ NBA 2K25 database test failed!\n\nError: ${error.message}`);
    }
}

// Force test a specific team (Atlanta Hawks)
function testAtlantaHawks() {
    console.log("🔍 Testing Atlanta Hawks specifically...");
    
    // Create a mock team object to test
    const atlantaTeam = {
        name: "Atlanta Hawks",
        color_primary: "#E03A3E",
        abbreviation: "ATL"
    };
    
    console.log("🏀 Testing team:", atlantaTeam);
    showPlayerSelection(atlantaTeam);
}

// Test battle system
function testBattleSystem() {
    console.log('🧪 Testing Battle System...');
    
    // Create mock teams for testing
    const testTeam1 = {
        playerName: 'George',
        pg: { name: 'Stephen Curry' },
        sg: { name: 'Klay Thompson' },
        sf: { name: 'Kevin Durant' },
        pf: { name: 'Draymond Green' },
        c: { name: 'Nikola Jokic' },
        sixth: { name: 'Jordan Poole' },
        seventh: { name: 'Andrew Wiggins' }
    };
    
    const testTeam2 = {
        playerName: 'Frankie',
        pg: { name: 'Luka Doncic' },
        sg: { name: 'Kyrie Irving' },
        sf: { name: 'LeBron James' },
        pf: { name: 'Anthony Davis' },
        c: { name: 'Joel Embiid' },
        sixth: { name: 'Russell Westbrook' },
        seventh: { name: 'Carmelo Anthony' }
    };
    
    if (window.battleSystemManager && window.battleSystemManager.initialized) {
        const result = window.battleSystemManager.conductDetailedBattle(testTeam1, testTeam2);
        console.log('🏆 Battle Result:', result);
        
        if (typeof displayBattleResult === 'function') {
            displayBattleResult(result);
        } else {
            alert(`Battle Test Results:\n\nWinner: ${result.winner.name}\nScore: ${result.teams.team1.rating.total} vs ${result.teams.team2.rating.total}\nMargin: ${result.margin} points`);
        }
    } else {
        console.log('⚠️ Battle system not ready yet');
        alert('⚠️ Battle system not ready yet. Please wait for it to load.');
    }
}

// Export functions for global use
window.testDataLoading = testDataLoading;
window.testDirectJSONLoad = testDirectJSONLoad;
window.testNBA2K25Database = testNBA2K25Database;
window.testAtlantaHawks = testAtlantaHawks;
window.testBattleSystem = testBattleSystem; 