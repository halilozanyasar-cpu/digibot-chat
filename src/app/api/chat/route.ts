import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Tüm JSON verilerini yükle
function loadAllData(): any[] {
  const combined: any[] = [];
  
  // Farklı path'leri dene
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'data'),
    path.join(process.cwd(), 'src', 'data'),
    path.join(process.cwd(), '.next', 'server', 'src', 'data'),
    path.join(__dirname, '..', '..', '..', 'data'),
    path.join(process.cwd(), 'data'),
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
    console.log('Data folder not found');
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
        cleanContent = cleanContent.replace(/:\s*NaN\s*([,}])/g, ': null$1');
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
        continue;
      }
    }
  }
  
  console.log(`Total loaded entries: ${combined.length}`);
  return combined;
}

// Akıllı context snippet bulma fonksiyonu
function getContextSnippet(query: string, data: any[]): string {
  if (!data || data.length === 0) return '';
  
  const queryLower = query.toLowerCase();
  const matches: string[] = [];
  
  // Kapsamlı anahtar kelime mapping - tüm veri türleri için
  const keywordMap: { [key: string]: string[] } = {
    // İmplant kırığı - spesifik
    'implant kırıl': ['implant fracture', 'implant broken', 'implant break'],
    'implant kırık': ['implant fracture', 'implant broken', 'implant break'],
    
    // Genel kırık
    'kırıl': ['fracture', 'broken', 'break', 'kırık'],
    'kırık': ['fracture', 'broken', 'break', 'kırıl'],
    
    // Sıkışma
    'sıkış': ['stuck', 'sıkıştı', 'sıkışma'],
    'sıkıştı': ['stuck', 'sıkış', 'sıkışma'],
    
    // Kanama
    'kanama': ['bleeding', 'hemorrhage'],
    
    // Yetersizlik
    'yetersiz': ['insufficient', 'lack', 'eksik'],
    'eksik': ['insufficient', 'lack', 'yetersiz'],
    
    // Problem/komplikasyon
    'problem': ['complication', 'issue', 'sorun'],
    'komplikasyon': ['complication', 'problem', 'issue'],
    'sorun': ['problem', 'complication', 'issue'],
    
    // Frez protokolü
    'frez': ['drill', 'delme', 'protokol'],
    'drill': ['frez', 'delme', 'protokol'],
    'protokol': ['protocol', 'frez', 'drill'],
    
    // İmplant genel
    'implant': ['implant', 'yerleştir', 'place'],
    'yerleştir': ['place', 'implant', 'insert'],
    
    // Kemik
    'kemik': ['bone', 'osteotomy', 'osteotomi'],
    'osteotomi': ['osteotomy', 'kemik'],
    
    // Anestezi
    'anestezi': ['anesthesia', 'local', 'lokal'],
    'lokal': ['local', 'anesthesia', 'anestezi'],
    
    // Sütür
    'sutur': ['suture', 'dikiş', 'stitch'],
    'dikiş': ['suture', 'sutur', 'stitch'],
    
    // Planlama
    'planlama': ['planning', 'plan', 'planla'],
    'plan': ['planning', 'planlama'],
    
    // Ölçü
    'ölçü': ['measure', 'measurement', 'ölçüm'],
    'ölçüm': ['measurement', 'ölçü'],
    
    // Şablon
    'şablon': ['template', 'guide', 'rehber'],
    'rehber': ['guide', 'template', 'şablon'],
    
    // Steril
    'steril': ['sterile', 'sterilization', 'sterilizasyon'],
    'sterilizasyon': ['sterilization', 'steril'],
    
    // Cerrahi
    'cerrahi': ['surgical', 'surgery'],
    'ameliyat': ['surgery', 'surgical', 'cerrahi'],
    
    // Hasta
    'hasta': ['patient'],
    
    // Diş
    'diş': ['tooth', 'teeth'],
    
    // Çene
    'çene': ['jaw', 'mandible', 'maxilla'],
    
    // Sinüs
    'sinüs': ['sinus'],
    
    // Greft
    'greft': ['graft'],
    
    // Membran
    'membran': ['membrane']
  };
  
  // Anahtar kelimeleri bul - öncelik sırasına göre
  const searchTerms: string[] = [queryLower];
  
  // Önce spesifik eşleşmeleri kontrol et
  for (const [turkish, english] of Object.entries(keywordMap)) {
    if (queryLower.includes(turkish)) {
      // Eğer "implant kırıl" gibi spesifik bir terim varsa, sadece onu kullan
      if (turkish.includes('implant')) {
        searchTerms.push(...english);
        break; // İmplant spesifik terim bulundu, diğerlerini arama
      } else {
        searchTerms.push(...english);
      }
    }
  }
  
  console.log(`Search terms: ${searchTerms.join(', ')}`);
  
  // Akıllı arama - öncelik sırasına göre
  for (const item of data) {
    const itemStr = JSON.stringify(item).toLowerCase();
    
    // Önce tam eşleşme ara
    if (itemStr.includes(queryLower)) {
      matches.push(JSON.stringify(item));
      continue;
    }
    
    // Sonra arama terimlerini dene
    for (const term of searchTerms) {
      if (itemStr.includes(term)) {
        matches.push(JSON.stringify(item));
        break;
      }
    }
  }
  
  console.log(`Found ${matches.length} matches`);
  
  // Context uzunluğunu sınırla - daha agresif
  let context = matches.join('\n\n');
  if (context.length > 5000) {
    context = context.substring(0, 5000) + '...';
  }
  
  return context;
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
    
           // İlgili context'i bul
           const context = getContextSnippet(message, allData);
           console.log(`Context length: ${context.length}`);
           console.log(`First 500 chars of context: ${context.substring(0, 500)}`);
           
           // HARDCODED TEST - AI'yi zorla
           const testContext = `{"Title": "İmplant Kırığı", "Content": "İmplant kırığı durumunda hasta hemen kliniğe başvurmalı. Kırık implant çıkarılmalı ve yeni implant yerleştirilmelidir. Komplikasyon riski yüksektir."}`;
           
           // Çok agresif system prompt
    const systemPrompt = `Sen bir dental implant uzmanısın. Aşağıdaki bilgileri kullanarak soruları yanıtla.

KRITIK KURALLAR:
1. Verilen bilgileri MUTLAKA kullan
2. Hiçbir durumda "yeterli bilgi bulunmamaktadır" deme
3. Eğer tam eşleşme yoksa, benzer bilgileri kullan ve uyarla
4. Her zaman yararlı bir yanıt ver
5. Verilen context'teki bilgileri kullanmadan yanıt verme
6. "Arşivde bilgi yok" gibi ifadeler kullanma

YANIT FORMATI: Verilen bilgilere dayalı olarak yanıtla.`;

           // Agresif user prompt
           const prompt = `SORU: ${message}

YANITLAMA KURALLARI:
- Aşağıdaki bilgileri MUTLAKA kullan
- "Yeterli bilgi yok" deme
- Verilen context'ten yanıt ver

VERİLER:
${testContext}

YANIT: Yukarıdaki verilere dayalı olarak soruyu yanıtla.`;
           
           console.log(`Full prompt length: ${prompt.length}`);
           console.log(`System prompt: ${systemPrompt}`);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      top_p: 0.9,
      frequency_penalty: 0,
      presence_penalty: 0
    });

           let response = completion.choices[0]?.message?.content || 'Üzgünüm, yanıt veremiyorum.';
           
           console.log(`AI Response: ${response}`);
           console.log(`Response length: ${response.length}`);

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