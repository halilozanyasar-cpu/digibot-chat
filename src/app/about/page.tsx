'use client';

import { 
  Users, 
  Target, 
  Award, 
  Heart, 
  CheckCircle,
  ArrowRight,
  Globe,
  Shield,
  Zap
} from 'lucide-react';

const teamMembers = [
  {
    name: 'Dr. Ahmet Yılmaz',
    role: 'Kurucu & CEO',
    specialty: 'Oral ve Maxillofacial Cerrahi',
    experience: '15+ yıl',
    image: '/team/ahmet.jpg'
  },
  {
    name: 'Dr. Elif Kaya',
    role: 'CTO',
    specialty: 'Dijital Teknoloji Uzmanı',
    experience: '10+ yıl',
    image: '/team/elif.jpg'
  },
  {
    name: 'Dr. Mehmet Demir',
    role: 'Baş Cerrah',
    specialty: 'İmplantoloji Uzmanı',
    experience: '12+ yıl',
    image: '/team/mehmet.jpg'
  },
  {
    name: 'Dr. Zeynep Özkan',
    role: 'AI Uzmanı',
    specialty: 'Yapay Zeka ve Makine Öğrenmesi',
    experience: '8+ yıl',
    image: '/team/zeynep.jpg'
  }
];

const values = [
  {
    icon: Target,
    title: 'Hassasiyet',
    description: 'Her cerrahi rehberde mükemmeliyetçilik ve hassasiyet'
  },
  {
    icon: Shield,
    title: 'Güvenlik',
    description: 'Hasta verilerinin en üst düzeyde korunması'
  },
  {
    icon: Zap,
    title: 'İnovasyon',
    description: 'Sürekli gelişim ve teknolojik yenilikler'
  },
  {
    icon: Heart,
    title: 'Hasta Odaklılık',
    description: 'Her kararda hasta sağlığını ön planda tutma'
  }
];

const milestones = [
  {
    year: '2020',
    title: 'Kuruluş',
    description: 'Digimplant Solutions kuruldu'
  },
  {
    year: '2021',
    title: 'İlk Başarı',
    description: '1000+ başarılı cerrahi rehber'
  },
  {
    year: '2022',
    title: 'AI Entegrasyonu',
    description: 'Yapay zeka destekli sistem'
  },
  {
    year: '2023',
    title: 'Uluslararası',
    description: '5 ülkede hizmet vermeye başladı'
  },
  {
    year: '2024',
    title: 'Büyüme',
    description: '500+ mutlu hekim, 2000+ vaka'
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="glass backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-6">
              Hakkımızda
            </h1>
            <p className="text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              Modern dental implantoloji için teknoloji ve tıbbı buluşturan yenilikçi çözümler
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          <div className="glass rounded-3xl p-10 hover-lift">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Target size={28} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white ml-6">Misyonumuz</h2>
            </div>
            <p className="text-white/90 text-lg leading-relaxed">
              Dental implantoloji alanında teknoloji ve tıbbı buluşturarak, hekimlerin cerrahi başarısını artırmak ve hastaların yaşam kalitesini yükseltmek. Her cerrahi rehberde mükemmeliyetçilik ve hassasiyetle, güvenilir ve yenilikçi çözümler sunmak.
            </p>
          </div>

          <div className="glass rounded-3xl p-10 hover-lift">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Globe size={28} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white ml-6">Vizyonumuz</h2>
            </div>
            <p className="text-white/90 text-lg leading-relaxed">
              Dünya çapında dental implantoloji alanında öncü bir platform olmak. Yapay zeka ve dijital teknolojilerle desteklenen, her hekimin güvenle kullanabileceği, hasta sonuçlarını optimize eden bir ekosistem yaratmak.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-24">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-6">
              Değerlerimiz
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Çalışma prensiplerimizi ve değerlerimizi oluşturan temel unsurlar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {values.map((value, index) => (
              <div key={index} className="glass rounded-3xl p-8 hover-lift text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <value.icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-white/80 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-6">
              Ekibimiz
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Alanında uzman, deneyimli ve tutkulu profesyonellerden oluşan ekibimiz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="glass rounded-3xl p-8 hover-lift text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-4xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-orange-400 font-semibold mb-2">{member.role}</p>
                <p className="text-white/80 text-sm mb-2">{member.specialty}</p>
                <p className="text-white/60 text-sm">{member.experience} deneyim</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-6">
              Yolculuğumuz
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Kuruluşumuzdan bugüne kadar geçen süreçteki önemli kilometre taşlarımız
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-orange-500 to-orange-600"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="glass rounded-2xl p-6 hover-lift">
                      <div className="text-orange-400 font-bold text-lg mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-white mb-2">{milestone.title}</h3>
                      <p className="text-white/80">{milestone.description}</p>
                    </div>
                  </div>
                  
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg z-10">
                    <CheckCircle size={16} className="text-white" />
                  </div>
                  
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="glass rounded-3xl p-12 hover-lift">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
            <div className="space-y-4">
              <div className="text-5xl font-bold text-white drop-shadow-lg">500+</div>
              <div className="text-white/90 text-lg font-medium">Mutlu Hekim</div>
            </div>
            <div className="space-y-4">
              <div className="text-5xl font-bold text-white drop-shadow-lg">2000+</div>
              <div className="text-white/90 text-lg font-medium">Başarılı Vaka</div>
            </div>
            <div className="space-y-4">
              <div className="text-5xl font-bold text-white drop-shadow-lg">24/7</div>
              <div className="text-white/90 text-lg font-medium">Destek Hizmeti</div>
            </div>
            <div className="space-y-4">
              <div className="text-5xl font-bold text-white drop-shadow-lg">%99</div>
              <div className="text-white/90 text-lg font-medium">Müşteri Memnuniyeti</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
