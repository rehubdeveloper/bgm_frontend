// @ts-ignore: 'next/server' types may not be available in this environment
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    const { id } = await params;


    // Check for authorization header (required for admin content)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        
        return NextResponse.json(
            { error: 'Authorization required' },
            { status: 401 }
        );
    }

    try {
        // Forward the request to the external API content endpoint
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/testimonies/${id}/`;

        const fetchStartTime = Date.now();
        const response = await fetch(externalApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
        });

        const fetchDuration = Date.now() - fetchStartTime;
        

        let data;
        if (response.status === 404) {
            
            data = { error: 'Testimony not found' };
        } else if (response.status >= 400) {
            // Try to get error details for other client/server errors
            try {
                data = await response.json();
            } catch (parseError) {
                
                try {
                    const rawText = await response.text();
                    data = { error: 'Invalid error response from external API' };
                } catch (textError) {
                    data = { error: 'Could not read error response' };
                }
            }
        } else {
            // Success response
            try {
                data = await response.json();
            } catch (parseError) {
                
                try {
                    const rawText = await response.text();
                    data = { error: 'Invalid success response from external API' };
                } catch (textError) {
                    data = { success: true };
                }
            }
        }

        const totalDuration = Date.now() - startTime;
        

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        const totalDuration = Date.now() - startTime;
        console.error(`[${requestId}] 💥 Individual testimony fetch error after ${totalDuration}ms:`, error);

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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    const { id } = await params;


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

        // Forward the request to the external API
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/testimonies/${id}/`;

        const fetchStartTime = Date.now();
        const response = await fetch(externalApiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
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
        console.error(`[${requestId}] 💥 Testimony update error after ${totalDuration}ms:`, error);

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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    const { id } = await params;


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

        // Forward the request to the external API
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/testimonies/${id}/`;

        const fetchStartTime = Date.now();
        const response = await fetch(externalApiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
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
        console.error(`[${requestId}] 💥 Testimony partial update error after ${totalDuration}ms:`, error);

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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    const { id } = await params;


    // Check for authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        
        return NextResponse.json(
            { error: 'Authorization required' },
            { status: 401 }
        );
    }

    try {
        // Forward the request to the external API
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/testimonies/${id}/`;

        const fetchStartTime = Date.now();
        const response = await fetch(externalApiUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader,
            },
        });

        const fetchDuration = Date.now() - fetchStartTime;
        

        // Handle different response statuses for DELETE
        if (response.status === 204) {
            // No content response - successful deletion
            const totalDuration = Date.now() - startTime;
            

            return NextResponse.json({ success: true }, { status: 200 });
        } else if (response.status === 404) {
            // Testimony not found
            
            return NextResponse.json(
                { error: 'Testimony not found' },
                { status: 404 }
            );
        } else if (response.status >= 400) {
            // Try to get error details for other client/server errors
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                
                try {
                    const rawText = await response.text();
                    data = { error: 'Invalid error response from external API' };
                } catch (textError) {
                    data = { error: 'Could not read error response' };
                }
            }

            const totalDuration = Date.now() - startTime;
            
            return NextResponse.json(data, { status: response.status });
        } else {
            // Unexpected success response
            const totalDuration = Date.now() - startTime;
            
            return NextResponse.json(
                { success: true, message: 'Testimony deletion completed' },
                { status: 200 }
            );
        }
    } catch (error) {
        const totalDuration = Date.now() - startTime;
        console.error(`[${requestId}] 💥 Testimony deletion error after ${totalDuration}ms:`, error);

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
