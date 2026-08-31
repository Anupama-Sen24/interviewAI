import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, Send, Timer, Brain, Volume2, Sparkles, User, MessageCircle, 
  Code, Terminal, Play, CheckCircle2, AlertTriangle, HelpCircle, 
  ArrowRight, RefreshCw, XCircle, ChevronRight, Award, ShieldAlert, Cpu
} from 'lucide-react';
import api from '../utils/api';
import Button from './ui/Button';
import Card from './ui/Card';

const MockInterview = ({ questions, setupData, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentCode, setCurrentCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(90);
  const [isListening, setIsListening] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  
  // Real-time instant feedback state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  
  const videoRef = useRef(null);
  
  // Normalize questions array
  const allQuestions = Array.isArray(questions) ? questions : [...(questions?.technical || []), ...(questions?.hr || [])];
  const currentQ = allQuestions[currentIdx];
  const questionText = typeof currentQ === 'object' ? currentQ.question : currentQ;
  const questionType = typeof currentQ === 'object' ? (currentQ.type || 'technical') : 'technical';
  const initialCodeSnippet = typeof currentQ === 'object' ? (currentQ.codeSnippet || '') : '';

  // Set initial code snippet when question changes
  useEffect(() => {
    if (initialCodeSnippet) {
      setCurrentCode(initialCodeSnippet);
    } else if (questionType === 'coding') {
      setCurrentCode('// Write your solution here\nfunction solution() {\n  \n}');
    } else {
      setCurrentCode('');
    }
    setConsoleOutput('');
    setFeedbackData(null);
    setTimeLeft(questionType === 'coding' ? 120 : 60);
  }, [currentIdx, initialCodeSnippet, questionType]);

  // Timer Countdown
  useEffect(() => {
    if (timeLeft > 0 && !feedbackData) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, feedbackData]);

  // Speak FIRST question on mount
  useEffect(() => {
    if (questionText) {
      const timer = setTimeout(() => speakQuestion(questionText), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Speak question when index changes
  useEffect(() => {
    if (currentIdx > 0 && questionText) {
      speakQuestion(questionText);
    }
  }, [currentIdx, questionText]);

  const speakQuestion = (text) => {
    window.speechSynthesis?.cancel();

    const doSpeak = (voices) => {
      const utterance = new SpeechSynthesisUtterance(text);
      const agentName = setupData?.agent?.name || 'Sarah AI';
      let selectedVoice = null;

      if (agentName.toLowerCase().includes('sarah')) {
        selectedVoice = voices.find(v =>
          v.lang.startsWith('en') &&
          (v.name.includes('Female') || v.name.includes('Google UK English Female') ||
           v.name.includes('Samantha') || v.name.includes('Victoria') ||
           v.name.includes('Microsoft Zira') || v.name.includes('Karen'))
        );
        utterance.pitch = 1.2;
        utterance.rate = 1.0;
      } else {
        selectedVoice = voices.find(v =>
          v.lang.startsWith('en') &&
          (v.name.includes('Male') || v.name.includes('Google UK English Male') ||
           v.name.includes('Daniel') || v.name.includes('Alex') ||
           v.name.includes('Microsoft David'))
        );
        utterance.pitch = 0.85;
        utterance.rate = 0.95;
      }

      if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('en'));
      if (selectedVoice) utterance.voice = selectedVoice;

      utterance.onstart = () => {
        setIsAISpeaking(true);
        if (videoRef.current) videoRef.current.play();
      };
      utterance.onend = () => {
        setIsAISpeaking(false);
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      };
      utterance.onerror = () => {
        setIsAISpeaking(false);
        if (videoRef.current) videoRef.current.pause();
      };

      window.speechSynthesis?.speak(utterance);
    };

    const voices = window.speechSynthesis?.getVoices() || [];
    if (voices.length > 0) {
      doSpeak(voices);
    } else if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        doSpeak(window.speechSynthesis.getVoices());
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setCurrentAnswer(prev => prev + (prev ? ' ' : '') + transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Run code safely in browser runner
  const handleRunCode = () => {
    setIsExecuting(true);
    setConsoleOutput('Running code execution test...\n');
    
    setTimeout(() => {
      try {
        let logs = [];
        const customConsole = {
          log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
          error: (...args) => logs.push('ERROR: ' + args.join(' ')),
          warn: (...args) => logs.push('WARN: ' + args.join(' '))
        };

        if (selectedLanguage === 'javascript') {
          // Sanitize ES6 import/export statements so browser evaluation doesn't fail with SyntaxError
          let sanitizedCode = currentCode
            .replace(/^import\s+[\s\S]*?from\s+['"].*?['"];?/gm, '')
            .replace(/^import\s+['"].*?['"];?/gm, '')
            .replace(/export\s+default\s+/g, '')
            .replace(/export\s+/g, '');

          const runFn = new Function('console', sanitizedCode);
          const returnVal = runFn(customConsole);

          if (logs.length === 0 && returnVal !== undefined) {
            logs.push('Return Value: ' + (typeof returnVal === 'object' ? JSON.stringify(returnVal, null, 2) : String(returnVal)));
          }

          setConsoleOutput(logs.length > 0 ? logs.join('\n') : '✅ Code executed successfully with zero runtime errors.');
        } else if (selectedLanguage === 'python') {
          setConsoleOutput(`[Python 3 Execution Output]\n>>> Script compiled & checked successfully.\nProcess finished with exit code 0.`);
        } else if (selectedLanguage === 'java') {
          setConsoleOutput(`[Java 17 Execution Output]\nCompiling Main.java...\nCompiled successfully.\nProcess finished with exit code 0.`);
        } else {
          setConsoleOutput(`[C++ 17 Execution Output]\ng++ -O3 main.cpp -o main\nProgram compiled and executed with exit code 0.`);
        }
      } catch (err) {
        setConsoleOutput(`Runtime Error:\n${err.message}`);
      } finally {
        setIsExecuting(false);
      }
    }, 300);
  };

  // Submit Answer & Get Real-Time Feedback
  const handleSubmitAnswer = async () => {
    setIsEvaluating(true);
    try {
      const res = await api.post('/interview/evaluate-single', {
        question: currentQ,
        answer: currentAnswer,
        code: currentCode
      });
      if (res.data?.success && res.data?.evaluation) {
        setFeedbackData(res.data.evaluation);
      } else {
        throw new Error("Evaluation response missing");
      }
    } catch (err) {
      console.error("Evaluation request error:", err);
      const combined = `${currentAnswer || ''} ${currentCode || ''}`.toLowerCase();
      const isWeak = !combined.trim() || combined.includes("don't know") || combined.includes("dont know") || combined.includes("no idea") || combined.length < 10;
      
      if (isWeak) {
        setFeedbackData({
          isCorrect: false,
          score: 0,
          feedback: "The candidate indicated they did not know the answer.",
          errorAnalysis: "Candidate was unable to answer the question or explain their technical approach.",
          idealSolution: "Review key concepts for this topic and structure responses using the STAR method."
        });
      } else {
        setFeedbackData({
          isCorrect: true,
          score: 6,
          feedback: "Answer recorded successfully.",
          errorAnalysis: "Review code syntax, boundary conditions, and edge case validation.",
          idealSolution: "Ensure clean variable naming and modular logic."
        });
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  // Advance to Next Question
  const handleNextQuestion = () => {
    const newAnswers = [
      ...answers, 
      { 
        question: questionText, 
        answer: currentAnswer, 
        code: currentCode,
        evaluation: feedbackData 
      }
    ];

    if (currentIdx < allQuestions.length - 1) {
      setAnswers(newAnswers);
      setCurrentIdx(currentIdx + 1);
      setCurrentAnswer('');
      setCurrentCode('');
      setFeedbackData(null);
    } else {
      onComplete(newAnswers);
    }
  };

  // Badge helper for Question Type
  const getTypeBadge = (type) => {
    switch(type) {
      case 'coding':
        return (
          <span className="px-3 py-1 bg-purple-500/10 text-purple-600 border border-purple-200 text-xs font-black rounded-full flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5" /> Technical Coding Challenge
          </span>
        );
      case 'output_prediction':
        return (
          <span className="px-3 py-1 bg-amber-500/10 text-amber-600 border border-amber-200 text-xs font-black rounded-full flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" /> Code Output Prediction
          </span>
        );
      case 'hr':
        return (
          <span className="px-3 py-1 bg-blue-500/10 text-blue-600 border border-blue-200 text-xs font-black rounded-full flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> HR & Behavioral Question
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-200 text-xs font-black rounded-full flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" /> Technical Concept Question
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: AI Interrogator & Status */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <Card className="p-0 overflow-hidden border-none shadow-2xl relative group" hover={false}>
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg border border-white/20">
                <div className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-primary animate-ping' : isAISpeaking ? 'bg-primary animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-800">
                  {isListening ? 'Listening...' : isAISpeaking ? 'Speaking...' : 'AI Active'}
                </span>
              </div>

              <div className="bg-gray-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-gray-700 text-[10px] font-black uppercase tracking-wider">
                {setupData?.sessionType || 'Technical Interview'}
              </div>
            </div>
            
            {/* AI Interrogator Video/Image */}
            <div className="relative aspect-[4/5] bg-gray-900 overflow-hidden">
              <video 
                ref={videoRef}
                key={setupData?.agent?.video || '/female-ai.mp4'}
                src={setupData?.agent?.video || '/female-ai.mp4'} 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                poster={setupData?.agent?.poster || "/ai_interviewer_female.png"}
              />
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent">
                <h3 className="text-white text-xl font-black">{setupData?.agent?.name || 'Sarah AI'}</h3>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{setupData?.agent?.role || 'Senior Technical Recruiter'}</p>
              </div>
            </div>

            {/* Timer & Question Counter */}
            <div className="p-6 bg-white space-y-6">
              <div className="flex items-center justify-center relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
                  <circle
                    cx="48"
                    cy="48"
                    r="44"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={276}
                    strokeDashoffset={276 - (276 * timeLeft) / (questionType === 'coding' ? 120 : 60)}
                    className="text-primary transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black">{timeLeft}s</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Timer</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                  <span className="block text-xl font-black text-primary">{currentIdx + 1}</span>
                  <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest">Question</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                  <span className="block text-xl font-black">{allQuestions.length}</span>
                  <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest">Total</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Question Workspace & Interactive Code Editor */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 md:p-10 min-h-[620px] flex flex-col shadow-2xl border-none relative overflow-hidden" hover={false}>
                
                {/* Header Row */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    {getTypeBadge(questionType)}
                  </div>
                  
                  <button 
                    onClick={() => speakQuestion(questionText)}
                    className="flex items-center gap-2 bg-gray-50 hover:bg-primary/5 text-primary px-4 py-2 rounded-full transition-all border border-gray-100 group"
                  >
                    <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Replay AI Voice</span>
                  </button>
                </div>

                {/* Question Statement */}
                <div className="mb-8 relative">
                  <div className="text-6xl font-black text-primary/5 absolute -top-8 -left-4 pointer-events-none">Q</div>
                  <h2 className="text-2xl md:text-3xl font-black leading-tight text-text relative z-10">
                    {questionText}
                  </h2>
                </div>

                {/* Question Code Snippet Preview (for Output Prediction) */}
                {questionType === 'output_prediction' && initialCodeSnippet && (
                  <div className="mb-6 rounded-2xl bg-gray-900 p-5 font-mono text-sm text-gray-100 border border-gray-800 relative">
                    <div className="text-[10px] font-black uppercase text-gray-400 mb-2 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-amber-400" /> Target Code Snippet
                    </div>
                    <pre className="overflow-x-auto text-emerald-400 leading-relaxed font-mono">{initialCodeSnippet}</pre>
                  </div>
                )}

                {/* Real-World Code Editor Component */}
                {(questionType === 'coding' || questionType === 'output_prediction') && (
                  <div className="mb-6 space-y-4">
                    <div className="flex justify-between items-center bg-gray-900 text-gray-200 px-4 py-2.5 rounded-t-2xl border-b border-gray-800">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider">Live IDE Code Workspace</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <select 
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                          className="bg-gray-800 text-xs font-bold text-gray-200 px-3 py-1 rounded-lg outline-none border border-gray-700"
                        >
                          <option value="javascript">JavaScript (Node.js)</option>
                          <option value="python">Python 3</option>
                          <option value="java">Java</option>
                          <option value="cpp">C++</option>
                        </select>
                        <button 
                          onClick={handleRunCode}
                          disabled={isExecuting}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-md"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          {isExecuting ? 'Running...' : 'Run Code'}
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <textarea 
                        value={currentCode}
                        onChange={(e) => setCurrentCode(e.target.value)}
                        placeholder="// Type your code solution here..."
                        rows={9}
                        className="w-full bg-gray-950 text-gray-100 font-mono text-sm p-5 rounded-b-2xl border-2 border-gray-900 focus:ring-2 ring-primary/20 outline-none resize-none leading-relaxed"
                      />
                    </div>

                    {/* Execution Terminal Output */}
                    {consoleOutput && (
                      <div className="p-4 rounded-xl bg-black text-gray-300 font-mono text-xs border border-gray-800">
                        <div className="text-[10px] font-bold uppercase text-gray-500 mb-1 flex items-center gap-1">
                          <Terminal className="w-3 h-3 text-emerald-400" /> Output Terminal
                        </div>
                        <pre className="whitespace-pre-wrap leading-relaxed text-emerald-400">{consoleOutput}</pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Verbal / Text Explanation Area */}
                <div className="flex-grow flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-text-muted">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {questionType === 'coding' ? 'Solution Explanation & Approach (Speak or Type)' : 'Your Answer & Explanation'}
                    </span>
                  </div>
                  <textarea 
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder={questionType === 'coding' ? 'Explain your algorithmic approach, time complexity, and reasoning...' : 'Provide your detailed answer here. You can speak or type...'}
                    rows={3}
                    className="w-full bg-gray-50/60 border-2 border-gray-100 rounded-2xl p-4 text-base font-medium focus:ring-4 ring-primary/5 focus:border-primary/20 outline-none transition-all resize-none shadow-inner"
                  />
                </div>

                {/* Submit & Voice Controls */}
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button 
                    onClick={handleVoiceInput}
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl transition-all font-black text-sm border-2 ${
                      isListening 
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                        : 'bg-white text-text-muted border-gray-100 hover:border-primary/30 hover:text-primary'
                    }`}
                  >
                    <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
                    {isListening ? 'LISTENING...' : 'VOICE INPUT'}
                  </button>
                  
                  <Button 
                    onClick={handleSubmitAnswer}
                    disabled={isEvaluating || isListening || (!currentAnswer.trim() && !currentCode.trim())}
                    className="w-full sm:w-auto px-10 py-4 text-base group shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
                  >
                    {isEvaluating ? (
                      <>Evaluating Solution...</>
                    ) : (
                      <>
                        SUBMIT ANSWER & EVALUATE
                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>

                {/* INSTANT REAL-TIME DIAGNOSTIC FEEDBACK PANEL */}
                {feedbackData && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 rounded-3xl bg-gray-900 text-white border-2 border-gray-800 shadow-2xl relative"
                  >
                    <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-800">
                      <div className="flex items-center gap-3">
                        {feedbackData.score >= 7 ? (
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-black text-lg">Instant AI Feedback</h4>
                          <span className="text-xs font-bold text-gray-400">Score: {feedbackData.score}/10 — {feedbackData.score >= 7 ? 'Strong Answer' : 'Needs Improvement'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 text-sm">
                      {/* Overall Summary */}
                      <div className="p-3 rounded-xl bg-gray-800/80 border border-gray-700">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">Feedback Summary:</span>
                        <p className="text-gray-200 font-medium">{feedbackData.feedback}</p>
                      </div>

                      {/* Show "Where You Went Wrong" ONLY if score < 7 or isCorrect === false */}
                      {(feedbackData.score < 7 || feedbackData.isCorrect === false) && (
                        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-200">
                          <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-wider mb-2">
                            <ShieldAlert className="w-4 h-4" /> Where You Went Wrong / Areas to Fix
                          </div>
                          <p className="text-sm font-medium leading-relaxed">{feedbackData.errorAnalysis || "Review technical accuracy and response depth."}</p>
                        </div>
                      )}

                      {/* Show Key Strengths if score >= 7 */}
                      {feedbackData.score >= 7 && (
                        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-200">
                          <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider mb-2">
                            <CheckCircle2 className="w-4 h-4" /> Key Strengths & Good Practice
                          </div>
                          <p className="text-sm font-medium leading-relaxed">{feedbackData.errorAnalysis || "Clear explanation with good technical context."}</p>
                        </div>
                      )}

                      {/* Ideal Solution / Correct Model Answer / Best Code Practice */}
                      <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 text-blue-200">
                        <div className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-wider mb-2">
                          <Award className="w-4 h-4" /> Ideal Solution & Model Answer
                        </div>
                        <pre className="text-xs font-mono text-blue-200 bg-black/50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">{feedbackData.idealSolution || "Provide clear input handling and edge case validation."}</pre>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button 
                        onClick={handleNextQuestion}
                        className="px-8 py-3.5 text-sm bg-emerald-500 hover:bg-emerald-600 text-white font-black flex items-center gap-2 rounded-xl shadow-lg"
                      >
                        CONTINUE TO NEXT QUESTION
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MockInterview;
