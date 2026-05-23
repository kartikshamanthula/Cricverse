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
                temperature: 0.7,
                maxOutputTokens: 2048,
            },
        }),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API error: ${err}`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No recap available.';
}

export async function POST(request) {
    try {
        const { matchId } = await request.json();

        if (!matchId) {
            return NextResponse.json({ error: 'matchId is required' }, { status: 400 });
        }

        await connectDB();

        const match = await Match.findById(matchId)
            .populate('teamA.teamId', 'name')
            .populate('teamB.teamId', 'name');

        if (!match) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        const totalOvers = match.totalOvers || match.overs || 20;
        const firstInnings = match.innings?.find(i => i.inningsNumber === 1);
        const secondInnings = match.innings?.find(i => i.inningsNumber === 2);

        let scorecardContext = `Match: ${match.teamA.name} vs ${match.teamB.name}\n`;
        scorecardContext += `Format: ${match.matchType || 'T20'}, ${totalOvers} overs\n`;
        scorecardContext += `Venue: ${match.venue}\n`;
        scorecardContext += `Status: ${match.status}\n`;

        if (match.toss?.winner) {
            scorecardContext += `Toss: ${match.toss.winner} won and chose to ${match.toss.decision}\n`;
        }

        // First innings details
        if (firstInnings) {
            scorecardContext += `\n--- 1st Innings: ${firstInnings.battingTeam} ---\n`;
            scorecardContext += `Score: ${firstInnings.score.runs}/${firstInnings.score.wickets} (${firstInnings.score.overs} overs)\n`;

            if (firstInnings.battingStats?.length > 0) {
                scorecardContext += `Batting Scorecard:\n`;
                firstInnings.battingStats
                    .filter(b => b.balls > 0)
                    .forEach(b => {
                        scorecardContext += `  ${b.playerName}: ${b.runs} runs (${b.balls} balls, ${b.fours || 0}x4, ${b.sixes || 0}x6)${b.isOut ? ' — OUT' : ' — not out'}\n`;
                    });
            }
            if (firstInnings.bowlingStats?.length > 0) {
                scorecardContext += `Bowling Figures:\n`;
                firstInnings.bowlingStats
                    .filter(b => b.overs > 0)
                    .forEach(b => {
                        scorecardContext += `  ${b.playerName}: ${b.wickets}/${b.runs} (${b.overs} overs, eco ${b.economy?.toFixed(1) || 'N/A'})\n`;
                    });
            }
        }

        // Second innings details
        if (secondInnings) {
            scorecardContext += `\n--- 2nd Innings: ${secondInnings.battingTeam} ---\n`;
            scorecardContext += `Score: ${secondInnings.score.runs}/${secondInnings.score.wickets} (${secondInnings.score.overs} overs)\n`;

            if (secondInnings.battingStats?.length > 0) {
                scorecardContext += `Batting Scorecard:\n`;
                secondInnings.battingStats
                    .filter(b => b.balls > 0)
                    .forEach(b => {
                        scorecardContext += `  ${b.playerName}: ${b.runs} runs (${b.balls} balls, ${b.fours || 0}x4, ${b.sixes || 0}x6)${b.isOut ? ' — OUT' : ' — not out'}\n`;
                    });
            }
            if (secondInnings.bowlingStats?.length > 0) {
                scorecardContext += `Bowling Figures:\n`;
                secondInnings.bowlingStats
                    .filter(b => b.overs > 0)
                    .forEach(b => {
                        scorecardContext += `  ${b.playerName}: ${b.wickets}/${b.runs} (${b.overs} overs, eco ${b.economy?.toFixed(1) || 'N/A'})\n`;
                    });
            }
        }

        // Result
        if (match.result) {
            scorecardContext += `\n--- Result ---\n`;
            scorecardContext += `Winner: ${match.result.winnerName || 'Tied'}\n`;
            scorecardContext += `Margin: ${match.result.margin || 'N/A'}\n`;
            if (match.result.manOfTheMatch?.name) {
                scorecardContext += `Man of the Match: ${match.result.manOfTheMatch.name} (${match.result.manOfTheMatch.performance || ''})\n`;
            }
        }

        const prompt = `You are a top-tier cricket journalist writing for a premium sports magazine. Write a thrilling, professional match recap article based on this scorecard data.

${scorecardContext}

Write a compelling 300-400 word match report that:
1. Opens with a dramatic headline-worthy lead paragraph capturing the match's defining moment
2. Covers key batting and bowling performances with vivid, descriptive language
3. Highlights turning points and momentum shifts during the match
4. Includes strategic analysis of key decisions (toss, batting order, bowling changes)
5. Ends with implications for the teams going forward

Use rich, professional sports journalism language. Include player names and specific stats naturally in the narrative. Make it read like an ESPNcricinfo or Cricbuzz match report. Use emojis sparingly for section breaks. No markdown headings — just flowing professional paragraphs.`;

        let recap = '';
        try {
            recap = await callGemini(prompt);
        } catch (geminiError) {
            console.warn('Gemini API call failed, using local fallback recap:', geminiError.message);
            recap = `📰 MATCH RECAP: ${match.teamA.name} VS ${match.teamB.name} (Local Summary)

The clash between ${match.teamA.name} and ${match.teamB.name} at ${match.venue || 'the stadium'} proved to be a highly engaging encounter. ${match.toss?.winner ? `After ${match.toss.winner} won the toss and elected to ${match.toss.decision}, the tactical lines were drawn early.` : ''}

In the first innings, ${firstInnings ? `${firstInnings.battingTeam} posted a total of ${firstInnings.score.runs}/${firstInnings.score.wickets} in their allotted ${firstInnings.score.overs} overs.` : 'scoring was underway with great intensity.'}

${secondInnings ? `Chasing a target of ${(firstInnings?.score?.runs || 0) + 1}, ${secondInnings.battingTeam} finished their response at ${secondInnings.score.runs}/${secondInnings.score.wickets} after ${secondInnings.score.overs} overs.` : ''}

${match.result?.winnerName ? `Ultimately, ${match.result.winnerName} clinched victory by ${match.result.margin}. ${match.result.manOfTheMatch?.name ? `The player of the match honors went to ${match.result.manOfTheMatch.name} for an outstanding performance.` : ''}` : 'The match has concluded with teams showing highly promising strategic approaches.'}`;
        }

        return NextResponse.json({
            recap,
            matchInfo: {
                teams: `${match.teamA.name} vs ${match.teamB.name}`,
                status: match.status,
                result: match.result?.winnerName
                    ? `${match.result.winnerName} won by ${match.result.margin}`
                    : match.status === 'completed' ? 'Tied' : 'In Progress',
            }
        });

    } catch (error) {
        console.error('Match recap API error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate recap' }, { status: 500 });
    }
}
