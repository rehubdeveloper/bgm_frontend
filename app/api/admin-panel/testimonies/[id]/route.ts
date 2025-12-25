// @ts-ignore: 'next/server' types may not be available in this environment
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    const { id: testimonyId } = await params;

    console.log(`[${requestId}] 🚀 Starting testimony deletion request for ID: ${testimonyId}`);
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
        console.log(`[${requestId}] ✅ Validation passed. Deleting testimony ${testimonyId}`);

        // Forward the request to the external API admin-panel endpoint
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/testimonies/${testimonyId}/`;
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

        // Handle response based on status (delete endpoint returns no body on success)
        if (response.status === 204 || response.status === 200) {
            console.log(`[${requestId}] ✅ Testimony deletion completed successfully`);
            const totalDuration = Date.now() - startTime;
            console.log(`[${requestId}] 🎯 Returning success response in ${totalDuration}ms`);

            // For 204 No Content, return without body
            if (response.status === 204) {
                return new Response(null, { status: 204 });
            }
            // For 200 OK, return success JSON
            return NextResponse.json({ success: true }, { status: 200 });
        }

        // Handle error responses
        let data;
        try {
            console.log(`[${requestId}] 📥 Parsing external API error response...`);
            data = await response.json();
            console.log(`[${requestId}] 📋 External API error data:`, JSON.stringify(data, null, 2));
        } catch (parseError) {
            console.log(`[${requestId}] ❌ Failed to parse external API error response as JSON:`, parseError);
            // Clone the response to avoid body consumption issues
            const responseClone = response.clone();
            try {
                const rawText = await responseClone.text();
                console.log(`[${requestId}] 📄 Raw error response text:`, rawText);
            } catch (textError) {
                console.log(`[${requestId}] ❌ Could not read raw response text either:`, textError);
            }
            data = { error: 'Invalid error response from external API' };
        }

        const totalDuration = Date.now() - startTime;
        console.log(`[${requestId}] ✅ Testimony deletion completed with error in ${totalDuration}ms`);
        console.log(`[${requestId}] 🎯 Returning error response with status: ${response.status}`);

        return NextResponse.json(data, { status: response.status });
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
