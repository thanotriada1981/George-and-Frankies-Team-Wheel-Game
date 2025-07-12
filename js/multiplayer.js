/**
 * Multiplayer functionality for NBA Team Wheel
 * Handles player management, turn-based gameplay, and team building
 */

// Game state for host name
let hostName = '';

// Step 1: Set Host Name
function setHostName() {
    const hostInput = document.getElementById('host-name-input');
    const name = hostInput.value.trim();
    
    if (name === '') {
        alert('Please enter your name to continue!');
        hostInput.focus();
        return;
    }
    
    if (name.length > 20) {
        alert('Name must be 20 characters or less!');
        hostInput.focus();
        return;
    }
    
    // Store host name
    hostName = name;
    
    // Update displays
    document.getElementById('host-greeting').textContent = `Hello ${name}!`;
    document.getElementById('host-name-display').textContent = name;
    document.getElementById('host-name-local-display').textContent = name;
    
    // Move to next step
    document.getElementById('host-name-step').style.display = 'none';
    document.getElementById('player-count-step').style.display = 'block';
    
    console.log('🎮 Host name set:', name);
}

// Multiplayer Setup Functions
function selectPlayerCount(count) {
    gameState.numPlayers = count;
    
    // Update button states
    document.querySelectorAll('.count-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    // Show game type selection
    setTimeout(() => {
        document.getElementById('player-count-step').style.display = 'none';
        document.getElementById('game-type-step').style.display = 'block';
    }, 500);
}

function selectGameType(type) {
    gameState.gameType = type;
    
    if (type === 'local') {
        // Show player name input
        document.getElementById('game-type-step').style.display = 'none';
        document.getElementById('player-names-step').style.display = 'block';
        
        // Create input fields for other player names (host already set)
        const container = document.getElementById('player-name-inputs');
        container.innerHTML = '';
        
        // Create inputs for players 2 through n (skip player 1 since host is already set)
        for (let i = 1; i < gameState.numPlayers; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'name-input';
            input.placeholder = `Enter Player ${i + 1} Name`;
            input.id = `player-${i + 1}-name`;
            input.maxLength = 20;
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const nextInput = document.getElementById(`player-${i + 2}-name`);
                    if (nextInput) {
                        nextInput.focus();
                    } else {
                        startMultiplayerGame();
                    }
                }
            });
            container.appendChild(input);
        }
        
        // Focus first input if any additional players needed
        if (gameState.numPlayers > 1) {
            const firstInput = document.getElementById('player-2-name');
            if (firstInput) {
                firstInput.focus();
            }
        }
    } else if (type === 'online') {
        // Show online game setup
        document.getElementById('game-type-step').style.display = 'none';
        document.getElementById('invite-step').style.display = 'block';
        
        // Generate invite link
        const gameId = generateGameId();
        const inviteLink = `${window.location.origin}${window.location.pathname}?join=${gameId}`;
        document.getElementById('inviteLink').value = inviteLink;
        
        // Store game ID for later use
        gameState.gameId = gameId;
    }
}

function generateGameId() {
    const teamNames = ['LAKERS', 'CELTICS', 'WARRIORS', 'BULLS', 'HEAT', 'SPURS'];
    const randomTeam = teamNames[Math.floor(Math.random() * teamNames.length)];
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    return `${randomTeam}-${randomNumber}`;
}

function copyInviteLink() {
    const linkInput = document.getElementById('inviteLink');
    linkInput.select();
    document.execCommand('copy');
    
    const copyButton = document.querySelector('.copy-button');
    const originalText = copyButton.textContent;
    copyButton.textContent = '✅ Copied!';
    copyButton.style.background = '#28a745';
    
    setTimeout(() => {
        copyButton.textContent = originalText;
        copyButton.style.background = '#007bff';
    }, 2000);
}

function checkForInviteLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const joinGameId = urlParams.get('join');
    
    if (joinGameId) {
        // Player is joining a game
        gameState.phase = 'joining';
        gameState.isHost = false;
        gameState.gameId = joinGameId;
        
        // Show join interface
        document.getElementById('setup-phase').style.display = 'none';
        // Show joining interface (to be implemented)
    } else {
        // Player is creating a new game
        gameState.isHost = true;
    }
}

function startMultiplayerGame() {
    // Start with host name
    const playerNames = [{ name: hostName, id: 0 }];
    
    // Get other player names (skip first since host is already added)
    for (let i = 1; i < gameState.numPlayers; i++) {
        const input = document.getElementById(`player-${i + 1}-name`);
        const name = input.value.trim();
        if (name === '') {
            alert(`Please enter a name for Player ${i + 1}`);
            input.focus();
            return;
        }
        playerNames.push({ name: name, id: i });
    }
    
    // Initialize game state
    gameState.players = playerNames;
    gameState.dreamTeams = [];
    gameState.currentPlayerIndex = 0;
    gameState.currentRound = 1;
    gameState.phase = 'playing';
    
    // Initialize empty teams for each player
    for (let i = 0; i < gameState.numPlayers; i++) {
        gameState.dreamTeams.push({
            pg: null,
            sg: null,
            sf: null,
            pf: null,
            c: null,
            sixth: null,
            seventh: null,
            coach: null
        });
    }
    
    // Hide setup and show game
    document.getElementById('setup-phase').style.display = 'none';
    document.getElementById('mode-selection').style.display = 'block';
    
    // Auto-select multiplayer mode
    switchMode('multiplayer');
    
    // Update multiplayer display
    updateMultiplayerDisplay();
}

function updateMultiplayerDisplay() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const result = document.getElementById('dream-result');
    const spinCounter = document.getElementById('spinCounter');
    
    // Update current player display
    result.innerHTML = `🎯 <strong style="color: #ff6b6b;">${currentPlayer.name}</strong>, it's your turn! 🎯`;
    
    // Update spin counter
    const totalSpins = gameState.numPlayers * gameState.maxRounds;
    const currentSpinNumber = ((gameState.currentRound - 1) * gameState.numPlayers) + gameState.currentPlayerIndex + 1;
    spinCounter.textContent = `Spin ${currentSpinNumber} of ${totalSpins} - Round ${gameState.currentRound}`;
    
    // Update team display for current player
    updateTeamDisplay(gameState.currentPlayerIndex);
}

function updateTeamDisplay(playerIndex) {
    const team = gameState.dreamTeams[playerIndex];
    const positions = ['pg', 'sg', 'sf', 'pf', 'c', 'sixth', 'seventh', 'coach'];
    
    positions.forEach(position => {
        const slot = document.getElementById(`slot-${position}`);
        if (slot) {
            const playerDiv = slot.querySelector('.position-player');
            if (team[position]) {
                playerDiv.textContent = team[position].full_name || `${team[position].first_name} ${team[position].last_name}`;
                playerDiv.classList.add('filled');
                slot.classList.add('filled');
            } else {
                playerDiv.textContent = 'Empty';
                playerDiv.classList.remove('filled');
                slot.classList.remove('filled');
            }
        }
    });
}

function showPlayerSelection(team) {
    const playerSelection = document.getElementById('playerSelection');
    const teamNameSpan = document.getElementById('selectedTeamName');
    const dropdown = document.getElementById('playerDropdown');
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // Update the selection header
    const selectionHeader = playerSelection.querySelector('h3');
    selectionHeader.textContent = `🏀 ${currentPlayer.name}, Select Your Player!`;
    
    teamNameSpan.textContent = team.name;
    teamNameSpan.style.color = team.color_primary;
    
    // Clear dropdown
    dropdown.innerHTML = '<option value="">Loading players...</option>';
    
    // Load players for this team
    loadPlayersForTeam(team)
        .then(players => {
            gameState.currentPlayers = players;
            populatePlayerDropdown(players);
            updatePositionButtons();
        })
        .catch(error => {
            console.error('Error loading players:', error);
            // Use mock data as fallback
            const mockPlayers = generateMockPlayers(team.name);
            gameState.currentPlayers = mockPlayers;
            populatePlayerDropdown(mockPlayers);
            updatePositionButtons();
        });
    
    playerSelection.classList.add('show');
}

function populatePlayerDropdown(players) {
    const dropdown = document.getElementById('playerDropdown');
    dropdown.innerHTML = '<option value="">Choose a player...</option>';
    
    // Filter out coaches from player selection for positions
    const playersOnly = players.filter(player => !player.isCoach);
    
    playersOnly.forEach((player, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${player.full_name || player.first_name + ' ' + player.last_name} - ${player.position}`;
        dropdown.appendChild(option);
    });
    
    // Add coaches separately
    const coaches = players.filter(player => player.isCoach);
    if (coaches.length > 0) {
        const coachGroup = document.createElement('optgroup');
        coachGroup.label = 'Coaches';
        
        coaches.forEach((coach, index) => {
            const option = document.createElement('option');
            option.value = playersOnly.length + index;
            option.textContent = `${coach.full_name || coach.first_name + ' ' + coach.last_name} - ${coach.position}`;
            coachGroup.appendChild(option);
        });
        
        dropdown.appendChild(coachGroup);
    }
}

function updatePositionButtons() {
    const buttons = document.querySelectorAll('.position-btn');
    const currentTeam = gameState.dreamTeams[gameState.currentPlayerIndex];
    
    buttons.forEach(button => {
        const position = button.getAttribute('onclick').match(/assignPlayer\('(\w+)'\)/)[1];
        
        // Disable button if position is already filled
        if (currentTeam[position]) {
            button.disabled = true;
            button.style.background = '#ccc';
            button.textContent = button.textContent.replace('Choose', 'Filled');
        } else {
            button.disabled = false;
            button.style.background = '#4CAF50';
            button.textContent = button.textContent.replace('Filled', 'Choose');
        }
    });
}

function assignPlayer(position) {
    const dropdown = document.getElementById('playerDropdown');
    const selectedIndex = dropdown.value;
    
    if (selectedIndex === '') {
        alert('Please select a player first!');
        return;
    }
    
    const player = gameState.currentPlayers[selectedIndex];
    
    // Check if player can fill this position
    if (!canPlayerFillPosition(player, position)) {
        alert(`${player.full_name || player.first_name + ' ' + player.last_name} cannot fill the ${position} position!`);
        return;
    }
    
    // Assign player to current player's team
    gameState.dreamTeams[gameState.currentPlayerIndex][position] = player;
    
    // Update UI
    const slot = document.getElementById(`slot-${position}`);
    const playerDiv = slot.querySelector('.position-player');
    playerDiv.textContent = player.full_name || `${player.first_name} ${player.last_name}`;
    playerDiv.classList.add('filled');
    slot.classList.add('filled');
    
    // Play success sound
    SoundManager.playSuccessSound();
    
    // Hide player selection
    document.getElementById('playerSelection').classList.remove('show');
    
    // Move to next player's turn
    nextPlayerTurn();
}

function nextPlayerTurn() {
    // Check if current team is complete (all 8 positions filled)
    const currentTeam = gameState.dreamTeams[gameState.currentPlayerIndex];
    const filledPositions = Object.values(currentTeam).filter(player => player !== null).length;
    
    console.log(`🎯 ${gameState.players[gameState.currentPlayerIndex].name} has ${filledPositions}/8 positions filled`);
    
    // If current team is complete, move to next player
    if (filledPositions === 8) {
        console.log(`✅ ${gameState.players[gameState.currentPlayerIndex].name}'s team is complete!`);
        
        // Move to next player
        gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.numPlayers;
        
        // Check if all teams are complete
        if (areAllTeamsComplete()) {
            startBattlePhase();
            return;
        }
    } else {
        // Current player needs more players, increment round but stay with same player
        gameState.currentRound++;
        console.log(`🔄 ${gameState.players[gameState.currentPlayerIndex].name} needs ${8 - filledPositions} more players`);
    }
    
    // Update display for current player
    updateMultiplayerDisplay();
    
    // Re-enable spin button
    document.getElementById('dreamSpinButton').disabled = false;
    document.getElementById('dreamSpinButton').textContent = '🎯 SPIN FOR PLAYER! 🎯';
    
    // Update spin counter
    updateSpinCounter();
}

function areAllTeamsComplete() {
    for (let i = 0; i < gameState.numPlayers; i++) {
        const team = gameState.dreamTeams[i];
        const filledPositions = Object.values(team).filter(player => player !== null).length;
        if (filledPositions < 8) {
            return false;
        }
    }
    return true;
}

function updateSpinCounter() {
    const currentTeam = gameState.dreamTeams[gameState.currentPlayerIndex];
    const filledPositions = Object.values(currentTeam).filter(player => player !== null).length;
    const spinsLeft = 8 - filledPositions;
    
    const counter = document.getElementById('spinCounter');
    if (counter) {
        counter.textContent = `${gameState.players[gameState.currentPlayerIndex].name} - Positions Left: ${spinsLeft}`;
    }
}

function startBattlePhase() {
    gameState.phase = 'battle';
    
    // Show battle section
    document.getElementById('battleSection').style.display = 'block';
    
    // Update battle section content
    const battleSection = document.getElementById('battleSection');
    battleSection.innerHTML = `
        <h3>🔥 All Teams Complete! 🔥</h3>
        <p>All ${gameState.numPlayers} players have built their dream teams!</p>
        <div class="team-summary">
            ${gameState.players.map((player, index) => `
                <div class="team-card">
                    <h4>${player.name}'s Team</h4>
                    <div class="team-positions">
                        ${Object.entries(gameState.dreamTeams[index])
                            .filter(([pos, player]) => player !== null)
                            .map(([pos, player]) => `
                                <div class="position-summary">
                                    <strong>${pos.toUpperCase()}:</strong> ${player.full_name || player.first_name + ' ' + player.last_name}
                                </div>
                            `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
        <button class="battle-button" onclick="startBattle()">⚔️ START BATTLE! ⚔️</button>
    `;
    
    // Disable spin button
    document.getElementById('dreamSpinButton').disabled = true;
    document.getElementById('dreamSpinButton').textContent = 'All Teams Complete!';
}

function canPlayerFillPosition(player, position) {
    // Basic position matching logic
    const playerPos = player.position.toLowerCase();
    
    // Allow coaches to fill coach position
    if (position === 'coach') {
        return player.isCoach || playerPos.includes('coach');
    }
    
    // Don't allow coaches to fill player positions
    if (player.isCoach) {
        return false;
    }
    
    // Position matching rules
    const positionMap = {
        'pg': ['guard', 'point guard', 'pg'],
        'sg': ['guard', 'shooting guard', 'sg'],
        'sf': ['forward', 'small forward', 'sf'],
        'pf': ['forward', 'power forward', 'pf'],
        'c': ['center', 'c'],
        'sixth': ['guard', 'forward', 'center'], // 6th man can be any position
        'seventh': ['guard', 'forward', 'center'] // 7th man can be any position
    };
    
    const allowedPositions = positionMap[position] || [];
    return allowedPositions.some(pos => playerPos.includes(pos));
}

// Export functions for global use
window.setHostName = setHostName;
window.selectPlayerCount = selectPlayerCount;
window.selectGameType = selectGameType;
window.copyInviteLink = copyInviteLink;
window.startMultiplayerGame = startMultiplayerGame;
window.showPlayerSelection = showPlayerSelection;
window.assignPlayer = assignPlayer; 