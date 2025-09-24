import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Mock rapor verisi oluştur
    const mockReport = {
      _id: 'mock-report-' + Date.now(),
      patientName: 'Ahmet Yılmaz',
      implantDetails: {
        brand: 'Nobel Biocare',
        model: 'NobelActive',
        count: 2,
        positions: ['16', '26']
      },
      prosthesisType: 'Tek diş kron',
      surgicalPlan: {
        approach: 'Flapsız cerrahi',
        boneQuality: 'D2-D1',
        recommendations: ['İmmediate loading']
      },
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      reportUrl: `http://localhost:3000/report/mock-report-${Date.now()}`,
      status: 'approved',
      teethData: [
        {
          toothNumber: '16',
          implantBrand: 'Nobel Biocare',
          implantModel: 'NobelActive',
          implantDiameter: '4.3',
          implantLength: '10',
          expectedBoneQuality: 'D2-D1',
          recommendedDrillProtocol: 'Pilot Drill 2.2mm → Twist Drill 3.0mm → Twist Drill 4.3mm'
        },
        {
          toothNumber: '26',
          implantBrand: 'Nobel Biocare',
          implantModel: 'NobelActive',
          implantDiameter: '4.3',
          implantLength: '10',
          expectedBoneQuality: 'D2-D1',
          recommendedDrillProtocol: 'Pilot Drill 2.2mm → Twist Drill 3.0mm → Twist Drill 4.3mm'
        }
      ],
      clinicalNotes: 'Hasta 45 yaşında, sağlıklı birey. 16 ve 26 numaralı dişlerde implant planlandı.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      message: 'Mock rapor oluşturuldu',
      report: mockReport,
      reportId: mockReport._id,
      reportUrl: mockReport.reportUrl
    });

  } catch (error) {
    console.error('Error creating mock report:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
