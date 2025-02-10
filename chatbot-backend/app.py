import pickle
import faiss
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
import google.generativeai as genai
from dotenv import load_dotenv
import numpy as np
import torch

load_dotenv()
genai.configure(api_key=os.environ['GEMINI_API_KEY'])

app = Flask(__name__)
CORS(app)

def process_query(query):
    chunked = pickle.load(open('data\chunks\json_chunked_data.pkl', 'rb'))
    query_embed_result = genai.embed_content(model="models/text-embedding-004", content=query)
    query_embedding = torch.tensor(query_embed_result['embedding'], dtype=torch.float32)
    query_embedding_array = np.expand_dims(np.array(query_embedding, dtype='float32'), axis=0)
    index = faiss.read_index(r"data\vectors\therapy.faiss")
    distances, indices = index.search(query_embedding_array, 3)
    index = [chunked[i] for i in indices[0]]
    context = "\n".join(index)
    system_prompt = "You are an empathetic, professional, and insightful verbal therapy chatbot. Your primary goal is to support users with their emotional and psychological well-being. You listen actively, provide thoughtful responses, and guide users toward self-reflection and positive coping strategies. You should: Use a warm, non-judgmental, and supportive tone. Ask open-ended questions to encourage users to express their feelings.Offer evidence-based techniques from cognitive behavioral therapy (CBT), mindfulness, and positive psychology. Never diagnose or prescribe medication—always encourage seeking professional help when necessary. Prioritize user safety: If a user expresses thoughts of self-harm or harm to others, gently encourage them to seek immediate help from a trusted person or professional.Maintain professionalism, avoid making assumptions, and adapt your responses to the user's needs while fostering a safe and healing conversation."
    input_prompt = f"{system_prompt}\n\nContext: {context}\n\nQuestion: {query}\nAnswer:"
    llm = genai.GenerativeModel('gemini-1.5-flash')
    response = llm.generate_content(input_prompt)
    print(response.text)
    return response.text

@app.route('/', methods=['GET'])
def home():
    return "App is running!", 200


@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    if not user_message:
        return jsonify({"response": "Sorry, I didn't understand your message."})
    print(user_message)
    bot_response = process_query(user_message)
    print(bot_response)
    print(type(bot_response))

    return jsonify({"response": bot_response})


if __name__ == "__main__":
    app.run(port=8000)
    app.run(debug=True)
