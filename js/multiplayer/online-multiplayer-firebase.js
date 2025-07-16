/**
 * Online Multiplayer System - Firebase Integration
 * Real-time multiplayer for George and Frankie's Team Wheel Game
 * Works perfectly with Vercel static hosting
 */

class OnlineMultiplayerSystem {
    constructor() {
        this.gameId = null;
        this.playerId = null;
        this.playerName = null;
        this.isHost = false;
        this.gameData = null;
        this.db = null;
        this.gameRef = null;
        this.unsubscribe = null;
        
        // Game state tracking
        this.currentRound = 1;
        this.currentPlayerIndex = 0;
        this.gameSettings = null;
        this.isFirebaseReady = false;
    }

    // Initialize Firebase
    async initializeFirebase() {
        // Check if Firebase is available
        if (typeof firebase === 'undefined') {
            console.warn('🔥 Firebase SDK not loaded. Running in demo mode.');
            this.isFirebaseReady = false;
            return false;
        }

        try {
            // Firebase config - replace with your actual config
            const firebaseConfig = {
                apiKey: "AIzaSyDemo-replace-with-real-key",
                authDomain: "nba-team-wheel-demo.firebaseapp.com",
                databaseURL: "https://nba-team-wheel-demo-default-rtdb.firebaseio.com/",
                projectId: "nba-team-wheel-demo",
                storageBucket: "nba-team-wheel-demo.appspot.com",
                messagingSenderId: "123456789",
                appId: "1:123456789:web:demo123"
            };

            // Initialize Firebase if not already initialized
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            
            this.db = firebase.database();
            this.isFirebaseReady = true;
            
            console.log('🔥 Firebase initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Firebase:', error);
            this.isFirebaseReady = false;
            return false;
        }
    }

    // Create a new online game room
    async createOnlineGame(hostName, gameSettings) {
        try {
            this.playerName = hostName;
            this.isHost = true;
            this.gameSettings = gameSettings;
            
            // Generate unique game ID
            this.gameId = this.generateGameId();
            this.playerId = this.generatePlayerId();
            
            // Create game data structure
            const gameData = {
                id: this.gameId,
                host: this.playerId,
                settings: gameSettings,
                status: 'waiting_for_players',
                created_at: Date.now(),
                players: {
                    [this.playerId]: {
                        name: hostName,
                        isHost: true,
                        joinedAt: Date.now(),
                        isReady: false,
                        currentRoster: [],
                        roundScores: [],
                        totalScore: 0
                    }
                },
                currentRound: 1,
                currentPlayerIndex: 0,
                playerOrder: [this.playerId],
                gameState: 'setup',
                lastActivity: Date.now()
            };

            // Save to Firebase if available, otherwise store locally for demo
            if (this.isFirebaseReady) {
                await this.db.ref(`games/${this.gameId}`).set(gameData);
                this.setupGameListener();
            } else {
                // Demo mode - store in memory
                console.log('📡 Running in demo mode (no Firebase)');
                this.gameData = gameData;
                window.demoGameData = gameData; // Store globally for demo
            }
            
            console.log('🎮 Online game created:', this.gameId);
            console.log('🔗 Share this link with players:', this.getJoinLink());
            
            return {
                success: true,
                gameId: this.gameId,
                joinLink: this.getJoinLink()
            };
            
        } catch (error) {
            console.error('❌ Failed to create online game:', error);
            return { success: false, error: error.message };
        }
    }

    // Join an existing game
    async joinGame(gameId, playerName) {
        try {
            this.gameId = gameId;
            this.playerName = playerName;
            this.playerId = this.generatePlayerId();
            
            if (this.isFirebaseReady) {
                // Check if game exists
                const gameSnapshot = await this.db.ref(`games/${gameId}`).once('value');
                const gameData = gameSnapshot.val();
                
                if (!gameData) {
                    throw new Error('Game not found');
                }
                
                if (Object.keys(gameData.players).length >= gameData.settings.numPlayers) {
                    throw new Error('Game is full');
                }
                
                // Add player to game
                await this.db.ref(`games/${gameId}/players/${this.playerId}`).set({
                    name: playerName,
                    isHost: false,
                    joinedAt: Date.now(),
                    isReady: false,
                    currentRoster: [],
                    roundScores: [],
                    totalScore: 0
                });
                
                // Add to player order
                const newPlayerOrder = [...gameData.playerOrder, this.playerId];
                await this.db.ref(`games/${gameId}/playerOrder`).set(newPlayerOrder);
                
                this.setupGameListener();
                
            } else {
                // Demo mode
                if (!window.demoGameData || window.demoGameData.id !== gameId) {
                    throw new Error('Game not found (demo mode)');
                }
                
                this.gameData = window.demoGameData;
                this.gameData.players[this.playerId] = {
                    name: playerName,
                    isHost: false,
                    joinedAt: Date.now(),
                    isReady: false,
                    currentRoster: [],
                    roundScores: [],
                    totalScore: 0
                };
                
                this.gameData.playerOrder.push(this.playerId);
            }
            
            console.log(`👋 ${playerName} joined game ${gameId}`);
            return { success: true };
            
        } catch (error) {
            console.error('❌ Failed to join game:', error);
            return { success: false, error: error.message };
        }
    }

    // Start the multiplayer game (host only)
    async startMultiplayerGame() {
        if (!this.isHost) {
            console.warn('Only host can start the game');
            return false;
        }

        try {
            // Randomize player order for first round
            const playerIds = this.isFirebaseReady ? 
                Object.keys((await this.db.ref(`games/${this.gameId}/players`).once('value')).val()) :
                Object.keys(this.gameData.players);
            
            const randomizedOrder = this.shuffleArray([...playerIds]);
            
            const updateData = {
                playerOrder: randomizedOrder,
                currentPlayerIndex: 0,
                gameState: 'playing',
                status: 'in_progress',
                gameStartedAt: Date.now()
            };
            
            if (this.isFirebaseReady) {
                await this.db.ref(`games/${this.gameId}`).update(updateData);
            } else {
                Object.assign(this.gameData, updateData);
            }
            
            console.log('🚀 Multiplayer game started!');
            console.log('🎲 Player order:', randomizedOrder.map(id => 
                this.isFirebaseReady ? 'Player' : this.gameData.players[id].name
            ));
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to start game:', error);
            return false;
        }
    }

    // Handle player's turn (spin wheel and select team)
    async submitPlayerTurn(selectedTeam, position = null) {
        try {
            if (this.isFirebaseReady) {
                // Get current game data
                const gameSnapshot = await this.db.ref(`games/${this.gameId}`).once('value');
                const currentGameData = gameSnapshot.val();
                
                // Update player's roster
                const playerRosterRef = this.db.ref(`games/${this.gameId}/players/${this.playerId}/currentRoster`);
                const rosterSnapshot = await playerRosterRef.once('value');
                const currentRoster = rosterSnapshot.val() || [];
                
                const newSelection = {
                    team: selectedTeam,
                    round: currentGameData.currentRound,
                    position: position || (currentRoster.length + 1),
                    timestamp: Date.now()
                };
                
                currentRoster.push(newSelection);
                await playerRosterRef.set(currentRoster);
                
                // Calculate and update score
                const teamScore = await this.calculateTeamScore(selectedTeam);
                const roundScoreRef = this.db.ref(`games/${this.gameId}/players/${this.playerId}/roundScores/${currentGameData.currentRound - 1}`);
                const currentRoundScore = ((await roundScoreRef.once('value')).val() || 0) + teamScore;
                await roundScoreRef.set(currentRoundScore);
                
                // Move to next player
                const nextPlayerIndex = (currentGameData.currentPlayerIndex + 1) % currentGameData.playerOrder.length;
                await this.db.ref(`games/${this.gameId}/currentPlayerIndex`).set(nextPlayerIndex);
                
                // Update last activity
                await this.db.ref(`games/${this.gameId}/lastActivity`).set(Date.now());
                
            } else {
                // Demo mode
                const currentPlayer = this.gameData.players[this.playerId];
                
                currentPlayer.currentRoster.push({
                    team: selectedTeam,
                    round: this.gameData.currentRound,
                    position: position || (currentPlayer.currentRoster.length + 1),
                    timestamp: Date.now()
                });
                
                const teamScore = await this.calculateTeamScore(selectedTeam);
                currentPlayer.roundScores[this.gameData.currentRound - 1] = 
                    (currentPlayer.roundScores[this.gameData.currentRound - 1] || 0) + teamScore;
                
                this.gameData.currentPlayerIndex = 
                    (this.gameData.currentPlayerIndex + 1) % this.gameData.playerOrder.length;
            }

            console.log(`✅ Turn submitted for ${this.playerName}: ${selectedTeam.name}`);
            
            // Check if round/game is complete
            await this.checkRoundComplete();
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to submit turn:', error);
            return false;
        }
    }

    // Check if current round is complete
    async checkRoundComplete() {
        try {
            const gameData = this.isFirebaseReady ? 
                (await this.db.ref(`games/${this.gameId}`).once('value')).val() : 
                this.gameData;
            
            const requiredSelections = gameData.settings.rosterSize || 8; // NBA default
            const allPlayersComplete = Object.values(gameData.players).every(player => 
                player.currentRoster.filter(r => r.round === gameData.currentRound).length >= requiredSelections
            );
            
            if (allPlayersComplete) {
                await this.completeRound();
            }
            
        } catch (error) {
            console.error('❌ Error checking round completion:', error);
        }
    }

    // Complete current round and calculate scores
    async completeRound() {
        try {
            console.log(`🏁 Round ${this.gameData?.currentRound || 'current'} complete!`);
            
            const gameData = this.isFirebaseReady ? 
                (await this.db.ref(`games/${this.gameId}`).once('value')).val() : 
                this.gameData;
            
            // Calculate final scores for this round
            const roundResults = [];
            for (const [playerId, player] of Object.entries(gameData.players)) {
                const roundScore = player.roundScores[gameData.currentRound - 1] || 0;
                const newTotalScore = (player.totalScore || 0) + roundScore;
                
                // Update total score
                if (this.isFirebaseReady) {
                    await this.db.ref(`games/${this.gameId}/players/${playerId}/totalScore`).set(newTotalScore);
                } else {
                    player.totalScore = newTotalScore;
                }
                
                roundResults.push({
                    playerId,
                    playerName: player.name,
                    roundScore,
                    totalScore: newTotalScore
                });
            }
            
            // Sort by round score (highest first)
            roundResults.sort((a, b) => b.roundScore - a.roundScore);
            
            console.log(`📊 Round ${gameData.currentRound} Results:`, roundResults);
            
            // Check if game is complete
            if (gameData.currentRound >= gameData.settings.maxRounds) {
                await this.completeGame(roundResults);
            } else {
                // Start next round
                const nextRound = gameData.currentRound + 1;
                const randomizedOrder = this.shuffleArray([...gameData.playerOrder]);
                
                if (this.isFirebaseReady) {
                    await this.db.ref(`games/${this.gameId}`).update({
                        currentRound: nextRound,
                        currentPlayerIndex: 0,
                        playerOrder: randomizedOrder
                    });
                } else {
                    this.gameData.currentRound = nextRound;
                    this.gameData.currentPlayerIndex = 0;
                    this.gameData.playerOrder = randomizedOrder;
                }
                
                console.log(`🎯 Starting Round ${nextRound} with order:`, 
                    randomizedOrder.map(id => gameData.players[id].name));
            }
            
        } catch (error) {
            console.error('❌ Error completing round:', error);
        }
    }

    // Complete entire game
    async completeGame(finalResults) {
        try {
            console.log('🎉 Game Complete!');
            
            // Sort by total score
            finalResults.sort((a, b) => b.totalScore - a.totalScore);
            
            const gameEndData = {
                gameState: 'completed',
                finalResults: finalResults,
                winner: finalResults[0],
                completedAt: Date.now()
            };
            
            if (this.isFirebaseReady) {
                await this.db.ref(`games/${this.gameId}`).update(gameEndData);
            } else {
                Object.assign(this.gameData, gameEndData);
            }
            
            console.log('🏆 Final Results:', finalResults);
            console.log('👑 Winner:', finalResults[0].playerName);
            
            // Show results UI
            this.showGameResults(finalResults);
            
        } catch (error) {
            console.error('❌ Error completing game:', error);
        }
    }

    // Set up real-time listener for game updates
    setupGameListener() {
        if (!this.isFirebaseReady) {
            console.log('👂 Demo mode - no real-time listener');
            return;
        }
        
        try {
            this.gameRef = this.db.ref(`games/${this.gameId}`);
            this.unsubscribe = this.gameRef.on('value', (snapshot) => {
                this.gameData = snapshot.val();
                if (this.gameData) {
                    this.handleGameUpdate();
                }
            });
            
            console.log('👂 Real-time listener established');
            
        } catch (error) {
            console.error('❌ Error setting up game listener:', error);
        }
    }

    // Handle real-time game updates
    handleGameUpdate() {
        if (!this.gameData) return;
        
        console.log('🔄 Game state updated:', this.gameData.gameState);
        
        // Update UI based on current game state
        switch (this.gameData.gameState) {
            case 'setup':
                this.updateLobbyUI();
                break;
            case 'playing':
                this.updateGameplayUI();
                break;
            case 'completed':
                this.showGameResults(this.gameData.finalResults);
                break;
        }
    }

    // Update lobby UI (waiting for players)
    updateLobbyUI() {
        const playerCount = Object.keys(this.gameData.players).length;
        const maxPlayers = this.gameData.settings.numPlayers;
        
        // Update player list
        const playerListEl = document.getElementById('online-player-list');
        if (playerListEl) {
            playerListEl.innerHTML = Object.values(this.gameData.players)
                .map(player => `
                    <div class="player-item ${player.isHost ? 'host' : ''}">
                        ${player.isHost ? '👑' : '👤'} ${player.name}
                    </div>
                `).join('');
        }
        
        // Update start button
        const startButton = document.getElementById('start-online-game');
        if (startButton && this.isHost) {
            startButton.disabled = playerCount < 2;
            startButton.textContent = playerCount >= maxPlayers ? 
                '🚀 Start Game' : 
                `⏳ Waiting for players (${playerCount}/${maxPlayers})`;
        }
    }

    // Update gameplay UI
    updateGameplayUI() {
        const currentPlayerIndex = this.gameData.currentPlayerIndex;
        const currentPlayerId = this.gameData.playerOrder[currentPlayerIndex];
        const currentPlayer = this.gameData.players[currentPlayerId];
        
        // Show/hide spin button based on if it's this player's turn
        const isMyTurn = currentPlayerId === this.playerId;
        const spinButton = document.getElementById('classicSpinButton');
        
        if (spinButton) {
            spinButton.style.display = isMyTurn ? 'block' : 'none';
            spinButton.disabled = !isMyTurn;
        }
        
        // Update turn indicator
        this.updateTurnIndicator(currentPlayer.name, isMyTurn);
        
        // Update round info
        this.updateRoundInfo();
    }

    // Calculate team score using NBA2K ratings
    async calculateTeamScore(team) {
        try {
            // Use existing database integration if available
            if (typeof DatabaseIntegration !== 'undefined') {
                const teamRating = await DatabaseIntegration.getTeamAverageRating(team.abbreviation);
                return teamRating || 80;
            }
            
            // Fallback: use a simple calculation based on team quality
            const teamQuality = {
                'BOS': 92, 'LAL': 90, 'GSW': 89, 'MIL': 88, 'PHX': 87,
                'MIA': 86, 'PHI': 85, 'DEN': 84, 'LAC': 83, 'NYK': 82
            };
            
            return teamQuality[team.abbreviation] || (75 + Math.floor(Math.random() * 15));
            
        } catch (error) {
            console.error('❌ Error calculating team score:', error);
            return 80; // Default score
        }
    }

    // Utility functions
    generateGameId() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    generatePlayerId() {
        return Math.random().toString(36).substring(2, 15);
    }

    getJoinLink() {
        return `${window.location.origin}${window.location.pathname}?join=${this.gameId}`;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    updateTurnIndicator(playerName, isMyTurn) {
        const indicator = document.getElementById('turn-indicator');
        if (indicator) {
            indicator.textContent = isMyTurn ? 
                "🎯 Your turn! Spin the wheel!" : 
                `⏳ Waiting for ${playerName}...`;
            indicator.className = `turn-indicator ${isMyTurn ? 'my-turn' : 'waiting-turn'}`;
            indicator.style.display = 'block';
        }
    }

    updateRoundInfo() {
        const roundInfo = document.getElementById('round-info');
        if (roundInfo && this.gameData) {
            roundInfo.textContent = `Round ${this.gameData.currentRound} of ${this.gameData.settings.maxRounds}`;
        }
    }

    showGameResults(results) {
        console.log('🏆 Showing final game results');
        
        // Hide game UI
        const gamePhase = document.getElementById('multiplayer-phase');
        if (gamePhase) gamePhase.style.display = 'none';
        
        // Show results
        let resultsHTML = `
            <div class="game-results">
                <h2>🏆 Game Complete!</h2>
                <div class="final-standings">
        `;
        
        results.forEach((result, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
            resultsHTML += `
                <div class="result-row ${index === 0 ? 'winner' : ''}">
                    <span class="rank">${medal} ${index + 1}.</span>
                    <span class="player-name">${result.playerName}</span>
                    <span class="score">${result.totalScore} pts</span>
                </div>
            `;
        });
        
        resultsHTML += `
                </div>
                <div class="result-actions">
                    <button onclick="startNewGame()" class="mode-button">🔄 Play Again</button>
                    <button onclick="returnToMenu()" class="mode-button">🏠 Main Menu</button>
                </div>
            </div>
        `;
        
        // Show results in container
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = resultsHTML;
        }
    }

    // Cleanup
    disconnect() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        console.log('👋 Disconnected from online game');
    }

    // Get current game status
    getGameStatus() {
        return {
            gameId: this.gameId,
            playerId: this.playerId,
            playerName: this.playerName,
            isHost: this.isHost,
            gameState: this.gameData?.gameState,
            currentRound: this.gameData?.currentRound,
            playerCount: Object.keys(this.gameData?.players || {}).length
        };
    }
}

// Global instance
let onlineMultiplayer = null;

// Initialize online multiplayer system
function initializeOnlineMultiplayer() {
    onlineMultiplayer = new OnlineMultiplayerSystem();
    return onlineMultiplayer.initializeFirebase();
}

// Helper functions for UI integration
async function createOnlineGame() {
    if (!onlineMultiplayer) {
        await initializeOnlineMultiplayer();
    }
    
    const hostName = document.getElementById('host-name-input')?.value || 'Host';
    const gameSettings = {
        sport: 'nba',
        numPlayers: gameState.numPlayers || 2,
        maxRounds: gameState.maxRounds || 8,
        rosterSize: 8
    };
    
    const result = await onlineMultiplayer.createOnlineGame(hostName, gameSettings);
    if (result.success) {
        showOnlineGameLobby(result.joinLink);
    } else {
        alert('Failed to create game: ' + result.error);
    }
}

async function joinGameFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('join');
    
    if (gameId) {
        const playerName = prompt('Enter your name to join the game:');
        if (playerName) {
            if (!onlineMultiplayer) {
                await initializeOnlineMultiplayer();
            }
            
            const result = await onlineMultiplayer.joinGame(gameId, playerName);
            if (result.success) {
                showOnlineGameLobby();
            } else {
                alert('Failed to join game: ' + result.error);
            }
        }
    }
}

// Export for global use
window.OnlineMultiplayerSystem = OnlineMultiplayerSystem;
window.onlineMultiplayer = null;
window.initializeOnlineMultiplayer = initializeOnlineMultiplayer;
window.createOnlineGame = createOnlineGame;
window.joinGameFromURL = joinGameFromURL; 