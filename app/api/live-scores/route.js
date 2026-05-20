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

export async function GET() {
    const apiKey = process.env.CRICAPI_KEY?.trim();
    if (!apiKey) {
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    try {
        // Fetch both endpoints in parallel with timeout signal
        const [currentRes, upcomingRes] = await Promise.all([
            fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${apiKey}&offset=0`, {
                next: { revalidate: 60 },
                signal: controller.signal
            }),
            fetch(`https://api.cricapi.com/v1/matches?apikey=${apiKey}&offset=0`, {
                next: { revalidate: 300 },
                signal: controller.signal
            }),
        ]);

        clearTimeout(timeoutId);

        if (!currentRes.ok || !upcomingRes.ok) {
            console.error('[live-scores] External API returned error status');
            return NextResponse.json({ live: [], played: [], upcoming: [], error: 'External API error' });
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

        return NextResponse.json({ live, played, upcoming, error: apiError });
    } catch (err) {
        clearTimeout(timeoutId);
        console.error('[live-scores] Error:', err.name === 'AbortError' ? 'Request timed out' : err.message);

        // Return empty arrays instead of 500 to keep UI functional
        return NextResponse.json({
            live: [],
            played: [],
            upcoming: [],
            error: err.name === 'AbortError' ? 'Connection timed out' : 'Service temporarily unavailable'
        });
    }
}
