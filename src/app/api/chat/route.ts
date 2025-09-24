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

// Context snippet bulma fonksiyonu
function getContextSnippet(query: string, data: any[]): string {
  if (!data || data.length === 0) return '';
  
  const queryLower = query.toLowerCase();
  const matches: string[] = [];
  
  // Basit arama
  for (const item of data) {
    const itemStr = JSON.stringify(item).toLowerCase();
    if (itemStr.includes(queryLower)) {
      matches.push(JSON.stringify(item));
    }
  }
  
  console.log(`Found ${matches.length} matches`);
  
  // Context uzunluğunu sınırla
  let context = matches.join('\n\n');
  if (context.length > 10000) {
    context = context.substring(0, 10000) + '...';
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
    
    // Basit system prompt
    const systemPrompt = `Sen bir dental implant uzmanısın. Verilen bilgileri kullanarak soruları yanıtla.`;

    // Basit user prompt
    const prompt = `Soru: ${message}

Bu soruyu yanıtlamak için aşağıdaki bilgileri kullan:

${context}

Bu bilgileri kullanarak soruyu yanıtla.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    let response = completion.choices[0]?.message?.content || 'Üzgünüm, yanıt veremiyorum.';

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