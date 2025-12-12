// @ts-ignore: 'next/server' types may not be available in this environment
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    console.log(`[${requestId}] 🚀 Starting sermons fetch request`);
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
        // Forward the request to the external API content endpoint
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/contents/sermons/`;
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
        console.log(`[${requestId}] ✅ Sermons fetch completed successfully in ${totalDuration}ms`);
        console.log(`[${requestId}] 🎯 Returning response with status: ${response.status}`);

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        const totalDuration = Date.now() - startTime;
        console.error(`[${requestId}] 💥 Sermons fetch error after ${totalDuration}ms:`, error);

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

    console.log(`[${requestId}] 🚀 Starting sermon creation request`);
    console.log(`[${requestId}] 📍 Request URL: ${request.url}`);
    console.log(`[${requestId}] 📝 Request Method: ${request.method}`);

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
        console.log(`[${requestId}] 📥 Parsing request body as FormData...`);
        const formData = await request.formData();
        console.log(`[${requestId}] 📋 Received form data fields:`, Array.from(formData.keys()));

        // Extract form fields
        const title = formData.get('title') as string;
        const preacher = formData.get('preacher') as string;
        const description = formData.get('description') as string;
        const audio = formData.get('audio') as File;

        // Validate required fields
        console.log(`[${requestId}] ✅ Validating required fields...`);

        if (!title || typeof title !== 'string' || title.trim() === '') {
            console.log(`[${requestId}] ❌ Validation failed: Missing required field: title`);
            return NextResponse.json(
                { error: 'Missing required field: title' },
                { status: 400 }
            );
        }

        if (!audio) {
            console.log(`[${requestId}] ❌ Validation failed: Missing required field: audio`);
            return NextResponse.json(
                { error: 'Missing required field: audio' },
                { status: 400 }
            );
        }

        console.log(`[${requestId}] ✅ Validation passed for all required fields`);

        // Forward the request to the external API
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/contents/sermons/`;
        console.log(`[${requestId}] 🌐 Forwarding to external API: ${externalApiUrl}`);

        const fetchStartTime = Date.now();
        const response = await fetch(externalApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
            },
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
            console.log(`[${requestId}] 📄 Raw response text:`, await response.text());
            data = { error: 'Invalid response from external API' };
        }

        const totalDuration = Date.now() - startTime;
        console.log(`[${requestId}] ✅ Sermon creation completed successfully in ${totalDuration}ms`);
        console.log(`[${requestId}] 🎯 Returning response with status: ${response.status}`);

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        const totalDuration = Date.now() - startTime;
        console.error(`[${requestId}] 💥 Sermon creation error after ${totalDuration}ms:`, error);

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
