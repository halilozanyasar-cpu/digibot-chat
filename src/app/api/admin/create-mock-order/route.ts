import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { 
      patientName, 
      userEmail, 
      userName, 
      implantBrand, 
      implantModel, 
      implantCount, 
      implantPositions, 
      prosthesisType 
    } = await request.json();

    // Validation
    if (!patientName || !patientName.trim()) {
      return NextResponse.json(
        { message: 'Hasta adı gereklidir' },
        { status: 400 }
      );
    }
    if (!userEmail || !userEmail.trim()) {
      return NextResponse.json(
        { message: 'Email adresi gereklidir' },
        { status: 400 }
      );
    }
    if (!userName || !userName.trim()) {
      return NextResponse.json(
        { message: 'Kullanıcı adı gereklidir' },
        { status: 400 }
      );
    }
    if (!implantBrand || !implantBrand.trim()) {
      return NextResponse.json(
        { message: 'İmplant markası gereklidir' },
        { status: 400 }
      );
    }
    if (!implantModel || !implantModel.trim()) {
      return NextResponse.json(
        { message: 'İmplant modeli gereklidir' },
        { status: 400 }
      );
    }
    if (!implantCount || implantCount < 1) {
      return NextResponse.json(
        { message: 'Geçerli implant sayısı gereklidir' },
        { status: 400 }
      );
    }
    if (!implantPositions || implantPositions.length === 0) {
      return NextResponse.json(
        { message: 'En az bir diş pozisyonu gereklidir' },
        { status: 400 }
      );
    }

    // Mock data - MongoDB olmadan çalışır
    const mockUserId = `mock-user-${Date.now()}`;
    const mockOrderId = `mock-order-${Date.now()}`;

    // Mock kullanıcı
    const user = {
      _id: mockUserId,
      name: userName,
      email: userEmail,
      role: 'user'
    };

    // Mock sipariş
    const order = {
      _id: mockOrderId,
      userId: mockUserId,
      patientName: patientName,
      implantDetails: {
        brand: implantBrand,
        model: implantModel,
        count: implantCount,
        positions: implantPositions.filter((pos: string) => pos.trim() !== '')
      },
      prosthesisType: prosthesisType,
      surgicalPlan: {
        approach: 'Flapsız cerrahi',
        boneQuality: 'D2-D1',
        recommendations: ['İmmediate loading']
      },
      status: 'pending',
      guidePrice: 0,
      sleevePrice: 0,
      totalAmount: 0,
      createdAt: new Date().toISOString(),
      userEmail: user.email,
      userName: user.name
    };

    // Mock data dosyasını oku ve güncelle
    const mockDataPath = path.join(process.cwd(), 'mock-data.json');
    
    let mockOrders = [];
    if (fs.existsSync(mockDataPath)) {
      const fileContent = fs.readFileSync(mockDataPath, 'utf8');
      mockOrders = JSON.parse(fileContent);
    }
    
    // Yeni siparişi ekle
    mockOrders.push(order);
    
    // Dosyayı güncelle
    fs.writeFileSync(mockDataPath, JSON.stringify(mockOrders, null, 2));

    return NextResponse.json({
      message: 'Mock order created successfully',
      orderId: order._id,
      order: order
    });

  } catch (error) {
    console.error('Error creating mock order:', error);
    return NextResponse.json(
      { message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
