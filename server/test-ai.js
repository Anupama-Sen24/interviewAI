const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("❌ No GEMINI_API_KEY found");
    return;
  }
  console.log("🔑 Using key (Length:", key.length, ")");
  
  const genAI = new GoogleGenerativeAI(key.trim());
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    console.log("🚀 Testing Gemini connection...");
    const result = await model.generateContent("Say 'Hello World'");
    console.log("📥 Response:", result.response.text());
    console.log("✅ Gemini is working!");
  } catch (error) {
    console.error("❌ Gemini Test Failed:", error.message);
    if (error.message.includes("not found")) {
      console.log("💡 Trying gemini-pro...");
      try {
        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        const resultPro = await modelPro.generateContent("Say 'Hello World'");
        console.log("📥 Response:", resultPro.response.text());
        console.log("✅ Gemini (gemini-pro) is working!");
      } catch (err2) {
        console.error("❌ gemini-pro also failed:", err2.message);
      }
    }
  }
}

testGemini();
