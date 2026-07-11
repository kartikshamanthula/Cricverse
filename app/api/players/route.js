import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Player from '@/models/Player';
import { getServerSession } from '@/lib/auth';

export async function GET(request) {
    try {
        await connectToDatabase();
        const session = await getServerSession();
        
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const role = searchParams.get('role');

        const query = { createdBy: session.id };
        
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (role) {
            query.role = role;
        }

        const players = await Player.find(query).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: players });
    } catch (error) {
        console.error('Error fetching players:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch players' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        await connectToDatabase();
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        
        if (!body.name) {
            return NextResponse.json({ error: 'Player name is required' }, { status: 400 });
        }

        const newPlayer = new Player({
            name: body.name,
            profilePhotoUrl: body.profilePhotoUrl || null,
            mobileNumber: body.mobileNumber || null,
            emailId: body.emailId || null,
            role: body.role || 'Unknown',
            battingStyle: body.battingStyle || 'Unknown',
            bowlingStyle: body.bowlingStyle || 'Unknown',
            createdBy: session.id
        });

        await newPlayer.save();

        return NextResponse.json({ success: true, data: newPlayer }, { status: 201 });
    } catch (error) {
        console.error('Error creating player:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create player' },
            { status: 500 }
        );
    }
}
