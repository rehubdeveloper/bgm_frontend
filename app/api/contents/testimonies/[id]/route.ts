// @ts-ignore: 'next/server' types may not be available in this environment
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    const { id } = await params;

    console.log(`[${requestId}] 🚀 Starting individual testimony fetch request`);
    console.log(`[${requestId}] 📍 Request URL: ${request.url}`);
    console.log(`[${requestId}] 📝 Request Method: ${request.method}`);
    console.log(`[${requestId}] 🆔 Testimony ID: ${id}`);

    // Check for authorization header (required for admin content)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log(`[${requestId}] ❌ No authorization header provided`);
        return NextResponse.json(
            { error: 'Authorization required' },
            { status: 401 }
        );
    }

    try {
        // Forward the request to the external API content endpoint
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/testimonies/${id}/`;
        console.log(`[${requestId}] 🌐 Forwarding to external API: ${externalApiUrl}`);

        const fetchStartTime = Date.now();
        const response = await fetch(externalApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
        });

        const fetchDuration = Date.now() - fetchStartTime;
        console.log(`[${requestId}] ⏱️ External API request took ${fetchDuration}ms`);
        console.log(`[${requestId}] 📊 External API response status: ${response.status} ${response.statusText}`);

        let data;
        if (response.status === 404) {
            console.log(`[${requestId}] ❌ Testimony not found (404) - likely doesn't exist`);
            console.log(`[${requestId}] 📄 Response headers:`, Object.fromEntries(response.headers.entries()));
            data = { error: 'Testimony not found' };
        } else if (response.status >= 400) {
            // Try to get error details for other client/server errors
            try {
                console.log(`[${requestId}] 📥 Parsing external API error response...`);
                data = await response.json();
                console.log(`[${requestId}] 📋 External API error data:`, JSON.stringify(data, null, 2));
            } catch (parseError) {
                console.log(`[${requestId}] ❌ Failed to parse external API error response as JSON:`, parseError);
                try {
                    const rawText = await response.text();
                    console.log(`[${requestId}] 📄 Raw error response text (first 500 chars):`, rawText.substring(0, 500));
                    data = { error: 'Invalid error response from external API' };
                } catch (textError) {
                    console.log(`[${requestId}] 💥 Could not read error response body:`, textError);
                    data = { error: 'Could not read error response' };
                }
            }
        } else {
            // Success response
            try {
                console.log(`[${requestId}] 📥 Parsing external API response...`);
                data = await response.json();
                console.log(`[${requestId}] 📋 External API response data:`, JSON.stringify(data, null, 2));
            } catch (parseError) {
                console.log(`[${requestId}] ❌ Failed to parse external API response as JSON:`, parseError);
                try {
                    const rawText = await response.text();
                    console.log(`[${requestId}] 📄 Raw response text (first 500 chars):`, rawText.substring(0, 500));
                    data = { error: 'Invalid success response from external API' };
                } catch (textError) {
                    console.log(`[${requestId}] 💥 Could not read response body:`, textError);
                    data = { success: true };
                }
            }
        }

        const totalDuration = Date.now() - startTime;
        console.log(`[${requestId}] ✅ Individual testimony fetch completed successfully in ${totalDuration}ms`);
        console.log(`[${requestId}] 🎯 Returning response with status: ${response.status}`);

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

    console.log(`[${requestId}] 🚀 Starting testimony update (PUT) request`);
    console.log(`[${requestId}] 📍 Request URL: ${request.url}`);
    console.log(`[${requestId}] 📝 Request Method: ${request.method}`);
    console.log(`[${requestId}] 🆔 Testimony ID: ${id}`);

    // Check for authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log(`[${requestId}] ❌ No authorization header provided`);
        return NextResponse.json(
            { error: 'Authorization required' },
            { status: 401 }
        );
    }

    try {
        console.log(`[${requestId}] 📥 Parsing request body...`);
        const body = await request.json();
        console.log(`[${requestId}] 📋 Received body:`, JSON.stringify(body, null, 2));

        // Forward the request to the external API
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/testimonies/${id}/`;
        console.log(`[${requestId}] 🌐 Forwarding to external API: ${externalApiUrl}`);

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
        console.log(`[${requestId}] ⏱️ External API request took ${fetchDuration}ms`);
        console.log(`[${requestId}] 📊 External API response status: ${response.status} ${response.statusText}`);

        let data;
        try {
            console.log(`[${requestId}] 📥 Parsing external API response...`);
            data = await response.json();
            console.log(`[${requestId}] 📋 External API response data:`, JSON.stringify(data, null, 2));
        } catch (parseError) {
            console.log(`[${requestId}] ❌ Failed to parse external API response as JSON:`, parseError);
            console.log(`[${requestId}] 📄 Raw response text:`, await response.text());
            data = { error: 'Invalid response from external API' };
        }

        const totalDuration = Date.now() - startTime;
        console.log(`[${requestId}] ✅ Testimony update completed successfully in ${totalDuration}ms`);
        console.log(`[${requestId}] 🎯 Returning response with status: ${response.status}`);

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

    console.log(`[${requestId}] 🚀 Starting testimony partial update (PATCH) request`);
    console.log(`[${requestId}] 📍 Request URL: ${request.url}`);
    console.log(`[${requestId}] 📝 Request Method: ${request.method}`);
    console.log(`[${requestId}] 🆔 Testimony ID: ${id}`);

    // Check for authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log(`[${requestId}] ❌ No authorization header provided`);
        return NextResponse.json(
            { error: 'Authorization required' },
            { status: 401 }
        );
    }

    try {
        console.log(`[${requestId}] 📥 Parsing request body...`);
        const body = await request.json();
        console.log(`[${requestId}] 📋 Received body:`, JSON.stringify(body, null, 2));

        // Forward the request to the external API
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/testimonies/${id}/`;
        console.log(`[${requestId}] 🌐 Forwarding to external API: ${externalApiUrl}`);

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
        console.log(`[${requestId}] ⏱️ External API request took ${fetchDuration}ms`);
        console.log(`[${requestId}] 📊 External API response status: ${response.status} ${response.statusText}`);

        let data;
        try {
            console.log(`[${requestId}] 📥 Parsing external API response...`);
            data = await response.json();
            console.log(`[${requestId}] 📋 External API response data:`, JSON.stringify(data, null, 2));
        } catch (parseError) {
            console.log(`[${requestId}] ❌ Failed to parse external API response as JSON:`, parseError);
            console.log(`[${requestId}] 📄 Raw response text:`, await response.text());
            data = { error: 'Invalid response from external API' };
        }

        const totalDuration = Date.now() - startTime;
        console.log(`[${requestId}] ✅ Testimony partial update completed successfully in ${totalDuration}ms`);
        console.log(`[${requestId}] 🎯 Returning response with status: ${response.status}`);

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

    console.log(`[${requestId}] 🚀 Starting testimony deletion request`);
    console.log(`[${requestId}] 📍 Request URL: ${request.url}`);
    console.log(`[${requestId}] 📝 Request Method: ${request.method}`);
    console.log(`[${requestId}] 🆔 Testimony ID: ${id}`);

    // Check for authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log(`[${requestId}] ❌ No authorization header provided`);
        return NextResponse.json(
            { error: 'Authorization required' },
            { status: 401 }
        );
    }

    try {
        // Forward the request to the external API
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/testimonies/${id}/`;
        console.log(`[${requestId}] 🌐 Forwarding to external API: ${externalApiUrl}`);

        const fetchStartTime = Date.now();
        const response = await fetch(externalApiUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader,
            },
        });

        const fetchDuration = Date.now() - fetchStartTime;
        console.log(`[${requestId}] ⏱️ External API request took ${fetchDuration}ms`);
        console.log(`[${requestId}] 📊 External API response status: ${response.status} ${response.statusText}`);

        // Handle different response statuses for DELETE
        if (response.status === 204) {
            // No content response - successful deletion
            const totalDuration = Date.now() - startTime;
            console.log(`[${requestId}] ✅ Testimony deletion completed successfully in ${totalDuration}ms`);
            console.log(`[${requestId}] 🎯 Returning success response`);

            return NextResponse.json({ success: true }, { status: 200 });
        } else if (response.status === 404) {
            // Testimony not found
            console.log(`[${requestId}] ❌ Testimony not found (404)`);
            return NextResponse.json(
                { error: 'Testimony not found' },
                { status: 404 }
            );
        } else if (response.status >= 400) {
            // Try to get error details for other client/server errors
            let data;
            try {
                console.log(`[${requestId}] 📥 Parsing external API error response...`);
                data = await response.json();
                console.log(`[${requestId}] 📋 External API error data:`, JSON.stringify(data, null, 2));
            } catch (parseError) {
                console.log(`[${requestId}] ❌ Failed to parse external API error response as JSON:`, parseError);
                try {
                    const rawText = await response.text();
                    console.log(`[${requestId}] 📄 Raw error response text (first 500 chars):`, rawText.substring(0, 500));
                    data = { error: 'Invalid error response from external API' };
                } catch (textError) {
                    console.log(`[${requestId}] 💥 Could not read error response body:`, textError);
                    data = { error: 'Could not read error response' };
                }
            }

            const totalDuration = Date.now() - startTime;
            console.log(`[${requestId}] ❌ Testimony deletion failed with status ${response.status} in ${totalDuration}ms`);
            return NextResponse.json(data, { status: response.status });
        } else {
            // Unexpected success response
            const totalDuration = Date.now() - startTime;
            console.log(`[${requestId}] ❓ Unexpected success response for DELETE: ${response.status} in ${totalDuration}ms`);
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
