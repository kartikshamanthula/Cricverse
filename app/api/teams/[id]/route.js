import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import { getServerSession } from '@/lib/auth';

// GET /api/teams/[id] - Get a single team
export async function GET(request, { params }) {
    try {
        await connectDB();
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const team = await Team.findOne({ _id: id, createdBy: session.id });

        if (!team) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Team not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: team,
        });
    } catch (error) {
        console.error('Error fetching team:', error);

        // Handle invalid ID format
        if (error.name === 'CastError') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid team ID format',
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch team',
            },
            { status: 500 }
        );
    }
}

// PUT /api/teams/[id] - Update a team
export async function PUT(request, { params }) {
    try {
        await connectDB();
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        // Don't allow updating certain fields
        delete body._id;
        delete body.createdAt;
        delete body.updatedAt;

        const team = await Team.findOneAndUpdate(
            { _id: id, createdBy: session.id },
            { $set: body },
            {
                returnDocument: 'after',
                runValidators: true,
            }
        );

        if (!team) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Team not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: team,
            message: 'Team updated successfully',
        });
    } catch (error) {
        console.error('Error updating team:', error);

        if (error.name === 'ValidationError') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation error',
                    details: error.message,
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update team',
            },
            { status: 500 }
        );
    }
}

// DELETE /api/teams/[id] - Delete a team
export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const team = await Team.findOneAndDelete({ _id: id, createdBy: session.id });

        if (!team) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Team not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {},
            message: 'Team deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting team:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to delete team',
            },
            { status: 500 }
        );
    }
}
