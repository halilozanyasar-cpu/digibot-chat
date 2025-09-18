from flask import Flask, request, render_template
import openai
import json
import os
from datetime import datetime
from dotenv import load_dotenv

app = Flask(__name__)

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def load_all_data():
    combined = []
    data_folder = "data"
    if not os.path.exists(data_folder):
        return combined
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

        system_prompt = """Sen Digibot adında bir klinik asistanısın. Dental implantoloji konularında yardımcı olursun."""

        prompt = f"""Bilgi: {context}\n\nSoru: {user_question}"""

        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
        )
        answer = response.choices[0].message.content

    return render_template("index.html", answer=answer)

if __name__ == "__main__":
    app.run(debug=True)
