import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// GET /api/debug/connection - Test MongoDB connection
export async function GET() {
    try {
        await connectDB();

        const connectionState = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
        };

        return NextResponse.json({
            success: true,
            message: 'MongoDB connection test',
            connection: {
                state: states[connectionState],
                stateCode: connectionState,
                host: mongoose.connection.host,
                name: mongoose.connection.name,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Connection test failed:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Connection failed',
                message: 'Failed to establish connection to database',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
