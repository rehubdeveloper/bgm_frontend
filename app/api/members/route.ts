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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/members/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
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
