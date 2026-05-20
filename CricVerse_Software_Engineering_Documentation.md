# CricVerse - Software Engineering Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Use Case Diagram](#use-case-diagram)
3. [Class Diagram](#class-diagram)
4. [Interaction Diagrams](#interaction-diagrams)
5. [Activity Diagrams](#activity-diagrams)
6. [Database Design](#database-design)
7. [Data Dictionary](#data-dictionary)
8. [Coding Standards](#coding-standards)

---

## Project Overview

**CricVerse** is a comprehensive cricket scoring and management web application built with Next.js 16, React 19, and modern UI libraries. It provides features for:

- **Match Management**: Create, configure, and score cricket matches
- **Team Management**: Register teams, manage rosters, and track player statistics
- **Tournament Management**: Organize leagues, cups, and series
- **Live Scoring**: Real-time match scoring with keyboard shortcuts
- **Leaderboards**: Track player and team statistics across different formats
- **E-commerce Store**: Purchase cricket equipment and merchandise
- **Shopping Cart**: Manage product selections with context-based state

**Technology Stack**:
- Frontend: Next.js 16.1.1, React 19.2.3
- UI Framework: Radix UI, TailwindCSS 4, Framer Motion
- Form Management: React Hook Form, Zod validation
- Charts: Recharts
- State Management: React Context API

---

## Use Case Diagram

```mermaid
graph TB
    subgraph "CricVerse System"
        UC1[Create Match]
        UC2[Configure Match Settings]
        UC3[Conduct Toss]
        UC4[Select Players]
        UC5[Score Match]
        UC6[View Match Statistics]
        UC7[Register Team]
        UC8[Manage Team Roster]
        UC9[View Team Details]
        UC10[Create Tournament]
        UC11[Manage Tournament]
        UC12[Schedule Fixtures]
        UC13[View Leaderboard]
        UC14[Browse Store]
        UC15[Add to Cart]
        UC16[Manage Cart]
        UC17[View Notifications]
        UC18[View Dashboard]
    end
    
    User((User/Scorer))
    Admin((Admin))
    TeamManager((Team Manager))
    Customer((Customer))
    
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC13
    User --> UC17
    User --> UC18
    
    TeamManager --> UC7
    TeamManager --> UC8
    TeamManager --> UC9
    
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    
    Customer --> UC14
    Customer --> UC15
    Customer --> UC16
    
    UC1 ..> UC2 : <<include>>
    UC1 ..> UC3 : <<include>>
    UC3 ..> UC4 : <<extend>>
    UC4 ..> UC5 : <<extend>>
    UC5 ..> UC6 : <<include>>
```

### Use Case Descriptions

| Use Case ID | Use Case Name | Description | Actors |
|-------------|---------------|-------------|--------|
| UC1 | Create Match | Create a new cricket match between two teams | User, Scorer |
| UC2 | Configure Match Settings | Set match type, overs, ball type, pitch type, venue, and date | User |
| UC3 | Conduct Toss | Flip coin and record toss winner and decision | User |
| UC4 | Select Players | Choose striker, non-striker, and bowler to start innings | User |
| UC5 | Score Match | Record runs, wickets, extras during live match | Scorer |
| UC6 | View Match Statistics | View scorecard, run rate, player stats, and graphs | User |
| UC7 | Register Team | Create a new team with name, captain, and players | Team Manager |
| UC8 | Manage Team Roster | Add/remove players, update team details | Team Manager |
| UC9 | View Team Details | View team statistics, wins, losses, and roster | User |
| UC10 | Create Tournament | Set up a new tournament with format and teams | Admin |
| UC11 | Manage Tournament | Update tournament settings, teams, and status | Admin |
| UC12 | Schedule Fixtures | Create match fixtures for tournament | Admin |
| UC13 | View Leaderboard | View player/team rankings by format | User |
| UC14 | Browse Store | View cricket equipment and merchandise | Customer |
| UC15 | Add to Cart | Add products to shopping cart | Customer |
| UC16 | Manage Cart | Update quantities, remove items from cart | Customer |
| UC17 | View Notifications | View system notifications and updates | User |
| UC18 | View Dashboard | View overview of matches, tournaments, and stats | User |

---

## Class Diagram

```mermaid
classDiagram
    class Match {
        +String id
        +String teamA
        +String teamB
        +String venue
        +Number overs
        +Number oversPerBowler
        +Date date
        +String matchType
        +String ballType
        +String pitchType
        +String tossWinner
        +String tossDecision
        +String status
        +createMatch()
        +startMatch()
        +endMatch()
        +getMatchDetails()
    }
    
    class Team {
        +String id
        +String name
        +String captain
        +Number players
        +String logo
        +String color
        +Stats stats
        +createTeam()
        +updateTeam()
        +addPlayer()
        +removePlayer()
        +getTeamStats()
    }
    
    class Player {
        +String id
        +String name
        +String teamId
        +String role
        +BattingStats battingStats
        +BowlingStats bowlingStats
        +updateStats()
        +getPlayerProfile()
    }
    
    class BattingStats {
        +Number runs
        +Number balls
        +Number matches
        +Number average
        +Number strikeRate
        +Number hundreds
        +Number fifties
        +calculateAverage()
        +calculateStrikeRate()
    }
    
    class BowlingStats {
        +Number wickets
        +Number matches
        +Number average
        +Number economy
        +String bestFigures
        +calculateEconomy()
        +calculateAverage()
    }
    
    class Score {
        +String matchId
        +Number runs
        +Number wickets
        +Number overs
        +Number balls
        +addRun()
        +addWicket()
        +addExtra()
        +getCurrentRunRate()
    }
    
    class Innings {
        +String id
        +String matchId
        +String battingTeam
        +String bowlingTeam
        +Player striker
        +Player nonStriker
        +Player bowler
        +Score score
        +Ball[] ballHistory
        +startInnings()
        +endInnings()
        +switchStrike()
    }
    
    class Ball {
        +Number over
        +Number ballNumber
        +Number runs
        +String type
        +Boolean isWicket
        +String extras
        +recordBall()
    }
    
    class Tournament {
        +String id
        +String name
        +String status
        +Number teams
        +Date startDate
        +String type
        +Team[] participatingTeams
        +Match[] fixtures
        +createTournament()
        +addTeam()
        +scheduleMatch()
        +updateStatus()
    }
    
    class Leaderboard {
        +String format
        +String category
        +Player[] playerRankings
        +Team[] teamRankings
        +updateRankings()
        +getTopPlayers()
        +getTopTeams()
    }
    
    class Product {
        +String id
        +String name
        +String description
        +Number price
        +String category
        +String image
        +Number stock
        +getProductDetails()
        +updateStock()
    }
    
    class CartItem {
        +String productId
        +Number quantity
        +Number price
        +updateQuantity()
        +removeItem()
        +getSubtotal()
    }
    
    class Cart {
        +String userId
        +CartItem[] items
        +Number total
        +addItem()
        +removeItem()
        +updateQuantity()
        +clearCart()
        +calculateTotal()
    }
    
    class Notification {
        +String id
        +String type
        +String title
        +String message
        +Date timestamp
        +Boolean read
        +markAsRead()
    }
    
    Match "1" --> "2" Team : involves
    Match "1" --> "1..*" Innings : contains
    Innings "1" --> "1..*" Ball : records
    Innings "1" --> "1" Score : tracks
    Innings "1" --> "3" Player : requires
    Team "1" --> "*" Player : has
    Player "1" --> "1" BattingStats : has
    Player "1" --> "1" BowlingStats : has
    Tournament "1" --> "*" Team : includes
    Tournament "1" --> "*" Match : schedules
    Leaderboard "1" --> "*" Player : ranks
    Leaderboard "1" --> "*" Team : ranks
    Cart "1" --> "*" CartItem : contains
    CartItem "*" --> "1" Product : references
```

---

## Interaction Diagrams

### Sequence Diagram 1: Create and Start Match Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Match Create Page
    participant Form as React Hook Form
    participant Validation as Zod Schema
    participant State as React State
    participant Router as Next.js Router
    
    User->>UI: Navigate to /matches/create
    UI->>Form: Initialize form with defaults
    
    User->>UI: Select Team A
    UI->>Form: Update teamA field
    Form->>Validation: Validate selection
    
    User->>UI: Select Team B
    UI->>Form: Update teamB field
    Form->>Validation: Validate selection
    
    User->>UI: Configure match settings
    UI->>Form: Update overs, venue, date, etc.
    Form->>Validation: Validate all fields
    
    User->>UI: Click "Next: Toss"
    Form->>Validation: Trigger validation
    Validation-->>Form: Validation success
    Form->>State: setStep(2)
    UI->>UI: Show toss interface
    
    User->>UI: Select toss winner
    UI->>Form: Update tossWinner
    
    User->>UI: Select toss decision
    UI->>Form: Update tossDecision
    
    User->>UI: Flip coin (optional)
    UI->>State: setCoinFlipping(true)
    State->>State: Simulate 3s animation
    State->>State: setCoinResult(random)
    UI->>UI: Display coin result
    
    User->>UI: Click "Start Match"
    Form->>Validation: Final validation
    Validation-->>Form: All valid
    Form->>Form: onSubmit(values)
    Form->>State: Generate matchId
    UI->>UI: Show success toast
    Router->>Router: Navigate to /matches/[id]/start-innings
```

### Sequence Diagram 2: Live Match Scoring Flow

```mermaid
sequenceDiagram
    actor Scorer
    participant UI as Score Page
    participant State as Match State
    participant Toast as Toast Notification
    participant Chart as Recharts
    
    Scorer->>UI: Navigate to /matches/[id]/score
    UI->>State: Load match data
    State-->>UI: Display current score
    
    Scorer->>UI: Press "4" key or click 4 button
    UI->>State: addRun(4)
    State->>State: Update score.runs += 4
    State->>State: Update striker.runs += 4
    State->>State: Update striker.balls += 1
    State->>State: Update score.overs += 0.1
    State-->>UI: Re-render with new state
    UI->>Toast: Show "FOUR Runs!" notification
    UI->>Chart: Update run rate graph
    
    Scorer->>UI: Press "W" key or click OUT
    UI->>State: addRun(0, "wicket")
    State->>State: Update score.wickets += 1
    State-->>UI: Re-render
    UI->>Toast: Show "WICKET!" notification
    
    Scorer->>UI: Click "Undo Last Ball"
    UI->>State: Revert last ball
    State->>State: Restore previous state
    State-->>UI: Update display
    
    Scorer->>UI: Click "End Over"
    UI->>State: Complete over
    State->>State: Reset ball count
    State->>UI: Prompt for bowler change
```

### Sequence Diagram 3: Shopping Cart Management

```mermaid
sequenceDiagram
    actor Customer
    participant Store as Store Page
    participant Product as Product Card
    participant Context as CartContext
    participant Sidebar as CartSidebar
    participant State as Cart State
    
    Customer->>Store: Browse products
    Store->>Product: Display product list
    
    Customer->>Product: Click "Add to Cart"
    Product->>Context: addToCart(product)
    Context->>State: Check if item exists
    alt Item exists
        State->>State: Increment quantity
    else Item doesn't exist
        State->>State: Add new item
    end
    State->>State: Recalculate total
    Context-->>Product: Update complete
    Product->>Product: Show success feedback
    
    Customer->>Store: Click cart icon
    Store->>Sidebar: Open cart sidebar
    Sidebar->>Context: Get cart items
    Context-->>Sidebar: Return items array
    Sidebar->>Sidebar: Display items
    
    Customer->>Sidebar: Update quantity
    Sidebar->>Context: updateQuantity(id, newQty)
    Context->>State: Update item quantity
    State->>State: Recalculate total
    State-->>Sidebar: Refresh display
    
    Customer->>Sidebar: Remove item
    Sidebar->>Context: removeFromCart(id)
    Context->>State: Filter out item
    State->>State: Recalculate total
    State-->>Sidebar: Refresh display
```

---

## Activity Diagrams

### Activity Diagram 1: Match Creation Process

```mermaid
flowchart TD
    Start([User Starts Match Creation]) --> SelectTeamA[Select Team A]
    SelectTeamA --> CheckTeamA{Team A Selected?}
    CheckTeamA -->|No| SelectTeamA
    CheckTeamA -->|Yes| SelectTeamB[Select Team B]
    
    SelectTeamB --> CheckTeamB{Team B Selected?}
    CheckTeamB -->|No| SelectTeamB
    CheckTeamB -->|Yes| CheckSameTeam{Teams Different?}
    
    CheckSameTeam -->|No| ShowError[Show Error: Teams Must Be Different]
    ShowError --> SelectTeamB
    CheckSameTeam -->|Yes| ConfigureMatch[Configure Match Settings]
    
    ConfigureMatch --> SetMatchType[Set Match Type]
    SetMatchType --> SetOvers[Set Number of Overs]
    SetOvers --> SetBallType[Set Ball Type]
    SetBallType --> SetPitchType[Set Pitch Type]
    SetPitchType --> SetVenue[Set Venue]
    SetVenue --> SetDate[Set Match Date]
    
    SetDate --> ValidateConfig{All Fields Valid?}
    ValidateConfig -->|No| ConfigureMatch
    ValidateConfig -->|Yes| NextToToss[Proceed to Toss]
    
    NextToToss --> SelectTossWinner[Select Toss Winner]
    SelectTossWinner --> SelectDecision[Select Bat/Bowl Decision]
    SelectDecision --> OptionalFlip{Flip Coin?}
    
    OptionalFlip -->|Yes| AnimateCoin[Animate Coin Flip 3s]
    AnimateCoin --> ShowResult[Display Result]
    ShowResult --> ValidateToss
    OptionalFlip -->|No| ValidateToss{Toss Data Complete?}
    
    ValidateToss -->|No| SelectTossWinner
    ValidateToss -->|Yes| CreateMatch[Create Match Record]
    CreateMatch --> GenerateID[Generate Match ID]
    GenerateID --> ShowSuccess[Show Success Toast]
    ShowSuccess --> Navigate[Navigate to Player Selection]
    Navigate --> End([End])
```

### Activity Diagram 2: Live Scoring Workflow

```mermaid
flowchart TD
    Start([Match Scoring Begins]) --> LoadMatch[Load Match Data]
    LoadMatch --> DisplayScore[Display Current Score]
    DisplayScore --> WaitInput[Wait for Scorer Input]
    
    WaitInput --> InputReceived{Input Type?}
    
    InputReceived -->|0-3 Runs| AddRuns[Add Runs to Score]
    InputReceived -->|4 Runs| AddFour[Add Four]
    InputReceived -->|6 Runs| AddSix[Add Six]
    InputReceived -->|Wicket| RecordWicket[Record Wicket]
    InputReceived -->|Wide/No Ball| AddExtra[Add Extra]
    InputReceived -->|Undo| UndoBall[Revert Last Ball]
    InputReceived -->|End Over| CompleteOver[Complete Over]
    
    AddRuns --> UpdateStriker[Update Striker Stats]
    AddFour --> UpdateStriker
    AddSix --> UpdateStriker
    
    UpdateStriker --> UpdateBalls[Increment Balls Faced]
    UpdateBalls --> UpdateOvers[Update Over Count]
    UpdateOvers --> CheckStrike{Odd Runs?}
    CheckStrike -->|Yes| SwitchStrike[Switch Strike]
    CheckStrike -->|No| KeepStrike[Keep Strike]
    SwitchStrike --> ShowToast
    KeepStrike --> ShowToast[Show Toast Notification]
    
    RecordWicket --> IncrementWickets[Increment Wickets]
    IncrementWickets --> CheckAllOut{All Out?}
    CheckAllOut -->|Yes| EndInnings[End Innings]
    CheckAllOut -->|No| PromptNewBatsman[Prompt for New Batsman]
    PromptNewBatsman --> ShowToast
    
    AddExtra --> AddExtraRun[Add Extra Run]
    AddExtraRun --> NoBallIncrement{No Ball?}
    NoBallIncrement -->|Yes| ShowToast
    NoBallIncrement -->|No| UpdateOvers
    
    UndoBall --> RestoreState[Restore Previous State]
    RestoreState --> ShowToast
    
    CompleteOver --> CheckOversComplete{Overs Complete?}
    CheckOversComplete -->|Yes| EndInnings
    CheckOversComplete -->|No| PromptBowler[Prompt for New Bowler]
    PromptBowler --> ShowToast
    
    ShowToast --> UpdateChart[Update Run Rate Chart]
    UpdateChart --> RefreshUI[Refresh UI]
    RefreshUI --> WaitInput
    
    EndInnings --> SaveMatch[Save Match Data]
    SaveMatch --> ShowSummary[Show Match Summary]
    ShowSummary --> End([End])
```

### Activity Diagram 3: Team Registration Process

```mermaid
flowchart TD
    Start([User Starts Team Registration]) --> EnterName[Enter Team Name]
    EnterName --> ValidateName{Name Valid?}
    ValidateName -->|No| ShowNameError[Show Validation Error]
    ShowNameError --> EnterName
    ValidateName -->|Yes| SelectCaptain[Select Team Captain]
    
    SelectCaptain --> AddPlayers[Add Team Players]
    AddPlayers --> EnterPlayerName[Enter Player Name]
    EnterPlayerName --> SelectRole[Select Player Role]
    SelectRole --> AddToRoster[Add to Roster]
    AddToRoster --> CheckMore{Add More Players?}
    CheckMore -->|Yes| EnterPlayerName
    CheckMore -->|No| ValidateRoster{Min Players Met?}
    
    ValidateRoster -->|No| ShowRosterError[Show Error: Minimum Players Required]
    ShowRosterError --> AddPlayers
    ValidateRoster -->|Yes| UploadLogo[Upload Team Logo Optional]
    
    UploadLogo --> SelectColor[Select Team Color]
    SelectColor --> ReviewTeam[Review Team Details]
    ReviewTeam --> ConfirmCreate{Confirm Creation?}
    
    ConfirmCreate -->|No| EditDetails[Edit Details]
    EditDetails --> ReviewTeam
    ConfirmCreate -->|Yes| CreateTeam[Create Team Record]
    
    CreateTeam --> GenerateTeamID[Generate Team ID]
    GenerateTeamID --> SaveToDB[Save to Database]
    SaveToDB --> ShowSuccess[Show Success Message]
    ShowSuccess --> Navigate[Navigate to Teams Page]
    Navigate --> End([End])
```

---

## Database Design

### MongoDB Collections Overview

CricVerse uses **MongoDB** as its NoSQL database. MongoDB stores data in flexible, JSON-like documents, making it ideal for cricket match data with varying structures and embedded relationships.

### Collection Structure Diagram

```mermaid
graph TB
    subgraph "Core Collections"
        Users[Users Collection]
        Teams[Teams Collection]
        Players[Players Collection]
        Matches[Matches Collection]
        Tournaments[Tournaments Collection]
    end
    
    subgraph "Match Data Collections"
        Innings[Innings Collection]
        Balls[Balls Collection]
    end
    
    subgraph "E-commerce Collections"
        Products[Products Collection]
        Carts[Carts Collection]
        Orders[Orders Collection]
    end
    
    subgraph "System Collections"
        Notifications[Notifications Collection]
    end
    
    Users -->|creates| Teams
    Users -->|organizes| Matches
    Users -->|receives| Notifications
    Users -->|has| Carts
    
    Teams -->|contains embedded| Players
    Teams -->|participates in| Matches
    Teams -->|enrolled in| Tournaments
    
    Matches -->|references| Teams
    Matches -->|contains embedded| Innings
    Matches -->|part of| Tournaments
    
    Innings -->|contains embedded| Balls
    
    Carts -->|references| Products
    Orders -->|references| Products
```

### MongoDB Schema Design

#### 1. Users Collection

```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",           // Unique, indexed
  username: "cricketfan123",           // Unique, indexed
  passwordHash: "hashed_password",
  fullName: "John Doe",
  role: "user",                        // Enum: "user", "admin", "scorer"
  profile: {
    avatar: "https://...",
    phone: "+91-9876543210",
    dateOfBirth: ISODate("1995-05-15")
  },
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
}
```

**Indexes:**
- `{ email: 1 }` - Unique
- `{ username: 1 }` - Unique
- `{ createdAt: -1 }`

---

#### 2. Teams Collection

```javascript
{
  _id: ObjectId("..."),
  name: "Royal Strikers",              // Unique, indexed
  captain: "Virat K.",
  logoUrl: "https://...",
  color: "from-yellow-400 to-orange-500",
  status: "active",                    // Enum: "active", "inactive"
  createdBy: ObjectId("user_id"),      // Reference to Users
  
  // Embedded players array
  players: [
    {
      playerId: ObjectId("..."),       // Reference to Players collection
      name: "Virat K.",
      role: "batsman",                 // Enum: "batsman", "bowler", "all-rounder", "wicket-keeper"
      battingStyle: "right-handed",
      bowlingStyle: "medium-pace",
      dateOfBirth: ISODate("1988-11-05"),
      jerseyNumber: 18
    },
    // ... more players
  ],
  
  // Embedded statistics by format
  stats: {
    leather: {
      matchesPlayed: 12,
      matchesWon: 10,
      matchesLost: 2,
      matchesDrawn: 0,
      points: 20,
      netRunRate: 1.45
    },
    tennis: {
      matchesPlayed: 8,
      matchesWon: 6,
      matchesLost: 2,
      points: 12,
      netRunRate: 0.85
    }
  },
  
  createdAt: ISODate("2024-01-10T08:00:00Z"),
  updatedAt: ISODate("2024-02-01T15:30:00Z")
}
```

**Indexes:**
- `{ name: 1 }` - Unique
- `{ createdBy: 1 }`
- `{ "players.playerId": 1 }`
- `{ status: 1, createdAt: -1 }`

---

#### 3. Players Collection

```javascript
{
  _id: ObjectId("..."),
  name: "Virat Kohli",
  teamId: ObjectId("team_id"),         // Reference to Teams
  role: "batsman",
  battingStyle: "right-handed",
  bowlingStyle: "medium-pace",
  dateOfBirth: ISODate("1988-11-05"),
  
  // Embedded batting statistics by format
  battingStats: {
    leather: {
      matches: 12,
      runs: 856,
      balls: 590,
      average: 71.33,
      strikeRate: 145.08,
      hundreds: 3,
      fifties: 4,
      highestScore: 124,
      fours: 95,
      sixes: 42
    },
    tennis: {
      matches: 8,
      runs: 645,
      balls: 368,
      average: 80.62,
      strikeRate: 175.27,
      hundreds: 4,
      fifties: 2,
      highestScore: 98
    }
  },
  
  // Embedded bowling statistics by format
  bowlingStats: {
    leather: {
      matches: 12,
      wickets: 2,
      runsConceded: 45,
      overs: 8,
      average: 22.50,
      economy: 5.62,
      bestFigures: "1/12"
    }
  },
  
  createdAt: ISODate("2024-01-10T08:15:00Z"),
  updatedAt: ISODate("2024-02-01T18:45:00Z")
}
```

**Indexes:**
- `{ teamId: 1 }`
- `{ name: 1 }`
- `{ "battingStats.leather.runs": -1 }`
- `{ "bowlingStats.leather.wickets": -1 }`

---

#### 4. Matches Collection

```javascript
{
  _id: ObjectId("..."),
  matchNumber: "M-2024-001",           // Unique identifier
  
  // Team references
  teamA: {
    teamId: ObjectId("team_a_id"),
    name: "Royal Strikers",
    logo: "https://..."
  },
  teamB: {
    teamId: ObjectId("team_b_id"),
    name: "Thunder XI",
    logo: "https://..."
  },
  
  // Match configuration
  venue: "Wankhede Stadium, Mumbai",
  matchDate: ISODate("2024-02-05T14:30:00Z"),
  totalOvers: 20,
  oversPerBowler: 4,
  matchType: "Limited Overs",          // Enum: "Limited Overs", "Test Match", etc.
  ballType: "tennis",                  // Enum: "tennis", "leather", "other"
  pitchType: "concrete",               // Enum: "rough", "cement", "turf", "astroturf", "matting"
  
  // Toss information
  toss: {
    winner: "Royal Strikers",
    decision: "bat"                    // Enum: "bat", "bowl"
  },
  
  // Match status and result
  status: "completed",                 // Enum: "scheduled", "live", "completed", "abandoned"
  result: {
    winner: ObjectId("team_a_id"),
    winnerName: "Royal Strikers",
    margin: "24 runs",
    manOfTheMatch: {
      playerId: ObjectId("..."),
      name: "Virat K.",
      performance: "45 runs off 32 balls"
    }
  },
  
  // Embedded innings data
  innings: [
    {
      inningsNumber: 1,
      battingTeam: {
        teamId: ObjectId("team_a_id"),
        name: "Royal Strikers"
      },
      bowlingTeam: {
        teamId: ObjectId("team_b_id"),
        name: "Thunder XI"
      },
      
      // Current score
      score: {
        runs: 145,
        wickets: 3,
        overs: 20,
        balls: 0,
        runRate: 7.25,
        extras: {
          wides: 4,
          noBalls: 2,
          byes: 1,
          legByes: 0,
          total: 7
        }
      },
      
      // Current players (for live matches)
      currentPlayers: {
        striker: {
          playerId: ObjectId("..."),
          name: "Virat K.",
          runs: 45,
          balls: 32,
          fours: 4,
          sixes: 2
        },
        nonStriker: {
          playerId: ObjectId("..."),
          name: "Rohit S.",
          runs: 12,
          balls: 8
        },
        bowler: {
          playerId: ObjectId("..."),
          name: "Bumrah",
          overs: 2.2,
          runs: 18,
          wickets: 1
        }
      },
      
      // Batting scorecard
      batsmen: [
        {
          playerId: ObjectId("..."),
          name: "Virat K.",
          runs: 45,
          balls: 32,
          fours: 4,
          sixes: 2,
          strikeRate: 140.62,
          isOut: false,
          dismissal: null
        },
        {
          playerId: ObjectId("..."),
          name: "Player 2",
          runs: 28,
          balls: 24,
          fours: 3,
          sixes: 1,
          strikeRate: 116.67,
          isOut: true,
          dismissal: {
            type: "caught",
            bowler: "Bumrah",
            fielder: "Sharma"
          }
        }
        // ... more batsmen
      ],
      
      // Bowling figures
      bowlers: [
        {
          playerId: ObjectId("..."),
          name: "Bumrah",
          overs: 4,
          maidens: 0,
          runs: 18,
          wickets: 1,
          economy: 4.50,
          wides: 1,
          noBalls: 0
        }
        // ... more bowlers
      ],
      
      // Ball-by-ball data (embedded for recent overs, or reference to Balls collection)
      ballHistory: [
        {
          overNumber: 1,
          ballNumber: 1,
          batsman: "Virat K.",
          bowler: "Bumrah",
          runs: 4,
          ballType: "legal",           // Enum: "legal", "wide", "no_ball", "bye", "leg_bye"
          isWicket: false,
          extras: null
        }
        // Last 10-20 balls embedded, older balls in separate Balls collection
      ],
      
      status: "completed",
      startedAt: ISODate("2024-02-05T14:45:00Z"),
      endedAt: ISODate("2024-02-05T16:15:00Z")
    },
    // Second innings...
  ],
  
  // Tournament reference (if applicable)
  tournamentId: ObjectId("tournament_id"),
  tournamentName: "Summer Premier League",
  
  // Metadata
  createdBy: ObjectId("user_id"),
  createdAt: ISODate("2024-02-05T10:00:00Z"),
  updatedAt: ISODate("2024-02-05T16:20:00Z")
}
```

**Indexes:**
- `{ matchNumber: 1 }` - Unique
- `{ "teamA.teamId": 1, matchDate: -1 }`
- `{ "teamB.teamId": 1, matchDate: -1 }`
- `{ tournamentId: 1, matchDate: -1 }`
- `{ status: 1, matchDate: -1 }`
- `{ matchDate: -1 }`

---

#### 5. Balls Collection (for detailed ball-by-ball history)

```javascript
{
  _id: ObjectId("..."),
  matchId: ObjectId("match_id"),
  inningsNumber: 1,
  overNumber: 14,
  ballNumber: 2,                       // 1-6 for legal deliveries
  
  batsman: {
    playerId: ObjectId("..."),
    name: "Virat K."
  },
  bowler: {
    playerId: ObjectId("..."),
    name: "Bumrah"
  },
  
  runs: 4,
  ballType: "legal",                   // Enum: "legal", "wide", "no_ball", "bye", "leg_bye"
  isWicket: false,
  wicket: null,                        // If isWicket: true
  /* wicket: {
    dismissedPlayer: ObjectId("..."),
    dismissalType: "caught",           // Enum: "bowled", "caught", "lbw", "run out", etc.
    fielder: "Sharma"
  } */
  
  extras: null,                        // "wide", "no_ball", etc.
  
  recordedAt: ISODate("2024-02-05T15:30:45Z")
}
```

**Indexes:**
- `{ matchId: 1, inningsNumber: 1, overNumber: 1 }`
- `{ matchId: 1, recordedAt: 1 }`

---

#### 6. Tournaments Collection

```javascript
{
  _id: ObjectId("..."),
  name: "Summer Premier League",
  tournamentType: "T20 League",        // Enum: "League", "Knockout", "Round Robin"
  format: "T20",                       // Cricket format
  
  startDate: ISODate("2024-04-01T00:00:00Z"),
  endDate: ISODate("2024-05-15T00:00:00Z"),
  status: "ongoing",                   // Enum: "upcoming", "ongoing", "completed"
  
  maxTeams: 8,
  rules: "Standard T20 rules apply. Each team plays every other team twice.",
  
  // Participating teams with standings
  teams: [
    {
      teamId: ObjectId("team_id"),
      name: "Royal Strikers",
      points: 20,
      matchesPlayed: 12,
      matchesWon: 10,
      matchesLost: 2,
      matchesDrawn: 0,
      netRunRate: 1.45,
      joinedAt: ISODate("2024-03-15T10:00:00Z")
    }
    // ... more teams
  ],
  
  // Match fixtures (references)
  fixtures: [
    {
      matchId: ObjectId("match_id"),
      matchNumber: "M-2024-001",
      teamA: "Royal Strikers",
      teamB: "Thunder XI",
      scheduledDate: ISODate("2024-04-05T14:30:00Z"),
      status: "completed"
    }
    // ... more fixtures
  ],
  
  createdBy: ObjectId("user_id"),
  createdAt: ISODate("2024-03-01T09:00:00Z"),
  updatedAt: ISODate("2024-04-10T18:30:00Z")
}
```

**Indexes:**
- `{ name: 1 }`
- `{ status: 1, startDate: -1 }`
- `{ "teams.teamId": 1 }`

---

#### 7. Products Collection

```javascript
{
  _id: ObjectId("..."),
  name: "Cricket Bat - Professional Grade",
  description: "High-quality English willow cricket bat...",
  price: 4999.00,
  category: "Bats",                    // Enum: "Bats", "Balls", "Protective Gear", etc.
  imageUrl: "https://...",
  stockQuantity: 25,
  isAvailable: true,
  
  specifications: {
    brand: "MRF",
    weight: "1.2 kg",
    size: "Short Handle"
  },
  
  ratings: {
    average: 4.5,
    count: 128
  },
  
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-02-01T12:00:00Z")
}
```

**Indexes:**
- `{ category: 1, isAvailable: 1 }`
- `{ name: "text", description: "text" }` - Text search
- `{ price: 1 }`

---

#### 8. Carts Collection

```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("user_id"),         // Reference to Users
  
  items: [
    {
      productId: ObjectId("product_id"),
      name: "Cricket Bat - Professional Grade",
      imageUrl: "https://...",
      quantity: 2,
      unitPrice: 4999.00,
      subtotal: 9998.00
    },
    {
      productId: ObjectId("product_id_2"),
      name: "Cricket Ball - Leather",
      imageUrl: "https://...",
      quantity: 6,
      unitPrice: 299.00,
      subtotal: 1794.00
    }
  ],
  
  totalAmount: 11792.00,
  
  createdAt: ISODate("2024-02-05T10:00:00Z"),
  updatedAt: ISODate("2024-02-05T10:30:00Z")
}
```

**Indexes:**
- `{ userId: 1 }` - Unique
- `{ "items.productId": 1 }`

---

#### 9. Orders Collection

```javascript
{
  _id: ObjectId("..."),
  orderNumber: "ORD-2024-00123",       // Unique
  userId: ObjectId("user_id"),
  
  items: [
    {
      productId: ObjectId("product_id"),
      name: "Cricket Bat - Professional Grade",
      quantity: 2,
      unitPrice: 4999.00,
      subtotal: 9998.00
    }
    // ... more items
  ],
  
  totalAmount: 11792.00,
  status: "delivered",                 // Enum: "pending", "processing", "shipped", "delivered", "cancelled"
  
  paymentMethod: "credit_card",
  paymentStatus: "paid",
  
  shippingAddress: {
    fullName: "John Doe",
    phone: "+91-9876543210",
    addressLine1: "123 Main Street",
    addressLine2: "Apartment 4B",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    country: "India"
  },
  
  orderedAt: ISODate("2024-02-05T11:00:00Z"),
  shippedAt: ISODate("2024-02-06T09:00:00Z"),
  deliveredAt: ISODate("2024-02-08T15:30:00Z")
}
```

**Indexes:**
- `{ orderNumber: 1 }` - Unique
- `{ userId: 1, orderedAt: -1 }`
- `{ status: 1 }`

---

#### 10. Notifications Collection

```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("user_id"),
  type: "match_result",                // Enum: "match_result", "team_update", "tournament", "order"
  title: "Match Completed",
  message: "Royal Strikers won by 24 runs against Thunder XI",
  
  metadata: {
    matchId: ObjectId("match_id"),
    teamId: ObjectId("team_id")
  },
  
  isRead: false,
  createdAt: ISODate("2024-02-05T16:20:00Z")
}
```

**Indexes:**
- `{ userId: 1, isRead: 1, createdAt: -1 }`
- `{ createdAt: -1 }`

---

### MongoDB Design Patterns Used

#### 1. **Embedding vs Referencing**

**Embedded Documents:**
- Players within Teams (frequently accessed together)
- Innings within Matches (match data is cohesive)
- Ball history within Innings (recent balls)
- Cart items within Carts (always accessed together)
- Statistics within Players (batting/bowling stats)

**References:**
- User references in Teams, Matches (users exist independently)
- Team references in Matches (teams are separate entities)
- Product references in Cart items (products have independent lifecycle)

#### 2. **Denormalization**

Team names and basic info are duplicated in Matches for faster queries without joins. This is acceptable as team names rarely change.

#### 3. **Computed Fields**

Fields like `runRate`, `strikeRate`, `average` are computed and stored for performance, updated when underlying data changes.

#### 4. **Array Fields**

Used for one-to-many relationships that are frequently accessed together:
- `players[]` in Teams
- `innings[]` in Matches
- `items[]` in Carts
- `teams[]` in Tournaments

---

### Database Connection Configuration

```javascript
// lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
```

---

## Data Dictionary

### MongoDB Collections Field Reference

This section provides detailed field descriptions for each MongoDB collection in the CricVerse database.

---

### Users Collection

| Field | Type | Required | Indexed | Description |
|-------|------|----------|---------|-------------|
| _id | ObjectId | Yes | Primary | Unique user identifier (auto-generated) |
| email | String | Yes | Unique | User email address for login |
| username | String | Yes | Unique | Unique username for display |
| passwordHash | String | Yes | No | Bcrypt hashed password |
| fullName | String | Yes | No | User's full display name |
| role | String (Enum) | Yes | No | User role: "user", "admin", "scorer" |
| profile.avatar | String | No | No | URL to user avatar image |
| profile.phone | String | No | No | Contact phone number |
| profile.dateOfBirth | Date | No | No | User's date of birth |
| createdAt | Date | Yes | Yes | Account creation timestamp |
| updatedAt | Date | Yes | No | Last update timestamp |

**Validation Rules:**
- Email must be valid email format
- Username: 3-20 characters, alphanumeric + underscore
- Password: Minimum 8 characters (hashed before storage)

---

### Teams Collection

| Field | Type | Required | Indexed | Description |
|-------|------|----------|---------|-------------|
| _id | ObjectId | Yes | Primary | Unique team identifier |
| name | String | Yes | Unique | Team name (must be unique) |
| captain | String | Yes | No | Team captain's name |
| logoUrl | String | No | No | URL to team logo image |
| color | String | No | No | TailwindCSS gradient classes for team color |
| status | String (Enum) | Yes | Yes | Team status: "active", "inactive" |
| createdBy | ObjectId | Yes | Yes | Reference to Users._id |
| players[] | Array | No | Yes | Embedded array of player objects |
| players[].playerId | ObjectId | Yes | Yes | Reference to Players._id |
| players[].name | String | Yes | No | Player name (denormalized) |
| players[].role | String (Enum) | Yes | No | "batsman", "bowler", "all-rounder", "wicket-keeper" |
| players[].battingStyle | String | No | No | Batting style (e.g., "right-handed") |
| players[].bowlingStyle | String | No | No | Bowling style (e.g., "medium-pace") |
| players[].dateOfBirth | Date | No | No | Player's date of birth |
| players[].jerseyNumber | Number | No | No | Player's jersey number |
| stats.leather | Object | No | No | Team statistics for leather ball format |
| stats.tennis | Object | No | No | Team statistics for tennis ball format |
| stats.*.matchesPlayed | Number | No | No | Total matches played in format |
| stats.*.matchesWon | Number | No | No | Total matches won |
| stats.*.matchesLost | Number | No | No | Total matches lost |
| stats.*.matchesDrawn | Number | No | No | Total matches drawn |
| stats.*.points | Number | No | No | Total points earned |
| stats.*.netRunRate | Number | No | No | Net run rate (NRR) |
| createdAt | Date | Yes | Yes | Team creation timestamp |
| updatedAt | Date | Yes | No | Last update timestamp |

**Validation Rules:**
- Team name: 3-50 characters
- At least 11 players required for a valid team
- Jersey numbers must be unique within team

---

### Players Collection

| Field | Type | Required | Indexed | Description |
|-------|------|----------|---------|-------------|
| _id | ObjectId | Yes | Primary | Unique player identifier |
| name | String | Yes | Yes | Player's full name |
| teamId | ObjectId | Yes | Yes | Reference to Teams._id |
| role | String (Enum) | Yes | No | "batsman", "bowler", "all-rounder", "wicket-keeper" |
| battingStyle | String | No | No | Batting style description |
| bowlingStyle | String | No | No | Bowling style description |
| dateOfBirth | Date | No | No | Player's date of birth |
| battingStats.* | Object | No | Yes | Batting statistics by format (leather, tennis, box) |
| battingStats.*.matches | Number | No | No | Matches played |
| battingStats.*.runs | Number | No | Yes | Total runs scored (indexed for leaderboards) |
| battingStats.*.balls | Number | No | No | Total balls faced |
| battingStats.*.average | Number | No | No | Batting average |
| battingStats.*.strikeRate | Number | No | No | Strike rate |
| battingStats.*.hundreds | Number | No | No | Number of centuries (100+ runs) |
| battingStats.*.fifties | Number | No | No | Number of half-centuries (50-99 runs) |
| battingStats.*.highestScore | Number | No | No | Highest individual score |
| battingStats.*.fours | Number | No | No | Total boundaries (4 runs) |
| battingStats.*.sixes | Number | No | No | Total sixes (6 runs) |
| bowlingStats.* | Object | No | Yes | Bowling statistics by format |
| bowlingStats.*.matches | Number | No | No | Matches played |
| bowlingStats.*.wickets | Number | No | Yes | Total wickets taken (indexed for leaderboards) |
| bowlingStats.*.runsConceded | Number | No | No | Total runs conceded |
| bowlingStats.*.overs | Number | No | No | Total overs bowled |
| bowlingStats.*.average | Number | No | No | Bowling average |
| bowlingStats.*.economy | Number | No | No | Economy rate (runs per over) |
| bowlingStats.*.bestFigures | String | No | No | Best bowling figures (e.g., "5/18") |
| createdAt | Date | Yes | No | Player creation timestamp |
| updatedAt | Date | Yes | No | Last update timestamp |

**Computed Fields:**
- `average` = runs / (matches - not outs)
- `strikeRate` = (runs / balls) × 100
- `economy` = runs conceded / overs

---

### Matches Collection

| Field | Type | Required | Indexed | Description |
|-------|------|----------|---------|-------------|
| _id | ObjectId | Yes | Primary | Unique match identifier |
| matchNumber | String | Yes | Unique | Human-readable match number (e.g., "M-2024-001") |
| teamA.teamId | ObjectId | Yes | Yes | Reference to first team |
| teamA.name | String | Yes | No | Team name (denormalized) |
| teamA.logo | String | No | No | Team logo URL (denormalized) |
| teamB.teamId | ObjectId | Yes | Yes | Reference to second team |
| teamB.name | String | Yes | No | Team name (denormalized) |
| teamB.logo | String | No | No | Team logo URL (denormalized) |
| venue | String | Yes | No | Match venue/location |
| matchDate | Date | Yes | Yes | Scheduled match date and time |
| totalOvers | Number | Yes | No | Total overs per innings |
| oversPerBowler | Number | Yes | No | Maximum overs per bowler |
| matchType | String | Yes | No | Match type (e.g., "Limited Overs", "Test Match") |
| ballType | String (Enum) | Yes | No | "tennis", "leather", "other" |
| pitchType | String (Enum) | Yes | No | "rough", "cement", "turf", "astroturf", "matting" |
| toss.winner | String | Yes | No | Team that won the toss |
| toss.decision | String (Enum) | Yes | No | "bat" or "bowl" |
| status | String (Enum) | Yes | Yes | "scheduled", "live", "completed", "abandoned" |
| result.winner | ObjectId | No | No | Winning team reference |
| result.winnerName | String | No | No | Winning team name |
| result.margin | String | No | No | Victory margin (e.g., "24 runs", "5 wickets") |
| result.manOfTheMatch | Object | No | No | Man of the match details |
| innings[] | Array | No | No | Embedded innings data (1-2 innings) |
| innings[].inningsNumber | Number | Yes | No | 1 or 2 |
| innings[].score.runs | Number | Yes | No | Total runs scored |
| innings[].score.wickets | Number | Yes | No | Total wickets fallen |
| innings[].score.overs | Number | Yes | No | Completed overs |
| innings[].score.balls | Number | Yes | No | Balls in current over (0-5) |
| innings[].score.runRate | Number | Yes | No | Current run rate |
| innings[].batsmen[] | Array | No | No | Batting scorecard |
| innings[].bowlers[] | Array | No | No | Bowling figures |
| innings[].ballHistory[] | Array | No | No | Recent ball-by-ball data (last 10-20 balls) |
| tournamentId | ObjectId | No | Yes | Reference to tournament (if applicable) |
| tournamentName | String | No | No | Tournament name (denormalized) |
| createdBy | ObjectId | Yes | No | User who created the match |
| createdAt | Date | Yes | No | Match creation timestamp |
| updatedAt | Date | Yes | No | Last update timestamp |

**Validation Rules:**
- teamA and teamB must be different
- totalOvers must be positive
- oversPerBowler must be ≤ totalOvers
- Match date cannot be in the past (for creation)

---

### Balls Collection

| Field | Type | Required | Indexed | Description |
|-------|------|----------|---------|-------------|
| _id | ObjectId | Yes | Primary | Unique ball identifier |
| matchId | ObjectId | Yes | Yes | Reference to Matches._id |
| inningsNumber | Number | Yes | Yes | 1 or 2 |
| overNumber | Number | Yes | Yes | Over number (1-based) |
| ballNumber | Number | Yes | No | Ball number in over (1-6 for legal deliveries) |
| batsman.playerId | ObjectId | Yes | No | Batsman on strike |
| batsman.name | String | Yes | No | Batsman name (denormalized) |
| bowler.playerId | ObjectId | Yes | No | Bowler |
| bowler.name | String | Yes | No | Bowler name (denormalized) |
| runs | Number | Yes | No | Runs scored off this ball |
| ballType | String (Enum) | Yes | No | "legal", "wide", "no_ball", "bye", "leg_bye" |
| isWicket | Boolean | Yes | No | Whether a wicket fell |
| wicket.dismissedPlayer | ObjectId | No | No | Player who got out |
| wicket.dismissalType | String | No | No | Type of dismissal |
| wicket.fielder | String | No | No | Fielder involved (if applicable) |
| extras | String | No | No | Extra runs type |
| recordedAt | Date | Yes | Yes | Ball recording timestamp |

**Compound Index:** `{ matchId: 1, inningsNumber: 1, overNumber: 1 }`

---

### Tournaments Collection

| Field | Type | Required | Indexed | Description |
|-------|------|----------|---------|-------------|
| _id | ObjectId | Yes | Primary | Unique tournament identifier |
| name | String | Yes | Yes | Tournament name |
| tournamentType | String | Yes | No | Type (e.g., "T20 League", "Knockout") |
| format | String | Yes | No | Cricket format (T20, ODI, Test) |
| startDate | Date | Yes | Yes | Tournament start date |
| endDate | Date | No | No | Tournament end date |
| status | String (Enum) | Yes | Yes | "upcoming", "ongoing", "completed" |
| maxTeams | Number | Yes | No | Maximum teams allowed |
| rules | String | No | No | Tournament rules description |
| teams[] | Array | No | Yes | Participating teams with standings |
| teams[].teamId | ObjectId | Yes | Yes | Reference to team |
| teams[].name | String | Yes | No | Team name (denormalized) |
| teams[].points | Number | Yes | No | Points earned |
| teams[].matchesPlayed | Number | Yes | No | Matches played |
| teams[].matchesWon | Number | Yes | No | Matches won |
| teams[].matchesLost | Number | Yes | No | Matches lost |
| teams[].matchesDrawn | Number | Yes | No | Matches drawn |
| teams[].netRunRate | Number | Yes | No | Net run rate |
| teams[].joinedAt | Date | Yes | No | Team enrollment date |
| fixtures[] | Array | No | No | Match fixtures (references) |
| fixtures[].matchId | ObjectId | Yes | No | Reference to match |
| fixtures[].matchNumber | String | Yes | No | Match number |
| fixtures[].teamA | String | Yes | No | First team name |
| fixtures[].teamB | String | Yes | No | Second team name |
| fixtures[].scheduledDate | Date | Yes | No | Match scheduled date |
| fixtures[].status | String | Yes | No | Match status |
| createdBy | ObjectId | Yes | No | Tournament creator |
| createdAt | Date | Yes | No | Creation timestamp |
| updatedAt | Date | Yes | No | Last update timestamp |

---

### Products Collection

| Field | Type | Required | Indexed | Description |
|-------|------|----------|---------|-------------|
| _id | ObjectId | Yes | Primary | Unique product identifier |
| name | String | Yes | Text | Product name (text search enabled) |
| description | String | No | Text | Product description (text search enabled) |
| price | Number | Yes | Yes | Product price in currency |
| category | String | Yes | Yes | Product category |
| imageUrl | String | No | No | Product image URL |
| stockQuantity | Number | Yes | No | Available stock count |
| isAvailable | Boolean | Yes | Yes | Product availability flag |
| specifications.brand | String | No | No | Product brand |
| specifications.weight | String | No | No | Product weight |
| specifications.size | String | No | No | Product size |
| ratings.average | Number | No | No | Average rating (1-5) |
| ratings.count | Number | No | No | Number of ratings |
| createdAt | Date | Yes | No | Product creation timestamp |
| updatedAt | Date | Yes | No | Last update timestamp |

**Text Index:** `{ name: "text", description: "text" }`

---

### Carts Collection

| Field | Type | Required | Indexed | Description |
|-------|------|----------|---------|-------------|
| _id | ObjectId | Yes | Primary | Unique cart identifier |
| userId | ObjectId | Yes | Unique | Reference to Users._id (one cart per user) |
| items[] | Array | No | No | Cart items array |
| items[].productId | ObjectId | Yes | Yes | Reference to Products._id |
| items[].name | String | Yes | No | Product name (denormalized) |
| items[].imageUrl | String | No | No | Product image (denormalized) |
| items[].quantity | Number | Yes | No | Item quantity (must be > 0) |
| items[].unitPrice | Number | Yes | No | Price per unit |
| items[].subtotal | Number | Yes | No | Line item total (quantity × unitPrice) |
| totalAmount | Number | Yes | No | Cart total amount |
| createdAt | Date | Yes | No | Cart creation timestamp |
| updatedAt | Date | Yes | No | Last update timestamp |

**Validation Rules:**
- Quantity must be positive integer
- Subtotal must equal quantity × unitPrice
- TotalAmount must equal sum of all subtotals

---

### Orders Collection

| Field | Type | Required | Indexed | Description |
|-------|------|----------|---------|-------------|
| _id | ObjectId | Yes | Primary | Unique order identifier |
| orderNumber | String | Yes | Unique | Human-readable order number |
| userId | ObjectId | Yes | Yes | Reference to Users._id |
| items[] | Array | Yes | No | Ordered items (snapshot from cart) |
| items[].productId | ObjectId | Yes | No | Product reference |
| items[].name | String | Yes | No | Product name at time of order |
| items[].quantity | Number | Yes | No | Ordered quantity |
| items[].unitPrice | Number | Yes | No | Price at time of order |
| items[].subtotal | Number | Yes | No | Line item total |
| totalAmount | Number | Yes | No | Order total amount |
| status | String (Enum) | Yes | Yes | "pending", "processing", "shipped", "delivered", "cancelled" |
| paymentMethod | String | Yes | No | Payment method used |
| paymentStatus | String | Yes | No | Payment status |
| shippingAddress.fullName | String | Yes | No | Recipient name |
| shippingAddress.phone | String | Yes | No | Contact phone |
| shippingAddress.addressLine1 | String | Yes | No | Street address |
| shippingAddress.addressLine2 | String | No | No | Apartment/Suite |
| shippingAddress.city | String | Yes | No | City |
| shippingAddress.state | String | Yes | No | State/Province |
| shippingAddress.pincode | String | Yes | No | Postal code |
| shippingAddress.country | String | Yes | No | Country |
| orderedAt | Date | Yes | Yes | Order placement timestamp |
| shippedAt | Date | No | No | Shipping timestamp |
| deliveredAt | Date | No | No | Delivery timestamp |

---

### Notifications Collection

| Field | Type | Required | Indexed | Description |
|-------|------|----------|---------|-------------|
| _id | ObjectId | Yes | Primary | Unique notification identifier |
| userId | ObjectId | Yes | Yes | Reference to Users._id |
| type | String (Enum) | Yes | No | "match_result", "team_update", "tournament", "order" |
| title | String | Yes | No | Notification title |
| message | String | Yes | No | Notification message body |
| metadata.matchId | ObjectId | No | No | Related match (if applicable) |
| metadata.teamId | ObjectId | No | No | Related team (if applicable) |
| metadata.tournamentId | ObjectId | No | No | Related tournament (if applicable) |
| metadata.orderId | ObjectId | No | No | Related order (if applicable) |
| isRead | Boolean | Yes | Yes | Read status flag |
| createdAt | Date | Yes | Yes | Notification creation timestamp |

**Compound Index:** `{ userId: 1, isRead: 1, createdAt: -1 }`

---

### MongoDB Data Types Reference

| MongoDB Type | JavaScript Type | Description | Example |
|--------------|----------------|-------------|---------|
| ObjectId | ObjectId | 12-byte unique identifier | `ObjectId("507f1f77bcf86cd799439011")` |
| String | String | UTF-8 text | `"Royal Strikers"` |
| Number | Number | 64-bit floating point | `145.5` |
| Boolean | Boolean | True/False | `true` |
| Date | Date | ISODate timestamp | `ISODate("2024-02-05T14:30:00Z")` |
| Array | Array | Ordered list | `[1, 2, 3]` |
| Object | Object | Embedded document | `{ name: "John", age: 30 }` |

---

## Coding Standards

### 1. **File and Folder Structure**

#### Directory Organization
```
CricVerse/
├── app/                          # Next.js App Router pages
│   ├── page.js                   # Dashboard/Home
│   ├── layout.js                 # Root layout
│   ├── globals.css               # Global styles
│   ├── matches/
│   │   ├── page.js              # Match list
│   │   ├── create/page.js       # Create match
│   │   └── [id]/
│   │       ├── score/page.js    # Live scoring
│   │       └── start-innings/page.js
│   ├── teams/
│   ├── tournaments/
│   ├── leaderboard/
│   ├── store/
│   └── profile/
├── components/                   # Reusable React components
│   ├── ui/                      # Base UI components (shadcn/ui)
│   ├── layout/                  # Layout components
│   ├── dashboard/               # Dashboard-specific components
│   ├── teams/                   # Team-related components
│   └── cart/                    # Shopping cart components
├── contexts/                     # React Context providers
│   ├── CartContext.jsx
│   └── ThemeContext.jsx
├── lib/                         # Utility functions and data
│   ├── utils.js                 # Helper functions
│   └── *-data.js                # Mock data files
└── public/                      # Static assets
```

#### Naming Conventions
- **Files**: Use kebab-case for files: `match-create.js`, `team-roster.js`
- **Components**: Use PascalCase: `MatchCard.jsx`, `TeamRoster.jsx`
- **Pages**: Use lowercase with hyphens in folders: `matches/create/page.js`
- **Utilities**: Use camelCase: `calculateRunRate.js`

### 2. **React Component Standards**

#### Component Structure
```javascript
"use client" // Only when needed (client components)

// 1. Imports - grouped and ordered
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// 2. Component definition
export default function ComponentName({ prop1, prop2 }) {
    // 3. State declarations
    const [state, setState] = useState(initialValue);
    
    // 4. Hooks
    useEffect(() => {
        // Effect logic
    }, [dependencies]);
    
    // 5. Event handlers
    const handleClick = () => {
        // Handler logic
    };
    
    // 6. Helper functions
    const calculateValue = (input) => {
        return input * 2;
    };
    
    // 7. JSX return
    return (
        <div className="container">
            {/* Component markup */}
        </div>
    );
}
```

#### Props and State
- Use destructuring for props
- Keep state as close to where it's used as possible
- Use meaningful variable names
- Prefer `const` over `let` unless reassignment is needed

### 3. **Form Handling Standards**

#### React Hook Form with Zod
```javascript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define schema
const formSchema = z.object({
    teamA: z.string({ required_error: "Please select Team A." }),
    overs: z.coerce.number().min(1, "At least 1 over is required"),
    venue: z.string().min(2, "Venue is required."),
});

// Use in component
const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
        teamA: "",
        overs: "20",
        venue: "",
    }
});

function onSubmit(values) {
    console.log(values);
    // Handle form submission
}
```

### 4. **Styling Standards**

#### TailwindCSS Guidelines
- Use utility classes for styling
- Group related utilities together
- Use responsive prefixes: `sm:`, `md:`, `lg:`
- Prefer composition over custom CSS
- Use `cn()` utility for conditional classes

```javascript
import { cn } from "@/lib/utils";

<div className={cn(
    "base-classes",
    "layout-classes",
    "spacing-classes",
    "color-classes",
    "transition-classes",
    condition && "conditional-classes"
)} />
```

#### Class Ordering
1. Layout (display, position, flex, grid)
2. Sizing (width, height, padding, margin)
3. Typography (font, text)
4. Visual (background, border, shadow)
5. Interactive (cursor, transition, hover)

### 5. **State Management**

#### React Context Pattern
```javascript
// contexts/CartContext.jsx
import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    
    const addToCart = (product) => {
        // Logic
    };
    
    const value = {
        items,
        addToCart,
        // other methods
    };
    
    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
}
```

### 6. **API and Data Handling**

#### Mock Data Structure
```javascript
// lib/teams-data.js
export const mockTeams = [
    {
        id: 1,
        name: "Royal Strikers",
        captain: "Virat K.",
        players: 15,
        stats: { won: 12, played: 15 }
    },
    // More teams...
];
```

#### Future API Integration Pattern
```javascript
// app/api/teams/route.js (when backend is ready)
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // Fetch from database
        const teams = await db.teams.findMany();
        return NextResponse.json(teams);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch teams' },
            { status: 500 }
        );
    }
}
```

### 7. **Error Handling**

#### Toast Notifications
```javascript
import { toast } from 'sonner';

// Success
toast.success("Match Created!", {
    description: "Your match has been scheduled."
});

// Error
toast.error("Teams must be different", {
    description: "You cannot start a match between the same team."
});

// Info
toast.info("Feature coming soon!");
```

#### Form Validation Errors
```javascript
<FormMessage /> // Automatically displays Zod validation errors
```

### 8. **Performance Optimization**

#### Code Splitting
- Use dynamic imports for heavy components
- Lazy load routes when appropriate
- Use `"use client"` directive only when necessary

#### Memoization
```javascript
import { useMemo, useCallback } from 'react';

// Expensive calculations
const calculatedValue = useMemo(() => {
    return expensiveCalculation(data);
}, [data]);

// Event handlers
const handleClick = useCallback(() => {
    // Handler logic
}, [dependencies]);
```

### 9. **Accessibility Standards**

- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation works
- Use ARIA labels when needed
- Maintain color contrast ratios

```javascript
<button
    aria-label="Add to cart"
    className="..."
>
    <Plus className="h-4 w-4" />
</button>
```

### 10. **Code Documentation**

#### Component Documentation
```javascript
/**
 * MatchCard Component
 * 
 * Displays a summary card for a cricket match
 * 
 * @param {Object} match - Match data object
 * @param {string} match.id - Unique match identifier
 * @param {string} match.teamA - First team name
 * @param {string} match.teamB - Second team name
 * @param {string} match.status - Match status (live, completed, upcoming)
 */
export function MatchCard({ match }) {
    // Component logic
}
```

#### Function Documentation
```javascript
/**
 * Calculate current run rate
 * @param {number} runs - Total runs scored
 * @param {number} overs - Overs completed
 * @returns {number} Current run rate rounded to 2 decimals
 */
function calculateRunRate(runs, overs) {
    if (overs === 0) return 0;
    return (runs / overs).toFixed(2);
}
```

### 11. **Git Commit Standards**

#### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

#### Examples
```
feat(matches): add live scoring keyboard shortcuts
fix(cart): resolve quantity update bug
docs(readme): update installation instructions
style(teams): improve card hover animations
```

### 12. **Testing Standards** (Future Implementation)

#### Unit Tests
```javascript
// __tests__/utils/calculateRunRate.test.js
import { calculateRunRate } from '@/lib/utils';

describe('calculateRunRate', () => {
    it('should calculate run rate correctly', () => {
        expect(calculateRunRate(100, 10)).toBe(10.00);
    });
    
    it('should handle zero overs', () => {
        expect(calculateRunRate(50, 0)).toBe(0);
    });
});
```

#### Component Tests
```javascript
// __tests__/components/MatchCard.test.jsx
import { render, screen } from '@testing-library/react';
import { MatchCard } from '@/components/MatchCard';

describe('MatchCard', () => {
    it('renders match details correctly', () => {
        const match = {
            teamA: 'Team A',
            teamB: 'Team B',
            status: 'live'
        };
        
        render(<MatchCard match={match} />);
        expect(screen.getByText('Team A')).toBeInTheDocument();
    });
});
```

### 13. **Environment Variables**

```env
# .env.local
NEXT_PUBLIC_APP_NAME=CricVerse
NEXT_PUBLIC_API_URL=http://localhost:3000/api
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cricverse?retryWrites=true&w=majority
# For local MongoDB: mongodb://localhost:27017/cricverse
```

- Prefix client-side variables with `NEXT_PUBLIC_`
- Never commit `.env.local` to version control
- Provide `.env.example` template
- Use `MONGODB_URI` for MongoDB connection string

### 14. **Code Review Checklist**

- [ ] Code follows naming conventions
- [ ] Components are properly structured
- [ ] No console.logs in production code
- [ ] Error handling is implemented
- [ ] Accessibility standards are met
- [ ] Responsive design works on all breakpoints
- [ ] Forms have proper validation
- [ ] Loading and error states are handled
- [ ] Code is DRY (Don't Repeat Yourself)
- [ ] Comments explain "why", not "what"

---

## Summary

This documentation provides a comprehensive overview of the **CricVerse** cricket scoring application, including:

1. **Use Case Diagrams**: Visualizing user interactions and system functionality
2. **Class Diagrams**: Showing the object-oriented structure and relationships
3. **Interaction Diagrams**: Detailing sequence flows for key processes
4. **Activity Diagrams**: Illustrating workflows and business logic
5. **Database Design**: Complete MongoDB schema with collections, embedded documents, and indexing strategies
6. **Data Dictionary**: Detailed field specifications for all MongoDB collections
7. **Coding Standards**: Comprehensive guidelines for consistent, maintainable code

The application is built with modern web technologies (Next.js, React, MongoDB) and follows industry best practices for scalability, maintainability, and user experience.
