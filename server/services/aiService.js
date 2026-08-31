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
    model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
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
      const result = await generateGeminiContent({
        contents: [{ role: 'user', parts: [{ text: combinedText }] }],
        generationConfig: { responseMimeType: "application/json" }
      });
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

const generateQuestions = async (data, resumeText, mode = "Technical Interview") => {
  initAI();
  const { role, experience, projects, skills } = data;
  const projectText = Array.isArray(projects) ? projects.join(", ") : projects || '';
  const skillsText = Array.isArray(skills) ? skills.join(", ") : skills || '';
  const safeResume = (resumeText || '').substring(0, 2000);

  const modeInstructions = {
    "HR Interview": `
Focus ONLY on HR, behavioral, situational judgment, past workplace challenges, culture fit, communication, and interpersonal scenarios.
Do NOT include coding or deep technical implementation questions.
All questions must have "type": "hr".
`,
    "Technical Interview": `
Focus heavily on real-world technical interview questions:
- Core technical concepts & architecture.
- Previous job/internship technical challenges.
- Coding challenges (marked with "type": "coding") with a starter code snippet template in "codeSnippet".
- Code output prediction challenges (marked with "type": "output_prediction") with the code snippet to evaluate in "codeSnippet".
Include a good balance of conceptual technical questions (30%), coding tasks (40%), and output prediction questions (30%).
`,
    "Full Mock Session": `
Conduct a realistic 2-phase full mock interview:
- Phase 1 (First 30% of questions): HR warm-up, background, behavioral, and situational questions ("type": "hr").
- Phase 2 (Remaining 70% of questions): Technical concepts ("type": "technical"), coding tasks ("type": "coding"), and output prediction ("type": "output_prediction").
`
  };

  const selectedModePrompt = modeInstructions[mode] || modeInstructions["Technical Interview"];

  const messages = [
    {
      role: "system",
      content: `
You are a real-world senior interviewer conducting an interview for the role of ${role} (${experience} experience).

Selected Interview Mode: "${mode}"

${selectedModePrompt}

Generate a JSON array of exactly 15 interview question objects matching this JSON schema:
[
  {
    "id": 1,
    "type": "hr" | "technical" | "coding" | "output_prediction",
    "question": "Clear, direct question text",
    "codeSnippet": "Initial starter code for coding tasks OR the code snippet for output prediction tasks. Null for standard text questions.",
    "language": "javascript"
  }
]

Strict Rules:
- Return ONLY a valid JSON array. No markdown formatting outside JSON, no explanation before or after.
- Questions must feel realistic, natural, and directly tailored to candidate's skills (${skillsText}), projects (${projectText}), and role (${role}).
- For "coding" questions, provide clean initial starter boilerplate in "codeSnippet".
- For "output_prediction" questions, provide a tricky code snippet in "codeSnippet" and ask candidate what it outputs or what bug it contains.
`
    },
    {
      role: "user",
      content: `Candidate Role: ${role}\nExperience: ${experience}\nSkills: ${skillsText}\nProjects: ${projectText}\nResume Context: ${safeResume}`
    }
  ];

  try {
    let text;
    if (isOpenRouter && openai) {
      const response = await openai.chat.completions.create({
        model: "google/gemini-2.5-flash",
        messages: messages,
        max_tokens: 2000
      });
      text = response.choices[0].message.content;
    } else if (OPENAI_API_KEY && openai) {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        response_format: { type: "json_object" }
      });
      text = response.choices[0].message.content;
    } else if (GEMINI_API_KEY && model) {
      const combinedText = messages.map(m => m.content).join('\n\n');
      const result = await generateGeminiContent({
        contents: [{ role: 'user', parts: [{ text: combinedText }] }],
        generationConfig: { responseMimeType: "application/json" }
      });
      text = result.response.text();
    } else {
      throw new Error('No AI provider configured');
    }
    
    console.log("Raw Generated Questions JSON:", text.substring(0, 300));
    const parsedQuestions = parseJsonArraySafely(text);
    
    if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
      return parsedQuestions;
    }
    throw new Error('Failed to parse JSON array from AI output');
  } catch (error) {
    console.error("Question Generation Error:", error.message);
    // Mode-specific fallback questions
    if (mode === "HR Interview") {
      return [
        { id: 1, type: "hr", question: "Can you introduce yourself and describe your professional journey and career goals?" },
        { id: 2, type: "hr", question: "Tell me about a time you faced a tight deadline. How did you prioritize tasks under pressure?" },
        { id: 3, type: "hr", question: "Describe a situation where you had a conflict with a teammate over technical direction. How did you resolve it?" },
        { id: 4, type: "hr", question: "What is your greatest professional strength and one area you actively seek to improve?" },
        { id: 5, type: "hr", question: "Why are you interested in this role and what work environment helps you thrive?" }
      ];
    } else if (mode === "Technical Interview") {
      return [
        { 
          id: 1, 
          type: "coding", 
          question: "Write a JavaScript function to find the first non-repeating character in a string.",
          codeSnippet: "function firstUniqChar(s) {\n  // Write your code here\n}",
          language: "javascript"
        },
        { 
          id: 2, 
          type: "output_prediction", 
          question: "What will the following JavaScript code output to the console and why?",
          codeSnippet: "console.log(typeof null);\nconsole.log(1 + '2' + 3);\nconsole.log(1 + + '2' + 3);",
          language: "javascript"
        },
        { 
          id: 3, 
          type: "technical", 
          question: "Walk me through how you would optimize a slow database query in a Node.js application." 
        },
        { 
          id: 4, 
          type: "coding", 
          question: "Implement a function to check if two strings are valid anagrams of each other.",
          codeSnippet: "function isAnagram(s, t) {\n  // Write your solution here\n}",
          language: "javascript"
        },
        { 
          id: 5, 
          type: "technical", 
          question: "Explain the difference between SQL and NoSQL databases and when you would choose MongoDB over PostgreSQL." 
        }
      ];
    } else {
      return [
        { id: 1, type: "hr", question: "Introduce yourself and explain why you're interested in this role." },
        { id: 2, type: "hr", question: "Describe a challenging situation in your previous project and how you handled it." },
        { 
          id: 3, 
          type: "coding", 
          question: "Write a function to flatten a deeply nested array in JavaScript.",
          codeSnippet: "function flattenArray(arr) {\n  // Write your solution here\n}",
          language: "javascript"
        },
        { 
          id: 4, 
          type: "output_prediction", 
          question: "Predict the output of the following asynchronous JavaScript code execution:",
          codeSnippet: "console.log('1');\nsetTimeout(() => console.log('2'), 0);\nPromise.resolve().then(() => console.log('3'));\nconsole.log('4');",
          language: "javascript"
        },
        { id: 5, type: "technical", question: "How do you handle authentication and authorization securely in a full stack MERN web application?" }
      ];
    }
  }
};

// Robust JSON Array Extractor to prevent syntax errors from markdown commentary or unescaped text
const parseJsonArraySafely = (text) => {
  if (!text || typeof text !== 'string') return null;
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();

  // 1. Direct JSON parse
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
      const key = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
      if (key) return parsed[key];
    }
  } catch (e) {}

  // 2. Bracket matching extraction
  const firstOpen = cleaned.indexOf('[');
  const lastClose = cleaned.lastIndexOf(']');
  if (firstOpen !== -1 && lastClose > firstOpen) {
    const candidate = cleaned.substring(firstOpen, lastClose + 1);
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }

  return null;
};

// Retry with exponential backoff for rate-limited (429) AND transiently
// overloaded (503) requests — Gemini returns 503 under high demand, which
// is temporary and worth retrying rather than failing immediately.
const retryWithBackoff = async (fn, retries = 4, delayMs = 1200) => {
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

// Preview/newest Gemini models sometimes stay overloaded (503) for extended
// windows regardless of retries. Rather than retrying the same saturated
// model forever, fall through to a more available, established model.
const GEMINI_MODEL_CHAIN = ['gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-2.0-flash'];
const geminiModelCache = {};

const getGeminiModel = (modelName) => {
  if (!geminiModelCache[modelName]) {
    geminiModelCache[modelName] = genAI.getGenerativeModel({ model: modelName });
  }
  return geminiModelCache[modelName];
};

const generateGeminiContent = async (requestParams) => {
  let lastErr;
  for (const modelName of GEMINI_MODEL_CHAIN) {
    try {
      const m = getGeminiModel(modelName);
      // Short retry budget per model — the fallback to the next model is
      // the real defense against sustained overload, not endless retries
      // on one saturated model.
      const result = await retryWithBackoff(() => m.generateContent(requestParams), 2, 1000);
      return result;
    } catch (err) {
      console.warn(`⚠️ ${modelName} unavailable, trying next model in chain...`);
      lastErr = err;
    }
  }
  throw lastErr;
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
      const result = await generateGeminiContent({
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

const evaluateSingleAnswerDetailed = async (questionObj, answer, codeInput) => {
  initAI();
  const qText = typeof questionObj === 'string' ? questionObj : questionObj?.question || '';
  const qType = questionObj?.type || 'technical';
  const snippet = questionObj?.codeSnippet || '';

  const messages = [
    {
      role: "system",
      content: `
You are a senior tech lead & HR interviewer evaluating a candidate's answer during a real interview.

Question Type: "${qType}"
Question: "${qText}"
Original Code Snippet (if any): "${snippet}"

Candidate's Answer/Explanation: "${answer || 'No text provided'}"
Candidate's Submitted Code (if any): "${codeInput || 'No code provided'}"

Rules:
- Be strict, realistic, and honest.
- If candidate says "I don't know", "no idea", "not sure", or leaves a blank/meaningless answer, score 0 out of 10 and set isCorrect to false.
- Highlight EXACTLY where the user went wrong in errorAnalysis.

Return ONLY valid JSON matching this schema:
{
  "isCorrect": false,
  "score": 0,
  "confidence": 0,
  "communication": 0,
  "correctness": 0,
  "feedback": "Short 1-2 sentence overall summary",
  "errorAnalysis": "Detailed breakdown explaining exactly where the user's logic, code syntax, output prediction, or communication went wrong. Be specific!",
  "idealSolution": "Clean, working ideal code or sample answer showcasing the correct approach."
}
`
    },
    {
      role: "user",
      content: `Evaluate candidate submission.`
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
      const result = await generateGeminiContent({
        contents: [{ role: 'user', parts: [{ text: combinedText }] }],
        generationConfig: { responseMimeType: "application/json" }
      });
      text = result.response.text();
    } else {
      throw new Error('No AI provider configured');
    }
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    console.error("Detailed Evaluation Error:", error);
    const combinedStr = `${answer || ''} ${codeInput || ''}`.toLowerCase();
    const isWeak = !combinedStr.trim() || combinedStr.includes("don't know") || combinedStr.includes("dont know") || combinedStr.includes("no idea") || combinedStr.length < 10;
    
    if (isWeak) {
      return {
        isCorrect: false,
        score: 0,
        confidence: 0,
        communication: 0,
        correctness: 0,
        feedback: "The candidate indicated they did not know the answer or provided an incomplete response.",
        errorAnalysis: "Candidate was unable to answer the question or explain their technical approach.",
        idealSolution: "Review key concepts for this topic and structure responses using the STAR method."
      };
    }

    return {
      isCorrect: true,
      score: 6,
      confidence: 6,
      communication: 6,
      correctness: 6,
      feedback: "Answer recorded successfully. Practice explaining with more depth.",
      errorAnalysis: "Review code syntax, boundary conditions, and edge case validation.",
      idealSolution: "Ensure you handle null checks and edge cases explicitly."
    };
  }
};

const evaluateInterview = async (answers) => {
  // Evaluate answers with concurrency limit (3 at a time) + retry backoff to avoid rate limits
  const results = await evaluateWithConcurrency(
    answers,
    (a) => retryWithBackoff(() => evaluateSingleAnswer(a.question, a.answer)),
    3
  );
  
  const totalConfidence = results.reduce((sum, r) => sum + (r.confidence || 7), 0);
  const totalCommunication = results.reduce((sum, r) => sum + (r.communication || 7), 0);
  const totalCorrectness = results.reduce((sum, r) => sum + (r.correctness || 7), 0);
  const totalFinal = results.reduce((sum, r) => sum + (r.finalScore || r.score || 7), 0);
  
  return {
    overallScore: (totalFinal / results.length).toFixed(1),
    skills: {
      confidence: (totalConfidence / results.length).toFixed(1),
      communication: (totalCommunication / results.length).toFixed(1),
      correctness: (totalCorrectness / results.length).toFixed(1)
    },
    breakdown: answers.map((a, i) => ({
      question: typeof a.question === 'object' ? a.question.question : a.question,
      score: results[i].finalScore || results[i].score || 7,
      feedback: results[i].feedback
    }))
  };
};

module.exports = { extractResumeData, generateQuestions, evaluateSingleAnswerDetailed, evaluateInterview };