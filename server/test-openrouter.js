require('dotenv').config();
const { OpenAI } = require('openai');
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY
});

async function test() {
  try {
    const res = await openai.chat.completions.create({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: 'Say hello' }]
    });
    console.log("SUCCESS:", res.choices[0].message.content);
  } catch(e) {
    console.error("ERROR:", e.message);
  }
}
test();
