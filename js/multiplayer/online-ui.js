/**
 * Online Multiplayer UI Integration
 * Handles all UI interactions for online multiplayer games
 */

// Show online game lobby
function showOnlineGameLobby(joinLink = null) {
    // Hide setup phase
    const setupPhase = document.getElementById('setup-phase');
    if (setupPhase) setupPhase.style.display = 'none';
    
    // Show online lobby
    let lobbyHTML = `
        <div id="online-lobby" class="setup-section">
            <h2>🌐 Online Multiplayer Lobby</h2>
            
            ${joinLink ? `
                <div class="game-link-section">
                    <h3>🔗 Share Game Link</h3>
                    <div class="game-link-container">
                        <input type="text" id="game-link" value="${joinLink}" readonly>
                        <button onclick="copyGameLink()" class="copy-button">📋 Copy</button>
                    </div>
                    <p>Share this link with your friends to join the game!</p>
                </div>
            ` : ''}
            
            <div class="lobby-info">
                <h3>👥 Players in Game</h3>
                <div id="online-player-list" class="player-list">
                    <!-- Players will be populated by real-time updates -->
                </div>
            </div>
            
            <div class="lobby-actions">
                ${onlineMultiplayer?.isHost ? `
                    <button id="start-online-game" onclick="startOnlineGame()" class="start-button" disabled>
                        ⏳ Waiting for players...
                    </button>
                ` : `
                    <div class="waiting-message">
                        ⏳ Waiting for host to start the game...
                    </div>
                `}
                
                <button onclick="leaveOnlineGame()" class="cancel-button">
                    🚪 Leave Game
                </button>
            </div>
        </div>
    `;
    
    // Insert lobby into container
    const container = document.querySelector('.container');
    if (container) {
        // Find where to insert (after title)
        const title = container.querySelector('h1');
        if (title) {
            title.insertAdjacentHTML('afterend', lobbyHTML);
        } else {
            container.innerHTML = lobbyHTML + container.innerHTML;
        }
    }
}

// Show online gameplay UI
function showOnlineGameplay() {
    // Hide lobby
    const lobby = document.getElementById('online-lobby');
    if (lobby) lobby.style.display = 'none';
    
    // Show game phase
    const gamePhase = document.getElementById('multiplayer-phase');
    if (gamePhase) {
        gamePhase.style.display = 'block';
    } else {
        // Create game phase if it doesn't exist
        createOnlineGameplayUI();
    }
    
    // Show turn indicator
    const turnIndicator = document.getElementById('turn-indicator');
    if (turnIndicator) {
        turnIndicator.style.display = 'block';
    } else {
        createTurnIndicator();
    }
    
    // Update initial game state
    if (onlineMultiplayer && onlineMultiplayer.gameData) {
        onlineMultiplayer.updateGameplayUI();
    }
}

// Create online gameplay UI
function createOnlineGameplayUI() {
    const gameplayHTML = `
        <div id="multiplayer-phase" class="game-section">
            <div class="game-header">
                <div id="round-info" class="round-info">Round 1 of 8</div>
                <div id="turn-indicator" class="turn-indicator">🎯 Your turn! Spin the wheel!</div>
            </div>
            
            <!-- Wheel Container -->
            <div class="wheel-container">
                <div class="wheel-pointer"></div>
                <div id="wheel" class="wheel"></div>
            </div>
            
            <div class="game-controls">
                <button id="classicSpinButton" onclick="spinWheel()" class="spin-button">
                    🎯 Spin the Wheel!
                </button>
                
                <div id="classic-result" class="result-display">
                    Click spin to select your team!
                </div>
            </div>
            
            <div class="online-game-info">
                <div id="current-rosters" class="rosters-display">
                    <!-- Rosters will be updated in real-time -->
                </div>
                
                <div id="game-scores" class="scores-display">
                    <!-- Scores will be updated in real-time -->
                </div>
            </div>
        </div>
    `;
    
    // Insert into container
    const container = document.querySelector('.container');
    if (container) {
        container.insertAdjacentHTML('beforeend', gameplayHTML);
    }
}

// Create turn indicator
function createTurnIndicator() {
    const indicatorHTML = `
        <div id="turn-indicator" class="turn-indicator">
            🎯 Your turn! Spin the wheel!
        </div>
    `;
    
    // Insert after title
    const title = document.querySelector('h1');
    if (title) {
        title.insertAdjacentHTML('afterend', indicatorHTML);
    }
}

// Copy game link to clipboard
async function copyGameLink() {
    const gameLink = document.getElementById('game-link');
    if (gameLink) {
        try {
            await navigator.clipboard.writeText(gameLink.value);
            
            // Show feedback
            const copyButton = document.querySelector('.copy-button');
            if (copyButton) {
                const originalText = copyButton.textContent;
                copyButton.textContent = '✅ Copied!';
                copyButton.style.background = '#4CAF50';
                
                setTimeout(() => {
                    copyButton.textContent = originalText;
                    copyButton.style.background = '';
                }, 2000);
            }
            
            console.log('📋 Game link copied to clipboard');
            
        } catch (error) {
            // Fallback for older browsers
            gameLink.select();
            document.execCommand('copy');
            alert('Game link copied to clipboard!');
        }
    }
}

// Start online game (host only)
async function startOnlineGame() {
    if (!onlineMultiplayer || !onlineMultiplayer.isHost) {
        console.warn('Only host can start the game');
        return;
    }
    
    const success = await onlineMultiplayer.startMultiplayerGame();
    if (success) {
        showOnlineGameplay();
    } else {
        alert('Failed to start game. Please try again.');
    }
}

// Leave online game
function leaveOnlineGame() {
    if (confirm('Are you sure you want to leave the game?')) {
        if (onlineMultiplayer) {
            onlineMultiplayer.disconnect();
        }
        
        // Return to main menu
        location.reload();
    }
}

// Handle online multiplayer selection
async function selectOnlineMultiplayer() {
    console.log('🌐 Setting up online multiplayer...');
    
    // Initialize online multiplayer if not already done
    if (!onlineMultiplayer) {
        const initialized = await initializeOnlineMultiplayer();
        if (!initialized) {
            console.warn('🔥 Firebase not available, using demo mode');
        }
    }
    
    // Hide game type selection
    const gameTypeStep = document.getElementById('game-type-step');
    if (gameTypeStep) gameTypeStep.style.display = 'none';
    
    // Create online game
    await createOnlineGame();
}

// Update player list in lobby
function updateOnlinePlayerList(players) {
    const playerListEl = document.getElementById('online-player-list');
    if (!playerListEl || !players) return;
    
    playerListEl.innerHTML = Object.values(players)
        .map(player => `
            <div class="player-item ${player.isHost ? 'host' : ''} ${player.isReady ? 'ready' : ''}">
                <span class="player-icon">${player.isHost ? '👑' : '👤'}</span>
                <span class="player-name">${player.name}</span>
                <span class="player-status">${player.isReady ? '✅' : '⏳'}</span>
            </div>
        `).join('');
}

// Update current rosters display
function updateRostersDisplay(players, currentRound) {
    const rostersEl = document.getElementById('current-rosters');
    if (!rostersEl || !players) return;
    
    let rostersHTML = '<h3>📋 Current Rosters</h3>';
    
    Object.values(players).forEach(player => {
        const currentRoundRoster = player.currentRoster.filter(r => r.round === currentRound);
        
        rostersHTML += `
            <div class="player-roster">
                <h4>${player.isHost ? '👑' : '👤'} ${player.name}</h4>
                <div class="roster-teams">
                    ${currentRoundRoster.map(selection => `
                        <span class="roster-team">${selection.team.abbreviation}</span>
                    `).join('')}
                    ${Array(8 - currentRoundRoster.length).fill().map(() => 
                        '<span class="roster-slot-empty">?</span>'
                    ).join('')}
                </div>
            </div>
        `;
    });
    
    rostersEl.innerHTML = rostersHTML;
}

// Update scores display
function updateScoresDisplay(players, currentRound) {
    const scoresEl = document.getElementById('game-scores');
    if (!scoresEl || !players) return;
    
    let scoresHTML = '<h3>📊 Scores</h3>';
    
    const playerScores = Object.values(players).map(player => ({
        name: player.name,
        isHost: player.isHost,
        roundScore: player.roundScores[currentRound - 1] || 0,
        totalScore: player.totalScore || 0
    })).sort((a, b) => b.totalScore - a.totalScore);
    
    scoresHTML += '<div class="scores-table">';
    playerScores.forEach((player, index) => {
        scoresHTML += `
            <div class="score-row ${index === 0 ? 'leader' : ''}">
                <span class="score-rank">${index + 1}.</span>
                <span class="score-player">${player.isHost ? '👑' : '👤'} ${player.name}</span>
                <span class="score-round">${player.roundScore}</span>
                <span class="score-total">${player.totalScore}</span>
            </div>
        `;
    });
    scoresHTML += '</div>';
    
    scoresEl.innerHTML = scoresHTML;
}

// Start new game (after completion)
function startNewGame() {
    if (onlineMultiplayer && onlineMultiplayer.isHost) {
        if (confirm('Start a new game with the same settings?')) {
            // Reset game state but keep players
            location.reload();
        }
    } else {
        alert('Only the host can start a new game.');
    }
}

// Return to main menu
function returnToMenu() {
    if (onlineMultiplayer) {
        onlineMultiplayer.disconnect();
    }
    location.reload();
}

// Handle wheel spin result for online multiplayer
function handleOnlineSpinResult(selectedTeam) {
    if (onlineMultiplayer && onlineMultiplayer.gameData) {
        // Check if it's actually this player's turn
        const currentPlayerIndex = onlineMultiplayer.gameData.currentPlayerIndex;
        const currentPlayerId = onlineMultiplayer.gameData.playerOrder[currentPlayerIndex];
        
        if (currentPlayerId === onlineMultiplayer.playerId) {
            // Submit the turn
            onlineMultiplayer.submitPlayerTurn(selectedTeam);
            
            // Update UI
            const resultEl = document.getElementById('classic-result');
            if (resultEl) {
                resultEl.innerHTML = `
                    <div class="spin-result">
                        <h3>🎯 You Selected:</h3>
                        <div class="selected-team">
                            <img src="${selectedTeam.logo_file}" alt="${selectedTeam.name}" class="team-logo-result">
                            <div class="team-info">
                                <div class="team-name">${selectedTeam.name}</div>
                                <div class="team-city">${selectedTeam.city}</div>
                            </div>
                        </div>
                    </div>
                `;
            }
        } else {
            console.warn('Not your turn!');
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if joining a game via URL
    const urlParams = new URLSearchParams(window.location.search);
    const joinGameId = urlParams.get('join');
    
    if (joinGameId) {
        // Wait a moment for the page to fully load
        setTimeout(() => {
            joinGameFromURL();
        }, 1000);
    }
});

// Export functions for global use
window.showOnlineGameLobby = showOnlineGameLobby;
window.showOnlineGameplay = showOnlineGameplay;
window.copyGameLink = copyGameLink;
window.startOnlineGame = startOnlineGame;
window.leaveOnlineGame = leaveOnlineGame;
window.selectOnlineMultiplayer = selectOnlineMultiplayer;
window.updateOnlinePlayerList = updateOnlinePlayerList;
window.updateRostersDisplay = updateRostersDisplay;
window.updateScoresDisplay = updateScoresDisplay;
window.startNewGame = startNewGame;
window.returnToMenu = returnToMenu;
window.handleOnlineSpinResult = handleOnlineSpinResult; 