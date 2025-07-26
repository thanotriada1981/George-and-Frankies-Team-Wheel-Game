# 🏀 NBA Database Management System - Usage Guide

## 📋 Overview

This system provides comprehensive tools for managing NBA player data, including:
- **2K Ratings Integration** - Scrape and integrate player ratings from 2kratings.com
- **Database Updates** - Handle trades, rating changes, and new players
- **Data Integrity** - Maintain backups and audit trails
- **Automated Processing** - Batch updates and validation

---

## 🛠️ Available Scripts

### 1. **Master Database Updater** (`master-database-updater.js`)
**Purpose**: Comprehensive database management with trade handling and rating updates

**Key Features**:
- Update existing players with new ratings/teams
- Handle player trades between teams
- Update ratings based on performance
- Maintain data integrity and backups
- Audit trail for all changes

**Usage**:
```javascript
const MasterDatabaseUpdater = require('./master-database-updater.js');
const updater = new MasterDatabaseUpdater();

// Initialize
await updater.initialize();

// Update player with new 2K data
updater.updatePlayer("Stephen Curry", "Golden State Warriors", scrapedData);

// Handle trade
updater.handleTrade("Player Name", "Old Team", "New Team");

// Update ratings
updater.updatePlayerRatings("Player Name", "Team Name", 95, newAttributes);

// Save changes
updater.saveDatabase();
```

### 2. **Missing Data Populator** (`populate-missing-data.js`)
**Purpose**: Identify and populate missing age and rating data

**Key Features**:
- Scan for missing age/rating data
- Generate templates for manual entry
- Batch update capabilities
- Data completeness reporting

**Usage**:
```javascript
const MissingDataPopulator = require('./populate-missing-data.js');
const populator = new MissingDataPopulator();

// Initialize and scan
await populator.initialize();
populator.scanForMissingData();

// Generate report
populator.generateReport();

// Batch update
const updates = [
    {
        team: "Golden State Warriors",
        player: "Stephen Curry",
        age: 36,
        nba2k26Rating: 96
    }
];
populator.batchUpdate(updates);
populator.saveDatabase();
```

### 3. **2K Data Integrator** (`integrate-2k-data.js`)
**Purpose**: Integrate scraped 2K ratings data with existing database

**Key Features**:
- Merge scraped data with existing player records
- Handle new player additions
- Maintain data consistency
- Integration reporting

**Usage**:
```javascript
const TwoKDataIntegrator = require('./integrate-2k-data.js');
const integrator = new TwoKDataIntegrator();

// Initialize
await integrator.initialize();

// Integrate scraped data
integrator.integratePlayerData(scrapedData);

// Update team stats
integrator.updateTeamStats();

// Generate report and save
integrator.generateReport();
integrator.saveDatabase();
```

---

## 🔄 Workflow Examples

### **Scenario 1: Adding 2K Ratings to Existing Players**

1. **Scrape player data** from 2kratings.com using the individual player scraper
2. **Integrate the data** using the 2K Data Integrator
3. **Update team statistics** automatically
4. **Generate integration report**

```javascript
// Example workflow
const integrator = new TwoKDataIntegrator();
await integrator.initialize();

// For each scraped player
integrator.integratePlayerData(scrapedPlayerData);
integrator.updateTeamStats();
integrator.saveDatabase();
```

### **Scenario 2: Handling Player Trades**

1. **Use Master Database Updater** to process the trade
2. **Update player's team** information
3. **Recalculate team statistics** for both teams
4. **Maintain audit trail**

```javascript
const updater = new MasterDatabaseUpdater();
await updater.initialize();

// Process trade
updater.handleTrade("Player Name", "Old Team", "New Team");
updater.saveDatabase();
```

### **Scenario 3: Updating Player Ratings**

1. **Scrape new ratings** from 2kratings.com
2. **Update player ratings** using Master Database Updater
3. **Update team statistics**
4. **Generate change report**

```javascript
const updater = new MasterDatabaseUpdater();
await updater.initialize();

// Update ratings
updater.updatePlayerRatings("Player Name", "Team Name", newRating, newAttributes);
updater.saveDatabase();
```

---

## 📊 Data Structure

### **Player Object Structure**:
```json
{
  "name": "Stephen Curry",
  "jerseyNumber": "30",
  "position": "PG",
  "age": 36,
  "nba2k26Rating": 96,
  "team": "Golden State Warriors",
  "height": "6'3\"",
  "weight": "185 lbs",
  "experience": "15",
  "college": "Davidson",
  "draft_info": "2009 1st Round (7th overall)",
  "detailedAttributes": {
    "three_point_shot": 99,
    "mid_range_shot": 88,
    "free_throw": 92
  },
  "badges": {
    "hall_of_fame": ["Limitless Range"],
    "gold": ["Quick First Step"],
    "silver": ["Clamps"],
    "bronze": ["Brick Wall"]
  },
  "physicalStats": {
    "height": "6'3\"",
    "weight": "185 lbs",
    "wingspan": "6'4\""
  },
  "lastUpdated": "2025-07-25T19:30:00.000Z",
  "dataSource": "2K Ratings Integration"
}
```

### **Team Object Structure**:
```json
{
  "id": "warriors",
  "name": "Golden State Warriors",
  "city": "Golden State",
  "abbreviation": "GSW",
  "conference": "Western",
  "division": "Pacific",
  "logo": "assets/logos/nba/golden_state_warriors.svg",
  "primaryColor": "#1D428A",
  "secondaryColor": "#FFC72C",
  "headCoach": "Steve Kerr",
  "lastUpdated": "2025-07-25T19:30:00.000Z",
  "roster": {
    "players": [...],
    "teamStats": {
      "playerCount": 15,
      "averageRating": 76.7,
      "averageAge": 28.3,
      "highestRated": {...},
      "lowestRated": {...},
      "lastUpdated": "2025-07-25T19:30:00.000Z"
    }
  }
}
```

---

## 🔧 Maintenance Tasks

### **Regular Updates**:
1. **Weekly**: Scrape and integrate new 2K ratings
2. **Trade Deadline**: Process all trades using batch operations
3. **Monthly**: Generate completeness reports and identify missing data
4. **Quarterly**: Full database backup and validation

### **Backup Management**:
- Automatic backups before major updates
- Manual backup creation for rollback capability
- Integration logs for audit trails

### **Data Validation**:
- Check for missing required fields
- Validate rating ranges (50-99)
- Ensure team consistency
- Verify player uniqueness

---

## 🚨 Error Handling

### **Common Issues**:
1. **Team not found**: Verify team name matches database
2. **Player not found**: Check spelling and team assignment
3. **Invalid ratings**: Ensure ratings are between 50-99
4. **Data corruption**: Use rollback to restore from backup

### **Recovery Procedures**:
```javascript
// Rollback to backup
const updater = new MasterDatabaseUpdater();
updater.rollbackToBackup();

// Validate data integrity
const populator = new MissingDataPopulator();
populator.scanForMissingData();
populator.generateReport();
```

---

## 📈 Performance Optimization

### **Batch Operations**:
- Process multiple players at once
- Update team stats after batch completion
- Use transaction-like operations for data consistency

### **Memory Management**:
- Load only necessary data for operations
- Clear integration logs periodically
- Optimize backup storage

---

## 🎯 Best Practices

1. **Always backup** before major updates
2. **Validate data** before integration
3. **Use batch operations** for multiple updates
4. **Generate reports** after significant changes
5. **Maintain audit trails** for all modifications
6. **Test changes** on a copy before production

---

## 📞 Support

For issues or questions:
1. Check the integration logs for error details
2. Use the rollback function to restore from backup
3. Generate reports to identify data inconsistencies
4. Validate data structure before processing

---

## 🔄 Future Enhancements

### **Planned Features**:
- **Automated scraping** with scheduled updates
- **Real-time trade monitoring** and alerts
- **Advanced analytics** and team comparison tools
- **API integration** for external data sources
- **Machine learning** for rating predictions

### **Integration Opportunities**:
- ESPN API for real-time stats
- NBA.com for official roster updates
- Social media feeds for trade rumors
- Sports betting APIs for performance metrics 