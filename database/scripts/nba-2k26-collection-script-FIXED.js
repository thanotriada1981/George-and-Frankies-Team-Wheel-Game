/**
 * 🏀 FIXED NBA 2K26 RATINGS COLLECTION SCRIPT
 * Works with 2kratings.com table structure
 *
 * USAGE:
 * Run in browser console OR via Puppeteer page.evaluate()
 */

function collectSimplified2K26Data() {
    console.log('🏀 Starting NBA 2K26 data collection...');

    // Get team name from page
    const teamName = getTeamName();

    const teamData = {
        team: {
            name: teamName,
            abbreviation: '',
            city: teamName.split(' ').slice(0, -1).join(' '),
            conference: '',
            division: ''
        },
        data_source: {
            website: "https://www.2kratings.com/",
            collection_date: new Date().toISOString().split('T')[0],
            game_version: "NBA 2K26",
            notes: "Top 10 players from current roster"
        },
        roster: []
    };

    // Get table rows
    const rows = document.querySelectorAll('table.table tbody tr');
    console.log(`Found ${rows.length} total rows`);

    if (rows.length === 0) {
        console.error('❌ No table rows found!');
        return null;
    }

    // Process only first 10 rows (top players)
    const maxPlayers = Math.min(10, rows.length);

    for (let i = 0; i < maxPlayers; i++) {
        const row = rows[i];
        const cells = row.cells;

        if (cells.length < 3) {
            console.warn(`⚠️  Row ${i} has insufficient cells`);
            continue;
        }

        try {
            // Column 1 contains: "16   Trae Young     PG | 6'1"  | Crafty Offensive Engine"
            const playerInfo = cells[1].textContent.trim();

            // Column 2 contains overall rating (might have extra numbers)
            const ratingText = cells[2].textContent.trim();

            // Parse player info
            const player = parsePlayerInfo(playerInfo, ratingText);

            if (player && player.name && player.overall_rating > 0) {
                teamData.roster.push(player);
                console.log(`✅ ${i + 1}. ${player.name} - ${player.overall_rating} OVR (${player.position})`);
            }
        } catch (error) {
            console.warn(`⚠️  Error parsing row ${i}:`, error.message);
        }
    }

    console.log(`\n✅ Collected ${teamData.roster.length} players`);
    return teamData;
}

function getTeamName() {
    // Try to extract team name from page title or heading
    const titleMatch = document.title.match(/^(.+?)\s+(?:NBA 2K|Ratings|Players)/i);
    if (titleMatch) {
        return titleMatch[1].trim();
    }

    const h1 = document.querySelector('h1');
    if (h1) {
        const text = h1.textContent.trim();
        return text.replace(/NBA 2K\d+|Ratings|Players/gi, '').trim();
    }

    return 'Unknown Team';
}

function parsePlayerInfo(playerInfo, ratingText) {
    // Example: "16   Trae Young     PG | 6'1"  | Crafty Offensive Engine"

    // Split by pipe to separate sections
    const parts = playerInfo.split('|').map(p => p.trim());

    // First part contains jersey# and name
    // Example: "16   Trae Young     PG"
    const namePart = parts[0];

    // Extract jersey number (first number at start)
    const jerseyMatch = namePart.match(/^(\d+)\s+/);
    const jerseyNumber = jerseyMatch ? jerseyMatch[1] : 'N/A';

    // Remove jersey number to get name and position
    const nameAndPos = namePart.replace(/^\d+\s+/, '').trim();

    // Position is usually the last word (PG, SG, C, PF, etc.)
    const posMatch = nameAndPos.match(/\b(PG|SG|SF|PF|C|G|F)\b\s*$/i);
    const position = posMatch ? posMatch[1] : 'N/A';

    // Name is everything before the position
    const name = nameAndPos.replace(/\s+(PG|SG|SF|PF|C|G|F)\s*$/i, '').trim();

    // Height is in second part
    const height = parts[1] ? parts[1].trim() : 'N/A';

    // Archetype is in third part
    const archetype = parts[2] ? parts[2].trim() : '';

    // Parse overall rating (take first number from rating column)
    const ratingMatch = ratingText.match(/(\d+)/);
    const overall_rating = ratingMatch ? parseInt(ratingMatch[1]) : 0;

    return {
        name: name,
        position: position,
        overall_rating: overall_rating,
        jersey_number: jerseyNumber,
        detailed_attributes: null,  // Not available in this view
        physical_stats: {
            height: height,
            archetype: archetype
        }
    };
}

// Export for use in Node.js or run directly in browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { collectSimplified2K26Data };
}
