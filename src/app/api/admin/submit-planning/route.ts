import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const orderId = formData.get('orderId') as string;
    const teethData = JSON.parse(formData.get('teethData') as string);
    const clinicalNotes = formData.get('clinicalNotes') as string;
    const guidePrice = Number(formData.get('guidePrice'));
    const sleevePrice = Number(formData.get('sleevePrice'));
    const totalAmount = Number(formData.get('totalAmount'));
    const provisionAmount = Number(formData.get('provisionAmount'));
    const pdfCount = Number(formData.get('pdfCount') || 0);

    // Mock order data - gerçek uygulamada veritabanından alınır
    const mockOrder = {
      _id: orderId,
      patientName: 'Test Hasta',
      implantDetails: {
        brand: 'Nobel Biocare',
        model: 'NobelActive',
        count: 2,
        positions: ['16', '26']
      },
      prosthesisType: 'Tek diş kron',
      userEmail: 'halilozanyasar@gmail.com',
      userName: 'Dr. Test'
    };

    // PDF dosyalarını al
    const pdfFiles: File[] = [];
    for (let i = 0; i < pdfCount; i++) {
      const file = formData.get(`surgicalReportPDF_${i}`) as File;
      if (file) {
        pdfFiles.push(file);
      }
    }

    // Mock report oluştur
    const mockReportId = `mock-report-${Date.now()}`;
    const reportUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/report/${mockReportId}`;
    
    // QR kod oluştur
    const qrCodeData = await QRCode.toDataURL(reportUrl);

    // Mock report data
    const mockReport = {
      _id: mockReportId,
      orderId: mockOrder._id,
      patientName: mockOrder.patientName,
      implantDetails: mockOrder.implantDetails,
      prosthesisType: mockOrder.prosthesisType,
      qrCode: qrCodeData,
      reportUrl: reportUrl,
      status: 'pending_approval',
      teethData: teethData,
      clinicalNotes: clinicalNotes,
      pricing: {
        guidePrice: guidePrice,
        sleevePrice: sleevePrice,
        totalAmount: totalAmount,
        provisionAmount: provisionAmount
      },
      paymentStatus: 'pending',
      pdfCount: pdfFiles.length,
      createdAt: new Date().toISOString()
    };

    // Email gönder (şimdilik devre dışı - SMTP ayarları gerekli)
    const emailSent = false; // await sendPlanningEmail(
      // mockOrder.userEmail, 
      // mockOrder.userName, 
      // mockOrder.patientName, 
      // mockReportId, 
      // totalAmount, 
      // provisionAmount
    // );

    return NextResponse.json({
      message: 'Planning submitted successfully',
      reportId: mockReportId,
      reportUrl: reportUrl,
      emailSent: emailSent,
      report: mockReport
    });

  } catch (error) {
    console.error('Error submitting planning:', error);
    return NextResponse.json(
      { message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function sendPlanningEmail(userEmail: string, userName: string, patientName: string, reportId: string, totalAmount: number, provisionAmount: number) {
  try {
    // Email transporter oluştur (gerçek uygulamada SMTP ayarları kullanılmalı)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'test@gmail.com',
        pass: process.env.SMTP_PASS || 'testpassword',
      },
    });

    const approvalUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/approve/${reportId}`;
    const reportUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/report/${reportId}`;

    const mailOptions = {
      from: process.env.CONTACT_EMAIL || 'noreply@digimplantsolutions.com',
      to: userEmail,
      subject: '🏥 Digimplant Solutions - Planlama Tamamlandı',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🏥 Digimplant Solutions</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Dijital Cerrahi Rehberleri</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">📋 Planlama Tamamlandı</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Merhaba <strong>${userName}</strong>,
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              <strong>${patientName}</strong> hastası için cerrahi planlama tamamlanmıştır. 
              Planınızı inceleyip onaylayabilir veya gerekli düzeltmeleri talep edebilirsiniz.
            </p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">💰 Fiyatlandırma</h3>
              <p style="margin: 5px 0; color: #374151;"><strong>Toplam Tutar:</strong> ${totalAmount} TL</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Provizyon:</strong> ${provisionAmount} TL</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${approvalUrl}" 
                 style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 10px;">
                ✅ Planı Onayla
              </a>
              <a href="${reportUrl}" 
                 style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 10px;">
                📄 Raporu İncele
              </a>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⚠️ Önemli:</strong> Planı onayladığınızda, rehber ücreti otomatik olarak tahsil edilecektir.
              </p>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">Digimplant Solutions - Dijital Cerrahi Rehberleri</p>
            <p style="margin: 5px 0 0 0;">Bu email otomatik olarak gönderilmiştir.</p>
          </div>
        </div>
      `
    };

    // Email gönder (gerçek uygulamada SMTP ayarları aktif olmalı)
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully to:', userEmail);
      return true;
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Email gönderilemese bile planlama başarılı sayılır
      return false;
    }

  } catch (error) {
    console.error('Error in sendPlanningEmail:', error);
    return false;
  }
}