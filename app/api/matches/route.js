import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Match from '@/models/Match';
import Team from '@/models/Team';
import User from '@/models/User';
import { getServerSession } from '@/lib/auth';

export async function GET(request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const shareCode = searchParams.get('shareCode');

        if (shareCode) {
            const match = await Match.findOne({ shareCode: shareCode.trim().toUpperCase() });
            if (!match) {
                return NextResponse.json({ error: 'Match not found for this code' }, { status: 404 });
            }
            // Only expire when status is explicitly 'completed'
            // Note: match.result is always a truthy Mongoose subdocument even when empty, so do NOT use it as the condition
            if (match.status === 'completed') {
                return NextResponse.json({ error: 'This spectating link has expired because the match is complete' }, { status: 410 });
            }
            return NextResponse.json(match);
        }

        // Populate shareCode for legacy matches lacking it
        const matchesWithoutCode = await Match.find({ 
            $or: [
                { shareCode: { $exists: false } },
                { shareCode: null },
                { shareCode: "" }
            ]
        });
        if (matchesWithoutCode.length > 0) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            for (const m of matchesWithoutCode) {
                let unique = false;
                let code = '';
                while (!unique) {
                    let tempCode = '';
                    for (let i = 0; i < 8; i++) {
                        tempCode += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    code = `CV-${tempCode}`;
                    const existing = await Match.findOne({ shareCode: code });
                    if (!existing) unique = true;
                }
                await Match.updateOne({ _id: m._id }, { $set: { shareCode: code } });
            }
        }

        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const status = searchParams.get('status');
        const tournamentId = searchParams.get('tournamentId');
        const fetchAll = searchParams.get('all') === 'true';
        const dashboard = searchParams.get('dashboard') === 'true';

        let query = {};
        if (dashboard) {
            query.$or = [
                { createdBy: session.id },
                { status: { $ne: 'completed' }, 'innings.0': { $exists: true } }
            ];
        } else if (!fetchAll) {
            query.createdBy = session.id;
        }
        
        if (status) query.status = status;
        if (tournamentId) query.tournamentId = tournamentId;

        const matches = await Match.find(query).sort({ matchDate: -1 });
        return NextResponse.json(matches);
    } catch (error) {
        console.error('Error fetching matches:', error);
        return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
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

        // Validate required fields
        if (!body.teamA || !body.teamB || !body.date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let teamADoc = await Team.findById(body.teamA).catch(() => null);
        if (!teamADoc) teamADoc = await Team.findOne({ name: body.teamA, createdBy: session.id });

        let teamBDoc = await Team.findById(body.teamB).catch(() => null);
        if (!teamBDoc) teamBDoc = await Team.findOne({ name: body.teamB, createdBy: session.id });

        if (!teamADoc || !teamBDoc) {
            return NextResponse.json({ error: 'One or both teams not found or not owned by you' }, { status: 404 });
        }

        const newMatch = new Match({
            teamA: {
                teamId: teamADoc._id,
                name: teamADoc.name,
                logo: teamADoc.logoUrl || '',
            },
            teamB: {
                teamId: teamBDoc._id,
                name: teamBDoc.name,
                logo: teamBDoc.logoUrl || '',
            },
            matchDate: new Date(body.date),
            venue: body.venue,
            totalOvers: body.overs,
            oversPerBowler: body.oversPerBowler || Math.ceil((body.overs || 20) / 5),
            matchType: body.matchType,
            ballType: body.ballType?.toLowerCase().includes('tennis') ? 'tennis' :
                body.ballType?.toLowerCase().includes('leather') ? 'leather' : 'other',
            pitchType: body.pitchType === 'Concrete' ? 'cement' :
                body.pitchType?.toLowerCase() || 'cement',
            status: 'scheduled',
            toss: {
                winner: body.tossWinner,
                decision: body.tossDecision?.toLowerCase() || 'bat',
            },
            matchNumber: `M-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            tournamentId: body.tournamentId || null,
            tournamentName: body.tournamentName || null,
            createdBy: session.id
        });

        await newMatch.save();

        return NextResponse.json(newMatch, { status: 201 });
    } catch (error) {
        console.error("Error creating match:", error);
        return NextResponse.json({ error: 'Failed to create match' }, { status: 500 });
    }
}
