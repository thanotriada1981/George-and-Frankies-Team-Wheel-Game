/**
 * 🏀 Merge Collected NBA 2K26 Roster Data
 *
 * Merges individual team JSON files into the main nba_teams_data.json
 * Preserves team metadata (colors, logos, coaches) while updating rosters
 *
 * USAGE:
 * node merge-collected-rosters.js
 */

const fs = require('fs');
const path = require('path');

const COLLECTED_DATA_DIR = path.join(__dirname, '../collected-data-2025-nov');
const MAIN_DATABASE_PATH = path.join(__dirname, '../nba/teams/nba_teams_data.json');
const BACKUP_PATH = path.join(__dirname, '../nba/teams/nba_teams_data_backup_pre_nov2025.json');

// Team metadata mapping to preserve colors, logos, etc.
const TEAM_METADATA = {
    'Atlanta Hawks': { id: 'hawks', primaryColor: '#E03A3E', secondaryColor: '#C1D32F', conference: 'Eastern', division: 'Southeast' },
    'Boston Celtics': { id: 'celtics', primaryColor: '#007A33', secondaryColor: '#BA9653', conference: 'Eastern', division: 'Atlantic' },
    'Brooklyn Nets': { id: 'nets', primaryColor: '#000000', secondaryColor: '#FFFFFF', conference: 'Eastern', division: 'Atlantic' },
    'Charlotte Hornets': { id: 'hornets', primaryColor: '#1D1160', secondaryColor: '#00788C', conference: 'Eastern', division: 'Southeast' },
    'Chicago Bulls': { id: 'bulls', primaryColor: '#CE1141', secondaryColor: '#000000', conference: 'Eastern', division: 'Central' },
    'Cleveland Cavaliers': { id: 'cavaliers', primaryColor: '#860038', secondaryColor: '#FDBB30', conference: 'Eastern', division: 'Central' },
    'Dallas Mavericks': { id: 'mavericks', primaryColor: '#00538C', secondaryColor: '#002B5E', conference: 'Western', division: 'Southwest' },
    'Denver Nuggets': { id: 'nuggets', primaryColor: '#0E2240', secondaryColor: '#FEC524', conference: 'Western', division: 'Northwest' },
    'Detroit Pistons': { id: 'pistons', primaryColor: '#C8102E', secondaryColor: '#1D42BA', conference: 'Eastern', division: 'Central' },
    'Golden State Warriors': { id: 'warriors', primaryColor: '#1D428A', secondaryColor: '#FFC72C', conference: 'Western', division: 'Pacific' },
    'Houston Rockets': { id: 'rockets', primaryColor: '#CE1141', secondaryColor: '#000000', conference: 'Western', division: 'Southwest' },
    'Indiana Pacers': { id: 'pacers', primaryColor: '#002D62', secondaryColor: '#FDBB30', conference: 'Eastern', division: 'Central' },
    'LA Clippers': { id: 'clippers', primaryColor: '#C8102E', secondaryColor: '#1D428A', conference: 'Western', division: 'Pacific' },
    'Los Angeles Lakers': { id: 'lakers', primaryColor: '#552583', secondaryColor: '#FDB927', conference: 'Western', division: 'Pacific' },
    'Memphis Grizzlies': { id: 'grizzlies', primaryColor: '#5D76A9', secondaryColor: '#12173F', conference: 'Western', division: 'Southwest' },
    'Miami Heat': { id: 'heat', primaryColor: '#98002E', secondaryColor: '#F9A01B', conference: 'Eastern', division: 'Southeast' },
    'Milwaukee Bucks': { id: 'bucks', primaryColor: '#00471B', secondaryColor: '#EEE1C6', conference: 'Eastern', division: 'Central' },
    'Minnesota Timberwolves': { id: 'timberwolves', primaryColor: '#0C2340', secondaryColor: '#236192', conference: 'Western', division: 'Northwest' },
    'New Orleans Pelicans': { id: 'pelicans', primaryColor: '#0C2340', secondaryColor: '#C8102E', conference: 'Western', division: 'Southwest' },
    'New York Knicks': { id: 'knicks', primaryColor: '#006BB6', secondaryColor: '#F58426', conference: 'Eastern', division: 'Atlantic' },
    'Oklahoma City Thunder': { id: 'thunder', primaryColor: '#007AC1', secondaryColor: '#EF3B24', conference: 'Western', division: 'Northwest' },
    'Orlando Magic': { id: 'magic', primaryColor: '#0077C0', secondaryColor: '#C4CED4', conference: 'Eastern', division: 'Southeast' },
    'Philadelphia 76ers': { id: '76ers', primaryColor: '#006BB6', secondaryColor: '#ED174C', conference: 'Eastern', division: 'Atlantic' },
    'Phoenix Suns': { id: 'suns', primaryColor: '#1D1160', secondaryColor: '#E56020', conference: 'Western', division: 'Pacific' },
    'Portland Trail Blazers': { id: 'blazers', primaryColor: '#E03A3E', secondaryColor: '#000000', conference: 'Western', division: 'Northwest' },
    'Sacramento Kings': { id: 'kings', primaryColor: '#5A2D81', secondaryColor: '#63727A', conference: 'Western', division: 'Pacific' },
    'San Antonio Spurs': { id: 'spurs', primaryColor: '#C4CED4', secondaryColor: '#000000', conference: 'Western', division: 'Southwest' },
    'Toronto Raptors': { id: 'raptors', primaryColor: '#CE1141', secondaryColor: '#000000', conference: 'Eastern', division: 'Atlantic' },
    'Utah Jazz': { id: 'jazz', primaryColor: '#002B5C', secondaryColor: '#F9A01B', conference: 'Western', division: 'Northwest' },
    'Washington Wizards': { id: 'wizards', primaryColor: '#002B5C', secondaryColor: '#E31837', conference: 'Eastern', division: 'Southeast' }
};

function loadExistingDatabase() {
    if (!fs.existsSync(MAIN_DATABASE_PATH)) {
        console.log('⚠️  No existing database found. Creating new one...');
        return { metadata: {}, teams: {} };
    }

    const data = fs.readFileSync(MAIN_DATABASE_PATH, 'utf8');
    return JSON.parse(data);
}

function createBackup(database) {
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(database, null, 2));
    console.log(`✅ Created backup: ${path.basename(BACKUP_PATH)}`);
}

function normalizePlayerData(player, existingRoster) {
    // Try to find this player in the existing roster to get position/jersey#
    let existingPlayer = null;
    if (existingRoster && existingRoster.players) {
        existingPlayer = existingRoster.players.find(p =>
            p.name.toLowerCase() === player.name.toLowerCase()
        );
    }

    // Normalize the collected data format to match our database schema
    return {
        name: player.name,
        jerseyNumber: player.jersey_number !== 'N/A' ? player.jersey_number :
                     (existingPlayer?.jerseyNumber || player.jerseyNumber || 'N/A'),
        position: player.position !== 'N/A' ? player.position :
                 (existingPlayer?.position || 'Guard'), // Default to Guard if unknown
        age: player.age || existingPlayer?.age || null,
        nba2k26Rating: player.overall_rating || player.nba2k26Rating || existingPlayer?.nba2k26Rating || 0,
        detailedAttributes: {
            inside: player.detailed_attributes?.inside || existingPlayer?.detailedAttributes?.inside || 0,
            outside: player.detailed_attributes?.outside || existingPlayer?.detailedAttributes?.outside || 0,
            playmaking: player.detailed_attributes?.playmaking || existingPlayer?.detailedAttributes?.playmaking || 0,
            athleticism: player.detailed_attributes?.athleticism || existingPlayer?.detailedAttributes?.athleticism || 0,
            defending: player.detailed_attributes?.defending || existingPlayer?.detailedAttributes?.defending || 0,
            rebounding: player.detailed_attributes?.rebounding || existingPlayer?.detailedAttributes?.rebounding || 0
        },
        physicalStats: {
            height: player.physical_stats?.height !== 'N/A' ? player.physical_stats?.height :
                   (existingPlayer?.physicalStats?.height || 'N/A'),
            position: player.physical_stats?.position || existingPlayer?.physicalStats?.position || player.position
        },
        lastUpdated: new Date().toISOString()
    };
}

function mergeTeamData(existingTeam, collectedTeam) {
    const teamName = collectedTeam.team?.name || collectedTeam.name;
    const metadata = TEAM_METADATA[teamName] || {};

    // Preserve coach data from existing database or use defaults
    const headCoach = existingTeam?.headCoach || {
        name: 'Head Coach',
        rating: 75,
        experience: 5,
        championships: 0,
        tier: 'GOOD',
        tierName: 'Good Coach',
        tierDescription: 'Solid coaching'
    };

    return {
        id: metadata.id || teamName.toLowerCase().replace(/\s+/g, '-'),
        name: teamName,
        city: collectedTeam.team?.city || teamName.split(' ').slice(0, -1).join(' '),
        abbreviation: collectedTeam.team?.abbreviation || existingTeam?.abbreviation || 'TBD',
        conference: metadata.conference || existingTeam?.conference || 'Unknown',
        division: metadata.division || existingTeam?.division || 'Unknown',
        logo: `assets/logos/nba/${(metadata.id || teamName.toLowerCase().replace(/\s+/g, '_'))}.svg`,
        primaryColor: metadata.primaryColor || existingTeam?.primaryColor || '#000000',
        secondaryColor: metadata.secondaryColor || existingTeam?.secondaryColor || '#FFFFFF',
        headCoach: headCoach,
        lastUpdated: new Date().toISOString(),
        roster: {
            players: collectedTeam.roster.map(p => normalizePlayerData(p, existingTeam?.roster)),
            teamStats: {
                playerCount: collectedTeam.roster.length,
                averageRating: Math.round(
                    collectedTeam.roster.reduce((sum, p) => sum + (p.overall_rating || 0), 0) / collectedTeam.roster.length
                ),
                lastUpdated: new Date().toISOString()
            }
        }
    };
}

function generateChangeReport(oldDatabase, newDatabase) {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            teamsUpdated: 0,
            playersAdded: 0,
            playersRemoved: 0,
            ratingChanges: 0
        },
        details: []
    };

    Object.keys(newDatabase.teams).forEach(teamName => {
        const oldTeam = oldDatabase.teams?.[teamName];
        const newTeam = newDatabase.teams[teamName];

        if (!oldTeam) {
            report.summary.teamsUpdated++;
            report.details.push({
                team: teamName,
                change: 'NEW_TEAM',
                playerCount: newTeam.roster.players.length
            });
            return;
        }

        report.summary.teamsUpdated++;

        const oldPlayers = new Set(oldTeam.roster?.players?.map(p => p.name) || []);
        const newPlayers = new Set(newTeam.roster.players.map(p => p.name));

        // Find additions
        newPlayers.forEach(name => {
            if (!oldPlayers.has(name)) {
                report.summary.playersAdded++;
                report.details.push({
                    team: teamName,
                    change: 'PLAYER_ADDED',
                    player: name
                });
            }
        });

        // Find removals
        oldPlayers.forEach(name => {
            if (!newPlayers.has(name)) {
                report.summary.playersRemoved++;
                report.details.push({
                    team: teamName,
                    change: 'PLAYER_REMOVED',
                    player: name
                });
            }
        });
    });

    return report;
}

function main() {
    console.log('🏀 Starting roster merge process...\n');

    // Check if collected data directory exists
    if (!fs.existsSync(COLLECTED_DATA_DIR)) {
        console.error(`❌ Error: Directory not found: ${COLLECTED_DATA_DIR}`);
        console.log('💡 Run the scraper first: node auto-scrape-all-teams.js');
        process.exit(1);
    }

    // Load existing database
    console.log('📖 Loading existing database...');
    const existingDatabase = loadExistingDatabase();

    // Create backup
    if (existingDatabase.teams && Object.keys(existingDatabase.teams).length > 0) {
        createBackup(existingDatabase);
    }

    // Read all collected team files
    const files = fs.readdirSync(COLLECTED_DATA_DIR).filter(f => f.endsWith('.json'));
    console.log(`📁 Found ${files.length} team files to process\n`);

    const newDatabase = {
        metadata: {
            lastUpdated: new Date().toISOString(),
            season: '2025-26',
            dataSource: 'NBA 2K26 via 2kratings.com',
            totalTeams: files.length,
            collectingProgress: 'Complete - November 2025 Update',
            note: 'Updated with current rosters including trades and rating updates'
        },
        teams: {}
    };

    let processedCount = 0;
    let errorCount = 0;

    files.forEach((file, index) => {
        try {
            console.log(`[${index + 1}/${files.length}] Processing ${file}...`);

            const filePath = path.join(COLLECTED_DATA_DIR, file);
            const collectedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            const teamName = collectedData.team?.name || collectedData.name;
            const existingTeam = existingDatabase.teams?.[teamName];

            const mergedTeam = mergeTeamData(existingTeam, collectedData);
            newDatabase.teams[teamName] = mergedTeam;

            console.log(`   ✅ ${teamName}: ${mergedTeam.roster.players.length} players, avg rating ${mergedTeam.roster.teamStats.averageRating}`);
            processedCount++;

        } catch (error) {
            console.error(`   ❌ Error processing ${file}:`, error.message);
            errorCount++;
        }
    });

    // Generate change report
    console.log('\n📊 Generating change report...');
    const report = generateChangeReport(existingDatabase, newDatabase);

    // Save updated database
    console.log('\n💾 Saving updated database...');
    fs.writeFileSync(MAIN_DATABASE_PATH, JSON.stringify(newDatabase, null, 2));
    console.log(`✅ Saved: ${MAIN_DATABASE_PATH}`);

    // Save change report
    const reportPath = path.join(__dirname, 'roster-update-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`✅ Saved change report: ${reportPath}`);

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 MERGE COMPLETE!');
    console.log('='.repeat(60));
    console.log(`✅ Teams updated: ${processedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`\n📈 Changes:`);
    console.log(`   - Players added: ${report.summary.playersAdded}`);
    console.log(`   - Players removed: ${report.summary.playersRemoved}`);
    console.log(`   - Teams updated: ${report.summary.teamsUpdated}`);
    console.log('\n📁 Files:');
    console.log(`   - Database: ${MAIN_DATABASE_PATH}`);
    console.log(`   - Backup: ${BACKUP_PATH}`);
    console.log(`   - Report: ${reportPath}`);
    console.log('\n🎮 Ready to test your game with updated rosters!\n');
}

if (require.main === module) {
    main();
}

module.exports = { mergeTeamData, normalizePlayerData };
