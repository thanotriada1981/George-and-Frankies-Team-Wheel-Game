/**
 * Inspect 2kratings.com page structure
 */

const puppeteer = require('puppeteer-core');

async function inspectPage() {
    console.log('🔍 Connecting to Chrome...');

    const browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222',
        defaultViewport: null
    });

    const page = await browser.newPage();

    console.log('📡 Loading Atlanta Hawks page...');
    await page.goto('https://www.2kratings.com/teams/atlanta-hawks', {
        waitUntil: 'networkidle2',
        timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('🔎 Analyzing page structure...\n');

    const analysis = await page.evaluate(() => {
        const result = {
            tableRows: 0,
            firstRowData: null,
            allCellsInFirstRow: [],
            samplePlayers: []
        };

        // Check for table rows
        const rows = document.querySelectorAll('table.table tbody tr');
        result.tableRows = rows.length;

        if (rows.length > 0) {
            const firstRow = rows[0];

            // Get all cell texts
            result.allCellsInFirstRow = Array.from(firstRow.cells).map((cell, i) => ({
                index: i,
                text: cell.textContent.trim(),
                innerHTML: cell.innerHTML.substring(0, 200)
            }));

            // Try to extract player data from first 3 rows
            for (let i = 0; i < Math.min(3, rows.length); i++) {
                const row = rows[i];
                const cells = row.cells;

                result.samplePlayers.push({
                    rowIndex: i,
                    cellCount: cells.length,
                    allCells: Array.from(cells).map(c => c.textContent.trim())
                });
            }
        }

        return result;
    });

    console.log('=== ANALYSIS RESULTS ===\n');
    console.log(`Total table rows found: ${analysis.tableRows}\n`);

    if (analysis.allCellsInFirstRow.length > 0) {
        console.log('First row cells:');
        analysis.allCellsInFirstRow.forEach(cell => {
            console.log(`  [${cell.index}] ${cell.text}`);
        });
        console.log('');
    }

    if (analysis.samplePlayers.length > 0) {
        console.log('Sample players:');
        analysis.samplePlayers.forEach(player => {
            console.log(`\nPlayer ${player.rowIndex + 1}:`);
            player.allCells.forEach((text, i) => {
                console.log(`  Column ${i}: "${text}"`);
            });
        });
    }

    await page.close();
    await browser.disconnect();

    console.log('\n✅ Inspection complete!');
}

inspectPage().catch(console.error);
