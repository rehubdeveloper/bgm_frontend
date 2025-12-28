// @ts-ignore: 'next/server' types may not be available in this environment
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    const { id: testimonyId } = await params;


    // Check for authorization header (required for admin operations)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        
        return NextResponse.json(
            { error: 'Authorization required' },
            { status: 401 }
        );
    }

    try {
        

        // Forward the request to the external API admin-panel endpoint
        const externalApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/testimonies/${testimonyId}/approve/`;

        const fetchStartTime = Date.now();
        const response = await fetch(externalApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
            },
        });

        const fetchDuration = Date.now() - fetchStartTime;
        

        // Handle response based on status
        if (response.status === 200) {
            
            const totalDuration = Date.now() - startTime;

            return NextResponse.json({ success: true }, { status: 200 });
        }

        // Handle error responses
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
            data = { error: 'Invalid error response from external API' };
        }

        const totalDuration = Date.now() - startTime;
        

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        const totalDuration = Date.now() - startTime;
        console.error(`[${requestId}] 💥 Testimony approval error after ${totalDuration}ms:`, error);

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
