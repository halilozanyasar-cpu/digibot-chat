# Digimplant Solutions - Deployment Rehberi

## 🚀 Vercel Deployment (Önerilen)

### 1. Vercel'e Deploy Etme
```bash
# Vercel CLI kurulumu
npm i -g vercel

# Projeyi deploy etme
vercel

# Production'a deploy etme
vercel --prod
```

### 2. Environment Variables Ayarlama
Vercel Dashboard'da aşağıdaki environment variables'ları ekleyin:

```
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_secret_key
IYZICO_API_KEY=your_iyzico_key
IYZICO_SECRET_KEY=your_iyzico_secret
```

## 🐳 Railway Deployment

### 1. Railway'a Deploy Etme
```bash
# Railway CLI kurulumu
npm install -g @railway/cli

# Login
railway login

# Proje oluşturma
railway init

# Deploy etme
railway up
```

### 2. Environment Variables
Railway Dashboard'da environment variables'ları ekleyin.

## 🔧 Render Deployment

### 1. Render'a Deploy Etme
1. GitHub repository'nizi Render'a bağlayın
2. Build Command: `npm run build`
3. Start Command: `npm start`
4. Environment variables'ları ekleyin

## 📊 MongoDB Atlas Kurulumu

### 1. MongoDB Atlas Hesabı Oluşturma
1. [MongoDB Atlas](https://www.mongodb.com/atlas) hesabı oluşturun
2. Yeni cluster oluşturun
3. Database user oluşturun
4. Network access ayarlayın (0.0.0.0/0)

### 2. Connection String
```
mongodb+srv://username:password@cluster.mongodb.net/digimplant?retryWrites=true&w=majority
```

## 🔐 Güvenlik Ayarları

### 1. API Key Güvenliği
- OpenAI API key'inizi güvenli tutun
- Rate limiting ekleyin
- CORS ayarlarını yapın

### 2. Veri Güvenliği
- MongoDB'de authentication kullanın
- SSL/TLS bağlantıları zorunlu yapın
- Regular backup alın

## 📱 Mobil Uyumluluk
- Responsive design zaten mevcut
- PWA özellikleri eklenebilir
- Offline çalışma modu eklenebilir

## 🔄 CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📈 Monitoring ve Analytics
- Vercel Analytics
- Sentry error tracking
- Google Analytics
- Uptime monitoring

## 🚨 Troubleshooting

### Yaygın Sorunlar:
1. **Environment Variables**: Tüm gerekli değişkenlerin ayarlandığından emin olun
2. **MongoDB Connection**: Connection string'in doğru olduğunu kontrol edin
3. **OpenAI API**: API key'in geçerli ve limitlerin aşılmadığını kontrol edin
4. **Build Errors**: `npm run build` komutunu local'de test edin

### Log Kontrolü:
```bash
# Vercel logs
vercel logs

# Railway logs
railway logs
```

## 📞 Destek
Herhangi bir sorun yaşarsanız:
- GitHub Issues
- Email: support@digimplantsolutions.com
- Dokümantasyon: [docs.digimplantsolutions.com](https://docs.digimplantsolutions.com)

