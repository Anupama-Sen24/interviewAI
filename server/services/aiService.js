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
  if (OPENROUTER_API_KEY && !openai) {
    console.log("🚀 OpenRouter Key detected (Length:", OPENROUTER_API_KEY.length, ")");
    openai = new OpenAI({ 
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: OPENROUTER_API_KEY 
    });
    isOpenRouter = true;
  } else if (GEMINI_API_KEY && !model && !isOpenRouter) {
    console.log("🔑 Gemini Key detected (Length:", GEMINI_API_KEY.length, ")");
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY.trim());
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("✨ Google Gemini Model Initialized");
  } else if (OPENAI_API_KEY && !openai && !isOpenRouter) {
    openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    console.log("🤖 OpenAI Initialized");
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
    if (isOpenRouter || OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: isOpenRouter ? "google/gemini-2.5-flash" : "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 1000,
      });
      text = response.choices[0].message.content;
    } else if (GEMINI_API_KEY) {
      const combinedText = messages.map(m => m.content).join('\n\n');
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: combinedText }] }],
        generationConfig: { responseMimeType: "application/json" }
      });
      text = result.response.text();
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
      projects: ["No projects found in this format"], 
      skills: ["Please upload a standard text-based PDF"],
      atsScore: 30,
      atsFeedback: "Format not easily readable by ATS."
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

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression:
Question 1 → easy  
Question 2 → easy  
Question 3 → medium  
Question 4 → medium  
Question 5 → hard  

Make questions based on the candidate’s role, experience,interviewMode, projects, skills, and resume details.
`
    },
    {
      role: "user",
      content: userPrompt
    }
  ];

  try {
    let text;
    if (isOpenRouter || OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: isOpenRouter ? "google/gemini-2.5-flash" : "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 1000,
      });
      text = response.choices[0].message.content;
    } else if (GEMINI_API_KEY) {
      const combinedText = messages.map(m => m.content).join('\n\n');
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: combinedText }] }]
      });
      text = result.response.text();
    }
    
    const questions = text.split('\n').filter(q => q.trim().length > 10).slice(0, 5);
    return questions;
  } catch (error) {
    console.error("Question Generation Error:", error);
    return [
      "Can you describe your most significant technical achievement and the impact it had?",
      "How do you typically approach learning a new technology or framework for a project?",
      "Tell me about a time you had to troubleshoot a complex technical issue under pressure.",
      "In your experience, what are the most important factors for successful team collaboration?",
      "How do you ensure the quality and reliability of the software you develop?"
    ];
  }
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
    if (isOpenRouter || OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: isOpenRouter ? "google/gemini-2.5-flash" : "gpt-3.5-turbo",
        messages: messages,
        response_format: { type: "json_object" },
        max_tokens: 1000,
      });
      text = response.choices[0].message.content;
    } else if (GEMINI_API_KEY) {
      const combinedText = messages.map(m => m.content).join('\n\n');
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: combinedText }] }],
        generationConfig: { responseMimeType: "application/json" }
      });
      text = result.response.text();
    }
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Evaluation Error:", error);
    return { confidence: 7, communication: 7, correctness: 7, finalScore: 7, feedback: "Good effort, keep practicing for more clarity." };
  }
};


const evaluateInterview = async (answers) => {
  // This is now a wrapper that evaluates each answer individually or as a batch
  const results = await Promise.all(answers.map(a => evaluateSingleAnswer(a.question, a.answer)));
  
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

const generateImprovedResume = async (resumeText, data) => {
  initAI();
  const systemPrompt = `
You are an Expert Technical Recruiter and Resume Writer.
Based on the provided original resume text and the extracted skills/projects, completely rewrite the resume to be highly ATS-friendly and impactful for a ${data.role} interview.

Instructions:
1. Use clean, professional Markdown format.
2. Ensure there is a Professional Summary, Core Skills section, Professional Experience, and Projects.
3. Inject missing but relevant industry-standard keywords based on the candidate's skills.
4. Convert bullet points into "Action-Verb + Context + Result" statements.
5. Fix any formatting or structural issues from the original text.

Return ONLY the markdown text. Do not add any conversational filler.
`;

  const userPrompt = `
    Target Role: ${data.role}
    Extracted Skills: ${data.skills.join(', ')}
    Original Resume Text:
    ${resumeText.substring(0, 3000)}
  `;

  try {
    let text;
    if (isOpenRouter || OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: isOpenRouter ? "google/gemini-2.5-flash" : "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 3000,
      });
      text = response.choices[0].message.content;
    } else if (GEMINI_API_KEY) {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }]
      });
      text = result.response.text();
    }
    return text;
  } catch (error) {
    console.error("Resume Improve Error:", error);
    return "# Error\nFailed to generate resume. Please try again.";
  }
};

module.exports = { extractResumeData, generateQuestions, evaluateInterview, generateImprovedResume };

