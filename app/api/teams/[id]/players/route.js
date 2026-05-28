import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';

// POST /api/teams/[id]/players - Add a player to team
export async function POST(request, { params }) {
    try {
        await connectDB();

        const { id } = await params;
        const playerData = await request.json();

        // Validate player data
        if (!playerData.name || !playerData.role) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Player name and role are required',
                },
                { status: 400 }
            );
        }

        const team = await Team.findById(id);

        if (!team) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Team not found',
                },
                { status: 404 }
            );
        }

        team.players.push(playerData);
        await team.save();

        return NextResponse.json({
            success: true,
            data: team,
            message: 'Player added successfully',
        });
    } catch (error) {
        console.error('Error adding player:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to add player',
            },
            { status: 500 }
        );
    }
}

// DELETE /api/teams/[id]/players?playerId=xxx - Remove a player from team
export async function DELETE(request, { params }) {
    try {
        await connectDB();

        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const playerId = searchParams.get('playerId');

        if (!playerId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Player ID is required',
                },
                { status: 400 }
            );
        }

        const team = await Team.findById(id);

        if (!team) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Team not found',
                },
                { status: 404 }
            );
        }

        team.players = team.players.filter(
            (player) => player._id.toString() !== playerId
        );

        await team.save();

        return NextResponse.json({
            success: true,
            data: team,
            message: 'Player removed successfully',
        });
    } catch (error) {
        console.error('Error removing player:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to remove player',
            },
            { status: 500 }
        );
    }
}
