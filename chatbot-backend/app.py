import pickle
import faiss
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import START, MessagesState, StateGraph
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
import google.generativeai as genai
from dotenv import load_dotenv
import numpy as np
import torch

load_dotenv()
genai.configure(api_key=os.environ['GEMINI_API_KEY'])

model = ChatGoogleGenerativeAI(model="gemini-1.5-flash", api_key=os.getenv("GEMINI_API_KEY"))
workflow = StateGraph(state_schema=MessagesState)
prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an empathetic, professional, and insightful verbal therapy chatbot. Your primary goal is to support users with their emotional and psychological well-being. You listen actively, provide thoughtful responses, and guide users toward self-reflection and positive coping strategies.\n\n"
            "### Guidelines:\n"
            "- **Use a warm, non-judgmental, and supportive tone.**\n"
            "- **Ask open-ended questions** to encourage users to express their feelings.\n"
            "- **Offer evidence-based techniques** from cognitive behavioral therapy (CBT), mindfulness, and positive psychology.\n"
            "- **Never diagnose or prescribe medication**—always encourage seeking professional help when necessary.\n"
            "- **Prioritize user safety:** If a user expresses thoughts of self-harm or harm to others, gently encourage them to seek immediate help from a trusted person or professional.\n"
            "- **Stay within the scope of therapy:** Do not engage in topics outside of emotional and psychological well-being. If a user asks for something unrelated—such as coding assistance, medical advice, legal guidance, or financial tips—respond in a supportive yet firm manner, reminding them of your role as a therapy chatbot.\n\n"
            "### Handling Off-Topic Requests:\n"
            "- If a user requests something outside therapy (e.g., coding help, technical advice, or general knowledge questions), **do not provide the requested information.**\n"
            "- Instead, reply in a way that acknowledges their request while gently redirecting them back to therapy-related discussions.\n"
            "  - **Example Response:** *'I understand that you're looking for coding help, but my purpose is to support your emotional well-being. If there's anything on your mind that you'd like to talk about, I'm here to listen.'*\n\n"
            "**Maintain professionalism, avoid making assumptions, and always foster a safe and healing conversation.**"
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

def input_func(state: MessagesState):
    prompt = prompt_template.invoke(state)
    response = model.invoke(prompt)
    return {"messages": response}

workflow.add_edge(START, "model")
workflow.add_node("model", input_func)

memory = MemorySaver()
app_ = workflow.compile(checkpointer=memory)
config = {"configurable": {"thread_id": "abc123"}}


app = Flask(__name__)
CORS(app)


# Generate Embeddings
def embed(chunks):
    result = genai.embed_content(
        model="models/text-embedding-004",
        content=chunks
    )
    tensor = torch.tensor(result['embedding'], dtype=torch.float32)
    return tensor

def search_embeddings(query_embedding, chunks, k=3):
    query_embedding_array = np.expand_dims(np.array(query_embedding, dtype='float32'), axis=0)
    index = faiss.read_index("data/vectors/therapy.faiss")
    distances, indices = index.search(query_embedding_array, k)
    matching_chunks = [chunks[i] for i in indices[0]]
    return matching_chunks

# Generate Response
def generate_response(matching_chunks, query, app_):
    context = "\n".join(matching_chunks)
    print("Context:\n", context)
    input_prompt = f"Context: {context}\n\nQuestion: {query}\nAnswer:"
    input_message = [HumanMessage(content=input_prompt)]
    output = app_.invoke({"messages": input_message}, config)
    return output["messages"][-1].content

def process_query(query):
    query_embedding = embed(query)
    chunked = pickle.load(open('data\chunks\json_chunked_data.pkl', 'rb'))
    results = search_embeddings(query_embedding, chunked)
    response = generate_response(results, query, app_)
    return response

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
    app.run(port=8000, debug=True)
