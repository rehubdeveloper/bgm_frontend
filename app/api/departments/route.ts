import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    console.log(`[${requestId}] 🚀 Starting departments fetch request`);
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
        // Forward the request to the external API
        const externalApiUrl = 'https://jfgg9t4b-8000.uks1.devtunnels.ms/api/departments/';
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
        console.log(`[${requestId}] ✅ Departments fetch completed successfully in ${totalDuration}ms`);
        console.log(`[${requestId}] 🎯 Returning response with status: ${response.status}`);

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

    console.log(`[${requestId}] 🚀 Starting department creation request`);
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
        console.log(`[${requestId}] 📥 Parsing request body...`);
        const body = await request.json();
        console.log(`[${requestId}] 📋 Received body:`, JSON.stringify(body, null, 2));

        // Validate required fields
        console.log(`[${requestId}] ✅ Validating required fields...`);
        const requiredFields = ['name', 'description'];

        for (const field of requiredFields) {
            if (body[field] === undefined || body[field] === null || body[field] === '') {
                console.log(`[${requestId}] ❌ Validation failed: Missing required field: ${field}`);
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        // Handle optional leader field
        if (body.leader !== undefined && body.leader !== null && body.leader !== '') {
            body.leader = parseInt(body.leader);
        } else {
            body.leader = null; // or omit it entirely
        }

        console.log(`[${requestId}] ✅ Validation passed for fields: ${requiredFields.join(', ')}`);

        // Forward the request to the external API
        const externalApiUrl = 'https://jfgg9t4b-8000.uks1.devtunnels.ms/api/departments/';
        console.log(`[${requestId}] 🌐 Forwarding to external API: ${externalApiUrl}`);
        console.log(`[${requestId}] 📤 Sending payload:`, JSON.stringify(body, null, 2));

        const fetchStartTime = Date.now();
        const response = await fetch(externalApiUrl, {
            method: 'POST',
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
        console.log(`[${requestId}] ✅ Department creation completed successfully in ${totalDuration}ms`);
        console.log(`[${requestId}] 🎯 Returning response with status: ${response.status}`);

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
