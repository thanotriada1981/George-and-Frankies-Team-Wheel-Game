/**
 * Roster Builder - Position-Based Team Building
 * Handles roster construction based on sport-specific position requirements
 */

class RosterBuilder {
    constructor(sportConfig) {
        this.sportConfig = sportConfig;
        this.rosterRequirements = sportConfig.roster_requirements;
        this.currentRoster = [];
        this.currentPositionIndex = 0;
    }

    // Get the next position that needs to be filled
    getCurrentPosition() {
        if (this.currentPositionIndex >= this.rosterRequirements.draft_order.length) {
            return null; // Roster complete
        }
        return this.rosterRequirements.draft_order[this.currentPositionIndex];
    }

    // Get position details (name, abbreviation)
    getPositionInfo(positionKey) {
        return this.rosterRequirements.positions[positionKey];
    }

    // Check if roster is complete
    isRosterComplete() {
        return this.currentPositionIndex >= this.rosterRequirements.total_positions;
    }

    // Add a player to the current position
    addPlayerToRoster(player, teamName) {
        if (this.isRosterComplete()) {
            console.warn('Roster is already complete');
            return false;
        }

        const currentPos = this.getCurrentPosition();
        const positionInfo = this.getPositionInfo(currentPos);

        const rosterEntry = {
            position: currentPos,
            positionName: positionInfo.name,
            player: player,
            team: teamName,
            round: this.currentPositionIndex + 1
        };

        this.currentRoster.push(rosterEntry);
        this.currentPositionIndex++;

        console.log(`✅ Added ${player.name} (${teamName}) as ${positionInfo.name}`);
        return true;
    }

    // Get roster summary
    getRosterSummary() {
        return {
            sport: this.sportConfig.name,
            totalPositions: this.rosterRequirements.total_positions,
            filledPositions: this.currentRoster.length,
            isComplete: this.isRosterComplete(),
            roster: this.currentRoster,
            nextPosition: this.getCurrentPosition() ? this.getPositionInfo(this.getCurrentPosition()) : null
        };
    }

    // Format roster for display
    formatRosterForDisplay() {
        if (this.currentRoster.length === 0) {
            return 'No players selected yet.';
        }

        let display = `🏆 ${this.sportConfig.name} Roster (${this.currentRoster.length}/${this.rosterRequirements.total_positions}):\n\n`;
        
        this.currentRoster.forEach((entry, index) => {
            const posIcon = this.getPositionIcon(entry.position);
            display += `${index + 1}. ${posIcon} ${entry.positionName}: ${entry.player.name} (${entry.team})\n`;
        });

        if (!this.isRosterComplete()) {
            const nextPos = this.getPositionInfo(this.getCurrentPosition());
            const nextIcon = this.getPositionIcon(this.getCurrentPosition());
            display += `\n⏭️ Next: ${nextIcon} ${nextPos.name}`;
        } else {
            display += '\n🎉 Roster Complete!';
        }

        return display;
    }

    // Get icon for position (sport-specific)
    getPositionIcon(position) {
        const icons = {
            // NFL
            'QB': '🎯', 'RB': '🏃', 'WR': '🙌', 'TE': '💪', 'K': '🦵', 'DEF': '🛡️',
            // NBA  
            'PG': '🎯', 'SG': '🏀', 'SF': '⚡', 'PF': '💪', 'C': '🏛️', 'UTIL': '🔄',
            // MLB
            'C': '🥎', '1B': '1️⃣', '2B': '2️⃣', '3B': '3️⃣', 'SS': '⚡', 'OF': '🌟', 
            'DH': '💥', 'SP': '🚀', 'RP': '🔥',
            // Soccer
            'GK': '🥅', 'DEF': '🛡️', 'MID': '⚽', 'FWD': '🎯',
            // Coach
            'COACH': '👔'
        };
        return icons[position] || '👤';
    }

    // Reset roster
    resetRoster() {
        this.currentRoster = [];
        this.currentPositionIndex = 0;
        console.log(`🔄 Roster reset for ${this.sportConfig.name}`);
    }

    // Export roster data
    exportRoster() {
        return {
            sport: this.sportConfig.name,
            timestamp: new Date().toISOString(),
            roster: this.currentRoster,
            isComplete: this.isRosterComplete()
        };
    }
}

// Example usage functions for integration
function createRosterBuilderForSport(sportKey) {
    // This would integrate with the existing SportSelector
    const sportConfig = window.SportSelector?.getCurrentConfig() || {
        name: 'NBA',
        roster_requirements: {
            total_positions: 8,
            positions: {
                'PG': { name: 'Point Guard', count: 1, abbreviation: 'PG' },
                'SG': { name: 'Shooting Guard', count: 1, abbreviation: 'SG' },
                'SF': { name: 'Small Forward', count: 1, abbreviation: 'SF' },
                'PF': { name: 'Power Forward', count: 1, abbreviation: 'PF' },
                'C': { name: 'Center', count: 1, abbreviation: 'C' },
                'UTIL': { name: 'Utility Player', count: 2, abbreviation: 'UTIL' },
                'COACH': { name: 'Head Coach', count: 1, abbreviation: 'HC' }
            },
            draft_order: ['PG', 'SG', 'SF', 'PF', 'C', 'UTIL', 'UTIL', 'COACH']
        }
    };

    return new RosterBuilder(sportConfig);
}

// Demo function showing NFL roster building
function demoNFLRosterBuilding() {
    console.log('🏈 NFL Roster Building Demo:');
    
    const nflConfig = {
        name: 'NFL',
        roster_requirements: {
            total_positions: 10,
            positions: {
                'QB': { name: 'Quarterback', count: 1, abbreviation: 'QB' },
                'RB': { name: 'Running Back', count: 2, abbreviation: 'RB' },
                'WR': { name: 'Wide Receiver', count: 3, abbreviation: 'WR' },
                'TE': { name: 'Tight End', count: 1, abbreviation: 'TE' },
                'K': { name: 'Kicker', count: 1, abbreviation: 'K' },
                'DEF': { name: 'Team Defense', count: 1, abbreviation: 'DEF' },
                'COACH': { name: 'Head Coach', count: 1, abbreviation: 'HC' }
            },
            draft_order: ['QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'TE', 'K', 'DEF', 'COACH']
        }
    };

    const roster = new RosterBuilder(nflConfig);
    
    // Simulate adding players
    roster.addPlayerToRoster({ name: 'Josh Allen' }, 'Buffalo Bills');
    roster.addPlayerToRoster({ name: 'Christian McCaffrey' }, 'San Francisco 49ers');
    roster.addPlayerToRoster({ name: 'Saquon Barkley' }, 'Philadelphia Eagles');
    
    console.log(roster.formatRosterForDisplay());
    return roster;
}

// Export for global use
window.RosterBuilder = RosterBuilder;
window.createRosterBuilderForSport = createRosterBuilderForSport;
window.demoNFLRosterBuilding = demoNFLRosterBuilding; 