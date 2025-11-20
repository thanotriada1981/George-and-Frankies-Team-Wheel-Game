/**
 * Inspect HoopsHype page structure
 */

const puppeteer = require('puppeteer-core');

async function inspectHoopsHype() {
    console.log('🔍 Connecting to Chrome...');

    const browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222',
        defaultViewport: null
    });

    const page = await browser.newPage();

    console.log('📡 Loading HoopsHype Hawks page...');
    await page.goto('https://www.hoopshype.com/nba-2k/players/?team=atlanta-hawks', {
        waitUntil: 'networkidle2',
        timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('🔎 Analyzing page structure...\n');

    const analysis = await page.evaluate(() => {
        const result = {
            teamDropdown: false,
            tableRows: 0,
            samplePlayers: []
        };

        // Check for team dropdown
        const dropdown = document.querySelector('select[name="team"]') ||
                        document.querySelector('.team-select') ||
                        document.querySelector('select');

        if (dropdown) {
            result.teamDropdown = true;
            result.dropdownOptions = Array.from(dropdown.options).slice(0, 5).map(opt => ({
                value: opt.value,
                text: opt.text
            }));
        }

        // Check for table rows
        const rows = document.querySelectorAll('table tbody tr');
        result.tableRows = rows.length;

        // Get sample player data
        for (let i = 0; i < Math.min(5, rows.length); i++) {
            const row = rows[i];
            const cells = row.cells;

            result.samplePlayers.push({
                rowIndex: i,
                cellCount: cells.length,
                cells: Array.from(cells).map((cell, idx) => ({
                    index: idx,
                    text: cell.textContent.trim(),
                    hasLink: cell.querySelector('a') !== null
                }))
            });
        }

        return result;
    });

    console.log('=== HOOPSHYPE ANALYSIS ===\n');
    console.log(`Team Dropdown: ${analysis.teamDropdown ? '✅ YES' : '❌ NO'}`);

    if (analysis.dropdownOptions) {
        console.log('\nDropdown options (first 5):');
        analysis.dropdownOptions.forEach(opt => {
            console.log(`  - ${opt.text} (${opt.value})`);
        });
    }

    console.log(`\nTotal table rows: ${analysis.tableRows}\n`);

    if (analysis.samplePlayers.length > 0) {
        console.log('Sample players:\n');
        analysis.samplePlayers.forEach(player => {
            console.log(`Player ${player.rowIndex + 1}:`);
            player.cells.forEach(cell => {
                console.log(`  [${cell.index}] ${cell.hasLink ? '🔗' : '  '} "${cell.text}"`);
            });
            console.log('');
        });
    }

    await page.close();
    await browser.disconnect();

    console.log('✅ Inspection complete!');
}

inspectHoopsHype().catch(console.error);
