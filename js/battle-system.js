/**
 * Battle System Integration for NBA Team Wheel
 * Enhanced battle functionality with NBA 2K25 ratings
 */

// Enhanced Battle System for NBA 2K25 Ratings
let battleSystemManager = null;

// Initialize battle system when page loads
window.addEventListener('load', async () => {
    try {
        if (typeof EnhancedBattleSystemManager !== 'undefined') {
            battleSystemManager = new EnhancedBattleSystemManager();
            await battleSystemManager.initialize();
            console.log('🎮 NBA 2K25 Battle System Ready!');
            
            // Make it globally available
            window.battleSystemManager = battleSystemManager;
        } else {
            console.warn('⚠️ EnhancedBattleSystemManager not found');
        }
    } catch (error) {
        console.warn('⚠️ Battle System initialization failed, using fallback:', error);
    }
});

// Enhanced start battle function with NBA 2K25 ratings
function startBattle() {
    if (!battleSystemManager || !battleSystemManager.initialized) {
        alert('🔥 Battle system loading... Please wait a moment and try again!');
        return;
    }
    
    if (gameState.dreamTeams.length < 2) {
        alert('Need at least 2 teams to battle!');
        return;
    }
    
    // Set up team objects for battle
    const team1 = {
        playerName: gameState.players[0].name,
        ...gameState.dreamTeams[0]
    };
    
    const team2 = {
        playerName: gameState.players[1].name,
        ...gameState.dreamTeams[1]
    };
    
    // Conduct the battle using NBA 2K25 ratings
    console.log('🎯 Starting NBA 2K25 battle between:', team1.playerName, 'vs', team2.playerName);
    
    const battleResult = battleSystemManager.conductDetailedBattle(team1, team2);
    
    if (battleResult) {
        displayBattleResult(battleResult);
    } else {
        // Fallback to simple battle
        const winner = Math.random() > 0.5 ? team1 : team2;
        alert(`🏆 ${winner.playerName} wins! Great team building!`);
    }
}

// Display detailed battle results
function displayBattleResult(battleResult) {
    const battleSection = document.getElementById('battleSection');
    
    const team1 = battleResult.teams.team1;
    const team2 = battleResult.teams.team2;
    const winner = battleResult.winner;
    
    battleSection.innerHTML = `
        <div class="battle-results">
            <h2>🏆 Battle Results 🏆</h2>
            
            <div class="battle-summary">
                <h3>${winner.name} Wins!</h3>
                <p><strong>Battle Type:</strong> ${battleResult.battleType}</p>
                <p><strong>Victory Margin:</strong> ${battleResult.margin} points</p>
            </div>
            
            <div class="team-comparison">
                <div class="team-result">
                    <h4>${team1.name}</h4>
                    <div class="team-score">⭐ ${team1.rating.total}</div>
                    <div class="team-breakdown">
                        <p><strong>Starters:</strong> ${team1.rating.breakdown.starterTotal}</p>
                        <p><strong>Bench:</strong> ${Math.round(team1.rating.breakdown.benchTotal)}</p>
                        <p><strong>Chemistry:</strong> ${team1.rating.breakdown.chemistry}</p>
                        <p><strong>Bonuses:</strong> ${team1.rating.breakdown.bonuses}</p>
                    </div>
                </div>
                
                <div class="vs-divider">VS</div>
                
                <div class="team-result">
                    <h4>${team2.name}</h4>
                    <div class="team-score">⭐ ${team2.rating.total}</div>
                    <div class="team-breakdown">
                        <p><strong>Starters:</strong> ${team2.rating.breakdown.starterTotal}</p>
                        <p><strong>Bench:</strong> ${Math.round(team2.rating.breakdown.benchTotal)}</p>
                        <p><strong>Chemistry:</strong> ${team2.rating.breakdown.chemistry}</p>
                        <p><strong>Bonuses:</strong> ${team2.rating.breakdown.bonuses}</p>
                    </div>
                </div>
            </div>
            
            <div class="position-battles">
                <h4>🥊 Position Battles:</h4>
                ${battleResult.positionBattles ? 
                    Object.entries(battleResult.positionBattles).map(([pos, battle]) => `
                        <div class="position-battle">
                            <span class="position">${pos.toUpperCase()}:</span>
                            <span class="battle-result">${battle.team1.name} (${battle.team1.rating}) vs ${battle.team2.name} (${battle.team2.rating})</span>
                            <span class="battle-winner">Winner: ${battle.winner.name}</span>
                        </div>
                    `).join('') : ''
                }
            </div>
            
            <div class="battle-analysis">
                <h4>📊 Battle Analysis:</h4>
                <p>${battleResult.summary}</p>
            </div>
            
            <div class="battle-actions">
                <button onclick="startBattle()" class="battle-button">⚔️ BATTLE AGAIN! ⚔️</button>
                <button onclick="resetMultiplayerGame()" class="battle-button secondary">🔄 New Game</button>
            </div>
        </div>
    `;
    
    // Play celebration sound and effects
    SoundManager.playCelebrationSound();
    VisualEffects.createConfetti();
}

// Reset multiplayer game (for new game)
function resetMultiplayerGame() {
    gameState.phase = 'setup';
    gameState.players = [];
    gameState.dreamTeams = [];
    gameState.currentPlayerIndex = 0;
    gameState.currentRound = 1;
    
    // Show setup phase
    document.getElementById('setup-phase').style.display = 'block';
    document.getElementById('mode-selection').style.display = 'none';
    document.getElementById('classic-mode').style.display = 'none';
    document.getElementById('dream-team-mode').style.display = 'none';
    
    // Reset setup steps
    document.getElementById('player-count-step').style.display = 'block';
    document.getElementById('player-names-step').style.display = 'none';
    document.getElementById('game-type-step').style.display = 'none';
    document.getElementById('invite-step').style.display = 'none';
    document.querySelectorAll('.count-button').forEach(btn => btn.classList.remove('selected'));
    
    // Reset UI
    document.getElementById('battleSection').style.display = 'none';
    document.getElementById('dreamSpinButton').disabled = false;
    document.getElementById('dreamSpinButton').textContent = '🎯 SPIN FOR PLAYER! 🎯';
    document.getElementById('playerSelection').classList.remove('show');
    
    // Reset all slots
    document.querySelectorAll('.position-slot').forEach(slot => {
        slot.classList.remove('filled');
        const playerDiv = slot.querySelector('.position-player');
        playerDiv.textContent = 'Empty';
        playerDiv.classList.remove('filled');
    });
    
    // Play success sound
    SoundManager.playSuccessSound();
}

// Placeholder for online game functionality
function startOnlineGame() {
    alert('🌐 Online multiplayer coming soon! For now, try the local multiplayer mode.');
}

// Export functions for global use
window.startBattle = startBattle;
window.displayBattleResult = displayBattleResult;
window.resetMultiplayerGame = resetMultiplayerGame;
window.startOnlineGame = startOnlineGame; 