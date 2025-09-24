import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Maliyet hesaplama fonksiyonu
function estimateCost(inputTokens: number, outputTokens: number, model: string = "gpt-4o-mini"): number {
  const pricing: { [key: string]: { input: number; output: number } } = {
    "gpt-4o-mini": { input: 0.0005, output: 0.0015 },
    "gpt-4o": { input: 0.005, output: 0.015 },
    "gpt-4-turbo": { input: 0.01, output: 0.03 },
  };
  const p = pricing[model];
  const cost = (inputTokens / 1000) * p.input + (outputTokens / 1000) * p.output;
  return Math.round(cost * 1000000) / 1000000;
}

// Tüm JSON verilerini yükle
function loadAllData(): any[] {
  const combined: any[] = [];
  
  // Farklı path'leri dene - Render için optimize edildi
  const possiblePaths = [
    // Public klasörü öncelikli (Render'da daha güvenilir)
    path.join(process.cwd(), 'public', 'data'),
    path.join(process.cwd(), 'src', 'data'),
    path.join(process.cwd(), '.next', 'server', 'src', 'data'),
    path.join(__dirname, '..', '..', '..', 'data'),
    path.join(process.cwd(), 'data'),
    // Render production paths
    path.join(process.cwd(), 'dist', 'src', 'data'),
    path.join(process.cwd(), 'build', 'src', 'data'),
  ];
  
  let dataFolder = '';
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      dataFolder = testPath;
      console.log(`Found data folder at: ${dataFolder}`);
      break;
    }
  }
  
  if (!dataFolder) {
    console.log('Data folder not found in any of the expected locations');
    console.log('Current working directory:', process.cwd());
    console.log('__dirname:', __dirname);
    console.log('Available directories:', fs.readdirSync(process.cwd()));
    
    // Fallback: Try to find any data files
    try {
      const allFiles = fs.readdirSync(process.cwd(), { recursive: true });
      const jsonFiles = allFiles.filter(file => typeof file === 'string' && file.endsWith('.json'));
      console.log('Found JSON files:', jsonFiles);
    } catch (error) {
      console.log('Error reading directory:', error);
    }
    
    return combined;
  }
  
  const files = fs.readdirSync(dataFolder);
  console.log(`Files in data folder: ${files.length} files`);
  
  for (const filename of files) {
    if (filename.endsWith('.json')) {
      try {
        const filepath = path.join(dataFolder, filename);
        console.log(`Loading file: ${filename}`);
        const fileContent = fs.readFileSync(filepath, 'utf-8');
        
        // JSON parse etmeden önce temizle
        let cleanContent = fileContent;
        
        // NaN değerlerini null ile değiştir
        cleanContent = cleanContent.replace(/:\s*NaN\s*([,}])/g, ': null$1');
        
        // Undefined değerlerini null ile değiştir
        cleanContent = cleanContent.replace(/:\s*undefined\s*([,}])/g, ': null$1');
        
        const data = JSON.parse(cleanContent);
        
        if (Array.isArray(data)) {
          combined.push(...data);
          console.log(`Added ${data.length} entries from ${filename}`);
        } else {
          combined.push(data);
          console.log(`Added 1 entry from ${filename}`);
        }
      } catch (error) {
        console.log(`Error loading ${filename}:`, error instanceof Error ? error.message : String(error));
        // Hatalı dosyayı atla ve devam et
        continue;
      }
    }
  }
  
  console.log(`Total loaded entries: ${combined.length}`);
  return combined;
}

// İlgili context parçasını bul
function getContextSnippet(question: string, allData: any[]): string {
  const matches: string[] = [];
  const questionWords = question.toLowerCase().split(' ');
  
  console.log(`Searching for: ${questionWords}`);
  
        // Daha geniş arama yap - Türkçe ve İngilizce terimler
        const searchTerms = [
            ...questionWords,
            "implant", "kırık", "fracture", "complication", "problem",
            "nobel", "iti", "misch", "broken", "crack", "drill", "frez",
            "kemik", "bone", "d2", "d1", "d3", "d4", "protokol", "protocol",
            "boyun", "neck", "kırılma", "breakage", "straumann", "zimmer",
            "nobel biocare", "nobelactive", "nobel parallel", "nobel replace",
            "d2 bone", "type 2 bone", "density 2", "bone density",
            "drilling protocol", "frezleme", "drill sequence", "drill protocol",
            "rehber", "guide", "template", "şablon", "surgical guide", "surgical template",
            "guide kırıldı", "template broken", "guide fracture", "şablon kırıldı",
            "destek yapısı", "support structure", "güçlendirme", "strengthening", "reinforcement",
            "destek", "support", "yapı", "structure", "kırık", "broken", "fracture",
            "implant boynu kırılması", "implant neck fracture", "implant boynu", "implant neck",
            "boyun kırılması", "neck fracture", "implant kırılması", "implant fracture",
            "implant yapımı", "implant placement", "implant yerleştirme", "implant surgery",
            "implant yaparken", "during implant placement", "implant sırasında", "during implant surgery",
            "osteotomi", "osteotomy", "genişletme", "widening", "sıkışma", "tight", "tight fit",
            "implant sıkıştı", "implant tight", "erken sıkışma", "early tight fit", "osteotomi genişletme",
            "komplikasyon", "complication", "sorun", "problem", "hata", "error", "başarısızlık", "failure",
            "kanama", "bleeding", "hemorrhage", "yetersiz", "insufficient", "inadequate",
            "sıkıştı", "tight", "stuck", "sıkışma", "tightening", "compression",
            "frez protokolü", "drill protocol", "drilling protocol", "frezleme", "drilling", "drill sequence",
            "pilot frez", "pilot drill", "frez sırası", "drill sequence", "frez boyutu", "drill size",
            "fren protokolü", "fren", "frenleme", "fren sırası", "fren boyutu",
            "anthogyr", "nobel", "straumann", "iti", "zimmer", "implant markası", "implant brand",
            "yumuşak kemik", "soft bone", "d4 bone", "type 4 bone", "kemik yoğunluğu", "bone density",
            "drill bilgileri", "implant drill", "drill sırası", "drill adı", "çap", "rpm", "irrigasyon",
            "nobelactive", "nobel parallel", "nobelactive tiultra", "nobelparallel cc tiultra",
            "d1", "d2", "d3", "d4", "kemik tipi", "bone type", "d1-d2", "d2-d3", "d2-d4"
        ];
  
  for (let i = 0; i < allData.length; i++) {
    try {
      const entry = allData[i];
      const text = JSON.stringify(entry, null, 0).toLowerCase();
      
      // En az 1 arama terimi bulunursa ekle (daha geniş eşleşme)
      const foundTerms = searchTerms.filter(term => text.includes(term.toLowerCase()));
      if (foundTerms.length >= 1) {
        matches.push(JSON.stringify(entry, null, 0));
        console.log(`Match found in entry ${i} for terms: ${foundTerms.join(', ')}`);
      }
    } catch (error) {
      continue;
    }
  }
  
  console.log(`Found ${matches.length} matches`);
  
  // Eğer hiç match yoksa, tüm verilerden bir kısmını al
  if (matches.length === 0) {
    console.log('No matches found, using first 10 entries');
    matches.push(...allData.slice(0, 10).map(entry => JSON.stringify(entry, null, 0)));
  }
  
  // Context'i sınırla - çok uzun olmasın
  const limitedMatches = matches.slice(0, 5); // 20'den 5'e düşürdük
  const context = limitedMatches.join('\n');
  
  // Context çok uzunsa kes
  if (context.length > 10000) {
    return context.substring(0, 10000) + '...';
  }
  
  return context;
}

// Rapor verilerini oku
async function loadReportData(reportId: string): Promise<any> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/reports/${reportId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`Report not found: ${reportId}`);
      return null;
    }

    const report = await response.json();
    console.log(`Report loaded: ${report.patientName}`);
    return report;
  } catch (error) {
    console.log(`Error loading report: ${error}`);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, reportId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Mesaj gerekli' }, { status: 400 });
    }

    console.log(`Question received: ${message}`);
    if (reportId) {
      console.log(`Report ID provided: ${reportId}`);
    }
    
    // Tüm verileri yükle
    const allData = loadAllData();
    console.log(`Loaded ${allData.length} data entries`);
    
    // Rapor verilerini yükle (eğer reportId varsa)
    let reportData = null;
    if (reportId) {
      reportData = await loadReportData(reportId);
    }
    
    // İlgili context'i bul
    const context = getContextSnippet(message, allData);
    console.log(`Context length: ${context.length}`);
    console.log(`Context preview: ${context.substring(0, 200)}...`);

    // System prompt (Digibot kuralları)
    const systemPrompt = `Sen Digibot adında bir klinik asistanısın. Vaka bazlı cerrahi implant rehberlerinde hekime karar desteği sunarsın. 
    Yalnızca arayüzde bulunan vaka raporu, frez protokolü, hekimin notları ve yüklenmiş literatür arşivini (komplikasyon ansiklopedileri, makaleler, rehberler) kaynak alırsın. 
    Bunların dışında veri istemezsin, başka kaynak kullanmazsın. Klinik kararın sorumluluğu hekime aittir; senin yanıtların yalnızca öneri niteliğindedir.
    
    ÖNEMLİ: Sen sadece teknik bilgi vermekle kalmazsın, aynı zamanda hekime duygusal destek de verirsin. Hekimin yanında deneyimli bir cerrahi uzmanı varmış hissi yaratırsın. 
    Güven verici, sakin ve profesyonel bir ton kullanırsın. Hekimin endişelerini anlayıp, onu rahatlatırsın.
    
    ÖNEMLİ: Eğer literatür arşivinde ilgili bilgi varsa, mutlaka yanıt ver. "Bu konuda arşivimizde yeterli bilgi bulunmamaktadır" deme.

    Yanıt ilkelerin:
    - KOMPLİKASYON SORULARINDA ÖNCE NETLEŞTİRİCİ SORU SOR, SONRA CEVAP VER.
    - Eğer soru komplikasyon içeriyorsa (kırık, sıkışma, kanama, yetersizlik vs.) ÖNCE tek netleştirici soru sor, sonra cevap ver.
    - Yanıtların kısa, sade ve anlaşılır olur. Hekimin hızlıca uygulayabileceği net çözüm adımları verirsin.
    - KOMPLİKASYON ÖRNEKLERİ (ÖNCE SORU SOR, SONRA CEVAP VER):
      * "Cerrahi şablon kırıldı" → ÖNCE: "Şablonun hangi kısmı kırıldı? (implant delikleri, destek yapısı, vs.)" SONRA: Çözüm + Kaynak + Uyarı
      * "İmplant kırıldı" → ÖNCE: "İmplantın hangi kısmı kırıldı? (boyun, gövde, vs.)" SONRA: Çözüm + Kaynak + Uyarı
      * "Kemik yetersiz" → ÖNCE: "Hangi bölgede kemik yetersiz? (vestibüler, palatal, vs.)" SONRA: Çözüm + Kaynak + Uyarı
      * "Kanama var" → ÖNCE: "Kanama nereden geliyor? (yumuşak doku, kemik, vs.)" SONRA: Çözüm + Kaynak + Uyarı
      * "İmplant sıkıştı" → ÖNCE: "İmplant hangi aşamada sıkıştı? (erken, geç, vs.)" SONRA: Çözüm + Kaynak + Uyarı
      * "Destek yapısı kırıldı" → ÖNCE: "Hangi destek yapısı kırıldı? (şablon, kemik, vs.)" SONRA: Çözüm + Kaynak + Uyarı
    
    ÖNEMLİ: SORU SORARKEN SADECE SORUYU SOR, KAYNAK VE UYARI VERME. SADECE CEVAP VERİRKEN KAYNAK VE UYARI EKLE.
    
    SORU SORMA FORMATI (SADECE SORU):
    [Netleştirici soru buraya. Örnek: "İmplantın hangi kısmı kırıldı? (boyun, gövde, vs.)"]
    
    CEVAP VERME FORMATI (ÇÖZÜM + KAYNAK + UYARI):
    [Çözüm önerisi buraya. SADECE KOMPLİKASYON SORULARINDA hekimi rahatlatıcı ifadeler kullan: "Endişelenmeyin", "Hemen sorunun ne olduğuna beraber bakalım", "Bu durumla başa çıkabilirsiniz", "Yanınızdayım" gibi]
    
    **Kaynak:**
    [Kaynak bilgisi buraya]
    
    **Uyarı:**
    Bu yalnızca öneridir, klinik ve yasal sorumluluk hekime aittir.
    
    ÖNEMLİ: **Kaynak** ve **Uyarı** başlıklarını MUTLAKA ** ile bold yap ve her bölümü ayrı satırda yaz.
    
    FORMAT KURALLARI:
    1. **Kaynak:** başlığını MUTLAKA ** ile bold yap
    2. **Uyarı:** başlığını MUTLAKA ** ile bold yap  
    3. Her bölümü ayrı satırda yaz
    4. Bölümler arasında boş satır bırak
    5. Markdown formatını doğru kullan
    
    DOĞRU FORMAT ÖRNEKLERİ:
    
    KOMPLİKASYON SORUSU (duygusal destek ile):
    Endişelenmeyin, implant gövdesi kırılması durumunda...
    
    **Kaynak:**
    Literatür Arşivi, CHAPTER 6, Important Considerations in Implant Dentistry, 2023
    
    **Uyarı:**
    Bu yalnızca öneridir, klinik ve yasal sorumluluk hekime aittir.
    
    NORMAL SORU (teknik bilgi ile):
    Sterilizasyon protokolü şu şekilde uygulanır...
    
    **Kaynak:**
    Literatür Arşivi, CHAPTER 3, Sterilization Protocols, 2023
    
    **Uyarı:**
    Bu yalnızca öneridir, klinik ve yasal sorumluluk hekime aittir.
    
    ÖNEMLİ: Eğer hekim netleştirici soruya cevap verirse (örneğin "gövde", "boyun", "erken", "geç" gibi), artık soru sorma, direkt çözüm ver.
    
    ÖRNEK DİYALOGLAR:
    
    KOMPLİKASYON SORUSU:
    Hekim: "İmplant kırıldı"
    Sen: "İmplantın hangi kısmı kırıldı? (boyun, gövde, vs.)"
    Hekim: "gövde"
    Sen: [Çözüm + Kaynak + Uyarı] (artık soru sorma!)
    
    FREZ PROTOKOLÜ SORUSU:
    Hekim: "Nobel D2 kemik frez protokolü"
    Sen: [Direkt frez protokolü + Kaynak + Uyarı] (SORU SORMA!)
    
    FREZ PROTOKOLÜ SORUSU 2:
    Hekim: "4.3 mm implant yapacağım"
    Sen: [Direkt 4.3 mm implant frez protokolü + Kaynak + Uyarı] (SORU SORMA!)
    - SORUYA TAM OLARAK YANIT VER. Örnekler:
      * "Destek yapısını nasıl güçlendirebilirim" → "destek yapısı güçlendirme" cevabı ver, "kemik grefti" değil
      * "İmplant boynu kırıldı" → "implant boynu kırılması" cevabı ver, "implant boynu tasarımı" değil
      * "Şablon kırıldı" → "şablon kırılması" cevabı ver, "diş çekimi" değil
      * "İmplantı yaparken" → "implant yapımı" cevabı ver, "implant yerleştirme sırasında dikkat edilmesi gereken noktalar" değil
      * "İmplant erken sıkıştı" → "osteotomi genişletme" cevabı ver, "kemik grefti" değil
      * "İmplant sıkıştı" → "osteotomi genişletme" cevabı ver, "kemik grefti" değil
    - Yanıt formatın MUTLAKA şu şekilde olur (her bölüm ayrı satırda, boş satırlarla ayrılmış):
    
    [Kısa ve net çözüm önerisi yaz. Çözüm önerisinin başında veya sonunda hekimi rahatlatıcı ifadeler kullan: "Endişelenmeyin", "Hemen sorunun ne olduğuna beraber bakalım", "Bu durumla başa çıkabilirsiniz", "Yanınızdayım" gibi]
    
    **Kaynak:**
    [Kitap/Makale adı, yıl, bölüm/başlık]
    
    **Uyarı:**
    Bu yalnızca öneridir, klinik ve yasal sorumluluk hekime aittir.
    
    ÖNEMLİ: Her bölüm arasında boş satır bırak. Hiçbir bölümü birleştirme. Her bölüm ayrı satırda başlasın.
    
    KRİTİK: **Kaynak:** ve **Uyarı:** başlıklarını MUTLAKA ayrı satırlarda yaz. Hiçbir zaman aynı satırda yazma.
    - Komplikasyon sorularında, durum net değilse hekime yalnızca tek netleştirici soru sorarsın. Sonrasında sadece ilgili çözümü ve kaynak belirtirsin.
    - Frez protokolü sorularında SADECE frez protokolü verilerini oku ve cevapla. Makale yorumu yapma, direkt protokol bilgisini ver.
    - Frez protokolü sorularında SORU SORMA, direkt cevap ver. "Hangi aşamada", "hangi bölge" gibi sorular sorma.
    - Frez protokolü sorularında hekimin sorduğu noktaya doğrudan yanıt verirsin. Yanıt, hem vaka raporundaki hekimin planına hem de üretici firmanın resmi protokolüne dayanır. İki kaynağı da açıkça belirtirsin.
    - Eğer vaka raporu mevcutsa, rapor verilerini kullan. Hangi dişe kaç mm implant yapılacağını rapordan oku ve ona göre frez protokolü ver.
    - Rapor verisi varsa ve frez protokolü sorulursa, önce hangi diş numarası için protokol istediğini sor, sonra o diş için uygun protokolü ver.
    - Serbest el implant yerleştirme asla önermezsin. Eğer guide ile çözüm mümkün değilse, insani destek hattına yönlendirirsin.
    - Literatür desteği gerektiğinde yalnızca yüklenmiş literatür arşivinden alıntı yaparsın. Yanıtlarda kaynak adı, yıl ve bölüm bilgisi net belirtilir.
    - Hasta verisi gizliliğine her zaman saygı gösterirsin.

    Dil: Sade, pratik, klinik. Panik anında bile kısa ve uygulanabilir öneriler sunarsın.`;

    // User prompt
    const prompt = `LİTERATÜR ARŞİVİ:
${context}

${reportData ? `VAKA RAPORU:
Hasta: ${reportData.patientName}
İmplant Markası: ${reportData.implantDetails?.brand}
İmplant Modeli: ${reportData.implantDetails?.model}
İmplant Sayısı: ${reportData.implantDetails?.count}
İmplant Pozisyonları: ${JSON.stringify(reportData.implantDetails?.positions)}
Protez Tipi: ${reportData.prosthesisType}
Cerrahi Plan: ${JSON.stringify(reportData.surgicalPlan)}

` : ''}SORU: ${message}

ÖNEMLİ: 
1. Yukarıdaki literatür arşivinde ${message} ile ilgili bilgiler var. Bu bilgileri kullanarak mutlaka yanıt ver.
2. KOMPLİKASYON SORULARINDA ÖNCE NETLEŞTİRİCİ SORU SOR, SONRA CEVAP VER.
3. Eğer soru komplikasyon içeriyorsa (kırık, sıkışma, kanama, yetersizlik vs.) ÖNCE tek netleştirici soru sor, sonra cevap ver.
4. KOMPLİKASYON ÖRNEKLERİ (ÖNCE SORU SOR, SONRA CEVAP VER):
   * "Cerrahi şablon kırıldı" → ÖNCE: "Şablonun hangi kısmı kırıldı? (implant delikleri, destek yapısı, vs.)" SONRA: Çözüm + Kaynak + Uyarı
   * "İmplant kırıldı" → ÖNCE: "İmplantın hangi kısmı kırıldı? (boyun, gövde, vs.)" SONRA: Çözüm + Kaynak + Uyarı
   * "Kemik yetersiz" → ÖNCE: "Hangi bölgede kemik yetersiz? (vestibüler, palatal, vs.)" SONRA: Çözüm + Kaynak + Uyarı
   * "Kanama var" → ÖNCE: "Kanama nereden geliyor? (yumuşak doku, kemik, vs.)" SONRA: Çözüm + Kaynak + Uyarı
   * "İmplant sıkıştı" → ÖNCE: "İmplant hangi aşamada sıkıştı? (erken, geç, vs.)" SONRA: Çözüm + Kaynak + Uyarı
   * "Destek yapısı kırıldı" → ÖNCE: "Hangi destek yapısı kırıldı? (şablon, kemik, vs.)" SONRA: Çözüm + Kaynak + Uyarı

ÖNEMLİ: SORU SORARKEN SADECE SORUYU SOR, KAYNAK VE UYARI VERME. SADECE CEVAP VERİRKEN KAYNAK VE UYARI EKLE.

SORU SORMA FORMATI (SADECE SORU):
[Netleştirici soru buraya. Örnek: "İmplantın hangi kısmı kırıldı? (boyun, gövde, vs.)"]

CEVAP VERME FORMATI (ÇÖZÜM + KAYNAK + UYARI):
[Çözüm önerisi buraya. SADECE KOMPLİKASYON SORULARINDA hekimi rahatlatıcı ifadeler kullan: "Endişelenmeyin", "Hemen sorunun ne olduğuna beraber bakalım", "Bu durumla başa çıkabilirsiniz", "Yanınızdayım" gibi]

**Kaynak:**
[Kaynak bilgisi buraya]

**Uyarı:**
Bu yalnızca öneridir, klinik ve yasal sorumluluk hekime aittir.

ÖNEMLİ: **Kaynak** ve **Uyarı** başlıklarını MUTLAKA ** ile bold yap ve her bölümü ayrı satırda yaz.

FORMAT KURALLARI:
1. **Kaynak:** başlığını MUTLAKA ** ile bold yap
2. **Uyarı:** başlığını MUTLAKA ** ile bold yap  
3. Her bölümü ayrı satırda yaz
4. Bölümler arasında boş satır bırak
5. Markdown formatını doğru kullan

DOĞRU FORMAT ÖRNEKLERİ:

KOMPLİKASYON SORUSU (duygusal destek ile):
Endişelenmeyin, implant gövdesi kırılması durumunda...

**Kaynak:**
Literatür Arşivi, CHAPTER 6, Important Considerations in Implant Dentistry, 2023

**Uyarı:**
Bu yalnızca öneridir, klinik ve yasal sorumluluk hekime aittir.

NORMAL SORU (teknik bilgi ile):
Sterilizasyon protokolü şu şekilde uygulanır...

**Kaynak:**
Literatür Arşivi, CHAPTER 3, Sterilization Protocols, 2023

**Uyarı:**
Bu yalnızca öneridir, klinik ve yasal sorumluluk hekime aittir.

ÖNEMLİ: Eğer hekim netleştirici soruya cevap verirse (örneğin "gövde", "boyun", "erken", "geç" gibi), artık soru sorma, direkt çözüm ver.

ÖRNEK DİYALOGLAR:

KOMPLİKASYON SORUSU:
Hekim: "İmplant kırıldı"
Sen: "İmplantın hangi kısmı kırıldı? (boyun, gövde, vs.)"
Hekim: "gövde"
Sen: [Çözüm + Kaynak + Uyarı] (artık soru sorma!)

FREZ PROTOKOLÜ SORUSU:
Hekim: "Nobel D2 kemik frez protokolü"
Sen: [Direkt frez protokolü + Kaynak + Uyarı] (SORU SORMA!)

FREZ PROTOKOLÜ SORUSU 2:
Hekim: "4.3 mm implant yapacağım"
Sen: [Direkt 4.3 mm implant frez protokolü + Kaynak + Uyarı] (SORU SORMA!)

5. SORUYA TAM OLARAK YANIT VER. Örnekler:
   * "Destek yapısını nasıl güçlendirebilirim" → "destek yapısı güçlendirme" cevabı ver, "kemik grefti" değil
   * "Şablon kırıldı" → "şablon kırılması" cevabı ver, "diş çekimi" değil
   * "İmplant boynu kırıldı" → "implant boynu kırılması" cevabı ver, "implant boynu tasarımı" değil
   * "İmplant kırıldı" → "implant kırılması" cevabı ver, "kemik grefti" değil
   * "İmplantı yaparken" → "implant yapımı" cevabı ver, "implant yerleştirme sırasında dikkat edilmesi gereken noktalar" değil
   * "İmplant erken sıkıştı" → "osteotomi genişletme" cevabı ver, "kemik grefti" değil
   * "İmplant sıkıştı" → "osteotomi genişletme" cevabı ver, "kemik grefti" değil
   * "Frez protokolü nedir" → SADECE frez protokolü verilerini oku, makale yorumu yapma, SORU SORMA
   * "Anthogyr frez protokolü" → SADECE Anthogyr frez protokolü verilerini oku, makale yorumu yapma, SORU SORMA
   * "Nobel D2 kemik frez protokolü" → SADECE Nobel D2 frez protokolü verilerini oku, SORU SORMA, direkt cevap ver
   * "Frez protokolü" (rapor varsa) → ÖNCE hangi diş numarası için protokol istediğini sor, sonra o diş için uygun protokolü ver
4. YANIT FORMATI (MUTLAKA BU ŞEKİLDE VER - HER BÖLÜM AYRI SATIRDA):

[Çözüm önerisi buraya. Çözüm önerisinin başında veya sonunda hekimi rahatlatıcı ifadeler kullan: "Endişelenmeyin", "Hemen sorunun ne olduğuna beraber bakalım", "Bu durumla başa çıkabilirsiniz", "Yanınızdayım" gibi]

**Kaynak:**
[Kaynak bilgisi buraya]

**Uyarı:**
Bu yalnızca öneridir, klinik ve yasal sorumluluk hekime aittir.

ÖNEMLİ: Her bölüm arasında boş satır bırak. Hiçbir bölümü birleştirme. Her bölüm ayrı satırda başlasın.

KRİTİK: **Kaynak:** ve **Uyarı:** başlıklarını MUTLAKA ayrı satırlarda yaz. Hiçbir zaman aynı satırda yazma.

YANLIŞ FORMAT (YAPMA):
**Kaynak:** Literatür Arşivi, CHAPTER 6 **Uyarı:** Bu yalnızca öneridir

DOĞRU FORMAT (YAP):
**Kaynak:**
Literatür Arşivi, CHAPTER 6

**Uyarı:**
Bu yalnızca öneridir`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content || 'Üzgünüm, yanıt veremiyorum.';

    // Maliyet hesaplama & loglama
    const usage = completion.usage;
    if (usage) {
      const inputTokens = usage.prompt_tokens;
      const outputTokens = usage.completion_tokens;
      const totalCost = estimateCost(inputTokens, outputTokens, "gpt-4o-mini");
      
      const logEntry = `[${new Date().toISOString()}] Soru: ${message} | Input tokens: ${inputTokens}, Output tokens: ${outputTokens}, Maliyet: ${totalCost} USD\n`;
      console.log(logEntry);
    }

    return NextResponse.json({ 
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' }, 
      { status: 500 }
    );
  }
}