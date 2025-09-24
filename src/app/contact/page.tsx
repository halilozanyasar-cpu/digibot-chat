'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  CheckCircle,
  MessageCircle,
  Headphones
} from 'lucide-react';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  clinicName: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSubmitted(true);
        reset();
      } else {
        alert('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Mesajınız Gönderildi!
            </h2>
            <p className="text-gray-600 mb-6">
              Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="btn-primary"
            >
              Yeni Mesaj Gönder
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="glass backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-6">
              İletişim
            </h1>
            <p className="text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              Sorularınız, önerileriniz veya destek talepleriniz için bizimle iletişime geçin. 
              Size en kısa sürede yardımcı olmaktan mutluluk duyarız.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="glass rounded-3xl shadow-2xl p-10">
              <h2 className="text-3xl font-bold text-white mb-8 drop-shadow-lg">
                Bize Mesaj Gönderin
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-medium text-white mb-3">
                      Ad Soyad *
                    </label>
                    <input
                      {...register('name', { required: 'Ad soyad gereklidir' })}
                      type="text"
                      className="form-input"
                      placeholder="Adınız ve soyadınız"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-white mb-3">
                      E-posta *
                    </label>
                    <input
                      {...register('email', { 
                        required: 'E-posta gereklidir',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Geçerli bir e-posta adresi girin'
                        }
                      })}
                      type="email"
                      className="form-input"
                      placeholder="ornek@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-medium text-white mb-3">
                      Telefon
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="form-input"
                      placeholder="+90 (5xx) xxx xx xx"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-white mb-3">
                      Klinik Adı
                    </label>
                    <input
                      {...register('clinicName')}
                      type="text"
                      className="form-input"
                      placeholder="Klinik adınız"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-white mb-3">
                    Konu *
                  </label>
                  <select
                    {...register('subject', { required: 'Konu seçimi gereklidir' })}
                    className="form-input"
                  >
                    <option value="">Konu seçin</option>
                    <option value="genel">Genel Bilgi</option>
                    <option value="teknik">Teknik Destek</option>
                    <option value="siparis">Sipariş Takibi</option>
                    <option value="fiyat">Fiyat Bilgisi</option>
                    <option value="demo">Demo Talebi</option>
                    <option value="diger">Diğer</option>
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-medium text-white mb-3">
                    Mesaj *
                  </label>
                  <textarea
                    {...register('message', { required: 'Mesaj gereklidir' })}
                    rows={6}
                    className="form-input"
                    placeholder="Mesajınızı buraya yazın..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-modern disabled:opacity-50 disabled:cursor-not-allowed text-lg py-4"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Gönderiliyor...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Send size={20} />
                      <span>Mesaj Gönder</span>
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                İletişim Bilgileri
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-orange-500 mr-3 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Telefon</p>
                    <p className="text-gray-600">+90 (212) 555 0123</p>
                    <p className="text-sm text-gray-500">Pazartesi - Cuma: 09:00 - 18:00</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-orange-500 mr-3 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">E-posta</p>
                    <p className="text-gray-600">info@digimplantsolutions.com</p>
                    <p className="text-sm text-gray-500">24 saat içinde yanıt</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-orange-500 mr-3 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Adres</p>
                    <p className="text-gray-600">
                      Maslak Mahallesi<br />
                      Büyükdere Caddesi No: 123<br />
                      Sarıyer/İstanbul
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-orange-500 mr-3 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Çalışma Saatleri</p>
                    <p className="text-gray-600">
                      Pazartesi - Cuma: 09:00 - 18:00<br />
                      Cumartesi: 09:00 - 13:00<br />
                      Pazar: Kapalı
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Options */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Destek Seçenekleri
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <MessageCircle className="w-8 h-8 text-orange-500 mr-4" />
                  <div>
                    <p className="font-medium text-gray-900">Canlı Destek</p>
                    <p className="text-sm text-gray-600">Anında yardım alın</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Headphones className="w-8 h-8 text-orange-500 mr-4" />
                  <div>
                    <p className="font-medium text-gray-900">Teknik Destek</p>
                    <p className="text-sm text-gray-600">Uzman ekibimizden yardım</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-8 h-8 text-orange-500 mr-4" />
                  <div>
                    <p className="font-medium text-gray-900">E-posta Desteği</p>
                    <p className="text-sm text-gray-600">Detaylı yanıtlar için</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Sık Sorulan Sorular
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900 mb-1">
                    Sipariş süreci nasıl işliyor?
                  </p>
                  <p className="text-sm text-gray-600">
                    Siparişinizi oluşturduktan sonra 24-48 saat içinde cerrahi rehberiniz hazır olur.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-900 mb-1">
                    Hangi dosya formatları kabul ediliyor?
                  </p>
                  <p className="text-sm text-gray-600">
                    STL ve DICOM formatlarını kabul ediyoruz.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-900 mb-1">
                    Ödeme seçenekleri nelerdir?
                  </p>
                  <p className="text-sm text-gray-600">
                    Kredi kartı ile güvenli ödeme yapabilirsiniz.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
