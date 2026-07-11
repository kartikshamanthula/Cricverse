import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Match from '@/models/Match';

export async function POST(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();
        const { type } = body;

        const validReactions = ['clap', 'fire', 'shock', 'celebrate'];
        if (!validReactions.includes(type)) {
            return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
        }

        // Find match and increment the reaction count
        const updatedMatch = await Match.findByIdAndUpdate(
            id,
            { $inc: { [`reactions.${type}`]: 1 } },
            { new: true, select: 'reactions' }
        );

        if (!updatedMatch) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        // If reactions subdocument doesn't exist yet, initialize it
        if (!updatedMatch.reactions) {
            updatedMatch.reactions = { clap: 0, fire: 0, shock: 0, celebrate: 0 };
            updatedMatch.reactions[type] = 1;
            await updatedMatch.save();
        }

        return NextResponse.json(updatedMatch.reactions);
    } catch (error) {
        console.error('Error posting reaction:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
