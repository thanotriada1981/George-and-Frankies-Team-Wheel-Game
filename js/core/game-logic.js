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
        
        // Initialize the optimized wheel loader system first
        console.log("🔧 Initializing optimized wheel loader...");
        const wheelLoaderReady = await WheelLoader.initialize();
        
        if (wheelLoaderReady) {
            console.log("✅ Pre-built wheel system ready!");
            
            // Load NBA team data for compatibility with existing game logic
            nbaTeams = WheelLoader.getTeamData('nba');
            window.nbaTeams = nbaTeams; // Keep global reference in sync
            console.log("📊 Loaded teams data:", nbaTeams.length, "teams");
            
            // Render the pre-built NBA wheel immediately
            WheelLoader.renderPrebuiltWheel('wheel', 'nba');
        } else {
            console.warn("⚠️ Pre-built wheel system failed, falling back to dynamic generation...");
            // Fallback to original system
            loadNBATeamsSimple();
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
            
            // Test slice-based selection system
            setTimeout(() => testSliceSystem(), 1000);
            
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

// Draw wheel with team logos - now optimized with pre-built wheels!
function drawWheelWithLogos() {
    console.log("🎨 drawWheelWithLogos called - checking for pre-built system...");
    
    // Try using pre-built wheel system first
    if (typeof WheelLoader !== 'undefined' && WheelLoader.renderPrebuiltWheel) {
        console.log("✅ Using optimized pre-built wheel system");
        const success = WheelLoader.renderPrebuiltWheel('wheel', 'nba');
        
        if (success) {
            console.log("🎯 Pre-built NBA wheel rendered successfully!");
            return;
        } else {
            console.warn("⚠️ Pre-built wheel failed, falling back to dynamic generation");
        }
    }
    
    // Fallback to original dynamic generation system
    console.log("🔄 Using fallback dynamic wheel generation...");
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
    
    // 🎯 NEW NUMBERED SELECTION SYSTEM
    // Pre-select the winning team and calculate target angle
    const winnerInfo = selectWinningTeam();
    if (!winnerInfo) {
        console.error("❌ Failed to select winning team");
        gameState.isSpinning = false;
        spinButton.disabled = false;
        spinButton.textContent = '🎯 SPIN THE WHEEL! 🎯';
        return;
    }
    
    // Calculate spin parameters with pre-determined target
    const baseSpins = Math.floor(Math.random() * 4) + 8; // 8-11 full rotations
    const targetAngle = winnerInfo.targetAngle;
    const totalRotation = (baseSpins * 360) + targetAngle;
    
    console.log(`🎰 SPIN CALCULATION:`);
    console.log(`   Base spins: ${baseSpins} (${baseSpins * 360}°)`);
    console.log(`   Target angle: ${targetAngle}°`);
    console.log(`   Total rotation: ${totalRotation}°`);
    console.log(`   Will land on: ${winnerInfo.team.name} (Number ${winnerInfo.number})`);
    
    // Apply the 6-second deceleration animation
    applyRealisticSpin(wheel, totalRotation);
    
    setTimeout(function() {
        // 🎯 SLICE-BASED VERIFICATION: Check where wheel actually landed
        const actualResult = selectTeamBySlice(totalRotation);
        const preSelectedTeam = winnerInfo.team;
        
        // Use actual result for perfect accuracy, with pre-selected as fallback
        const finalTeam = actualResult || preSelectedTeam;
        
        // 🔍 VERIFICATION LOGGING
        if (actualResult && preSelectedTeam.name === actualResult.name) {
            console.log("✅ PERFECT! Pre-selected team matches slice where wheel landed");
            console.log(`🎯 Slice ${actualResult.sliceNumber}: ${actualResult.name}`);
        } else if (actualResult) {
            console.log(`⚠️ Adjustment: Pre-selected ${preSelectedTeam.name}, Actually landed on Slice ${actualResult.sliceNumber}: ${actualResult.name}`);
        }
        
        result.innerHTML = `🏀 The wheel landed on <span style="color: ${finalTeam.color_primary}"> ${finalTeam.name}</span>! 🏀`;
        
        // Add celebration effects
        VisualEffects.createConfetti();
        VisualEffects.createFloatingText(`🎉 ${finalTeam.name}! 🎉`, wheel.parentElement, finalTeam.color_primary);
        
        // Play celebration sound
        SoundManager.playCelebrationSound();
        
        // Remove spinning effects
        VisualEffects.removeSpinGlow(wheel.parentElement);
        
        // Store final team for multiplayer systems
        if (typeof setCurrentWinner !== 'undefined') {
            setCurrentWinner(finalTeam);
        }
        
        // Check game mode and handle result accordingly
        if (window.onlineMultiplayer && window.onlineMultiplayer.gameData && 
            window.onlineMultiplayer.gameData.gameState === 'playing') {
            // Handle online multiplayer result
            handleOnlineSpinResult(finalTeam);
        } else if (gameState.phase === 'playing' && gameState.numPlayers > 1) {
            // Handle local multiplayer result - go directly to player selection
            console.log(`🎯 Local multiplayer: ${gameState.players[gameState.currentPlayerIndex].name} spun ${finalTeam.name}`);
            showPlayerSelection(finalTeam);
        } else {
            // Show normal result popup for classic mode  
            const sliceInfo = finalTeam.sliceNumber ? `🔢 Slice ${finalTeam.sliceNumber} of 30` : '';
            showTeamResult(finalTeam, sliceInfo);
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

// 🎯 NEW SLICE-BASED TEAM SELECTION SYSTEM
// Select team based on which numbered slice (pie piece) the wheel lands on
function selectTeamBySlice(finalAngle) {
    // Get wheel configuration for current sport
    const currentSport = getCurrentSport();
    const wheelConfig = window.wheelConfigurations?.[currentSport];
    
    if (!wheelConfig?.segments) {
        console.error("❌ No wheel configuration available for slice selection");
        return null;
    }

    // Normalize angle to 0-360 range
    const normalizedAngle = ((finalAngle % 360) + 360) % 360;
    
    // Account for pointer at top (12 o'clock) - rotate by 90 degrees
    const adjustedAngle = (normalizedAngle + 90) % 360;
    
    console.log(`🎯 Final angle: ${finalAngle}°`);
    console.log(`📐 Normalized: ${normalizedAngle}°, Adjusted for pointer: ${adjustedAngle}°`);
    
    // Find which slice the angle falls into
    for (let i = 0; i < wheelConfig.segments.length; i++) {
        const segment = wheelConfig.segments[i];
        let startAngle = segment.angle_start;
        let endAngle = segment.angle_end;
        
        // Handle the wrap-around case (e.g., last slice might go from 348° to 360°/0°)
        if (startAngle > endAngle) {
            // Slice crosses 0° boundary
            if (adjustedAngle >= startAngle || adjustedAngle < endAngle) {
                console.log(`🎯 Landed on Slice ${segment.index + 1}: ${segment.team_name}`);
                console.log(`📊 Slice angle range: ${startAngle}° - ${endAngle}° (crosses boundary)`);
                return {
                    name: segment.team_name,
                    abbreviation: segment.abbreviation,
                    color_primary: segment.color_primary,
                    logo_file: segment.logo_file,
                    sliceNumber: segment.index + 1
                };
            }
        } else {
            // Normal slice within 0-360° range
            // Use <= for end angle to handle border cases (wheel lands exactly on border)
            if (adjustedAngle >= startAngle && adjustedAngle <= endAngle) {
                console.log(`🎯 Landed on Slice ${segment.index + 1}: ${segment.team_name}`);
                console.log(`📊 Slice angle range: ${startAngle}° - ${endAngle}°`);
                console.log(`📐 Adjusted angle: ${adjustedAngle}° (within range)`);
                return {
                    name: segment.team_name,
                    abbreviation: segment.abbreviation,
                    color_primary: segment.color_primary,
                    logo_file: segment.logo_file,
                    sliceNumber: segment.index + 1
                };
            }
        }
    }
    
    // Fallback - should never happen with proper wheel config
    console.error("❌ No slice found for angle:", adjustedAngle);
    return wheelConfig.segments[0]; // Return first team as fallback
}

// Enhanced numbered selection system - pick a winning slice, then calculate target angle
function selectWinningTeam() {
    const currentSport = getCurrentSport();
    const wheelConfig = window.wheelConfigurations?.[currentSport];
    
    if (!wheelConfig?.segments) {
        console.error("❌ No wheel configuration available for team selection");
        return null;
    }

    // 🎲 Pick a random slice number (1 to total number of teams)
    const totalSlices = wheelConfig.segments.length;
    const winningSliceNumber = Math.floor(Math.random() * totalSlices) + 1;
    const winningSlice = wheelConfig.segments[winningSliceNumber - 1];
    
    if (!winningSlice) {
        console.error("❌ Invalid slice number:", winningSliceNumber);
        return null;
    }
    
    // Calculate target angle - aim for EXACT middle of the slice (never on borders)
    const sliceWidth = winningSlice.angle_end - winningSlice.angle_start;
    const middleOfSlice = winningSlice.angle_start + (sliceWidth / 2);
    // Adjust for pointer position (subtract 90° since we add it during selection)
    const targetAngle = (middleOfSlice - 90 + 360) % 360;
    
    console.log(`🎯 PRE-SELECTED WINNER:`);
    console.log(`🔢 Winning Slice: ${winningSliceNumber} of ${totalSlices}`);
    console.log(`🏀 Team: ${winningSlice.team_name}`);
    console.log(`📐 Slice range: ${winningSlice.angle_start}° - ${winningSlice.angle_end}°`);
    console.log(`🎯 Target angle: ${targetAngle}°`);
    
    return {
        team: {
            name: winningSlice.team_name,
            abbreviation: winningSlice.abbreviation,
            color_primary: winningSlice.color_primary,
            logo_file: winningSlice.logo_file,
            sliceNumber: winningSliceNumber
        },
        targetAngle: targetAngle,
        sliceNumber: winningSliceNumber
    };
}

// ⚠️ DEPRECATED: Old angle-based selection system 
// Now replaced with slice-based system above
function getSelectedTeam(finalAngle) {
    console.log("⚠️ Using deprecated angle-based selection - switching to slice-based system");
    return selectTeamBySlice(finalAngle);
}

// Helper function to get current sport
function getCurrentSport() {
    // Check if SportSelector is available
    if (typeof SportSelector !== 'undefined' && SportSelector.getCurrentSport) {
        return SportSelector.getCurrentSport();
    }
    // Default to 'nba' if sport selector not available
    return 'nba';
}

// 🧪 Test function to verify slice-based selection system
function testSliceSystem() {
    console.log("🧪 TESTING SLICE-BASED SELECTION SYSTEM");
    
    if (!window.wheelConfigurations?.nba?.segments) {
        console.log("⚠️ Wheel configuration not loaded yet");
        return;
    }
    
    const segments = window.wheelConfigurations.nba.segments;
    console.log(`📊 Loaded ${segments.length} team segments`);
    
    // Show slice boundaries for first few teams
    console.log("🔍 SLICE BOUNDARIES (first 5 teams):");
    for (let i = 0; i < Math.min(5, segments.length); i++) {
        const segment = segments[i];
        console.log(`  Slice ${segment.index + 1}: ${segment.team_name} → ${segment.angle_start}° - ${segment.angle_end}° (width: ${segment.angle_end - segment.angle_start}°)`);
    }
    
    // Test a few specific angles
    console.log("\n🎯 TESTING SPECIFIC ANGLES:");
    const testAngles = [0, 6, 12, 18, 90, 180, 270];
    
    for (const angle of testAngles) {
        const result = selectTeamBySlice(angle);
        if (result) {
            console.log(`  Angle ${angle}° → Slice ${result.sliceNumber}: ${result.name}`);
        } else {
            console.log(`  Angle ${angle}° → NO RESULT FOUND ❌`);
        }
    }
    
    // Test the pre-selection system
    console.log("\n🎲 TESTING PRE-SELECTION:");
    const winner = selectWinningTeam();
    if (winner) {
        console.log(`  Pre-selected: Slice ${winner.sliceNumber} → ${winner.team.name}`);
        console.log(`  Target angle: ${winner.targetAngle}°`);
        
        // Verify the target angle selects the right team
        const verification = selectTeamBySlice(winner.targetAngle);
        if (verification && verification.name === winner.team.name) {
            console.log(`  ✅ VERIFICATION PASSED: Target angle correctly selects ${verification.name}`);
        } else {
            console.log(`  ❌ VERIFICATION FAILED: Target angle selects ${verification?.name || 'null'} instead of ${winner.team.name}`);
        }
    }
    
    console.log("🧪 Slice system test complete!");
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

// 🎯 NEW NUMBERED TEAM SELECTION SYSTEM
// Pre-select winner by number, then calculate angle to land on correct position

// Global variable to store the pre-selected winning team
let preSelectedWinner = null;

// Get the pre-selected winning team (called after wheel stops)
function getPreSelectedWinner() {
    if (!preSelectedWinner) {
        console.error("❌ No pre-selected winner! Call selectWinningTeam() first.");
        return nbaTeams[0]; // Fallback to first team
    }
    
    console.log(`✅ WINNER CONFIRMED:`);
    console.log(`   🎯 Winning Number: ${preSelectedWinner.number}`);
    console.log(`   🏀 Team: ${preSelectedWinner.team.name}`);
    console.log(`   📍 Landed at: ${preSelectedWinner.targetAngle}° (Visual: ${preSelectedWinner.wheelConfig.angle_start}° - ${preSelectedWinner.wheelConfig.angle_end}°)`);
    
    return preSelectedWinner.team;
} 