// @ts-ignore: 'next/server' types may not be available in this environment
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);


    // Check for authorization header (required for admin content)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        
        return NextResponse.json(
            { error: 'Authorization required' },
            { status: 401 }
        );
    }

    try {
        // Forward the request to the external API admin-panel endpoint
        // Use Basic auth as expected by the backend API
        const basicAuth = 'Basic YWRtaW5AZ21haWwuY29tOmFkbWlu'; // admin@gmail.com:admin
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/departments/`;

        const fetchStartTime = Date.now();
        const response = await fetch(externalApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': basicAuth,
            },
        });

        const fetchDuration = Date.now() - fetchStartTime;
        

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            
            // Clone the response to avoid body consumption issues
            const responseClone = response.clone();
            try {
                const rawText = await responseClone.text();
            } catch (textError) {
                
            }
            data = { error: 'Invalid response from external API' };
        }

        const totalDuration = Date.now() - startTime;
        

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        const totalDuration = Date.now() - startTime;
        console.error(`[${requestId}] 💥 Departments fetch error after ${totalDuration}ms:`, error);

        const errorDetails = error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
        } : { message: 'Unknown error' };

        console.error(`[${requestId}] 🔍 Error details:`, errorDetails);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);


    // Check for authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        
        return NextResponse.json(
            { error: 'Authorization required' },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();

        // Forward the request to the external API admin-panel endpoint
        // Use Basic auth as expected by the backend API
        const basicAuth = 'Basic YWRtaW5AZ21haWwuY29tOmFkbWlu'; // admin@gmail.com:admin
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/departments/`;

        const fetchStartTime = Date.now();
        const response = await fetch(externalApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': basicAuth,
            },
            body: JSON.stringify(body),
        });

        const fetchDuration = Date.now() - fetchStartTime;
        

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            
            data = { error: 'Invalid response from external API' };
        }

        const totalDuration = Date.now() - startTime;
        

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        const totalDuration = Date.now() - startTime;
        console.error(`[${requestId}] 💥 Department creation error after ${totalDuration}ms:`, error);

        const errorDetails = error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
        } : { message: 'Unknown error' };

        console.error(`[${requestId}] 🔍 Error details:`, errorDetails);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
