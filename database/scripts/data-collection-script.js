/**
 * NBA 2K Ratings Data Collection Script
 * Run this in the browser console while on 2kratings.com
 * 
 * USAGE:
 * 1. Navigate to https://www.2kratings.com/
 * 2. Open browser console (F12)
 * 3. Paste this script and run it
 * 4. Script will collect data for current team
 * 5. Copy the JSON output and save to appropriate team file
 */

function collect2KRatingsData() {
    console.log('🏀 Starting NBA 2K Ratings Data Collection...');
    
    try {
        // Get team information from the page
        const teamName = getTeamName();
        const teamData = {
            team: {
                name: teamName,
                abbreviation: getTeamAbbreviation(teamName),
                city: teamName.split(' ')[0],
                conference: "", // Will need to be filled manually
                division: ""    // Will need to be filled manually
            },
            data_source: {
                website: "https://www.2kratings.com/",
                collection_date: new Date().toISOString().split('T')[0],
                game_version: "NBA 2K26",
                notes: "Collected via automated script"
            },
            roster: [],
            team_stats: {
                total_players: 0,
                average_overall: 0,
                highest_rated: { player: "", rating: 0 },
                team_strengths: []
            }
        };

        // Collect player data
        const players = collectPlayerData();
        teamData.roster = players;
        
        // Calculate team stats
        teamData.team_stats = calculateTeamStats(players);
        
        console.log('✅ Data collection complete!');
        console.log('📊 Found', players.length, 'players');
        console.log('🏆 Highest rated player:', teamData.team_stats.highest_rated.player, 
                   '(' + teamData.team_stats.highest_rated.rating + ')');
        
        // Output the JSON data
        console.log('\n📋 COPY THIS JSON DATA:');
        console.log('='.repeat(50));
        console.log(JSON.stringify(teamData, null, 2));
        console.log('='.repeat(50));
        
        return teamData;
        
    } catch (error) {
        console.error('❌ Error collecting data:', error);
        console.log('💡 Make sure you are on a team page at 2kratings.com');
        return null;
    }
}

function getTeamName() {
    // Try different selectors to find team name
    const selectors = [
        'h1',
        '.team-name',
        '[data-team-name]',
        '.page-title',
        'title'
    ];
    
    for (let selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.includes('NBA')) {
            const text = element.textContent.trim();
            // Extract team name from title like "Atlanta Hawks NBA 2K26 Ratings"
            const match = text.match(/^(.+?)\s+NBA/);
            if (match) return match[1];
        }
    }
    
    // Fallback: try to get from URL
    const url = window.location.href;
    const urlMatch = url.match(/\/([^\/]+)$/);
    if (urlMatch) {
        return urlMatch[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return 'Unknown Team';
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
    
    return abbreviations[teamName] || 'UNK';
}

function collectPlayerData() {
    const players = [];
    
    // Try to find player rows in the table
    const playerRows = document.querySelectorAll('tr, .player-row, .roster-item');
    
    playerRows.forEach((row, index) => {
        try {
            const player = extractPlayerFromRow(row, index + 1);
            if (player && player.name) {
                players.push(player);
            }
        } catch (error) {
            console.warn('⚠️ Error processing player row:', error);
        }
    });
    
    return players;
}

function extractPlayerFromRow(row, position) {
    // This function will need to be adapted based on the actual HTML structure
    // For now, providing a template that can be customized
    
    const cells = row.querySelectorAll('td, .cell, .player-stat');
    if (cells.length < 4) return null;
    
    // Extract data from cells (adjust indices based on actual website structure)
    const player = {
        name: extractPlayerName(row),
        jersey_number: extractJerseyNumber(row),
        position: extractPosition(row),
        height: extractHeight(row),
        nationality: extractNationality(row),
        ratings: {
            overall: extractOverallRating(row),
            three_point: extractThreePointRating(row),
            dunk: extractDunkRating(row)
        },
        player_type: extractPlayerType(row),
        archetype: extractArchetype(row),
        roster_position: position
    };
    
    return player;
}

function extractPlayerName(row) {
    // Look for player name in various possible locations
    const nameSelectors = ['.player-name', '.name', 'td:nth-child(2)', '.player-info'];
    for (let selector of nameSelectors) {
        const element = row.querySelector(selector);
        if (element) {
            return element.textContent.trim();
        }
    }
    return 'Unknown Player';
}

function extractOverallRating(row) {
    // Look for overall rating - usually the first or most prominent number
    const ratingSelectors = ['.overall', '.ovr', '.rating-overall', 'td:nth-child(3)'];
    for (let selector of ratingSelectors) {
        const element = row.querySelector(selector);
        if (element) {
            const rating = parseInt(element.textContent.trim());
            if (!isNaN(rating) && rating >= 60 && rating <= 99) {
                return rating;
            }
        }
    }
    return 75; // Default rating
}

function extractThreePointRating(row) {
    // Look for 3PT rating
    const selectors = ['.three-point', '.3pt', 'td:nth-child(4)'];
    for (let selector of selectors) {
        const element = row.querySelector(selector);
        if (element) {
            const rating = parseInt(element.textContent.trim());
            if (!isNaN(rating)) return rating;
        }
    }
    return 70; // Default
}

function extractDunkRating(row) {
    // Look for dunk rating
    const selectors = ['.dunk', '.dnk', 'td:nth-child(5)'];
    for (let selector of selectors) {
        const element = row.querySelector(selector);
        if (element) {
            const rating = parseInt(element.textContent.trim());
            if (!isNaN(rating)) return rating;
        }
    }
    return 60; // Default
}

function extractPosition(row) {
    const positionSelectors = ['.position', '.pos', 'td:nth-child(1)'];
    for (let selector of positionSelectors) {
        const element = row.querySelector(selector);
        if (element) {
            return element.textContent.trim();
        }
    }
    return 'Unknown';
}

function extractHeight(row) {
    // Look for height information
    const heightSelectors = ['.height', '.ht', '.player-height'];
    for (let selector of heightSelectors) {
        const element = row.querySelector(selector);
        if (element) {
            return element.textContent.trim();
        }
    }
    return 'Unknown';
}

function extractJerseyNumber(row) {
    const numberSelectors = ['.number', '.jersey', '.num'];
    for (let selector of numberSelectors) {
        const element = row.querySelector(selector);
        if (element) {
            const num = parseInt(element.textContent.trim());
            if (!isNaN(num)) return num;
        }
    }
    return null;
}

function extractNationality(row) {
    // Look for country flags or nationality
    const nationalitySelectors = ['.country', '.nationality', '.flag'];
    for (let selector of nationalitySelectors) {
        const element = row.querySelector(selector);
        if (element) {
            return element.textContent.trim() || element.title || 'USA';
        }
    }
    return 'USA'; // Default
}

function extractPlayerType(row) {
    // Look for player archetype/type description
    const typeSelectors = ['.player-type', '.archetype', '.description'];
    for (let selector of typeSelectors) {
        const element = row.querySelector(selector);
        if (element) {
            return element.textContent.trim();
        }
    }
    return 'Balanced Player';
}

function extractArchetype(row) {
    // Generate archetype description based on ratings
    const overall = extractOverallRating(row);
    const threePoint = extractThreePointRating(row);
    const dunk = extractDunkRating(row);
    
    if (overall >= 90) return 'Elite player with superstar potential';
    if (threePoint >= 85) return 'Elite shooter with range';
    if (dunk >= 85) return 'Athletic finisher with dunking ability';
    return 'Solid contributor with balanced skills';
}

function calculateTeamStats(players) {
    if (players.length === 0) return { total_players: 0, average_overall: 0, highest_rated: null };
    
    const totalOverall = players.reduce((sum, player) => sum + player.ratings.overall, 0);
    const averageOverall = Math.round(totalOverall / players.length);
    
    const highestRated = players.reduce((best, player) => 
        player.ratings.overall > best.ratings.overall ? player : best
    );
    
    return {
        total_players: players.length,
        average_overall: averageOverall,
        highest_rated: {
            player: highestRated.name,
            rating: highestRated.ratings.overall
        },
        team_strengths: generateTeamStrengths(players)
    };
}

function generateTeamStrengths(players) {
    const avgThreePoint = players.reduce((sum, p) => sum + p.ratings.three_point, 0) / players.length;
    const avgDunk = players.reduce((sum, p) => sum + p.ratings.dunk, 0) / players.length;
    const avgOverall = players.reduce((sum, p) => sum + p.ratings.overall, 0) / players.length;
    
    const strengths = [];
    if (avgThreePoint >= 80) strengths.push('Elite three-point shooting');
    if (avgDunk >= 80) strengths.push('Strong finishing ability');
    if (avgOverall >= 85) strengths.push('High overall talent');
    if (players.some(p => p.ratings.overall >= 95)) strengths.push('Superstar talent');
    
    return strengths.length > 0 ? strengths : ['Balanced team'];
}

// Instructions for use
console.log(`
🏀 NBA 2K Ratings Data Collection Script Loaded!

📋 INSTRUCTIONS:
1. Navigate to a team page on 2kratings.com
2. Run: collect2KRatingsData()
3. Copy the JSON output
4. Save to: data/nba2k-official/teams/[team-name].json

⚠️  NOTE: You may need to adjust the extractPlayerFromRow function
   based on the actual HTML structure of the website.

🚀 Ready to collect data! Run: collect2KRatingsData()
`);

// Auto-run if we're on 2kratings.com
if (window.location.href.includes('2kratings.com')) {
    console.log('✅ Detected 2kratings.com - Script ready to use!');
    console.log('🎯 Run collect2KRatingsData() to start collecting data');
} 