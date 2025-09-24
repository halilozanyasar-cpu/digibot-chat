import { NextRequest, NextResponse } from 'next/server';

// In-memory store for mock reports
const mockReports: { [key: string]: any } = {};

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { approved, reason, paymentData, totalAmount, provisionAmount } = await request.json();
    
    // Mock report data
    const mockReport = {
      _id: params.id,
      patientName: 'Test Hasta',
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
      status: 'pending_approval',
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
      pricing: {
        guidePrice: 500,
        sleevePrice: 200,
        totalAmount: 700,
        provisionAmount: 140
      },
      paymentStatus: 'pending',
      paymentData: null as any,
      rejectionReason: null as any,
      rejectedAt: null as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (approved) {
      // Ödeme işlemi simülasyonu (gerçek uygulamada iyzico entegrasyonu kullanılmalı)
      const paymentResult = await processPayment(paymentData, totalAmount);
      
      if ((paymentResult as any).success) {
        // Raporu onaylandı olarak işaretle
        mockReport.status = 'approved';
        mockReport.paymentStatus = 'paid';
        mockReport.paymentData = {
          amount: totalAmount,
          provisionAmount: provisionAmount,
          transactionId: (paymentResult as any).transactionId,
          paidAt: new Date().toISOString()
        };
        
        mockReports[params.id] = mockReport;

        return NextResponse.json({
          message: 'Report approved and payment processed successfully',
          report: mockReport,
          paymentResult: paymentResult
        });
      } else {
        return NextResponse.json(
          { message: 'Payment failed', error: (paymentResult as any).error },
          { status: 400 }
        );
      }
    } else {
      // Raporu reddedildi olarak işaretle
      mockReport.status = 'rejected';
      mockReport.rejectionReason = reason;
      mockReport.rejectedAt = new Date().toISOString();
      
      mockReports[params.id] = mockReport;

      return NextResponse.json({
        message: 'Report rejected',
        report: mockReport
      });
    }

  } catch (error) {
    console.error('Error processing approval:', error);
    return NextResponse.json(
      { message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Mock payment processing function
async function processPayment(paymentData: any, amount: number) {
  // Gerçek uygulamada iyzico entegrasyonu kullanılmalı
  // Şimdilik mock payment simulation
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock payment success
      resolve({
        success: true,
        transactionId: `TXN_${Date.now()}`,
        amount: amount,
        message: 'Payment processed successfully'
      });
    }, 1000);
  });
}