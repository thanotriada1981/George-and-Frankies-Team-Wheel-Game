/**
 * Optimized Wheel Loader System
 * Loads pre-built wheel configurations instead of building dynamically
 * Solves multiplayer blank wheel issues and improves performance
 */

let wheelConfigurations = null;
let currentWheelConfig = null;

// Load all wheel configurations once at startup
async function loadWheelConfigurations() {
    console.log("🔧 Loading pre-built wheel configurations...");
    
    try {
        console.log("📡 Fetching ./data/wheel-configurations.json...");
        const response = await fetch('./data/wheel-configurations.json');
        console.log("📡 Response status:", response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        console.log("📊 Parsing JSON data...");
        wheelConfigurations = await response.json();
        console.log("✅ Wheel configurations loaded successfully");
        console.log("📊 Configuration keys:", Object.keys(wheelConfigurations));
        console.log("🏆 Available sports:", Object.keys(wheelConfigurations).filter(key => key !== 'format_version' && key !== 'last_updated' && key !== 'description'));
        
        // Validate NBA configuration
        if (wheelConfigurations.nba && wheelConfigurations.nba.segments) {
            console.log("🏀 NBA configuration validated:", wheelConfigurations.nba.segments.length, "teams");
        } else {
            console.warn("⚠️ NBA configuration missing or invalid");
        }
        
        return wheelConfigurations;
    } catch (error) {
        console.error("❌ Failed to load wheel configurations:", error);
        console.error("❌ Error details:", error.message);
        console.error("❌ Current location:", window.location.href);
        return null;
    }
}

// Load a specific sport's wheel configuration
function loadSportWheel(sportKey = 'nba') {
    console.log(`🎯 Loading ${sportKey.toUpperCase()} wheel configuration...`);
    
    if (!wheelConfigurations) {
        console.error("❌ Wheel configurations not loaded yet");
        return null;
    }
    
    const sportConfig = wheelConfigurations[sportKey.toLowerCase()];
    if (!sportConfig) {
        console.error(`❌ No wheel configuration found for sport: ${sportKey}`);
        return null;
    }
    
    currentWheelConfig = sportConfig;
    console.log(`✅ ${sportConfig.sport_name} wheel configuration loaded:`, {
        teams: sportConfig.total_teams,
        center: sportConfig.center_text
    });
    
    return sportConfig;
}

// Render wheel from pre-built configuration
function renderPrebuiltWheel(wheelId = 'wheel', sportKey = 'nba') {
    console.log(`🎨 Rendering pre-built ${sportKey.toUpperCase()} wheel...`);
    
    const wheelConfig = loadSportWheel(sportKey);
    if (!wheelConfig) {
        console.error("❌ Cannot render wheel: configuration not available");
        showErrorWheel(wheelId);
        return false;
    }
    
    const wheel = document.getElementById(wheelId);
    if (!wheel) {
        console.error(`❌ Wheel element not found: ${wheelId}`);
        return false;
    }
    
    // Clear existing content
    wheel.innerHTML = '';
    
    // Create wheel container using pre-built configuration
    const wheelContainer = document.createElement('div');
    wheelContainer.className = 'wheel-simple'; // Use same class as original system for animation compatibility
    wheelContainer.style.cssText = `
        width: ${wheelConfig.wheel_size}px;
        height: ${wheelConfig.wheel_size}px;
        border-radius: 50%;
        position: relative;
        border: none;
        overflow: hidden;
        background: ${wheelConfig.conic_gradient};
    `;
    
    // Add pre-positioned team labels and logos
    wheelConfig.segments.forEach(segment => {
        // Add team label
        const label = document.createElement('div');
        label.className = 'team-label';
        label.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            transform-origin: 0 0;
            transform: rotate(${segment.label_position.angle - 90}deg) translate(${segment.label_position.radius}px, -10px);
            color: white;
            font-weight: bold;
            font-size: ${segment.label_position.font_size}px;
            text-shadow: 1px 1px 2px black;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 90px;
            height: 20px;
            pointer-events: none;
            z-index: 5;
            white-space: nowrap;
        `;
        label.innerHTML = `<span style='width:100%;display:inline-block;text-align:center;'>${segment.team_name}</span>`;
        wheelContainer.appendChild(label);
        
        // Add team logo
        const logo = document.createElement('img');
        logo.src = segment.logo_file;
        logo.className = 'team-logo';
        logo.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            transform-origin: 0 0;
            transform: rotate(${segment.logo_position.angle - 90}deg) translate(${segment.logo_position.radius}px, -20px);
            width: ${segment.logo_position.size}px;
            height: ${segment.logo_position.size}px;
            pointer-events: none;
            z-index: 6;
        `;
        logo.onerror = function() {
            console.warn(`⚠️ Logo failed to load: ${segment.logo_file}`);
            this.style.display = 'none';
        };
        wheelContainer.appendChild(logo);
    });
    
    // Add center circle
    const centerCircle = document.createElement('div');
    centerCircle.className = 'center-circle';
    centerCircle.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: ${wheelConfig.center_color};
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
    centerCircle.textContent = wheelConfig.center_text;
    wheelContainer.appendChild(centerCircle);
    
    wheel.appendChild(wheelContainer);
    
    console.log(`✅ Pre-built ${sportKey.toUpperCase()} wheel rendered successfully with ${wheelConfig.total_teams} teams`);
    return true;
}

// Get team data from pre-built configuration (for compatibility with existing game logic)
function getTeamDataFromConfig(sportKey = 'nba') {
    const wheelConfig = wheelConfigurations?.[sportKey.toLowerCase()];
    if (!wheelConfig?.segments) {
        return [];
    }
    
    // Convert pre-built configuration back to team data format for compatibility
    return wheelConfig.segments.map(segment => ({
        name: segment.team_name,
        abbreviation: segment.abbreviation,
        color_primary: segment.color_primary,
        logo_file: segment.logo_file
    }));
}

// Initialize the wheel loader system
async function initializeWheelLoader() {
    console.log("🚀 Initializing optimized wheel loader system...");
    
    await loadWheelConfigurations();
    
    if (wheelConfigurations) {
        // Make wheel configurations globally available for debugging
        window.wheelConfigurations = wheelConfigurations;
        console.log("✅ Wheel loader system ready!");
        return true;
    } else {
        console.error("❌ Wheel loader system failed to initialize");
        return false;
    }
}

// Fallback error wheel for when configurations fail
function showErrorWheel(wheelId = 'wheel') {
    const wheel = document.getElementById(wheelId);
    if (!wheel) return;
    
    wheel.innerHTML = '';
    
    // Add error segments
    for (let i = 0; i < 4; i++) {
        const section = document.createElement('div');
        section.className = 'wheel-section-error';
        section.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            width: 250px;
            height: 250px;
            transform-origin: 0 0;
            transform: rotate(${i * 90}deg);
            background: #e74c3c;
            opacity: 0.8;
            clip-path: polygon(0 0, 50% 0, 0 50%);
        `;
        wheel.appendChild(section);
    }
    
    // Add error text in center
    const centerCircle = document.createElement('div');
    centerCircle.className = 'center-circle';
    centerCircle.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        border: 3px solid white;
        transform: translate(-50%, -50%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        text-align: center;
        z-index: 10;
    `;
    centerCircle.innerHTML = 'Error<br>Loading';
    wheel.appendChild(centerCircle);
    
    console.log("❌ Error wheel displayed");
}

// Export functions for global access
window.WheelLoader = {
    initialize: initializeWheelLoader,
    loadConfigurations: loadWheelConfigurations,
    loadSportWheel: loadSportWheel,
    renderPrebuiltWheel: renderPrebuiltWheel,
    getTeamData: getTeamDataFromConfig,
    showError: showErrorWheel
}; 