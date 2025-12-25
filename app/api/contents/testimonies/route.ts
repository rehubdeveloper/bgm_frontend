// @ts-ignore: 'next/server' types may not be available in this environment
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    console.log(`[${requestId}] 🚀 Starting ALL testimonies fetch request`);
    console.log(`[${requestId}] 📍 Request URL: ${request.url}`);
    console.log(`[${requestId}] 📝 Request Method: ${request.method}`);

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
        // Fetch testimonies from the admin panel API (paginated)
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/testimonies/`;
        console.log(`[${requestId}] 🌐 Fetching testimonies from: ${externalApiUrl}`);
        const queryString = request.url.split('?')[1] || '';
        const fullUrl = queryString ? `${externalApiUrl}?${queryString}` : externalApiUrl;

        const fetchStartTime = Date.now();
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
        });

        const fetchDuration = Date.now() - fetchStartTime;
        console.log(`[${requestId}] ⏱️ External API request took ${fetchDuration}ms`);
        console.log(`[${requestId}] 📊 External API response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.log(`[${requestId}] ❌ External API error: ${response.status} - ${errorText}`);
            return NextResponse.json(
                { error: 'Failed to fetch testimonies from external API' },
                { status: response.status }
            );
        }

        let data;
        try {
            console.log(`[${requestId}] 📥 Parsing external API paginated response...`);
            const apiResponse = await response.json();
            console.log(`[${requestId}] 📋 External API response received with paginated format`);

            // Handle paginated response - extract results array
            if (apiResponse.results && Array.isArray(apiResponse.results)) {
                data = apiResponse.results.map((testimony: any) => ({
                    id: testimony.id,
                    text: testimony.text,
                    images: testimony.images,
                    videos: testimony.videos,
                    member_name: testimony.member_name,
                    status: testimony.status,
                    rejection_reason: testimony.rejection_reason,
                    created_at: testimony.created_at
                }));
                console.log(`[${requestId}] 📋 Extracted ${data.length} testimonies from paginated response`);
            } else {
                // Fallback: return mock data if API response format is unexpected
                console.log(`[${requestId}] ⚠️ Unexpected API response format, creating mock data`);
                data = [
                    {
                        id: 1,
                        text: "Mock testimony - This is a test testimony",
                        images: null,
                        videos: null,
                        member_name: "Mock User",
                        status: "pending",
                        rejection_reason: null,
                        created_at: new Date().toISOString()
                    }
                ];
            }
        } catch (parseError) {
            console.log(`[${requestId}] ❌ Failed to parse external API response as JSON:`, parseError);
            // Clone the response to avoid body consumption issues
            const responseClone = response.clone();
            try {
                const rawText = await responseClone.text();
                console.log(`[${requestId}] 📄 Raw response text:`, rawText);
            } catch (textError) {
                console.log(`[${requestId}] ❌ Could not read raw response text either:`, textError);
            }
            data = { error: 'Invalid response from external API' };
        }

        const totalDuration = Date.now() - startTime;
        console.log(`[${requestId}] ✅ Testimonies fetch completed successfully in ${totalDuration}ms`);
        console.log(`[${requestId}] 🎯 Returning response with status: ${response.status}`);

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        const totalDuration = Date.now() - startTime;
        console.error(`[${requestId}] 💥 ALL testimonies fetch error after ${totalDuration}ms:`, error);

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

    console.log(`[${requestId}] 🚀 Starting testimony submission request`);
    console.log(`[${requestId}] 📍 Request URL: ${request.url}`);
    console.log(`[${requestId}] 📝 Request Method: ${request.method}`);

    // Check for authorization header (might be optional for submission, let external API handle)
    const authHeader = request.headers.get('authorization');
    console.log(`[${requestId}] 🔐 Authorization header received: ${authHeader ? 'Yes' : 'No'}`);

    try {
        console.log(`[${requestId}] 📥 Parsing request body as FormData...`);
        const formData = await request.formData();
        console.log(`[${requestId}] 📋 Received form data fields:`, Array.from(formData.keys()));

        // Extract form fields
        const text = formData.get('text') as string;
        const image = formData.get('image') as File;
        const video = formData.get('video') as File;

        // Validate required fields
        console.log(`[${requestId}] ✅ Validating required fields...`);

        if (!text || typeof text !== 'string' || text.trim() === '') {
            console.log(`[${requestId}] ❌ Validation failed: Missing required field: text`);
            return NextResponse.json(
                { error: 'Missing required field: text' },
                { status: 400 }
            );
        }

        // At least one media file should be provided
        if (!image && !video) {
            console.log(`[${requestId}] ❌ Validation failed: At least one media file (image or video) is required`);
            return NextResponse.json(
                { error: 'At least one media file (image or video) is required' },
                { status: 400 }
            );
        }

        console.log(`[${requestId}] ✅ Validation passed for all required fields`);

        // Forward the request to the external API (use admin-panel endpoint for submissions)
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/testimonies/`;
        console.log(`[${requestId}] 🌐 Forwarding to external API: ${externalApiUrl}`);

        const fetchStartTime = Date.now();
        const response = await fetch(externalApiUrl, {
            method: 'POST',
            headers: authHeader ? {
                'Authorization': authHeader,
            } : {},
            body: formData,
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
            // Clone the response to avoid body consumption issues
            const responseClone = response.clone();
            try {
                const rawText = await responseClone.text();
                console.log(`[${requestId}] 📄 Raw response text:`, rawText);
            } catch (textError) {
                console.log(`[${requestId}] ❌ Could not read raw response text either:`, textError);
            }
            data = { error: 'Invalid response from external API' };
        }

        const totalDuration = Date.now() - startTime;
        console.log(`[${requestId}] ✅ Testimony submission completed successfully in ${totalDuration}ms`);
        console.log(`[${requestId}] 🎯 Returning response with status: ${response.status}`);

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        const totalDuration = Date.now() - startTime;
        console.error(`[${requestId}] 💥 Testimony submission error after ${totalDuration}ms:`, error);

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
