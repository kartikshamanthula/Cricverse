import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Player name is required'],
            trim: true,
            minlength: [2, 'Player name must be at least 2 characters'],
            maxlength: [50, 'Player name cannot exceed 50 characters'],
        },
        profilePhotoUrl: {
            type: String,
            default: null,
        },
        mobileNumber: {
            type: String,
            trim: true,
            default: null,
        },
        emailId: {
            type: String,
            trim: true,
            lowercase: true,
            default: null,
        },
        role: {
            type: String,
            enum: ['Batsman', 'Bowler', 'All-Rounder', 'Wicket Keeper', 'Unknown'],
            default: 'Unknown',
        },
        battingStyle: {
            type: String,
            enum: ['Right-hand bat', 'Left-hand bat', 'Unknown'],
            default: 'Unknown',
        },
        bowlingStyle: {
            type: String,
            enum: ['Right-arm Fast', 'Right-arm Medium', 'Right-arm Spin', 'Left-arm Fast', 'Left-arm Medium', 'Left-arm Spin', 'None', 'Unknown'],
            default: 'Unknown',
        },
        careerStats: {
            matches: { type: Number, default: 0 },
            runs: { type: Number, default: 0 },
            wickets: { type: Number, default: 0 },
            highestScore: { type: Number, default: 0 },
            bestBowling: { type: String, default: '0/0' }, // e.g. "5/24"
            fifties: { type: Number, default: 0 },
            centuries: { type: Number, default: 0 },
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
PlayerSchema.index({ name: 1, createdBy: 1 });
PlayerSchema.index({ mobileNumber: 1 });

// Prevent model recompilation in development
if (mongoose.models.Player) {
    delete mongoose.models.Player;
}

export default mongoose.model('Player', PlayerSchema);
