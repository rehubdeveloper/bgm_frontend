import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        const requiredFields = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'department',
            'date_of_birth',
            'marital_status',
            'gender',
            'occupation',
            'address',
            'password'
        ];

        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        // Forward the request to the external API
        console.log('Sending to external API:', body);

        const response = await fetch('https://jfgg9t4b-8000.uks1.devtunnels.ms/api/members/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
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
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
