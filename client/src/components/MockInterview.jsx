import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Timer, Brain, Volume2, Sparkles, User, MessageCircle } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';

const MockInterview = ({ questions, setupData, onComplete }) => {

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isListening, setIsListening] = useState(false);
  
  // Support both new flat array and old technical/hr structure for backward compatibility
  const allQuestions = Array.isArray(questions) ? questions : [...(questions.technical || []), ...(questions.hr || [])];

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentAnswer.trim()) {
      handleSubmit();
    }
  }, [timeLeft]);

  // Speak question when it changes
  useEffect(() => {
    if (allQuestions[currentIdx]) {
      speakQuestion(allQuestions[currentIdx]);
    }
  }, [currentIdx]);

  const speakQuestion = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
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

  const handleSubmit = () => {
    const newAnswers = [...answers, { question: allQuestions[currentIdx], answer: currentAnswer }];
    if (currentIdx < allQuestions.length - 1) {
      setAnswers(newAnswers);
      setCurrentIdx(currentIdx + 1);
      setCurrentAnswer('');
      setTimeLeft(60);
    } else {
      onComplete(newAnswers);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: AI Avatar & Status */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <Card className="p-0 overflow-hidden border-none shadow-2xl relative group" hover={false}>
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg border border-white/20">
                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-primary animate-ping' : 'bg-success animate-pulse'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-800">
                  {isListening ? 'Listening...' : 'AI Active'}
                </span>
              </div>
            </div>
            
            {/* AI Interrogator Video/Image */}
            <div className="relative aspect-[4/5] bg-gray-900 overflow-hidden">
               <video 
                key={setupData?.agent?.video || '/female-ai.mp4'}
                src={setupData?.agent?.video || '/female-ai.mp4'} 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                poster={setupData?.agent?.poster || "/ai_interviewer_female.png"}
               />
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-gray-900 to-transparent">
                <h3 className="text-white text-xl font-black">{setupData?.agent?.name || 'Sarah AI'}</h3>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{setupData?.agent?.role || 'Senior Technical Recruiter'}</p>
              </div>
            </div>



            <div className="p-8 bg-white space-y-6">
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
                    strokeDashoffset={276 - (276 * timeLeft) / 60}
                    className="text-primary transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black">{timeLeft}s</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                  <span className="block text-xl font-black text-primary">{currentIdx + 1}</span>
                  <span className="text-[8px] text-text-muted font-bold uppercase tracking-widest">Question</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                  <span className="block text-xl font-black">{allQuestions.length}</span>
                  <span className="text-[8px] text-text-muted font-bold uppercase tracking-widest">Total</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Question & Input */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="p-10 min-h-[600px] flex flex-col shadow-2xl border-none relative overflow-hidden" hover={false}>
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                  <Brain size={300} />
                </div>

                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Interview Session</span>
                      <h4 className="font-bold text-sm">Advanced Skill Assessment</h4>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => speakQuestion(allQuestions[currentIdx])}
                    className="flex items-center gap-2 bg-gray-50 hover:bg-primary/5 text-primary px-4 py-2 rounded-full transition-all border border-gray-100 group"
                  >
                    <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Replay AI Voice</span>
                  </button>
                </div>

                <div className="mb-12 relative">
                  <div className="text-6xl font-black text-primary/5 absolute -top-8 -left-4 pointer-events-none">Q</div>
                  <h2 className="text-3xl md:text-4xl font-black leading-tight text-text relative z-10">
                    {allQuestions[currentIdx]}
                  </h2>
                </div>

                <div className="flex-grow flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-text-muted mb-2">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Your Professional Answer</span>
                  </div>
                  <textarea 
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Provide your detailed answer here. You can speak or type..."
                    className="w-full flex-grow bg-gray-50/50 border-2 border-gray-100 rounded-3xl p-8 text-xl font-medium focus:ring-4 ring-primary/5 focus:border-primary/20 outline-none transition-all resize-none shadow-inner"
                  />
                </div>

                <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <button 
                    onClick={handleVoiceInput}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all font-black text-sm border-2 ${
                      isListening 
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                        : 'bg-white text-text-muted border-gray-100 hover:border-primary/30 hover:text-primary'
                    }`}
                  >
                    <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
                    {isListening ? 'LISTENING...' : 'START VOICE INPUT'}
                  </button>
                  
                  <Button 
                    onClick={handleSubmit}
                    disabled={!currentAnswer.trim() || isListening}
                    className="w-full sm:w-auto px-12 py-5 text-lg group shadow-xl shadow-primary/30"
                  >
                    SUBMIT ANSWER
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MockInterview;

