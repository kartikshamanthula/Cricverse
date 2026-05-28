import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Match from '@/models/Match';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt) {
    const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.9,
                maxOutputTokens: 512,
            },
        }),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API error: ${err}`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No commentary available.';
}

export async function POST(request) {
    try {
        const { matchId, persona = 'excited' } = await request.json();

        if (!matchId) {
            return NextResponse.json({ error: 'matchId is required' }, { status: 400 });
        }

        await connectDB();

        const match = await Match.findById(matchId)
            .populate('teamA.teamId', 'name players')
            .populate('teamB.teamId', 'name players');

        if (!match) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        // Build context from live innings
        const currentInnings = match.innings?.[match.innings.length - 1];
        const totalOvers = match.totalOvers || match.overs || 20;

        let matchContext = `Match: ${match.teamA.name} vs ${match.teamB.name}\n`;
        matchContext += `Format: ${match.matchType || 'T20'}, ${totalOvers} overs per side\n`;
        matchContext += `Venue: ${match.venue || 'Cricket Ground'}\n`;
        matchContext += `Status: ${match.status}\n`;

        if (match.toss?.winner) {
            matchContext += `Toss: ${match.toss.winner} won and chose to ${match.toss.decision}\n`;
        }

        // First innings
        const firstInnings = match.innings?.find(i => i.inningsNumber === 1);
        if (firstInnings) {
            matchContext += `\n--- 1st Innings ---\n`;
            matchContext += `Batting: ${firstInnings.battingTeam}\n`;
            matchContext += `Score: ${firstInnings.score.runs}/${firstInnings.score.wickets} (${firstInnings.score.overs} overs)\n`;
            matchContext += `Run Rate: ${firstInnings.score.overs > 0 ? (firstInnings.score.runs / firstInnings.score.overs).toFixed(2) : '0.00'}\n`;

            if (firstInnings.battingStats?.length > 0) {
                matchContext += `Top Batters:\n`;
                const topBats = [...firstInnings.battingStats]
                    .sort((a, b) => b.runs - a.runs)
                    .slice(0, 3);
                topBats.forEach(b => {
                    matchContext += `  ${b.playerName}: ${b.runs} runs (${b.balls} balls, ${b.fours || 0}x4, ${b.sixes || 0}x6)\n`;
                });
            }
            if (firstInnings.bowlingStats?.length > 0) {
                matchContext += `Top Bowlers:\n`;
                const topBowls = [...firstInnings.bowlingStats]
                    .sort((a, b) => b.wickets - a.wickets || a.economy - b.economy)
                    .slice(0, 3);
                topBowls.forEach(b => {
                    matchContext += `  ${b.playerName}: ${b.wickets}/${b.runs} (${b.overs} overs)\n`;
                });
            }
        }

        // Second innings
        const secondInnings = match.innings?.find(i => i.inningsNumber === 2);
        if (secondInnings) {
            const target = (firstInnings?.score?.runs || 0) + 1;
            const runsNeeded = target - secondInnings.score.runs;
            const ballsRemaining = (totalOvers * 6) - (Math.floor(secondInnings.score.overs) * 6 + Math.round((secondInnings.score.overs % 1) * 10));
            const reqRate = ballsRemaining > 0 ? ((runsNeeded / ballsRemaining) * 6).toFixed(2) : 'N/A';

            matchContext += `\n--- 2nd Innings ---\n`;
            matchContext += `Batting: ${secondInnings.battingTeam} (Chasing ${target})\n`;
            matchContext += `Score: ${secondInnings.score.runs}/${secondInnings.score.wickets} (${secondInnings.score.overs} overs)\n`;
            matchContext += `Runs needed: ${runsNeeded} off ${ballsRemaining} balls\n`;
            matchContext += `Required RR: ${reqRate} | Current RR: ${secondInnings.score.overs > 0 ? (secondInnings.score.runs / secondInnings.score.overs).toFixed(2) : '0.00'}\n`;

            if (secondInnings.battingStats?.length > 0) {
                matchContext += `Top Batters:\n`;
                const topBats = [...secondInnings.battingStats]
                    .sort((a, b) => b.runs - a.runs)
                    .slice(0, 3);
                topBats.forEach(b => {
                    matchContext += `  ${b.playerName}: ${b.runs} runs (${b.balls} balls, ${b.fours || 0}x4, ${b.sixes || 0}x6)\n`;
                });
            }
        }

        // Result
        if (match.status === 'completed' && match.result) {
            matchContext += `\n--- Result ---\n`;
            matchContext += `Winner: ${match.result.winnerName || 'Tied'}\n`;
            matchContext += `Margin: ${match.result.margin || 'N/A'}\n`;
            if (match.result.manOfTheMatch?.name) {
                matchContext += `Man of the Match: ${match.result.manOfTheMatch.name} (${match.result.manOfTheMatch.performance || ''})\n`;
            }
        }

        // Persona prompt
        const personaInstructions = {
            excited: "You are an EXTREMELY passionate and enthusiastic cricket commentator like Ravi Shastri. Use dramatic exclamations, vivid metaphors, and hype energy. Use phrases like 'WHAT A SHOT!', 'TRACER BULLET!', 'MASSIVE SIX!'. Be dramatic and exciting.",
            analytical: "You are a calm, analytical cricket commentator like Harsha Bhogle. Focus on tactical insights, stats comparisons, required rates, and strategic implications. Be insightful and data-driven.",
            sarcastic: "You are a witty, sarcastic cricket commentator. Use clever humor, ironic observations, and playful roasts. Make cricket entertaining through comedy while staying knowledgeable."
        };

        const prompt = `${personaInstructions[persona] || personaInstructions.excited}

Here is the current match situation:

${matchContext}

Based on the CURRENT match situation above, write a vivid, engaging 3-4 sentence commentary update. Make it feel like a LIVE broadcast moment. Reference actual player names and scores from the data. Do NOT add any headings, markdown formatting, or bullet points — just pure commentary text as if speaking on air.`;

        let commentary = '';
        try {
            commentary = await callGemini(prompt);
        } catch (geminiError) {
            console.warn('Gemini API call failed, using local fallback commentary:', geminiError.message);
            // Local fallback commentary builder
            const firstInnings = match.innings?.find(i => i.inningsNumber === 1);
            const secondInnings = match.innings?.find(i => i.inningsNumber === 2);
            
            if (match.status === 'completed' && match.result) {
                commentary = `🎙️ [Press Desk] And that is the match! ${match.result.winnerName} secures a spectacular victory by ${match.result.margin}. What a stellar contest we've witnessed here at ${match.venue || 'the arena'}!`;
            } else if (secondInnings) {
                const target = (firstInnings?.score?.runs || 0) + 1;
                const runsNeeded = target - secondInnings.score.runs;
                const overs = secondInnings.score.overs;
                const wickets = secondInnings.score.wickets;
                
                if (persona === 'analytical') {
                    commentary = `🎙️ [Match Center] Chasing a target of ${target}, ${secondInnings.battingTeam} is currently at ${secondInnings.score.runs}/${wickets} after ${overs} overs. They require another ${runsNeeded} runs. The required run rate is climbing, and bowlers are keeping a tight line. Crucial overs ahead!`;
                } else if (persona === 'sarcastic') {
                    commentary = `🎙️ [Match Center] Well, ${secondInnings.battingTeam} needs ${runsNeeded} runs to win. Currently sitting at ${secondInnings.score.runs}/${wickets}, the batters seem to be enjoying a relaxing walk in the park. Let's see if anyone remembers they need to swing the bat.`;
                } else {
                    commentary = `🎙️ [Match Center] WHAT A THRILLER! ${secondInnings.battingTeam} is chasing ${target} and stands at ${secondInnings.score.runs}/${wickets} in ${overs} overs! ${runsNeeded} runs needed to win! Every ball is absolute gold here, the tension is sky high!`;
                }
            } else if (firstInnings) {
                const score = firstInnings.score;
                if (persona === 'analytical') {
                    commentary = `🎙️ [Match Center] We are in the first innings, and ${firstInnings.battingTeam} has posted ${score.runs}/${score.wickets} in ${score.overs} overs. The current run rate is ${(score.runs / Math.max(score.overs, 1)).toFixed(2)}. Strategic placement and keeping wickets in hand will dictate the final total.`;
                } else if (persona === 'sarcastic') {
                    commentary = `🎙️ [Match Center] ${firstInnings.battingTeam} is currently at ${score.runs}/${score.wickets}. They're scoring runs at their own leisure, seemingly unaware that there's an actual match happening. Let's see if anyone wakes up.`;
                } else {
                    commentary = `🎙️ [Match Center] MASSIVE INNINGS IN PROGRESS! ${firstInnings.battingTeam} is firing away at ${score.runs}/${score.wickets} in ${score.overs} overs! The batters are looking to clear the boundary at every opportunity! High drama at ${match.venue || 'the stadium'}!`;
                }
            } else {
                commentary = `🎙️ [Match Center] The teams are on the field! Toss won by ${match.toss?.winner || 'Toss Winner'}, who decided to ${match.toss?.decision || 'play'}. Both sides looking exceptionally strong today and eager to get the game underway!`;
            }
        }

        return NextResponse.json({ commentary, persona });
    } catch (error) {
        console.error('Commentary API error:', error);
        return NextResponse.json({ error: 'Failed to generate commentary' }, { status: 500 });
    }
}
