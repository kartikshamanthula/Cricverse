import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import User from '@/models/User';
import { getServerSession } from '@/lib/auth';

// GET /api/teams - Get all teams
export async function GET(request) {
    try {
        await connectDB();
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        let query = { createdBy: session.id };

        if (status) {
            query.status = status;
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const teams = await Team.find(query)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            count: teams.length,
            data: teams,
        });
    } catch (error) {
        console.error('Error fetching teams:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch teams',
                message: error.message,
            },
            { status: 500 }
        );
    }
}

// POST /api/teams - Create a new team
export async function POST(request) {
    try {
        await connectDB();
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        body.createdBy = session.id;

        // Validate required fields
        if (!body.name || !body.captain) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Name and captain are required',
                },
                { status: 400 }
            );
        }

        // Check if team name already exists for THIS user
        const existingTeam = await Team.findOne({ name: body.name, createdBy: session.id });
        if (existingTeam) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Team name already exists',
                },
                { status: 409 }
            );
        }

        const team = await Team.create(body);

        return NextResponse.json(
            {
                success: true,
                data: team,
                message: 'Team created successfully',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating team:', error);

        if (error.name === 'ValidationError') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation error',
                    message: error.message,
                },
                { status: 400 }
            );
        }

        const logPath = path.join(process.cwd(), 'api_debug.log');
        fs.appendFileSync(logPath, `ERROR: ${error.message}\nStack: ${error.stack}\n`);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create team',
                message: error.message,
                details: error.code === 11000 ? 'Duplicate team name' : error.stack
            },
            { status: 500 }
        );
    }
}
