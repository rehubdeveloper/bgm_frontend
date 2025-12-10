import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { pin } = body;

        if (!pin) {
            return NextResponse.json(
                { error: 'PIN is required' },
                { status: 400 }
            );
        }

        const adminPin = process.env.ADMIN_PIN_CODE;

        if (!adminPin) {
            return NextResponse.json(
                { error: 'Admin PIN not configured' },
                { status: 500 }
            );
        }

        if (pin === adminPin) {
            return NextResponse.json({ success: true, message: 'PIN verified successfully' });
        } else {
            return NextResponse.json(
                { error: 'Invalid PIN' },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error('PIN verification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
