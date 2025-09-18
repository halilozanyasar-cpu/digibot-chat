from flask import Flask, request, render_template
import openai
import json
import os
from datetime import datetime
from dotenv import load_dotenv

app = Flask(__name__)

# --- API KEY .env'den alınıyor ---
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

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

# --- JSON verilerini yükle ---
def load_all_data():
    combined = []
    data_folder = "data"
    if not os.path.exists(data_folder):
        return combined
    
    print(f"Data folder exists: {os.path.exists(data_folder)}")
    print(f"Files in data folder: {os.listdir(data_folder)}")
    
    for filename in os.listdir(data_folder):
        if filename.endswith(".json"):
            try:
                filepath = os.path.join(data_folder, filename)
                print(f"Loading file: {filename}")
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        combined.extend(data)
                        print(f"Added {len(data)} entries from {filename}")
                    else:
                        combined.append(data)
                        print(f"Added 1 entry from {filename}")
            except Exception as e:
                print(f"Error loading {filename}: {e}")
                continue
    
    print(f"Total loaded entries: {len(combined)}")
    return combined

all_data = load_all_data()

def get_context_snippet(question):
    matches = []
    question_words = question.lower().split()
    
    print(f"Searching for: {question_words}")
    
    # Daha geniş arama yap
    search_terms = question_words + ["implant", "kırık", "fracture", "complication", "problem", "nobel", "iti", "misch", "broken", "crack"]
    
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

        # --- System prompt (Digibot kuralları) ---
        system_prompt = """Sen Digibot adında bir klinik asistanısın. Vaka bazlı cerrahi implant rehberlerinde hekime karar desteği sunarsın. 
        Yalnızca arayüzde bulunan vaka raporu, frez protokolü, hekimin notları ve yüklenmiş literatür arşivini (komplikasyon ansiklopedileri, makaleler, rehberler) kaynak alırsın. 
        Bunların dışında veri istemezsin, başka kaynak kullanmazsın. Klinik kararın sorumluluğu hekime aittir; senin yanıtların yalnızca öneri niteliğindedir.

        Yanıt ilkelerin:
        - Yanıtların kısa, sade ve anlaşılır olur. Hekimin hızlıca uygulayabileceği net çözüm adımları verirsin. Gereksiz sıralama, uzun açıklama veya tüm olasılıkları listelemekten kaçınırsın.
        - Yanıt formatın her zaman şu üç bölümden oluşur:
          1. **Çözüm Önerisi** (öneri niteliğinde olduğunu belirterek)
          2. **Kaynak** (Kitap/Makale adı, yıl, bölüm/başlık – sadece arşivden alınan geçerli kaynaklar, asla uydurma yok)
          3. **Uyarı/Not**: "Bu yalnızca öneridir, klinik ve yasal sorumluluk hekime aittir."
        - Komplikasyon sorularında, durum net değilse hekime yalnızca tek netleştirici soru sorarsın. Sonrasında sadece ilgili çözümü ve kaynak belirtirsin.
        - Frez protokolü sorularında hekimin sorduğu noktaya doğrudan yanıt verirsin. Yanıt, hem vaka raporundaki hekimin planına hem de üretici firmanın resmi protokolüne dayanır. İki kaynağı da açıkça belirtirsin.
        - Serbest el implant yerleştirme asla önermezsin. Eğer guide ile çözüm mümkün değilse, insani destek hattına yönlendirirsin.
        - Literatür desteği gerektiğinde yalnızca yüklenmiş literatür arşivinden alıntı yaparsın. Yanıtlarda kaynak adı, yıl ve bölüm bilgisi net belirtilir.
        - Hasta verisi gizliliğine her zaman saygı gösterirsin.

        Dil: Sade, pratik, klinik. Panik anında bile kısa ve uygulanabilir öneriler sunarsın."""

        # --- User prompt ---
        prompt = f"""Aşağıdaki literatür arşivinden sadece ilgili bilgileri kullanarak yanıt ver:

        LİTERATÜR ARŞİVİ:
        {context}

        SORU: {user_question}

        Yukarıdaki literatür arşivinden sadece ilgili bilgileri kullanarak yanıt ver. Eğer arşivde ilgili bilgi yoksa, "Bu konuda arşivimizde yeterli bilgi bulunmamaktadır." de."""

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

if __name__ == "__main__":
    app.run(debug=True)
