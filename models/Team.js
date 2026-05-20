import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Player name is required'],
        trim: true,
    },
});

const TeamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Team name is required'],
            trim: true,
            minlength: [2, 'Team name must be at least 2 characters'],
            maxlength: [50, 'Team name cannot exceed 50 characters'],
        },
        captain: {
            type: String,
            required: [true, 'Captain name is required'],
            trim: true,
        },
        logoUrl: {
            type: String,
            default: null,
        },
        color: {
            type: String,
            default: 'from-blue-400 to-blue-600',
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        players: [PlayerSchema],
        stats: {
            played: { type: Number, default: 0 },
            won: { type: Number, default: 0 },
            lost: { type: Number, default: 0 },
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

// Indexes for better query performance
TeamSchema.index({ name: 1, createdBy: 1 }, { unique: true });
TeamSchema.index({ status: 1, createdAt: -1 });
TeamSchema.index({ 'players.name': 1 });

// Method to add a player
TeamSchema.methods.addPlayer = function (playerData) {
    this.players.push(playerData);
    return this.save();
};

// Method to remove a player
TeamSchema.methods.removePlayer = function (playerId) {
    this.players = this.players.filter(
        (player) => player._id.toString() !== playerId.toString()
    );
    return this.save();
};

// Prevent model recompilation in development
// Delete the model if it exists to force schema update in development
if (mongoose.models.Team) {
    delete mongoose.models.Team;
}

export default mongoose.model('Team', TeamSchema);
