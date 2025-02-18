import { GoogleGenerativeAI } from "@google/generative-ai";
// Load Gemini API key from env
const geminiAPIKey = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(geminiAPIKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateHealthTip(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

export async function generatePatientSummary(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}


