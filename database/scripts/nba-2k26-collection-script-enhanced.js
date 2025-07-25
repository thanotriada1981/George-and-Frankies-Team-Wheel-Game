/**
 * 🏀 ENHANCED NBA 2K26 RATINGS DATA COLLECTION SCRIPT
 * Optimized for 2kratings.com current structure and NBA 2K26 data
 * 
 * USAGE INSTRUCTIONS:
 * 1. Navigate to https://www.2kratings.com/
 * 2. Click on "NBA 2K26 Teams" or select a specific team
 * 3. Make sure you're on a team page showing NBA 2K26 ratings
 * 4. Open browser console (F12 → Console)
 * 5. Copy and paste this entire script
 * 6. Run: collectEnhanced2K26Data()
 * 7. Copy the JSON output and save to appropriate team file
 */

function collectEnhanced2K26Data() {
    console.log('🏀 Starting Enhanced NBA 2K26 Ratings Collection...');
    
    try {
        const teamData = {
            team: {
                name: getEnhanced2KTeamName(),
                abbreviation: '',
                city: '',
                conference: '',
                division: ''
            },
            data_source: {
                website: "https://www.2kratings.com/",
                collection_date: new Date().toISOString().split('T')[0],
                game_version: "NBA 2K26",
                notes: "Enhanced collection with detailed player attributes and team stats"
            },
            roster: [],
            team_stats: {
                total_players: 0,
                average_overall: 0,
                highest_rated: { player: "", rating: 0 },
                lowest_rated: { player: "", rating: 100 },
                team_strengths: [],
                position_breakdown: {},
                rating_distribution: {}
            }
        };
        
        // Collect enhanced player ratings
        const players = collectEnhanced2KPlayersData();
        teamData.roster = players;
        
        // Fill in team details
        teamData.team.abbreviation = getTeamAbbreviation(teamData.team.name);
        teamData.team.city = teamData.team.name.split(' ').slice(0, -1).join(' ');
        
        // Calculate enhanced team stats
        teamData.team_stats = calculateEnhanced2KTeamStats(players);
        
        console.log('✅ Enhanced 2K26 data collection complete!');
        console.log('📊 Team:', teamData.team.name);
        console.log('👥 Players found:', players.length);
        console.log('⭐ Average Overall:', teamData.team_stats.average_overall);
        
        // Output formatted JSON
        console.log('\n🔥 COPY THIS JSON DATA:');
        console.log('==========================================');
        console.log(JSON.stringify(teamData, null, 2));
        console.log('==========================================');
        
        return teamData;
        
    } catch (error) {
        console.error('❌ Error in enhanced 2K26 collection:', error);
        return null;
    }
}

function getEnhanced2KTeamName() {
    // Enhanced team name detection for 2kratings.com
    const selectors = [
        'h1',
        '.team-name',
        '.page-title',
        '.team-header h1',
        '.breadcrumb-item.active',
        'title'
    ];
    
    for (let selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            let teamName = element.textContent.trim();
            
            // Extract team name from title like "Atlanta Hawks NBA 2K26 Ratings"
            const match = teamName.match(/^(.+?)\s+NBA\s+2K26/i);
            if (match) {
                console.log(`✅ Found team name: ${match[1]}`);
                return match[1];
            }
            
            // Clean up common 2kratings formatting
            teamName = teamName.replace(/NBA 2K26|Ratings|Players|Stats/gi, '').trim();
            if (teamName.length > 3 && !teamName.match(/^\d/)) {
                console.log(`✅ Found team name: ${teamName}`);
                return teamName;
            }
        }
    }
    
    // Fallback: extract from URL
    const url = window.location.href;
    const urlMatch = url.match(/\/teams?\/([^\/]+)/);
    if (urlMatch) {
        return urlMatch[1].split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    return prompt('Enter team name (e.g., "Los Angeles Lakers"):') || 'Unknown Team';
}

function collectEnhanced2KPlayersData() {
    const players = [];
    
    // Enhanced selectors for 2kratings.com structure
    const playerSelectors = [
        '.player-card',
        '.player-row',
        '.roster-player',
        'tr[data-player]',
        '.player-item',
        'tbody tr',
        '.table-responsive tr'
    ];
    
    let playerElements = [];
    for (let selector of playerSelectors) {
        playerElements = Array.from(document.querySelectorAll(selector));
        if (playerElements.length > 5) {
            console.log(`✅ Found ${playerElements.length} players with selector: ${selector}`);
            break;
        }
    }
    
    if (playerElements.length === 0) {
        console.warn('⚠️ No players found. Trying alternative approach...');
        return collect2KPlayersFromAlternativeStructure();
    }
    
    playerElements.forEach((element, index) => {
        try {
            const player = extractEnhanced2KPlayerData(element, index);
            if (player && player.name && player.name.length > 2 && player.overall_rating > 0) {
                players.push(player);
                console.log(`✅ ${index + 1}. ${player.name} - ${player.overall_rating} OVR (${player.position})`);
            }
        } catch (error) {
            console.warn(`⚠️ Error processing player ${index}:`, error);
        }
    });
    
    return players.filter(p => 
        p.name !== 'Unknown Player' && 
        !p.name.match(/^(Name|Player|Overall)$/i) &&
        p.overall_rating >= 50 && 
        p.overall_rating <= 99
    );
}

function extractEnhanced2KPlayerData(element, index) {
    const player = {
        name: extractEnhanced2KPlayerName(element),
        position: extractEnhanced2KPosition(element),
        overall_rating: extractEnhanced2KOverall(element),
        jersey_number: extractEnhanced2KJerseyNumber(element),
        detailed_ratings: extractDetailed2KRatings(element),
        archetype: extractPlayerArchetype(element),
        badges: extractPlayerBadges(element),
        physical_stats: extractPhysicalStats(element)
    };
    
    return player;
}

function extractEnhanced2KPlayerName(element) {
    const nameSelectors = [
        '.player-name',
        '.name',
        'a[href*="player"]',
        '.player-link',
        'td:first-child a',
        'h3', 'h4', 'h5',
        '.player-title'
    ];
    
    for (let selector of nameSelectors) {
        const nameElement = element.querySelector(selector);
        if (nameElement) {
            let name = nameElement.textContent.trim();
            // Clean up 2kratings formatting
            name = name.replace(/\s+/g, ' ').trim();
            if (name.length > 2 && !name.match(/^\d+$/)) {
                return name;
            }
        }
    }
    
    // Fallback: look in text content
    const text = element.textContent.trim();
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 2);
    
    for (let line of lines) {
        if (!line.match(/^\d+$/) && 
            !line.match(/^(PG|SG|SF|PF|C|G|F)$/) && 
            line.length > 2 && 
            line.length < 30) {
            return line;
        }
    }
    
    return 'Unknown Player';
}

function extractEnhanced2KPosition(element) {
    const positionSelectors = [
        '.position',
        '.pos',
        '.player-position',
        '[data-position]'
    ];
    
    for (let selector of positionSelectors) {
        const posElement = element.querySelector(selector);
        if (posElement) {
            const pos = posElement.textContent.trim();
            if (pos.match(/^(PG|SG|SF|PF|C|G|F)$/i)) {
                return pos.toUpperCase();
            }
        }
    }
    
    // Look in all text content for position
    const text = element.textContent;
    const posMatch = text.match(/\b(PG|SG|SF|PF|C|Point Guard|Shooting Guard|Small Forward|Power Forward|Center)\b/i);
    if (posMatch) {
        const pos = posMatch[1].toUpperCase();
        return pos.substr(0, 2);
    }
    
    return 'N/A';
}

function extractEnhanced2KOverall(element) {
    const overallSelectors = [
        '.overall',
        '.rating',
        '.overall-rating',
        '.ovr',
        '[data-overall]',
        '.player-rating'
    ];
    
    for (let selector of overallSelectors) {
        const overallElement = element.querySelector(selector);
        if (overallElement) {
            const overall = parseInt(overallElement.textContent.trim());
            if (overall >= 50 && overall <= 99) {
                return overall;
            }
        }
    }
    
    // Look for rating in text content
    const text = element.textContent;
    const ratingMatches = text.match(/\b(\d{2})\b/g);
    
    if (ratingMatches) {
        for (let match of ratingMatches) {
            const rating = parseInt(match);
            if (rating >= 50 && rating <= 99) {
                return rating;
            }
        }
    }
    
    return 0;
}

function extractEnhanced2KJerseyNumber(element) {
    const numberSelectors = [
        '.jersey-number',
        '.number',
        '.jersey',
        '[data-jersey]'
    ];
    
    for (let selector of numberSelectors) {
        const numberElement = element.querySelector(selector);
        if (numberElement) {
            const number = numberElement.textContent.trim();
            if (number.match(/^\d{1,2}$/)) {
                return number;
            }
        }
    }
    
    // Look for jersey number in text
    const text = element.textContent;
    const numberMatch = text.match(/#(\d{1,2})\b/);
    if (numberMatch) {
        return numberMatch[1];
    }
    
    return 'N/A';
}

function extractDetailed2KRatings(element) {
    const ratings = {};
    
    // Common 2K rating attributes
    const attributes = [
        'three_point_shot', '3pt', 'three_point',
        'mid_range_shot', 'mid_range', 'midrange', 
        'driving_layup', 'layup', 'driving_dunk', 'dunk',
        'standing_dunk', 'post_hook', 'post_fade',
        'draw_foul', 'hands', 'free_throw',
        'pass_accuracy', 'pass_vision', 'pass_iq',
        'ball_handle', 'speed_with_ball', 'interior_defense',
        'perimeter_defense', 'lateral_quickness', 'steal',
        'block', 'offensive_rebound', 'defensive_rebound',
        'speed', 'acceleration', 'strength', 'vertical',
        'hustle', 'overall_durability'
    ];
    
    const attributeElements = element.querySelectorAll('[data-attribute], .attribute, .stat-value');
    
    attributeElements.forEach(attrElement => {
        const attrName = attrElement.getAttribute('data-attribute') || 
                        attrElement.className.replace(/[^a-zA-Z_]/g, '');
        const attrValue = parseInt(attrElement.textContent.trim());
        
        if (attrName && attrValue >= 25 && attrValue <= 99) {
            ratings[attrName] = attrValue;
        }
    });
    
    return Object.keys(ratings).length > 0 ? ratings : null;
}

function extractPlayerArchetype(element) {
    const archetypeSelectors = [
        '.archetype',
        '.player-type',
        '.build',
        '.player-archetype'
    ];
    
    for (let selector of archetypeSelectors) {
        const archetypeElement = element.querySelector(selector);
        if (archetypeElement) {
            return archetypeElement.textContent.trim();
        }
    }
    
    return null;
}

function extractPlayerBadges(element) {
    const badgeElements = element.querySelectorAll('.badge, .player-badge, [data-badge]');
    const badges = Array.from(badgeElements).map(badge => badge.textContent.trim());
    
    return badges.length > 0 ? badges : null;
}

function extractPhysicalStats(element) {
    const physicalStats = {};
    
    const text = element.textContent;
    
    // Height
    const heightMatch = text.match(/(\d'?\s*\d+)\s*["']?/);
    if (heightMatch) {
        physicalStats.height = heightMatch[1];
    }
    
    // Weight
    const weightMatch = text.match(/(\d{2,3})\s*lbs?/i);
    if (weightMatch) {
        physicalStats.weight = weightMatch[1] + ' lbs';
    }
    
    // Age
    const ageMatch = text.match(/Age:\s*(\d{2})|(\d{2})\s*years?\s*old/i);
    if (ageMatch) {
        physicalStats.age = ageMatch[1] || ageMatch[2];
    }
    
    return Object.keys(physicalStats).length > 0 ? physicalStats : null;
}

function calculateEnhanced2KTeamStats(players) {
    if (players.length === 0) {
        return {
            total_players: 0,
            average_overall: 0,
            highest_rated: { player: "", rating: 0 },
            lowest_rated: { player: "", rating: 0 }
        };
    }
    
    const overallRatings = players.map(p => p.overall_rating).filter(r => r > 0);
    const averageOverall = Math.round(overallRatings.reduce((a, b) => a + b, 0) / overallRatings.length);
    
    const sortedPlayers = players.sort((a, b) => b.overall_rating - a.overall_rating);
    const highest = sortedPlayers[0];
    const lowest = sortedPlayers[sortedPlayers.length - 1];
    
    // Position breakdown
    const positionBreakdown = {};
    players.forEach(player => {
        const pos = player.position || 'Unknown';
        positionBreakdown[pos] = (positionBreakdown[pos] || 0) + 1;
    });
    
    // Rating distribution
    const ratingDistribution = {};
    ['90+', '85-89', '80-84', '75-79', '70-74', '<70'].forEach(range => {
        ratingDistribution[range] = 0;
    });
    
    players.forEach(player => {
        const rating = player.overall_rating;
        if (rating >= 90) ratingDistribution['90+']++;
        else if (rating >= 85) ratingDistribution['85-89']++;
        else if (rating >= 80) ratingDistribution['80-84']++;
        else if (rating >= 75) ratingDistribution['75-79']++;
        else if (rating >= 70) ratingDistribution['70-74']++;
        else ratingDistribution['<70']++;
    });
    
    return {
        total_players: players.length,
        average_overall: averageOverall,
        highest_rated: { 
            player: highest.name, 
            rating: highest.overall_rating 
        },
        lowest_rated: { 
            player: lowest.name, 
            rating: lowest.overall_rating 
        },
        team_strengths: determineTeamStrengths(players),
        position_breakdown: positionBreakdown,
        rating_distribution: ratingDistribution
    };
}

function determineTeamStrengths(players) {
    const strengths = [];
    const averageOverall = players.reduce((sum, p) => sum + p.overall_rating, 0) / players.length;
    
    if (averageOverall >= 85) strengths.push('Elite Overall Team');
    if (averageOverall >= 80) strengths.push('Strong Team');
    
    const topPlayers = players.filter(p => p.overall_rating >= 85);
    if (topPlayers.length >= 3) strengths.push('Star Power');
    
    const guards = players.filter(p => p.position && p.position.includes('G'));
    const forwards = players.filter(p => p.position && p.position.includes('F'));
    const centers = players.filter(p => p.position === 'C');
    
    if (guards.length >= 4) strengths.push('Guard Depth');
    if (forwards.length >= 4) strengths.push('Forward Depth');
    if (centers.length >= 2) strengths.push('Center Depth');
    
    return strengths;
}

function collect2KPlayersFromAlternativeStructure() {
    // Alternative approach for different 2kratings layouts
    const players = [];
    
    // Try to find player data in different formats
    const playerElements = document.querySelectorAll('div[class*="player"], li[class*="player"], .roster-item');
    
    playerElements.forEach((element, index) => {
        const name = element.querySelector('.name, h3, h4, a')?.textContent?.trim();
        const overall = element.textContent.match(/\b(\d{2})\b/);
        const overallRating = overall ? parseInt(overall[1]) : 0;
        
        if (name && name.length > 2 && overallRating >= 50 && overallRating <= 99) {
            players.push({
                name: name,
                position: 'N/A',
                overall_rating: overallRating,
                jersey_number: 'N/A'
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
console.log('🏀 Enhanced NBA 2K26 Collection Script Loaded!');
console.log('📋 Run: collectEnhanced2K26Data()');
console.log('💡 Make sure you are on a team page showing NBA 2K26 ratings!'); 