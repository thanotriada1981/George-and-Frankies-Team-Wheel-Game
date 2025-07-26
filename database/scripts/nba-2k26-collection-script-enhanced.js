/**
 * 🏀 SIMPLIFIED NBA 2K26 RATINGS DATA COLLECTION SCRIPT
 * Focuses on core player data: basic info, detailed attributes, and physical stats
 * 
 * USAGE INSTRUCTIONS:
 * 1. Navigate to https://www.2kratings.com/
 * 2. Click on "NBA 2K26 Teams" or select a specific team
 * 3. Make sure you're on a team page showing NBA 2K26 ratings
 * 4. Open browser console (F12 → Console)
 * 5. Copy and paste this entire script
 * 6. Run: collectSimplified2K26Data()
 * 7. Copy the JSON output and save to appropriate team file
 */

function collectSimplified2K26Data() {
    console.log('🏀 Starting Simplified NBA 2K26 Ratings Collection...');
    
    try {
        const teamData = {
            team: {
                name: getSimplified2KTeamName(),
                abbreviation: '',
                city: '',
                conference: '',
                division: ''
            },
            data_source: {
                website: "https://www.2kratings.com/",
                collection_date: new Date().toISOString().split('T')[0],
                game_version: "NBA 2K26",
                notes: "Simplified collection focusing on core player data"
            },
            roster: []
        };
        
        // Collect simplified player ratings
        const players = collectSimplified2KPlayersData();
        teamData.roster = players;
        
        // Fill in team details
        teamData.team.abbreviation = getTeamAbbreviation(teamData.team.name);
        teamData.team.city = teamData.team.name.split(' ').slice(0, -1).join(' ');
        
        console.log('✅ Simplified 2K26 data collection complete!');
        console.log('📊 Team:', teamData.team.name);
        console.log('👥 Players found:', players.length);
        
        // Output formatted JSON
        console.log('\n🔥 COPY THIS JSON DATA:');
        console.log('==========================================');
        console.log(JSON.stringify(teamData, null, 2));
        console.log('==========================================');
        
        return teamData;
        
    } catch (error) {
        console.error('❌ Error in simplified 2K26 collection:', error);
        return null;
    }
}

function getSimplified2KTeamName() {
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

function collectSimplified2KPlayersData() {
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
        return collectSimplified2KPlayersFromAlternativeStructure();
    }
    
    playerElements.forEach((element, index) => {
        try {
            const player = extractSimplified2KPlayerData(element, index);
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

function extractSimplified2KPlayerData(element, index) {
    const player = {
        name: extractSimplified2KPlayerName(element),
        position: extractSimplified2KPosition(element),
        overall_rating: extractSimplified2KOverall(element),
        jersey_number: extractSimplified2KJerseyNumber(element),
        detailed_attributes: extractSimplified2KDetailedAttributes(element),
        physical_stats: extractSimplified2KPhysicalStats(element)
    };
    
    return player;
}

function extractSimplified2KPlayerName(element) {
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

function extractSimplified2KPosition(element) {
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

function extractSimplified2KOverall(element) {
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

function extractSimplified2KJerseyNumber(element) {
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

function extractSimplified2KDetailedAttributes(element) {
    const attributes = {};
    
    // Enhanced 2K attribute categories with more comprehensive coverage
    const attributeCategories = {
        'inside': ['inside', 'layup', 'dunk', 'post', 'close', 'finishing', 'driving_layup', 'standing_dunk', 'post_hook', 'post_fade'],
        'outside': ['outside', 'three', '3pt', 'mid', 'range', 'shooting', 'three_point_shot', 'mid_range_shot', 'free_throw'],
        'playmaking': ['playmaking', 'pass', 'ball', 'handle', 'iq', 'pass_accuracy', 'pass_vision', 'ball_handle', 'speed_with_ball'],
        'athleticism': ['athleticism', 'speed', 'vertical', 'strength', 'acceleration', 'speed_with_ball', 'lateral_quickness', 'hustle'],
        'defending': ['defending', 'defense', 'perimeter', 'interior', 'steal', 'block', 'perimeter_defense', 'interior_defense', 'lateral_quickness'],
        'rebounding': ['rebounding', 'rebound', 'offensive', 'defensive', 'offensive_rebound', 'defensive_rebound']
    };
    
    // Look for attribute values in the element
    const text = element.textContent.toLowerCase();
    
    // Enhanced pattern matching for more comprehensive attribute detection
    Object.entries(attributeCategories).forEach(([category, keywords]) => {
        for (let keyword of keywords) {
            // Multiple regex patterns to catch different formats
            const patterns = [
                new RegExp(`${keyword}[\\s:]*([0-9]{2,3})`, 'i'),
                new RegExp(`${keyword}\\s*=\\s*([0-9]{2,3})`, 'i'),
                new RegExp(`${keyword}\\s*\\(([0-9]{2,3})\\)`, 'i'),
                new RegExp(`([0-9]{2,3})\\s*${keyword}`, 'i')
            ];
            
            for (let pattern of patterns) {
                const match = text.match(pattern);
                if (match) {
                    const value = parseInt(match[1]);
                    if (value >= 25 && value <= 99) {
                        attributes[category] = value;
                        break;
                    }
                }
            }
            if (attributes[category]) break; // Found this category, move to next
        }
    });
    
    // Additional attribute extraction from data attributes and classes
    const attributeElements = element.querySelectorAll('[data-attribute], [data-rating], .attribute, .rating, .stat-value');
    attributeElements.forEach(attrElement => {
        const attrName = attrElement.getAttribute('data-attribute') || 
                        attrElement.getAttribute('data-rating') ||
                        attrElement.className.replace(/[^a-zA-Z_]/g, '');
        const attrValue = parseInt(attrElement.textContent.trim());
        
        if (attrName && attrValue >= 25 && attrValue <= 99) {
            // Map to our standard categories
            const normalizedName = attrName.toLowerCase();
            if (normalizedName.includes('inside') || normalizedName.includes('layup') || normalizedName.includes('dunk')) {
                attributes.inside = attrValue;
            } else if (normalizedName.includes('outside') || normalizedName.includes('three') || normalizedName.includes('shoot')) {
                attributes.outside = attrValue;
            } else if (normalizedName.includes('playmaking') || normalizedName.includes('pass') || normalizedName.includes('ball')) {
                attributes.playmaking = attrValue;
            } else if (normalizedName.includes('athleticism') || normalizedName.includes('speed') || normalizedName.includes('vertical')) {
                attributes.athleticism = attrValue;
            } else if (normalizedName.includes('defending') || normalizedName.includes('defense') || normalizedName.includes('steal')) {
                attributes.defending = attrValue;
            } else if (normalizedName.includes('rebounding') || normalizedName.includes('rebound')) {
                attributes.rebounding = attrValue;
            }
        }
    });
    
    // Look for specific attribute patterns in text content
    const specificPatterns = {
        'inside': /(layup|dunk|post|finishing|inside)[\s:]*(\d{2,3})/gi,
        'outside': /(three|shooting|mid|range|outside)[\s:]*(\d{2,3})/gi,
        'playmaking': /(pass|ball|handle|playmaking)[\s:]*(\d{2,3})/gi,
        'athleticism': /(speed|vertical|strength|athleticism)[\s:]*(\d{2,3})/gi,
        'defending': /(defense|steal|block|defending)[\s:]*(\d{2,3})/gi,
        'rebounding': /(rebound|rebounding)[\s:]*(\d{2,3})/gi
    };
    
    Object.entries(specificPatterns).forEach(([category, pattern]) => {
        if (!attributes[category]) { // Only if not already found
            const matches = text.matchAll(pattern);
            for (let match of matches) {
                const value = parseInt(match[2]);
                if (value >= 25 && value <= 99) {
                    attributes[category] = value;
                    break;
                }
            }
        }
    });
    
    // If no detailed attributes found, return null
    return Object.keys(attributes).length > 0 ? attributes : null;
}

function extractSimplified2KPhysicalStats(element) {
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

function collectSimplified2KPlayersFromAlternativeStructure() {
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
                jersey_number: 'N/A',
                detailed_attributes: null,
                physical_stats: null
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
console.log('🏀 Simplified NBA 2K26 Collection Script Loaded!');
console.log('📋 Run: collectSimplified2K26Data()');
console.log('💡 Make sure you are on a team page showing NBA 2K26 ratings!'); 