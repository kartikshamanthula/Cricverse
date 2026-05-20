import mongoose from 'mongoose';

const TournamentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Tournament name is required'],
            trim: true,
            minlength: [3, 'Tournament name must be at least 3 characters'],
            maxlength: [100, 'Tournament name cannot exceed 100 characters'],
        },

        type: {
            type: String,
            enum: ['league', 'knockout', 'round-robin', 'cup', 'series'],
            required: [true, 'Tournament type is required'],
        },
        format: {
            type: String,
            enum: ['T20', 'ODI', 'Test', 'Limited Overs'],
            default: 'Limited Overs',
        },
        status: {
            type: String,
            enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
            default: 'upcoming',
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            validate: {
                validator: function (value) {
                    return !value || value >= this.startDate;
                },
                message: 'End date must be after start date',
            },
        },
        venue: {
            type: String,
            trim: true,
        },

        participatingTeams: [
            {
                teamId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Team',
                    required: true,
                },
                name: String,
                logo: String,
                joinedAt: {
                    type: Date,
                    default: Date.now,
                },
                stats: {
                    played: { type: Number, default: 0 },
                    won: { type: Number, default: 0 },
                    lost: { type: Number, default: 0 },
                    drawn: { type: Number, default: 0 },
                    points: { type: Number, default: 0 },
                    netRunRate: { type: Number, default: 0 },
                },
            },
        ],
        fixtures: [
            {
                matchId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Match',
                },
                matchNumber: String,
                teamA: String,
                teamB: String,
                scheduledDate: Date,
                status: {
                    type: String,
                    enum: ['scheduled', 'live', 'completed', 'abandoned'],
                    default: 'scheduled',
                },
            },
        ],


        organizer: {
            type: String,
            default: 'system',
        },
        prize: {
            winner: String,
            runnerUp: String,
        },
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
TournamentSchema.index({ name: 1, createdBy: 1 }, { unique: true });
TournamentSchema.index({ status: 1, startDate: -1 });
TournamentSchema.index({ 'participatingTeams.teamId': 1 });
TournamentSchema.index({ startDate: -1 });

// Virtual for current team count
TournamentSchema.virtual('teamCount').get(function () {
    return this.participatingTeams.length;
});

// Virtual for match count
TournamentSchema.virtual('matchCount').get(function () {
    return this.fixtures.length;
});

// Method to add a team
TournamentSchema.methods.addTeam = function (teamData) {
    const teamExists = this.participatingTeams.some(
        (team) => team.teamId.toString() === teamData.teamId.toString()
    );

    if (teamExists) {
        throw new Error('Team already registered');
    }

    this.participatingTeams.push(teamData);
    return this.save();
};

// Method to remove a team
TournamentSchema.methods.removeTeam = function (teamId) {
    this.participatingTeams = this.participatingTeams.filter(
        (team) => team.teamId.toString() !== teamId.toString()
    );
    return this.save();
};

// Method to add a fixture
TournamentSchema.methods.addFixture = function (fixtureData) {
    this.fixtures.push(fixtureData);
    return this.save();
};

// Method to update team stats
TournamentSchema.methods.updateTeamStats = function (teamId, statsUpdate) {
    const team = this.participatingTeams.find(
        (t) => t.teamId.toString() === teamId.toString()
    );

    if (team) {
        Object.assign(team.stats, statsUpdate);
        return this.save();
    }

    throw new Error('Team not found in tournament');
};

// Method to get standings (sorted by points, then NRR)
TournamentSchema.methods.getStandings = function () {
    return this.participatingTeams
        .slice()
        .sort((a, b) => {
            if (b.stats.points !== a.stats.points) {
                return b.stats.points - a.stats.points;
            }
            return b.stats.netRunRate - a.stats.netRunRate;
        });
};

export default mongoose.models.Tournament || mongoose.model('Tournament', TournamentSchema);
