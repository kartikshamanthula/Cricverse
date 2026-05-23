import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

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
                maxOutputTokens: 1024,
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
        const { message, style, height, budget, chatHistory = [] } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'message is required' }, { status: 400 });
        }

        await connectDB();

        // Fetch all active products
        const products = await Product.find({ isActive: true }).lean();

        // Build catalog context
        let catalog = 'Available products in the CricVerse store:\n\n';
        products.forEach((p) => {
            catalog += `- ID: ${p._id} | Name: "${p.name}" | Category: ${p.category} | Price: ₹${p.price} | Rating: ${p.rating}/5 | Stock: ${p.stock} | Description: ${p.description}\n`;
        });

        // Build chat context
        let chatContext = '';
        if (chatHistory.length > 0) {
            chatContext = '\nPrevious conversation:\n';
            chatHistory.slice(-6).forEach(msg => {
                chatContext += `${msg.role === 'user' ? 'Customer' : 'AI Assistant'}: ${msg.content}\n`;
            });
        }

        const playerProfile = [];
        if (style) playerProfile.push(`Playing style: ${style}`);
        if (height) playerProfile.push(`Height: ${height}`);
        if (budget) playerProfile.push(`Budget: ₹${budget}`);

        const prompt = `You are CricVerse AI — a friendly, knowledgeable cricket equipment consultant chatbot for the CricVerse online store. You help players find the perfect gear.

${playerProfile.length > 0 ? `\nPlayer Profile:\n${playerProfile.join('\n')}\n` : ''}

${catalog}
${chatContext}

Customer's latest message: "${message}"

Instructions:
1. Be helpful, friendly, and conversational. Use cricket terminology naturally.
2. When recommending products, ALWAYS reference products from the catalog above by their exact names and prices.
3. If the customer asks about products outside our catalog, politely let them know what we DO have.
4. Consider their budget, playing style, and height when making recommendations.
5. Keep responses concise (2-4 sentences for simple questions, longer for detailed recommendations).
6. At the end of your response, if you recommended specific products, add a line starting with "RECOMMENDED_IDS:" followed by comma-separated product IDs from the catalog. If no specific products recommended, omit this line.

Respond naturally as a helpful shopping assistant:`;

        let rawResponse = '';
        try {
            rawResponse = await callGemini(prompt);
        } catch (geminiError) {
            console.warn('Gemini API call failed, using local fallback shop consultant response:', geminiError.message);
            // Simple keyword match logic
            let matched = [];
            const cleanMsg = message.toLowerCase();
            
            if (cleanMsg.includes('bat')) {
                matched = products.filter(p => p.category?.toLowerCase().includes('bat') || p.name?.toLowerCase().includes('bat')).slice(0, 2);
            } else if (cleanMsg.includes('ball')) {
                matched = products.filter(p => p.category?.toLowerCase().includes('ball') || p.name?.toLowerCase().includes('ball')).slice(0, 2);
            } else if (cleanMsg.includes('glove') || cleanMsg.includes('pad') || cleanMsg.includes('guard') || cleanMsg.includes('protection')) {
                matched = products.filter(p => p.category?.toLowerCase().includes('protection') || p.category?.toLowerCase().includes('gear') || p.name?.toLowerCase().includes('glove') || p.name?.toLowerCase().includes('pad')).slice(0, 2);
            } else {
                // If budget filter is present, filter by budget
                if (budget && !isNaN(budget)) {
                    matched = products.filter(p => p.price <= parseFloat(budget)).slice(0, 2);
                }
                if (matched.length === 0) {
                    matched = products.slice(0, 2);
                }
            }
            
            const recNames = matched.map(m => `"${m.name}" (₹${m.price.toLocaleString('en-IN')})`).join(' and ');
            rawResponse = `I am currently operating in offline mode. Based on our stock, I highly recommend checking out ${recNames || 'our bestsellers'} for your playing style!\n\nRECOMMENDED_IDS: ${matched.map(m => m._id.toString()).join(',')}`;
        }

        // Parse the response for recommended product IDs
        let responseText = rawResponse;
        let recommendedIds = [];

        const idMatch = rawResponse.match(/RECOMMENDED_IDS:\s*(.+)/i);
        if (idMatch) {
            responseText = rawResponse.replace(/RECOMMENDED_IDS:\s*.+/i, '').trim();
            recommendedIds = idMatch[1].split(',').map(id => id.trim()).filter(Boolean);
        }

        // Fetch recommended products
        let recommendedProducts = [];
        if (recommendedIds.length > 0) {
            recommendedProducts = await Product.find({
                _id: { $in: recommendedIds },
                isActive: true
            }).lean();

            // Serialize for client
            recommendedProducts = recommendedProducts.map(p => ({
                _id: p._id.toString(),
                name: p.name,
                description: p.description,
                price: p.price,
                category: p.category,
                rating: p.rating,
                image: p.image,
                stock: p.stock,
            }));
        }

        return NextResponse.json({
            response: responseText,
            recommendedProducts,
        });

    } catch (error) {
        console.error('Shop consultant API error:', error);
        return NextResponse.json({ error: error.message || 'Failed to get recommendation' }, { status: 500 });
    }
}
