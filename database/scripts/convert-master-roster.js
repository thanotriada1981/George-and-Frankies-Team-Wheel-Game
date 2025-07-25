const fs = require('fs');
const path = require('path');

// Read the master roster file
const masterRosterPath = path.join(__dirname, '../nba/teams/NBA Team Rosters 7-16-2025');
const teamsDir = path.join(__dirname, '../nba/teams');

// Coach information (you can update this as needed)
const coaches = {
  'Atlanta Hawks': 'Quin Snyder',
  'Boston Celtics': 'Joe Mazzulla',
  'Brooklyn Nets': 'Jordi Fernandez',
  'Charlotte Hornets': 'Charles Lee',
  'Chicago Bulls': 'Billy Donovan',
  'Cleveland Cavaliers': 'Kenny Atkinson',
  'Dallas Mavericks': 'Jason Kidd',
  'Denver Nuggets': 'Michael Malone',
  'Detroit Pistons': 'J.B. Bickerstaff',
  'Golden State Warriors': 'Steve Kerr',
  'Houston Rockets': 'Ime Udoka',
  'Indiana Pacers': 'Rick Carlisle',
  'Los Angeles Clippers': 'Tyronn Lue',
  'Los Angeles Lakers': 'JJ Redick',
  'Memphis Grizzlies': 'Taylor Jenkins',
  'Miami Heat': 'Erik Spoelstra',
  'Milwaukee Bucks': 'Doc Rivers',
  'Minnesota Timberwolves': 'Chris Finch',
  'New Orleans Pelicans': 'Willie Green',
  'New York Knicks': 'Tom Thibodeau',
  'Oklahoma City Thunder': 'Mark Daigneault',
  'Orlando Magic': 'Jamahl Mosley',
  'Philadelphia 76ers': 'Nick Nurse',
  'Phoenix Suns': 'Mike Budenholzer',
  'Portland Trail Blazers': 'Chauncey Billups',
  'Sacramento Kings': 'Mike Brown',
  'San Antonio Spurs': 'Gregg Popovich',
  'Toronto Raptors': 'Darko Rajaković',
  'Utah Jazz': 'Will Hardy',
  'Washington Wizards': 'Brian Keefe'
};

function convertMasterRoster() {
  try {
    // Read the master roster file
    const masterContent = fs.readFileSync(masterRosterPath, 'utf8');
    const lines = masterContent.split('\n').filter(line => line.trim());
    
    // Skip the header line
    const rosterLines = lines.slice(1);
    
    // Group players by team
    const teams = {};
    
    rosterLines.forEach(line => {
      const [team, player, jersey, position] = line.split(',').map(item => item.trim());
      
      if (!teams[team]) {
        teams[team] = [];
      }
      
      teams[team].push({
        name: player,
        jersey: jersey,
        position: position
      });
    });
    
    // Create JSON files for each team
    Object.keys(teams).forEach(teamName => {
      const fileName = teamName.toLowerCase().replace(/\s+/g, '-') + '-current.json';
      const filePath = path.join(teamsDir, fileName);
      
      const teamData = {
        coach: coaches[teamName] || 'TBD',
        players: teams[teamName]
      };
      
      fs.writeFileSync(filePath, JSON.stringify(teamData, null, 2));
      console.log(`✅ Created: ${fileName}`);
    });
    
    console.log(`\n🎉 Successfully converted master roster to ${Object.keys(teams).length} team JSON files!`);
    
  } catch (error) {
    console.error('❌ Error converting master roster:', error);
  }
}

// Run the conversion
convertMasterRoster(); 