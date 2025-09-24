import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { postAuthRequest, cancelPreAuthRequest } from '@/lib/iyzico';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const token = formData.get('token') as string;
    const status = formData.get('status') as string;
    const paymentId = formData.get('paymentId') as string;

    if (!token || !status || !paymentId) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findOne({ paymentId });

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    if (status === 'success') {
      // Update order payment status
      order.paymentStatus = 'paid';
      
      // If this is a sleeve payment (pre-auth), we'll capture it later
      // For guide payment, it's already charged
      
      await order.save();

      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard/orders/${order._id}?payment=success`
      );
    } else {
      // Payment failed
      order.paymentStatus = 'failed';
      await order.save();

      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard/orders/${order._id}?payment=failed`
      );
    }

  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard?payment=error`
    );
  }
}

// API endpoint to capture pre-auth (for sleeve payments)
export async function PUT(request: NextRequest) {
  try {
    const { paymentId, action } = await request.json();

    if (!paymentId || !action) {
      return NextResponse.json(
        { message: 'Payment ID and action are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findOne({ paymentId });

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    if (action === 'capture') {
      // Capture pre-auth (guide returned successfully)
      const result = await postAuthRequest(paymentId);
      
      if (result.status === 'success') {
        order.paymentStatus = 'paid';
        await order.save();
        
        return NextResponse.json({ 
          message: 'Payment captured successfully',
          status: 'success'
        });
      } else {
        return NextResponse.json(
          { message: 'Payment capture failed' },
          { status: 400 }
        );
      }
    } else if (action === 'cancel') {
      // Cancel pre-auth (guide returned)
      const result = await cancelPreAuthRequest(paymentId);
      
      if (result.status === 'success') {
        order.paymentStatus = 'refunded';
        await order.save();
        
        return NextResponse.json({ 
          message: 'Payment cancelled successfully',
          status: 'success'
        });
      } else {
        return NextResponse.json(
          { message: 'Payment cancellation failed' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Payment action error:', error);
    return NextResponse.json(
      { message: 'Payment action failed' },
      { status: 500 }
    );
  }
}
