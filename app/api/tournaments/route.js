import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tournament from '@/models/Tournament';
import { getServerSession } from '@/lib/auth';
import '@/models/Match'; // Register Match schema for populate
import '@/models/Team';  // Register Team schema for populate
import '@/models/User';  // Register User schema for reference

// GET - Fetch all tournaments
export async function GET() {
    try {
        await dbConnect();
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const tournaments = await Tournament.find({ createdBy: session.id })
            .populate('participatingTeams.teamId', 'name captain players')
            .populate('fixtures.matchId')
            .sort({ createdAt: -1 });

        // Scavenger: Prune fixtures with deleted matches
        for (const tournament of tournaments) {
            const invalidFixtureIds = tournament.fixtures
                .filter(f => !f.matchId)
                .map(f => f._id);

            if (invalidFixtureIds.length > 0) {
                await Tournament.updateOne(
                    { _id: tournament._id },
                    { $pull: { fixtures: { _id: { $in: invalidFixtureIds } } } }
                );
            }
        }

        return NextResponse.json({
            success: true,
            data: tournaments,
        });
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch tournaments',
            },
            { status: 500 }
        );
    }
}

// POST - Create new tournament
export async function POST(request) {
    try {
        await dbConnect();
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Validate required fields
        const { name, type, venue, startDate } = body;
        if (!name || !type || !venue || !startDate) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields: name, type, venue, startDate',
                },
                { status: 400 }
            );
        }

        // Create tournament
        const tournamentData = {
            name,
            type: type.toLowerCase(),
            venue,
            startDate,
            format: body.format || 'Limited Overs',
            description: body.description || '',
            maxTeams: body.maxTeams || 8,
            rules: {
                oversPerMatch: body.overs || 20,
                oversPerBowler: body.oversPerBowler || 4,
                playersPerTeam: body.maxPlayersPerTeam || 11,
                powerplayOvers: body.powerplayOvers || 6,
            },
            createdBy: session.id
        };

        const tournament = await Tournament.create(tournamentData);

        return NextResponse.json(
            {
                success: true,
                data: tournament,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating tournament:', error);

        // Handle duplicate name error
        if (error.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'A tournament with this name already exists',
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create tournament',
            },
            { status: 500 }
        );
    }
}
