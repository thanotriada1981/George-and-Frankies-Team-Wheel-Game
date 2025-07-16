/**
 * Sport Selector - Multi-Sport Framework
 * Allows switching between NBA, NFL, MLB, Soccer while preserving current functionality
 */

let sportsConfig = null;
let currentSport = 'nba'; // Default to NBA (current working sport)

// Sport icons for better UX
function getSportIcon(sportKey) {
    const icons = {
        'nba': '🏀',
        'nfl': '🏈', 
        'mlb': '⚾',
        'soccer': '⚽'
    };
    return icons[sportKey] || '🎯';
}

// Load sports configuration
async function loadSportsConfig() {
    try {
        const response = await fetch('./data/sports-config.json');
        sportsConfig = await response.json();
        currentSport = sportsConfig.default_sport || 'nba';
        console.log('🏆 Sports config loaded:', Object.keys(sportsConfig.available_sports));
        return sportsConfig;
    } catch (error) {
        console.error('❌ Failed to load sports config:', error);
        // Fallback to NBA only
        currentSport = 'nba';
        return null;
    }
}

// Get current sport configuration
function getCurrentSportConfig() {
    if (!sportsConfig) {
        // Fallback for NBA (current working implementation)
        return {
            name: 'NBA',
            team_count: 30,
            data_file: 'data/nba_teams_data.json',
            logo_path: 'assets/logos/nba/',
            wheel_config: {
                center_text: 'NBA',
                spin_duration: 6000
            }
        };
    }
    return sportsConfig.available_sports[currentSport];
}

// Switch to a different sport
async function switchSport(sportKey) {
    if (!sportsConfig || !sportsConfig.available_sports[sportKey]) {
        console.error('❌ Sport not available:', sportKey);
        return false;
    }
    
    const previousSport = currentSport;
    currentSport = sportKey;
    const sportConfig = sportsConfig.available_sports[sportKey];
    
    console.log(`🔄 Switching from ${previousSport} to ${sportKey}`);
    
    try {
        // Load new sport data
        const response = await fetch(sportConfig.data_file);
        if (!response.ok) {
            throw new Error(`Failed to load ${sportKey} data`);
        }
        
        const data = await response.json();
        
        // Update global variables (preserving current NBA functionality)
        if (sportKey === 'nba') {
            // Use existing NBA loading logic
            nbaTeams = data.teams || data;
        } else {
            // For new sports, use the same structure
            nbaTeams = data.teams || data; // Keep using nbaTeams variable for compatibility
        }
        
        // Update UI
        updateSportUI(sportConfig);
        
        // Redraw wheel with new sport data
        if (typeof drawWheelWithLogos === 'function') {
            drawWheelWithLogos();
        }
        
        console.log(`✅ Successfully switched to ${sportConfig.full_name}`);
        return true;
        
    } catch (error) {
        console.error(`❌ Failed to switch to ${sportKey}:`, error);
        // Revert to previous sport
        currentSport = previousSport;
        return false;
    }
}

// Update UI elements for current sport
function updateSportUI(sportConfig) {
    // Update title
    const titleElements = document.querySelectorAll('h1');
    titleElements.forEach(title => {
        if (title.textContent.includes('Team Wheel')) {
            const icon = getSportIcon(currentSport);
            title.textContent = `${icon} George and Frankie's ${sportConfig.name} Team Wheel Game ${icon}`;
        }
    });
    
    // Update wheel center text
    const centerCircles = document.querySelectorAll('.center-circle');
    centerCircles.forEach(circle => {
        circle.textContent = sportConfig.wheel_config.center_text;
    });
    
    // Update any sport-specific colors (optional)
    document.documentElement.style.setProperty('--sport-primary-color', sportConfig.colors.primary);
    document.documentElement.style.setProperty('--sport-secondary-color', sportConfig.colors.secondary);
}

// getSportIcon function is defined at the top of the file

// Create sport selector UI
function createSportSelector() {
    if (!sportsConfig) return;
    
    const sportSelectionDiv = document.getElementById('sport-selection');
    if (!sportSelectionDiv) return;
    
    sportSelectionDiv.innerHTML = `
        <div class="sport-selector">
            <div class="sport-selector-container">
                <label for="sport-select">🏆 Choose Sport:</label>
                <select id="sport-select" onchange="handleSportChange(this.value)">
                    ${Object.entries(sportsConfig.available_sports).map(([key, sport]) => 
                        `<option value="${key}" ${key === currentSport ? 'selected' : ''}>
                            ${getSportIcon(key)} ${sport.name} (${sport.team_count} teams)
                        </option>`
                    ).join('')}
                </select>
            </div>
        </div>
    `;
}

// Handle sport change from UI
async function handleSportChange(newSport) {
    if (newSport === currentSport) return;
    
    const success = await switchSport(newSport);
    if (!success) {
        // Revert selector to previous sport
        const selector = document.getElementById('sport-select');
        if (selector) {
            selector.value = currentSport;
        }
    }
}

// Initialize sport selector (call this after the page loads)
async function initializeSportSelector() {
    await loadSportsConfig();
    if (sportsConfig && Object.keys(sportsConfig.available_sports).length > 1) {
        createSportSelector();
    }
    
    // Set initial sport UI
    const sportConfig = getCurrentSportConfig();
    updateSportUI(sportConfig);
}

// Export for global access
window.SportSelector = {
    initialize: initializeSportSelector,
    switchSport: switchSport,
    getCurrentSport: () => currentSport,
    getCurrentConfig: getCurrentSportConfig
}; 