import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, BarChart3, Shield, Zap, Sparkles, Brain } from 'lucide-react';
import Card from './Card';

const FeaturesModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const features = [
    { icon: <Mic className="text-primary" />, title: "Smart Voice Analysis", desc: "Speak naturally. Our AI analyzes your tone, clarity, and keyword usage in real-time." },
    { icon: <BarChart3 className="text-secondary" />, title: "Detailed Analytics", desc: "Get a comprehensive breakdown of your confidence, communication, and correctness." },
    { icon: <Shield className="text-accent" />, title: "Persona-Based Mocks", desc: "Practice with different interviewer personalities, from friendly HRs to tough tech leads." },
    { icon: <Zap className="text-success" />, title: "Instant Feedback", desc: "No more waiting. Get your performance report and improvement tips immediately." },
    { icon: <Brain className="text-warning" />, title: "Resume Intelligence", desc: "Questions are dynamically generated based on your specific skills and projects." },
    { icon: <Sparkles className="text-primary" />, title: "Sarah AI Integration", desc: "Experience the most human-like AI interviewer in the world." }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-[3rem] overflow-hidden shadow-2xl"
        >
          <div className="p-12">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-black tracking-tight mb-2">Core Features</h2>
                <p className="text-text-muted font-medium uppercase tracking-widest text-[10px]">Everything you need to succeed</p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-500 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feat, i) => (
                <Card key={i} className="p-8 border-none bg-gray-50/50 hover:bg-white hover:shadow-xl transition-all group" hover={true}>
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    {feat.icon}
                  </div>
                  <h3 className="text-lg font-black mb-2">{feat.title}</h3>
                  <p className="text-xs text-text-muted font-bold leading-relaxed">{feat.desc}</p>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 p-8 text-center">
            <p className="text-xs font-black text-text-muted uppercase tracking-widest">
              Ready to start? <span className="text-primary cursor-pointer hover:underline" onClick={onClose}>Launch Dashboard</span>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FeaturesModal;
