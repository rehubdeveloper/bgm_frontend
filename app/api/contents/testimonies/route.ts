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
        // Fetch testimonies from the admin panel API (paginated)
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/testimonies/`;
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
        

        if (!response.ok) {
            const errorText = await response.text();
            
            return NextResponse.json(
                { error: 'Failed to fetch testimonies from external API' },
                { status: response.status }
            );
        }

        let data;
        try {
            const apiResponse = await response.json();

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
            } else {
                // Fallback: return mock data if API response format is unexpected
                
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


    // Check for authorization header (might be optional for submission, let external API handle)
    const authHeader = request.headers.get('authorization');

    try {
        const formData = await request.formData();

        // Extract form fields
        const text = formData.get('text') as string;
        const image = formData.get('image') as File;
        const video = formData.get('video') as File;

        // Validate required fields
        

        if (!text || typeof text !== 'string' || text.trim() === '') {
            
            return NextResponse.json(
                { error: 'Missing required field: text' },
                { status: 400 }
            );
        }

        // At least one media file should be provided
        if (!image && !video) {
            
            return NextResponse.json(
                { error: 'At least one media file (image or video) is required' },
                { status: 400 }
            );
        }

        

        // Forward the request to the external API (use admin-panel endpoint for submissions)
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/testimonies/`;

        const fetchStartTime = Date.now();
        const response = await fetch(externalApiUrl, {
            method: 'POST',
            headers: authHeader ? {
                'Authorization': authHeader,
            } : {},
            body: formData,
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
