/**
 * 🏆 MASTER WHEEL ENGINE - WORKING FOUNDATION 🏆
 * 
 * ⚠️  CRITICAL: DO NOT MODIFY THIS FILE! ⚠️ 
 * This is the PROVEN working wheel system that took extensive debugging to perfect.
 * 
 * ✅ KEY BREAKTHROUGH: Rotation calculation fix
 * OLD (broken): rotationNeeded = teamCenterDegree
 * NEW (working): rotationNeeded = (360 - teamCenterDegree) % 360
 * 
 * 🎯 FEATURES:
 * - Perfect visual-data synchronization
 * - Accurate wheel-arrow alignment
 * - Visual highlighting of selected teams
 * - Sound effects
 * - Clean text results
 * - Proven lookup table method
 * 
 * 🔄 REPLICATION NOTES FOR OTHER SPORTS:
 * 1. Maintain the same rotation calculation logic
 * 2. Use lookup table method (degree ranges -> teams)
 * 3. Keep arrow at 0° (top position)
 * 4. Use same animation timing and easing
 * 5. Follow the same spin sequence: reset -> calculate -> animate -> highlight
 * 
 * 📅 CREATED: July 16, 2025
 * 🎉 STATUS: WORKING PERFECTLY
 */

// Game State - Keep it simple
let gameState = {
    isSpinning: false,
    currentMode: 'classic'
};

// Teams data
let nbaTeams = [];

// ✅ PROVEN METHOD: Lookup table for degree ranges to teams
let teamLookupTable = [];

// Initialize the game
async function initializeGame() {
    console.log("🏀 Initializing NBA Team Wheel with PROVEN method...");
    
    try {
        // Load the pre-built wheel system
        const wheelLoaderReady = await WheelLoader.initialize();
        
        if (wheelLoaderReady) {
            console.log("✅ Pre-built wheel system ready!");
            nbaTeams = WheelLoader.getCurrentTeams();
            
            if (nbaTeams && nbaTeams.length > 0) {
                console.log(`🎯 Loaded ${nbaTeams.length} NBA teams`);
                
                // ✅ CRITICAL: Build lookup table
                buildTeamLookupTable();
                
                // Set up the game
                setupGameModes();
                console.log("🎉 Game initialization complete!");
                return true;
            }
        }
        
        console.error("❌ Failed to load teams");
        return false;
        
    } catch (error) {
        console.error("❌ Game initialization failed:", error);
        return false;
    }
}

// ✅ PROVEN METHOD: Build lookup table for degrees to teams
function buildTeamLookupTable() {
    console.log("🔧 Building team lookup table...");
    
    teamLookupTable = [];
    
    nbaTeams.forEach((team, index) => {
        // Each team gets 12° slice (360° / 30 teams = 12°)
        const minDegree = index * 12;
        const maxDegree = (index + 1) * 12;
        
        teamLookupTable.push({
            teamName: team.name,
            teamId: team.id,
            index: index,
            minDegree: minDegree,
            maxDegree: maxDegree,
            logo: team.logo,
            colors: team.colors
        });
        
        console.log(`📍 ${team.name}: ${minDegree}° - ${maxDegree}°`);
    });
    
    console.log(`✅ Lookup table built with ${teamLookupTable.length} teams`);
}

// Set up game mode functionality
function setupGameModes() {
    // Classic mode button
    const classicBtn = document.getElementById('classicModeBtn');
    const multiplayerBtn = document.getElementById('multiplayerModeBtn');
    
    if (classicBtn) {
        classicBtn.addEventListener('click', () => switchMode('classic'));
    }
    
    if (multiplayerBtn) {
        multiplayerBtn.addEventListener('click', () => switchMode('multiplayer'));
    }
    
    // Initialize in classic mode
    switchMode('classic');
}

// Switch between game modes
function switchMode(mode) {
    console.log(`🔄 Switching to ${mode} mode`);
    
    gameState.currentMode = mode;
    
    // Show/hide appropriate sections
    const classicSection = document.getElementById('classic-mode');
    const multiplayerSection = document.getElementById('multiplayer-mode');
    
    if (classicSection && multiplayerSection) {
        if (mode === 'classic') {
            classicSection.style.display = 'block';
            multiplayerSection.style.display = 'none';
            setupClassicMode();
        } else {
            classicSection.style.display = 'none';
            multiplayerSection.style.display = 'block';
            setupMultiplayerMode();
        }
    }
    
    // Update button states
    const classicBtn = document.getElementById('classicModeBtn');
    const multiplayerBtn = document.getElementById('multiplayerModeBtn');
    
    if (classicBtn && multiplayerBtn) {
        classicBtn.classList.toggle('active', mode === 'classic');
        multiplayerBtn.classList.toggle('active', mode === 'multiplayer');
    }
    
    // Reset result text when switching modes
    const result = document.getElementById('classic-result');
    if (result && mode === 'classic') {
        result.textContent = "🎯 Ready to spin!";
        result.style.fontSize = '';
        result.style.color = '';
        result.style.fontWeight = '';
    }
    
    // Clear any team highlighting when switching modes
    clearTeamHighlights();
}

// Setup classic mode
function setupClassicMode() {
    const spinButton = document.getElementById('classicSpinButton');
    
    if (spinButton) {
        // Remove existing listeners
        spinButton.replaceWith(spinButton.cloneNode(true));
        const newSpinButton = document.getElementById('classicSpinButton');
        
        // Add click listener
        newSpinButton.addEventListener('click', spinWheel);
        
        console.log("✅ Classic mode setup complete");
    }
}

// Setup multiplayer mode
function setupMultiplayerMode() {
    console.log("✅ Multiplayer mode setup complete");
    // Multiplayer functionality can be added here
}

// ✅ PROVEN METHOD: Spin wheel using successful implementation pattern
function spinWheel() {
    console.log("🎯 === STARTING PROVEN SPIN METHOD ===");
    
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('classicSpinButton');
    const result = document.getElementById('classic-result');
    
    // Validate elements exist
    if (!wheel || !spinButton || !result) {
        console.error("❌ Required elements not found", { 
            wheel: !!wheel, 
            spinButton: !!spinButton, 
            result: !!result 
        });
        return;
    }

    // Verify wheel is properly loaded
    const wheelContainer = wheel.querySelector('.wheel-simple');
    if (!wheelContainer) {
        console.error("❌ Wheel not properly loaded");
        result.textContent = "❌ Wheel not ready. Please refresh the page.";
        return;
    }

    // Prevent multiple spins
    if (gameState.isSpinning) {
        console.log("⏸️ Spin already in progress");
        return;
    }

    // Set spinning state
    gameState.isSpinning = true;
    spinButton.disabled = true;
    spinButton.textContent = "🌪️ SPINNING...";
    
    // Clear previous highlights
    clearTeamHighlights();
    
    // Show spinning message
    result.innerHTML = "🎡 Spinning the wheel...";
    result.style.fontSize = '1.2em';
    result.style.color = '#3498db';

    // ✅ STEP 1: Pick random team from lookup table
    const randomIndex = Math.floor(Math.random() * teamLookupTable.length);
    const winningTeam = teamLookupTable[randomIndex];
    
    console.log(`🎲 Random selection: Index ${randomIndex}`);
    console.log(`🏆 Selected team:`, winningTeam);

    // ✅ STEP 2: Calculate rotation to align selected team with arrow
    const teamCenterDegree = (winningTeam.minDegree + winningTeam.maxDegree) / 2;
    
    console.log(`🎯 Selected team: ${winningTeam.teamName}`);
    console.log(`📍 Team center position: ${teamCenterDegree}°`);
    
    // Arrow points to 0° (top of wheel)
    // To bring a team at position X° to the top (0°), we need to rotate clockwise by (360° - X°)
    // Example: Team at 294° needs rotation of (360° - 294°) = 66° clockwise
    const arrowPosition = 0;
    
    // ✅ CRITICAL FIX: Calculate rotation needed to bring team to arrow position
    // Rotate clockwise to bring the team to the top
    const rotationNeeded = (360 - teamCenterDegree) % 360;
    
    console.log(`🔄 Rotation needed to align with arrow: ${rotationNeeded}°`);

    // ✅ STEP 3: Add multiple full rotations for visual effect
    const fullRotations = 7200; // 20 full spins (20 * 360°)
    const totalRotation = fullRotations + rotationNeeded;
    
    console.log(`🌪️ Total rotation: ${totalRotation}° (${fullRotations}° + ${rotationNeeded}°)`);

    // ✅ STEP 4: Reset wheel to 0° before spinning
    wheel.style.transition = 'none';
    wheel.style.transform = 'rotate(0deg)';
    
    // Force reflow to ensure reset takes effect
    wheel.offsetHeight;

    // ✅ STEP 4: Apply rotation and wait for completion
    console.log("🚀 Starting spin animation...");
    
    wheel.style.transition = "transform 4s cubic-bezier(0.44, -0.205, 0, 1.13)";
    wheel.style.transform = `rotate(${totalRotation}deg)`;
    
    // Wait for spin to complete, then show result
    setTimeout(() => {
        console.log("🎯 Spin completed! Showing result...");
        
        // ✅ NEW: Play completion sound effect
        playCompletionSound();
        
        // Show result and highlight
        showTeamResult(winningTeam);
        
        // Reset spinning state
        gameState.isSpinning = false;
        spinButton.disabled = false;
        spinButton.textContent = "🎯 SPIN THE WHEEL! 🎯";
        
        console.log("✅ === SPIN SEQUENCE COMPLETE ===");
        
    }, 4000); // Match the animation duration
}

// Show the team result below the wheel
function showTeamResult(team) {
    console.log("🎉 Showing result:", team.teamName);
    
    const result = document.getElementById('classic-result');

    if (result) {
        result.innerHTML = `🏀 <strong>The wheel has landed on the ${team.teamName}!</strong>`;
        result.style.fontSize = '1.5em';
        result.style.color = '#2c3e50';
        result.style.fontWeight = 'bold';
        result.style.marginTop = '20px';
    } else {
        console.error("❌ Result element not found");
        alert(`🏀 The wheel has landed on the ${team.teamName}!`);
    }
    
    // ✅ NEW: Add visual highlighting to the selected team
    highlightSelectedTeam(team);
}

// ✅ NEW: Visually highlight the selected team on the wheel
function highlightSelectedTeam(team) {
    console.log("✨ Highlighting selected team:", team.teamName);
    
    // Find team elements on the wheel
    const teamNameElements = document.querySelectorAll('.team-name');
    const teamLogoElements = document.querySelectorAll('.team-logo');
    
    teamNameElements.forEach(element => {
        if (element.textContent.trim() === team.teamName) {
            console.log("🎯 Found team name element, applying highlight");
            
            // Apply golden highlight effect
            element.style.filter = 'brightness(1.3) drop-shadow(0 0 15px gold)';
            element.style.transform = 'scale(1.1)';
            element.style.fontWeight = 'bold';
            element.style.animation = 'selectedTeamPulse 2s ease-in-out infinite';
            
            // Auto-remove highlight after 8 seconds
            setTimeout(() => {
                element.style.filter = '';
                element.style.transform = '';
                element.style.fontWeight = '';
                element.style.animation = '';
            }, 8000);
        }
    });
    
    teamLogoElements.forEach(element => {
        const logoSrc = element.src || element.getAttribute('xlink:href');
        if (logoSrc && logoSrc.includes(team.teamId)) {
            console.log("🎯 Found team logo element, applying highlight");
            
            // Apply golden highlight effect to logo
            element.style.filter = 'brightness(1.2) drop-shadow(0 0 10px gold)';
            element.style.transform = 'scale(1.2)';
            element.style.animation = 'selectedTeamPulse 2s ease-in-out infinite';
            
            // Auto-remove highlight after 8 seconds
            setTimeout(() => {
                element.style.filter = '';
                element.style.transform = '';
                element.style.animation = '';
            }, 8000);
        }
    });
}

// Clear any existing team highlights
function clearTeamHighlights() {
    const teamNameElements = document.querySelectorAll('.team-name');
    const teamLogoElements = document.querySelectorAll('.team-logo');
    
    [...teamNameElements, ...teamLogoElements].forEach(element => {
        element.style.filter = '';
        element.style.transform = '';
        element.style.fontWeight = '';
        element.style.animation = '';
    });
}

// ✅ NEW: Play completion sound effect
function playCompletionSound() {
    try {
        // Create a simple "ding" sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        
        console.log("🔊 Completion sound played");
    } catch (error) {
        console.log("🔇 Audio not available:", error.message);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeGame);

// Export for use in other files (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeGame,
        spinWheel,
        buildTeamLookupTable,
        switchMode
    };
} 