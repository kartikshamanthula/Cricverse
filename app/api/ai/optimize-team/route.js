import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt) {
    const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 2048,
            },
        }),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API error: ${err}`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis available.';
}

export async function POST(request) {
    try {
        const { teamAId, teamBId, pitchType = 'Flat', weather = 'Sunny', overs = 20 } = await request.json();

        if (!teamAId || !teamBId) {
            return NextResponse.json({ error: 'Both teamAId and teamBId are required' }, { status: 400 });
        }

        await connectDB();

        const teamA = await Team.findById(teamAId);
        const teamB = await Team.findById(teamBId);

        if (!teamA || !teamB) {
            return NextResponse.json({ error: 'One or both teams not found' }, { status: 404 });
        }

        // Build rosters
        const formatRoster = (team) => {
            let roster = `Team: ${team.name} (Captain: ${team.captain})\n`;
            roster += `Record: ${team.stats?.played || 0} played, ${team.stats?.won || 0} won, ${team.stats?.lost || 0} lost\n`;
            roster += `Players:\n`;
            team.players.forEach((p, idx) => {
                roster += `  ${idx + 1}. ${p.name}\n`;
            });
            return roster;
        };

        const prompt = `You are a world-class cricket strategist and match simulator. Analyze these two teams and simulate a ${overs}-over cricket match.

=== TEAM A ===
${formatRoster(teamA)}

=== TEAM B ===
${formatRoster(teamB)}

=== CONDITIONS ===
Pitch Type: ${pitchType}
Weather: ${weather}
Format: ${overs} overs per side

Please provide:

1. **OPTIMAL PLAYING XI** for each team (select best 11 from roster if more than 11 available, otherwise use all).

2. **KEY MATCHUPS** — 3 critical head-to-head player matchups that could decide the game (e.g., specific bowler vs specific batsman). Explain why each matters.

3. **TACTICAL RECOMMENDATIONS** — 2 tactical tips for each team captain based on pitch/weather conditions.

4. **MATCH SIMULATION** — Simulate a brief match summary:
   - Toss decision recommendation
   - Projected 1st innings score
   - Projected 2nd innings chase result
   - Predicted winner and margin

5. **PLAYER TO WATCH** — One standout player from each team who could be the match-winner.

Format the output nicely with clear sections. Use emojis for visual appeal. Make it exciting and insightful like a pre-match analysis show.`;

        let analysis = '';
        try {
            analysis = await callGemini(prompt);
        } catch (geminiError) {
            console.warn('Gemini API call failed, using local fallback team simulation:', geminiError.message);
            analysis = `📊 MATCH ANALYSIS & SIMULATION (Local Fallback Mode)

1. OPTIMAL PLAYING XI
- ${teamA.name}: Led by ${teamA.captain || 'Captain'}, including all registered players.
- ${teamB.name}: Led by ${teamB.captain || 'Captain'}, including all registered players.

2. PITCH & CONDITIONS REPORT
- Pitch Type: ${pitchType} Track
- Weather: ${weather}
- Format: ${overs} Overs
- Tactical Impact: On a ${pitchType} track, ${pitchType === 'Green' ? 'fast bowlers will enjoy seam movement early on' : pitchType === 'Dusty' ? 'spinners will obtain significant turn' : 'batsmen can play shots freely'}. The ${weather} weather will ${weather === 'Overcast' ? 'support swing bowling' : weather === 'Dew' ? 'make gripping the ball difficult in the second innings' : 'favor standard batting conditions'}.

3. MATCH SIMULATION SUMMARY
- Recommended Toss Decision: ${pitchType === 'Green' || weather === 'Overcast' ? 'Bowl First' : 'Bat First'}
- Projected 1st Innings Score: ${pitchType === 'Green' ? '145-160' : pitchType === 'Dusty' ? '135-150' : '175-190'} runs.
- Predicted Winner: A highly competitive battle. ${teamA.name} holds a slight 51%-49% edge over ${teamB.name} in these specific conditions.`;
        }

        return NextResponse.json({
            analysis,
            teamA: { name: teamA.name, captain: teamA.captain, playerCount: teamA.players.length },
            teamB: { name: teamB.name, captain: teamB.captain, playerCount: teamB.players.length },
            conditions: { pitchType, weather, overs }
        });

    } catch (error) {
        console.error('Team optimizer API error:', error);
        return NextResponse.json({ error: 'Failed to optimize team' }, { status: 500 });
    }
}
