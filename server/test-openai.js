const { OpenAI } = require('openai');
require('dotenv').config();

async function testOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.error("❌ No OPENAI_API_KEY found");
    return;
  }
  
  const openai = new OpenAI({ apiKey: key });

  try {
    console.log("🚀 Testing OpenAI connection...");
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say 'Hello World'" }],
    });
    console.log("📥 Response:", response.choices[0].message.content);
    console.log("✅ OpenAI is working!");
  } catch (error) {
    console.error("❌ OpenAI Test Failed:", error.message);
  }
}

testOpenAI();
