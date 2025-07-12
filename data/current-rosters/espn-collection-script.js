/**
 * ESPN NBA Current Roster Data Collection Script
 * Run this in browser console while on ESPN NBA team pages
 * 
 * USAGE:
 * 1. Navigate to https://www.espn.com/nba/players
 * 2. Click on a specific team
 * 3. Open browser console (F12)
 * 4. Paste this script and run collectESPNRosterData()
 * 5. Copy JSON output and save to team file
 */

function collectESPNRosterData() {
    console.log('🏀 Starting ESPN NBA Current Roster Collection...');
    
    try {
        // Get team information
        const teamName = getTeamNameFromESPN();
        const teamData = {
            team: {
                name: teamName,
                abbreviation: getTeamAbbreviation(teamName),
                city: teamName.split(' ')[0] || teamName.split(' ')[1],
                conference: "", // Will be filled manually
                division: ""    // Will be filled manually
            },
            data_source: {
                website: "https://www.espn.com/nba/players",
                collection_date: new Date().toISOString().split('T')[0],
                season: "2024-25",
                notes: "Current roster with all trades and signings"
            },
            roster: [],
            roster_stats: {
                total_players: 0,
                active_players: 0,
                injured_players: 0,
                starters_identified: false,
                last_updated: new Date().toISOString().split('T')[0]
            },
            notable_changes: []
        };

        // Collect player data from ESPN
        const players = collectPlayersFromESPN();
        teamData.roster = players;
        
        // Calculate roster stats
        teamData.roster_stats = calculateRosterStats(players);
        
        console.log('✅ ESPN roster collection complete!');
        console.log('👥 Found', players.length, 'players for', teamName);
        
        // Output formatted JSON
        console.log('\n📋 COPY THIS JSON DATA:');
        console.log('='.repeat(60));
        console.log(JSON.stringify(teamData, null, 2));
        console.log('='.repeat(60));
        
        return teamData;
        
    } catch (error) {
        console.error('❌ Error collecting ESPN data:', error);
        console.log('💡 Make sure you are on a team page at ESPN NBA players');
        return null;
    }
}

function getTeamNameFromESPN() {
    // Try different selectors to find team name on ESPN
    const selectors = [
        'h1',
        '.team-name',
        '.ClubhouseHeader__Name',
        '.team-header h1',
        '.page-title',
        '[data-testid="team-name"]',
        '.TeamHeader h1'
    ];
    
    for (let selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            let text = element.textContent.trim();
            // Clean up common ESPN page title formats
            text = text.replace(/\s+(Roster|Players|Team).*$/i, '');
            text = text.replace(/^NBA\s+/i, '');
            if (text && text.length > 3) {
                return text;
            }
        }
    }
    
    // Try to extract from URL
    const url = window.location.href;
    const urlParts = url.split('/');
    for (let i = 0; i < urlParts.length; i++) {
        if (urlParts[i] === 'team' && urlParts[i + 2]) {
            return urlParts[i + 2].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    }
    
    // Fallback: prompt user
    return prompt('Enter team name (e.g., "Los Angeles Lakers"):') || 'Unknown Team';
}

function getTeamAbbreviation(teamName) {
    const abbreviations = {
        'Atlanta Hawks': 'ATL',
        'Boston Celtics': 'BOS',
        'Brooklyn Nets': 'BKN',
        'Charlotte Hornets': 'CHA',
        'Chicago Bulls': 'CHI',
        'Cleveland Cavaliers': 'CLE',
        'Dallas Mavericks': 'DAL',
        'Denver Nuggets': 'DEN',
        'Detroit Pistons': 'DET',
        'Golden State Warriors': 'GSW',
        'Houston Rockets': 'HOU',
        'Indiana Pacers': 'IND',
        'LA Clippers': 'LAC',
        'Los Angeles Clippers': 'LAC',
        'Los Angeles Lakers': 'LAL',
        'Memphis Grizzlies': 'MEM',
        'Miami Heat': 'MIA',
        'Milwaukee Bucks': 'MIL',
        'Minnesota Timberwolves': 'MIN',
        'New Orleans Pelicans': 'NOP',
        'New York Knicks': 'NYK',
        'Oklahoma City Thunder': 'OKC',
        'Orlando Magic': 'ORL',
        'Philadelphia 76ers': 'PHI',
        'Phoenix Suns': 'PHX',
        'Portland Trail Blazers': 'POR',
        'Sacramento Kings': 'SAC',
        'San Antonio Spurs': 'SAS',
        'Toronto Raptors': 'TOR',
        'Utah Jazz': 'UTA',
        'Washington Wizards': 'WAS'
    };
    
    return abbreviations[teamName] || teamName.substring(0, 3).toUpperCase();
}

function collectPlayersFromESPN() {
    const players = [];
    
    // Try different ESPN roster table structures
    const playerSelectors = [
        '.Table__TR',
        '.roster-table tr',
        '.player-row',
        '.PlayerTable tr',
        'tbody tr',
        '.Table tbody tr'
    ];
    
    let playerRows = [];
    for (let selector of playerSelectors) {
        playerRows = Array.from(document.querySelectorAll(selector));
        if (playerRows.length > 3) break; // Found substantial player list
    }
    
    console.log(`🔍 Found ${playerRows.length} potential player rows`);
    
    playerRows.forEach((row, index) => {
        try {
            const player = extractPlayerFromESPNRow(row, index);
            if (player && player.name && player.name.length > 2) {
                players.push(player);
                console.log(`✅ Added: ${player.name} (${player.position})`);
            }
        } catch (error) {
            console.warn('⚠️ Error processing player row:', error);
        }
    });
    
    return players.filter(p => p.name !== 'Unknown Player');
}

function extractPlayerFromESPNRow(row, index) {
    const cells = Array.from(row.querySelectorAll('td, th'));
    
    // Skip header rows
    if (cells.length === 0 || row.querySelector('th')) {
        return null;
    }
    
    const player = {
        name: extractPlayerNameFromESPN(row),
        position: extractPositionFromESPN(row),
        jersey_number: extractJerseyNumberFromESPN(row),
        status: extractPlayerStatusFromESPN(row),
        years_pro: extractYearsProFromESPN(row),
        college: extractCollegeFromESPN(row),
        roster_status: determineRosterStatus(index)
    };
    
    return player;
}

function extractPlayerNameFromESPN(row) {
    // ESPN typically has player names in links or specific cells
    const nameSelectors = [
        'a[href*="/player/"]',
        '.player-name',
        '.AnchorLink',
        'td:nth-child(1) a',
        'td:nth-child(2) a',
        '.Table__TD a'
    ];
    
    for (let selector of nameSelectors) {
        const element = row.querySelector(selector);
        if (element) {
            return element.textContent.trim();
        }
    }
    
    // Fallback: look for any link or first cell with text
    const firstLink = row.querySelector('a');
    if (firstLink) {
        return firstLink.textContent.trim();
    }
    
    const cells = row.querySelectorAll('td');
    for (let cell of cells) {
        const text = cell.textContent.trim();
        if (text && text.length > 2 && !text.match(/^\d+$/)) {
            return text;
        }
    }
    
    return 'Unknown Player';
}

function extractPositionFromESPN(row) {
    const cells = Array.from(row.querySelectorAll('td'));
    
    // Look for typical position abbreviations
    for (let cell of cells) {
        const text = cell.textContent.trim();
        if (text.match(/^(PG|SG|SF|PF|C|G|F)$/)) {
            return text;
        }
    }
    
    // Look for longer position names
    for (let cell of cells) {
        const text = cell.textContent.trim().toLowerCase();
        if (text.includes('guard')) return text.includes('point') ? 'PG' : 'SG';
        if (text.includes('forward')) return text.includes('small') ? 'SF' : 'PF';
        if (text.includes('center')) return 'C';
    }
    
    return 'Unknown';
}

function extractJerseyNumberFromESPN(row) {
    const cells = Array.from(row.querySelectorAll('td'));
    
    // Look for numbers that could be jersey numbers (0-99)
    for (let cell of cells) {
        const text = cell.textContent.trim();
        const num = parseInt(text);
        if (!isNaN(num) && num >= 0 && num <= 99) {
            return num;
        }
    }
    
    return null;
}

function extractPlayerStatusFromESPN(row) {
    const text = row.textContent.toLowerCase();
    
    if (text.includes('injured') || text.includes('out')) return 'Injured';
    if (text.includes('suspended')) return 'Suspended';
    if (text.includes('inactive')) return 'Inactive';
    
    return 'Active';
}

function extractYearsProFromESPN(row) {
    const cells = Array.from(row.querySelectorAll('td'));
    
    // Look for year patterns
    for (let cell of cells) {
        const text = cell.textContent.trim();
        if (text.match(/^\d+$/)) {
            const year = parseInt(text);
            if (year >= 0 && year <= 25) { // Reasonable range for NBA experience
                return year;
            }
        }
    }
    
    return null;
}

function extractCollegeFromESPN(row) {
    const cells = Array.from(row.querySelectorAll('td'));
    
    // Look for college names (usually longer text that's not a number)
    for (let cell of cells) {
        const text = cell.textContent.trim();
        if (text && text.length > 3 && !text.match(/^\d+$/) && 
            !text.match(/^(PG|SG|SF|PF|C|G|F)$/) &&
            !text.match(/^\$/) && !text.includes('$')) {
            // Could be college name
            return text;
        }
    }
    
    return 'Unknown';
}

function determineRosterStatus(index) {
    // First 5-8 players are typically starters
    if (index < 8) return 'Starter';
    return 'Bench';
}

function calculateRosterStats(players) {
    const activeCount = players.filter(p => p.status === 'Active').length;
    const injuredCount = players.filter(p => p.status === 'Injured').length;
    
    return {
        total_players: players.length,
        active_players: activeCount,
        injured_players: injuredCount,
        starters_identified: players.some(p => p.roster_status === 'Starter'),
        last_updated: new Date().toISOString().split('T')[0]
    };
}

// Instructions
console.log(`
🏀 ESPN NBA Current Roster Collection Script Loaded!

📋 INSTRUCTIONS:
1. Navigate to ESPN NBA team page
2. Make sure you can see the roster/players
3. Run: collectESPNRosterData()
4. Copy the JSON output
5. Save to: data/current-rosters/teams/[team-name]-current.json

⚠️  NOTE: Script may need adjustment based on ESPN's HTML structure

🚀 Ready! Run: collectESPNRosterData()
`);

// Auto-detect if we're on ESPN
if (window.location.href.includes('espn.com')) {
    console.log('✅ Detected ESPN.com - Script ready to use!');
    console.log('🎯 Run collectESPNRosterData() to start');
} 