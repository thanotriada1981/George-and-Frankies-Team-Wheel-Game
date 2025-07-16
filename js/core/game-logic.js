/**
 * Main Game Logic for NBA Team Wheel
 * Handles game state, spinning, and team building
 */

// Game State
let gameState = {
    phase: 'classic', // setup, classic, multiplayer, battle - Start directly in classic mode
    mode: 'classic',
    numPlayers: 2,
    players: [],
    currentPlayerIndex: 0,
    currentRound: 1,
    maxRounds: 8,
    dreamTeams: [], // Array to store each player's team
    currentTeam: null,
    currentPlayers: [],
    isSpinning: false
};

// NBA Teams Data - Will be loaded from JSON file
let nbaTeams = [];
// Expose nbaTeams globally for multiplayer access
window.nbaTeams = nbaTeams;

// Initialize the game
async function initializeGame() {
    console.log("🏀 George and Frankie's Team Wheel Game Loading...");
    
    try {
        // Initialize sound system safely
        if (typeof SoundManager !== 'undefined') {
    SoundManager.init();
        }
        
        // Hide setup and show sport selection for immediate play
    const setupPhase = document.getElementById('setup-phase');
    const sportSelection = document.getElementById('sport-selection');
    const modeSelection = document.getElementById('mode-selection');
    
    if (setupPhase) {
        setupPhase.style.display = 'none';
        console.log('👋 Setup phase hidden - starting in classic mode');
    }
    
    // Initialize and show sport selector
    if (typeof SportSelector !== 'undefined') {
        await SportSelector.initialize();
        if (sportSelection) {
            sportSelection.style.display = 'block';
            console.log('🏆 Sport selection shown');
        }
    }
    
    if (modeSelection) {
        modeSelection.style.display = 'block';
        console.log('🎮 Mode selection shown');
    }
    
        // Initialize in classic mode
        switchMode('classic');
        console.log('🎯 Classic mode activated');
        
        // Show loading wheel initially
        showLoadingWheel();
        
        // Simple direct approach: Load NBA teams data immediately
        console.log("🚀 Starting NBA teams loading...");
        loadNBATeamsSimple();
        
    } catch (error) {
        console.error("❌ Error in initializeGame:", error);
        // Instead of showing error immediately, try fallback
        console.log("🔄 Trying fallback teams due to initialization error...");
        createFallbackTeams();
    }
}

// Simplified NBA teams loading with better error handling
async function loadNBATeamsSimple() {
    try {
        console.log("📡 Fetching NBA teams data...");
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch('./data/nba_teams_data.json', {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        console.log("📡 Response received:", response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("📡 Data parsed, teams found:", data.teams?.length || 0);
        
        if (data.teams && Array.isArray(data.teams) && data.teams.length > 0) {
            nbaTeams = data.teams;
        window.nbaTeams = nbaTeams; // Keep global reference in sync
            console.log("✅ Teams loaded successfully:", nbaTeams.length);
            console.log("🏀 First team:", nbaTeams[0].name, "Color:", nbaTeams[0].color_primary);
            console.log("🏀 Sample teams with colors:", nbaTeams.slice(0, 5).map(t => `${t.abbreviation}: ${t.color_primary}`));
            
            // Verify all teams have required data
            const teamsWithoutColors = nbaTeams.filter(t => !t.color_primary);
            if (teamsWithoutColors.length > 0) {
                console.warn("⚠️ Teams missing primary colors:", teamsWithoutColors.map(t => t.abbreviation));
            }
            
            // Draw the wheel
            drawWheelWithLogos();
            
            // Initialize database in background (but don't let it interfere)
            setTimeout(() => {
                try {
                    if (typeof initializeUnifiedDatabase === 'function') {
                        initializeUnifiedDatabase().catch(e => console.log("⚠️ Database init failed (non-critical):", e));
                    }
                } catch (e) {
                    console.log("⚠️ Database init error (non-critical):", e);
                }
            }, 1000);
            
        } else {
            throw new Error("No teams found in data");
        }
        
    } catch (error) {
        console.error("❌ Failed to load NBA teams:", error);
        
        // Immediately try fallback instead of showing error
        console.log("🔄 Switching to fallback teams...");
        createFallbackTeams();
    }
}

// Create fallback teams if data fails to load
function createFallbackTeams() {
    console.log("🔄 Creating fallback NBA teams...");
    
    nbaTeams = [
        { name: "Los Angeles Lakers", abbreviation: "LAL", color_primary: "#552583", logo_file: "assets/logos/nba/los_angeles_lakers.svg" },
        { name: "Golden State Warriors", abbreviation: "GSW", color_primary: "#1D428A", logo_file: "assets/logos/nba/golden_state_warriors.svg" },
        { name: "Boston Celtics", abbreviation: "BOS", color_primary: "#007A33", logo_file: "assets/logos/nba/boston_celtics.svg" },
        { name: "Miami Heat", abbreviation: "MIA", color_primary: "#98002E", logo_file: "assets/logos/nba/miami_heat.svg" },
        { name: "Chicago Bulls", abbreviation: "CHI", color_primary: "#CE1141", logo_file: "assets/logos/nba/chicago_bulls.svg" },
        { name: "New York Knicks", abbreviation: "NYK", color_primary: "#006BB6", logo_file: "assets/logos/nba/new_york_knicks.svg" },
        { name: "Brooklyn Nets", abbreviation: "BKN", color_primary: "#000000", logo_file: "assets/logos/nba/brooklyn_nets.svg" },
        { name: "Philadelphia 76ers", abbreviation: "PHI", color_primary: "#006BB6", logo_file: "assets/logos/nba/philadelphia_76ers.svg" },
        { name: "Milwaukee Bucks", abbreviation: "MIL", color_primary: "#00471B", logo_file: "assets/logos/nba/milwaukee_bucks.svg" },
        { name: "Phoenix Suns", abbreviation: "PHX", color_primary: "#1D1160", logo_file: "assets/logos/nba/phoenix_suns.svg" },
        { name: "Dallas Mavericks", abbreviation: "DAL", color_primary: "#00538C", logo_file: "assets/logos/nba/dallas_mavericks.svg" },
        { name: "Denver Nuggets", abbreviation: "DEN", color_primary: "#0E2240", logo_file: "assets/logos/nba/denver_nuggets.svg" },
        { name: "Atlanta Hawks", abbreviation: "ATL", color_primary: "#E03A3E", logo_file: "assets/logos/nba/atlanta_hawks.svg" },
        { name: "Cleveland Cavaliers", abbreviation: "CLE", color_primary: "#860038", logo_file: "assets/logos/nba/cleveland_cavaliers.svg" },
        { name: "Toronto Raptors", abbreviation: "TOR", color_primary: "#CE1141", logo_file: "assets/logos/nba/toronto_raptors.svg" },
        { name: "Memphis Grizzlies", abbreviation: "MEM", color_primary: "#5D76A9", logo_file: "assets/logos/nba/memphis_grizzlies.svg" },
        { name: "Portland Trail Blazers", abbreviation: "POR", color_primary: "#E03A3E", logo_file: "assets/logos/nba/portland_trail_blazers.svg" },
        { name: "Utah Jazz", abbreviation: "UTA", color_primary: "#002B5C", logo_file: "assets/logos/nba/utah_jazz.svg" },
        { name: "Sacramento Kings", abbreviation: "SAC", color_primary: "#5A2D81", logo_file: "assets/logos/nba/sacramento_kings.svg" },
        { name: "Oklahoma City Thunder", abbreviation: "OKC", color_primary: "#007AC1", logo_file: "assets/logos/nba/oklahoma_city_thunder.svg" },
        { name: "San Antonio Spurs", abbreviation: "SAS", color_primary: "#C4CED4", logo_file: "assets/logos/nba/san_antonio_spurs.svg" },
        { name: "Minnesota Timberwolves", abbreviation: "MIN", color_primary: "#0C2340", logo_file: "assets/logos/nba/minnesota_timberwolves.svg" },
        { name: "New Orleans Pelicans", abbreviation: "NOP", color_primary: "#0C2340", logo_file: "assets/logos/nba/new_orleans_pelicans.svg" },
        { name: "LA Clippers", abbreviation: "LAC", color_primary: "#C8102E", logo_file: "assets/logos/nba/la_clippers.svg" },
        { name: "Houston Rockets", abbreviation: "HOU", color_primary: "#CE1141", logo_file: "assets/logos/nba/houston_rockets.svg" },
        { name: "Indiana Pacers", abbreviation: "IND", color_primary: "#002D62", logo_file: "assets/logos/nba/indiana_pacers.svg" },
        { name: "Orlando Magic", abbreviation: "ORL", color_primary: "#0077C0", logo_file: "assets/logos/nba/orlando_magic.svg" },
        { name: "Detroit Pistons", abbreviation: "DET", color_primary: "#C8102E", logo_file: "assets/logos/nba/detroit_pistons.svg" },
        { name: "Charlotte Hornets", abbreviation: "CHA", color_primary: "#1D1160", logo_file: "assets/logos/nba/charlotte_hornets.svg" },
        { name: "Washington Wizards", abbreviation: "WAS", color_primary: "#002B5C", logo_file: "assets/logos/nba/washington_wizards.svg" }
    ];
    
    console.log("✅ Fallback teams created:", nbaTeams.length);
    drawWheelWithLogos();
}

// Initialize unified database system
async function initializeUnifiedDatabase() {
    try {
        console.log('🔄 Starting unified database initialization...');
        
        // Initialize the unified database
        if (typeof window.unifiedNBADB !== 'undefined') {
            console.log('🗃️ Found unified NBA database, initializing...');
            await window.unifiedNBADB.initialize();
            console.log('🗃️ Unified NBA Database initialized');
            
            // Validate database integrity
            const validation = window.unifiedNBADB.validateDatabaseIntegrity();
            console.log('📊 Database validation:', validation);
            
            if (!validation.isComplete && validation.missingRatings.length > 0) {
                console.warn('⚠️ Some teams missing ratings data:', validation.missingRatings);
            }
        } else {
            console.log('⚠️ Unified NBA database not found, skipping...');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error initializing unified database:', error);
        return false;
    }
}

// Show error state for wheel
function showErrorWheel() {
    const wheel = document.getElementById('wheel');
    if (!wheel) return;
    
    wheel.innerHTML = '';
    
    // Add error segments
    for (let i = 0; i < 4; i++) {
        const section = document.createElement('div');
        section.className = 'wheel-section';
        section.style.transform = `rotate(${i * 90}deg)`;
        section.style.background = '#e74c3c';
        section.style.opacity = '0.8';
        wheel.appendChild(section);
    }
    
    // Add error text in center
    const centerCircle = document.createElement('div');
    centerCircle.className = 'center-circle';
    centerCircle.innerHTML = 'Error<br>Loading';
    centerCircle.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
    wheel.appendChild(centerCircle);
    
    console.log("❌ Error wheel displayed");
}

// Draw wheel with team logos
function drawWheelWithLogos() {
    console.log("🎨 drawWheelWithLogos called");
    console.log("🔍 Local nbaTeams.length:", nbaTeams.length);
    console.log("🔍 Global window.nbaTeams length:", window.nbaTeams ? window.nbaTeams.length : 'undefined');
    console.log("🔍 nbaTeams === window.nbaTeams:", nbaTeams === window.nbaTeams);
    
    // Check both local and global references
    const teams = nbaTeams.length > 0 ? nbaTeams : (window.nbaTeams || []);
    console.log("🔍 Using teams array with length:", teams.length);
    
    if (teams.length === 0) {
        console.log("⚠️ No teams loaded yet, showing loading wheel");
        showLoadingWheel();
        
        // Try to load teams if they haven't been loaded yet
        console.log("🔄 Attempting to load NBA teams...");
        loadNBATeamsSimple();
        return;
    }
    
    // Use the teams array for drawing
    console.log("🎨 Drawing wheel with", teams.length, "teams");
    console.log("🏀 First few teams:", teams.slice(0, 3).map(t => t.name || t.abbreviation));
    
    // Update the wheel with the teams array
    updateWheelSegments('wheel', teams);
}

// Show loading state for wheel
function showLoadingWheel() {
    const wheel = document.getElementById('wheel');
    if (!wheel) return;
    
    // Clear existing content
    wheel.innerHTML = '';
    
    // Add animated loading segments
    for (let i = 0; i < 8; i++) {
        const section = document.createElement('div');
        section.className = 'wheel-section';
        section.style.transform = `rotate(${i * 45}deg)`;
        section.style.background = i % 2 === 0 ? '#ff6b35' : '#4a90e2';
        section.style.opacity = '0.7';
        wheel.appendChild(section);
    }
    
    // Add loading text in center
    const centerCircle = document.createElement('div');
    centerCircle.className = 'center-circle';
    centerCircle.innerHTML = 'Loading<br>Teams...';
    wheel.appendChild(centerCircle);
    
    console.log("🔄 Loading wheel displayed");
}

// Update wheel segments with team data
function updateWheelSegments(wheelId, teams = nbaTeams) {
    const wheel = document.getElementById(wheelId);
    if (!wheel) {
        console.log("❌ Wheel element not found:", wheelId);
        return;
    }
    
    const totalTeams = teams.length;
    console.log("🎡 Creating simple rotating wheel for", totalTeams, "teams");
    console.log("🏀 Team names:", teams.map(t => t.abbreviation || t.name).join(', '));
    
    if (totalTeams !== 30) {
        console.warn("⚠️ WARNING: Expected 30 NBA teams, but got", totalTeams);
    }
    
    // Clear existing content
    wheel.innerHTML = '';
    
    // Create simple wheel container
    const wheelContainer = document.createElement('div');
    wheelContainer.className = 'wheel-simple';
    wheelContainer.style.cssText = `
        width: 500px;
        height: 500px;
        border-radius: 50%;
        position: relative;
        border: none;
        overflow: hidden;
        background: conic-gradient(${createConicGradient(teams)});
    `;
    
    // Add team labels (move closer to center, justify, and avoid logo overlap)
    const anglePerSegment = 360 / totalTeams;
    // Create a hidden span for measuring text width
    let measureSpan = document.getElementById('label-measure-span');
    if (!measureSpan) {
        measureSpan = document.createElement('span');
        measureSpan.id = 'label-measure-span';
        measureSpan.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font-weight:bold;pointer-events:none;z-index:-1;';
        document.body.appendChild(measureSpan);
    }
    const LABEL_WIDTH = 90; // px
    const DEFAULT_FONT_SIZE = 12; // px
    const MIN_FONT_SIZE = 9; // px
    const FONT_FAMILY = 'inherit'; // Use default, or specify if needed
    for (let i = 0; i < totalTeams; i++) {
        const team = nbaTeams[i];
        // Adjust angle to properly center text in pie slice
        // CSS conic-gradient starts at 0deg (top), so we need to offset by 90deg
        const angle = ((i * anglePerSegment) + (anglePerSegment / 2)) - 90;
        // Shrink-to-fit font size logic
        let fontSize = DEFAULT_FONT_SIZE;
        measureSpan.style.fontSize = fontSize + 'px';
        measureSpan.style.fontFamily = FONT_FAMILY;
        measureSpan.textContent = team.name || team.abbreviation;
        while (measureSpan.offsetWidth > LABEL_WIDTH && fontSize > MIN_FONT_SIZE) {
            fontSize--;
            measureSpan.style.fontSize = fontSize + 'px';
        }
        const label = document.createElement('div');
        label.className = 'team-label';
        label.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            transform-origin: 0 0;
            transform: rotate(${angle}deg) translate(80px, -10px);
            color: white;
            font-weight: bold;
            font-size: ${fontSize}px;
            text-shadow: 1px 1px 2px black;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${LABEL_WIDTH}px;
            height: 20px;
            pointer-events: none;
            z-index: 5;
            white-space: nowrap;
        `;
        label.innerHTML = `<span style='width:100%;display:inline-block;text-align:center;'>${team.name || team.abbreviation}</span>`;
        wheelContainer.appendChild(label);
        
        // Add team logo (no white background/border)
        const logo = document.createElement('img');
        logo.src = team.logo_file;
        logo.className = 'team-logo-simple';
        logo.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            transform-origin: 0 0;
            transform: rotate(${angle}deg) translate(180px, -20px);
            width: 40px;
            height: 40px;
            pointer-events: none;
            z-index: 6;
        `;
        logo.onerror = function() {
            this.style.display = 'none';
        };
        wheelContainer.appendChild(logo);
    }
    
    // Add center circle
    const centerCircle = document.createElement('div');
    centerCircle.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: #ff6b35;
        border: 3px solid white;
        transform: translate(-50%, -50%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 18px;
        text-shadow: 1px 1px 2px black;
        z-index: 10;
    `;
    // Get current sport name
    const currentSportConfig = (typeof SportSelector !== 'undefined' && SportSelector.getCurrentConfig) 
        ? SportSelector.getCurrentConfig() 
        : { wheel_config: { center_text: 'NBA' } };
    centerCircle.textContent = currentSportConfig.wheel_config.center_text;
    wheelContainer.appendChild(centerCircle);
    
    wheel.appendChild(wheelContainer);
    
    console.log(`✅ Simple wheel complete: ${totalTeams} teams with conic gradient segments`);
    
    if (totalTeams !== 30) {
        console.error("🚨 ERROR: Expected 30 teams but got", totalTeams);
    } else {
        console.log("🎯 Perfect! All 30 NBA teams displayed in equal segments");
    }
}

// Create conic gradient for equal segments
function createConicGradient(teams) {
    const anglePerSegment = 360 / teams.length;
    let gradient = '';
    
    console.log("🎨 Creating conic gradient for", teams.length, "teams");
    
    for (let i = 0; i < teams.length; i++) {
        const startAngle = i * anglePerSegment;
        const endAngle = (i + 1) * anglePerSegment;
        const color = teams[i].color_primary;
        
        console.log(`Team ${i}: ${teams[i].abbreviation} - Color: ${color} (${startAngle}deg - ${endAngle}deg)`);
        
        if (i === 0) {
            gradient += `${color} 0deg ${endAngle}deg`;
        } else {
            gradient += `, ${color} ${startAngle}deg ${endAngle}deg`;
        }
    }
    
    console.log("🎨 Final gradient:", gradient);
    return gradient;
}

// Classic wheel spin with realistic deceleration
function spinWheel() {
    if (gameState.isSpinning) return;
    
    gameState.isSpinning = true;
    const spinButton = document.getElementById('classicSpinButton');
    const result = document.getElementById('classic-result');
    const wheel = document.getElementById('wheel');
    
    spinButton.disabled = true;
    spinButton.textContent = 'Spinning...';
    result.textContent = 'The wheel is spinning...';
    
    // Play spinning sound and add visual effects
    SoundManager.playSpinSound();
    VisualEffects.addSpinGlow(wheel.parentElement);
    
    // Calculate spin parameters
    const baseSpins = Math.floor(Math.random() * 4) + 8; // 8-11 full rotations
    const finalAngle = Math.random() * 360;
    const totalRotation = (baseSpins * 360) + finalAngle;
    
    // Apply the 6-second deceleration animation
    applyRealisticSpin(wheel, totalRotation);
    
    setTimeout(function() {
        const selectedTeam = getSelectedTeam(finalAngle);
        
        result.innerHTML = `🏀 The wheel landed on <span style="color: ${selectedTeam.color_primary}">${selectedTeam.name}</span>! 🏀`;
        
        // Add celebration effects
        VisualEffects.createConfetti();
        VisualEffects.createFloatingText(`🎉 ${selectedTeam.name}! 🎉`, wheel.parentElement, selectedTeam.color_primary);
        
        // Play celebration sound
        SoundManager.playCelebrationSound();
        
        // Remove spinning effects
        VisualEffects.removeSpinGlow(wheel.parentElement);
        
        // Check game mode and handle result accordingly
        if (window.onlineMultiplayer && window.onlineMultiplayer.gameData && 
            window.onlineMultiplayer.gameData.gameState === 'playing') {
            // Handle online multiplayer result
            handleOnlineSpinResult(selectedTeam);
        } else if (gameState.phase === 'playing' && gameState.numPlayers > 1) {
            // Handle local multiplayer result - go directly to player selection
            console.log(`🎯 Local multiplayer: ${gameState.players[gameState.currentPlayerIndex].name} spun ${selectedTeam.name}`);
            showPlayerSelection(selectedTeam);
        } else {
            // Show normal result popup for classic mode
            showTeamResult(selectedTeam);
        }
        
        spinButton.disabled = false;
        spinButton.textContent = '🎯 SPIN THE WHEEL! 🎯';
        gameState.isSpinning = false;
    }, 6000); // 6 seconds total
}

// Apply realistic deceleration spin animation
function applyRealisticSpin(wheel, totalRotation) {
    console.log("🎡 Starting simple wheel spin animation, total rotation:", totalRotation);
    
    const wheelContainer = wheel.querySelector('.wheel-simple');
    if (!wheelContainer) {
        console.error("❌ Wheel container not found for spinning");
        return;
    }
    
    // Reset any existing transform
    wheelContainer.style.transition = 'none';
    wheelContainer.style.transform = 'rotate(0deg)';
    
    // Force a reflow to ensure the reset takes effect
    wheelContainer.offsetHeight;
    
    // Create a single smooth deceleration using CSS cubic-bezier
    setTimeout(() => {
        // Use a custom cubic-bezier curve that starts fast and ends very slow
        wheelContainer.style.transition = 'transform 6s cubic-bezier(0.23, 1, 0.32, 1)';
        wheelContainer.style.transform = `rotate(${totalRotation}deg)`;
        console.log("🎡 Spin started, will stop in 6 seconds");
    }, 100);
    
    // Add a final positioning adjustment to ensure it stops exactly where intended
    setTimeout(() => {
        wheelContainer.style.transition = 'transform 0.2s ease-out';
        wheelContainer.style.transform = `rotate(${totalRotation}deg)`;
        console.log("🎡 Spin completed, final position:", totalRotation);
    }, 6200);
}

// Get selected team based on angle
function getSelectedTeam(finalAngle) {
    // Account for the pointer at the top (12 o'clock position)
    const adjustedAngle = (360 - (finalAngle % 360) + 90) % 360;
    const sectionAngle = 360 / nbaTeams.length;
    const selectedIndex = Math.floor(adjustedAngle / sectionAngle) % nbaTeams.length;
    
    console.log(`🎯 Final angle: ${finalAngle}°, Adjusted: ${adjustedAngle}°, Selected index: ${selectedIndex}`);
    console.log(`🏀 Selected team: ${nbaTeams[selectedIndex].name}`);
    
    return nbaTeams[selectedIndex];
}

// Close popup
function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

// Show setup phase for multiplayer
function showSetupPhase() {
    const setupPhase = document.getElementById('setup-phase');
    const modeSelection = document.getElementById('mode-selection');
    const classicMode = document.getElementById('classic-mode');
    
    if (setupPhase) {
        setupPhase.style.display = 'block';
        console.log('👥 Setup phase shown for multiplayer');
    }
    
    if (modeSelection) {
        modeSelection.style.display = 'none';
    }
    
    if (classicMode) {
        classicMode.style.display = 'none';
    }
    
    // Focus on host name input
    const hostNameInput = document.getElementById('host-name-input');
    if (hostNameInput) {
        setTimeout(() => {
            hostNameInput.focus();
        }, 100);
    }
}

// Switch between game modes
function switchMode(mode) {
    gameState.mode = mode;
    
    // Update button states
    document.querySelectorAll('.mode-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to the clicked button (if called from an event)
    if (typeof event !== 'undefined' && event.target) {
    event.target.classList.add('active');
    } else {
        // If called programmatically, find and activate the correct button
        const targetButton = document.querySelector(`[onclick*="switchMode('${mode}')"]`);
        if (targetButton) {
            targetButton.classList.add('active');
        }
    }
    
    // Show/hide appropriate mode using CSS classes
    const classicMode = document.getElementById('classic-mode');
    
    if (mode === 'classic') {
        classicMode.classList.add('active');
        classicMode.style.display = 'block';
    }
}

// Show team result popup
function showTeamResult(team) {
    const popup = document.getElementById('popup');
    const popupResult = document.getElementById('popupResult');
    
    if (!popup || !popupResult) {
        console.log("❌ Popup elements not found");
        return;
    }
    
    popupResult.innerHTML = `
        <div style="text-align: center;">
            <div style="margin-bottom: 20px;">
                <img src="${team.logo_file}" alt="${team.name}" 
                     style="width: 80px; height: 80px; object-fit: contain;" 
                     onerror="this.style.display='none'">
            </div>
            <div style="font-size: 1.2em; margin-bottom: 10px;">The wheel landed on:</div>
            <div style="color: ${team.color_primary}; font-size: 1.8em; font-weight: bold; margin-bottom: 10px;">
                ${team.name}
            </div>
            <div style="font-size: 1em; color: #666;">
                ${team.city} • ${team.conference} Conference • ${team.division} Division
            </div>
        </div>
    `;
    
    popup.style.display = 'block';
    VisualEffects.celebratePopup(popup);
}

// Initialize when page loads
window.addEventListener('load', initializeGame);

// Also try immediate initialization if DOM is already ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    // DOM is already loaded, initialize immediately
    setTimeout(initializeGame, 100);
}

// Export functions for global use
window.spinWheel = spinWheel;
window.closePopup = closePopup;
window.switchMode = switchMode;
window.drawWheelWithLogos = drawWheelWithLogos; 