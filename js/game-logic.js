/**
 * Main Game Logic for NBA Team Wheel
 * Handles game state, spinning, and team building
 */

// Game State
let gameState = {
    phase: 'setup', // setup, classic, multiplayer, battle
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

// Initialize the game
function initializeGame() {
    console.log("🏀 George and Frankie's Dream Team Builder Game Loading...");
    
    // Initialize sound system
    SoundManager.init();
    
    // Clear any old cached data that might be causing issues
    if ('caches' in window) {
        caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
                if (cacheName.includes('nba-team-wheel-v1.0')) {
                    caches.delete(cacheName);
                    console.log('🗑️ Cleared old cache:', cacheName);
                }
            });
        });
    }
    
    // Check if player is joining via invite link
    checkForInviteLink();
    
    // Make sure setup phase is visible and focus on host name input
    const setupPhase = document.getElementById('setup-phase');
    const hostNameInput = document.getElementById('host-name-input');
    
    if (setupPhase) {
        setupPhase.style.display = 'block';
        console.log('👋 Setup phase shown');
    }
    
    if (hostNameInput) {
        // Focus on host name input after a short delay to ensure page is loaded
        setTimeout(() => {
            hostNameInput.focus();
            console.log('🎯 Focused on host name input');
        }, 100);
    }
    
    // Load NBA teams data
    loadNBATeams()
        .then(() => {
            console.log("✅ Game Ready!");
            console.log("📊 Total teams loaded:", nbaTeams.length);
            console.log("🏆 First team has", nbaTeams[0]?.roster?.length || 0, "roster members");
        })
        .catch(error => {
            console.error("❌ Error initializing game:", error);
        });
}

// Load NBA teams data
async function loadNBATeams() {
    try {
        const response = await fetch('data/nba_teams_data.json');
        const data = await response.json();
        nbaTeams = data.teams;
        
        // Draw wheel with team logos
        drawWheelWithLogos();
        
        return nbaTeams;
    } catch (error) {
        console.error('Error loading NBA teams:', error);
        return [];
    }
}

// Draw wheel with team logos
function drawWheelWithLogos() {
    if (nbaTeams.length === 0) {
        console.log("⚠️ No teams loaded yet, skipping wheel drawing");
        return;
    }
    
    console.log("🎨 Drawing wheel with logos for", nbaTeams.length, "teams");
    
    // Update both wheels (classic and dream team)
    updateWheelSegments('wheel');
    updateWheelSegments('wheel-dream');
}

// Update wheel segments with team data
function updateWheelSegments(wheelId) {
    const wheel = document.getElementById(wheelId);
    if (!wheel) return;
    
    const totalTeams = nbaTeams.length;
    const anglePerSegment = 360 / totalTeams;
    
    // Clear existing segments
    const existingSections = wheel.querySelectorAll('.wheel-section');
    existingSections.forEach(section => section.remove());
    
    // Create segments
    for (let i = 0; i < totalTeams; i++) {
        const team = nbaTeams[i];
        const rotation = (i * anglePerSegment);
        
        const section = document.createElement('div');
        section.className = 'wheel-section';
        section.style.transform = `rotate(${rotation}deg)`;
        section.style.setProperty('--team-name', `"${team.abbreviation}"`);
        
        // Add logo if available
        if (team.logo_file) {
            const logo = document.createElement('img');
            logo.src = team.logo_file;
            logo.style.position = 'absolute';
            logo.style.left = '70px';  // Moved closer to center
            logo.style.top = '5px';    // Moved down for better centering
            logo.style.width = '28px'; // Slightly larger for visibility
            logo.style.height = '28px';
            logo.style.objectFit = 'contain';
            logo.style.filter = 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))';
            logo.style.transform = 'rotate(6deg)';
            logo.alt = team.abbreviation;
            section.appendChild(logo);
        }
        
        wheel.appendChild(section);
    }
    
    // Update background with team colors
    const colorStops = [];
    for (let i = 0; i < totalTeams; i++) {
        const team = nbaTeams[i];
        const startAngle = i * anglePerSegment;
        const endAngle = (i + 1) * anglePerSegment;
        colorStops.push(`${team.color_primary} ${startAngle}deg ${endAngle}deg`);
    }
    
    wheel.style.background = `conic-gradient(from 0deg, ${colorStops.join(', ')})`;
}

// Classic wheel spin
function spinWheel() {
    if (gameState.isSpinning) return;
    
    gameState.isSpinning = true;
    const spinButton = document.getElementById('classicSpinButton');
    const result = document.getElementById('classic-result');
    const wheel = document.getElementById('wheel');
    
    spinButton.disabled = true;
    spinButton.textContent = 'Spinning...';
    result.textContent = '🎯 Spinning the wheel... 🎯';
    
    // Play spinning sound and add visual effects
    SoundManager.playSpinSound();
    VisualEffects.addSpinGlow(wheel);
    
    const spins = Math.floor(Math.random() * 5) + 5;
    const finalAngle = Math.random() * 360;
    const totalRotation = (spins * 360) + finalAngle;
    
    wheel.style.transform = 'rotate(' + totalRotation + 'deg)';
    
    setTimeout(function() {
        const selectedTeam = getSelectedTeam(finalAngle);
        
        result.innerHTML = '🏀 <span style="color: ' + selectedTeam.color_primary + '">' + selectedTeam.name + '</span> 🏀';
        
        // Show popup with celebration effects
        const popup = document.getElementById('popup');
        document.getElementById('popupResult').innerHTML = 'The wheel landed on:<br><br><strong style="color: ' + selectedTeam.color_primary + '; font-size: 1.5em;">' + selectedTeam.name + '</strong>';
        
        popup.style.display = 'block';
        VisualEffects.celebratePopup(popup);
        VisualEffects.createConfetti();
        VisualEffects.createFloatingText('🎉 ' + selectedTeam.name + '! 🎉', wheel.parentElement, selectedTeam.color_primary);
        
        // Play celebration sound
        SoundManager.playCelebrationSound();
        
        // Remove spinning effects
        VisualEffects.removeSpinGlow(wheel);
        
        spinButton.disabled = false;
        spinButton.textContent = '🎯 SPIN AGAIN! 🎯';
        gameState.isSpinning = false;
    }, 3000);
}

// Dream team wheel spin
function spinForDreamTeam() {
    if (gameState.isSpinning) return;
    
    gameState.isSpinning = true;
    const spinButton = document.getElementById('dreamSpinButton');
    const result = document.getElementById('dream-result');
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const wheel = document.getElementById('wheel-dream');
    
    spinButton.disabled = true;
    spinButton.textContent = 'Spinning...';
    result.textContent = `🎯 ${currentPlayer.name} is spinning for their next player... 🎯`;
    
    // Play spinning sound and add visual effects
    SoundManager.playSpinSound();
    VisualEffects.addSpinGlow(wheel);
    
    const spins = Math.floor(Math.random() * 5) + 5;
    const finalAngle = Math.random() * 360;
    const totalRotation = (spins * 360) + finalAngle;
    
    wheel.style.transform = 'rotate(' + totalRotation + 'deg)';
    
    setTimeout(function() {
        const selectedTeam = getSelectedTeam(finalAngle);
        gameState.currentTeam = selectedTeam;
        
        result.innerHTML = `🏀 ${currentPlayer.name} landed on <span style="color: ${selectedTeam.color_primary}">${selectedTeam.name}</span>! 🏀`;
        
        // Add celebration effects
        VisualEffects.createConfetti();
        VisualEffects.createFloatingText(`🎉 ${selectedTeam.name}! 🎉`, wheel.parentElement, selectedTeam.color_primary);
        
        // Play celebration sound
        SoundManager.playCelebrationSound();
        
        // Remove spinning effects
        VisualEffects.removeSpinGlow(wheel);
        
        // Show player selection
        showPlayerSelection(selectedTeam);
        
        spinButton.disabled = false;
        spinButton.textContent = '🎯 SPIN FOR PLAYER! 🎯';
        gameState.isSpinning = false;
    }, 3000);
}

// Get selected team based on angle
function getSelectedTeam(finalAngle) {
    const normalizedAngle = (360 - (finalAngle % 360)) % 360;
    const sectionAngle = 360 / nbaTeams.length;
    const selectedIndex = Math.floor(normalizedAngle / sectionAngle);
    return nbaTeams[selectedIndex];
}

// Close popup
function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

// Switch between game modes
function switchMode(mode) {
    gameState.mode = mode;
    
    // Update button states
    document.querySelectorAll('.mode-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show/hide appropriate mode using CSS classes
    const classicMode = document.getElementById('classic-mode');
    const dreamTeamMode = document.getElementById('dream-team-mode');
    
    if (mode === 'classic') {
        classicMode.classList.add('active');
        classicMode.style.display = 'block';
        dreamTeamMode.classList.remove('active');
        dreamTeamMode.style.display = 'none';
    } else if (mode === 'multiplayer') {
        classicMode.classList.remove('active');
        classicMode.style.display = 'none';
        dreamTeamMode.classList.add('active');
        dreamTeamMode.style.display = 'block';
    }
}

// Initialize when page loads
window.addEventListener('load', initializeGame);

// Export functions for global use
window.spinWheel = spinWheel;
window.spinForDreamTeam = spinForDreamTeam;
window.closePopup = closePopup;
window.switchMode = switchMode; 