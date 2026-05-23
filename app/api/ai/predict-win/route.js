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
                temperature: 0.4,
                maxOutputTokens: 512,
            },
        }),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API error: ${err}`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function POST(request) {
    try {
        const { matchId } = await request.json();

        if (!matchId) {
            return NextResponse.json({ error: 'matchId is required' }, { status: 400 });
        }

        await connectDB();

        const match = await Match.findById(matchId);
        if (!match) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        const totalOvers = match.totalOvers || match.overs || 20;
        const firstInnings = match.innings?.find(i => i.inningsNumber === 1);
        const secondInnings = match.innings?.find(i => i.inningsNumber === 2);

        // If match hasn't started or no innings data
        if (!firstInnings) {
            return NextResponse.json({
                teamA: { name: match.teamA.name, probability: 50 },
                teamB: { name: match.teamB.name, probability: 50 },
                insight: 'Match has not started yet. Both teams have equal chances.',
                phase: 'pre-match'
            });
        }

        // Build situation context
        let situation = '';
        let teamAName = match.teamA.name;
        let teamBName = match.teamB.name;

        // Determine which team batted first
        const firstBattingTeam = firstInnings.battingTeam;
        const firstBowlingTeam = firstInnings.bowlingTeam;

        if (match.status === 'completed' && match.result) {
            // Match completed — return actual result
            const winnerName = match.result.winnerName;
            const isTeamA = winnerName === teamAName;
            return NextResponse.json({
                teamA: { name: teamAName, probability: isTeamA ? 100 : 0 },
                teamB: { name: teamBName, probability: isTeamA ? 0 : 100 },
                insight: `${winnerName} won by ${match.result.margin}. ${match.result.manOfTheMatch?.name ? `Man of the Match: ${match.result.manOfTheMatch.name}` : ''}`,
                phase: 'completed'
            });
        }

        // First innings in progress
        if (!secondInnings) {
            const score = firstInnings.score;
            const wicketsLost = score.wickets;
            const oversPlayed = score.overs;
            const runRate = oversPlayed > 0 ? (score.runs / oversPlayed).toFixed(2) : 0;
            const oversRemaining = totalOvers - oversPlayed;

            situation = `1st Innings in progress.\n`;
            situation += `${firstBattingTeam} is batting: ${score.runs}/${wicketsLost} in ${oversPlayed} overs.\n`;
            situation += `Current Run Rate: ${runRate}\n`;
            situation += `Overs remaining: ${oversRemaining}\n`;
            situation += `Total overs: ${totalOvers}\n`;
            situation += `Wickets in hand: ${10 - wicketsLost}\n`;

            // Heuristic base probability for 1st innings
            const projectedScore = oversPlayed > 0 ? Math.round((score.runs / oversPlayed) * totalOvers) : 0;
            const wicketPenalty = wicketsLost * 3;
            let battingTeamProb = 50 + Math.min(projectedScore / 10, 15) - wicketPenalty;
            battingTeamProb = Math.max(20, Math.min(80, battingTeamProb));

            const isBattingTeamA = firstBattingTeam === teamAName;

            const prompt = `You are a cricket analyst. Analyze this match situation and give a 1-2 sentence tactical insight.

Match: ${teamAName} vs ${teamBName}, ${totalOvers} overs per side.
${situation}

Projected 1st innings total: ~${projectedScore} runs.
Base win probability: ${firstBattingTeam} ${Math.round(battingTeamProb)}%, ${firstBowlingTeam} ${Math.round(100 - battingTeamProb)}%

Give a brief analytical insight about which team has the edge and why. No markdown, no headings, just plain text.`;

            let insight = '';
            try {
                insight = await callGemini(prompt);
            } catch (geminiError) {
                console.warn('Gemini API call failed, using local fallback win prediction insight:', geminiError.message);
                insight = `[Analysis] ${firstBattingTeam} is projected to score ~${projectedScore} runs. Maintaining wickets in hand is critical to build a competitive total.`;
            }

            return NextResponse.json({
                teamA: {
                    name: teamAName,
                    probability: Math.round(isBattingTeamA ? battingTeamProb : 100 - battingTeamProb)
                },
                teamB: {
                    name: teamBName,
                    probability: Math.round(isBattingTeamA ? 100 - battingTeamProb : battingTeamProb)
                },
                insight: insight.trim(),
                phase: '1st-innings'
            });
        }

        // Second innings in progress — chase situation
        const target = (firstInnings.score?.runs || 0) + 1;
        const chaseScore = secondInnings.score;
        const runsNeeded = target - chaseScore.runs;
        const ballsBowled = Math.floor(chaseScore.overs) * 6 + Math.round((chaseScore.overs % 1) * 10);
        const totalBalls = totalOvers * 6;
        const ballsRemaining = totalBalls - ballsBowled;
        const wicketsInHand = 10 - chaseScore.wickets;
        const reqRate = ballsRemaining > 0 ? ((runsNeeded / ballsRemaining) * 6).toFixed(2) : 999;
        const currentRR = chaseScore.overs > 0 ? (chaseScore.runs / chaseScore.overs).toFixed(2) : 0;

        situation = `2nd Innings — Chase in progress.\n`;
        situation += `${secondInnings.battingTeam} chasing ${target}.\n`;
        situation += `Current Score: ${chaseScore.runs}/${chaseScore.wickets} (${chaseScore.overs} overs)\n`;
        situation += `Runs needed: ${runsNeeded} off ${ballsRemaining} balls\n`;
        situation += `Required RR: ${reqRate} | Current RR: ${currentRR}\n`;
        situation += `Wickets in hand: ${wicketsInHand}\n`;

        // Chase probability heuristic
        const rrRatio = parseFloat(currentRR) / Math.max(parseFloat(reqRate), 0.01);
        let chasingTeamProb = 50;

        if (runsNeeded <= 0) {
            chasingTeamProb = 100;
        } else if (ballsRemaining <= 0 || wicketsInHand <= 0) {
            chasingTeamProb = 0;
        } else {
            // Factor in run rate comparison
            chasingTeamProb += (rrRatio - 1) * 30;
            // Factor in wickets
            chasingTeamProb += (wicketsInHand - 5) * 3;
            // Factor in balls remaining vs runs needed
            const runBallRatio = ballsRemaining / Math.max(runsNeeded, 1);
            chasingTeamProb += (runBallRatio - 1) * 10;
            chasingTeamProb = Math.max(5, Math.min(95, chasingTeamProb));
        }

        const chasingTeam = secondInnings.battingTeam;
        const defendingTeam = secondInnings.bowlingTeam;
        const isChasingTeamA = chasingTeam === teamAName;

        const prompt = `You are a cricket analyst. Analyze this chase situation and give a 1-2 sentence tactical insight.

Match: ${teamAName} vs ${teamBName}, ${totalOvers} overs per side.
1st Innings: ${firstBattingTeam} scored ${firstInnings.score.runs}/${firstInnings.score.wickets}.
${situation}

Base win probability: ${chasingTeam} (chasing) ${Math.round(chasingTeamProb)}%, ${defendingTeam} (defending) ${Math.round(100 - chasingTeamProb)}%

Give a brief analytical insight about the chase. No markdown, no headings, just plain text.`;

        let insight = '';
        try {
            insight = await callGemini(prompt);
        } catch (geminiError) {
            console.warn('Gemini API call failed, using local fallback win prediction insight:', geminiError.message);
            insight = `[Analysis] ${chasingTeam} requires ${runsNeeded} runs from ${ballsRemaining} deliveries at an RRR of ${reqRate} RPO. ${defendingTeam} needs to maintain defensive line and length.`;
        }

        return NextResponse.json({
            teamA: {
                name: teamAName,
                probability: Math.round(isChasingTeamA ? chasingTeamProb : 100 - chasingTeamProb)
            },
            teamB: {
                name: teamBName,
                probability: Math.round(isChasingTeamA ? 100 - chasingTeamProb : chasingTeamProb)
            },
            insight: insight.trim(),
            phase: '2nd-innings'
        });

    } catch (error) {
        console.error('Win prediction API error:', error);
        return NextResponse.json({ error: error.message || 'Failed to predict win' }, { status: 500 });
    }
}
