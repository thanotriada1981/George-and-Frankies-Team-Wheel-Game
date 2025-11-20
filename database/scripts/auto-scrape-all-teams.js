/**
 * 🏀 Automated NBA 2K26 Team Roster Scraper
 *
 * Scrapes all 30 NBA team rosters from 2kratings.com using Chrome debugging mode
 * This avoids bot detection by using a real browser instance.
 *
 * SETUP:
 * 1. Close ALL Chrome windows
 * 2. Run Chrome with debugging enabled:
 *    macOS: /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug"
 *    Windows: "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\temp\chrome-debug"
 *    Linux: google-chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug"
 *
 * USAGE:
 * 1. npm install puppeteer-core
 * 2. node auto-scrape-all-teams.js
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

// All 30 NBA teams with their 2kratings.com URLs
const NBA_TEAMS = [
    // Eastern Conference - Atlantic
    { name: 'Atlanta Hawks', slug: 'atlanta-hawks' },
    { name: 'Boston Celtics', slug: 'boston-celtics' },
    { name: 'Brooklyn Nets', slug: 'brooklyn-nets' },
    { name: 'Charlotte Hornets', slug: 'charlotte-hornets' },
    { name: 'Chicago Bulls', slug: 'chicago-bulls' },
    { name: 'Cleveland Cavaliers', slug: 'cleveland-cavaliers' },
    { name: 'Dallas Mavericks', slug: 'dallas-mavericks' },
    { name: 'Denver Nuggets', slug: 'denver-nuggets' },
    { name: 'Detroit Pistons', slug: 'detroit-pistons' },
    { name: 'Golden State Warriors', slug: 'golden-state-warriors' },
    { name: 'Houston Rockets', slug: 'houston-rockets' },
    { name: 'Indiana Pacers', slug: 'indiana-pacers' },
    { name: 'LA Clippers', slug: 'la-clippers' },
    { name: 'Los Angeles Lakers', slug: 'los-angeles-lakers' },
    { name: 'Memphis Grizzlies', slug: 'memphis-grizzlies' },
    { name: 'Miami Heat', slug: 'miami-heat' },
    { name: 'Milwaukee Bucks', slug: 'milwaukee-bucks' },
    { name: 'Minnesota Timberwolves', slug: 'minnesota-timberwolves' },
    { name: 'New Orleans Pelicans', slug: 'new-orleans-pelicans' },
    { name: 'New York Knicks', slug: 'new-york-knicks' },
    { name: 'Oklahoma City Thunder', slug: 'oklahoma-city-thunder' },
    { name: 'Orlando Magic', slug: 'orlando-magic' },
    { name: 'Philadelphia 76ers', slug: 'philadelphia-76ers' },
    { name: 'Phoenix Suns', slug: 'phoenix-suns' },
    { name: 'Portland Trail Blazers', slug: 'portland-trail-blazers' },
    { name: 'Sacramento Kings', slug: 'sacramento-kings' },
    { name: 'San Antonio Spurs', slug: 'san-antonio-spurs' },
    { name: 'Toronto Raptors', slug: 'toronto-raptors' },
    { name: 'Utah Jazz', slug: 'utah-jazz' },
    { name: 'Washington Wizards', slug: 'washington-wizards' }
];

const OUTPUT_DIR = path.join(__dirname, '../collected-data-2025-nov');
const COLLECTION_SCRIPT_PATH = path.join(__dirname, 'nba-2k26-collection-script-FIXED.js');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Created output directory: ${OUTPUT_DIR}`);
}

// Read the collection script
const collectionScript = fs.readFileSync(COLLECTION_SCRIPT_PATH, 'utf8');

async function scrapeTeamRoster(browser, team) {
    console.log(`\n🏀 Scraping ${team.name}...`);

    const page = await browser.newPage();

    try {
        // Navigate to team page
        const teamUrl = `https://www.2kratings.com/teams/${team.slug}`;
        console.log(`   📡 Navigating to: ${teamUrl}`);

        await page.goto(teamUrl, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Inject and run the collection script
        console.log(`   📊 Running collection script...`);
        await page.evaluate(collectionScript);

        // Run the collection function
        const teamData = await page.evaluate(() => {
            return collectSimplified2K26Data();
        });

        if (teamData && teamData.roster && teamData.roster.length > 0) {
            // Save to file
            const fileName = `${team.slug}-2k26-data.json`;
            const filePath = path.join(OUTPUT_DIR, fileName);
            fs.writeFileSync(filePath, JSON.stringify(teamData, null, 2));

            console.log(`   ✅ SUCCESS! Saved ${teamData.roster.length} players to ${fileName}`);
            return { success: true, playerCount: teamData.roster.length };
        } else {
            console.log(`   ⚠️  WARNING: No roster data found for ${team.name}`);
            return { success: false, error: 'No roster data' };
        }

    } catch (error) {
        console.error(`   ❌ ERROR scraping ${team.name}:`, error.message);
        return { success: false, error: error.message };
    } finally {
        await page.close();
    }
}

async function main() {
    console.log('🚀 Starting automated NBA 2K26 roster collection...\n');
    console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);

    let browser;
    try {
        // Connect to Chrome with debugging enabled
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

        // Scrape each team
        for (let i = 0; i < NBA_TEAMS.length; i++) {
            const team = NBA_TEAMS[i];
            console.log(`\n[${i + 1}/${NBA_TEAMS.length}] Processing ${team.name}...`);

            const result = await scrapeTeamRoster(browser, team);

            if (result.success) {
                results.successful.push({ team: team.name, players: result.playerCount });
            } else {
                results.failed.push({ team: team.name, error: result.error });
            }

            // Polite delay between requests
            if (i < NBA_TEAMS.length - 1) {
                console.log(`   ⏳ Waiting 3 seconds before next team...`);
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        // Print summary
        console.log('\n\n' + '='.repeat(60));
        console.log('📊 COLLECTION SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Successful: ${results.successful.length}/${NBA_TEAMS.length} teams`);
        console.log(`❌ Failed: ${results.failed.length}/${NBA_TEAMS.length} teams`);

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
        console.log('\n💡 Make sure Chrome is running with debugging enabled:');
        console.log('   macOS: /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug"');
        console.log('   Windows: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --remote-debugging-port=9222');
        console.log('   Linux: google-chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug"');
    } finally {
        if (browser) {
            await browser.disconnect();
        }
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { scrapeTeamRoster, NBA_TEAMS };
