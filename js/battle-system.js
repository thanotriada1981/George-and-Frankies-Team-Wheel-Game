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
    console.log('🎮 Starting battle system...');
    
    if (gameState.dreamTeams.length < 2) {
        alert('Need at least 2 teams to battle!');
        return;
    }
    
    // Check if battle system is available, if not use fallback
    if (!battleSystemManager || !battleSystemManager.initialized) {
        console.warn('⚠️ Advanced battle system not available, using fallback');
        useFallbackBattleSystem();
        return;
    }
    
    // Create tournament structure for multiple players
    if (gameState.numPlayers > 2) {
        startTournamentBattle();
    } else {
        startSingleBattle();
    }
}

// Fallback battle system when advanced ratings are not available
function useFallbackBattleSystem() {
    console.log('🎲 Using simple fallback battle system');
    
    if (gameState.numPlayers > 2) {
        startFallbackTournament();
    } else {
        startFallbackSingleBattle();
    }
}

function startSingleBattle() {
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
        // Save to records
        saveBattleRecord(battleResult);
        displayBattleResult(battleResult);
    } else {
        // Fallback to simple battle
        const winner = Math.random() > 0.5 ? team1 : team2;
        const simpleResult = {
            winner: { name: winner.playerName },
            teams: { team1: { name: team1.playerName }, team2: { name: team2.playerName } },
            battleType: 'Simple Battle',
            margin: Math.floor(Math.random() * 20) + 1
        };
        saveBattleRecord(simpleResult);
        displayBattleResult(simpleResult);
    }
}

function startTournamentBattle() {
    console.log('🏆 Starting tournament battle with', gameState.numPlayers, 'players');
    
    const teams = gameState.players.map((player, index) => ({
        playerName: player.name,
        ...gameState.dreamTeams[index]
    }));
    
    // Create tournament bracket
    const tournamentResults = conductTournament(teams);
    displayTournamentResults(tournamentResults);
}

function conductTournament(teams) {
    const results = {
        bracket: [],
        champion: null,
        allBattles: []
    };
    
    let currentRound = [...teams];
    let roundNumber = 1;
    
    while (currentRound.length > 1) {
        const roundResults = [];
        const nextRound = [];
        
        // Pair up teams for battles
        for (let i = 0; i < currentRound.length; i += 2) {
            if (i + 1 < currentRound.length) {
                const team1 = currentRound[i];
                const team2 = currentRound[i + 1];
                
                const battleResult = battleSystemManager.conductDetailedBattle(team1, team2);
                const winner = battleResult ? battleResult.winner : (Math.random() > 0.5 ? team1 : team2);
                
                roundResults.push({
                    team1: team1.playerName,
                    team2: team2.playerName,
                    winner: winner.name || winner.playerName,
                    details: battleResult
                });
                
                results.allBattles.push(battleResult || {
                    winner: winner,
                    teams: { team1, team2 },
                    battleType: `Tournament Round ${roundNumber}`,
                    margin: Math.floor(Math.random() * 20) + 1
                });
                
                // Winner advances
                nextRound.push(winner.name ? teams.find(t => t.playerName === winner.name) : winner);
            } else {
                // Odd number, team gets bye
                nextRound.push(currentRound[i]);
            }
        }
        
        results.bracket.push({
            round: roundNumber,
            battles: roundResults
        });
        
        currentRound = nextRound;
        roundNumber++;
    }
    
    results.champion = currentRound[0];
    
    // Save all battles to records
    results.allBattles.forEach(battle => saveBattleRecord(battle));
    
    return results;
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

// Battle record keeping system
let battleRecords = JSON.parse(localStorage.getItem('nba-wheel-battle-records') || '[]');

function saveBattleRecord(battleResult) {
    const record = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        winner: battleResult.winner.name || battleResult.winner.playerName,
        loser: battleResult.teams.team2.name === battleResult.winner.name ? 
               battleResult.teams.team1.name : battleResult.teams.team2.name,
        margin: battleResult.margin || 0,
        battleType: battleResult.battleType || 'Standard Battle',
        teams: {
            team1: {
                name: battleResult.teams.team1.name || battleResult.teams.team1.playerName,
                rating: battleResult.teams.team1.rating?.total || 0
            },
            team2: {
                name: battleResult.teams.team2.name || battleResult.teams.team2.playerName,
                rating: battleResult.teams.team2.rating?.total || 0
            }
        }
    };
    
    battleRecords.unshift(record); // Add to beginning
    
    // Keep only last 100 records
    if (battleRecords.length > 100) {
        battleRecords = battleRecords.slice(0, 100);
    }
    
    // Save to localStorage
    localStorage.setItem('nba-wheel-battle-records', JSON.stringify(battleRecords));
    
    console.log('📊 Battle record saved:', record);
}

function displayTournamentResults(tournamentResults) {
    const battleSection = document.getElementById('battleSection');
    
    battleSection.innerHTML = `
        <div class="tournament-results">
            <h2>🏆 Tournament Results 🏆</h2>
            
            <div class="champion-announcement">
                <h3>🥇 Champion: ${tournamentResults.champion.playerName || tournamentResults.champion.name}!</h3>
            </div>
            
            <div class="tournament-bracket">
                <h4>📋 Tournament Bracket:</h4>
                ${tournamentResults.bracket.map(round => `
                    <div class="tournament-round">
                        <h5>Round ${round.round}:</h5>
                        ${round.battles.map(battle => `
                            <div class="bracket-battle">
                                <span class="battle-matchup">${battle.team1} vs ${battle.team2}</span>
                                <span class="battle-winner">Winner: ${battle.winner}</span>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
            
            <div class="records-summary">
                <h4>📊 Updated Records:</h4>
                <button onclick="showBattleRecords()" class="battle-button secondary">📈 View All Records</button>
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

function showBattleRecords() {
    const recordsData = getHeadToHeadRecords();
    
    const popup = document.getElementById('popup');
    const popupResult = document.getElementById('popupResult');
    
    popupResult.innerHTML = `
        <div class="battle-records">
            <h3>📊 Battle Records</h3>
            
            <div class="records-stats">
                <p><strong>Total Battles:</strong> ${battleRecords.length}</p>
                <p><strong>Recent Activity:</strong> ${battleRecords.slice(0, 5).length} recent battles</p>
            </div>
            
            <div class="head-to-head">
                <h4>👥 Head-to-Head Records:</h4>
                ${Object.entries(recordsData.headToHead).map(([player, data]) => `
                    <div class="player-record">
                        <strong>${player}:</strong> ${data.wins}W - ${data.losses}L 
                        (Win Rate: ${((data.wins / (data.wins + data.losses)) * 100).toFixed(1)}%)
                    </div>
                `).join('')}
            </div>
            
            <div class="recent-battles">
                <h4>🕒 Recent Battles:</h4>
                ${battleRecords.slice(0, 10).map(record => `
                    <div class="battle-record">
                        <span class="record-date">${record.date}</span>
                        <span class="record-result">${record.winner} defeated ${record.loser}</span>
                        <span class="record-margin">+${record.margin}pts</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    popup.style.display = 'block';
}

function getHeadToHeadRecords() {
    const headToHead = {};
    const matchups = {};
    
    battleRecords.forEach(record => {
        // Initialize players
        if (!headToHead[record.winner]) {
            headToHead[record.winner] = { wins: 0, losses: 0 };
        }
        if (!headToHead[record.loser]) {
            headToHead[record.loser] = { wins: 0, losses: 0 };
        }
        
        // Update win/loss records
        headToHead[record.winner].wins++;
        headToHead[record.loser].losses++;
        
        // Track specific matchups
        const matchupKey = [record.winner, record.loser].sort().join(' vs ');
        if (!matchups[matchupKey]) {
            matchups[matchupKey] = { battles: [], record: {} };
        }
        matchups[matchupKey].battles.push(record);
    });
    
    return { headToHead, matchups };
}

function startFallbackSingleBattle() {
    // Simple battle between two teams
    const team1 = {
        playerName: gameState.players[0].name,
        ...gameState.dreamTeams[0]
    };
    
    const team2 = {
        playerName: gameState.players[1].name,
        ...gameState.dreamTeams[1]
    };
    
    // Simple random battle with basic logic
    const team1Score = Math.floor(Math.random() * 30) + 80; // 80-110
    const team2Score = Math.floor(Math.random() * 30) + 80; // 80-110
    
    const winner = team1Score > team2Score ? team1 : team2;
    const margin = Math.abs(team1Score - team2Score);
    
    const battleResult = {
        winner: { name: winner.playerName },
        teams: { 
            team1: { name: team1.playerName, score: team1Score }, 
            team2: { name: team2.playerName, score: team2Score } 
        },
        battleType: 'Simple Battle',
        margin: margin,
        date: new Date().toLocaleDateString()
    };
    
    console.log('🏆 Simple battle result:', battleResult);
    saveBattleRecord(battleResult);
    displaySimpleBattleResult(battleResult);
}

function startFallbackTournament() {
    console.log('🏆 Starting simple tournament with', gameState.numPlayers, 'players');
    
    const teams = gameState.players.map((player, index) => ({
        playerName: player.name,
        ...gameState.dreamTeams[index]
    }));
    
    const tournamentResults = conductSimpleTournament(teams);
    displayTournamentResults(tournamentResults);
}

function conductSimpleTournament(teams) {
    const results = {
        bracket: [],
        champion: null,
        allBattles: []
    };
    
    let currentRound = [...teams];
    let roundNumber = 1;
    
    while (currentRound.length > 1) {
        const roundResults = [];
        const nextRound = [];
        
        for (let i = 0; i < currentRound.length; i += 2) {
            if (i + 1 < currentRound.length) {
                const team1 = currentRound[i];
                const team2 = currentRound[i + 1];
                
                // Simple random winner
                const winner = Math.random() > 0.5 ? team1 : team2;
                const margin = Math.floor(Math.random() * 20) + 1;
                
                roundResults.push({
                    team1: team1.playerName,
                    team2: team2.playerName,
                    winner: winner.playerName,
                    margin: margin
                });
                
                const battleResult = {
                    winner: { name: winner.playerName },
                    teams: { team1, team2 },
                    battleType: `Tournament Round ${roundNumber}`,
                    margin: margin,
                    date: new Date().toLocaleDateString()
                };
                
                results.allBattles.push(battleResult);
                nextRound.push(winner);
            } else {
                // Bye to next round
                nextRound.push(currentRound[i]);
            }
        }
        
        results.bracket.push({
            round: roundNumber,
            battles: roundResults
        });
        
        currentRound = nextRound;
        roundNumber++;
    }
    
    results.champion = currentRound[0];
    
    // Save all battles
    results.allBattles.forEach(battle => saveBattleRecord(battle));
    
    return results;
}

// Display simple battle results
function displaySimpleBattleResult(battleResult) {
    const battleSection = document.getElementById('battleSection');
    
    battleSection.innerHTML = `
        <div class="battle-results">
            <h2>🏆 Battle Results 🏆</h2>
            
            <div class="battle-summary">
                <h3>${battleResult.winner.name} Wins!</h3>
                <p><strong>Battle Type:</strong> ${battleResult.battleType}</p>
                <p><strong>Victory Margin:</strong> ${battleResult.margin} points</p>
                <p><strong>Date:</strong> ${battleResult.date}</p>
            </div>
            
            <div class="simple-battle-breakdown">
                <div class="team-simple-result">
                    <h4>${battleResult.teams.team1.name}</h4>
                    <div class="team-score">🏀 ${battleResult.teams.team1.score || 'N/A'}</div>
                </div>
                
                <div class="vs-divider">VS</div>
                
                <div class="team-simple-result">
                    <h4>${battleResult.teams.team2.name}</h4>
                    <div class="team-score">🏀 ${battleResult.teams.team2.score || 'N/A'}</div>
                </div>
            </div>
            
            <div class="battle-actions">
                <button class="battle-button" onclick="resetMultiplayerGame()">🔄 Battle Again</button>
                <button class="battle-button secondary" onclick="showBattleRecords()">📊 View Records</button>
            </div>
        </div>
    `;
    
    battleSection.style.display = 'block';
    
    // Play celebration sound if available
    if (typeof SoundManager !== 'undefined' && SoundManager.playCelebrationSound) {
        SoundManager.playCelebrationSound();
    }
    
    // Show confetti if available
    if (typeof VisualEffects !== 'undefined' && VisualEffects.createConfetti) {
        VisualEffects.createConfetti();
    }
}

// Export functions for global use
window.startBattle = startBattle;
window.displayBattleResult = displayBattleResult;
window.resetMultiplayerGame = resetMultiplayerGame;
window.startOnlineGame = startOnlineGame;
window.showBattleRecords = showBattleRecords;
window.saveBattleRecord = saveBattleRecord; 