/**
 * Multiplayer functionality for NBA Team Wheel
 * Handles player management, turn-based gameplay, and team building
 */

// Game state for host name
let hostName = "";

// Ensure we have access to the global gameState
if (typeof gameState === "undefined") {
  console.warn("⚠️ gameState not found, creating fallback");
  window.gameState = {
    isSpinning: false,
    currentMode: "classic",
    players: [],
    dreamTeams: [],
    currentPlayerIndex: 0,
    currentRound: 1,
    phase: "setup",
    numPlayers: 2,
    gameType: "local",
  };
}

// Step 1: Set Host Name
function setHostName() {
  const hostInput = document.getElementById("host-name-input");
  const name = hostInput.value.trim();

  if (name === "") {
    alert("Please enter your name to continue!");
    hostInput.focus();
    return;
  }

  if (name.length > 20) {
    alert("Name must be 20 characters or less!");
    hostInput.focus();
    return;
  }

  // Store host name
  hostName = name;

  // Update displays
  document.getElementById("host-greeting").textContent = `Hello ${name}!`;
  document.getElementById("host-name-display").textContent = name;
  document.getElementById("host-name-local-display").textContent = name;

  // Move to next step
  document.getElementById("host-name-step").style.display = "none";
  document.getElementById("player-count-step").style.display = "block";

  console.log("🎮 Host name set:", name);
}

// Multiplayer Setup Functions
function selectPlayerCount(count) {
  gameState.numPlayers = count;

  // Update button states
  document.querySelectorAll(".count-button").forEach((btn) => {
    btn.classList.remove("selected");
  });
  event.target.classList.add("selected");

  // Show game type selection
  setTimeout(() => {
    document.getElementById("player-count-step").style.display = "none";
    document.getElementById("game-type-step").style.display = "block";
  }, 500);
}

function selectGameType(type) {
  gameState.gameType = type;

  if (type === "local") {
    // Show player name input
    document.getElementById("game-type-step").style.display = "none";
    document.getElementById("player-names-step").style.display = "block";

    // Create input fields for other player names (host already set)
    const container = document.getElementById("player-name-inputs");
    container.innerHTML = "";

    // Create inputs for players 2 through n (skip player 1 since host is already set)
    for (let i = 1; i < gameState.numPlayers; i++) {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "name-input";
      input.placeholder = `Enter Player ${i + 1} Name`;
      input.id = `player-${i + 1}-name`;
      input.maxLength = 20;
      input.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
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
      const firstInput = document.getElementById("player-2-name");
      if (firstInput) {
        firstInput.focus();
      }
    }
  } else if (type === "online") {
    // Show online game setup
    document.getElementById("game-type-step").style.display = "none";
    document.getElementById("invite-step").style.display = "block";

    // Generate invite link
    const gameId = generateGameId();
    const inviteLink = `${window.location.origin}${window.location.pathname}?join=${gameId}`;
    document.getElementById("inviteLink").value = inviteLink;

    // Store game ID for later use
    gameState.gameId = gameId;
  }
}

function generateGameId() {
  const teamNames = ["LAKERS", "CELTICS", "WARRIORS", "BULLS", "HEAT", "SPURS"];
  const randomTeam = teamNames[Math.floor(Math.random() * teamNames.length)];
  const randomNumber = Math.floor(Math.random() * 9000) + 1000;
  return `${randomTeam}-${randomNumber}`;
}

function copyInviteLink() {
  const linkInput = document.getElementById("inviteLink");
  linkInput.select();
  document.execCommand("copy");

  const copyButton = document.querySelector(".copy-button");
  const originalText = copyButton.textContent;
  copyButton.textContent = "✅ Copied!";
  copyButton.style.background = "#28a745";

  setTimeout(() => {
    copyButton.textContent = originalText;
    copyButton.style.background = "#007bff";
  }, 2000);
}

function checkForInviteLink() {
  const urlParams = new URLSearchParams(window.location.search);
  const joinGameId = urlParams.get("join");

  if (joinGameId) {
    // Player is joining a game
    gameState.phase = "joining";
    gameState.isHost = false;
    gameState.gameId = joinGameId;

    // Show join interface
    document.getElementById("setup-phase").style.display = "none";
    // Show joining interface (to be implemented)
  } else {
    // Player is creating a new game
    gameState.isHost = true;
  }
}

async function startMultiplayerGame() {
  // Start with host name
  const playerNames = [{ name: hostName, id: 0 }];

  // Get other player names (skip first since host is already added)
  for (let i = 1; i < gameState.numPlayers; i++) {
    const input = document.getElementById(`player-${i + 1}-name`);
    const name = input.value.trim();
    if (name === "") {
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
  gameState.phase = "playing";

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
      coach: null,
    });
  }

  // Hide setup and show dream team mode for local multiplayer
  document.getElementById("setup-phase").style.display = "none";
  document.getElementById("mode-selection").style.display = "none";
  document.getElementById("classic-mode").style.display = "none";
  document.getElementById("dream-team-mode").style.display = "block";

  // IMPORTANT: Initialize NBA data and wheel for multiplayer
  await initializeMultiplayerWheel();

  // Update multiplayer display
  updateMultiplayerDisplay();
}

function updateMultiplayerDisplay() {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const result = document.getElementById("dream-result");
  const spinCounter = document.getElementById("spinCounter");

  console.log(
    `🔄 updateMultiplayerDisplay called - Current player: ${currentPlayer.name} (index: ${gameState.currentPlayerIndex})`
  );

  // Update current player display
  result.innerHTML = `🎯 <strong style="color: #ff6b6b;">${currentPlayer.name}</strong>, it's your turn! 🎯`;

  // Update spin counter with alternating turn info
  const currentTeam = gameState.dreamTeams[gameState.currentPlayerIndex];
  const filledPositions = Object.values(currentTeam).filter(
    (player) => player !== null
  ).length;
  const positionsRemaining = 8 - filledPositions;

  if (positionsRemaining > 0) {
    spinCounter.textContent = `🎯 ${currentPlayer.name}'s Turn - ${filledPositions}/8 positions filled (${positionsRemaining} left)`;
  } else {
    spinCounter.textContent = `✅ ${currentPlayer.name}'s team is complete!`;
  }

  // Update team display for current player
  updateTeamDisplay(gameState.currentPlayerIndex);

  // Show turn order for all players
  updateTurnOrderDisplay();
}

function updateTurnOrderDisplay() {
  // Create or update turn order display
  let turnOrderDiv = document.getElementById("turnOrderDisplay");
  if (!turnOrderDiv) {
    turnOrderDiv = document.createElement("div");
    turnOrderDiv.id = "turnOrderDisplay";
    turnOrderDiv.className = "turn-order-display";
    turnOrderDiv.style.cssText = `
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 8px;
            margin: 10px 0;
            font-size: 14px;
            text-align: center;
        `;

    // Insert after the spin counter
    const spinCounter = document.getElementById("spinCounter");
    if (spinCounter && spinCounter.parentNode) {
      spinCounter.parentNode.insertBefore(
        turnOrderDiv,
        spinCounter.nextSibling
      );
    }
  }

  // Build turn order display
  let turnOrderHTML = "<strong>🔄 Turn Order:</strong><br>";
  gameState.players.forEach((player, index) => {
    const team = gameState.dreamTeams[index];
    const filledPositions = Object.values(team).filter(
      (player) => player !== null
    ).length;
    const isCurrentTurn = index === gameState.currentPlayerIndex;

    if (filledPositions < 8) {
      const status = isCurrentTurn ? "🎯 CURRENT" : "⏳ Waiting";
      turnOrderHTML += `${player.name}: ${filledPositions}/8 ${status}<br>`;
    } else {
      turnOrderHTML += `${player.name}: ✅ Complete<br>`;
    }
  });

  turnOrderDiv.innerHTML = turnOrderHTML;
}

function updateTeamDisplay(playerIndex) {
  const team = gameState.dreamTeams[playerIndex];
  const positions = ["pg", "sg", "sf", "pf", "c", "sixth", "seventh", "coach"];

  positions.forEach((position) => {
    const slot = document.getElementById(`slot-${position}`);
    if (slot) {
      const playerDiv = slot.querySelector(".position-player");
      if (team[position]) {
        playerDiv.textContent =
          team[position].full_name ||
          `${team[position].first_name} ${team[position].last_name}`;
        playerDiv.classList.add("filled");
        slot.classList.add("filled");
      } else {
        playerDiv.textContent = "Empty";
        playerDiv.classList.remove("filled");
        slot.classList.remove("filled");
      }
    }
  });
}

function showPlayerSelection(team) {
  console.log("🏀 === showPlayerSelection START ===");
  console.log("🏀 Team received:", team);

  const playerSelection = document.getElementById("playerSelection");
  const teamNameSpan = document.getElementById("selectedTeamName");
  const dropdown = document.getElementById("playerDropdown");
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  console.log("🏀 Elements found:", {
    playerSelection: !!playerSelection,
    teamNameSpan: !!teamNameSpan,
    dropdown: !!dropdown,
    currentPlayer: currentPlayer,
  });

  // Convert team object to the format expected by loadPlayersForTeam
  const teamForLoading = {
    name: team.teamName || team.name,
    color_primary: team.color_primary || "#000000",
  };

  console.log("🏀 showPlayerSelection called with team:", team);
  console.log("🔄 Converted team for loading:", teamForLoading);

  // Update the selection header
  const selectionHeader = playerSelection.querySelector("h3");
  selectionHeader.textContent = `🏀 ${currentPlayer.name}, Select Your Player!`;

  teamNameSpan.textContent = teamForLoading.name;
  teamNameSpan.style.color = teamForLoading.color_primary;

  // Clear dropdown
  dropdown.innerHTML = '<option value="">Loading players...</option>';

  // Load players for this team
  loadPlayersForTeam(teamForLoading)
    .then((players) => {
      gameState.currentPlayers = players;
      populatePlayerDropdown(players);
      updatePositionButtons();
    })
    .catch((error) => {
      console.error("Error loading players:", error);
      // Use mock data as fallback
      const mockPlayers = generateMockPlayers(teamForLoading.name);
      gameState.currentPlayers = mockPlayers;
      populatePlayerDropdown(mockPlayers);
      updatePositionButtons();
    });

  console.log("🏀 About to show player selection modal");
  playerSelection.classList.add("show");
  console.log(
    "🏀 Modal show class added. Modal visible:",
    playerSelection.classList.contains("show")
  );
  console.log("🏀 === showPlayerSelection END ===");
}

function populatePlayerDropdown(players) {
  const dropdown = document.getElementById("playerDropdown");
  dropdown.innerHTML = '<option value="">Choose a player...</option>';

  // Filter out coaches from player selection for positions
  const playersOnly = players.filter((player) => !player.isCoach);

  playersOnly.forEach((player, index) => {
    const option = document.createElement("option");
    option.value = index;

    // Get player rating if available
    const playerRating = player.nba2k26Rating || player.rating || "N/A";
    option.textContent = `${
      player.full_name || player.first_name + " " + player.last_name
    } - ${player.position} (${playerRating})`;
    dropdown.appendChild(option);
  });

  // Add coaches separately
  const coaches = players.filter((player) => player.isCoach);
  if (coaches.length > 0) {
    const coachGroup = document.createElement("optgroup");
    coachGroup.label = "Coaches";

    coaches.forEach((coach, index) => {
      const option = document.createElement("option");
      option.value = playersOnly.length + index;

      // Get coach rating and tier info if available
      const coachRating = coach.nba2k26Rating || coach.rating || "N/A";
      const coachTier = coach.coachInfo?.tierName || coach.tierName || "";
      const tierDisplay = coachTier ? ` (${coachTier})` : "";

      option.textContent = `${
        coach.full_name || coach.first_name + " " + coach.last_name
      } - ${coach.position} ${coachRating}${tierDisplay}`;
      coachGroup.appendChild(option);
    });

    dropdown.appendChild(coachGroup);
  }
}

function updatePositionButtons() {
  const buttons = document.querySelectorAll(".position-btn");
  const currentTeam = gameState.dreamTeams[gameState.currentPlayerIndex];

  buttons.forEach((button) => {
    const position = button
      .getAttribute("onclick")
      .match(/assignPlayer\('(\w+)'\)/)[1];

    // Disable button if position is already filled
    if (currentTeam[position]) {
      button.disabled = true;
      button.style.background = "#ccc";
      button.textContent = button.textContent.replace("Choose", "Filled");
    } else {
      button.disabled = false;
      button.style.background = "#4CAF50";
      button.textContent = button.textContent.replace("Filled", "Choose");
    }
  });
}

function assignPlayer(position) {
  const dropdown = document.getElementById("playerDropdown");
  const selectedIndex = dropdown.value;

  if (selectedIndex === "") {
    alert("Please select a player first!");
    return;
  }

  const player = gameState.currentPlayers[selectedIndex];

  // Check if this player is already on the current team
  const currentTeam = gameState.dreamTeams[gameState.currentPlayerIndex];
  const isPlayerAlreadySelected = Object.values(currentTeam).some(
    (existingPlayer) => {
      if (!existingPlayer) return false;
      // Compare by full name or first+last name
      const playerName =
        player.full_name || `${player.first_name} ${player.last_name}`;
      const existingPlayerName =
        existingPlayer.full_name ||
        `${existingPlayer.first_name} ${existingPlayer.last_name}`;
      return playerName === existingPlayerName;
    }
  );

  if (isPlayerAlreadySelected) {
    const playerName =
      player.full_name || `${player.first_name} ${player.last_name}`;
    alert(
      `❌ ${playerName} is already on your team! Please select a different player.`
    );
    return;
  }

  // Check if player can fill this position
  if (!canPlayerFillPosition(player, position)) {
    alert(
      `${
        player.full_name || player.first_name + " " + player.last_name
      } cannot fill the ${position} position!`
    );
    return;
  }

  // Assign player to current player's team
  gameState.dreamTeams[gameState.currentPlayerIndex][position] = player;

  // Update UI
  const slot = document.getElementById(`slot-${position}`);
  const playerDiv = slot.querySelector(".position-player");
  playerDiv.textContent =
    player.full_name || `${player.first_name} ${player.last_name}`;
  playerDiv.classList.add("filled");
  slot.classList.add("filled");

  // Play success sound
  SoundManager.playSuccessSound();

  // Show success message
  const playerName =
    player.full_name || `${player.first_name} ${player.last_name}`;
  console.log(
    `✅ ${playerName} assigned to ${position.toUpperCase()} position`
  );

  // Hide player selection
  document.getElementById("playerSelection").classList.remove("show");

  // Move to next player's turn
  console.log(`🔄 Calling nextPlayerTurn() after ${playerName} assignment`);
  nextPlayerTurn();
}

function nextPlayerTurn() {
  // Always move to next player after each pick (alternating turns)
  gameState.currentPlayerIndex =
    (gameState.currentPlayerIndex + 1) % gameState.numPlayers;

  console.log(
    `🔄 Moving to next player: ${
      gameState.players[gameState.currentPlayerIndex].name
    }`
  );

  // Check if the current player's team is already complete
  let currentTeam = gameState.dreamTeams[gameState.currentPlayerIndex];
  let currentTeamFilledPositions = Object.values(currentTeam).filter(
    (player) => player !== null
  ).length;

  console.log(
    `🎯 ${
      gameState.players[gameState.currentPlayerIndex].name
    } has ${currentTeamFilledPositions}/8 positions filled`
  );

  // If current player's team is complete, skip to the next available player
  if (currentTeamFilledPositions === 8) {
    console.log(
      `✅ ${
        gameState.players[gameState.currentPlayerIndex].name
      }'s team is complete, skipping...`
    );

    // Find next player with incomplete team
    let attempts = 0;
    while (
      currentTeamFilledPositions === 8 &&
      attempts < gameState.numPlayers
    ) {
      gameState.currentPlayerIndex =
        (gameState.currentPlayerIndex + 1) % gameState.numPlayers;
      currentTeam = gameState.dreamTeams[gameState.currentPlayerIndex];
      currentTeamFilledPositions = Object.values(currentTeam).filter(
        (player) => player !== null
      ).length;

      console.log(
        `🔄 Checking ${
          gameState.players[gameState.currentPlayerIndex].name
        } (${currentTeamFilledPositions}/8 filled)`
      );

      if (currentTeamFilledPositions < 8) {
        console.log(
          `✅ Found available player: ${
            gameState.players[gameState.currentPlayerIndex].name
          }`
        );
        break;
      }
      attempts++;
    }

    // Check if all teams are complete
    if (areAllTeamsComplete()) {
      console.log("🎉 All teams are complete! Starting battle phase...");
      startBattlePhase();
      return;
    }
  }

  // Increment round for alternating turns
  gameState.currentRound++;

  console.log(
    `🎯 Current turn: ${
      gameState.players[gameState.currentPlayerIndex].name
    } (Round ${gameState.currentRound})`
  );

  // Update display for current player
  updateMultiplayerDisplay();

  // Re-enable spin button
  const spinButton = document.getElementById("dreamSpinButton");
  if (spinButton) {
    spinButton.disabled = false;
    spinButton.textContent = `🎯 ${
      gameState.players[gameState.currentPlayerIndex].name
    }'s Turn - SPIN! 🎯`;
  }

  // Update spin counter
  updateSpinCounter();
}

function areAllTeamsComplete() {
  for (let i = 0; i < gameState.numPlayers; i++) {
    const team = gameState.dreamTeams[i];
    const filledPositions = Object.values(team).filter(
      (player) => player !== null
    ).length;
    if (filledPositions < 8) {
      return false;
    }
  }
  return true;
}

function updateSpinCounter() {
  const currentTeam = gameState.dreamTeams[gameState.currentPlayerIndex];
  const filledPositions = Object.values(currentTeam).filter(
    (player) => player !== null
  ).length;
  const positionsRemaining = 8 - filledPositions;

  const counter = document.getElementById("spinCounter");
  if (counter) {
    if (positionsRemaining > 0) {
      counter.textContent = `🎯 ${
        gameState.players[gameState.currentPlayerIndex].name
      }'s Turn - ${filledPositions}/8 positions filled (${positionsRemaining} left)`;
    } else {
      counter.textContent = `✅ ${
        gameState.players[gameState.currentPlayerIndex].name
      }'s team is complete!`;
    }
  }
}

function startBattlePhase() {
  gameState.phase = "battle";

  // Show battle section
  document.getElementById("battleSection").style.display = "block";

  // Update battle section content
  const battleSection = document.getElementById("battleSection");
  battleSection.innerHTML = `
        <h3>🔥 All Teams Complete! 🔥</h3>
        <p>All ${gameState.numPlayers} players have built their dream teams!</p>
        <div class="team-summary">
            ${gameState.players
              .map(
                (player, index) => `
                <div class="team-card">
                    <h4>${player.name}'s Team</h4>
                    <div class="team-positions">
                        ${Object.entries(gameState.dreamTeams[index])
                          .filter(([pos, player]) => player !== null)
                          .map(
                            ([pos, player]) => `
                                <div class="position-summary">
                                    <strong>${pos.toUpperCase()}:</strong> ${
                              player.full_name ||
                              player.first_name + " " + player.last_name
                            }
                                </div>
                            `
                          )
                          .join("")}
                    </div>
                </div>
            `
              )
              .join("")}
        </div>
        <button class="battle-button" onclick="tryStartBattle()">⚔️ START BATTLE! ⚔️</button>
    `;

  // Disable spin button
  const spinButton = document.getElementById("dreamSpinButton");
  if (spinButton) {
    spinButton.disabled = true;
    spinButton.textContent = "All Teams Complete!";
  }
}

function canPlayerFillPosition(player, position) {
  // Basic position matching logic
  const playerPos = player.position.toLowerCase();

  // Allow coaches to fill coach position
  if (position === "coach") {
    return player.isCoach || playerPos.includes("coach");
  }

  // Don't allow coaches to fill player positions
  if (player.isCoach) {
    return false;
  }

  // Position matching rules
  const positionMap = {
    pg: ["guard", "point guard", "pg"],
    sg: ["guard", "shooting guard", "sg"],
    sf: ["forward", "small forward", "sf"],
    pf: ["forward", "power forward", "pf"],
    c: ["center", "c"],
    sixth: ["guard", "forward", "center"], // 6th man can be any position
    seventh: ["guard", "forward", "center"], // 7th man can be any position
  };

  const allowedPositions = positionMap[position] || [];
  return allowedPositions.some((pos) => playerPos.includes(pos));
}

// Initialize wheel for multiplayer mode - now with optimized pre-built wheels!
async function initializeMultiplayerWheel() {
  console.log("🎯 Initializing multiplayer wheel with pre-built system...");

  try {
    // Try using optimized pre-built wheel system first
    if (typeof WheelLoader !== "undefined") {
      console.log("🔧 WheelLoader is available, initializing...");

      // First ensure the wheel loader is initialized
      const wheelLoaderReady = await WheelLoader.initialize();
      console.log("🔧 WheelLoader initialization result:", wheelLoaderReady);

      if (wheelLoaderReady && WheelLoader.renderPrebuiltWheel) {
        console.log("✅ Using optimized pre-built wheel for multiplayer");
        const success = WheelLoader.renderPrebuiltWheel("dreamWheel", "nba");
        console.log("🎨 Wheel render result:", success);

        if (success) {
          console.log(
            "🎯 Multiplayer pre-built NBA wheel rendered successfully!"
          );

          // Load team data for compatibility with game logic
          if (typeof WheelLoader.getTeamData === "function") {
            const teams = WheelLoader.getTeamData("nba");
            console.log("📊 Retrieved teams from config:", teams.length);

            if (teams && teams.length > 0) {
              // Set both local and global references for compatibility
              window.nbaTeams = teams;
              if (typeof nbaTeams !== "undefined") {
                nbaTeams.length = 0;
                nbaTeams.push(...teams);
              }

              console.log(
                "📊 Multiplayer teams data loaded from pre-built config:",
                teams.length,
                "teams"
              );
              console.log(
                "🏀 Sample teams:",
                teams.slice(0, 3).map((t) => t.name || t.abbreviation)
              );

              console.log(
                "✅ Multiplayer wheel initialized successfully with pre-built system!"
              );
              return;
            } else {
              console.warn("⚠️ No team data retrieved from pre-built config");
            }
          } else {
            console.warn("⚠️ WheelLoader.getTeamData function not available");
          }
        } else {
          console.warn("⚠️ Pre-built wheel rendering failed in multiplayer");
        }
      } else {
        console.warn(
          "⚠️ WheelLoader not ready or renderPrebuiltWheel not available"
        );
      }
    } else {
      console.warn("⚠️ WheelLoader not defined, using fallback");
    }

    // Fallback to original dynamic generation system
    console.log("🔄 Using fallback dynamic generation for multiplayer...");

    // Ensure SportSelector is initialized
    if (typeof SportSelector !== "undefined") {
      await SportSelector.initialize();
    }

    // Switch to NBA (default sport) and ensure data is loaded
    if (SportSelector && typeof SportSelector.switchSport === "function") {
      console.log("🔄 Using SportSelector.switchSport to load NBA data...");
      await SportSelector.switchSport("nba");
      console.log("✅ SportSelector.switchSport completed");
    } else {
      console.log(
        "🔄 SportSelector not available, loading NBA data directly..."
      );
      // Fallback: Load NBA data directly
      const response = await fetch("./database/nba/teams/nba_teams_data.json");
      const data = await response.json();
      const teams = data.teams || data;
      console.log("📊 Loaded teams data:", teams.length, "teams");
      console.log(
        "🏀 Sample teams:",
        teams.slice(0, 3).map((t) => t.name || t.abbreviation)
      );

      // Set both local and global references
      if (typeof window.nbaTeams !== "undefined") {
        console.log("🔗 Syncing with global window.nbaTeams...");
        // Update the global reference to point to the loaded data
        window.nbaTeams.length = 0; // Clear existing
        window.nbaTeams.push(...teams); // Add new teams
        console.log(
          "✅ Global nbaTeams now has",
          window.nbaTeams.length,
          "teams"
        );
      }

      // Note: Wheel drawing is handled by WheelManager - no need to redraw for multiplayer mode
      console.log(
        "🎮 Multiplayer mode: Using existing wheel (no recreation needed)"
      );
    }

    // Verify teams are loaded
    const finalTeamCount = (window.nbaTeams && window.nbaTeams.length) || 0;
    console.log(
      "✅ Multiplayer wheel initialized - Teams loaded:",
      finalTeamCount
    );

    if (finalTeamCount === 0) {
      console.warn("⚠️ No teams loaded! Wheel will be empty.");
    } else {
      console.log(
        "🏀 Sample teams:",
        window.nbaTeams.slice(0, 3).map((t) => t.name || t.abbreviation)
      );
    }
  } catch (error) {
    console.error("❌ Failed to initialize multiplayer wheel:", error);
  }
}

// Cancel player selection (return to wheel)
function cancelPlayerSelection() {
  const playerSelection = document.getElementById("playerSelection");
  if (playerSelection) {
    playerSelection.classList.remove("show");
  }

  // Re-enable the spin button
  const spinButton = document.getElementById("dreamSpinButton");
  if (spinButton) {
    spinButton.disabled = false;
    spinButton.textContent = "🎯 SPIN FOR PLAYER! 🎯";
  }

  console.log("❌ Player selection cancelled");
}

// Try to start battle with fallback
function tryStartBattle() {
    console.log('🎮 Attempting to start battle...');
    
    try {
        // Try the main battle function first
        if (typeof startBattle === 'function') {
            console.log('✅ startBattle function found, calling it...');
            startBattle();
        } else {
            console.warn('⚠️ startBattle function not found, trying simpleBattle...');
            if (typeof simpleBattle === 'function') {
                simpleBattle();
            } else {
                console.error('❌ No battle functions available!');
                alert('Battle system not available. Please refresh the page and try again.');
            }
        }
    } catch (error) {
        console.error('❌ Error in tryStartBattle:', error);
        alert('Battle failed to start. Error: ' + error.message);
    }
}

// Export functions for global use
window.setHostName = setHostName;
window.selectPlayerCount = selectPlayerCount;
window.selectGameType = selectGameType;
window.copyInviteLink = copyInviteLink;
window.startMultiplayerGame = startMultiplayerGame;
window.showPlayerSelection = showPlayerSelection;
window.assignPlayer = assignPlayer;
window.cancelPlayerSelection = cancelPlayerSelection;
window.tryStartBattle = tryStartBattle;