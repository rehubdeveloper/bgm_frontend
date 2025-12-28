import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.email || !body.password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Forward the request to the external API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: body.email,
                password: body.password,
            }),
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = { error: 'Invalid response from external API' };
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
