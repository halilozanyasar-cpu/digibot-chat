import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      message: 'Test endpoint çalışıyor',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Test endpoint hatası', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({
      message: 'Test POST endpoint çalışıyor',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Test POST endpoint hatası', error: error.message },
      { status: 500 }
    );
  }
}
