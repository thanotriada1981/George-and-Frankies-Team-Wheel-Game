// NBA Data Collection Automation Script
// Collects roster data from ESPN and ratings from NBA 2K26

class NBADataCollector {
    constructor() {
        this.teams = [
            { name: 'Los Angeles Lakers', espnCode: 'lal', slug: 'los-angeles-lakers' },
            { name: 'Golden State Warriors', espnCode: 'gs', slug: 'golden-state-warriors' },
            { name: 'Boston Celtics', espnCode: 'bos', slug: 'boston-celtics' },
            { name: 'Miami Heat', espnCode: 'mia', slug: 'miami-heat' },
            { name: 'Dallas Mavericks', espnCode: 'dal', slug: 'dallas-mavericks' },
            // Add all 30 teams here
        ];
        this.collectedData = {
            rosters: {},
            ratings: {},
            timestamp: new Date().toISOString()
        };
    }

    // ESPN Roster Collection
    async collectESPNRoster(teamCode, teamSlug) {
        console.log(`🏀 Collecting ${teamSlug} roster from ESPN...`);
        
        const rosterData = {
            teamName: '',
            players: [],
            lastUpdated: new Date().toISOString()
        };

        try {
            // Extract team name
            const teamNameElement = document.querySelector('h1.ClubhouseHeader__Name');
            if (teamNameElement) {
                rosterData.teamName = teamNameElement.textContent.trim();
            }

            // Extract roster table data
            const rosterTable = document.querySelector('.Table--fixed-left');
            if (rosterTable) {
                const rows = rosterTable.querySelectorAll('tbody tr');
                
                rows.forEach(row => {
                    const nameCell = row.querySelector('td[data-stat="name"] a');
                    const positionCell = row.querySelector('td[data-stat="pos"]');
                    const heightCell = row.querySelector('td[data-stat="ht"]');
                    const weightCell = row.querySelector('td[data-stat="wt"]');
                    const ageCell = row.querySelector('td[data-stat="age"]');
                    const expCell = row.querySelector('td[data-stat="exp"]');

                    if (nameCell) {
                        const player = {
                            name: nameCell.textContent.trim(),
                            position: positionCell ? positionCell.textContent.trim() : '',
                            height: heightCell ? heightCell.textContent.trim() : '',
                            weight: weightCell ? weightCell.textContent.trim() : '',
                            age: ageCell ? ageCell.textContent.trim() : '',
                            experience: expCell ? expCell.textContent.trim() : '',
                            profileUrl: nameCell.href || ''
                        };
                        rosterData.players.push(player);
                    }
                });
            }

            console.log(`✅ Collected ${rosterData.players.length} players for ${rosterData.teamName}`);
            return rosterData;

        } catch (error) {
            console.error(`❌ Error collecting ESPN roster:`, error);
            return rosterData;
        }
    }

    // NBA 2K26 Ratings Collection
    async collectNBA2K26Ratings(playerName, teamSlug) {
        console.log(`🎮 Collecting NBA 2K26 rating for ${playerName}...`);
        
        try {
            // This would be run on 2kratings.com page
            const searchResults = document.querySelectorAll('.player-card, .player-item');
            
            for (let result of searchResults) {
                const nameElement = result.querySelector('.player-name, .name');
                if (nameElement && nameElement.textContent.toLowerCase().includes(playerName.toLowerCase())) {
                    const ratingElement = result.querySelector('.overall-rating, .rating');
                    const positionElement = result.querySelector('.position');
                    
                    return {
                        name: playerName,
                        overall: ratingElement ? parseInt(ratingElement.textContent) : null,
                        position: positionElement ? positionElement.textContent : '',
                        source: 'NBA 2K26',
                        lastUpdated: new Date().toISOString()
                    };
                }
            }

            // If not found, return basic structure
            return {
                name: playerName,
                overall: null,
                position: '',
                source: 'NBA 2K26',
                lastUpdated: new Date().toISOString(),
                status: 'not_found'
            };

        } catch (error) {
            console.error(`❌ Error collecting 2K rating for ${playerName}:`, error);
            return null;
        }
    }

    // Main collection workflow
    async collectTeamData(teamCode, teamSlug) {
        console.log(`\n🚀 Starting data collection for ${teamSlug}...`);
        
        // Step 1: Collect ESPN roster
        const rosterData = await this.collectESPNRoster(teamCode, teamSlug);
        this.collectedData.rosters[teamSlug] = rosterData;

        // Step 2: For each player, collect 2K rating
        const playersWithRatings = [];
        for (let player of rosterData.players) {
            const rating = await this.collectNBA2K26Ratings(player.name, teamSlug);
            playersWithRatings.push({
                ...player,
                rating: rating
            });
        }

        this.collectedData.ratings[teamSlug] = playersWithRatings;
        
        console.log(`✅ Completed data collection for ${teamSlug}`);
        return {
            roster: rosterData,
            ratings: playersWithRatings
        };
    }

    // Save collected data
    saveData() {
        const dataString = JSON.stringify(this.collectedData, null, 2);
        console.log('💾 Collected Data:', dataString);
        
        // Create download link
        const blob = new Blob([dataString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nba-data-collection-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return this.collectedData;
    }

    // Utility: Wait function
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize collector
const collector = new NBADataCollector();

// Collection functions to run in browser console
window.collectLakersData = async function() {
    console.log('🏀 Starting Lakers data collection...');
    
    // First, collect roster from current ESPN page
    const lakersRoster = await collector.collectESPNRoster('lal', 'los-angeles-lakers');
    console.log('Lakers Roster:', lakersRoster);
    
    return lakersRoster;
};

window.searchPlayerOn2K = function(playerName) {
    console.log(`🔍 Searching for ${playerName} on NBA 2K26...`);
    // Run this on 2kratings.com
    return collector.collectNBA2K26Ratings(playerName, 'los-angeles-lakers');
};

window.saveCollectedData = function() {
    return collector.saveData();
};

console.log('🚀 NBA Data Collector loaded! Available functions:');
console.log('- collectLakersData(): Collect Lakers roster from ESPN');
console.log('- searchPlayerOn2K(playerName): Search player on 2K ratings');
console.log('- saveCollectedData(): Download collected data as JSON'); 