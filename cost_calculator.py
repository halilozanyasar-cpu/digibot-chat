from flask import Flask, request, render_template
import openai
import json
import os
from datetime import datetime

app = Flask(__name__)

# OPENAI API anahtarını buraya gir
openai.api_key = "sk-xxx"

# -------- Maliyet Hesaplama Fonksiyonu -------- #
def estimate_cost(input_tokens, output_tokens, model="gpt-4-turbo"):
    pricing = {
        "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
        "gpt-4-turbo": {"input": 0.01, "output": 0.03},
        "gpt-4o": {"input": 0.005, "output": 0.015},
    }
    p = pricing[model]
    cost = (input_tokens / 1000) * p["input"] + (output_tokens / 1000) * p["output"]
    return round(cost, 6)
# --------------------------------------------- #

# Tüm JSON verilerini yükle
def load_all_data():
    combined = []
    data_folder = "data"
    for filename in os.listdir(data_folder):
        if filename.endswith(".json"):
            with open(os.path.join(data_folder, filename), "r", encoding="utf-8") as f:
                data = json.load(f)
                combined.extend(data if isinstance(data, list) else [data])
    return combined

all_data = load_all_data()

def get_context_snippet(question):
    matches = []
    for entry in all_data:
        text = json.dumps(entry, ensure_ascii=False)
        if any(word.lower() in text.lower() for word in question.split()):
            matches.append(text)
    return "\n".join(matches[:5])

@app.route("/", methods=["GET", "POST"])
def index():
    answer = ""
    if request.method == "POST":
        user_question = request.form["question"]
        context = get_context_snippet(user_question)

        prompt = f"""Aşağıdaki bilgiye dayanarak hekime sade, öneri niteliğinde bir yanıt ver:
        
        Bilgi:
        {context}

        Soru:
        {user_question}

        Yanıt (sade, öneri niteliğinde ve kaynaklı):"""

        response = openai.ChatCompletion.create(
            model="gpt-4-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        answer = response["choices"][0]["message"]["content"]

        # --- Maliyet Hesaplama ve Loglama --- #
        usage = response["usage"]
        input_tokens = usage["prompt_tokens"]
        output_tokens = usage["completion_tokens"]
        total_cost = estimate_cost(input_tokens, output_tokens, "gpt-4-turbo")

        log_entry = f"[{datetime.now()}] Soru: {user_question} | Input tokens: {input_tokens}, Output tokens: {output_tokens}, Maliyet: {total_cost} USD\n"
        with open("logs.txt", "a", encoding="utf-8") as log_file:
            log_file.write(log_entry)
        # ------------------------------------ #

    return render_template("index.html", answer=answer)

if __name__ == "__main__":
    app.run(debug=True)
