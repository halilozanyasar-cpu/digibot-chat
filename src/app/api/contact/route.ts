import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, clinicName, subject, message } = await request.json();

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: 'Gerekli alanlar doldurulmalıdır' },
        { status: 400 }
      );
    }

    // Create transporter (in production, use proper SMTP configuration)
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL || 'info@digimplantsolutions.com',
      subject: `İletişim Formu: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF7A00, #E66A00); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Digimplant Solutions</h1>
            <p style="color: white; margin: 5px 0 0 0;">İletişim Formu Mesajı</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Mesaj Detayları</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p><strong>Ad Soyad:</strong> ${name}</p>
              <p><strong>E-posta:</strong> ${email}</p>
              ${phone ? `<p><strong>Telefon:</strong> ${phone}</p>` : ''}
              ${clinicName ? `<p><strong>Klinik Adı:</strong> ${clinicName}</p>` : ''}
              <p><strong>Konu:</strong> ${subject}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #333; margin-bottom: 10px;">Mesaj:</h3>
              <p style="line-height: 1.6; color: #666;">${message.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">
              Bu mesaj Digimplant Solutions web sitesi iletişim formundan gönderilmiştir.
            </p>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Send auto-reply to user
    const autoReplyOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Mesajınız Alındı - Digimplant Solutions',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF7A00, #E66A00); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Digimplant Solutions</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Merhaba ${name},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Mesajınız başarıyla alındı. En kısa sürede size dönüş yapacağız.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-bottom: 10px;">Mesaj Özeti:</h3>
              <p><strong>Konu:</strong> ${subject}</p>
              <p><strong>Gönderim Tarihi:</strong> ${new Date().toLocaleString('tr-TR')}</p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Acil durumlar için bizi arayabilirsiniz:<br>
              <strong>Telefon:</strong> +90 (212) 555 0123<br>
              <strong>E-posta:</strong> info@digimplantsolutions.com
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">
              Digimplant Solutions - Dijital Cerrahi Rehberleri
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(autoReplyOptions);

    return NextResponse.json(
      { message: 'Mesaj başarıyla gönderildi' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { message: 'Mesaj gönderilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
