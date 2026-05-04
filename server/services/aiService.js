const { GoogleGenerativeAI } = require("@google/generative-ai");
const { OpenAI } = require('openai');
require('dotenv').config();

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

let genAI;
let model;
let openai;
let isOpenRouter = false;

const initAI = () => {
  if (GEMINI_API_KEY && !model) {
    console.log("🔑 Gemini Key detected (Length:", GEMINI_API_KEY.length, ")");
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY.trim());
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("✨ Google Gemini Model Initialized");
    isOpenRouter = false;
  } else if (OPENROUTER_API_KEY && !openai) {
    console.log("🚀 OpenRouter Key detected (Length:", OPENROUTER_API_KEY.length, ")");
    openai = new OpenAI({ 
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: OPENROUTER_API_KEY 
    });
    isOpenRouter = true;
  } else if (OPENAI_API_KEY && !openai) {
    openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    console.log("🤖 OpenAI Initialized");
    isOpenRouter = false;
  }
};

initAI();

const callAI = async (messages, responseType = "text") => {
  initAI();
  
  // 1. Try Direct Gemini First (Free tier)
  if (GEMINI_API_KEY) {
    try {
      console.log("尝试使用 Direct Gemini...");
      const combinedText = messages.map(m => m.content).join('\n\n');
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: combinedText }] }],
        generationConfig: responseType === "json" ? { responseMimeType: "application/json" } : {}
      });
      return result.response.text();
    } catch (err) {
      console.error("❌ Direct Gemini Failed:", err.message);
    }
  }

  // 2. Try OpenRouter (with free models)
  if (OPENROUTER_API_KEY) {
    const freeModels = ["google/gemini-2.0-flash-001", "google/gemini-2.0-flash-exp:free", "mistralai/mistral-7b-instruct:free"];
    for (const m of freeModels) {
      try {
        console.log(`尝试使用 OpenRouter 模型: ${m}...`);
        const response = await openai.chat.completions.create({
          model: m,
          messages: messages,
          response_format: responseType === "json" ? { type: "json_object" } : undefined
        });
        return response.choices[0].message.content;
      } catch (err) {
        console.error(`❌ OpenRouter ${m} Failed:`, err.message);
      }
    }
  }

  // 3. Try Direct OpenAI (Last resort)
  if (OPENAI_API_KEY && !isOpenRouter) {
    try {
      console.log("尝试使用 Direct OpenAI...");
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        response_format: responseType === "json" ? { type: "json_object" } : undefined
      });
      return response.choices[0].message.content;
    } catch (err) {
      console.error("❌ Direct OpenAI Failed:", err.message);
    }
  }

  throw new Error("All AI providers failed. Please check your API keys and quotas.");
};

const extractResumeData = async (resumeText) => {
  const messages = [
    {
      role: "system",
      content: "Extract structured data from resume. Also perform an ATS analysis. Return strictly JSON: { \"role\": \"string\", \"experience\": \"string\", \"projects\": [\"string\"], \"skills\": [\"string\"], \"atsScore\": number, \"atsFeedback\": \"string\" }"
    },
    { role: "user", content: resumeText }
  ];

  try {
    const text = await callAI(messages, "json");
    console.log("✅ AI Response Received");
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
  } catch (error) {
    console.error("Extraction Error:", error.message);
    return { 
      role: "Candidate", 
      experience: "Professional Experience", 
      projects: ["Project analysis failed"], 
      skills: ["Skill analysis failed"],
      atsScore: 40,
      atsFeedback: "AI Service temporarily unavailable. Using basic estimation."
    };
  }
};

const generateQuestions = async (data, resumeText, mode = "Technical") => {
  const { role, experience, projects, skills } = data;
  const userPrompt = `Role:${role}, Experience:${experience}, Mode:${mode}, Projects:${projects.join(", ")}, Skills:${skills.join(", ")}, Resume:${resumeText.substring(0, 2000)}`;

  const messages = [
    {
      role: "system",
      content: "Generate 5 interview questions. One per line. No numbering. Simple English."
    },
    { role: "user", content: userPrompt }
  ];

  try {
    const text = await callAI(messages);
    return text.split('\n').filter(q => q.trim().length > 10).slice(0, 5);
  } catch (error) {
    console.error("Question Generation Error:", error.message);
    return [
      "Can you describe your most significant technical achievement?",
      "How do you typically approach learning a new technology?",
      "Tell me about a time you had to troubleshoot a complex issue.",
      "What are the most important factors for team collaboration?",
      "How do you ensure the quality of the software you develop?"
    ];
  }
};

const evaluateSingleAnswer = async (question, answer) => {
  const messages = [
    {
      role: "system",
      content: "Evaluate answer. Return JSON: { \"confidence\": number, \"communication\": number, \"correctness\": number, \"finalScore\": number, \"feedback\": \"string\" }"
    },
    { role: "user", content: `Q: ${question}\nA: ${answer}` }
  ];

  try {
    const text = await callAI(messages, "json");
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    return { confidence: 7, communication: 7, correctness: 7, finalScore: 7, feedback: "Good effort, keep practicing." };
  }
};

const evaluateInterview = async (answers) => {
  const results = await Promise.all(answers.map(a => evaluateSingleAnswer(a.question, a.answer)));
  const avg = (arr) => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
  
  return {
    overallScore: avg(results.map(r => r.finalScore)),
    skills: {
      confidence: avg(results.map(r => r.confidence)),
      communication: avg(results.map(r => r.communication)),
      correctness: avg(results.map(r => r.correctness))
    },
    breakdown: answers.map((a, i) => ({
      question: a.question,
      score: results[i].finalScore,
      feedback: results[i].feedback
    }))
  };
};

module.exports = { extractResumeData, generateQuestions, evaluateInterview };
