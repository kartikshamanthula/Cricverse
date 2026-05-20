import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

// GET /api/products  — list all (or active only via ?active=true)
export async function GET(request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('active') === 'true';

        const query = activeOnly ? { isActive: true } : {};
        const products = await Product.find(query).sort({ createdAt: -1 });
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/products  — create a new product
export async function POST(request) {
    try {
        await connectToDatabase();
        const body = await request.json();

        const { name, description, price, category } = body;
        if (!name || !description || price == null || !category) {
            return NextResponse.json({ error: 'name, description, price and category are required' }, { status: 400 });
        }

        const product = await Product.create(body);
        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
