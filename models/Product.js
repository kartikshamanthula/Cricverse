import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [120, 'Name too long'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: [500, 'Description too long'],
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['Bats', 'Balls', 'Gear', 'Clothing', 'Footwear', 'Accessories', 'Leg Guard', 'Gloves', 'T-shirt'],
        },
        rating: {
            type: Number,
            default: 4.0,
            min: 0,
            max: 5,
        },
        image: {
            type: String,
            default: null,
        },
        stock: {
            type: Number,
            default: 0,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

ProductSchema.index({ category: 1 });
ProductSchema.index({ isActive: 1, createdAt: -1 });

if (mongoose.models.Product) {
    delete mongoose.models.Product;
}

export default mongoose.model('Product', ProductSchema);
