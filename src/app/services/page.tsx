'use client';

import { useState } from 'react';
import { 
  Zap, 
  Shield, 
  Clock, 
  Users, 
  CheckCircle, 
  ArrowRight,
  QrCode,
  Brain,
  FileText,
  Smartphone
} from 'lucide-react';

const services = [
  {
    icon: FileText,
    title: 'Dijital Cerrahi Rehber Tasarımı',
    description: '3D tomografi ve ağız içi tarama verilerinizden hassas cerrahi rehberler tasarlıyoruz.',
    features: [
      '3D implant planlama',
      'Hassas pozisyonlama',
      'Çene anatomisi analizi',
      'Protez uyumluluğu kontrolü'
    ],
    price: '₺500'
  },
  {
    icon: QrCode,
    title: 'QR Kodlu Rapor Sistemi',
    description: 'Her cerrahi rehber için benzersiz QR kod ile detaylı raporlama sistemi.',
    features: [
      'Benzersiz QR kod',
      'Detaylı vaka raporu',
      'Mobil erişim',
      'Güvenli veri saklama'
    ],
    price: 'Ücretsiz'
  },
  {
    icon: Brain,
    title: 'AI Cerrahi Asistan',
    description: 'OpenAI GPT destekli akıllı cerrahi asistan ile 7/24 danışmanlık.',
    features: [
      'Anlık soru-cevap',
      'Cerrahi teknik önerileri',
      'Komplikasyon yönetimi',
      'Sürekli öğrenme'
    ],
    price: '₺200/ay'
  },
  {
    icon: Smartphone,
    title: 'Mobil Uygulama',
    description: 'Hastalarınız için özel mobil uygulama ile takip ve bilgilendirme.',
    features: [
      'Hasta takip sistemi',
      'Randevu yönetimi',
      'Bildirim sistemi',
      'Doküman paylaşımı'
    ],
    price: '₺100/ay'
  }
];

const pricingPlans = [
  {
    name: 'Başlangıç',
    price: '₺500',
    period: 'rehber başına',
    description: 'Küçük klinikler için ideal',
    features: [
      'Dijital cerrahi rehber tasarımı',
      'QR kodlu rapor sistemi',
      'Temel destek',
      '5 rehber/ay limit'
    ],
    popular: false
  },
  {
    name: 'Profesyonel',
    price: '₺1,500',
    period: 'aylık',
    description: 'Orta ölçekli klinikler için',
    features: [
      'Sınırsız rehber tasarımı',
      'QR kodlu rapor sistemi',
      'AI cerrahi asistan',
      'Öncelikli destek',
      'Mobil uygulama'
    ],
    popular: true
  },
  {
    name: 'Kurumsal',
    price: '₺3,000',
    period: 'aylık',
    description: 'Büyük klinikler ve hastaneler için',
    features: [
      'Sınırsız rehber tasarımı',
      'QR kodlu rapor sistemi',
      'AI cerrahi asistan',
      '7/24 destek',
      'Mobil uygulama',
      'Özel entegrasyonlar',
      'Eğitim programları'
    ],
    popular: false
  }
];

export default function ServicesPage() {
  const [selectedPlan, setSelectedPlan] = useState('Profesyonel');

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="glass backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-6">
              Hizmetlerimiz
            </h1>
            <p className="text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              Modern dental implantoloji için ihtiyacınız olan tüm araçları tek platformda sunuyoruz
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
          {services.map((service, index) => (
            <div key={index} className="glass rounded-3xl p-8 hover-lift group">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <service.icon size={28} className="text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white">{service.title}</h3>
                  <p className="text-orange-400 font-semibold">{service.price}</p>
                </div>
              </div>

              <p className="text-white/80 mb-6 leading-relaxed">
                {service.description}
              </p>

              <ul className="space-y-3">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-white/90">
                    <CheckCircle size={16} className="text-orange-400 mr-3" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Pricing Section */}
        <div className="mb-24">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-6">
              Fiyatlandırma Planları
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              İhtiyacınıza uygun planı seçin ve modern dental implantoloji dünyasına adım atın
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`glass rounded-3xl p-8 hover-lift relative ${
                  plan.popular ? 'ring-2 ring-orange-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
                      En Popüler
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-orange-400 mb-2">{plan.price}</div>
                  <div className="text-white/60">{plan.period}</div>
                  <p className="text-white/80 mt-4">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-white/90">
                      <CheckCircle size={20} className="text-orange-400 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setSelectedPlan(plan.name)}
                  className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                    plan.popular
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {selectedPlan === plan.name ? 'Seçildi' : 'Planı Seç'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="glass rounded-3xl p-12 text-center hover-lift">
          <h2 className="text-3xl font-bold text-white mb-6">
            Hemen Başlamaya Hazır mısınız?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Modern dental implantoloji dünyasına adım atın ve cerrahi başarınızı artırın
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="btn-modern text-lg px-8 py-4 inline-flex items-center justify-center space-x-3">
              <span>Ücretsiz Deneme Başlat</span>
              <ArrowRight size={24} />
            </button>
            <button className="glass text-white border-2 border-white/30 hover:border-white/60 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 inline-flex items-center justify-center space-x-3">
              <span>Demo İzle</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
