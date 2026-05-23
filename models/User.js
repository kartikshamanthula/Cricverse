import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    permissions: {
        liveScoreInternational: { type: Boolean, default: true },
        liveScoreLocal: { type: Boolean, default: true },
        teamModule: { type: Boolean, default: true },
        matchModule: { type: Boolean, default: true },
        tournamentModule: { type: Boolean, default: true },
        storeModule: { type: Boolean, default: true }
    },
}, { timestamps: true })

export default mongoose.models.User || mongoose.model("User", UserSchema)
