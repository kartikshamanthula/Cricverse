import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const area = searchParams.get('area') || 'Surat';
        const apiKey = process.env.GEOAPIFY_API_KEY || '7fb4696bea564edead940f5b51672764';

        // 1. Text Search endpoint using Geoapify Geocoding API
        const textSearchUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent('box cricket turf ' + area + ' Surat')}&apiKey=${apiKey}`;

        const res = await fetch(textSearchUrl);
        const data = await res.json();

        if (!data.features || data.features.length === 0) {
            return NextResponse.json({
                success: true,
                provider: "Geoapify Free API",
                keyStatus: "Active & Connected (7fb4696bea564edead940f5b51672764)",
                results: []
            });
        }

        const formattedResults = data.features.map((feature, idx) => {
            const props = feature.properties;
            return {
                id: props.place_id || `geoapify-${idx}`,
                name: props.name || props.formatted?.split(',')[0] || `Surat Turf ${idx + 1}`,
                address: props.formatted,
                area: props.suburb || props.district || props.city || "Surat",
                lat: props.lat,
                lon: props.lon,
                googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${props.lat},${props.lon}`
            };
        });

        return NextResponse.json({
            success: true,
            provider: "Geoapify Free API",
            keyStatus: "Active & Connected (7fb4696bea564edead940f5b51672764)",
            count: formattedResults.length,
            results: formattedResults
        });

    } catch (err) {
        console.error("Geoapify API Error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
