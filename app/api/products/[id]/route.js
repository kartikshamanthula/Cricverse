import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

// GET /api/products/[id]
export async function GET(_, { params }) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const product = await Product.findById(id);
        if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/products/[id]  — update fields
export async function PATCH(request, { params }) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const body = await request.json();
        const product = await Product.findByIdAndUpdate(id, { $set: body }, { returnDocument: 'after', runValidators: false });
        if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/products/[id]
export async function DELETE(_, { params }) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const product = await Product.findByIdAndDelete(id);
        if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
