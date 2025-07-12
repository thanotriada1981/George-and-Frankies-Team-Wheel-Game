/**
 * Usage Example: Multi-League Sports Database
 * Shows George & Frankie how to use the new organized system
 */

console.log('🏆 Multi-League Sports Database - Usage Examples\n');

// Example 1: Finding NBA team information
console.log('🏀 Example 1: NBA Team Information');
console.log('=====================================');

// Simulate getting Lakers team info
console.log('// Get Lakers team information');
console.log('let lakers = getTeamInfo("NBA", "LAL");');
console.log('Result:');
console.log({
    name: "Los Angeles Lakers",
    city: "Los Angeles",
    conference: "Western",
    division: "Pacific",
    primaryColor: "#552583",
    secondaryColor: "#FDB927",
    logo: "assets/logos/nba/los_angeles_lakers.svg",
    arena: "Crypto.com Arena"
});

console.log('\n// Get all NBA teams');
console.log('let allNBATeams = getAllTeams("NBA");');
console.log('Result: 30 teams total');

console.log('\n🔍 Example 2: Player Ratings');
console.log('=====================================');

// Simulate getting player ratings
console.log('// Find LeBron James rating');
console.log('let lebron = getPlayerRating("NBA", "LeBron James");');
console.log('Result:');
console.log({
    name: "LeBron James",
    overall: 96,
    position: "SF",
    team: "LAL",
    tier: "Superstar"
});

console.log('\n// Find multiple players');
console.log('let players = ["Nikola Jokic", "Luka Doncic", "Giannis Antetokounmpo"];');
console.log('players.forEach(name => {');
console.log('    let player = getPlayerRating("NBA", name);');
console.log('    console.log(`${name}: ${player.overall}`);');
console.log('});');
console.log('Result:');
console.log('  Nikola Jokic: 97');
console.log('  Luka Doncic: 97');
console.log('  Giannis Antetokounmpo: 97');

console.log('\n⚔️ Example 3: Team Battles');
console.log('=====================================');

// Simulate team battle
console.log('// Create two teams');
console.log('let georgeTeam = [');
console.log('    "Jayson Tatum",    // 95 overall');
console.log('    "Jaylen Brown",    // 92 overall');
console.log('    "Jrue Holiday",    // 85 overall');
console.log('    "Kristaps Porzingis", // 89 overall');
console.log('    "Al Horford"       // 83 overall');
console.log('];');

console.log('\nlet frankieTeam = [');
console.log('    "LeBron James",    // 96 overall');
console.log('    "Anthony Davis",   // 95 overall');
console.log('    "Austin Reaves",   // 85 overall');
console.log('    "D\'Angelo Russell", // 79 overall');
console.log('    "Jaxson Hayes"     // 76 overall');
console.log('];');

console.log('\n// Battle the teams');
console.log('let battle = QuickBattle.battle(georgeTeam, frankieTeam);');
console.log('Result:');
console.log({
    winner: "George",
    score: "507 vs 482",
    margin: 25,
    battleType: "Clear Winner",
    explanation: "George's team had better depth and chemistry",
    positionBattles: {
        PG: "George wins (Holiday 85 vs Russell 79)",
        SG: "George wins (Brown 92 vs Reaves 85)",
        SF: "Frankie wins (LeBron 96 vs Tatum 95)",
        PF: "Frankie wins (Davis 95 vs Porzingis 89)",
        C: "George wins (Horford 83 vs Hayes 76)"
    },
    chemistry: {
        george: "+8 (Big Three bonus)",
        frankie: "+5 (Superstars bonus)"
    }
});

console.log('\n🏈 Example 4: NFL Framework (Ready for Expansion)');
console.log('=====================================');

console.log('// NFL teams are ready');
console.log('let nflTeams = getAllTeams("NFL");');
console.log('Result: 32 teams with complete info');

console.log('\n// Example NFL team');
console.log('let patriots = getTeamInfo("NFL", "NE");');
console.log('Result: Team colors, logo, stadium info ready');

console.log('\n// When NFL player ratings are added:');
console.log('let tomBrady = getPlayerRating("NFL", "Tom Brady");');
console.log('// Will work automatically with existing battle system');

console.log('\n⚾ Example 5: MLB Framework (Ready for Expansion)');
console.log('=====================================');

console.log('// MLB teams are ready');
console.log('let mlbTeams = getAllTeams("MLB");');
console.log('Result: 30 teams with complete info');

console.log('\n// Example MLB team');
console.log('let yankees = getTeamInfo("MLB", "NYY");');
console.log('Result: Team colors, logo, stadium info ready');

console.log('\n🔧 Example 6: Universal Functions');
console.log('=====================================');

console.log('// Search across leagues');
console.log('let supportedLeagues = getSupportedLeagues();');
console.log('Result: ["NBA", "NFL", "MLB"]');

console.log('\n// Get league statistics');
console.log('let nbaStats = getLeagueStats("NBA");');
console.log('Result:');
console.log({
    totalTeams: 30,
    hasPlayerRatings: true,
    hasRosters: true,
    lastUpdated: "2024-12-11"
});

console.log('\n// Search for teams by name');
console.log('let losAngelesTeams = searchTeams("NBA", "Los Angeles");');
console.log('Result: Lakers and Clippers');

console.log('\n🎮 Example 7: Game Integration');
console.log('=====================================');

console.log('// Perfect for team wheel game');
console.log('function spinWheelAndBattle() {');
console.log('    // 1. Spin wheel to get teams');
console.log('    let team1 = spinWheel("NBA");');
console.log('    let team2 = spinWheel("NBA");');
console.log('    ');
console.log('    // 2. Get team rosters');
console.log('    let roster1 = getTeamRoster("NBA", team1);');
console.log('    let roster2 = getTeamRoster("NBA", team2);');
console.log('    ');
console.log('    // 3. Pick your lineups');
console.log('    let lineup1 = pickPlayers(roster1);');
console.log('    let lineup2 = pickPlayers(roster2);');
console.log('    ');
console.log('    // 4. Battle!');
console.log('    let result = QuickBattle.battle(lineup1, lineup2);');
console.log('    ');
console.log('    // 5. Show results');
console.log('    return result;');
console.log('}');

console.log('\n🎯 Summary: Everything is Ready!');
console.log('=====================================');
console.log('✅ NBA: 450+ players with real 2K25 ratings');
console.log('✅ Battle system: Strategic fights based on real data');
console.log('✅ NFL/MLB: Templates ready for expansion');
console.log('✅ Universal functions: Work across all leagues');
console.log('✅ Mobile ready: Works on phones, tablets, computers');
console.log('✅ Offline capable: No internet needed during games');
console.log('✅ Simple to use: Same easy interface as before');
console.log('✅ Future-proof: Ready for any sport expansion');

console.log('\n🚀 Ready to dominate with strategic team building!'); 