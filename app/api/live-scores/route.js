import { NextResponse } from 'next/server';

function sanitize(m) {
    return {
        id: m.id,
        name: m.name,
        matchType: m.matchType ?? 'unknown',
        status: m.status,
        matchStarted: m.matchStarted ?? false,
        matchEnded: m.matchEnded ?? false,
        teams: m.teams ?? [],
        teamInfo: m.teamInfo ?? [],
        score: m.score ?? [],
        date: m.date,
        dateTimeGMT: m.dateTimeGMT,
        venue: m.venue,
    };
}

const mockLiveMatches = [
    {
        id: "mock-live-1",
        name: "India vs Pakistan",
        matchType: "t20",
        status: "India won by 6 wickets",
        matchStarted: true,
        matchEnded: false,
        teams: ["India", "Pakistan"],
        teamInfo: [
            { name: "India", shortname: "IND" },
            { name: "Pakistan", shortname: "PAK" }
        ],
        score: [
            { r: 152, w: 8, o: 20, inning: "Pakistan Innings" },
            { r: 154, w: 4, o: 18.2, inning: "India Innings" }
        ],
        date: new Date().toISOString().split('T')[0],
        dateTimeGMT: new Date().toISOString(),
        venue: "Melbourne Cricket Ground, Melbourne"
    },
    {
        id: "mock-live-2",
        name: "Australia vs England",
        matchType: "odi",
        status: "Australia need 45 runs in 8.0 overs",
        matchStarted: true,
        matchEnded: false,
        teams: ["Australia", "England"],
        teamInfo: [
            { name: "Australia", shortname: "AUS" },
            { name: "England", shortname: "ENG" }
        ],
        score: [
            { r: 288, w: 6, o: 50, inning: "England Innings" },
            { r: 244, w: 5, o: 42, inning: "Australia Innings" }
        ],
        date: new Date().toISOString().split('T')[0],
        dateTimeGMT: new Date().toISOString(),
        venue: "Lord's, London"
    }
];

const mockPlayedMatches = [
    {
        id: "mock-played-1",
        name: "New Zealand vs South Africa",
        matchType: "t20",
        status: "New Zealand won by 15 runs",
        matchStarted: true,
        matchEnded: true,
        teams: ["New Zealand", "South Africa"],
        teamInfo: [
            { name: "New Zealand", shortname: "NZ" },
            { name: "South Africa", shortname: "SA" }
        ],
        score: [
            { r: 185, w: 5, o: 20, inning: "New Zealand Innings" },
            { r: 170, w: 8, o: 20, inning: "South Africa Innings" }
        ],
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        dateTimeGMT: new Date(Date.now() - 86400000).toISOString(),
        venue: "Eden Park, Auckland"
    }
];

const mockUpcomingMatches = [
    {
        id: "mock-upcoming-1",
        name: "West Indies vs Sri Lanka",
        matchType: "t20",
        status: "Scheduled",
        matchStarted: false,
        matchEnded: false,
        teams: ["West Indies", "Sri Lanka"],
        teamInfo: [
            { name: "West Indies", shortname: "WI" },
            { name: "Sri Lanka", shortname: "SL" }
        ],
        score: [],
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        dateTimeGMT: new Date(Date.now() + 86400000).toISOString(),
        venue: "Kensington Oval, Barbados"
    },
    {
        id: "mock-upcoming-2",
        name: "Bangladesh vs Afghanistan",
        matchType: "t20",
        status: "Scheduled",
        matchStarted: false,
        matchEnded: false,
        teams: ["Bangladesh", "Afghanistan"],
        teamInfo: [
            { name: "Bangladesh", shortname: "BAN" },
            { name: "Afghanistan", shortname: "AFG" }
        ],
        score: [],
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        dateTimeGMT: new Date(Date.now() + 172800000).toISOString(),
        venue: "Sher-e-Bangla National Cricket Stadium, Dhaka"
    }
];

export async function GET() {
    const apiKey = process.env.CRICAPI_KEY?.trim();
    if (!apiKey) {
        return NextResponse.json({
            live: [],
            played: [],
            upcoming: [],
            error: 'CricAPI key not configured. Right now this feature is under working.'
        });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    try {
        const [currentRes, upcomingRes] = await Promise.all([
            fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${apiKey}&offset=0`, {
                cache: 'no-store',
                signal: controller.signal
            }),
            fetch(`https://api.cricapi.com/v1/matches?apikey=${apiKey}&offset=0`, {
                cache: 'no-store',
                signal: controller.signal
            }),
        ]);

        clearTimeout(timeoutId);

        if (!currentRes.ok || !upcomingRes.ok) {
            console.error('[live-scores] External API returned error status');
            return NextResponse.json({
                live: [],
                played: [],
                upcoming: [],
                error: 'External API error status. Right now this feature is under working.'
            });
        }

        const [currentJson, upcomingJson] = await Promise.all([
            currentRes.json(),
            upcomingRes.json(),
        ]);

        const currentData = currentJson.status === 'success' ? (currentJson.data ?? []) : [];
        const upcomingData = upcomingJson.status === 'success' ? (upcomingJson.data ?? []) : [];

        let apiError = null;
        if (currentJson.status !== 'success') apiError = currentJson.reason || 'Current matches API error';
        else if (upcomingJson.status !== 'success') apiError = upcomingJson.reason || 'Upcoming matches API error';

        if (apiError) {
            console.warn('[live-scores] CricAPI reported error:', apiError);
            return NextResponse.json({
                live: [],
                played: [],
                upcoming: [],
                error: `CricAPI Error: ${apiError}. Right now this feature is under working.`
            });
        }

        const live = currentData
            .filter((m) => m.matchStarted && !m.matchEnded)
            .slice(0, 10)
            .map(sanitize);

        const played = currentData
            .filter((m) => m.matchEnded)
            .slice(0, 10)
            .map(sanitize);

        const upcoming = upcomingData
            .filter((m) => !m.matchStarted && !m.matchEnded)
            .sort((a, b) => new Date(a.dateTimeGMT) - new Date(b.dateTimeGMT))
            .slice(0, 10)
            .map(sanitize);

        return NextResponse.json({ live, played, upcoming, error: null });
    } catch (err) {
        clearTimeout(timeoutId);
        console.error('[live-scores] Error:', err.name === 'AbortError' ? 'Request timed out' : err.message);

        return NextResponse.json({
            live: [],
            played: [],
            upcoming: [],
            error: err.name === 'AbortError' ? 'Connection timed out. Right now this feature is under working.' : `${err.message}. Right now this feature is under working.`
        });
    }
}
