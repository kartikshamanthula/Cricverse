import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Ground from '@/models/Ground';

export async function GET(request, { params }) {
    try {
        await connectToDatabase();
        const { id } = await params;

        const ground = await Ground.findById(id);
        if (!ground) {
            return NextResponse.json(
                { success: false, error: 'Ground not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            ground
        });

    } catch (error) {
        console.error('Error fetching ground:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch ground' },
            { status: 500 }
        );
    }
}
