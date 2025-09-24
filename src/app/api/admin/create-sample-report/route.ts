import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Report from '@/models/Report';
import Order from '@/models/Order';
import User from '@/models/User';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Basit örnek kullanıcı oluştur
    let sampleUser = await User.findOne({ email: 'sample@example.com' });
    if (!sampleUser) {
      sampleUser = new User({
        name: 'Örnek Kullanıcı',
        email: 'sample@example.com',
        password: 'hashedpassword123',
        role: 'user'
      });
      await sampleUser.save();
    }

    // Basit örnek sipariş oluştur
    let sampleOrder = await Order.findOne({ userId: sampleUser._id });
    if (!sampleOrder) {
      sampleOrder = new Order({
        userId: sampleUser._id,
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
        status: 'completed'
      });
      await sampleOrder.save();
    }

    // QR kod oluştur
    const reportUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/report`;
    const qrCodeData = await QRCode.toDataURL(reportUrl);

    // Basit örnek rapor oluştur
    const sampleReport = new Report({
      orderId: sampleOrder._id,
      userId: sampleUser._id,
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
      qrCode: qrCodeData,
      reportUrl: `${reportUrl}/${sampleOrder._id}`,
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
      clinicalNotes: 'Hasta 45 yaşında, sağlıklı birey. 16 ve 26 numaralı dişlerde implant planlandı.'
    });

    await sampleReport.save();

    return NextResponse.json({
      message: 'Örnek rapor oluşturuldu',
      reportId: sampleReport._id,
      reportUrl: sampleReport.reportUrl
    });

  } catch (error) {
    console.error('Error creating sample report:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
