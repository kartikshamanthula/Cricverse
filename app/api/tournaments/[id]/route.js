import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tournament from '@/models/Tournament';
import { getServerSession } from '@/lib/auth';
import '@/models/Match';
import '@/models/Team';

// GET - Fetch single tournament by ID
export async function GET(request, { params }) {
    try {
        await dbConnect();
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const tournament = await Tournament.findOne({ _id: id, createdBy: session.id })
            .populate('participatingTeams.teamId', 'name captain players logoUrl')
            .populate('fixtures.matchId');

        if (!tournament) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Tournament not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: tournament,
        });
    } catch (error) {
        console.error('Error fetching tournament:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch tournament',
            },
            { status: 500 }
        );
    }
}

// PUT - Update tournament
export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        const tournament = await Tournament.findOne({ _id: id, createdBy: session.id });

        if (!tournament) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Tournament not found',
                },
                { status: 404 }
            );
        }

        // Handle adding teams
        if (body.addTeam) {
            const teamExists = tournament.participatingTeams.some(
                (t) => t.teamId.toString() === body.addTeam.teamId.toString()
            );
            if (teamExists) {
                return NextResponse.json(
                    { success: false, error: 'Team already registered' },
                    { status: 409 }
                );
            }
            const updated = await Tournament.findOneAndUpdate(
                { _id: id, createdBy: session.id },
                { $push: { participatingTeams: body.addTeam } },
                { returnDocument: 'after', runValidators: false }
            );
            return NextResponse.json({ success: true, data: updated });
        }

        // Handle removing teams
        if (body.removeTeam) {
            const updated = await Tournament.findOneAndUpdate(
                { _id: id, createdBy: session.id },
                { $pull: { participatingTeams: { teamId: body.removeTeam } } },
                { returnDocument: 'after', runValidators: false }
            );
            return NextResponse.json({ success: true, data: updated });
        }

        // Handle adding fixtures
        if (body.addFixture) {
            const updated = await Tournament.findOneAndUpdate(
                { _id: id, createdBy: session.id },
                { $push: { fixtures: body.addFixture } },
                { returnDocument: 'after', runValidators: false }
            );
            return NextResponse.json({ success: true, data: updated });
        }

        // Handle updating team stats
        if (body.updateTeamStats) {
            const { teamId, stats } = body.updateTeamStats;
            const statsUpdate = {};
            Object.entries(stats).forEach(([key, val]) => {
                statsUpdate[`participatingTeams.$.stats.${key}`] = val;
            });
            const updated = await Tournament.findOneAndUpdate(
                { _id: id, createdBy: session.id, 'participatingTeams.teamId': teamId },
                { $set: statsUpdate },
                { returnDocument: 'after', runValidators: false }
            );
            return NextResponse.json({ success: true, data: updated });
        }

        // General update
        const allowedUpdates = ['name', 'description', 'status', 'venue', 'startDate', 'endDate', 'prize'];
        const updates = {};

        allowedUpdates.forEach(field => {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        });

        const updatedTournament = await Tournament.findOneAndUpdate(
            { _id: id, createdBy: session.id },
            updates,
            { returnDocument: 'after', runValidators: true }
        );

        return NextResponse.json({
            success: true,
            data: updatedTournament,
        });
    } catch (error) {
        console.error('Error updating tournament:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to update tournament',
            },
            { status: 500 }
        );
    }
}

// DELETE - Delete tournament
export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const tournament = await Tournament.findOneAndDelete({ _id: id, createdBy: session.id });

        if (!tournament) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Tournament not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Tournament deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting tournament:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to delete tournament',
            },
            { status: 500 }
        );
    }
}
