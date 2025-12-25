// @ts-ignore: 'next/server' types may not be available in this environment
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // Check for authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            { error: 'Authorization required' },
            { status: 401 }
        );
    }

    // If we get here, the token exists and is properly formatted
    // The external API validation would happen here, but for now we'll just check the header format
    return NextResponse.json({ valid: true }, { status: 200 });
}
