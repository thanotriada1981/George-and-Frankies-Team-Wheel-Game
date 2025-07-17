/**
 * 🏀 ENHANCED ESPN NBA ROSTER DATA COLLECTION SCRIPT - 2025 SEASON
 * Optimized for post-July 1st, 2025 free agency and current ESPN.com structure
 * 
 * USAGE INSTRUCTIONS:
 * 1. Navigate to https://www.espn.com/nba/teams  
 * 2. Click on any team (e.g., Los Angeles Lakers)
 * 3. Click "Roster" tab if not already selected
 * 4. Open browser console (F12 → Console)
 * 5. Copy and paste this entire script
 * 6. Run: collectEnhancedESPNData()
 * 7. Copy the JSON output and save to appropriate team file
 */

function collectEnhancedESPNData() {
    console.log('🏀 Starting Enhanced ESPN NBA Roster Collection for 2025-26 Season...');
    
    try {
        const teamData = {
            team: {
                name: getEnhancedTeamName(),
                abbreviation: '',
                city: '',
                conference: '',
                division: ''
            },
            data_source: {
                website: "https://www.espn.com/nba/teams",
                collection_date: new Date().toISOString().split('T')[0],
                season: "2025-26",
                notes: "Post-July 1st 2025 free agency roster with all trades and signings"
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
        
        // Collect enhanced player data
        const players = collectEnhancedPlayersData();
        teamData.roster = players;
        
        // Fill in team details
        teamData.team.abbreviation = getTeamAbbreviation(teamData.team.name);
        teamData.team.city = teamData.team.name.split(' ').slice(0, -1).join(' ');
        
        // Calculate stats
        teamData.roster_stats = calculateEnhancedRosterStats(players);
        
        console.log('✅ Enhanced data collection complete!');
        console.log('📊 Team:', teamData.team.name);
        console.log('👥 Players found:', players.length);
        
        // Output formatted JSON
        console.log('\n🔥 COPY THIS JSON DATA:');
        console.log('==========================================');
        console.log(JSON.stringify(teamData, null, 2));
        console.log('==========================================');
        
        return teamData;
        
    } catch (error) {
        console.error('❌ Error in enhanced collection:', error);
        return null;
    }
}

function getEnhancedTeamName() {
    // Enhanced team name detection for 2025 ESPN structure
    const selectors = [
        '.ClubhouseHeader__Name',
        '.team-name',
        '.TeamHeader__Name',
        '.Page__Title',
        'h1',
        '.Roster__TeamName',
        '.team-header h1'
    ];
    
    for (let selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            let teamName = element.textContent.trim();
            // Clean up common ESPN formatting
            teamName = teamName.replace(/Roster|Schedule|Stats|News/gi, '').trim();
            if (teamName.length > 3) {
                console.log(`✅ Found team name: ${teamName}`);
                return teamName;
            }
        }
    }
    
    // Fallback: extract from URL
    const url = window.location.href;
    const urlMatch = url.match(/\/team\/[^\/]+\/([^\/]+)/);
    if (urlMatch) {
        return urlMatch[1].split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    return prompt('Enter team name (e.g., "Los Angeles Lakers"):') || 'Unknown Team';
}

function collectEnhancedPlayersData() {
    const players = [];
    
    // Enhanced selectors for 2025 ESPN structure
    const tableSelectors = [
        '.Table__Scroller table',
        '.ResponsiveTable table',
        '.RosterTable table', 
        '.roster-table',
        'table[class*="Table"]',
        'table'
    ];
    
    let rosterTable = null;
    for (let selector of tableSelectors) {
        rosterTable = document.querySelector(selector);
        if (rosterTable) {
            console.log(`✅ Found roster table with selector: ${selector}`);
            break;
        }
    }
    
    if (!rosterTable) {
        console.warn('⚠️ No roster table found. Trying alternative approach...');
        return collectPlayersFromAlternativeStructure();
    }
    
    const playerRows = Array.from(rosterTable.querySelectorAll('tbody tr, tr')).filter(row => {
        const cells = row.querySelectorAll('td');
        return cells.length >= 3; // Should have at least name, position, number
    });
    
    console.log(`🔍 Found ${playerRows.length} player rows`);
    
    playerRows.forEach((row, index) => {
        try {
            const player = extractEnhancedPlayerData(row, index);
            if (player && player.name && player.name.length > 2) {
                players.push(player);
                console.log(`✅ ${index + 1}. ${player.name} - ${player.position} (#${player.jersey_number})`);
            }
        } catch (error) {
            console.warn(`⚠️ Error processing row ${index}:`, error);
        }
    });
    
    return players.filter(p => p.name !== 'Unknown Player' && !p.name.match(/^(Name|Player)$/i));
}

function extractEnhancedPlayerData(row, index) {
    const cells = Array.from(row.querySelectorAll('td, th'));
    
    // Skip header rows
    if (cells.length < 3 || row.querySelector('th')) {
        return null;
    }
    
    const player = {
        name: extractEnhancedPlayerName(row),
        position: extractEnhancedPosition(row),
        jersey_number: extractEnhancedJerseyNumber(row),
        height: extractPlayerHeight(row),
        weight: extractPlayerWeight(row),
        age: extractPlayerAge(row),
        experience: extractPlayerExperience(row),
        college: extractPlayerCollege(row),
        salary: extractPlayerSalary(row),
        status: determinePlayerStatus(row),
        roster_status: index < 5 ? 'starter' : 'bench' // First 5 typically starters
    };
    
    return player;
}

function extractEnhancedPlayerName(row) {
    // Enhanced name extraction for current ESPN structure
    const nameSelectors = [
        'a[href*="/player/"]',
        '.AnchorLink',
        'td:first-child a',
        'td:nth-child(1) a',
        'td:nth-child(2) a',
        '.player-name a',
        '.Table__TD a'
    ];
    
    for (let selector of nameSelectors) {
        const element = row.querySelector(selector);
        if (element) {
            let name = element.textContent.trim();
            // Clean up ESPN formatting
            name = name.replace(/\s+/g, ' ').trim();
            if (name.length > 2) return name;
        }
    }
    
    // Fallback: look in text content of cells
    const cells = row.querySelectorAll('td');
    for (let i = 0; i < Math.min(3, cells.length); i++) {
        const text = cells[i].textContent.trim();
        if (text && text.length > 2 && !text.match(/^\d+$/) && !text.match(/^(PG|SG|SF|PF|C|G|F)$/)) {
            return text;
        }
    }
    
    return 'Unknown Player';
}

function extractEnhancedPosition(row) {
    const cells = Array.from(row.querySelectorAll('td'));
    
    // Look for position in any cell
    for (let cell of cells) {
        const text = cell.textContent.trim();
        if (text.match(/^(PG|SG|SF|PF|C|G|F|Point Guard|Shooting Guard|Small Forward|Power Forward|Center|Guard|Forward)$/i)) {
            return text.toUpperCase().substr(0, 2);
        }
    }
    
    return 'N/A';
}

function extractEnhancedJerseyNumber(row) {
    const cells = Array.from(row.querySelectorAll('td'));
    
    for (let cell of cells) {
        const text = cell.textContent.trim();
        if (text.match(/^\d{1,2}$/) && parseInt(text) >= 0 && parseInt(text) <= 99) {
            return text;
        }
    }
    
    return 'N/A';
}

function extractPlayerHeight(row) {
    const cells = Array.from(row.querySelectorAll('td'));
    
    for (let cell of cells) {
        const text = cell.textContent.trim();
        if (text.match(/^\d[\'\-]\d+/)) { // 6'8" or 6-8 format
            return text;
        }
    }
    
    return 'N/A';
}

function extractPlayerWeight(row) {
    const cells = Array.from(row.querySelectorAll('td'));
    
    for (let cell of cells) {
        const text = cell.textContent.trim();
        if (text.match(/^\d{2,3}\s*lbs?$/i)) {
            return text;
        }
    }
    
    return 'N/A';
}

function extractPlayerAge(row) {
    const cells = Array.from(row.querySelectorAll('td'));
    
    for (let cell of cells) {
        const text = cell.textContent.trim();
        if (text.match(/^\d{2}$/) && parseInt(text) >= 18 && parseInt(text) <= 45) {
            return text;
        }
    }
    
    return 'N/A';
}

function extractPlayerExperience(row) {
    const cells = Array.from(row.querySelectorAll('td'));
    
    for (let cell of cells) {
        const text = cell.textContent.trim();
        if (text.match(/^\d{1,2}$/) && text !== extractPlayerAge(row)) {
            return text + ' years';
        }
        if (text.toLowerCase().includes('rookie') || text.toLowerCase().includes('r')) {
            return 'Rookie';
        }
    }
    
    return 'N/A';
}

function extractPlayerCollege(row) {
    const cells = Array.from(row.querySelectorAll('td'));
    
    for (let cell of cells) {
        const text = cell.textContent.trim();
        if (text.length > 3 && 
            !text.match(/^\d/) && 
            !text.match(/^(PG|SG|SF|PF|C|G|F)$/) &&
            text !== extractEnhancedPlayerName(row)) {
            return text;
        }
    }
    
    return 'N/A';
}

function extractPlayerSalary(row) {
    const cells = Array.from(row.querySelectorAll('td'));
    
    for (let cell of cells) {
        const text = cell.textContent.trim();
        if (text.match(/\$[\d,]+/)) {
            return text;
        }
    }
    
    return 'N/A';
}

function determinePlayerStatus(row) {
    const rowText = row.textContent.toLowerCase();
    
    if (rowText.includes('injured') || rowText.includes('out') || rowText.includes('dnp')) {
        return 'injured';
    }
    if (rowText.includes('questionable') || rowText.includes('probable')) {
        return 'questionable';
    }
    
    return 'active';
}

function calculateEnhancedRosterStats(players) {
    return {
        total_players: players.length,
        active_players: players.filter(p => p.status === 'active').length,
        injured_players: players.filter(p => p.status === 'injured').length,
        questionable_players: players.filter(p => p.status === 'questionable').length,
        starters_identified: players.some(p => p.roster_status === 'starter'),
        positions: {
            guards: players.filter(p => p.position.includes('G')).length,
            forwards: players.filter(p => p.position.includes('F')).length,
            centers: players.filter(p => p.position === 'C').length
        },
        last_updated: new Date().toISOString().split('T')[0]
    };
}

function collectPlayersFromAlternativeStructure() {
    // Alternative approach for different ESPN layouts
    const players = [];
    const playerElements = document.querySelectorAll('[data-player-uid], .player-card, .roster-player');
    
    playerElements.forEach((element, index) => {
        const name = element.querySelector('.player-name, .name, a')?.textContent?.trim();
        const position = element.querySelector('.position, .pos')?.textContent?.trim();
        const number = element.querySelector('.number, .jersey')?.textContent?.trim();
        
        if (name && name.length > 2) {
            players.push({
                name: name,
                position: position || 'N/A',
                jersey_number: number || 'N/A',
                status: 'active',
                roster_status: index < 5 ? 'starter' : 'bench'
            });
        }
    });
    
    return players;
}

function getTeamAbbreviation(teamName) {
    const abbreviations = {
        'Atlanta Hawks': 'ATL', 'Boston Celtics': 'BOS', 'Brooklyn Nets': 'BKN',
        'Charlotte Hornets': 'CHA', 'Chicago Bulls': 'CHI', 'Cleveland Cavaliers': 'CLE',
        'Dallas Mavericks': 'DAL', 'Denver Nuggets': 'DEN', 'Detroit Pistons': 'DET',
        'Golden State Warriors': 'GSW', 'Houston Rockets': 'HOU', 'Indiana Pacers': 'IND',
        'LA Clippers': 'LAC', 'Los Angeles Clippers': 'LAC', 'Los Angeles Lakers': 'LAL',
        'Memphis Grizzlies': 'MEM', 'Miami Heat': 'MIA', 'Milwaukee Bucks': 'MIL',
        'Minnesota Timberwolves': 'MIN', 'New Orleans Pelicans': 'NOP', 'New York Knicks': 'NYK',
        'Oklahoma City Thunder': 'OKC', 'Orlando Magic': 'ORL', 'Philadelphia 76ers': 'PHI',
        'Philadelphia Sixers': 'PHI', 'Phoenix Suns': 'PHX', 'Portland Trail Blazers': 'POR',
        'Sacramento Kings': 'SAC', 'San Antonio Spurs': 'SAS', 'Toronto Raptors': 'TOR',
        'Utah Jazz': 'UTA', 'Washington Wizards': 'WAS'
    };
    
    return abbreviations[teamName] || teamName.substring(0, 3).toUpperCase();
}

// Auto-run instructions
console.log('🏀 Enhanced ESPN Collection Script Loaded!');
console.log('📋 Run: collectEnhancedESPNData()');
console.log('💡 Make sure you are on a team roster page first!'); 