/**
 * Quick script to scrape a single team
 */

const { scrapeTeamRoster } = require('./scrape-hoopshype.js');
const puppeteer = require('puppeteer-core');

async function scrapeSingleTeam() {
    const teamName = 'Cleveland Cavaliers';
    const teamSlug = 'cleveland-cavaliers';

    console.log(`🏀 Scraping ${teamName}...\n`);

    const browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222',
        defaultViewport: null
    });

    const result = await scrapeTeamRoster(browser, teamName, teamSlug);

    if (result.success) {
        console.log(`\n✅ SUCCESS! Collected ${result.playerCount} players for ${teamName}`);
    } else {
        console.log(`\n❌ FAILED: ${result.error}`);
    }

    await browser.disconnect();
}

scrapeSingleTeam().catch(console.error);
