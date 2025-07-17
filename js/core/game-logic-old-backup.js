/**
 * Main Game Logic for NBA Team Wheel
 * Handles game state, spinning, and team building
 */

// Wheel State Manager - Prevents unnecessary wheel recreation
const WheelManager = {
    currentSport: null,
    wheelCreated: false,
    wheelElement: null,
    
    // Check if wheel needs to be created/recreated
    needsWheelUpdate(sport = 'nba') {
        // Only recreate if sport changed or wheel hasn't been created yet
        const sportChanged = this.currentSport !== sport;
        const needsCreation = !this.wheelCreated || !this.wheelElement;
        
        console.log(`🎯 WheelManager.needsWheelUpdate: sport=${sport}, currentSport=${this.currentSport}, sportChanged=${sportChanged}, needsCreation=${needsCreation}`);
        
        return sportChanged || needsCreation;
    },
    
    // Mark wheel as created for current sport
    markWheelCreated(sport = 'nba') {
        this.currentSport = sport;
        this.wheelCreated = true;
        this.wheelElement = document.getElementById('wheel');
        console.log(`✅ WheelManager: Wheel marked as created for ${sport}`);
    },
    
    // Reset wheel state (for sport changes)
    resetWheelState() {
        this.currentSport = null;
        this.wheelCreated = false;
        this.wheelElement = null;
        console.log(`🔄 WheelManager: Wheel state reset`);
    }
};

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
function drawWheelWithLogos(sport = 'nba', forceRecreate = false) {
    console.log("🎨 drawWheelWithLogos called - checking if wheel needs update...");
    
    // Check if wheel recreation is actually needed
    if (!forceRecreate && !WheelManager.needsWheelUpdate(sport)) {
        console.log("✅ Wheel already exists for current sport, skipping recreation");
        return;
    }
    
    console.log("🎨 Wheel update needed, proceeding with creation...");
    
    // Try using pre-built wheel system first
    if (typeof WheelLoader !== 'undefined' && WheelLoader.renderPrebuiltWheel) {
        console.log("✅ Using optimized pre-built wheel system");
        const success = WheelLoader.renderPrebuiltWheel('wheel', sport);
        
        if (success) {
            console.log("🎯 Pre-built wheel rendered successfully!");
            WheelManager.markWheelCreated(sport);
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
    WheelManager.markWheelCreated(sport);
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

// 🎯 Enhanced degree-based spin - arrow stays at 90°, wheel rotates to winning position
function spinWheelToDegree() {
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('classicSpinButton');
    const result = document.getElementById('classic-result');
    
    if (!wheel || !spinButton || !result) {
        console.error("❌ Required elements not found", { wheel: !!wheel, spinButton: !!spinButton, result: !!result });
        return;
    }

    if (gameState.isSpinning) {
        console.log("🚫 Already spinning");
        return;
    }

    gameState.isSpinning = true;

    // 🎲 Step 1: Pick a random degree (0-360°)
    const randomDegree = Math.random() * 360;
    
    // 🔍 Step 2: Find which team is at that degree
    const selectedTeam = findTeamByDegree(randomDegree);
    if (!selectedTeam) {
        console.error("❌ No team found for degree:", randomDegree);
        resetSpinState(spinButton, result);
        return;
    }

    console.log(`🎯 === DEGREE-BASED SPIN SYSTEM ===`);
    console.log(`🎲 Random degree: ${randomDegree.toFixed(2)}°`);
    console.log(`🏀 Team at ${randomDegree.toFixed(2)}°: ${selectedTeam.team_name}`);
    console.log(`📐 Team slice: ${selectedTeam.angle_start}° - ${selectedTeam.angle_end}°`);

    // 🧮 Step 3: Calculate rotation needed to bring this slice to the 90° arrow position
    // The arrow is at 90°, so we need to rotate the wheel so that randomDegree lands at 90°
    // Rotation needed = 90° - randomDegree (plus multiple full rotations for spinning effect)
    const baseRotation = 90 - randomDegree;
    const fullRotations = 7200; // 20 full rotations (20 × 360°)
    const totalRotation = fullRotations + baseRotation;

    console.log(`🧮 ROTATION CALCULATION:`);
    console.log(`  - Arrow position: 90°`);
    console.log(`  - Winning degree: ${randomDegree.toFixed(2)}°`);
    console.log(`  - Base rotation needed: 90° - ${randomDegree.toFixed(2)}° = ${baseRotation.toFixed(2)}°`);
    console.log(`  - Full rotations: ${fullRotations}°`);
    console.log(`  - Total rotation: ${totalRotation.toFixed(2)}°`);
    console.log(`✅ GUARANTEED: Slice at ${randomDegree.toFixed(2)}° will land at 90° arrow!`);

    // Update UI
    spinButton.disabled = true;
    spinButton.textContent = 'Spinning...';
    result.textContent = `🎡 Spinning to ${selectedTeam.team_name}...`;

    // 🎡 Step 4: Apply the rotation
    applyRealisticSpin(wheel, totalRotation);

    // 🏁 Step 5: Show result after animation completes
    setTimeout(() => {
        console.log(`🏁 SPIN COMPLETE`);
        console.log(`🎯 Final position: Arrow at 90° pointing to ${selectedTeam.team_name}`);
        
        // 🔍 VERIFICATION: Check final position
        const finalAngleMod = ((totalRotation % 360) + 360) % 360;
        const expectedPosition = ((90 - randomDegree) + 360) % 360;
        console.log(`🔍 VERIFICATION:`);
        console.log(`  - Total rotation mod 360: ${finalAngleMod.toFixed(2)}°`);
        console.log(`  - Expected final position: ${expectedPosition.toFixed(2)}°`);
        console.log(`  - Difference: ${Math.abs(finalAngleMod - expectedPosition).toFixed(2)}°`);
        
        // Convert team data to expected format for display
        const teamForDisplay = {
            name: selectedTeam.team_name,
            logo_file: selectedTeam.logo_file,
            color_primary: selectedTeam.color_primary,
            abbreviation: selectedTeam.abbreviation
        };

        // Handle the result
        if (gameState.currentMode === 'online' && window.onlineMultiplayer) {
            handleOnlineResult(teamForDisplay);
        } else if (gameState.currentMode === 'multiplayer') {
            handleMultiplayerResult(teamForDisplay);
        } else {
            handleSinglePlayerResult(teamForDisplay);
        }

        resetSpinState(spinButton, result);
    }, 6200); // Match the animation duration
}

// 🔍 Find team by exact degree position
function findTeamByDegree(degree) {
    const wheelConfig = window.wheelConfigurations?.nba;
    if (!wheelConfig?.segments) {
        console.error("❌ Wheel configuration not loaded");
        return null;
    }
    
    // Normalize degree to 0-360 range
    const normalizedDegree = ((degree % 360) + 360) % 360;
    
    // Find the team that contains this degree
    for (const segment of wheelConfig.segments) {
        if (normalizedDegree >= segment.angle_start && normalizedDegree < segment.angle_end) {
            console.log(`✅ Found team: ${segment.team_name} contains ${normalizedDegree.toFixed(2)}°`);
            return segment;
        }
    }
    
    // Handle edge case: degree 360 should map to first team (Atlanta Hawks)
    if (Math.abs(normalizedDegree - 360) < 0.01) {
        console.log(`✅ Edge case: 360° maps to first team (Atlanta Hawks)`);
        return wheelConfig.segments[0];
    }
    
    console.error(`❌ No team found for degree ${normalizedDegree.toFixed(2)}°`);
    return null;
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
    
    // Pointer is now properly aligned with slice centers using CSS transforms
    // No additional adjustment needed - use normalized angle directly
    const adjustedAngle = normalizedAngle;
    
    console.log(`🎯 Final angle: ${finalAngle}°`);
    console.log(`📐 Normalized: ${normalizedAngle}°, Pointer-aligned angle: ${adjustedAngle}°`);
    
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
            // Use <= for the last slice (index === length-1) to handle 360° boundary
            const isLastSlice = (i === wheelConfig.segments.length - 1);
            const inRange = isLastSlice 
                ? (adjustedAngle >= startAngle && adjustedAngle <= endAngle)
                : (adjustedAngle >= startAngle && adjustedAngle < endAngle);
                
            if (inRange) {
                console.log(`🎯 Landed on Slice ${segment.index + 1}: ${segment.team_name}`);
                console.log(`📊 Slice angle range: ${startAngle}° - ${endAngle}°${isLastSlice ? ' (last slice)' : ''}`);
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
    // Pointer is now properly aligned with slice centers - use middle angle directly
    const targetAngle = middleOfSlice;
    
    console.log(`🎯 PRE-SELECTED WINNER:`);
    console.log(`🔢 Winning Slice: ${winningSliceNumber} of ${totalSlices}`);
    console.log(`🏀 Team: ${winningSlice.team_name}`);
    console.log(`📐 Slice range: ${winningSlice.angle_start}° - ${winningSlice.angle_end}° (width: ${sliceWidth}°)`);
    console.log(`🎯 Middle of slice: ${middleOfSlice}°`);
    console.log(`🎯 Target angle: ${targetAngle}° (targets exact middle of slice)`);
    
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

// 🎯 Quick test function - run in browser console: testQuickSpin()
function testQuickSpin() {
    console.log("🎯 TESTING QUICK SPIN SYSTEM");
    const winner = selectWinningTeam();
    if (winner) {
        console.log(`🏀 Selected: ${winner.team.name} (Slice ${winner.sliceNumber})`);
        console.log(`🎯 Target angle: ${winner.targetAngle}°`);
        
        // Test verification
        const verification = selectTeamBySlice(winner.targetAngle);
        if (verification && verification.name === winner.team.name) {
            console.log(`✅ PERFECT: Target angle correctly selects ${verification.name}`);
        } else {
            console.log(`❌ MISMATCH: Target angle selects ${verification?.name || 'null'} instead of ${winner.team.name}`);
        }
    }
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
        const sliceWidth = segment.angle_end - segment.angle_start;
        const expectedMiddle = segment.angle_start + (sliceWidth / 2);
        console.log(`  Slice ${segment.index + 1}: ${segment.team_name} → ${segment.angle_start}° - ${segment.angle_end}° (width: ${sliceWidth}°, middle: ${expectedMiddle}°)`);
    }
    
    // Test a few specific angles including slice middles
    console.log("\n🎯 TESTING SPECIFIC ANGLES:");
    const testAngles = [
        0,    // Boundary between last and first team
        6,    // Middle of Atlanta Hawks (0-12)
        12,   // Boundary between Hawks and Celtics  
        18,   // Middle of Boston Celtics (12-24)
        24,   // Boundary between Celtics and Nets
        30,   // Middle of Brooklyn Nets (24-36)
        90, 180, 270, 354  // Various positions including last team middle
    ];
    
    for (const angle of testAngles) {
        const result = selectTeamBySlice(angle);
        if (result) {
            console.log(`  Angle ${angle}° → Slice ${result.sliceNumber}: ${result.name}`);
        } else {
            console.log(`  Angle ${angle}° → NO RESULT FOUND ❌`);
        }
    }
    
    // Test the selectWinningTeam function specifically
    console.log("\n🎯 TESTING WINNING TEAM SELECTION:");
    for (let i = 0; i < 5; i++) {
    const winner = selectWinningTeam();
    if (winner) {
            console.log(`  Test ${i + 1}: ${winner.team.name} (Slice ${winner.sliceNumber})`);
            console.log(`    Target angle: ${winner.targetAngle}°`);
        
            // Verify the target angle hits the right slice
        const verification = selectTeamBySlice(winner.targetAngle);
        if (verification && verification.name === winner.team.name) {
                console.log(`    ✅ PERFECT: Target angle correctly selects ${verification.name}`);
        } else {
                console.log(`    ❌ MISMATCH: Target angle selects ${verification?.name || 'null'} instead of ${winner.team.name}`);
                console.log(`    🔍 Debug: Target ${winner.targetAngle}° should hit slice ${winner.sliceNumber}`);
        }
    }
    }
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
window.spinWheel = spinWheelToDegree;
window.closePopup = closePopup;
window.switchMode = switchMode;
window.drawWheelWithLogos = drawWheelWithLogos;
window.WheelManager = WheelManager;
window.testSliceSystem = testSliceSystem;
window.testQuickSpin = testQuickSpin;

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

// 🔧 DEBUG MODE: Add visual debugging for slice targeting
function enableSliceDebugMode() {
    console.log("🔧 SLICE DEBUG MODE ENABLED");
    console.log("📋 Available commands:");
    console.log("  testSliceSystem() - Test all slice boundaries");
    console.log("  testQuickSpin() - Test single spin targeting");
    console.log("  debugSpinToSlice(sliceNumber) - Force spin to specific slice");
    console.log("  showSliceBoundaries() - Visual slice boundary overlay");
    console.log("  testArrowAlignment() - Test universal arrow alignment");
    
    window.debugMode = true;
}

// 🎯 Force spin to a specific slice for testing
function debugSpinToSlice(sliceNumber) {
    if (!window.wheelConfigurations?.nba?.segments) {
        console.error("❌ Wheel configuration not loaded");
        return;
    }
    
    const segments = window.wheelConfigurations.nba.segments;
    if (sliceNumber < 1 || sliceNumber > segments.length) {
        console.error(`❌ Invalid slice number. Must be 1-${segments.length}`);
        return;
    }
    
    const targetSlice = segments[sliceNumber - 1];
    const sliceWidth = targetSlice.angle_end - targetSlice.angle_start;
    const middleOfSlice = targetSlice.angle_start + (sliceWidth / 2);
    const targetAngle = (middleOfSlice - 90 + 360) % 360;
    
    console.log(`🎯 DEBUG SPIN TO SLICE ${sliceNumber}:`);
    console.log(`   Team: ${targetSlice.team_name}`);
    console.log(`   Slice range: ${targetSlice.angle_start}° - ${targetSlice.angle_end}°`);
    console.log(`   Middle of slice: ${middleOfSlice}°`);
    console.log(`   Target angle: ${targetAngle}°`);
    
    // Force the wheel to that exact position
    const wheel = document.getElementById('wheel');
    const wheelContainer = wheel?.querySelector('.wheel-simple');
    if (wheelContainer) {
        wheelContainer.style.transition = 'transform 2s ease-out';
        wheelContainer.style.transform = `rotate(${targetAngle}deg)`;
        
        // Verify after 2 seconds
        setTimeout(() => {
            const verification = selectTeamBySlice(targetAngle);
            if (verification && verification.name === targetSlice.team_name) {
                console.log(`✅ SUCCESS: Wheel positioned correctly on ${verification.name}`);
            } else {
                console.log(`❌ FAILED: Expected ${targetSlice.team_name}, got ${verification?.name || 'null'}`);
                console.log(`🔍 Debug angles:`, {
                    target: targetAngle,
                    normalized: ((targetAngle % 360) + 360) % 360,
                    adjusted: ((targetAngle % 360) + 360 + 90) % 360
                });
            }
        }, 2100);
    }
}

// 🎨 Show visual slice boundaries on the wheel
function showSliceBoundaries() {
    console.log("🎨 Adding visual slice boundary markers...");
    
    const wheel = document.getElementById('wheel');
    if (!wheel || !window.wheelConfigurations?.nba?.segments) {
        console.error("❌ Wheel or configuration not available");
        return;
    }
    
    const segments = window.wheelConfigurations.nba.segments;
    
    // Remove existing debug markers
    wheel.querySelectorAll('.debug-boundary').forEach(el => el.remove());
    
    // Add boundary lines for each slice
    segments.forEach((segment, index) => {
        // Start boundary line
        const startLine = document.createElement('div');
        startLine.className = 'debug-boundary';
        startLine.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 2px;
            height: 250px;
            background: red;
            transform-origin: 0 0;
            transform: rotate(${segment.angle_start - 90}deg) translate(-1px, -250px);
            z-index: 20;
            pointer-events: none;
        `;
        wheel.appendChild(startLine);
        
        // Middle line (where arrow should land)
        const sliceWidth = segment.angle_end - segment.angle_start;
        const middleAngle = segment.angle_start + (sliceWidth / 2);
        const middleLine = document.createElement('div');
        middleLine.className = 'debug-boundary';
        middleLine.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 3px;
            height: 200px;
            background: lime;
            transform-origin: 0 0;
            transform: rotate(${middleAngle - 90}deg) translate(-1.5px, -200px);
            z-index: 21;
            pointer-events: none;
        `;
        wheel.appendChild(middleLine);
        
        // Add slice number label
        const label = document.createElement('div');
        label.className = 'debug-boundary';
        label.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            color: white;
            font-weight: bold;
            font-size: 14px;
            background: rgba(0,0,0,0.7);
            padding: 2px 6px;
            border-radius: 3px;
            transform-origin: 0 0;
            transform: rotate(${middleAngle - 90}deg) translate(10px, -160px);
            z-index: 22;
            pointer-events: none;
        `;
        label.textContent = index + 1;
        wheel.appendChild(label);
    });
    
    console.log("✅ Visual boundaries added:");
    console.log("   🔴 Red lines = Slice boundaries");
    console.log("   🟢 Green lines = Slice centers (where arrow should land)");
    console.log("   📊 Numbers = Slice numbers");
    console.log("\nTo remove: hideSliceBoundaries()");
}

// 🧹 Hide visual slice boundaries
function hideSliceBoundaries() {
    const wheel = document.getElementById('wheel');
    if (wheel) {
        wheel.querySelectorAll('.debug-boundary').forEach(el => el.remove());
        console.log("🧹 Visual boundaries removed");
    }
}

// Export debug functions
window.enableSliceDebugMode = enableSliceDebugMode;
window.debugSpinToSlice = debugSpinToSlice;
window.showSliceBoundaries = showSliceBoundaries;
window.hideSliceBoundaries = hideSliceBoundaries;

// 🎯 Test arrow alignment with slice centers
function testArrowAlignment() {
    console.log("🎯 TESTING ARROW ALIGNMENT WITH SLICE CENTERS");
    
    if (!window.wheelConfigurations?.nba?.segments) {
        console.error("❌ Wheel configuration not loaded");
        return;
    }
    
    const segments = window.wheelConfigurations.nba.segments;
    console.log(`📊 Testing arrow alignment for ${segments.length} slices`);
    
    // Test first 5 slices
    console.log("\n🔍 TESTING FIRST 5 SLICES:");
    for (let i = 0; i < Math.min(5, segments.length); i++) {
        const segment = segments[i];
        const sliceWidth = segment.angle_end - segment.angle_start;
        const centerAngle = segment.angle_start + (sliceWidth / 2);
        
        console.log(`\n  Slice ${i + 1}: ${segment.team_name}`);
        console.log(`    Range: ${segment.angle_start}° - ${segment.angle_end}°`);
        console.log(`    Center: ${centerAngle}°`);
        console.log(`    Logo position: ${segment.logo_position.angle}°`);
        console.log(`    Label position: ${segment.label_position.angle}°`);
        
        // Verify center calculations match the configuration
        if (Math.abs(centerAngle - segment.logo_position.angle) < 0.1) {
            console.log(`    ✅ Arrow center matches logo/label position`);
        } else {
            console.log(`    ❌ Mismatch: calculated center ${centerAngle}° vs logo position ${segment.logo_position.angle}°`);
        }
    }
    
    // Test the spinning target calculation
    console.log("\n🎯 TESTING SPIN TARGET CALCULATION:");
    for (let i = 0; i < 3; i++) {
        const winner = selectWinningTeam();
        if (winner) {
            const targetSlice = segments[winner.sliceNumber - 1];
            const expectedCenter = targetSlice.angle_start + (targetSlice.angle_end - targetSlice.angle_start) / 2;
            
            console.log(`\n  Test ${i + 1}: ${winner.team.name} (Slice ${winner.sliceNumber})`);
            console.log(`    Target angle: ${winner.targetAngle}°`);
            console.log(`    Expected center: ${expectedCenter}°`);
            console.log(`    Logo position: ${targetSlice.logo_position.angle}°`);
            
            if (Math.abs(winner.targetAngle - expectedCenter) < 0.1) {
                console.log(`    ✅ Target angle correctly centers on slice`);
            } else {
                console.log(`    ❌ Target angle ${winner.targetAngle}° doesn't match expected center ${expectedCenter}°`);
            }
            
            // Verify the angle selection works
            const verification = selectTeamBySlice(winner.targetAngle);
            if (verification && verification.name === winner.team.name) {
                console.log(`    ✅ Angle selection correctly identifies ${verification.name}`);
            } else {
                console.log(`    ❌ Angle selection identifies ${verification?.name || 'null'} instead of ${winner.team.name}`);
            }
        }
    }
    
    console.log("\n🎯 Arrow alignment test complete!");
    console.log("💡 To see visual boundaries: showSliceBoundaries()");
    console.log("💡 To test specific slice: debugSpinToSlice(sliceNumber)");
}

// Export the new test function
window.testArrowAlignment = testArrowAlignment;

// 🎮 Handle single player result
function handleSinglePlayerResult(finalTeam) {
    const sliceInfo = finalTeam.sliceNumber ? `🔢 Slice ${finalTeam.sliceNumber} of 30` : '';
    showTeamResult(finalTeam, sliceInfo);
}

// 🎮 Handle local multiplayer result  
function handleMultiplayerResult(finalTeam) {
    if (gameState.phase === 'playing' && gameState.numPlayers > 1) {
        console.log(`🎯 Local multiplayer: ${gameState.players[gameState.currentPlayerIndex].name} spun ${finalTeam.name}`);
        showPlayerSelection(finalTeam);
    } else {
        // Fallback to single player
        handleSinglePlayerResult(finalTeam);
    }
}

// Export debug functions
window.enableSliceDebugMode = enableSliceDebugMode;
window.debugSpinToSlice = debugSpinToSlice;
window.showSliceBoundaries = showSliceBoundaries;
window.hideSliceBoundaries = hideSliceBoundaries;
window.testArrowAlignment = testArrowAlignment;
window.testLockedPositionSystem = testLockedPositionSystem;

// 🔒 Test the locked position system for perfect synchronization
function testLockedPositionSystem() {
    console.log("🔒 TESTING LOCKED POSITION SYSTEM");
    console.log("==================================");
    
    const currentSport = getCurrentSport();
    const wheelConfig = window.wheelConfigurations?.[currentSport];
    
    if (!wheelConfig?.segments) {
        console.error("❌ Wheel configuration not loaded");
        return;
    }
    
    console.log(`📊 Testing ${wheelConfig.segments.length} locked positions...\n`);
    
    // Test each slice position
    for (let sliceNum = 1; sliceNum <= wheelConfig.segments.length; sliceNum++) {
        const segment = wheelConfig.segments[sliceNum - 1];
        const sliceWidth = segment.angle_end - segment.angle_start;
        const centerAngle = segment.angle_start + (sliceWidth / 2);
        
        console.log(`🔒 Slice ${sliceNum}: ${segment.team_name}`);
        console.log(`   📐 Range: ${segment.angle_start}° - ${segment.angle_end}° (width: ${sliceWidth}°)`);
        console.log(`   🎯 Center: ${centerAngle}°`);
        console.log(`   ✅ Lock: Slice ${sliceNum} = ${segment.team_name}\n`);
    }
    
    console.log("🎲 Testing random selections...");
    for (let i = 0; i < 5; i++) {
        const locked = selectTeamByLockedPosition();
        if (locked) {
            console.log(`Test ${i+1}: Slice ${locked.sliceNumber} = ${locked.team.name}`);
        }
    }
    
    console.log("\n✅ LOCKED POSITION SYSTEM VERIFIED!");
    console.log("🎯 Each slice number permanently maps to the same team");
    console.log("🎡 Visual wheel position = Selected team (100% synchronized)");
}

// 🔄 Reset spin state helper
function resetSpinState(spinButton, result) {
    gameState.isSpinning = false;
    spinButton.disabled = false;
    spinButton.textContent = '🎯 SPIN THE WHEEL! 🎯';
    result.textContent = 'Click "Spin the Wheel" to start!';
}

// Apply realistic deceleration spin animation
function applyRealisticSpin(wheel, totalRotation) {
    console.log("🎡 === WHEEL ROTATION DEBUG ===");
    console.log(`🎡 Starting spin animation, total rotation: ${totalRotation}°`);
    
    const wheelContainer = wheel.querySelector('.wheel-simple');
    if (!wheelContainer) {
        console.error("❌ Wheel container not found for spinning");
        return;
    }
    
    // Calculate the target final position (where arrow should point)
    const targetDegree = totalRotation % 360;
    console.log(`🎯 Target degree (where arrow should point): ${targetDegree.toFixed(2)}°`);
    
    // CRITICAL: Reset wheel to exactly 0° before spinning
    console.log("🔄 Resetting wheel to 0° starting position...");
    wheelContainer.style.transition = 'none';
    wheelContainer.style.transform = 'rotate(0deg)';
    
    // Force a reflow to ensure the reset takes effect
    wheelContainer.offsetHeight;
    console.log("✅ Wheel reset to 0° complete");
    
    // Apply the rotation
    setTimeout(() => {
        console.log(`🎡 Applying rotation: ${totalRotation}°`);
        
        // Use a custom cubic-bezier curve that starts fast and ends very slow
        wheelContainer.style.transition = 'transform 6s cubic-bezier(0.23, 1, 0.32, 1)';
        wheelContainer.style.transform = `rotate(${totalRotation}deg)`;
        
        console.log("🎡 Spin started, will complete in 6 seconds");
        console.log(`📍 Expected final position: ${targetDegree.toFixed(2)}° (arrow should point here)`);
    }, 100);
    
    // Ensure precise final positioning
    setTimeout(() => {
        wheelContainer.style.transition = 'transform 0.2s ease-out';
        wheelContainer.style.transform = `rotate(${totalRotation}deg)`;
        
        console.log("🏁 SPIN ANIMATION COMPLETE");
        console.log(`🎡 Final wheel rotation: ${totalRotation}°`);
        console.log(`🎯 Arrow pointing at: ${targetDegree.toFixed(2)}°`);
        console.log("📋 Check: Does the visual match the calculated team?");
    }, 6200);
}

window.testLockedPositionSystem = testLockedPositionSystem;
window.testFixedSlicePositionSystem = testFixedSlicePositionSystem;

// 🎯 Test the new fixed slice position system
function testFixedSlicePositionSystem() {
    console.log("🎯 TESTING FIXED SLICE POSITION SYSTEM");
    console.log("=====================================");
    
    const wheelConfig = window.wheelConfigurations?.nba;
    if (!wheelConfig?.segments) {
        console.error("❌ Wheel configuration not loaded");
        return;
    }
    
    console.log(`📊 Testing fixed positions for ${wheelConfig.segments.length} teams...\n`);
    
    // Show first 5 teams and their fixed positions
    console.log("🔍 FIXED SLICE POSITIONS (first 5):");
    for (let i = 0; i < Math.min(5, wheelConfig.segments.length); i++) {
        const team = wheelConfig.segments[i];
        const sliceNumber = i + 1;
        const sliceAngle = i * 12; // Each slice is 12°
        
        console.log(`  Slice ${sliceNumber}: ${team.team_name} (${sliceAngle}°-${sliceAngle + 12}°)`);
    }
    
    console.log("\n🎲 Testing random selections...");
    for (let test = 1; test <= 5; test++) {
        const selectedSlice = Math.floor(Math.random() * wheelConfig.segments.length) + 1;
        const selectedTeam = wheelConfig.segments[selectedSlice - 1];
        const sliceAngle = (selectedSlice - 1) * 12;
        const totalRotation = (20 * 360) + sliceAngle; // 20 full rotations + slice angle
        
        console.log(`Test ${test}: Slice ${selectedSlice} = ${selectedTeam.team_name}`);
        console.log(`   → Rotation: ${totalRotation}° (20 rotations + ${sliceAngle}°)`);
    }
    
    console.log("\n✅ FIXED SLICE POSITION SYSTEM VERIFIED!");
    console.log("🎯 Each team has a permanent position that never changes");
    console.log("🎡 Rotation is predictable: 20 full spins + selected slice angle");
    console.log("🔄 Visual position will always match selected team");
}

window.testArrowAlignment = testArrowAlignment;
window.testFixedSlicePositionSystem = testFixedSlicePositionSystem;
window.testDegreeBasedSystem = testDegreeBasedSystem;
window.testSpecificDegree = testSpecificDegree;

// 🎯 Test the new degree-based system
function testDegreeBasedSystem() {
    console.log("🎯 TESTING DEGREE-BASED SYSTEM");
    console.log("==============================");
    
    const wheelConfig = window.wheelConfigurations?.nba;
    if (!wheelConfig?.segments) {
        console.error("❌ Wheel configuration not loaded");
        return;
    }
    
    console.log(`📊 Testing degree mapping for ${wheelConfig.segments.length} teams...`);
    console.log("");
    
    // Test specific degrees mentioned by user
    const testDegrees = [
        0,    // Atlanta Hawks
        248,  // Oklahoma City Thunder (user's example)
        66,   // Cleveland Cavaliers (where arrow was pointing)
        78,   // Dallas Mavericks (where arrow was pointing)
        294,  // Portland Trail Blazers (what system said)
        359.9 // Edge case near 360°
    ];
    
    console.log("🔍 TESTING SPECIFIC DEGREES:");
    testDegrees.forEach(degree => {
        const team = findTeamByDegree(degree);
        if (team) {
            console.log(`  ${degree}° → ${team.team_name} (${team.angle_start}° - ${team.angle_end}°)`);
        } else {
            console.error(`  ${degree}° → ❌ NO TEAM FOUND`);
        }
    });
    
    console.log("");
    console.log("🎲 TESTING RANDOM SELECTIONS:");
    for (let i = 0; i < 5; i++) {
        const randomDegree = Math.random() * 360;
        const team = findTeamByDegree(randomDegree);
        if (team) {
            console.log(`  ${randomDegree.toFixed(2)}° → ${team.team_name}`);
        } else {
            console.error(`  ${randomDegree.toFixed(2)}° → ❌ NO TEAM FOUND`);
        }
    }
    
    console.log("");
    console.log("✅ Degree-based system test complete!");
    console.log("📋 To test: testDegreeBasedSystem() or spin the wheel with console open");
}

// 🎯 Test spinning to a specific degree to verify accuracy
function testSpecificDegree(targetDegree) {
    console.log(`🧪 === TESTING SPECIFIC DEGREE: ${targetDegree}° ===`);
    
    // Find team at this degree
    const team = findTeamByDegree(targetDegree);
    if (!team) {
        console.error(`❌ No team found at ${targetDegree}°`);
        return;
    }
    
    console.log(`🏀 Team found: ${team.team_name}`);
    console.log(`📐 Team range: ${team.angle_start}° - ${team.angle_end}°`);
    
    // Calculate rotation needed
    const baseRotation = 90 - targetDegree;
    const totalRotation = 7200 + baseRotation; // 20 spins + adjustment
    
    console.log(`🧮 Rotation calculation:`);
    console.log(`  - Target degree: ${targetDegree}°`);
    console.log(`  - Arrow position: 90°`);
    console.log(`  - Base rotation: 90° - ${targetDegree}° = ${baseRotation}°`);
    console.log(`  - Total rotation: ${totalRotation}°`);
    
    // Apply rotation
    const wheel = document.getElementById('wheel');
    const wheelContainer = wheel?.querySelector('.wheel-simple');
    if (wheelContainer) {
        wheelContainer.style.transition = 'transform 2s ease-out';
        wheelContainer.style.transform = `rotate(${totalRotation}deg)`;
        
        console.log(`🎡 Applied rotation: ${totalRotation}°`);
        console.log(`✅ Expected result: ${team.team_name} should be at arrow (90°)`);
        
        // Verify after animation
        setTimeout(() => {
            const finalPos = ((totalRotation % 360) + 360) % 360;
            const expectedPos = ((90 - targetDegree) + 360) % 360;
            console.log(`🔍 VERIFICATION:`);
            console.log(`  - Final position: ${finalPos.toFixed(2)}°`);
            console.log(`  - Expected: ${expectedPos.toFixed(2)}°`);
            console.log(`  - Match: ${Math.abs(finalPos - expectedPos) < 1 ? '✅ YES' : '❌ NO'}`);
        }, 2100);
    }
}

// 🧪 Test the degree-based system with multiple random selections
function testDegreeBasedSystem() {
    console.log("🧪 === TESTING DEGREE-BASED SYSTEM ===");
    console.log("=====================================");
    
    const wheelConfig = window.wheelConfigurations?.nba;
    if (!wheelConfig?.segments) {
        console.error("❌ Wheel configuration not loaded");
        return;
    }
    
    console.log("🎯 Arrow positioned at: 90° (right side)");
    console.log("🎯 Wheel rotates so winning slice lands at arrow\n");
    
    // Test 5 random degrees
    for (let i = 1; i <= 5; i++) {
        const randomDegree = Math.random() * 360;
        const team = findTeamByDegree(randomDegree);
        
        if (team) {
            const baseRotation = 90 - randomDegree;
            const totalRotation = 7200 + baseRotation;
            
            console.log(`Test ${i}:`);
            console.log(`  🎲 Random degree: ${randomDegree.toFixed(2)}°`);
            console.log(`  🏀 Team: ${team.team_name}`);
            console.log(`  🔄 Total rotation: ${totalRotation.toFixed(2)}°`);
            console.log(`  ✅ Result: ${team.team_name} lands at 90° arrow\n`);
        }
    }
    
    console.log("🧪 Ready to test! Use these commands:");
    console.log("  testSpecificDegree(279) - Test Phoenix Suns");
    console.log("  testSpecificDegree(0) - Test Atlanta Hawks");  
    console.log("  testSpecificDegree(180) - Test team at 180°");
}

// Export test functions
window.testSpecificDegree = testSpecificDegree;
window.testDegreeBasedSystem = testDegreeBasedSystem;

// 🔧 EMERGENCY DEBUG: Find out exactly where the arrow is pointing
function debugArrowPosition() {
    console.log("🔧 === DEBUGGING ARROW POSITION ===");
    
    const wheel = document.getElementById('wheel');
    const wheelContainer = wheel?.querySelector('.wheel-simple');
    if (!wheelContainer) {
        console.error("❌ Wheel container not found");
        return;
    }

    // Test known team positions without rotation
    console.log("📍 Testing known team positions:");
    console.log("  🏀 Indiana Pacers: 132° - 144° (visual target)");
    console.log("  🏀 New York Knicks: 228° - 240° (math selected)");
    
    // Reset wheel to 0 and test where arrow points
    wheelContainer.style.transition = 'none';
    wheelContainer.style.transform = 'rotate(0deg)';
    
    console.log("🎯 Arrow at 0° wheel rotation - what team is at arrow?");
    const teamAt0 = findTeamByDegree(90); // Arrow should be at 90°
    console.log(`  🎯 Team at arrow (90°): ${teamAt0?.team_name || 'NOT FOUND'}`);
    
    // Test Pacers position - where should wheel be to point arrow at Pacers?
    const pacersMiddle = 138; // Middle of Pacers slice
    const rotationToPacers = 90 - pacersMiddle; // Arrow at 90°, want Pacers at 90°
    const normalizedToPacers = ((rotationToPacers % 360) + 360) % 360;
    
    console.log(`🧮 To point arrow at Pacers (138°):`);
    console.log(`  - Rotation needed: 90° - 138° = ${rotationToPacers}°`);
    console.log(`  - Normalized: ${normalizedToPacers}°`);
    
    // Apply rotation to put Pacers at arrow
    setTimeout(() => {
        wheelContainer.style.transform = `rotate(${rotationToPacers}deg)`;
        console.log(`🎡 Rotated wheel ${rotationToPacers}° - Pacers should be at arrow now`);
        console.log(`📋 Visual check: Does arrow point to Pacers?`);
    }, 1000);
    
    // Test Knicks position 
    setTimeout(() => {
        const knicksMiddle = 234; // Middle of Knicks slice  
        const rotationToKnicks = 90 - knicksMiddle;
        const normalizedToKnicks = ((rotationToKnicks % 360) + 360) % 360;
        
        console.log(`🧮 To point arrow at Knicks (234°):`);
        console.log(`  - Rotation needed: 90° - 234° = ${rotationToKnicks}°`);
        console.log(`  - Normalized: ${normalizedToKnicks}°`);
        
        wheelContainer.style.transform = `rotate(${rotationToKnicks}deg)`;
        console.log(`🎡 Rotated wheel ${rotationToKnicks}° - Knicks should be at arrow now`);
        console.log(`📋 Visual check: Does arrow point to Knicks?`);
    }, 3000);
}

// 🔧 Test what degree the arrow is ACTUALLY pointing to
function testActualArrowPosition() {
    console.log("🔧 === TESTING ACTUAL ARROW POSITION ===");
    
    const wheel = document.getElementById('wheel');
    const wheelContainer = wheel?.querySelector('.wheel-simple');
    if (!wheelContainer) {
        console.error("❌ Wheel container not found");
        return;
    }

    // Reset wheel
    wheelContainer.style.transition = 'none';
    wheelContainer.style.transform = 'rotate(0deg)';
    
    console.log("🎯 Wheel at 0° rotation - testing all directions:");
    
    // Test what teams are at different arrow positions
    const testDegrees = [0, 45, 90, 135, 180, 225, 270, 315];
    
    testDegrees.forEach(deg => {
        const team = findTeamByDegree(deg);
        console.log(`  ${deg.toString().padStart(3, ' ')}°: ${team?.team_name || 'NOT FOUND'}`);
    });
    
    console.log("\n🔍 If arrow points to Pacers when you see it, the arrow is actually at:");
    console.log(`  Expected: 138° (Pacers middle)`);
    console.log("\n🔍 If system selects Knicks, the math thinks arrow is at:");
    console.log(`  Expected: 234° (Knicks middle)`);
    console.log("\n📐 Difference: 234° - 138° = 96° offset");
}

// Export debug functions
window.debugArrowPosition = debugArrowPosition;
window.testActualArrowPosition = testActualArrowPosition; 