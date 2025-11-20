/**
 * 🏀 HoopsHype NBA 2K Ratings Scraper
 * Clean and simple scraper for hoopshype.com
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

// NBA team slugs for HoopsHype URLs
const NBA_TEAMS = {
    'Atlanta Hawks': 'atlanta-hawks',
    'Boston Celtics': 'boston-celtics',
    'Brooklyn Nets': 'brooklyn-nets',
    'Charlotte Hornets': 'charlotte-hornets',
    'Chicago Bulls': 'chicago-bulls',
    'Cleveland Cavaliers': 'cleveland-cavaliers',
    'Dallas Mavericks': 'dallas-mavericks',
    'Denver Nuggets': 'denver-nuggets',
    'Detroit Pistons': 'detroit-pistons',
    'Golden State Warriors': 'golden-state-warriors',
    'Houston Rockets': 'houston-rockets',
    'Indiana Pacers': 'indiana-pacers',
    'LA Clippers': 'la-clippers',
    'Los Angeles Lakers': 'los-angeles-lakers',
    'Memphis Grizzlies': 'memphis-grizzlies',
    'Miami Heat': 'miami-heat',
    'Milwaukee Bucks': 'milwaukee-bucks',
    'Minnesota Timberwolves': 'minnesota-timberwolves',
    'New Orleans Pelicans': 'new-orleans-pelicans',
    'New York Knicks': 'new-york-knicks',
    'Oklahoma City Thunder': 'oklahoma-city-thunder',
    'Orlando Magic': 'orlando-magic',
    'Philadelphia 76ers': 'philadelphia-76ers',
    'Phoenix Suns': 'phoenix-suns',
    'Portland Trail Blazers': 'portland-trail-blazers',
    'Sacramento Kings': 'sacramento-kings',
    'San Antonio Spurs': 'san-antonio-spurs',
    'Toronto Raptors': 'toronto-raptors',
    'Utah Jazz': 'utah-jazz',
    'Washington Wizards': 'washington-wizards'
};

const OUTPUT_DIR = path.join(__dirname, '../collected-data-2025-nov');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Created output directory: ${OUTPUT_DIR}`);
}

async function scrapeTeamRoster(browser, teamName, teamSlug) {
    console.log(`\n🏀 Scraping ${teamName}...`);

    const page = await browser.newPage();

    try {
        const teamUrl = `https://www.hoopshype.com/nba-2k/players/?team=${teamSlug}`;
        console.log(`   📡 Navigating to: ${teamUrl}`);

        await page.goto(teamUrl, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log(`   📊 Extracting player data...`);

        const teamData = await page.evaluate((name) => {
            const data = {
                team: {
                    name: name,
                    abbreviation: '',
                    city: name.split(' ').slice(0, -1).join(' '),
                    conference: '',
                    division: ''
                },
                data_source: {
                    website: "https://www.hoopshype.com/",
                    collection_date: new Date().toISOString().split('T')[0],
                    game_version: "NBA 2K25",
                    notes: "Current roster from HoopsHype"
                },
                roster: []
            };

            const rows = document.querySelectorAll('table tbody tr');

            // Get top 10 players
            const maxPlayers = Math.min(10, rows.length);

            for (let i = 0; i < maxPlayers; i++) {
                const row = rows[i];
                const cells = row.cells;

                if (cells.length >= 3) {
                    const rank = cells[0].textContent.trim();
                    const playerName = cells[1].textContent.trim();
                    const rating = parseInt(cells[2].textContent.trim());

                    if (playerName && rating > 0) {
                        data.roster.push({
                            name: playerName,
                            position: 'N/A',  // HoopsHype doesn't show position in this table
                            overall_rating: rating,
                            jersey_number: 'N/A',
                            detailed_attributes: null,
                            physical_stats: {
                                height: 'N/A'
                            }
                        });
                    }
                }
            }

            return data;
        }, teamName);

        if (teamData && teamData.roster && teamData.roster.length > 0) {
            // Save to file
            const fileName = `${teamSlug}-2k25-data.json`;
            const filePath = path.join(OUTPUT_DIR, fileName);
            fs.writeFileSync(filePath, JSON.stringify(teamData, null, 2));

            console.log(`   ✅ SUCCESS! Saved ${teamData.roster.length} players to ${fileName}`);
            return { success: true, playerCount: teamData.roster.length };
        } else {
            console.log(`   ⚠️  WARNING: No roster data found for ${teamName}`);
            return { success: false, error: 'No roster data' };
        }

    } catch (error) {
        console.error(`   ❌ ERROR scraping ${teamName}:`, error.message);
        return { success: false, error: error.message };
    } finally {
        await page.close();
    }
}

async function main() {
    console.log('🚀 Starting HoopsHype NBA 2K25 roster collection...\n');
    console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);

    let browser;
    try {
        console.log('🔗 Connecting to Chrome debugging session...');
        browser = await puppeteer.connect({
            browserURL: 'http://localhost:9222',
            defaultViewport: null
        });
        console.log('✅ Connected to Chrome!\n');

        const results = {
            successful: [],
            failed: []
        };

        const teams = Object.entries(NBA_TEAMS);

        // Scrape each team
        for (let i = 0; i < teams.length; i++) {
            const [teamName, teamSlug] = teams[i];
            console.log(`\n[${i + 1}/${teams.length}] Processing ${teamName}...`);

            const result = await scrapeTeamRoster(browser, teamName, teamSlug);

            if (result.success) {
                results.successful.push({ team: teamName, players: result.playerCount });
            } else {
                results.failed.push({ team: teamName, error: result.error });
            }

            // Polite delay between requests
            if (i < teams.length - 1) {
                console.log(`   ⏳ Waiting 2 seconds before next team...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        // Print summary
        console.log('\n\n' + '='.repeat(60));
        console.log('📊 COLLECTION SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Successful: ${results.successful.length}/${teams.length} teams`);
        console.log(`❌ Failed: ${results.failed.length}/${teams.length} teams`);

        if (results.successful.length > 0) {
            console.log('\n✅ Successfully collected:');
            results.successful.forEach(r => {
                console.log(`   - ${r.team}: ${r.players} players`);
            });
        }

        if (results.failed.length > 0) {
            console.log('\n❌ Failed to collect:');
            results.failed.forEach(r => {
                console.log(`   - ${r.team}: ${r.error}`);
            });
        }

        console.log('\n🎉 Collection complete!');
        console.log(`📁 Files saved to: ${OUTPUT_DIR}`);
        console.log('\n📝 Next steps:');
        console.log('   1. Review the collected JSON files');
        console.log('   2. Run: node merge-collected-rosters.js');
        console.log('   3. Test your game with updated rosters!\n');

    } catch (error) {
        console.error('\n❌ FATAL ERROR:', error.message);
    } finally {
        if (browser) {
            await browser.disconnect();
        }
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { scrapeTeamRoster, NBA_TEAMS };
