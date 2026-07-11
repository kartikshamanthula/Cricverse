import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Player from '@/models/Player';
import { getServerSession } from '@/lib/auth';

export async function GET(request, { params }) {
    try {
        await connectToDatabase();
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const player = await Player.findOne({ _id: params.id, createdBy: session.id });

        if (!player) {
            return NextResponse.json({ error: 'Player not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: player });
    } catch (error) {
        console.error('Error fetching player:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch player' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        await connectToDatabase();
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const player = await Player.findOneAndUpdate(
            { _id: params.id, createdBy: session.id },
            {
                $set: {
                    name: body.name,
                    profilePhotoUrl: body.profilePhotoUrl,
                    mobileNumber: body.mobileNumber,
                    emailId: body.emailId,
                    role: body.role,
                    battingStyle: body.battingStyle,
                    bowlingStyle: body.bowlingStyle,
                }
            },
            { new: true, runValidators: true }
        );

        if (!player) {
            return NextResponse.json({ error: 'Player not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: player });
    } catch (error) {
        console.error('Error updating player:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update player' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectToDatabase();
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const player = await Player.findOneAndDelete({ _id: params.id, createdBy: session.id });

        if (!player) {
            return NextResponse.json({ error: 'Player not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Player deleted successfully' });
    } catch (error) {
        console.error('Error deleting player:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete player' },
            { status: 500 }
        );
    }
}
