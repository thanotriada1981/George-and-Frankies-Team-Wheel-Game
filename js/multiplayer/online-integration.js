/**
 * Online Multiplayer Integration
 * Connects existing multiplayer functions with Firebase online multiplayer
 */

// Override assignPlayer for online multiplayer mode
const originalAssignPlayer = window.assignPlayer;

window.assignPlayer = async function(position) {
    console.log('🎮 assignPlayer called for position:', position);
    console.log('🎮 Game type:', window.gameState?.gameType);

    // Check if we're in online multiplayer mode
    if (window.gameState?.gameType === 'online' && window.onlineMultiplayer) {
        console.log('🌐 Online multiplayer mode - using Firebase integration');
        return await assignPlayerOnline(position);
    }

    // Use original function for local multiplayer
    console.log('🏠 Local multiplayer mode - using original function');
    return originalAssignPlayer(position);
};

// Online multiplayer version of assignPlayer
async function assignPlayerOnline(position) {
    const dropdown = document.getElementById('playerDropdown');
    const selectedIndex = dropdown.value;

    if (selectedIndex === '') {
        alert('Please select a player first!');
        return;
    }

    const player = window.gameState.currentPlayers[selectedIndex];

    // Check if it's actually this player's turn
    if (!window.onlineMultiplayer.gameData) {
        console.error('❌ No game data available');
        return;
    }

    const currentPlayerId = window.onlineMultiplayer.gameData.playerOrder[window.onlineMultiplayer.gameData.currentPlayerIndex];
    if (currentPlayerId !== window.onlineMultiplayer.playerId) {
        alert('⚠️ Not your turn! Please wait for your turn.');
        return;
    }

    // Check if position is already filled
    const currentPlayer = window.onlineMultiplayer.gameData.players[window.onlineMultiplayer.playerId];
    const isPositionFilled = currentPlayer.currentRoster?.some(selection => selection.position === position);

    if (isPositionFilled) {
        alert(`❌ ${position.toUpperCase()} position is already filled!`);
        return;
    }

    // Check if player is already on the team
    const isPlayerAlreadySelected = currentPlayer.currentRoster?.some(selection => {
        const selectionName = selection.player.full_name || `${selection.player.first_name} ${selection.player.last_name}`;
        const playerName = player.full_name || `${player.first_name} ${player.last_name}`;
        return selectionName === playerName;
    });

    if (isPlayerAlreadySelected) {
        const playerName = player.full_name || `${player.first_name} ${player.last_name}`;
        alert(`❌ ${playerName} is already on your team! Please select a different player.`);
        return;
    }

    // Check if player can fill this position
    if (!canPlayerFillPosition(player, position)) {
        alert(`${player.full_name || player.first_name + ' ' + player.last_name} cannot fill the ${position} position!`);
        return;
    }

    // Submit turn to Firebase
    const success = await window.onlineMultiplayer.submitPlayerTurn(player, position);

    if (success) {
        // Play success sound
        if (typeof SoundManager !== 'undefined') {
            SoundManager.playSuccessSound();
        }

        // Show success message
        const playerName = player.full_name || `${player.first_name} ${player.last_name}`;
        console.log(`✅ ${playerName} assigned to ${position.toUpperCase()} position`);

        // Hide player selection modal
        document.getElementById('playerSelection').classList.remove('show');

        // Re-enable spin button for next player (will be handled by Firebase listener)
        console.log('✅ Turn submitted successfully');
    } else {
        alert('❌ Failed to submit turn. Please try again.');
    }
}

// Override showPlayerSelection for online multiplayer
const originalShowPlayerSelection = window.showPlayerSelection;

window.showPlayerSelection = async function(team) {
    console.log('🎮 showPlayerSelection called with team:', team);
    console.log('🎮 Game type:', window.gameState?.gameType);
    console.log('🎮 Current gameState.players:', window.gameState?.players);
    console.log('🎮 onlineMultiplayer exists:', !!window.onlineMultiplayer);
    console.log('🎮 onlineMultiplayer.gameData exists:', !!window.onlineMultiplayer?.gameData);

    // Check if we're in online multiplayer mode
    if (window.gameState?.gameType === 'online' && window.onlineMultiplayer) {
        console.log('🌐 Online multiplayer mode - setting up players');

        // Wait for gameData if it's not loaded yet
        if (!window.onlineMultiplayer.gameData) {
            console.warn('⚠️ Game data not loaded yet, waiting...');
            // Try to get it from Firebase directly
            try {
                const gameSnapshot = await window.onlineMultiplayer.db.ref(`games/${window.onlineMultiplayer.gameId}`).once('value');
                window.onlineMultiplayer.gameData = gameSnapshot.val();
                console.log('✅ Loaded game data from Firebase');
            } catch (error) {
                console.error('❌ Failed to load game data:', error);
                alert('Error loading game data. Please refresh and try again.');
                return;
            }
        }

        const currentPlayerId = window.onlineMultiplayer.gameData.playerOrder[window.onlineMultiplayer.gameData.currentPlayerIndex];
        const isMyTurn = currentPlayerId === window.onlineMultiplayer.playerId;

        console.log('🎮 Current player ID:', currentPlayerId);
        console.log('🎮 My player ID:', window.onlineMultiplayer.playerId);
        console.log('🎮 Is my turn:', isMyTurn);

        if (!isMyTurn) {
            console.warn('⚠️ Not your turn!');
            alert('⏳ Please wait for your turn!');
            return;
        }

        // Set up ALL players in gameState.players for compatibility
        const allPlayers = [];
        window.onlineMultiplayer.gameData.playerOrder.forEach((playerId, index) => {
            const playerData = window.onlineMultiplayer.gameData.players[playerId];
            allPlayers[index] = {
                name: playerData.name,
                id: index
            };
        });

        // Set gameState with all players
        window.gameState.players = allPlayers;
        window.gameState.currentPlayerIndex = window.onlineMultiplayer.gameData.playerOrder.indexOf(window.onlineMultiplayer.playerId);

        console.log('✅ Set up gameState for online multiplayer:');
        console.log('   - players:', window.gameState.players);
        console.log('   - currentPlayerIndex:', window.gameState.currentPlayerIndex);
        console.log('   - current player:', window.gameState.players[window.gameState.currentPlayerIndex]);

        // Broadcast that this player is selecting (so other player can see)
        await window.onlineMultiplayer.db.ref(`games/${window.onlineMultiplayer.gameId}/currentAction`).set({
            playerId: window.onlineMultiplayer.playerId,
            action: 'selecting_player',
            team: team.name || team.teamName || team.full_name || 'Unknown Team',
            timestamp: Date.now()
        });
    }

    // Call original function
    return originalShowPlayerSelection(team);
};

// Helper function for position validation (copied from multiplayer.js)
function canPlayerFillPosition(player, position) {
    const playerPos = player.position.toLowerCase();
    const playerName = player.full_name || `${player.first_name} ${player.last_name}`;

    console.log(`🔍 Position check: ${playerName} (${playerPos}) → ${position}`);

    // Allow coaches to fill coach position
    if (position === 'coach') {
        const canCoach = player.isCoach || playerPos.includes('coach');
        console.log(`👨‍💼 Coach check: ${canCoach}`);
        return canCoach;
    }

    // Don't allow coaches to fill player positions
    if (player.isCoach) {
        console.log(`❌ Coach cannot fill player position`);
        return false;
    }

    // Position matching rules
    const positionMap = {
        pg: ['point guard', 'pg'],
        sg: ['shooting guard', 'sg'],
        sf: ['small forward', 'sf'],
        pf: ['power forward', 'pf'],
        c: ['center', 'c'],
        sixth: ['guard', 'forward', 'center', 'pg', 'sg', 'sf', 'pf', 'c'],
        seventh: ['guard', 'forward', 'center', 'pg', 'sg', 'sf', 'pf', 'c']
    };

    const allowedPositions = positionMap[position] || [];
    const canFill = allowedPositions.some(pos => playerPos.includes(pos));

    console.log(`🎯 Position match: ${playerPos} in [${allowedPositions.join(', ')}] = ${canFill}`);

    return canFill;
}

// Export functions
window.assignPlayerOnline = assignPlayerOnline;

console.log('✅ Online multiplayer integration loaded');
