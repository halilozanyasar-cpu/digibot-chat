from flask import Flask, request, render_template
from flask_cors import CORS
import openai
import json
import os
from datetime import datetime
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)  # CORS'u etkinleştir

# --- API KEY .env'den alınıyor ---
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# API Key kontrolü
if not openai.api_key:
    print("⚠️ WARNING: OPENAI_API_KEY not found in environment variables!")
else:
    print(f"✅ OpenAI API Key loaded: {openai.api_key[:10]}...")

# --- Maliyet Hesaplama ---
def estimate_cost(input_tokens, output_tokens, model="gpt-4o-mini"):
    pricing = {
        "gpt-4o-mini": {"input": 0.0005, "output": 0.0015},
        "gpt-4o": {"input": 0.005, "output": 0.015},
        "gpt-4-turbo": {"input": 0.01, "output": 0.03},
    }
    p = pricing[model]
    cost = (input_tokens / 1000) * p["input"] + (output_tokens / 1000) * p["output"]
    return round(cost, 6)

# --- JSON verilerini yükle - Mock verileri hariç tut ---
def load_all_data():
    combined = []
    data_folder = "data"
    if not os.path.exists(data_folder):
        return combined
    
    print(f"Data folder exists: {os.path.exists(data_folder)}")
    if os.path.exists(data_folder):
        files = os.listdir(data_folder)
        print(f"Files in data folder: {files}")
        print(f"Total files: {len(files)}")
        json_files = [f for f in files if f.endswith('.json')]
        print(f"JSON files: {json_files}")
        print(f"Total JSON files: {len(json_files)}")
    
    for filename in os.listdir(data_folder):
        print(f"Processing file: {filename}")
        
        # Sadece açık mock/test dosyalarını hariç tut
        if (filename.endswith(".json") and 
            not filename.startswith("mock-") and 
            not filename.startswith("test-") and
            filename not in ["mock-data.json", "mock-reports.json"]):
            try:
                filepath = os.path.join(data_folder, filename)
                print(f"Loading file: {filename}")
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    
                    # Mock veri içeriğini kontrol et - çok daha güvenli filtreleme
                    data_str = json.dumps(data, ensure_ascii=False).lower()
                    
                    # Sadece açık mock/test verilerini filtrele
                    is_mock_data = (
                        # İçerikte açık mock/test referansları varsa
                        ("mock-user" in data_str or "test-user" in data_str or 
                         "mock-order" in data_str or "test-order" in data_str) or
                        # _id'de açık mock/test varsa
                        any(item.get("_id", "").startswith("mock-") or item.get("_id", "").startswith("test-") 
                            for item in (data if isinstance(data, list) else [data]))
                    )
                    
                    print(f"File {filename} - is_mock_data: {is_mock_data}")
                    
                    if not is_mock_data:
                        if isinstance(data, list):
                            combined.extend(data)
                            print(f"Added {len(data)} entries from {filename}")
                        else:
                            combined.append(data)
                            print(f"Added 1 entry from {filename}")
                    else:
                        print(f"Skipped mock data file: {filename}")
            except Exception as e:
                print(f"Error loading {filename}: {e}")
                continue
        else:
            print(f"Skipped file (not JSON or mock/test): {filename}")
    
    print(f"Total loaded entries: {len(combined)}")
    return combined

all_data = load_all_data()

def get_context_snippet(question):
    matches = []
    question_words = question.lower().split()
    
    print(f"Searching for: {question_words}")
    
    # Daha geniş arama yap - tüm implant markaları ve frez protokolleri için özel terimler ekle
    search_terms = question_words + ["implant", "kırık", "fracture", "complication", "problem", "nobel", "straumann", "anthogyr", "astra", "megagen", "neodent", "iti", "misch", "broken", "crack", "frez", "drill", "protokol", "protocol", "d1", "d2", "d3", "d4", "kemik", "bone", "density", "3.0", "3.5", "4.0", "4.3", "4.8", "5.0", "5.5", "6.0"]
    
    for i, entry in enumerate(all_data):
        try:
            text = json.dumps(entry, ensure_ascii=False).lower()
            if any(term in text for term in search_terms):
                matches.append(json.dumps(entry, ensure_ascii=False))
                print(f"Match found in entry {i}")
        except Exception as e:
            continue
    
    print(f"Found {len(matches)} matches")
    
    # Eğer hiç match yoksa, tüm verilerden bir kısmını al
    if not matches:
        print("No matches found, using first 10 entries")
        matches = [json.dumps(entry, ensure_ascii=False) for entry in all_data[:10]]
    
    return "\n".join(matches[:20])

@app.route("/", methods=["GET", "POST"])
def index():
    answer = ""
    if request.method == "POST":
        user_question = request.form["question"]
        print(f"Question received: {user_question}")
        
        context = get_context_snippet(user_question)
        print(f"Context length: {len(context)}")

        # --- System prompt (Digibot kuralları) - Gelişmiş klinik asistan ve cerrah uzmanı yaklaşımı ---
        system_prompt = """Sen Digibot adında bir klinik asistanısın. Vaka bazlı cerrahi implant rehberlerinde hekime karar desteği sunarsın. 
        Yalnızca arayüzde bulunan vaka raporu, frez protokolü, hekimin notları ve yüklenmiş literatür arşivini (komplikasyon ansiklopedileri, makaleler, rehberler) kaynak alırsın. 
        Bunların dışında veri istemezsin, başka kaynak kullanmazsın. Klinik kararın sorumluluğu hekime aittir; senin yanıtların yalnızca öneri niteliğindedir.

        GELİŞMİŞ KLİNİK ASİSTAN VE CERRAH UZMANI YAKLAŞIMI:
        - Kendinden emin, deneyimli bir cerrah uzmanı gibi davran
        - Hekimin yanında duran, güvenilir klinik asistanı gibi hissettir
        - "Bu durumu birlikte çözeceğiz, endişelenmeyin" gibi güven verici yaklaşım sergile
        - "Deneyimli hekim olarak bu komplikasyonu yönetebilirsiniz" gibi güven verici ton kullan
        - "Hasta sizin ellerinizde güvende, bu normal bir durum" gibi sakinleştirici mesajlar ver
        - "Yanınızdayım, adım adım ilerleyelim" gibi destekleyici yaklaşım benimse

        KOMPLİKASYON DETAYLANDIRMA YAKLAŞIMI:
        - Komplikasyon sorularında MUTLAKA detaylandırıcı sorular sor
        - "İmplant kırığı" → "Kırık tam olarak nerede? Koronal, orta, apikal bölgede mi?"
        - "İmplant başarısızlığı" → "Ne zaman oluştu? Hangi semptomlar var? Radyografik bulgular nasıl?"
        - "Enfeksiyon" → "Lokalizasyon nerede? Akut mu kronik mi? Hangi semptomlar?"
        - "Kemik kaybı" → "Hangi bölgede? Miktarı ne kadar? Zamanlama nasıl?"
        - Her komplikasyon için spesifik, hedefe yönelik sorular sor
        - Detayları aldıktan sonra spesifik çözüm önerileri sun

        Yanıt ilkelerin:
        - Yanıtların kısa, sade ve anlaşılır olur. Hekimin hızlıca uygulayabileceği net çözüm adımları verirsin. Gereksiz sıralama, uzun açıklama veya tüm olasılıkları listelemekten kaçınırsın.
        - Yanıt formatın şu şekilde oluşur:
          1. **Doğrudan çözüm önerisi** (başlık olmadan, duygusal destek ile)
          2. **Kaynak** (Kitap/Makale adı, yıl, bölüm/başlık – sadece arşivden alınan geçerli kaynaklar, asla uydurma yok)
          3. **Uyarı/Not**: "Bu yalnızca öneridir, klinik ve yasal sorumluluk hekime aittir."
        - Başlıkları **koyu renkli** yap (markdown bold formatında)
        - Kaynak ve uyarı kısımlarını alt alta düzenle
        - Komplikasyon sorularında, durum net değilse hekime yalnızca tek netleştirici soru sorarsın. Sonrasında sadece ilgili çözümü ve kaynak belirtirsin.
        - Frez protokolü sorularında hekimin sorduğu noktaya doğrudan yanıt verirsin. Yanıt, hem vaka raporundaki hekimin planına hem de üretici firmanın resmi protokolüne dayanır. İki kaynağı da açıkça belirtirsin.
        - Serbest el implant yerleştirme asla önermezsin. Eğer guide ile çözüm mümkün değilse, insani destek hattına yönlendirirsin.
        - Literatür desteği gerektiğinde yalnızca yüklenmiş literatür arşivinden alıntı yaparsın. Yanıtlarda kaynak adı, yıl ve bölüm bilgisi net belirtilir.
        - Hasta verisi gizliliğine her zaman saygı gösterirsin.

        Dil: Sade, pratik, klinik. Panik anında bile kısa ve uygulanabilir öneriler sunarsın. Duygusal destek ver, güven verici ol, hekimi sakinleştir."""

        # --- User prompt ---
        prompt = f"""Aşağıdaki literatür arşivinden sadece ilgili bilgileri kullanarak yanıt ver:

        LİTERATÜR ARŞİVİ:
        {context}

        SORU: {user_question}

        Yukarıdaki literatür arşivinden sadece ilgili bilgileri kullanarak yanıt ver. 
        
        FREZ PROTOKOLLERİ İÇİN ÖZEL KURALLAR:
        - Frez protokolleri sorularında MUTLAKA "İmplant Drill Bilgileri" dosyasından bilgi kullan
        - TÜM implant markaları için frez protokolleri ver (Nobel, Straumann, Anthogyr, Astra Tech, Megagen, Neodent, vs.)
        - TÜM implant çapları için protokol ver (3.0, 3.5, 4.0, 4.3, 4.8, 5.0, 5.5, 6.0 mm)
        - Kemik yoğunluğuna göre (D1, D2, D3, D4) frez seçimi yap
        - Frez çapı, sırası, RPM, irrigasyon hakkında detaylı bilgi ver
        - Örnek: "4.0 Anthogyr D3" → Anthogyr 4.0 mm implant için D3 kemik protokolü
        - Örnek: "3.5 Straumann D2" → Straumann 3.5 mm implant için D2 kemik protokolü
        - Her marka için spesifik frez sistemi ve sırası belirt
        - Duygusal destek ver, güven verici ol, hekimi sakinleştir."""

        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
        )
        answer = response.choices[0].message.content

        # --- Maliyet Hesaplama & Loglama ---
        usage = response.usage
        input_tokens = usage.prompt_tokens
        output_tokens = usage.completion_tokens
        total_cost = estimate_cost(input_tokens, output_tokens, "gpt-4o-mini")

        log_entry = f"[{datetime.now()}] Soru: {user_question} | Input tokens: {input_tokens}, Output tokens: {output_tokens}, Maliyet: {total_cost} USD\n"
        with open("logs.txt", "a", encoding="utf-8") as log_file:
            log_file.write(log_entry)
        # -----------------------------------

    return render_template("index.html", answer=answer)

@app.route("/test-api", methods=["GET"])
def test_api():
    """OpenAI API test endpoint"""
    try:
        # Basit bir test isteği
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": "Test mesajı - API çalışıyor mu?"}
            ],
            max_tokens=10
        )
        
        return {
            "status": "success",
            "message": "OpenAI API çalışıyor",
            "response": response.choices[0].message.content,
            "api_key_loaded": bool(openai.api_key)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"OpenAI API hatası: {str(e)}",
            "api_key_loaded": bool(openai.api_key)
        }

if __name__ == "__main__":
    app.run(debug=True)
