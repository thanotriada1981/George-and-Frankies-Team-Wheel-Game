/**
 * Clean NBA Team Wheel Game Logic - PROVEN LOOKUP TABLE METHOD
 * Based on successful wheel implementations from research
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
            nbaTeams = WheelLoader.getTeamData('nba');
            WheelLoader.renderPrebuiltWheel('wheel', 'nba');
            
            // ✅ BUILD LOOKUP TABLE from actual wheel data
            buildTeamLookupTable();
        } else {
            console.error("❌ Wheel loader failed");
            return;
        }

        // Hide setup phase and show game modes
        const setupPhase = document.getElementById('setup-phase');
        const sportSelection = document.getElementById('sport-selection');
        const modeSelection = document.getElementById('mode-selection');
        
        if (setupPhase) setupPhase.style.display = 'none';
        if (sportSelection) sportSelection.style.display = 'block';
        if (modeSelection) modeSelection.style.display = 'block';
        
        // Initialize sport selector
        if (typeof SportSelector !== 'undefined') {
            await SportSelector.initialize();
        }
        
        // Initialize UI modes
        initializeUI();
        
        console.log("✅ Game initialized with PROVEN method!");
        
    } catch (error) {
        console.error("❌ Game initialization failed:", error);
    }
}

// ✅ PROVEN METHOD: Build lookup table from wheel configuration
function buildTeamLookupTable() {
    console.log("🔧 Building team lookup table...");
    
    const wheelConfig = window.wheelConfigurations?.nba;
    if (!wheelConfig?.segments) {
        console.error("❌ No wheel configuration found");
        return;
    }

    teamLookupTable = [];
    
    // Build lookup table with exact degree ranges
    wheelConfig.segments.forEach((segment, index) => {
        teamLookupTable.push({
            minDegree: segment.angle_start,
            maxDegree: segment.angle_end,
            teamName: segment.team_name,
            index: index
        });
    });
    
    console.log("✅ Team lookup table built:", teamLookupTable.length, "teams");
}

// ✅ PROVEN METHOD: Find team by degree using lookup table
function findTeamByDegree(degree) {
    // Normalize degree to 0-360 range
    degree = ((degree % 360) + 360) % 360;
    
    for (let entry of teamLookupTable) {
        if (degree >= entry.minDegree && degree < entry.maxDegree) {
            return entry;
        }
    }
    
    console.warn("⚠️ No team found for degree:", degree);
    return teamLookupTable[0]; // Fallback to first team
}

// ✅ PROVEN METHOD: Spin wheel using successful implementation pattern
function spinWheel() {
    console.log("🎯 === STARTING PROVEN SPIN METHOD ===");
    console.log("[DEBUG] spinWheel called. gameState.isSpinning:", gameState.isSpinning);
    console.log("[DEBUG] Current mode:", gameState.currentMode);
    
    // Check if we're in Dream Team Builder mode
    const isDreamTeamMode = gameState.currentMode === 'dream-team' || 
                           document.getElementById('dream-team-mode')?.style.display !== 'none';
    
    // Get appropriate elements based on mode
    const wheel = isDreamTeamMode ? document.getElementById('dreamWheel') : document.getElementById('wheel');
    const spinButton = isDreamTeamMode ? document.getElementById('dreamSpinButton') : document.getElementById('classicSpinButton');
    const result = isDreamTeamMode ? document.getElementById('dream-result') : document.getElementById('classic-result');
    
    // Validate elements exist
    if (!wheel || !spinButton) {
        console.error("❌ Required elements not found", { 
            wheel: !!wheel, 
            spinButton: !!spinButton,
            isDreamTeamMode: isDreamTeamMode
        });
        return;
    }

    // Verify wheel is properly loaded
    const wheelContainer = wheel.querySelector('.wheel-simple');
    if (!wheelContainer) {
        console.error("❌ Wheel not properly loaded - no .wheel-simple found");
        result.textContent = "⚠️ Wheel not loaded";
        return;
    }

    // Prevent multiple spins
    if (gameState.isSpinning) {
        console.log("⚠️ Already spinning [DEBUG]", gameState.isSpinning);
        return;
    }

    gameState.isSpinning = true;
    spinButton.disabled = true;
    result.textContent = "🎡 Spinning the wheel...";

    // ✅ STEP 1: Pick random team (not degree!)
    const randomTeamIndex = Math.floor(Math.random() * teamLookupTable.length);
    const winningTeam = teamLookupTable[randomTeamIndex];
    
    console.log("🎲 Random team index:", randomTeamIndex);
    console.log("🏀 Winning team:", winningTeam.teamName);
    console.log("📐 Team degree range:", winningTeam.minDegree + "° - " + winningTeam.maxDegree + "°");

    // ✅ STEP 2: Calculate rotation to align selected team with arrow
    const teamCenterDegree = (winningTeam.minDegree + winningTeam.maxDegree) / 2;
    
    console.log(`🎯 Selected team: ${winningTeam.teamName}`);
    console.log(`📍 Team center position: ${teamCenterDegree}°`);
    
    // Arrow points to 0° (top of wheel)
    // To bring a team at position X° to the top (0°), we need to rotate clockwise by (360° - X°)
    // Example: Team at 294° needs rotation of (360° - 294°) = 66° clockwise
    const arrowPosition = 0;
    
    // Calculate rotation needed to bring team to arrow position
    // Rotate clockwise to bring the team to the top
    const rotationNeeded = (360 - teamCenterDegree) % 360;
    
    console.log(`🔄 Rotation needed to align with arrow: ${rotationNeeded}°`);
    console.log(`📝 Logic: Team at ${teamCenterDegree}° → rotate ${rotationNeeded}° clockwise → lands at ${arrowPosition}°`);
    
    // Add multiple full rotations for spinning effect (always spin clockwise)
    const fullRotations = 4; // 4 full rotations = 1440°
    
    // Total rotation: multiple spins + alignment rotation
    const totalRotation = (360 * fullRotations) + rotationNeeded;
    
    console.log("🧮 CORRECTED calculation:");
    console.log("  - Team center degree (data):", teamCenterDegree + "°");
    console.log("  - Rotation to align:", rotationNeeded + "°");
    console.log("  - Full rotations:", (360 * fullRotations) + "°");
    console.log("  - Total rotation:", totalRotation + "°");

    // ✅ STEP 3: Apply rotation with realistic animation
    applyRealisticSpin(wheelContainer, totalRotation, winningTeam);
}

// ✅ Apply rotation with realistic timing and show result
function applyRealisticSpin(wheelContainer, rotation, winningTeam) {
    console.log("🎬 Applying realistic spin animation...");
    
    // Reset wheel to 0° first (important!)
    wheelContainer.style.transition = 'none';
    wheelContainer.style.transform = 'rotate(0deg)';
    
    // Force reflow
    wheelContainer.offsetHeight;
    
    // Apply the rotation with realistic timing
    wheelContainer.style.transition = 'transform 4s cubic-bezier(0.44, -0.205, 0, 1.13)';
    wheelContainer.style.transform = `rotate(${rotation}deg)`;
    
    // Wait for spin to complete, then show result
    setTimeout(() => {
        console.log("🎯 Spin completed! Showing result...");
        
        // ✅ NEW: Play completion sound effect
        playCompletionSound();
        
        // Check if we're in Dream Team Builder mode
        const isDreamTeamMode = gameState.currentMode === 'dream-team' || 
                               document.getElementById('dream-team-mode')?.style.display !== 'none';
        
        if (isDreamTeamMode) {
            // For Dream Team Builder mode, trigger player selection
            console.log("🏆 Dream Team Builder mode - triggering player selection");
            console.log("🏆 Winning team object:", winningTeam);
            console.log("🏆 showPlayerSelection function exists:", typeof showPlayerSelection === 'function');
            
            if (typeof showPlayerSelection === 'function') {
                try {
                    showPlayerSelection(winningTeam);
                    console.log("✅ showPlayerSelection called successfully");
                } catch (error) {
                    console.error("❌ Error in showPlayerSelection:", error);
                    showTeamResult(winningTeam); // Fallback to classic result
                }
            } else {
                console.error("❌ showPlayerSelection function not found");
                showTeamResult(winningTeam); // Fallback to classic result
            }
        } else {
            // For Classic mode, show team result
            showTeamResult(winningTeam);
        }
        
        // Reset spinning state
        gameState.isSpinning = false;
        console.log("[DEBUG] Spin complete. gameState.isSpinning set to:", gameState.isSpinning);
        
        // For classic spin mode, show 'Spin Again' button and hide original spin button
        if (gameState.currentMode === 'classic') {
            const spinButton = document.getElementById('classicSpinButton');
            if (spinButton) spinButton.style.display = 'none';
            let againBtn = document.getElementById('spinAgainButton');
            if (!againBtn) {
                againBtn = document.createElement('button');
                againBtn.id = 'spinAgainButton';
                againBtn.className = 'spin-button';
                againBtn.textContent = '🔄 Spin Again';
                againBtn.style.marginTop = '20px';
                againBtn.onclick = () => resetForAnotherSpin();
                const result = document.getElementById('classic-result');
                if (result) result.parentNode.insertBefore(againBtn, result.nextSibling);
            } else {
                againBtn.style.display = 'inline-block';
            }
        }
        console.log("✅ Spin cycle complete!");
    }, 4000); // Match the 4s transition duration
}

// Reset the wheel for another spin without reloading the page
function resetForAnotherSpin() {
    console.log("🔄 Resetting for another spin...");

    // Hide the "Spin Again" button
    const againBtn = document.getElementById('spinAgainButton');
    if (againBtn) againBtn.style.display = 'none';

    // Show the original spin button
    const spinButton = document.getElementById('classicSpinButton');
    if (spinButton) {
        spinButton.style.display = 'inline-block';
        spinButton.disabled = false;
    }

    // Reset the result text
    const result = document.getElementById('classic-result');
    if (result) {
        result.textContent = "🎯 Ready to spin!";
        result.style.fontSize = '';
        result.style.color = '';
        result.style.fontWeight = '';
    }

    // Clear any team highlighting
    clearTeamHighlights();

    // Reset spin state
    gameState.isSpinning = false;

    console.log("✅ Ready for another spin!");
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
function highlightSelectedTeam(selectedTeam) {
    console.log("✨ Highlighting selected team:", selectedTeam.teamName);
    
    const wheel = document.getElementById('wheel');
    if (!wheel) return;
    
    // Remove any existing highlights first
    clearTeamHighlights();
    
    // Find team labels and logos to highlight
    const teamLabels = wheel.querySelectorAll('.team-label');
    const teamLogos = wheel.querySelectorAll('.team-logo');
    
    teamLabels.forEach(label => {
        if (label.textContent.trim() === selectedTeam.teamName) {
            // Add golden glow effect to the selected team
            label.style.cssText += `
                background: rgba(255, 215, 0, 0.8) !important;
                border-radius: 5px !important;
                padding: 2px 4px !important;
                box-shadow: 0 0 15px gold !important;
                transform: ${label.style.transform} scale(1.1) !important;
                animation: selectedTeamPulse 2s ease-in-out infinite !important;
            `;
            label.classList.add('selected-team');
        }
    });
    
    teamLogos.forEach(logo => {
        if (logo.src.includes(selectedTeam.teamName.toLowerCase().replace(/\s+/g, '_'))) {
            // Add golden border to the selected team's logo
            logo.style.cssText += `
                border: 3px solid gold !important;
                border-radius: 50% !important;
                box-shadow: 0 0 20px gold !important;
                transform: ${logo.style.transform} scale(1.2) !important;
                animation: selectedTeamPulse 2s ease-in-out infinite !important;
            `;
            logo.classList.add('selected-team');
        }
    });
    
    // Clear highlighting after 8 seconds
    setTimeout(() => {
        clearTeamHighlights();
    }, 8000);
}

// ✅ NEW: Clear all team highlighting effects
function clearTeamHighlights() {
    const wheel = document.getElementById('wheel');
    if (!wheel) return;
    
    const highlightedElements = wheel.querySelectorAll('.selected-team');
    highlightedElements.forEach(element => {
        element.classList.remove('selected-team');
        // Reset styles by removing the inline styles we added
        if (element.classList.contains('team-label')) {
            element.style.background = '';
            element.style.borderRadius = '';
            element.style.padding = '';
            element.style.boxShadow = '';
            element.style.animation = '';
            // Keep the original transform but remove scale
            const originalTransform = element.style.transform.replace(' scale(1.1)', '');
            element.style.transform = originalTransform;
        }
        if (element.classList.contains('team-logo')) {
            element.style.border = '';
            element.style.borderRadius = '';
            element.style.boxShadow = '';
            element.style.animation = '';
            // Keep the original transform but remove scale
            const originalTransform = element.style.transform.replace(' scale(1.2)', '');
            element.style.transform = originalTransform;
        }
    });
}

// Reset spin state
function resetSpinState() {
    gameState.isSpinning = false;
    
    const spinButton = document.getElementById('classicSpinButton');
    
    if (spinButton) spinButton.disabled = false;
}

// Initialize UI elements and mode switching
function initializeUI() {
    // Set default mode to classic
    gameState.currentMode = 'classic';
    
    // Show classic mode by default
    switchMode('classic');
}

// Switch between game modes (classic vs dream team builder)
function switchMode(mode) {
    gameState.currentMode = mode;
    console.log("🔄 Switched to mode:", mode);
    
    // Update button states
    const classicBtn = document.querySelector('.mode-button[onclick="switchMode(\'classic\')"]');
    const dreamTeamBtn = document.querySelector('.mode-button[onclick="showSetupPhase()"]');
    
    if (classicBtn && dreamTeamBtn) {
        if (mode === 'classic') {
            classicBtn.classList.add('active');
            dreamTeamBtn.classList.remove('active');
        } else {
            classicBtn.classList.remove('active');
            dreamTeamBtn.classList.add('active');
        }
    }
    
    // Show/hide appropriate sections
    const classicSection = document.getElementById('classic-mode');
    const dreamTeamSection = document.getElementById('dream-team-mode');
    
    if (classicSection && dreamTeamSection) {
        if (mode === 'classic') {
            classicSection.style.display = 'block';
            dreamTeamSection.style.display = 'none';
        } else {
            classicSection.style.display = 'none';
            dreamTeamSection.style.display = 'block';
        }
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

// Show setup phase for dream team builder
function showSetupPhase() {
    const setupPhase = document.getElementById('setup-phase');
    const modeSelection = document.getElementById('mode-selection');
    
    if (setupPhase && modeSelection) {
        setupPhase.style.display = 'block';
        modeSelection.style.display = 'none';
    }
    
    // Set the mode to dream-team
    gameState.currentMode = 'dream-team';
    console.log("🔄 Set mode to dream-team for setup phase");
}

// Handle sport change from dropdown
function handleSportChange(sportKey) {
    console.log("🔄 Switching to sport:", sportKey);
    
    if (typeof SportSelector !== 'undefined' && SportSelector.switchSport) {
        SportSelector.switchSport(sportKey).then(() => {
            // Reload wheel with new sport
            if (typeof WheelLoader !== 'undefined') {
                nbaTeams = WheelLoader.getTeamData(sportKey);
                WheelLoader.renderPrebuiltWheel('wheel', sportKey);
                
                // Rebuild lookup table for new sport
                buildTeamLookupTable();
                
                // Reset result text
                const result = document.getElementById('classic-result');
                if (result) {
                    result.textContent = "🎯 Ready to spin!";
                    result.style.fontSize = '';
                    result.style.color = '';
                    result.style.fontWeight = '';
                }
            }
        });
    } else {
        console.log(`🔄 Switching to ${sportKey} (fallback)`);
    }
}

// ✅ PROVEN TESTING FUNCTIONS
function testProvenMethod() {
    console.log("🧪 === TESTING PROVEN METHOD ===");
    
    if (teamLookupTable.length === 0) {
        console.error("❌ Lookup table not built yet");
        return;
    }
    
    console.log("📋 Lookup table has", teamLookupTable.length, "teams");
    
    // Test a few specific teams
    const testTeams = [
        "Atlanta Hawks",
        "Los Angeles Lakers", 
        "Boston Celtics",
        "Phoenix Suns"
    ];
    
    testTeams.forEach(teamName => {
        const team = teamLookupTable.find(t => t.teamName === teamName);
        if (team) {
            console.log(`✅ ${teamName}: ${team.minDegree}° - ${team.maxDegree}°`);
        } else {
            console.log(`❌ ${teamName}: NOT FOUND`);
        }
    });
}

function testSpecificTeam(teamName) {
    console.log(`🧪 === TESTING SPECIFIC TEAM: ${teamName.toUpperCase()} ===`);
    
    const team = teamLookupTable.find(t => 
        t.teamName.toLowerCase().includes(teamName.toLowerCase())
    );
    
    if (!team) {
        console.error(`❌ Team "${teamName}" not found`);
        return;
    }
    
    console.log("🏀 Found team:", team.teamName);
    console.log("📐 Degree range:", team.minDegree + "° - " + team.maxDegree + "°");
    console.log("🎯 Center degree:", (team.minDegree + team.maxDegree) / 2 + "°");
    
    // Calculate what rotation would be needed
    const teamCenter = (team.minDegree + team.maxDegree) / 2;
    const offset = teamCenter - 0; // Arrow at 0°
    const totalRotation = (360 * 3) + offset;
    
    console.log("🧮 Rotation needed:", totalRotation + "°");
}



// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}

// Export functions (removed closePopup since we no longer have popup)
window.spinWheel = spinWheel;
window.switchMode = switchMode;
window.showSetupPhase = showSetupPhase;
window.handleSportChange = handleSportChange;
window.testProvenMethod = testProvenMethod;
window.testSpecificTeam = testSpecificTeam;

// ✅ NEW: Simple audio feedback
function playCompletionSound() {
    try {
        // Create a simple "ding" sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure the sound (pleasant "ding")
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // High pitch
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3); // Fade down
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        console.log("🔊 Completion sound played");
    } catch (error) {
        console.log("🔇 Audio not supported or blocked:", error.message);
    }
}

// Fully reset the UI after a spin so the user can spin again
function resetUIAfterSpin() {
    const spinButton = document.getElementById('classicSpinButton');
    if (spinButton) {
        spinButton.disabled = false;
        spinButton.textContent = "🎯 SPIN THE WHEEL! 🎯";
        spinButton.style.display = 'inline-block';
    }
    const againBtn = document.getElementById('spinAgainButton');
    if (againBtn) againBtn.style.display = 'none';
    const result = document.getElementById('classic-result');
    if (result) {
        result.textContent = "🎯 Ready to spin!";
        result.style.fontSize = '';
        result.style.color = '';
        result.style.fontWeight = '';
    }
    clearTeamHighlights();
} 