/**
 * 🏀 Simplified Puppeteer NBA 2K Ratings Scraper & Updater
 *
 * - Reads nba_teams_data.json
 * - For each player, searches 2kratings.com, selects the first dropdown result, scrapes core data
 * - Updates nba_teams_data.json in place (with backup)
 *
 * USAGE:
 *   1. npm install puppeteer
 *   2. node puppeteer-2k-scraper.js
 *
 * NOTE: This script is for educational/demo purposes. 2kratings.com may block automated scraping. Use responsibly.
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DATA_PATH = path.join(__dirname, '../nba_teams_data.json');
const BACKUP_PATH = path.join(__dirname, '../nba_teams_data_backup.json');

async function backupData() {
  if (!fs.existsSync(BACKUP_PATH)) {
    fs.copyFileSync(DATA_PATH, BACKUP_PATH);
    console.log('✅ Backup created:', BACKUP_PATH);
  }
}

async function loadTeamsData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

async function saveTeamsData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  console.log('✅ Updated nba_teams_data.json');
}

async function scrapeSimplifiedPlayerData(page, playerName) {
  // Go to 2kratings.com
  await page.goto('https://www.2kratings.com/', { waitUntil: 'domcontentloaded' });
  // Type player name in search
  await page.type('input[name="search"]', playerName, { delay: 50 });
  // Wait for dropdown and select first result
  await page.waitForSelector('.search-dropdown .search-item', { timeout: 5000 });
  const firstResult = await page.$('.search-dropdown .search-item');
  if (!firstResult) throw new Error('No search result for ' + playerName);
  await firstResult.click();
  // Wait for player page to load
  await page.waitForSelector('.player-info', { timeout: 7000 });
  // Scrape simplified info
  const playerData = await page.evaluate(() => {
    const info = {};
    // Basic info
    const name = document.querySelector('.player-info h1')?.innerText?.trim();
    const team = document.querySelector('.player-info .team-logo + span')?.innerText?.trim();
    const position = document.querySelector('.player-info .player-position')?.innerText?.trim();
    const jerseyNumber = document.querySelector('.player-info .jersey-number')?.innerText?.trim();
    const age = document.querySelector('.player-info .player-age')?.innerText?.replace(/[^0-9]/g, '');
    const height = document.querySelector('.player-info .player-height')?.innerText?.trim();
    const weight = document.querySelector('.player-info .player-weight')?.innerText?.trim();
    
    info.basic_info = { 
      name, 
      team, 
      position, 
      jersey_number: jerseyNumber,
      age: age ? Number(age) : null, 
      height, 
      weight 
    };
    
    // Overall rating
    const overall = document.querySelector('.player-info .overall-rating .rating-value')?.innerText;
    info.overall_rating = overall ? Number(overall) : null;
    
    // Detailed attributes (6 core categories) - Enhanced
    info.detailed_attributes = {};
    const attributeSelectors = {
        'inside': '.inside-rating, .layup-rating, .dunk-rating, .finishing-rating, .post-rating, [data-attribute*="inside"], [data-attribute*="layup"], [data-attribute*="dunk"]',
        'outside': '.outside-rating, .three-point-rating, .mid-range-rating, .shooting-rating, [data-attribute*="outside"], [data-attribute*="three"], [data-attribute*="shoot"]',
        'playmaking': '.playmaking-rating, .pass-rating, .ball-handle-rating, .pass-accuracy-rating, [data-attribute*="playmaking"], [data-attribute*="pass"], [data-attribute*="ball"]',
        'athleticism': '.athleticism-rating, .speed-rating, .vertical-rating, .strength-rating, [data-attribute*="athleticism"], [data-attribute*="speed"], [data-attribute*="vertical"]',
        'defending': '.defending-rating, .perimeter-defense-rating, .interior-defense-rating, .steal-rating, .block-rating, [data-attribute*="defending"], [data-attribute*="defense"]',
        'rebounding': '.rebounding-rating, .offensive-rebound-rating, .defensive-rebound-rating, [data-attribute*="rebounding"], [data-attribute*="rebound"]'
    };
    
    // Enhanced attribute extraction with multiple fallback methods
    Object.entries(attributeSelectors).forEach(([category, selector]) => {
        // Try multiple selectors for each category
        const selectors = selector.split(', ');
        let found = false;
        
        for (let sel of selectors) {
            const element = document.querySelector(sel);
            if (element) {
                const value = parseInt(element.textContent.trim());
                if (value >= 25 && value <= 99) {
                    info.detailed_attributes[category] = value;
                    found = true;
                    break;
                }
            }
        }
        
        // If not found with selectors, try data attributes
        if (!found) {
            const dataElements = document.querySelectorAll('[data-attribute]');
            dataElements.forEach(attrElement => {
                const attrName = attrElement.getAttribute('data-attribute').toLowerCase();
                const attrValue = parseInt(attrElement.textContent.trim());
                
                if (attrValue >= 25 && attrValue <= 99) {
                    if (category === 'inside' && (attrName.includes('inside') || attrName.includes('layup') || attrName.includes('dunk'))) {
                        info.detailed_attributes[category] = attrValue;
                    } else if (category === 'outside' && (attrName.includes('outside') || attrName.includes('three') || attrName.includes('shoot'))) {
                        info.detailed_attributes[category] = attrValue;
                    } else if (category === 'playmaking' && (attrName.includes('playmaking') || attrName.includes('pass') || attrName.includes('ball'))) {
                        info.detailed_attributes[category] = attrValue;
                    } else if (category === 'athleticism' && (attrName.includes('athleticism') || attrName.includes('speed') || attrName.includes('vertical'))) {
                        info.detailed_attributes[category] = attrValue;
                    } else if (category === 'defending' && (attrName.includes('defending') || attrName.includes('defense'))) {
                        info.detailed_attributes[category] = attrValue;
                    } else if (category === 'rebounding' && (attrName.includes('rebounding') || attrName.includes('rebound'))) {
                        info.detailed_attributes[category] = attrValue;
                    }
                }
            });
        }
    });
    
    // Additional comprehensive attribute extraction from tables
    const attributeTables = document.querySelectorAll('.attributes-table, .stats-table, .ratings-table');
    attributeTables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
                const attrName = cells[0].textContent.trim().toLowerCase();
                const attrValue = parseInt(cells[1].textContent.trim());
                
                if (attrValue >= 25 && attrValue <= 99) {
                    if (attrName.includes('inside') || attrName.includes('layup') || attrName.includes('dunk')) {
                        info.detailed_attributes.inside = attrValue;
                    } else if (attrName.includes('outside') || attrName.includes('three') || attrName.includes('shoot')) {
                        info.detailed_attributes.outside = attrValue;
                    } else if (attrName.includes('playmaking') || attrName.includes('pass') || attrName.includes('ball')) {
                        info.detailed_attributes.playmaking = attrValue;
                    } else if (attrName.includes('athleticism') || attrName.includes('speed') || attrName.includes('vertical')) {
                        info.detailed_attributes.athleticism = attrValue;
                    } else if (attrName.includes('defending') || attrName.includes('defense')) {
                        info.detailed_attributes.defending = attrValue;
                    } else if (attrName.includes('rebounding') || attrName.includes('rebound')) {
                        info.detailed_attributes.rebounding = attrValue;
                    }
                }
            }
        });
    });
    
    // Physical stats
    info.physical_stats = {
      height: height,
      weight: weight,
      age: age ? Number(age) : null
    };
    
    return info;
  });
  return playerData;
}

async function main() {
  await backupData();
  const teamsData = await loadTeamsData();
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for production
    slowMo: 1000 // Slow down for demo
  });
  
  const page = await browser.newPage();
  
  // Update each team's players
  for (const [teamName, teamData] of Object.entries(teamsData.teams)) {
    console.log(`🏀 Processing ${teamName}...`);
    
    for (const player of teamData.roster.players) {
      if (player.name && !player.nba2k26Rating) {
        try {
          console.log(`  📊 Scraping ${player.name}...`);
          const playerData = await scrapeSimplifiedPlayerData(page, player.name);
          
          // Update player data
          player.nba2k26Rating = playerData.overall_rating;
          player.detailedAttributes = playerData.detailed_attributes;
          player.physicalStats = playerData.physical_stats;
          
          // Add delay to be respectful
          await page.waitForTimeout(2000);
          
        } catch (error) {
          console.error(`  ❌ Error scraping ${player.name}:`, error.message);
        }
      }
    }
  }
  
  await browser.close();
  await saveTeamsData(teamsData);
  console.log('✅ Simplified scraping complete!');
}

if (require.main === module) {
  main().catch(console.error);
} 