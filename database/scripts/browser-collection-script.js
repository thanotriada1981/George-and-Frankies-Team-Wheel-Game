// 🏀 NBA 2K26 Data Collection Script for Browser Console
// Copy and paste this entire script into your browser console on 2kratings.com

function collectNBA2K26Data() {
    console.log('🏀 Collecting NBA 2K26 Data...');
    
    const teamData = {
        team: getTeamName(),
        players: []
    };
    
    // Find all player elements
    const playerElements = document.querySelectorAll('.player-card, .player-row, .roster-player, tr[data-player], .player-item');
    
    playerElements.forEach((element, index) => {
        const player = extractPlayerData(element);
        if (player && player.name && player.overall_rating > 0) {
            teamData.players.push(player);
            console.log(`✅ ${index + 1}. ${player.name} - ${player.overall_rating} OVR`);
        }
    });
    
    console.log('\n🔥 COPY THIS JSON DATA:');
    console.log('==========================================');
    console.log(JSON.stringify(teamData, null, 2));
    console.log('==========================================');
    
    return teamData;
}

function getTeamName() {
    const selectors = ['h1', '.team-name', '.page-title', 'title'];
    for (let selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            let teamName = element.textContent.trim();
            teamName = teamName.replace(/NBA 2K26|Ratings|Players|Stats/gi, '').trim();
            if (teamName.length > 3) {
                return teamName;
            }
        }
    }
    return 'Unknown Team';
}

function extractPlayerData(element) {
    const player = {
        name: extractPlayerName(element),
        position: extractPosition(element),
        overall_rating: extractOverall(element),
        jersey_number: extractJerseyNumber(element),
        detailed_attributes: extractDetailedAttributes(element),
        physical_stats: extractPhysicalStats(element)
    };
    
    return player;
}

function extractPlayerName(element) {
    const nameSelectors = ['.player-name', '.name', 'a[href*="player"]', 'h3', 'h4', '.player-title'];
    for (let selector of nameSelectors) {
        const nameElement = element.querySelector(selector);
        if (nameElement) {
            const name = nameElement.textContent.trim();
            if (name.length > 2 && !name.match(/^\d+$/)) {
                return name;
            }
        }
    }
    return null;
}

function extractPosition(element) {
    const positionSelectors = ['.position', '.pos', '[data-position]'];
    for (let selector of positionSelectors) {
        const posElement = element.querySelector(selector);
        if (posElement) {
            const pos = posElement.textContent.trim();
            if (pos.match(/^(PG|SG|SF|PF|C|G|F)$/i)) {
                return pos.toUpperCase();
            }
        }
    }
    return 'N/A';
}

function extractOverall(element) {
    const overallSelectors = ['.overall', '.rating', '.overall-rating', '.ovr', '[data-overall]'];
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

function extractJerseyNumber(element) {
    const numberSelectors = ['.jersey-number', '.number', '[data-jersey]'];
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

function extractDetailedAttributes(element) {
    const attributes = {};
    const text = element.textContent.toLowerCase();
    
    // Look for attribute patterns
    const patterns = {
        'inside': /(inside|layup|dunk|post|finishing)[\s:]*([0-9]{2,3})/i,
        'outside': /(outside|three|shooting|mid|range)[\s:]*([0-9]{2,3})/i,
        'playmaking': /(playmaking|pass|ball|handle|iq)[\s:]*([0-9]{2,3})/i,
        'athleticism': /(athleticism|speed|vertical|strength|acceleration)[\s:]*([0-9]{2,3})/i,
        'defending': /(defending|defense|steal|block|perimeter|interior)[\s:]*([0-9]{2,3})/i,
        'rebounding': /(rebounding|rebound|offensive|defensive)[\s:]*([0-9]{2,3})/i
    };
    
    Object.entries(patterns).forEach(([category, pattern]) => {
        const match = text.match(pattern);
        if (match) {
            const value = parseInt(match[2]);
            if (value >= 25 && value <= 99) {
                attributes[category] = value;
            }
        }
    });
    
    return Object.keys(attributes).length > 0 ? attributes : null;
}

function extractPhysicalStats(element) {
    const text = element.textContent;
    const stats = {};
    
    // Height
    const heightMatch = text.match(/(\d'?\s*\d+)\s*["']?/);
    if (heightMatch) stats.height = heightMatch[1];
    
    // Weight
    const weightMatch = text.match(/(\d{2,3})\s*lbs?/i);
    if (weightMatch) stats.weight = weightMatch[1] + ' lbs';
    
    // Age
    const ageMatch = text.match(/Age:\s*(\d{2})|(\d{2})\s*years?\s*old/i);
    if (ageMatch) stats.age = ageMatch[1] || ageMatch[2];
    
    return Object.keys(stats).length > 0 ? stats : null;
}

// Auto-run instructions
console.log('🏀 NBA 2K26 Collection Script Loaded!');
console.log('📋 Run: collectNBA2K26Data()');
console.log('💡 Make sure you are on a team page showing NBA 2K26 ratings!'); 