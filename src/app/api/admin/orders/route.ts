import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Mock data dosyasını oku
    const mockDataPath = path.join(process.cwd(), 'mock-data.json');
    
    let mockOrders = [];
    if (fs.existsSync(mockDataPath)) {
      const fileContent = fs.readFileSync(mockDataPath, 'utf8');
      mockOrders = JSON.parse(fileContent);
    }

    return NextResponse.json(mockOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
