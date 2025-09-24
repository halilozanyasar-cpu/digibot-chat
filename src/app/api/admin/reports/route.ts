import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Report from '@/models/Report';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Tüm raporları getir (admin için)
    const reports = await Report.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
