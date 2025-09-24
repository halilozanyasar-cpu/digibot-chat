import { 
  Target, 
  QrCode, 
  Bot, 
  Shield, 
  Clock, 
  Users,
  FileText,
  Smartphone
} from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: Target,
      title: "Surgical Guide Tasarımı",
      description: "3D planlama ve dijital tasarım ile hassas cerrahi rehberleri oluşturun.",
      benefits: ["Hassas implant yerleşimi", "3D görselleştirme", "Hızlı üretim"]
    },
    {
      icon: QrCode,
      title: "QR Kodlu Rapor Sistemi",
      description: "Her cerrahi rehber için benzersiz QR kod ile hasta bilgilerine anında erişim.",
      benefits: ["Hasta takibi", "Dijital raporlama", "Mobil erişim"]
    },
    {
      icon: Bot,
      title: "Dijital Cerrahi Asistan GPT",
      description: "Yapay zeka destekli cerrahi asistan ile implantoloji konusunda uzman desteği.",
      benefits: ["7/24 danışmanlık", "Uzman bilgi", "Hızlı yanıt"]
    },
    {
      icon: Shield,
      title: "Güvenli Veri Yönetimi",
      description: "Hasta verilerinin güvenli saklanması ve işlenmesi için en yüksek güvenlik standartları.",
      benefits: ["KVKK uyumlu", "Şifreli veri", "Güvenli bulut"]
    },
    {
      icon: Clock,
      title: "Hızlı Teslimat",
      description: "Siparişinizden 24-48 saat içinde cerrahi rehberinizi teslim alın.",
      benefits: ["Hızlı üretim", "Express kargo", "Takip sistemi"]
    },
    {
      icon: Users,
      title: "Uzman Ekip Desteği",
      description: "Deneyimli implantoloji uzmanları ve teknik ekip ile sürekli destek.",
      benefits: ["Uzman danışmanlık", "Teknik destek", "Eğitim programları"]
    }
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Neden Digimplant Solutions?
          </h2>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Modern dental implantoloji için ihtiyacınız olan tüm araçları tek platformda sunuyoruz.
            Güvenilir, hızlı ve profesyonel çözümlerle cerrahi başarınızı artırın.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card hover-lift group space-y-modern"
            >
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <feature.icon size={28} className="text-white" />
                </div>
                        <h3 className="text-2xl font-bold text-gray-900 ml-6">
                          {feature.title}
                        </h3>
              </div>
              
              <p className="text-gray-700 mb-8 leading-relaxed text-lg">
                {feature.description}
              </p>

              <ul className="space-y-4">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="flex items-center text-gray-700">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-4"></div>
                    <span className="font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-32 bg-orange-500 rounded-3xl p-16 hover-lift">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
            <div className="space-y-4">
              <div className="text-5xl font-bold text-white">500+</div>
              <div className="text-white/90 text-lg font-medium">Mutlu Hekim</div>
            </div>
            <div className="space-y-4">
              <div className="text-5xl font-bold text-white">2000+</div>
              <div className="text-white/90 text-lg font-medium">Başarılı Vaka</div>
            </div>
            <div className="space-y-4">
              <div className="text-5xl font-bold text-white">24/7</div>
              <div className="text-white/90 text-lg font-medium">Destek Hizmeti</div>
            </div>
            <div className="space-y-4">
              <div className="text-5xl font-bold text-white">%99</div>
              <div className="text-white/90 text-lg font-medium">Müşteri Memnuniyeti</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
