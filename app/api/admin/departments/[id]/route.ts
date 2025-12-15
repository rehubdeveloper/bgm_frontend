// @ts-ignore: 'next/server' types may not be available in this environment
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    const departmentId = params.id;

    console.log(`[${requestId}] 🚀 Starting admin department detail fetch request`);
    console.log(`[${requestId}] 📍 Request URL: ${request.url}`);
    console.log(`[${requestId}] 📝 Request Method: ${request.method}`);
    console.log(`[${requestId}] 🎯 Department ID: ${departmentId}`);

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
        // Forward the request to the external API admin panel endpoint
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/departments/${departmentId}/`;
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
        console.log(`[${requestId}] ✅ Admin department detail fetch completed successfully in ${totalDuration}ms`);
        console.log(`[${requestId}] 🎯 Returning response with status: ${response.status}`);

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        const totalDuration = Date.now() - startTime;
        console.error(`[${requestId}] 💥 Admin department detail fetch error after ${totalDuration}ms:`, error);

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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    const departmentId = params.id;

    console.log(`[${requestId}] 🚀 Starting admin department update request`);
    console.log(`[${requestId}] 📍 Request URL: ${request.url}`);
    console.log(`[${requestId}] 📝 Request Method: ${request.method}`);
    console.log(`[${requestId}] 🎯 Department ID: ${departmentId}`);

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

        // Validate required fields for PUT (full update)
        console.log(`[${requestId}] ✅ Validating required fields for PUT...`);
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
            body.leader = null;
        }

        console.log(`[${requestId}] ✅ Validation passed for PUT operation`);

        // Forward the request to the external API admin panel endpoint
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/departments/${departmentId}/`;
        console.log(`[${requestId}] 🌐 Forwarding to external API: ${externalApiUrl}`);
        console.log(`[${requestId}] 📤 Sending PUT payload:`, JSON.stringify(body, null, 2));

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
        console.log(`[${requestId}] ✅ Admin department update completed successfully in ${totalDuration}ms`);
        console.log(`[${requestId}] 🎯 Returning response with status: ${response.status}`);

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        const totalDuration = Date.now() - startTime;
        console.error(`[${requestId}] 💥 Admin department update error after ${totalDuration}ms:`, error);

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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    const departmentId = params.id;

    console.log(`[${requestId}] 🚀 Starting admin department partial update request`);
    console.log(`[${requestId}] 📍 Request URL: ${request.url}`);
    console.log(`[${requestId}] 📝 Request Method: ${request.method}`);
    console.log(`[${requestId}] 🎯 Department ID: ${departmentId}`);

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

        // For PATCH, we validate only the fields that are present
        // Handle optional leader field if present
        if (body.leader !== undefined && body.leader !== null && body.leader !== '') {
            body.leader = parseInt(body.leader);
        } else if (body.leader === '') {
            body.leader = null;
        }

        // Validate that at least one field is being updated for PATCH
        const allowedFields = ['name', 'description', 'leader'];
        const hasUpdates = allowedFields.some(field => body.hasOwnProperty(field));

        if (!hasUpdates) {
            console.log(`[${requestId}] ❌ PATCH request contains no valid update fields`);
            return NextResponse.json(
                { error: 'No valid fields to update specified' },
                { status: 400 }
            );
        }

        console.log(`[${requestId}] ✅ Validation passed for PATCH operation (${Object.keys(body).length} fields)`);

        // Forward the request to the external API admin panel endpoint
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/departments/${departmentId}/`;
        console.log(`[${requestId}] 🌐 Forwarding to external API: ${externalApiUrl}`);
        console.log(`[${requestId}] 📤 Sending PATCH payload:`, JSON.stringify(body, null, 2));

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
        console.log(`[${requestId}] ✅ Admin department partial update completed successfully in ${totalDuration}ms`);
        console.log(`[${requestId}] 🎯 Returning response with status: ${response.status}`);

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        const totalDuration = Date.now() - startTime;
        console.error(`[${requestId}] 💥 Admin department partial update error after ${totalDuration}ms:`, error);

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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    const departmentId = params.id;

    console.log(`[${requestId}] 🚀 Starting admin department delete request`);
    console.log(`[${requestId}] 📍 Request URL: ${request.url}`);
    console.log(`[${requestId}] 📝 Request Method: ${request.method}`);
    console.log(`[${requestId}] 🎯 Department ID: ${departmentId}`);

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
        // Forward the request to the external API admin panel endpoint
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/departments/${departmentId}/`;
        console.log(`[${requestId}] 🌐 Forwarding to external API: ${externalApiUrl}`);

        const fetchStartTime = Date.now();
        const response = await fetch(externalApiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
        });

        const fetchDuration = Date.now() - fetchStartTime;
        console.log(`[${requestId}] ⏱️ External API request took ${fetchDuration}ms`);
        console.log(`[${requestId}] 📊 External API response status: ${response.status} ${response.statusText}`);

        const totalDuration = Date.now() - startTime;
        console.log(`[${requestId}] ✅ Admin department delete completed successfully in ${totalDuration}ms`);
        console.log(`[${requestId}] 🎯 Returning response with status: ${response.status}`);

        // For DELETE operations, return success status even if body is empty
        if (response.status === 204 || response.status === 200) {
            return new Response(null, { status: response.status });
        }

        // Handle other responses normally
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

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        const totalDuration = Date.now() - startTime;
        console.error(`[${requestId}] 💥 Admin department delete error after ${totalDuration}ms:`, error);

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
