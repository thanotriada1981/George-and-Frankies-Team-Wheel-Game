/**
 * Battle System Integration for NBA Team Wheel
 * Enhanced battle functionality with NBA 2K25 ratings
 */

// Enhanced Battle System for NBA 2K25 Ratings
let battleSystemManager = null;

// Initialize battle system when page loads
window.addEventListener("load", async () => {
  try {
    if (typeof EnhancedBattleSystemManager !== "undefined") {
      battleSystemManager = new EnhancedBattleSystemManager();
      await battleSystemManager.initialize();
      console.log("🎮 NBA 2K25 Battle System Ready!");

      // Make it globally available
      window.battleSystemManager = battleSystemManager;
    } else {
      console.warn("⚠️ EnhancedBattleSystemManager not found");
    }
  } catch (error) {
    console.warn(
      "⚠️ Battle System initialization failed, using fallback:",
      error
    );
  }
});

// Enhanced start battle function with NBA 2K25 ratings
function startBattle() {
  console.log("🎮 Starting battle system...");
  console.log("🔍 Checking battle system manager:", battleSystemManager);
  console.log("🔍 Game state:", gameState);
  console.log("🔍 Dream teams:", gameState.dreamTeams);

  // Check if gameState exists
  if (typeof gameState === "undefined") {
    console.error("❌ gameState is not defined!");
    alert("Game state not found. Please refresh the page and try again.");
    return;
  }

  if (!gameState.dreamTeams || gameState.dreamTeams.length < 2) {
    console.error("❌ Not enough teams to battle:", gameState.dreamTeams);
    alert("Need at least 2 teams to battle!");
    return;
  }

  // Force initialize battle system if not ready
  if (!battleSystemManager || !battleSystemManager.initialized) {
    console.log(
      "🔄 Battle system not initialized, attempting to initialize..."
    );
    initializeBattleSystemNow();
    return;
  }

  // Create tournament structure for multiple players
  if (gameState.numPlayers > 2) {
    startTournamentBattle();
  } else {
    startSingleBattle();
  }
}

// Force initialize battle system immediately
async function initializeBattleSystemNow() {
  try {
    console.log("🚀 Force initializing battle system...");

    // Try to initialize the enhanced battle system
    if (typeof EnhancedBattleSystemManager !== "undefined") {
      battleSystemManager = new EnhancedBattleSystemManager();
      await battleSystemManager.initialize();

      if (battleSystemManager.initialized) {
        console.log("✅ Battle system initialized successfully!");
        window.battleSystemManager = battleSystemManager;
        startBattle(); // Retry the battle
        return;
      }
    }

    // If that fails, try to initialize PlayerRatingLookup directly
    console.log("🔄 Trying direct PlayerRatingLookup initialization...");
    if (typeof PlayerRatingLookup !== "undefined") {
      const directLookup = new PlayerRatingLookup();
      await directLookup.initialize();

      if (directLookup.initialized) {
        console.log("✅ Direct rating lookup initialized!");
        startBattleWithDirectRatings(directLookup);
        return;
      }
    }

    throw new Error("All initialization methods failed");
  } catch (error) {
    console.error("❌ Battle system initialization failed:", error);
    console.log("🎲 Falling back to simple battle system");
    useFallbackBattleSystem();
  }
}

// Battle system using direct rating lookup
function startBattleWithDirectRatings(ratingLookup) {
  console.log("⚔️ Starting battle with direct NBA 2K25 ratings!");

  if (gameState.numPlayers > 2) {
    startTournamentWithRatings(ratingLookup);
  } else {
    startSingleBattleWithRatings(ratingLookup);
  }
}

function startSingleBattleWithRatings(ratingLookup) {
  // Get team data with defensive programming
  const team1 = {
    playerName:
      gameState.players && gameState.players[0] && gameState.players[0].name
        ? gameState.players[0].name
        : "Player 1",
    ...gameState.dreamTeams[0],
  };

  const team2 = {
    playerName:
      gameState.players && gameState.players[1] && gameState.players[1].name
        ? gameState.players[1].name
        : "Player 2",
    ...gameState.dreamTeams[1],
  };

  console.log("🏀 Team 1:", team1);
  console.log("🏀 Team 2:", team2);

  // Calculate team ratings using real NBA 2K25 data
  const team1Rating = calculateTeamRatingWithLookup(team1, ratingLookup);
  const team2Rating = calculateTeamRatingWithLookup(team2, ratingLookup);

  console.log("📊 Team 1 Rating:", team1Rating);
  console.log("📊 Team 2 Rating:", team2Rating);

  // Determine winner based on ratings
  const winner = team1Rating.total > team2Rating.total ? team1 : team2;
  const winnerRating =
    team1Rating.total > team2Rating.total ? team1Rating : team2Rating;
  const loserRating =
    team1Rating.total > team2Rating.total ? team2Rating : team1Rating;

  const margin = Math.abs(team1Rating.total - team2Rating.total);

  const battleResult = {
    winner: { name: winner.playerName },
    teams: {
      team1: {
        name: team1.playerName,
        rating: team1Rating,
        score: team1Rating.total,
      },
      team2: {
        name: team2.playerName,
        rating: team2Rating,
        score: team2Rating.total,
      },
    },
    battleType: "NBA 2K25 Ratings Battle",
    margin: margin,
    date: new Date().toLocaleDateString(),
    winner_rating: winnerRating.total,
    loser_rating: loserRating.total,
  };

  console.log("🏆 Battle result with real ratings:", battleResult);
  saveBattleRecord(battleResult);
  displayRatingsBattleResult(battleResult);
}

// Calculate team rating using the rating lookup system
function calculateTeamRatingWithLookup(team, ratingLookup) {
  const positions = ["pg", "sg", "sf", "pf", "c"];
  const benchPositions = ["sixth", "seventh"];

  let totalRating = 0;
  let starterTotal = 0;
  let benchTotal = 0;
  const playerRatings = [];
  const missingPlayers = [];

  console.log(`🔍 Calculating rating for ${team.playerName}'s team:`);

  // Calculate starter ratings
  positions.forEach((position) => {
    const player = team[position];
    if (player) {
      const playerName =
        player.full_name || `${player.first_name} ${player.last_name}`;
      const rating = ratingLookup.getPlayerRating(playerName);

      if (rating) {
        console.log(
          `✅ ${position.toUpperCase()}: ${playerName} - ${
            rating.overall
          } overall`
        );
        starterTotal += rating.overall;
        playerRatings.push({
          name: playerName,
          position: position.toUpperCase(),
          overall: rating.overall,
          tier: rating.tier,
        });
      } else {
        console.log(
          `⚠️ ${position.toUpperCase()}: ${playerName} - Not found, using 75 default`
        );
        starterTotal += 75;
        missingPlayers.push(playerName);
        playerRatings.push({
          name: playerName,
          position: position.toUpperCase(),
          overall: 75,
          tier: "Default",
        });
      }
    }
  });

  // Calculate bench ratings
  benchPositions.forEach((position) => {
    const player = team[position];
    if (player) {
      const playerName =
        player.full_name || `${player.first_name} ${player.last_name}`;
      const rating = ratingLookup.getPlayerRating(playerName);

      if (rating) {
        console.log(
          `✅ ${position.toUpperCase()}: ${playerName} - ${
            rating.overall
          } overall`
        );
        benchTotal += rating.overall * 0.7; // Bench weighted at 70%
        playerRatings.push({
          name: playerName,
          position: position.toUpperCase(),
          overall: rating.overall,
          tier: rating.tier,
        });
      } else {
        console.log(
          `⚠️ ${position.toUpperCase()}: ${playerName} - Not found, using 72 default`
        );
        benchTotal += 72 * 0.7;
        missingPlayers.push(playerName);
        playerRatings.push({
          name: playerName,
          position: position.toUpperCase(),
          overall: 72,
          tier: "Default",
        });
      }
    }
  });

  // Calculate team chemistry bonus (based on player tiers)
  const superStars = playerRatings.filter((p) => p.overall >= 95).length;
  const allStars = playerRatings.filter((p) => p.overall >= 90).length;
  const chemistry = superStars * 5 + allStars * 3;

  // Calculate total rating
  totalRating = starterTotal * 0.7 + benchTotal * 0.2 + chemistry * 0.1;

  const result = {
    total: Math.round(totalRating),
    starterTotal: starterTotal,
    benchTotal: Math.round(benchTotal),
    chemistry: chemistry,
    playerRatings: playerRatings,
    missingPlayers: missingPlayers,
    superStars: superStars,
    allStars: allStars,
  };

  console.log(`📊 ${team.playerName} Total Rating: ${result.total}`);
  console.log(`   - Starters: ${starterTotal}`);
  console.log(`   - Bench: ${Math.round(benchTotal)}`);
  console.log(`   - Chemistry: ${chemistry}`);
  console.log(`   - Superstars (95+): ${superStars}`);
  console.log(`   - All-Stars (90+): ${allStars}`);

  return result;
}

// Display battle results with real ratings
function displayRatingsBattleResult(battleResult) {
  const battleSection = document.getElementById("battleSection");

  battleSection.innerHTML = `
        <div class="battle-results">
            <h2>🏆 NBA 2K25 Battle Results 🏆</h2>
            
            <div class="battle-summary">
                <h3>🎉 ${battleResult.winner.name} WINS! 🎉</h3>
                <p><strong>Battle Type:</strong> ${battleResult.battleType}</p>
                <p><strong>Rating Advantage:</strong> ${battleResult.margin} points</p>
                <p><strong>Date:</strong> ${battleResult.date}</p>
            </div>
            
            <div class="ratings-battle-breakdown">
                <div class="team-rating-result">
                    <h4>${battleResult.teams.team1.name}</h4>
                    <div class="team-score">⭐ ${battleResult.teams.team1.rating.total} Overall</div>
                    <div class="rating-breakdown">
                        <p><strong>Starters:</strong> ${battleResult.teams.team1.rating.starterTotal} total</p>
                        <p><strong>Bench:</strong> ${battleResult.teams.team1.rating.benchTotal} weighted</p>
                        <p><strong>Chemistry:</strong> ${battleResult.teams.team1.rating.chemistry} bonus</p>
                        <p><strong>Superstars (95+):</strong> ${battleResult.teams.team1.rating.superStars}</p>
                        <p><strong>All-Stars (90+):</strong> ${battleResult.teams.team1.rating.allStars}</p>
                    </div>
                </div>
                
                <div class="vs-divider">VS</div>
                
                <div class="team-rating-result">
                    <h4>${battleResult.teams.team2.name}</h4>
                    <div class="team-score">⭐ ${battleResult.teams.team2.rating.total} Overall</div>
                    <div class="rating-breakdown">
                        <p><strong>Starters:</strong> ${battleResult.teams.team2.rating.starterTotal} total</p>
                        <p><strong>Bench:</strong> ${battleResult.teams.team2.rating.benchTotal} weighted</p>
                        <p><strong>Chemistry:</strong> ${battleResult.teams.team2.rating.chemistry} bonus</p>
                        <p><strong>Superstars (95+):</strong> ${battleResult.teams.team2.rating.superStars}</p>
                        <p><strong>All-Stars (90+):</strong> ${battleResult.teams.team2.rating.allStars}</p>
                    </div>
                </div>
            </div>
            
            <div class="battle-actions">
                <button class="battle-button" onclick="resetMultiplayerGame()">🔄 Build New Teams</button>
                <button class="battle-button secondary" onclick="showBattleRecords()">📊 View All Records</button>
            </div>
        </div>
    `;

  battleSection.style.display = "block";

  // Play celebration sound if available
  if (
    typeof SoundManager !== "undefined" &&
    SoundManager.playCelebrationSound
  ) {
    SoundManager.playCelebrationSound();
  }

  // Show confetti if available
  if (typeof VisualEffects !== "undefined" && VisualEffects.createConfetti) {
    VisualEffects.createConfetti();
  }
}

// Fallback battle system when advanced ratings are not available
function useFallbackBattleSystem() {
  console.log("🎲 Using simple fallback battle system");

  if (gameState.numPlayers > 2) {
    startFallbackTournament();
  } else {
    startFallbackSingleBattle();
  }
}

function startSingleBattle() {
  // Set up team objects for battle with defensive programming
  const team1 = {
    playerName:
      gameState.players && gameState.players[0] && gameState.players[0].name
        ? gameState.players[0].name
        : "Player 1",
    ...gameState.dreamTeams[0],
  };

  const team2 = {
    playerName:
      gameState.players && gameState.players[1] && gameState.players[1].name
        ? gameState.players[1].name
        : "Player 2",
    ...gameState.dreamTeams[1],
  };

  console.log("🔍 Team 1 setup:", team1);
  console.log("🔍 Team 2 setup:", team2);

  // Conduct the battle using NBA 2K25 ratings
  console.log(
    "🎯 Starting NBA 2K25 battle between:",
    team1.playerName,
    "vs",
    team2.playerName
  );

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
      teams: {
        team1: { name: team1.playerName },
        team2: { name: team2.playerName },
      },
      battleType: "Simple Battle",
      margin: Math.floor(Math.random() * 20) + 1,
    };
    saveBattleRecord(simpleResult);
    displayBattleResult(simpleResult);
  }
}

function startTournamentBattle() {
  console.log(
    "🏆 Starting tournament battle with",
    gameState.numPlayers,
    "players"
  );

  const teams = gameState.players.map((player, index) => ({
    playerName: player.name,
    ...gameState.dreamTeams[index],
  }));

  // Create tournament bracket
  const tournamentResults = conductTournament(teams);
  displayTournamentResults(tournamentResults);
}

function conductTournament(teams) {
  const results = {
    bracket: [],
    champion: null,
    allBattles: [],
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

        const battleResult = battleSystemManager.conductDetailedBattle(
          team1,
          team2
        );
        const winner = battleResult
          ? battleResult.winner
          : Math.random() > 0.5
          ? team1
          : team2;

        roundResults.push({
          team1: team1.playerName,
          team2: team2.playerName,
          winner: winner.name || winner.playerName,
          details: battleResult,
        });

        results.allBattles.push(
          battleResult || {
            winner: winner,
            teams: { team1, team2 },
            battleType: `Tournament Round ${roundNumber}`,
            margin: Math.floor(Math.random() * 20) + 1,
          }
        );

        // Winner advances
        nextRound.push(
          winner.name ? teams.find((t) => t.playerName === winner.name) : winner
        );
      } else {
        // Odd number, team gets bye
        nextRound.push(currentRound[i]);
      }
    }

    results.bracket.push({
      round: roundNumber,
      battles: roundResults,
    });

    currentRound = nextRound;
    roundNumber++;
  }

  results.champion = currentRound[0];

  // Save all battles to records
  results.allBattles.forEach((battle) => saveBattleRecord(battle));

  return results;
}

// Display detailed battle results
function displayBattleResult(battleResult) {
  console.log("🎯 Displaying battle result:", battleResult);
  
  const battleSection = document.getElementById("battleSection");
  console.log("🔍 Battle section element:", battleSection);

  // Hide other game sections
  const modeSelection = document.getElementById("mode-selection");
  const classicMode = document.getElementById("classic-mode");
  const dreamTeamMode = document.getElementById("dream-team-mode");
  
  if (modeSelection) modeSelection.style.display = "none";
  if (classicMode) classicMode.style.display = "none";
  if (dreamTeamMode) dreamTeamMode.style.display = "none";

  const team1 = battleResult.teams.team1;
  const team2 = battleResult.teams.team2;
  const winner = battleResult.winner;

  battleSection.innerHTML = `
        <div class="battle-results">
            <h2>🏆 Battle Results 🏆</h2>
            
            <div class="battle-summary">
                <h3>${winner.name} Wins!</h3>
                <p><strong>Battle Type:</strong> ${battleResult.battleType}</p>
                <p><strong>Victory Margin:</strong> ${
                  battleResult.margin
                } points</p>
            </div>
            
            <div class="team-comparison">
                <div class="team-result">
                    <h4>${battleResult.teams.team1.name}</h4>
                    <div class="team-score">⭐ ${
                      battleResult.teams.team1.rating.total
                    }</div>
                    <div class="team-breakdown">
                        <p><strong>Starters:</strong> ${
                          battleResult.teams.team1.rating.breakdown.starterTotal
                        }</p>
                        <p><strong>Bench:</strong> ${Math.round(
                          battleResult.teams.team1.rating.breakdown.benchTotal
                        )}</p>
                        <p><strong>Chemistry:</strong> ${
                          battleResult.teams.team1.rating.breakdown.chemistry
                        }</p>
                        <p><strong>Bonuses:</strong> ${
                          battleResult.teams.team1.rating.breakdown.bonuses
                        }</p>
                    </div>
                </div>
                
                <div class="vs-divider">VS</div>
                
                <div class="team-result">
                    <h4>${battleResult.teams.team2.name}</h4>
                    <div class="team-score">⭐ ${
                      battleResult.teams.team2.rating.total
                    }</div>
                    <div class="team-breakdown">
                        <p><strong>Starters:</strong> ${
                          battleResult.teams.team2.rating.breakdown.starterTotal
                        }</p>
                        <p><strong>Bench:</strong> ${Math.round(
                          battleResult.teams.team2.rating.breakdown.benchTotal
                        )}</p>
                        <p><strong>Chemistry:</strong> ${
                          battleResult.teams.team2.rating.breakdown.chemistry
                        }</p>
                        <p><strong>Bonuses:</strong> ${
                          battleResult.teams.team2.rating.breakdown.bonuses
                        }</p>
                    </div>
                </div>
            </div>
            
            <div class="position-battles">
                <h4>🥊 Position Battles:</h4>
                ${
                  battleResult.positionBattles
                    ? Object.entries(battleResult.positionBattles)
                        .map(
                          ([pos, battle]) => `
                        <div class="position-battle">
                            <span class="position">${pos.toUpperCase()}:</span>
                            <span class="battle-result">Team 1 (${
                              battle.team1Rating
                            }) vs Team 2 (${battle.team2Rating})</span>
                            <span class="battle-winner">Winner: ${
                              battle.winner === "team1" ? "Team 1" : "Team 2"
                            }</span>
                        </div>
                    `
                        )
                        .join("")
                    : ""
                }
            </div>
            
            <div class="battle-analysis">
                <h4>📊 Battle Analysis:</h4>
                <p>${battleResult.summary}</p>
            </div>
            
            <div class="battle-actions">
                <button onclick="testBattleMode()" class="battle-button">⚔️ TEST BATTLE AGAIN! ⚔️</button>
                <button onclick="backToMainGame()" class="battle-button secondary">🏠 Back to Game</button>
            </div>
        </div>
    `;

  battleSection.style.display = "block";

  // Play celebration sound and effects
  SoundManager.playCelebrationSound();
  VisualEffects.createConfetti();
}

// Back to main game function
function backToMainGame() {
  console.log("🏠 Returning to main game...");
  
  // Hide battle section
  const battleSection = document.getElementById("battleSection");
  if (battleSection) battleSection.style.display = "none";
  
  // Show main game sections
  const modeSelection = document.getElementById("mode-selection");
  const classicMode = document.getElementById("classic-mode");
  
  if (modeSelection) modeSelection.style.display = "block";
  if (classicMode) classicMode.style.display = "block";
}

// Reset multiplayer game (for new game)
function resetMultiplayerGame() {
  gameState.phase = "setup";
  gameState.players = [];
  gameState.dreamTeams = [];
  gameState.currentPlayerIndex = 0;
  gameState.currentRound = 1;

  // Show setup phase
  document.getElementById("setup-phase").style.display = "block";
  document.getElementById("mode-selection").style.display = "none";
  document.getElementById("classic-mode").style.display = "none";
  document.getElementById("dream-team-mode").style.display = "none";

  // Reset setup steps
  document.getElementById("player-count-step").style.display = "block";
  document.getElementById("player-names-step").style.display = "none";
  document.getElementById("game-type-step").style.display = "none";
  document.getElementById("invite-step").style.display = "none";
  document
    .querySelectorAll(".count-button")
    .forEach((btn) => btn.classList.remove("selected"));

  // Reset UI
  document.getElementById("battleSection").style.display = "none";
  document.getElementById("dreamSpinButton").disabled = false;
  document.getElementById("dreamSpinButton").textContent =
    "🎯 SPIN FOR PLAYER! 🎯";
  document.getElementById("playerSelection").classList.remove("show");

  // Reset all slots
  document.querySelectorAll(".position-slot").forEach((slot) => {
    slot.classList.remove("filled");
    const playerDiv = slot.querySelector(".position-player");
    playerDiv.textContent = "Empty";
    playerDiv.classList.remove("filled");
  });

  // Play success sound
  SoundManager.playSuccessSound();
}

// Placeholder for online game functionality
function startOnlineGame() {
  alert(
    "🌐 Online multiplayer coming soon! For now, try the local multiplayer mode."
  );
}

// Battle record keeping system
let battleRecords = JSON.parse(
  localStorage.getItem("nba-wheel-battle-records") || "[]"
);

function saveBattleRecord(battleResult) {
  const record = {
    id: Date.now() + Math.random(),
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    winner: battleResult.winner.name || battleResult.winner.playerName,
    loser:
      battleResult.teams.team2.name === battleResult.winner.name
        ? battleResult.teams.team1.name
        : battleResult.teams.team2.name,
    margin: battleResult.margin || 0,
    battleType: battleResult.battleType || "Standard Battle",
    teams: {
      team1: {
        name:
          battleResult.teams.team1.name || battleResult.teams.team1.playerName,
        rating: battleResult.teams.team1.rating?.total || 0,
      },
      team2: {
        name:
          battleResult.teams.team2.name || battleResult.teams.team2.playerName,
        rating: battleResult.teams.team2.rating?.total || 0,
      },
    },
  };

  battleRecords.unshift(record); // Add to beginning

  // Keep only last 100 records
  if (battleRecords.length > 100) {
    battleRecords = battleRecords.slice(0, 100);
  }

  // Save to localStorage
  localStorage.setItem(
    "nba-wheel-battle-records",
    JSON.stringify(battleRecords)
  );

  console.log("📊 Battle record saved:", record);
}

function displayTournamentResults(tournamentResults) {
  const battleSection = document.getElementById("battleSection");

  battleSection.innerHTML = `
        <div class="tournament-results">
            <h2>🏆 Tournament Results 🏆</h2>
            
            <div class="champion-announcement">
                <h3>🥇 Champion: ${
                  tournamentResults.champion.playerName ||
                  tournamentResults.champion.name
                }!</h3>
            </div>
            
            <div class="tournament-bracket">
                <h4>📋 Tournament Bracket:</h4>
                ${tournamentResults.bracket
                  .map(
                    (round) => `
                    <div class="tournament-round">
                        <h5>Round ${round.round}:</h5>
                        ${round.battles
                          .map(
                            (battle) => `
                            <div class="bracket-battle">
                                <span class="battle-matchup">${battle.team1} vs ${battle.team2}</span>
                                <span class="battle-winner">Winner: ${battle.winner}</span>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                `
                  )
                  .join("")}
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

  const popup = document.getElementById("popup");
  const popupResult = document.getElementById("popupResult");

  popupResult.innerHTML = `
        <div class="battle-records">
            <h3>📊 Battle Records</h3>
            
            <div class="records-stats">
                <p><strong>Total Battles:</strong> ${battleRecords.length}</p>
                <p><strong>Recent Activity:</strong> ${
                  battleRecords.slice(0, 5).length
                } recent battles</p>
            </div>
            
            <div class="head-to-head">
                <h4>👥 Head-to-Head Records:</h4>
                ${Object.entries(recordsData.headToHead)
                  .map(
                    ([player, data]) => `
                    <div class="player-record">
                        <strong>${player}:</strong> ${data.wins}W - ${
                      data.losses
                    }L 
                        (Win Rate: ${(
                          (data.wins / (data.wins + data.losses)) *
                          100
                        ).toFixed(1)}%)
                    </div>
                `
                  )
                  .join("")}
            </div>
            
            <div class="recent-battles">
                <h4>🕒 Recent Battles:</h4>
                ${battleRecords
                  .slice(0, 10)
                  .map(
                    (record) => `
                    <div class="battle-record">
                        <span class="record-date">${record.date}</span>
                        <span class="record-result">${record.winner} defeated ${record.loser}</span>
                        <span class="record-margin">+${record.margin}pts</span>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    `;

  popup.style.display = "block";
}

function getHeadToHeadRecords() {
  const headToHead = {};
  const matchups = {};

  battleRecords.forEach((record) => {
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
    const matchupKey = [record.winner, record.loser].sort().join(" vs ");
    if (!matchups[matchupKey]) {
      matchups[matchupKey] = { battles: [], record: {} };
    }
    matchups[matchupKey].battles.push(record);
  });

  return { headToHead, matchups };
}

function startFallbackSingleBattle() {
  // Simple battle between two teams with defensive programming
  const team1 = {
    playerName:
      gameState.players && gameState.players[0] && gameState.players[0].name
        ? gameState.players[0].name
        : "Player 1",
    ...gameState.dreamTeams[0],
  };

  const team2 = {
    playerName:
      gameState.players && gameState.players[1] && gameState.players[1].name
        ? gameState.players[1].name
        : "Player 2",
    ...gameState.dreamTeams[1],
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
      team2: { name: team2.playerName, score: team2Score },
    },
    battleType: "Simple Battle",
    margin: margin,
    date: new Date().toLocaleDateString(),
  };

  console.log("🏆 Simple battle result:", battleResult);
  saveBattleRecord(battleResult);
  displaySimpleBattleResult(battleResult);
}

function startFallbackTournament() {
  console.log(
    "🏆 Starting simple tournament with",
    gameState.numPlayers,
    "players"
  );

  const teams = gameState.players.map((player, index) => ({
    playerName: player.name,
    ...gameState.dreamTeams[index],
  }));

  const tournamentResults = conductSimpleTournament(teams);
  displayTournamentResults(tournamentResults);
}

function conductSimpleTournament(teams) {
  const results = {
    bracket: [],
    champion: null,
    allBattles: [],
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
          margin: margin,
        });

        const battleResult = {
          winner: { name: winner.playerName },
          teams: { team1, team2 },
          battleType: `Tournament Round ${roundNumber}`,
          margin: margin,
          date: new Date().toLocaleDateString(),
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
      battles: roundResults,
    });

    currentRound = nextRound;
    roundNumber++;
  }

  results.champion = currentRound[0];

  // Save all battles
  results.allBattles.forEach((battle) => saveBattleRecord(battle));

  return results;
}

// Display simple battle results
function displaySimpleBattleResult(battleResult) {
  const battleSection = document.getElementById("battleSection");

  battleSection.innerHTML = `
        <div class="battle-results">
            <h2>🏆 Battle Results 🏆</h2>
            
            <div class="battle-summary">
                <h3>${battleResult.winner.name} Wins!</h3>
                <p><strong>Battle Type:</strong> ${battleResult.battleType}</p>
                <p><strong>Victory Margin:</strong> ${
                  battleResult.margin
                } points</p>
                <p><strong>Date:</strong> ${battleResult.date}</p>
            </div>
            
            <div class="simple-battle-breakdown">
                <div class="team-simple-result">
                    <h4>${battleResult.teams.team1.name}</h4>
                    <div class="team-score">🏀 ${
                      battleResult.teams.team1.score || "N/A"
                    }</div>
                </div>
                
                <div class="vs-divider">VS</div>
                
                <div class="team-simple-result">
                    <h4>${battleResult.teams.team2.name}</h4>
                    <div class="team-score">🏀 ${
                      battleResult.teams.team2.score || "N/A"
                    }</div>
                </div>
            </div>
            
            <div class="battle-actions">
                <button class="battle-button" onclick="resetMultiplayerGame()">🔄 Battle Again</button>
                <button class="battle-button secondary" onclick="showBattleRecords()">📊 View Records</button>
            </div>
        </div>
    `;

  battleSection.style.display = "block";

  // Play celebration sound if available
  if (
    typeof SoundManager !== "undefined" &&
    SoundManager.playCelebrationSound
  ) {
    SoundManager.playCelebrationSound();
  }

  // Show confetti if available
  if (typeof VisualEffects !== "undefined" && VisualEffects.createConfetti) {
    VisualEffects.createConfetti();
  }
}

// Test battle mode with pre-populated teams
function testBattleMode() {
  console.log("🧪 Starting test battle mode...");
  
  // First, let's test if we can find and show the battle section
  const battleSection = document.getElementById("battleSection");
  console.log("🔍 Battle section found:", battleSection);
  
  if (!battleSection) {
    console.error("❌ Battle section not found!");
    alert("Battle section not found! Check HTML structure.");
    return;
  }
  
  // Create test teams with real NBA players
  const testTeam1 = {
    playerName: "Test Team Alpha",
    pg: {
      full_name: "Luka Dončić",
      first_name: "Luka",
      last_name: "Dončić",
      position: "PG"
    },
    sg: {
      full_name: "Stephen Curry",
      first_name: "Stephen",
      last_name: "Curry",
      position: "SG"
    },
    sf: {
      full_name: "LeBron James",
      first_name: "LeBron",
      last_name: "James",
      position: "SF"
    },
    pf: {
      full_name: "Giannis Antetokounmpo",
      first_name: "Giannis",
      last_name: "Antetokounmpo",
      position: "PF"
    },
    c: {
      full_name: "Nikola Jokić",
      first_name: "Nikola",
      last_name: "Jokić",
      position: "C"
    },
    sixth: {
      full_name: "Kevin Durant",
      first_name: "Kevin",
      last_name: "Durant",
      position: "SF"
    },
    seventh: {
      full_name: "Joel Embiid",
      first_name: "Joel",
      last_name: "Embiid",
      position: "C"
    },
    coach: {
      full_name: "Erik Spoelstra",
      first_name: "Erik",
      last_name: "Spoelstra",
      position: "Coach",
      isCoach: true
    }
  };

  const testTeam2 = {
    playerName: "Test Team Beta",
    pg: {
      full_name: "Trae Young",
      first_name: "Trae",
      last_name: "Young",
      position: "PG"
    },
    sg: {
      full_name: "Devin Booker",
      first_name: "Devin",
      last_name: "Booker",
      position: "SG"
    },
    sf: {
      full_name: "Jayson Tatum",
      first_name: "Jayson",
      last_name: "Tatum",
      position: "SF"
    },
    pf: {
      full_name: "Anthony Davis",
      first_name: "Anthony",
      last_name: "Davis",
      position: "PF"
    },
    c: {
      full_name: "Rudy Gobert",
      first_name: "Rudy",
      last_name: "Gobert",
      position: "C"
    },
    sixth: {
      full_name: "Jimmy Butler",
      first_name: "Jimmy",
      last_name: "Butler",
      position: "SF"
    },
    seventh: {
      full_name: "Bam Adebayo",
      first_name: "Bam",
      last_name: "Adebayo",
      position: "C"
    },
    coach: {
      full_name: "Steve Kerr",
      first_name: "Steve",
      last_name: "Kerr",
      position: "Coach",
      isCoach: true
    }
  };

  console.log("🏀 Test Team 1:", testTeam1);
  console.log("🏀 Test Team 2:", testTeam2);

  // Try to use the advanced battle system first
  if (battleSystemManager && battleSystemManager.initialized) {
    console.log("🎯 Using advanced battle system for test battle");
    const battleResult = battleSystemManager.conductDetailedBattle(testTeam1, testTeam2);
    
    if (battleResult) {
      console.log("✅ Advanced battle result:", battleResult);
      saveBattleRecord(battleResult);
      displayBattleResult(battleResult);
      return;
    } else {
      console.log("❌ Advanced battle system returned null/undefined");
    }
  } else {
    console.log("❌ Battle system manager not initialized:", battleSystemManager);
  }

  // Fallback to simple battle
  console.log("🎲 Using simple battle system for test");
  const team1Score = Math.floor(Math.random() * 30) + 80; // 80-110
  const team2Score = Math.floor(Math.random() * 30) + 80; // 80-110

  const winner = team1Score > team2Score ? testTeam1 : testTeam2;
  const margin = Math.abs(team1Score - team2Score);

  const battleResult = {
    winner: { name: winner.playerName },
    teams: {
      team1: { name: testTeam1.playerName, score: team1Score },
      team2: { name: testTeam2.playerName, score: team2Score },
    },
    battleType: "Test Battle",
    margin: margin,
    date: new Date().toLocaleDateString(),
  };

  console.log("🏆 Test battle result:", battleResult);
  saveBattleRecord(battleResult);
  
  // Try to show a simple battle result first
  console.log("🎯 Attempting to show simple battle result...");
  displaySimpleBattleResult(battleResult);
}

// Simple fallback battle function
function simpleBattle() {
  console.log("🎲 Starting simple battle...");

  if (
    typeof gameState === "undefined" ||
    !gameState.dreamTeams ||
    gameState.dreamTeams.length < 2
  ) {
    alert("Need at least 2 teams to battle!");
    return;
  }

  const team1 = {
    playerName:
      gameState.players && gameState.players[0] && gameState.players[0].name
        ? gameState.players[0].name
        : "Player 1",
    ...gameState.dreamTeams[0],
  };

  const team2 = {
    playerName:
      gameState.players && gameState.players[1] && gameState.players[1].name
        ? gameState.players[1].name
        : "Player 2",
    ...gameState.dreamTeams[1],
  };

  // Simple random battle
  const team1Score = Math.floor(Math.random() * 30) + 80; // 80-110
  const team2Score = Math.floor(Math.random() * 30) + 80; // 80-110

  const winner = team1Score > team2Score ? team1 : team2;
  const margin = Math.abs(team1Score - team2Score);

  const battleResult = {
    winner: { name: winner.playerName },
    teams: {
      team1: { name: team1.playerName, score: team1Score },
      team2: { name: team2.playerName, score: team2Score },
    },
    battleType: "Simple Battle",
    margin: margin,
    date: new Date().toLocaleDateString(),
  };

  console.log("🏆 Simple battle result:", battleResult);
  saveBattleRecord(battleResult);
  displaySimpleBattleResult(battleResult);
}

// Export functions for global use
window.startBattle = startBattle;
window.simpleBattle = simpleBattle; // Fallback function
window.testBattleMode = testBattleMode; // Test battle function
window.displayBattleResult = displayBattleResult;
window.backToMainGame = backToMainGame; // Back to main game function
window.resetMultiplayerGame = resetMultiplayerGame;
window.startOnlineGame = startOnlineGame;
window.showBattleRecords = showBattleRecords;
window.saveBattleRecord = saveBattleRecord;
