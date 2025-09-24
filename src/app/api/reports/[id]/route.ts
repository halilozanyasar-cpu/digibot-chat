import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Report from '@/models/Report';
import Order from '@/models/Order';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Geçici olarak session kontrolünü devre dışı bırak
    // const session = await getServerSession(authOptions);
    
    // if (!session) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }

    await connectDB();

    const report = await Report.findOne({ 
      _id: params.id
      // userId: session.user.id // Geçici olarak devre dışı
    }).lean();

    if (!report) {
      return NextResponse.json(
        { message: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { teethData, clinicalNotes, surgicalReportPDF } = await request.json();

    await connectDB();

    const report = await Report.findByIdAndUpdate(
      params.id,
      {
        teethData,
        clinicalNotes,
        surgicalReportPDF
      },
      { new: true }
    );

    if (!report) {
      return NextResponse.json(
        { message: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { message: 'Order ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if order exists and belongs to user
    const order = await Order.findOne({ 
      _id: orderId, 
      userId: session.user.id 
    });

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if report already exists
    const existingReport = await Report.findOne({ orderId });
    if (existingReport) {
      return NextResponse.json(
        { message: 'Report already exists for this order' },
        { status: 400 }
      );
    }

    // Generate QR code data
    const qrCodeData = `${process.env.NEXTAUTH_URL}/report/${params.id}`;

    // Create report
    const report = new Report({
      orderId: order._id,
      userId: session.user.id,
      patientName: order.patientName,
      implantDetails: {
        brand: order.implantBrand,
        model: order.implantModel,
        count: order.implantCount,
        positions: order.implantPositions,
      },
      prosthesisType: order.prosthesisType,
      surgicalPlan: {
        approach: 'Flapssiz cerrahi yaklaşım önerilir',
        boneQuality: 'Tip 2 kemik kalitesi tespit edildi',
        recommendations: [
          'İmplant yerleşimi için yeterli kemik hacmi mevcut',
          'Primer stabilite sağlanabilir',
          'Yumuşak doku iyileşmesi için 3-4 ay bekleme süresi önerilir',
          'Protez yüklemesi için uygun zamanlama planlanmalı'
        ],
      },
      qrCode: qrCodeData,
      reportUrl: `${process.env.NEXTAUTH_URL}/report/${params.id}`,
    });

    await report.save();

    // Update order with report ID and QR code
    order.reportId = report._id;
    order.qrCode = qrCodeData;
    await order.save();

    return NextResponse.json({
      message: 'Report created successfully',
      reportId: report._id,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
