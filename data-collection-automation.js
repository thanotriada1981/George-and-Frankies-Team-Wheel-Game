/**
 * 🏀 NBA DATA COLLECTION AUTOMATION COORDINATOR
 * Complete automation script for collecting NBA 2025-26 season data
 * 
 * This script helps coordinate data collection from both ESPN and 2kratings.com
 * Run this in browser console for guided data collection process
 */

// NBA Team Configuration
const NBA_TEAMS = {
    'Eastern Conference': {
        'Atlantic': ['Boston Celtics', 'Brooklyn Nets', 'New York Knicks', 'Philadelphia 76ers', 'Toronto Raptors'],
        'Central': ['Chicago Bulls', 'Cleveland Cavaliers', 'Detroit Pistons', 'Indiana Pacers', 'Milwaukee Bucks'],
        'Southeast': ['Atlanta Hawks', 'Charlotte Hornets', 'Miami Heat', 'Orlando Magic', 'Washington Wizards']
    },
    'Western Conference': {
        'Northwest': ['Denver Nuggets', 'Minnesota Timberwolves', 'Oklahoma City Thunder', 'Portland Trail Blazers', 'Utah Jazz'],
        'Pacific': ['Golden State Warriors', 'LA Clippers', 'Los Angeles Lakers', 'Phoenix Suns', 'Sacramento Kings'],
        'Southwest': ['Dallas Mavericks', 'Houston Rockets', 'Memphis Grizzlies', 'New Orleans Pelicans', 'San Antonio Spurs']
    }
};

const PRIORITY_TEAMS = [
    'Los Angeles Lakers',
    'Golden State Warriors', 
    'Boston Celtics',
    'Miami Heat',
    'Dallas Mavericks',
    'Oklahoma City Thunder',
    'Minnesota Timberwolves',
    'New York Knicks',
    'Philadelphia 76ers',
    'Phoenix Suns'
];

// Collection Progress Tracker
let collectionProgress = {
    espn: {},
    nba2k: {},
    completed: [],
    errors: []
};

function startDataCollectionCoordinator() {
    console.log('🏀 NBA DATA COLLECTION COORDINATOR STARTED');
    console.log('📋 Ready to collect 2025-26 season data from ESPN + 2kratings.com');
    console.log('');
    
    displayMainMenu();
}

function displayMainMenu() {
    console.log('🎯 MAIN MENU - Choose Collection Mode:');
    console.log('1. Priority Teams First (recommended)');
    console.log('2. Full League Collection');
    console.log('3. Single Team Collection');
    console.log('4. Check Progress');
    console.log('5. Data Validation');
    console.log('');
    console.log('Run one of these commands:');
    console.log('- collectPriorityTeams()');
    console.log('- collectAllTeams()');
    console.log('- collectSingleTeam("Team Name")');
    console.log('- checkProgress()');
    console.log('- validateData()');
}

function collectPriorityTeams() {
    console.log('🚀 PRIORITY TEAMS COLLECTION MODE');
    console.log('📊 Collecting data for 10 most important teams first');
    console.log('');
    
    PRIORITY_TEAMS.forEach((team, index) => {
        console.log(`${index + 1}. ${team}`);
    });
    
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('1. Start with: collectTeamData("Los Angeles Lakers")');
    console.log('2. Follow the guided process for each team');
    console.log('3. Complete both ESPN and 2K data for each team');
}

function collectAllTeams() {
    console.log('🌟 FULL LEAGUE COLLECTION MODE');
    console.log('📊 Complete data collection for all 30 NBA teams');
    console.log('');
    
    Object.entries(NBA_TEAMS).forEach(([conference, divisions]) => {
        console.log(`📍 ${conference}:`);
        Object.entries(divisions).forEach(([division, teams]) => {
            console.log(`  ${division} Division:`);
            teams.forEach(team => {
                console.log(`    - ${team}`);
            });
        });
        console.log('');
    });
    
    console.log('📋 Start with: collectTeamData("Team Name")');
}

function collectTeamData(teamName) {
    console.log(`🏀 COLLECTING DATA FOR: ${teamName}`);
    console.log('');
    
    // Generate URLs
    const espnURL = generateESPNTeamURL(teamName);
    const kratignsURL = generate2KRatingsTeamURL(teamName);
    
    console.log('📍 STEP 1: ESPN ROSTER COLLECTION');
    console.log(`🌐 Navigate to: ${espnURL}`);
    console.log('📋 Instructions:');
    console.log('   1. Click on team from the list');
    console.log('   2. Click "Roster" tab');
    console.log('   3. Open console (F12)');
    console.log('   4. Copy/paste enhanced ESPN script');
    console.log('   5. Run: collectEnhancedESPNData()');
    console.log('   6. Copy JSON output');
    console.log('   7. Save to: data/current-rosters/teams/[team-name]-current.json');
    console.log('');
    
    console.log('📍 STEP 2: NBA 2K26 RATINGS COLLECTION');
    console.log(`🌐 Navigate to: ${kratignsURL}`);
    console.log('📋 Instructions:');
    console.log('   1. Find your team in the list');
    console.log('   2. Click on team name');
    console.log('   3. Open console (F12)');
    console.log('   4. Copy/paste enhanced 2K26 script');
    console.log('   5. Run: collectEnhanced2K26Data()');
    console.log('   6. Copy JSON output');
    console.log('   7. Save to: data/nba2k-official/teams/[team-name].json');
    console.log('');
    
    console.log('✅ When complete, run: markTeamComplete("' + teamName + '")');
    
    // Track progress
    collectionProgress.espn[teamName] = 'in_progress';
    collectionProgress.nba2k[teamName] = 'pending';
}

function generateESPNTeamURL(teamName) {
    // ESPN uses team IDs, but the main teams page is a good starting point
    return 'https://www.espn.com/nba/teams';
}

function generate2KRatingsTeamURL(teamName) {
    // 2K Ratings main NBA teams page
    return 'https://www.2kratings.com/';
}

function markTeamComplete(teamName) {
    console.log(`✅ MARKED COMPLETE: ${teamName}`);
    
    if (!collectionProgress.completed.includes(teamName)) {
        collectionProgress.completed.push(teamName);
    }
    
    collectionProgress.espn[teamName] = 'completed';
    collectionProgress.nba2k[teamName] = 'completed';
    
    console.log(`📊 Progress: ${collectionProgress.completed.length}/30 teams complete`);
    
    if (collectionProgress.completed.length >= 30) {
        console.log('🎉 CONGRATULATIONS! All 30 teams completed!');
        console.log('🔄 Next step: Run validateAllData() to check data quality');
    } else {
        // Suggest next priority team
        const nextTeam = PRIORITY_TEAMS.find(team => !collectionProgress.completed.includes(team));
        if (nextTeam) {
            console.log(`🎯 Suggested next team: collectTeamData("${nextTeam}")`);
        }
    }
}

function checkProgress() {
    console.log('📊 COLLECTION PROGRESS REPORT');
    console.log('==============================');
    console.log(`✅ Completed: ${collectionProgress.completed.length}/30 teams`);
    console.log(`⏳ In Progress: ${Object.keys(collectionProgress.espn).length - collectionProgress.completed.length}`);
    console.log(`❌ Errors: ${collectionProgress.errors.length}`);
    console.log('');
    
    if (collectionProgress.completed.length > 0) {
        console.log('✅ COMPLETED TEAMS:');
        collectionProgress.completed.forEach((team, index) => {
            console.log(`   ${index + 1}. ${team}`);
        });
        console.log('');
    }
    
    if (collectionProgress.errors.length > 0) {
        console.log('❌ TEAMS WITH ERRORS:');
        collectionProgress.errors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error}`);
        });
        console.log('');
    }
    
    // Progress by conference
    console.log('📍 PROGRESS BY CONFERENCE:');
    Object.entries(NBA_TEAMS).forEach(([conference, divisions]) => {
        const conferenceTeams = Object.values(divisions).flat();
        const completedInConference = conferenceTeams.filter(team => 
            collectionProgress.completed.includes(team)
        ).length;
        
        console.log(`${conference}: ${completedInConference}/${conferenceTeams.length} teams`);
    });
}

function validateData() {
    console.log('🔍 DATA VALIDATION STARTING...');
    console.log('');
    
    console.log('📋 VALIDATION CHECKLIST:');
    console.log('1. Check file naming consistency');
    console.log('2. Verify JSON structure validity');
    console.log('3. Confirm player count ranges (12-20 per team)');
    console.log('4. Validate rating ranges (50-99 for 2K data)');
    console.log('5. Cross-reference player names between sources');
    console.log('6. Check for post-July 1st roster moves');
    console.log('');
    
    console.log('🔧 VALIDATION COMMANDS:');
    console.log('- validateTeamData("Team Name") - Check specific team');
    console.log('- validateAllTeamData() - Check all collected data');
    console.log('- findDataDiscrepancies() - Find inconsistencies');
}

function validateTeamData(teamName) {
    console.log(`🔍 VALIDATING: ${teamName}`);
    console.log('');
    
    console.log('📋 CHECK THESE FILES:');
    console.log(`1. ESPN: data/current-rosters/teams/${teamName.toLowerCase().replace(/\s+/g, '-')}-current.json`);
    console.log(`2. 2K26: data/nba2k-official/teams/${teamName.toLowerCase().replace(/\s+/g, '-')}.json`);
    console.log('');
    
    console.log('✅ VALIDATION CRITERIA:');
    console.log('- ESPN file has 12-20 players');
    console.log('- 2K26 file has matching player count');
    console.log('- Player names consistent between files');
    console.log('- Overall ratings 50-99 range');
    console.log('- Recent trades/signings included');
    console.log('- Team name and abbreviation correct');
}

function showCollectionStats() {
    const totalTeams = 30;
    const completedCount = collectionProgress.completed.length;
    const percentage = Math.round((completedCount / totalTeams) * 100);
    
    console.log('📊 COLLECTION STATISTICS');
    console.log('========================');
    console.log(`Progress: ${completedCount}/${totalTeams} teams (${percentage}%)`);
    console.log(`Priority Teams: ${PRIORITY_TEAMS.filter(team => collectionProgress.completed.includes(team)).length}/${PRIORITY_TEAMS.length}`);
    console.log('');
    
    if (percentage >= 100) {
        console.log('🎉 COLLECTION COMPLETE!');
        console.log('🔄 Ready for multiplayer and battle system integration');
    } else if (percentage >= 50) {
        console.log('🚀 Great progress! Over halfway complete');
    } else if (percentage >= 25) {
        console.log('💪 Good start! Keep collecting data');
    } else {
        console.log('🎯 Just getting started - focus on priority teams first');
    }
}

// Quick access functions
function help() {
    console.log('🏀 NBA DATA COLLECTION HELP');
    console.log('============================');
    console.log('Main Functions:');
    console.log('- startDataCollectionCoordinator() - Main menu');
    console.log('- collectPriorityTeams() - Start with important teams');
    console.log('- collectTeamData("Team Name") - Collect specific team');
    console.log('- markTeamComplete("Team Name") - Mark team as done');
    console.log('- checkProgress() - See collection status');
    console.log('- validateData() - Data quality checks');
    console.log('- showCollectionStats() - Progress statistics');
    console.log('');
    console.log('Quick Commands:');
    console.log('- help() - Show this help');
    console.log('- teams() - List all NBA teams');
    console.log('- priority() - Show priority teams');
}

function teams() {
    console.log('🏀 ALL NBA TEAMS (30 total)');
    console.log('============================');
    
    Object.entries(NBA_TEAMS).forEach(([conference, divisions]) => {
        console.log(`\n📍 ${conference}:`);
        Object.entries(divisions).forEach(([division, teams]) => {
            console.log(`  ${division}:`);
            teams.forEach(team => {
                const status = collectionProgress.completed.includes(team) ? '✅' : '⏳';
                console.log(`    ${status} ${team}`);
            });
        });
    });
}

function priority() {
    console.log('🎯 PRIORITY TEAMS (10 total)');
    console.log('=============================');
    
    PRIORITY_TEAMS.forEach((team, index) => {
        const status = collectionProgress.completed.includes(team) ? '✅' : '⏳';
        console.log(`${status} ${index + 1}. ${team}`);
    });
    
    console.log('\n📋 Start with: collectTeamData("Los Angeles Lakers")');
}

// Auto-initialize
console.log('🏀 NBA DATA COLLECTION AUTOMATION LOADED!');
console.log('📋 Run: startDataCollectionCoordinator()');
console.log('💡 Or run: help() for all commands'); 