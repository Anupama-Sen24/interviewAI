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
let provider = null; // 'gemini' | 'openai' | 'openrouter' — locked in once, never re-evaluated

const initAI = () => {
  if (provider) return; // already initialized — do NOT fall through to another provider

  // Prefer Google Gemini if its API key is available.
  if (GEMINI_API_KEY) {
    console.log("🔑 Gemini Key detected (Length:", GEMINI_API_KEY.length, ")");
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY.trim());
    model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    provider = 'gemini';
    console.log("✨ Google Gemini Model Initialized");
  } else if (OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    provider = 'openai';
    console.log("🤖 OpenAI Initialized");
  } else if (OPENROUTER_API_KEY) {
    console.log("🚀 OpenRouter Key detected (Length:", OPENROUTER_API_KEY.length, ")");
    openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: OPENROUTER_API_KEY
    });
    isOpenRouter = true;
    provider = 'openrouter';
  }
};

initAI();

const extractResumeData = async (resumeText) => {
  initAI();
  const messages = [
    {
      role: "system",
      content: `
Extract structured data from resume.
Also perform an ATS (Applicant Tracking System) compatibility analysis.
Evaluate if the resume is well-structured, uses standard headings, and is text-based.

Return strictly JSON:

{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"],
  "atsScore": number,
  "atsFeedback": "short feedback on ATS readability"
}
`
    },
    {
      role: "user",
      content: resumeText
    }
  ];

  try {
    let text;
    if (isOpenRouter && openai) {
      const response = await openai.chat.completions.create({
        model: "google/gemini-2.5-flash",
        messages: messages,
        max_tokens: 200
      });
      text = response.choices[0].message.content;
    } else if (OPENAI_API_KEY && openai) {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
      });
      text = response.choices[0].message.content;
    } else if (GEMINI_API_KEY && model) {
      const combinedText = messages.map(m => m.content).join('\n\n');
      const result = await retryWithBackoff(() => model.generateContent({
        contents: [{ role: 'user', parts: [{ text: combinedText }] }],
        generationConfig: { responseMimeType: "application/json" }
      }));
      text = result.response.text();
    } else {
      throw new Error('No AI provider configured');
    }
    
    console.log("Raw AI Output:", text);
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    const finalJsonString = jsonMatch ? jsonMatch[0] : cleaned;
    
    return JSON.parse(finalJsonString);
  } catch (error) {
    console.error("Extraction Error details:", error.message);
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
  initAI();
  const { role, experience, projects, skills } = data;
  const projectText = projects.join(", ");
  const skillsText = skills.join(", ");
  const safeResume = resumeText.substring(0, 2000);

  const userPrompt = `
    Role:${role}
    Experience:${experience}
    InterviewMode:${mode}
    Projects:${projectText}
    Skills:${skillsText},
    Resume:${safeResume}
    `;

  const messages = [
    {
      role: "system",
      content: `
You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 25 interview questions.

Strict Rules:
- Each question must contain between 15 and 30 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression (must follow this exactly):
Questions 1-8   → Easy   (basics, introductions, simple concepts, tools used)
Questions 9-17  → Medium (scenarios, project challenges, mid-level technical depth)
Questions 18-25 → Hard   (system design, architecture, trade-offs, deep technical mastery)

Make all 25 questions based on the candidate's role, experience, interviewMode, projects, skills, and resume details.
`
    },
    {
      role: "user",
      content: userPrompt
    }
  ];

  try {
    let text;
    if (isOpenRouter && openai) {
      const response = await openai.chat.completions.create({
        model: "google/gemini-2.5-flash",
        messages: messages,
        max_tokens: 500
      });
      text = response.choices[0].message.content;
    } else if (OPENAI_API_KEY && openai) {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
      });
      text = response.choices[0].message.content;
    } else if (GEMINI_API_KEY && model) {
      const combinedText = messages.map(m => m.content).join('\n\n');
      const result = await retryWithBackoff(() => model.generateContent({
        contents: [{ role: 'user', parts: [{ text: combinedText }] }]
      }));
      text = result.response.text();
    } else {
      throw new Error('No AI provider configured');
    }
    
    const questions = text.split('\n').filter(q => q.trim().length > 10).slice(0, 25);
    console.log(`✅ Generated ${questions.length} questions`);
    return questions;
  } catch (error) {
    console.error("Question Generation Error:", error);
    return [
      // Easy (1-8)
      "Can you briefly introduce yourself and describe your background as a software developer?",
      "What programming languages and frameworks are you most comfortable working with daily?",
      "How do you usually structure your workflow when starting a new development project?",
      "Can you walk me through one of the projects listed on your resume?",
      "What tools do you use for version control and how do you manage branching strategies?",
      "How do you stay up to date with the latest trends and technologies in software development?",
      "Describe a typical day at your previous job and your main responsibilities.",
      "What do you consider your greatest technical strength and why?",
      // Medium (9-17)
      "Can you describe a challenging bug you encountered and explain how you resolved it?",
      "How do you approach writing unit tests and ensuring code quality in your projects?",
      "Tell me about a time you had to learn a new technology quickly to meet a project deadline.",
      "How have you handled disagreements with teammates about technical decisions?",
      "Describe a time when you optimized a slow or inefficient piece of code for better performance.",
      "How do you handle scope creep or changing requirements mid-project?",
      "Tell me about your experience with RESTful APIs and how you design or consume them.",
      "How do you approach code reviews — both giving and receiving feedback?",
      "Describe a project where you had to collaborate closely with designers or product managers.",
      // Hard (18-25)
      "How would you design a scalable authentication system for a large multi-tenant application?",
      "Explain the trade-offs between monolithic and microservice architectures in production systems.",
      "How do you approach database schema design for high-read, high-write workloads?",
      "Describe how you would implement a real-time notification system for millions of concurrent users.",
      "How do you ensure security best practices are enforced throughout the software development lifecycle?",
      "Walk me through how you would debug a production outage affecting thousands of users.",
      "How do you design a system that needs to handle eventual consistency across distributed services?",
      "What strategies do you use to make architectural decisions that balance speed, cost, and maintainability?"
    ];
  }
};

// Retry with exponential backoff for rate-limited (429) AND transiently
// overloaded (503) requests — Gemini returns 503 under high demand, which
// is temporary and worth retrying rather than failing immediately.
const retryWithBackoff = async (fn, retries = 4, delayMs = 1000) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const status = err?.status;
      const msg = (err?.message || '').toLowerCase();
      const isRetryable =
        status === 429 || status === 503 ||
        msg.includes('429') || msg.includes('503') ||
        msg.includes('rate limit') || msg.includes('overloaded') ||
        msg.includes('high demand') || msg.includes('service unavailable');
      if (isRetryable && attempt < retries) {
        const wait = delayMs * Math.pow(2, attempt);
        console.warn(`⚠️ ${status || 'Transient error'}. Retrying in ${wait}ms... (attempt ${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, wait));
      } else {
        throw err;
      }
    }
  }
};

// Evaluate a list of items with concurrency limit to avoid rate limits
const evaluateWithConcurrency = async (items, evaluateFn, concurrency = 3) => {
  const results = new Array(items.length);
  let index = 0;

  const worker = async () => {
    while (index < items.length) {
      const i = index++;
      results[i] = await evaluateFn(items[i]);
    }
  };

  const workers = Array.from({ length: concurrency }, worker);
  await Promise.all(workers);
  return results;
};

const evaluateSingleAnswer = async (question, answer) => {
  initAI();
  const messages = [
    {
      role: "system",
      content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 10 to 15 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}
`
    },
    {
      role: "user",
      content: `
Question: ${question}
Answer: ${answer}
`
    }
  ];

  try {
    let text;
    if (isOpenRouter && openai) {
      const response = await openai.chat.completions.create({
        model: "google/gemini-2.5-flash",
        messages: messages,
      });
      text = response.choices[0].message.content;
    } else if (OPENAI_API_KEY && openai) {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        response_format: { type: "json_object" },
      });
      text = response.choices[0].message.content;
    } else if (GEMINI_API_KEY && model) {
      const combinedText = messages.map(m => m.content).join('\n\n');
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: combinedText }] }],
        generationConfig: { responseMimeType: "application/json" }
      });
      text = result.response.text();
    } else {
      throw new Error('No AI provider configured');
    }
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Evaluation Error:", error);
    return { confidence: 7, communication: 7, correctness: 7, finalScore: 7, feedback: "Good effort, keep practicing for more clarity." };
  }
};


const evaluateInterview = async (answers) => {
  // Evaluate answers with concurrency limit (3 at a time) + retry backoff to avoid rate limits
  const results = await evaluateWithConcurrency(
    answers,
    (a) => retryWithBackoff(() => evaluateSingleAnswer(a.question, a.answer)),
    3
  );
  
  const totalConfidence = results.reduce((sum, r) => sum + r.confidence, 0);
  const totalCommunication = results.reduce((sum, r) => sum + r.communication, 0);
  const totalCorrectness = results.reduce((sum, r) => sum + r.correctness, 0);
  const totalFinal = results.reduce((sum, r) => sum + r.finalScore, 0);
  
  return {
    overallScore: (totalFinal / results.length).toFixed(1),
    skills: {
      confidence: (totalConfidence / results.length).toFixed(1),
      communication: (totalCommunication / results.length).toFixed(1),
      correctness: (totalCorrectness / results.length).toFixed(1)
    },
    breakdown: answers.map((a, i) => ({
      question: a.question,
      score: results[i].finalScore,
      feedback: results[i].feedback
    }))
  };
};

module.exports = { extractResumeData, generateQuestions, evaluateInterview };