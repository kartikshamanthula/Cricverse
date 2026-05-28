import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(request) {
    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
        }

        if (!GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
        }

        const res = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
            }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
            return NextResponse.json(
                { error: 'Gemini API error' },
                { status: res.status }
            );
        }

        const report = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Report generation failed.';
        return NextResponse.json({ report });

    } catch (error) {
        console.error('Tournament report API error:', error);
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}
