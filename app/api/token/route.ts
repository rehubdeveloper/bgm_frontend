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
        console.log('Sending login request to external API:', { email: body.email });

        const response = await fetch('https://jfgg9t4b-8000.uks1.devtunnels.ms/api/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: body.email,
                password: body.password,
            }),
        });

        console.log('External API response status:', response.status);

        let data;
        try {
            data = await response.json();
            console.log('External API response data:', data);
        } catch (e) {
            console.log('Failed to parse response as JSON');
            data = { error: 'Invalid response from external API' };
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
