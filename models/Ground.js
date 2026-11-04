import mongoose from 'mongoose';

const SlotSchema = new mongoose.Schema({
    id: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    label: { type: String, required: true }, // e.g. "Morning Slot", "Floodlight Prime"
    price: { type: Number, required: true },
    isBooked: { type: Boolean, default: false },
    isPeak: { type: Boolean, default: false }
});

const GroundSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    type: { 
        type: String, 
        required: true,
        enum: ['Full Ground', 'Box Cricket Turf', 'Practice Nets', 'Indoor Arena']
    },
    description: { type: String, required: true },
    location: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, default: 'Maharashtra' },
        coordinates: {
            lat: { type: Number, default: 19.076 },
            lng: { type: Number, default: 72.8777 }
        },
        googleMapsUrl: { type: String, required: true },
        iframeSrc: { type: String }
    },
    pricePerHour: { type: Number, required: true },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 112 },
    images: [{ type: String }],
    amenities: [{ type: String }],
    timeSlots: [SlotSchema],
    contactPhone: { type: String, default: "+91 98765 43210" },
    managerName: { type: String, default: "Ground Manager" },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

export default mongoose.models.Ground || mongoose.model('Ground', GroundSchema);
