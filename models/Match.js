import mongoose from 'mongoose';

const TeamRefSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true,
    },
    name: String,
    logo: String,
});

const PlayerStatsSchema = new mongoose.Schema({
    playerId: String,
    playerName: String, // Changed from 'name' to 'playerName' to match score page payload
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    strikeRate: { type: Number, default: 0 },
    isOut: { type: Boolean, default: false },
    dismissal: {
        type: {
            type: String,
            enum: ['bowled', 'caught', 'lbw', 'run-out', 'stumped', 'hit-wicket'],
        },
        bowler: String,
        fielder: String,
    },
});

const BowlerStatsSchema = new mongoose.Schema({
    playerId: String,
    playerName: String, // Changed from 'name' to 'playerName' to match score page payload
    overs: { type: Number, default: 0 },
    maidens: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    economy: { type: Number, default: 0 },
    wides: { type: Number, default: 0 },
    noBalls: { type: Number, default: 0 },
});

const BallSchema = new mongoose.Schema({
    overNumber: Number,
    ballNumber: Number,
    batsman: String,
    bowler: String,
    runs: Number,
    ballType: {
        type: String,
        enum: ['legal', 'wide', 'no_ball', 'bye', 'leg_bye'],
        default: 'legal',
    },
    isWicket: { type: Boolean, default: false },
    extras: String,
    timestamp: { type: Date, default: Date.now },
});

const InningsSchema = new mongoose.Schema({
    inningsNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 2,
    },
    battingTeam: String, // Changed from TeamRefSchema to String (team name)
    bowlingTeam: String, // Changed from TeamRefSchema to String (team name)
    score: {
        runs: { type: Number, default: 0 },
        wickets: { type: Number, default: 0 },
        overs: { type: Number, default: 0 },
        balls: { type: Number, default: 0 },
        runRate: { type: Number, default: 0 },
        extras: {
            wides: { type: Number, default: 0 },
            noBalls: { type: Number, default: 0 },
            byes: { type: Number, default: 0 },
            legByes: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
        },
    },
    currentPlayers: {
        striker: PlayerStatsSchema,
        nonStriker: PlayerStatsSchema,
        bowler: BowlerStatsSchema,
    },
    battingStats: [PlayerStatsSchema], // Changed from 'batsmen' to match what score page sends
    bowlingStats: [BowlerStatsSchema], // Changed from 'bowlers' to match what score page sends
    ballHistory: [BallSchema],
    status: {
        type: String,
        enum: ['not-started', 'in-progress', 'completed'],
        default: 'not-started',
    },
    startedAt: Date,
    endedAt: Date,
});

const MatchSchema = new mongoose.Schema(
    {
        matchNumber: {
            type: String,
            unique: true,
            required: true,
        },
        teamA: TeamRefSchema,
        teamB: TeamRefSchema,
        venue: {
            type: String,
            required: [true, 'Venue is required'],
        },
        matchDate: {
            type: Date,
            required: [true, 'Match date is required'],
        },
        totalOvers: {
            type: Number,
            required: [true, 'Total overs is required'],
            min: 1,
            max: 50,
        },
        overs: {
            type: Number, // Alias for totalOvers, used by score page
            min: 1,
            max: 50,
        },
        oversPerBowler: {
            type: Number,
            required: [true, 'Overs per bowler is required'],
            min: 1,
        },
        matchType: {
            type: String,
            enum: ['Limited Overs', 'Test Match', 'T20', 'ODI', 'Box/Turf Cricket', 'Gully Cricket', 'Tournament'],
            default: 'Box/Turf Cricket',
        },
        ballType: {
            type: String,
            enum: ['tennis', 'leather', 'other'],
            required: [true, 'Ball type is required'],
        },
        pitchType: {
            type: String,
            enum: ['rough', 'cement', 'turf', 'astroturf', 'matting'],
            required: [true, 'Pitch type is required'],
        },
        toss: {
            winner: String,
            decision: {
                type: String,
                enum: ['bat', 'bowl'],
            },
        },
        status: {
            type: String,
            enum: ['scheduled', 'live', 'completed', 'abandoned'],
            default: 'scheduled',
        },
        result: {
            winner: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Team',
            },
            winnerName: String,
            margin: String,
            manOfTheMatch: {
                playerId: String,
                name: String,
                performance: String,
            },
        },
        innings: [InningsSchema],
        tournamentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tournament',
            default: null,
        },
        tournamentName: String,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
MatchSchema.index({ matchNumber: 1 });
MatchSchema.index({ 'teamA.teamId': 1, matchDate: -1 });
MatchSchema.index({ 'teamB.teamId': 1, matchDate: -1 });
MatchSchema.index({ tournamentId: 1, matchDate: -1 });
MatchSchema.index({ status: 1, matchDate: -1 });
MatchSchema.index({ matchDate: -1 });

// Pre-save hook to generate match number
MatchSchema.pre('save', async function () {
    if (!this.matchNumber) {
        const year = new Date().getFullYear();
        const count = await mongoose.models.Match.countDocuments();
        this.matchNumber = `M-${year}-${String(count + 1).padStart(4, '0')}`;
    }
});

// Method to start innings
MatchSchema.methods.startInnings = function (inningsNumber, battingTeam, bowlingTeam) {
    const innings = {
        inningsNumber,
        battingTeam,
        bowlingTeam,
        status: 'in-progress',
        startedAt: new Date(),
    };
    this.innings.push(innings);
    this.status = 'live';
    return this.save();
};

// Method to update score
MatchSchema.methods.updateScore = function (inningsNumber, scoreUpdate) {
    const innings = this.innings.find((i) => i.inningsNumber === inningsNumber);
    if (innings) {
        Object.assign(innings.score, scoreUpdate);
        return this.save();
    }
    throw new Error('Innings not found');
};

export default mongoose.models.Match || mongoose.model('Match', MatchSchema);
