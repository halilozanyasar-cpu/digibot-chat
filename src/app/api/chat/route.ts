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

// Context snippet bulma fonksiyonu
function getContextSnippet(query: string, data: any[]): string {
  if (!data || data.length === 0) return '';
  
  const queryLower = query.toLowerCase();
  const matches: string[] = [];
  
  // Basit arama - tüm veriyi kontrol et
  for (const item of data) {
    const itemStr = JSON.stringify(item).toLowerCase();
    if (itemStr.includes(queryLower)) {
      matches.push(JSON.stringify(item));
    }
  }
  
  console.log(`Found ${matches.length} matches`);
  
  // Context uzunluğunu sınırla
  let context = matches.join('\n\n');
  if (context.length > 5000) {
    context = context.substring(0, 5000) + '...';
  }
  
  return context;
}

// Rapor verilerini yükle
async function loadReportData(reportId: string): Promise<any> {
  try {
    // Rapor verilerini yükleme mantığı burada olacak
    return null;
  } catch (error) {
    console.error('Error loading report data:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, reportId } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Mesaj gerekli' }, 
        { status: 400 }
      );
    }

    console.log(`Received message: ${message}`);
    
    // Tüm verileri yükle
    const allData = loadAllData();
    console.log(`Loaded ${allData.length} total entries`);
    
    // Rapor verilerini yükle (eğer reportId varsa)
    let reportData = null;
    if (reportId) {
      reportData = await loadReportData(reportId);
    }
    
    // İlgili context'i bul
    const context = getContextSnippet(message, allData);
    console.log(`Context length: ${context.length}`);
    console.log(`Context preview: ${context.substring(0, 200)}...`);
    
    // Test için daha büyük context oluştur
    const simpleContext = allData.length > 0 ? JSON.stringify(allData.slice(0, 5)).substring(0, 3000) : 'No data available';
    console.log(`Simple context: ${simpleContext}`);

    // System prompt - Çok agresif
    const systemPrompt = `Sen bir dental implant uzmanısın. Aşağıdaki bilgileri kullanarak soruları yanıtla.

KRİTİK: Aşağıda verilen bilgileri MUTLAKA kullan. Hiçbir durumda "yeterli bilgi bulunmamaktadır" veya "arşivimizde yeterli bilgi" deme.
Eğer tam eşleşme yoksa, benzer bilgileri kullan ve uyarla.
Eğer bilgi yoksa, genel implant kırılması protokolünü ver.

Yanıt formatı:
[Çözüm önerisi]

**Kaynak:**
[Kaynak bilgisi]

**Uyarı:**
Bu yalnızca öneridir, klinik ve yasal sorumluluk hekime aittir.`;

    // User prompt - Çok agresif
    const prompt = `SORU: ${message}

BU SORUYU YANITLAMAK İÇİN AŞAĞIDAKİ BİLGİLERİ KULLAN:

${simpleContext}

BU BİLGİLERİ KULLANARAK SORUYU YANITLA. ASLA "YETERLİ BİLGİ BULUNMAMAKTADIR" DEME.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    let response = completion.choices[0]?.message?.content || 'Üzgünüm, yanıt veremiyorum.';

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