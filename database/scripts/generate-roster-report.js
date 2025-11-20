/**
 * Generate a formatted roster report for all 30 teams
 */

const fs = require('fs');
const path = require('path');

const DATABASE_PATH = path.join(__dirname, '../nba/teams/nba_teams_data.json');

function generateRosterReport() {
    console.log('📊 Generating NBA Roster Report...\n');

    const data = JSON.parse(fs.readFileSync(DATABASE_PATH, 'utf8'));

    console.log('='.repeat(80));
    console.log('🏀 NBA TEAM ROSTERS - NOVEMBER 2025 UPDATE');
    console.log('='.repeat(80));
    console.log(`Season: ${data.metadata.season}`);
    console.log(`Last Updated: ${new Date(data.metadata.lastUpdated).toLocaleString()}`);
    console.log(`Total Teams: ${data.metadata.totalTeams}`);
    console.log('='.repeat(80));
    console.log('');

    const teams = Object.values(data.teams).sort((a, b) => a.name.localeCompare(b.name));

    teams.forEach((team, index) => {
        console.log(`\n${index + 1}. ${team.name.toUpperCase()}`);
        console.log('-'.repeat(80));
        console.log(`   Conference: ${team.conference} | Division: ${team.division}`);
        console.log(`   Head Coach: ${team.headCoach?.name || 'Unknown'}`);
        console.log(`   Team Average Rating: ${team.roster.teamStats?.averageRating || 'N/A'}`);
        console.log(`   Players: ${team.roster.players?.length || 0}`);
        console.log('');

        if (team.roster.players && team.roster.players.length > 0) {
            console.log('   TOP 10 PLAYERS:');
            console.log('   Rank | Name                    | Pos  | Rating | Jersey');
            console.log('   ' + '-'.repeat(70));

            team.roster.players
                .sort((a, b) => (b.nba2k26Rating || 0) - (a.nba2k26Rating || 0))
                .forEach((player, pIndex) => {
                    const name = player.name.padEnd(23);
                    const pos = (player.position || 'N/A').padEnd(4);
                    const rating = String(player.nba2k26Rating || 0).padStart(2);
                    const jersey = (player.jerseyNumber || 'N/A').padEnd(6);
                    console.log(`   ${String(pIndex + 1).padStart(2)}   | ${name} | ${pos} | ${rating}     | #${jersey}`);
                });
        } else {
            console.log('   No players found.');
        }
    });

    console.log('\n');
    console.log('='.repeat(80));
    console.log('📊 REPORT COMPLETE');
    console.log('='.repeat(80));
    console.log(`\nTotal teams: ${teams.length}`);
    console.log(`Total players: ${teams.reduce((sum, t) => sum + (t.roster.players?.length || 0), 0)}`);
}

generateRosterReport();
