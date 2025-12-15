// @ts-ignore: 'next/server' types may not be available in this environment
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    const { id: testimonyId } = await params;

    console.log(`[${requestId}] 🚀 Starting testimony moderation request for ID: ${testimonyId}`);
    console.log(`[${requestId}] 📍 Request URL: ${request.url}`);
    console.log(`[${requestId}] 📝 Request Method: ${request.method}`);

    // Check for authorization header (required for admin operations)
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
        console.log(`[${requestId}] 📋 Request body:`, JSON.stringify(body, null, 2));

        const { action } = body;

        // Validate action
        if (!action || typeof action !== 'string') {
            console.log(`[${requestId}] ❌ Validation failed: Missing or invalid action`);
            return NextResponse.json(
                { error: 'Missing required field: action (must be "approve" or "reject")' },
                { status: 400 }
            );
        }

        if (action !== 'approve' && action !== 'reject') {
            console.log(`[${requestId}] ❌ Validation failed: Invalid action value: ${action}`);
            return NextResponse.json(
                { error: 'Invalid action. Must be "approve" or "reject"' },
                { status: 400 }
            );
        }

        console.log(`[${requestId}] ✅ Validation passed. Action: ${action}`);

        // Forward the request to the external API admin-panel endpoint
        const actionPath = action === 'approve' ? 'approve' : 'reject';
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/testimonies/${testimonyId}/${actionPath}/`;
        console.log(`[${requestId}] 🌐 Forwarding to external API: ${externalApiUrl}`);

        const fetchStartTime = Date.now();
        const response = await fetch(externalApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
            },
        });

        const fetchDuration = Date.now() - fetchStartTime;
        console.log(`[${requestId}] ⏱️ External API request took ${fetchDuration}ms`);
        console.log(`[${requestId}] 📊 External API response status: ${response.status} ${response.statusText}`);

        // Handle response based on status (approve/reject endpoints return no body on success)
        if (response.status === 200) {
            console.log(`[${requestId}] ✅ Testimony ${action} completed successfully (no response body expected)`);
            const totalDuration = Date.now() - startTime;
            console.log(`[${requestId}] 🎯 Returning success response in ${totalDuration}ms`);

            return NextResponse.json({ success: true, action }, { status: 200 });
        }

        // Handle error responses
        let data;
        try {
            console.log(`[${requestId}] 📥 Parsing external API error response...`);
            data = await response.json();
            console.log(`[${requestId}] 📋 External API error data:`, JSON.stringify(data, null, 2));
        } catch (parseError) {
            console.log(`[${requestId}] ❌ Failed to parse external API error response as JSON:`, parseError);
            const rawText = await response.text();
            console.log(`[${requestId}] 📄 Raw error response text:`, rawText);
            data = { error: 'Invalid error response from external API' };
        }

        const totalDuration = Date.now() - startTime;
        console.log(`[${requestId}] ✅ Testimony moderation completed successfully in ${totalDuration}ms`);
        console.log(`[${requestId}] 🎯 Returning response with status: ${response.status}`);

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        const totalDuration = Date.now() - startTime;
        console.error(`[${requestId}] 💥 Testimony moderation error after ${totalDuration}ms:`, error);

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
