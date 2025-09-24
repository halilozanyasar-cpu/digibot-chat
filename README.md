# Digimplant Solutions

Modern dental implantoloji için dijital cerrahi rehberleri, QR kodlu rapor sistemi ve AI destekli cerrahi asistan sunan kapsamlı web platformu.

## 🚀 Özellikler

### 🏥 Ana Özellikler
- **Dijital Cerrahi Rehber Tasarımı**: 3D planlama ve hassas implant yerleşimi
- **QR Kodlu Rapor Sistemi**: Hasta takibi ve dijital raporlama
- **AI Cerrahi Asistan**: GPT tabanlı uzman danışmanlık
- **Üyelik Sistemi**: Hekimler için güvenli kayıt ve giriş
- **Sipariş Yönetimi**: Kapsamlı sipariş takip sistemi
- **Ödeme Entegrasyonu**: iyzico ile güvenli ödeme

### 💳 Ödeme Sistemi
- **Guide Ücreti**: Anında tahsilat
- **Sleeve Ücreti**: PreAuth/PostAuth sistemi
- **İade Yönetimi**: Otomatik provizyon iptali

### 📱 Teknoloji Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Authentication**: NextAuth.js
- **Payment**: iyzico entegrasyonu
- **AI**: OpenAI GPT-3.5-turbo
- **QR Codes**: qrcode npm paketi

## 🛠️ Kurulum

### Gereksinimler
- Node.js 18+ 
- MongoDB
- npm veya yarn

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd digimplant-site
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
# veya
yarn install
```

### 3. Environment Variables
`env.example` dosyasını `.env.local` olarak kopyalayın ve gerekli değerleri doldurun:

```bash
cp env.example .env.local
```

Gerekli environment variables:
- `MONGODB_URI`: MongoDB bağlantı string'i
- `NEXTAUTH_SECRET`: NextAuth.js için secret key
- `OPENAI_API_KEY`: OpenAI API anahtarı
- `IYZICO_API_KEY`: iyzico API anahtarı
- `IYZICO_SECRET_KEY`: iyzico secret anahtarı
- `SMTP_*`: E-posta gönderimi için SMTP ayarları

### 4. Veritabanını Başlatın
MongoDB'yi başlatın ve veritabanını oluşturun.

### 5. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
# veya
yarn dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── orders/        # Order management
│   │   ├── reports/       # Report generation
│   │   ├── payment/       # Payment processing
│   │   ├── chat/          # AI chat interface
│   │   └── contact/       # Contact form
│   ├── dashboard/         # User dashboard
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── blog/              # Blog pages
│   ├── contact/           # Contact page
│   └── report/            # Report pages
├── components/            # React components
│   ├── Header.tsx         # Navigation header
│   ├── Footer.tsx         # Site footer
│   ├── HeroSection.tsx    # Homepage hero
│   ├── FeaturesSection.tsx # Features showcase
│   └── ChatInterface.tsx  # AI chat component
├── lib/                   # Utility libraries
│   ├── mongodb.ts         # Database connection
│   ├── auth.ts            # NextAuth configuration
│   └── iyzico.ts          # Payment integration
├── models/                # MongoDB models
│   ├── User.ts            # User schema
│   ├── Order.ts           # Order schema
│   └── Report.ts          # Report schema
└── types/                 # TypeScript type definitions
```

## 🔧 Kullanım

### Hekim Kaydı
1. Ana sayfadan "Kayıt Ol" butonuna tıklayın
2. Klinik bilgilerinizi girin
3. E-posta doğrulaması yapın

### Sipariş Oluşturma
1. Dashboard'a giriş yapın
2. "Yeni Sipariş" butonuna tıklayın
3. Hasta bilgilerini girin
4. İmplant detaylarını seçin
5. STL ve DICOM dosyalarını yükleyin
6. Siparişi onaylayın

### Ödeme İşlemi
1. Sipariş oluşturduktan sonra ödeme sayfasına yönlendirilirsiniz
2. iyzico ödeme formu ile güvenli ödeme yapın
3. Guide ücreti anında tahsil edilir
4. Sleeve ücreti provizyona alınır

### Rapor Görüntüleme
1. Tamamlanan siparişlerinizde QR kod görünür
2. QR kodu tarayarak rapora erişin
3. AI asistan ile sorularınızı sorun

## 🤖 AI Cerrahi Asistan

AI asistan aşağıdaki konularda yardımcı olur:
- İmplant planlaması
- Cerrahi teknikler
- Kemik kalitesi değerlendirmesi
- Post-operatif bakım
- Komplikasyon yönetimi

## 💰 Fiyatlandırma

- **Cerrahi Rehber**: ₺500 (anında tahsilat)
- **Sleeve**: ₺50/adet (provizyona alınır)
- **İade**: Guide iade edilirse provizyon iptal edilir

## 🔒 Güvenlik

- KVKK uyumlu veri işleme
- Şifreli veri saklama
- Güvenli ödeme işlemleri
- JWT tabanlı kimlik doğrulama

## 📞 Destek

- **Telefon**: +90 (212) 555 0123
- **E-posta**: info@digimplantsolutions.com
- **Çalışma Saatleri**: Pazartesi-Cuma 09:00-18:00

## 🚀 Deployment

### Vercel (Önerilen)
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t digimplant-site .
docker run -p 3000:3000 digimplant-site
```

## 📝 Lisans

Bu proje özel lisans altındadır. Tüm hakları saklıdır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📧 İletişim

- **Website**: [digimplantsolutions.com](https://digimplantsolutions.com)
- **Email**: info@digimplantsolutions.com
- **Address**: Maslak Mahallesi, Büyükdere Caddesi No: 123, Sarıyer/İstanbul
