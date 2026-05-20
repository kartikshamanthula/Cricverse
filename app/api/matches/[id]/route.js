import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Match from '@/models/Match';
import Team from '@/models/Team';
import Tournament from '@/models/Tournament';
import { getServerSession } from '@/lib/auth';

export async function GET(request, { params }) {
    try {
        await connectToDatabase();
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const match = await Match.findOne({ _id: id })
            .populate('teamA.teamId')
            .populate('teamB.teamId');

        if (!match) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        return NextResponse.json(match);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        await connectToDatabase();
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        const updatedMatch = await Match.findOneAndUpdate(
            { _id: id, createdBy: session.id },
            { $set: body },
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedMatch) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        return NextResponse.json(updatedMatch);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectToDatabase();
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Find the match first to check for tournamentId
        const matchToDelete = await Match.findOne({ _id: id, createdBy: session.id });

        if (!matchToDelete) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        // If part of a tournament, remove from fixtures
        if (matchToDelete.tournamentId) {
            await Tournament.findOneAndUpdate(
                { _id: matchToDelete.tournamentId, createdBy: session.id },
                { $pull: { fixtures: { matchId: id } } }
            );
        } else {
            // Fallback: search all tournaments for this matchId in fixtures
            await Tournament.updateMany(
                { createdBy: session.id, "fixtures.matchId": id },
                { $pull: { fixtures: { matchId: id } } }
            );
        }

        // Now delete the match
        await Match.deleteOne({ _id: id });

        return NextResponse.json({ message: 'Match deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
