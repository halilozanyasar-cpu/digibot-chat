import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { createPaymentRequest, createPreAuthRequest } from '@/lib/iyzico';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, paymentType } = await request.json();

    if (!orderId || !paymentType) {
      return NextResponse.json(
        { message: 'Order ID and payment type are required' },
        { status: 400 }
      );
    }

    await connectDB();

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

    // Prepare payment data
    const paymentData = {
      orderId: order._id.toString(),
      amount: paymentType === 'guide' ? order.guidePrice : order.sleevePrice,
      currency: 'TRY',
      customer: {
        id: session.user.id,
        name: session.user.name?.split(' ')[0] || 'Hekim',
        surname: session.user.name?.split(' ')[1] || 'Kullanıcı',
        email: session.user.email,
        phone: '+905551234567', // In production, get from user profile
      },
      billingAddress: {
        contactName: session.user.name || 'Hekim',
        city: 'İstanbul',
        country: 'Turkey',
        address: 'Maslak Mahallesi, Büyükdere Caddesi No: 123',
      },
      items: [
        {
          id: order._id.toString(),
          name: paymentType === 'guide' 
            ? `Cerrahi Rehber - ${order.patientName}`
            : `Sleeve - ${order.patientName}`,
          category1: 'Medical',
          itemType: 'VIRTUAL',
          price: paymentType === 'guide' ? order.guidePrice : order.sleevePrice,
        }
      ],
    };

    let paymentResponse;

    if (paymentType === 'guide') {
      // Direct charge for guide
      paymentResponse = await createPaymentRequest(paymentData);
    } else {
      // Pre-auth for sleeve
      paymentResponse = await createPreAuthRequest(paymentData);
    }

    // Update order with payment ID
    order.paymentId = paymentResponse.paymentId;
    await order.save();

    return NextResponse.json({
      paymentPageUrl: paymentResponse.paymentPageUrl,
      paymentId: paymentResponse.paymentId,
      conversationId: paymentResponse.conversationId,
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { message: 'Payment creation failed' },
      { status: 500 }
    );
  }
}
