/**
 * Data Loading functionality for NBA Team Wheel
 * Handles loading and processing of team and player data
 */

// Load players for a team
async function loadPlayersForTeam(team) {
    try {
        console.log("🏀 Loading players for team:", team.name);
        // Always load from JSON file directly for reliability
        console.log("📄 Loading from JSON file directly...");
        const response = await fetch('database/nba/teams/nba_teams_data.json');
        const data = await response.json();
        
        console.log("📊 JSON data structure:", Object.keys(data));
        console.log("🏀 Teams in JSON:", data.teams ? Object.keys(data.teams).length : 'no teams property');
        console.log("🔍 Looking for team:", team.name);
        console.log("📋 Available teams in JSON:", data.teams ? Object.keys(data.teams).slice(0, 3) : 'none');
        
        // Find the team in our data
        const teamData = data.teams[team.name];
        
        console.log("🔍 teamData found in JSON:", !!teamData);
        console.log("🔍 teamData has roster:", teamData ? !!teamData.roster : false);
        console.log("🔍 teamData has players:", teamData ? !!teamData.roster?.players : false);
        
        if (teamData && teamData.roster && teamData.roster.players) {
            console.log("✅ Found roster data in JSON for", team.name, "- Found", teamData.roster.players.length, "roster members");
            
            // Include all roster members (players and coaches)
            return teamData.roster.players.map(player => ({
                id: player.jerseyNumber || Math.random(),
                first_name: player.name.split(' ')[0] || '',
                last_name: player.name.split(' ').slice(1).join(' ') || '',
                position: player.position,
                height_feet: player.physicalStats?.height ? parseInt(player.physicalStats.height.split("'")[0]) : null,
                height_inches: player.physicalStats?.height ? parseInt(player.physicalStats.height.split("'")[1]) : null,
                weight_pounds: player.physicalStats?.weight ? parseInt(player.physicalStats.weight.replace(' lbs', '')) : null,
                team: { full_name: team.name },
                number: player.jerseyNumber,
                experience: player.experience || 0,
                full_name: player.name,
                nba2k26Rating: player.nba2k26Rating,
                isCoach: player.position.includes('Coach') || player.position.includes('Head Coach'),
                coachInfo: player.coachInfo
            }));
        }
        
        // Fallback to mock data
        console.log("⚠️ No roster data found, using mock data for", team.name);
        return generateMockPlayers(team.name);
    } catch (error) {
        console.error('❌ Error loading team players:', error);
        return generateMockPlayers(team.name);
    }
}

// Generate mock players for demonstration
function generateMockPlayers(teamName) {
    const firstNames = ['James', 'Kevin', 'Stephen', 'LeBron', 'Kawhi', 'Giannis', 'Luka', 'Damian', 'Russell', 'Chris', 'Paul', 'Anthony', 'Kyrie', 'Joel', 'Nikola'];
    const lastNames = ['Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson'];
    const positions = ['Guard', 'Forward', 'Center', 'Guard-Forward', 'Forward-Center'];
    
    const players = [];
    for (let i = 0; i < 12; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const position = positions[Math.floor(Math.random() * positions.length)];
        
        players.push({
            id: i + 1,
            first_name: firstName,
            last_name: lastName,
            position: position,
            height_feet: Math.floor(Math.random() * 3) + 6,
            height_inches: Math.floor(Math.random() * 12),
            weight_pounds: Math.floor(Math.random() * 50) + 180,
            team: { full_name: teamName },
            number: i + 1,
            experience: Math.floor(Math.random() * 15),
            full_name: `${firstName} ${lastName}`,
            isCoach: false
        });
    }
    
    // Add a coach
    players.push({
        id: 99,
        first_name: 'Mike',
        last_name: 'Coach',
        position: 'Head Coach',
        team: { full_name: teamName },
        number: null,
        experience: Math.floor(Math.random() * 20) + 5,
        full_name: 'Mike Coach',
        isCoach: true
    });
    
    return players;
}

// Export functions for global use
window.loadPlayersForTeam = loadPlayersForTeam;
window.generateMockPlayers = generateMockPlayers; 