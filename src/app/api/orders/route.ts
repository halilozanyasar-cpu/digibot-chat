import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const orders = await Order.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    
    const patientName = formData.get('patientName') as string;
    const implantBrand = formData.get('implantBrand') as string;
    const implantModel = formData.get('implantModel') as string;
    const implantCount = parseInt(formData.get('implantCount') as string);
    const implantPositions = JSON.parse(formData.get('implantPositions') as string);
    const prosthesisType = formData.get('prosthesisType') as string;
    const surgicalApproach = formData.get('surgicalApproach') as string;
    const boneQuality = formData.get('boneQuality') as string;
    const notes = formData.get('notes') as string;

    // Validation
    if (!patientName || !implantBrand || !implantModel || !implantCount || !implantPositions || !prosthesisType || !surgicalApproach || !boneQuality) {
      return NextResponse.json(
        { message: 'Tüm gerekli alanlar doldurulmalıdır' },
        { status: 400 }
      );
    }

    if (implantPositions.length !== implantCount) {
      return NextResponse.json(
        { message: 'İmplant sayısı ile pozisyon sayısı eşleşmiyor' },
        { status: 400 }
      );
    }

    await connectDB();

    // Handle file uploads (simplified - in production, use proper file storage)
    const stlFiles: string[] = [];
    const dicomFiles: string[] = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith('stlFile_') && value instanceof File) {
        // In production, save to cloud storage and get URL
        stlFiles.push(`/uploads/stl/${Date.now()}_${value.name}`);
      }
      if (key.startsWith('dicomFile_') && value instanceof File) {
        // In production, save to cloud storage and get URL
        dicomFiles.push(`/uploads/dicom/${Date.now()}_${value.name}`);
      }
    }

    // Calculate prices (example pricing)
    const guidePrice = 500; // Base guide price
    const sleevePrice = 50; // Per sleeve price
    const totalPrice = guidePrice + (sleevePrice * implantCount);

    // Create order
    const order = new Order({
      userId: session.user.id,
      patientName,
      implantDetails: {
        brand: implantBrand,
        model: implantModel,
        count: implantCount,
        positions: implantPositions,
      },
      prosthesisType,
      surgicalPlan: {
        approach: surgicalApproach,
        boneQuality: boneQuality,
        recommendations: [],
      },
      stlFiles,
      dicomFiles,
      guidePrice,
      sleevePrice,
      totalAmount: totalPrice,
      notes,
    });

    await order.save();

    return NextResponse.json(
      { 
        message: 'Sipariş başarıyla oluşturuldu',
        orderId: order._id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
