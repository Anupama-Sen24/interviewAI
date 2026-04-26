const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
  const key = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(key.trim());
  
  // The SDK doesn't have a direct listModels, we usually have to use the REST API
  // or just try common names.
  
  const models = ["gemini-1.5-flash-latest", "gemini-1.5-pro-latest", "gemini-1.0-pro"];
  
  for (const m of models) {
    try {
      console.log(`Testing ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hi");
      console.log(`✅ ${m} works:`, result.response.text());
      return m;
    } catch (e) {
      console.log(`❌ ${m} failed:`, e.message);
    }
  }
}

listModels();
