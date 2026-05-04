import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MessageSquare, Target, FileText, ChevronLeft, Award, TrendingUp, BarChart, CheckCircle } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { useNavigate } from 'react-router-dom';

const PerformanceReport = ({ report }) => {
  const navigate = useNavigate();
  const { overallScore, skills, breakdown } = report;

  const chartData = breakdown.map((item, i) => ({
    name: `Q${i + 1}`,
    score: parseFloat(item.score),
  }));

  return (
    <div className="max-w-7xl mx-auto pb-24 px-6 pt-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold mb-2">
            <Award className="w-5 h-5" />
            <span className="uppercase tracking-[0.2em] text-xs">Interview Completed</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Performance Analysis</h1>
          <p className="text-text-muted mt-2 font-medium">Detailed breakdown of your session with Sarah AI.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="!px-6 !py-3">
            <ChevronLeft className="w-4 h-4" />
            Return Home
          </Button>
          <Button onClick={() => window.print()} className="!px-8 !py-3 shadow-lg shadow-primary/20">
            <FileText className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 mb-8">
        {/* Main Score Card */}
        <Card className="lg:col-span-4 p-12 flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-none shadow-2xl" hover={false}>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-success to-primary" />
          
          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-success/5 rounded-full scale-125 blur-2xl group-hover:bg-success/10 transition-all duration-500" />
            <svg className="w-48 h-48 transform -rotate-90 relative z-10">
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-gray-100" />
              <motion.circle 
                cx="96" cy="96" r="88" 
                stroke="currentColor" strokeWidth="16" 
                fill="transparent" 
                strokeDasharray={552} 
                initial={{ strokeDashoffset: 552 }}
                animate={{ strokeDashoffset: 552 - (552 * overallScore) / 10 }} 
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-success" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <span className="text-6xl font-black tracking-tighter text-gray-900">{overallScore}</span>
              <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Overall Rating</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-black leading-tight">
              {overallScore >= 8 ? 'Stellar performance!' : overallScore >= 6 ? 'Highly Competent' : 'Growth Opportunity'}
            </h3>
            <p className="text-sm text-text-muted font-medium px-4">
              Your overall proficiency score is derived from confidence, communication, and technical correctness.
            </p>
          </div>
        </Card>

        {/* Analytics Chart */}
        <Card className="lg:col-span-8 p-10 flex flex-col bg-white border-none shadow-2xl" hover={false}>
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="text-primary w-5 h-5" />
                Response Consistency
              </h3>
              <p className="text-xs text-text-muted font-bold mt-1 uppercase tracking-widest">Question-by-question scoring</p>
            </div>
            <div className="flex items-center gap-2 bg-success/5 px-3 py-1 rounded-lg text-success text-xs font-black">
              <CheckCircle className="w-3 h-3" />
              LIVE DATA
            </div>
          </div>
          
          <div className="h-full min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} domain={[0, 10]} dx={-10} />
                <Tooltip 
                  cursor={{ stroke: '#10b981', strokeWidth: 2 }}
                  contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '16px' }}
                />
                <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Skill Metrics */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="p-8 bg-white border-none shadow-2xl h-full" hover={false}>
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <BarChart className="text-primary w-5 h-5" />
              Competency Matrix
            </h3>
            <div className="space-y-10">
              {[
                { label: 'Confidence', value: skills.confidence, color: 'bg-primary', desc: 'Poise and certainty' },
                { label: 'Communication', value: skills.communication, color: 'bg-secondary', desc: 'Clarity of expression' },
                { label: 'Correctness', value: skills.correctness, color: 'bg-accent', desc: 'Accuracy of information' },
              ].map((skill, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <span className="text-sm font-black uppercase tracking-wider block">{skill.label}</span>
                      <span className="text-[10px] text-text-muted font-bold block">{skill.desc}</span>
                    </div>
                    <span className="text-xl font-black text-gray-900">{skill.value}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.value * 10}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                      className={`h-full rounded-full ${skill.color} shadow-lg`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Detailed Feedback */}
        <div className="lg:col-span-8">
          <Card className="p-10 bg-white border-none shadow-2xl h-full" hover={false}>
            <h3 className="text-xl font-bold mb-10 flex items-center gap-2">
              <MessageSquare className="text-primary w-5 h-5" />
              Question-by-Question Insights
            </h3>
            <div className="space-y-10">
              {breakdown.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="relative pl-8 border-l-4 border-gray-100 last:border-0 hover:border-primary/30 transition-all group pb-4"
                >
                  <div className="absolute top-0 -left-[10px] w-4 h-4 bg-white border-4 border-gray-200 rounded-full group-hover:border-primary transition-all" />
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Outcome {i+1}</span>
                    <div className={`px-4 py-1.5 rounded-xl text-xs font-black shadow-sm ${
                      item.score >= 8 ? 'bg-success/10 text-success' : 
                      item.score >= 5 ? 'bg-primary/10 text-primary' : 
                      'bg-error/10 text-error'
                    }`}>
                      {item.score}/10 SCORE
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold mb-4 pr-12 leading-snug">{item.question}</h4>
                  
                  <div className="flex gap-4 p-6 bg-gray-50/50 rounded-2xl border border-gray-100 group-hover:bg-primary/5 transition-all">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">Human-Like Feedback</span>
                      <p className="text-sm font-medium text-text-muted leading-relaxed italic">"{item.feedback}"</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReport;

