import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Mock reports dosya tabanlı store
const getMockReportsPath = () => path.join(process.cwd(), 'mock-reports.json');

const loadMockReports = () => {
  const filePath = getMockReportsPath();
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  }
  return {};
};

const saveMockReports = (reports: any) => {
  const filePath = getMockReportsPath();
  fs.writeFileSync(filePath, JSON.stringify(reports, null, 2));
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const mockReports = loadMockReports();
  const report = mockReports[id];

  if (report) {
    return NextResponse.json(report);
  } else {
    return NextResponse.json({ message: 'Mock report not found' }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const updatedData = await request.json();

  const mockReports = loadMockReports();
  if (mockReports[id]) {
    mockReports[id] = { ...mockReports[id], ...updatedData, updatedAt: new Date().toISOString() };
    saveMockReports(mockReports);
    return NextResponse.json(mockReports[id]);
  } else {
    return NextResponse.json({ message: 'Mock report not found' }, { status: 404 });
  }
}