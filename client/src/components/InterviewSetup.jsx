import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, ChevronDown, Mic, BarChart3, Play } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';

const InterviewSetup = ({ data, onStart }) => {
  const [role, setRole] = useState(data?.role || "Frontend Developer");
  const [description, setDescription] = useState(data?.experience || "Looking for frontend developer role to build websites.");
  const [sessionType, setSessionType] = useState("Technical Interview");
  const [selectedAgent, setSelectedAgent] = useState('agent1');

  // Fallback for missing projects/skills
  const projects = data?.projects || [];
  const skills = data?.skills || [];

  const agents = [
    { id: 'agent1', name: 'Sarah AI', role: 'Technical Lead', video: '/female-ai.mp4', poster: '/ai_interviewer_female.png' },
    { id: 'agent2', name: 'Mark AI', role: 'HR Manager', video: '/male-ai.mp4', poster: '/ai_interviewer_male.png' }
  ];


  return (
    <Card 
      className="max-w-6xl mx-auto mt-10 border-none overflow-hidden flex flex-col md:flex-row min-h-[600px]"
      hover={false}
    >
      {/* Left Column */}
      <div className="md:w-2/5 bg-success/5 p-12 text-black text-left">
        <h2 className="text-4xl font-black mb-6 leading-tight">Start Your <br />AI Interview</h2>
        <p className="text-gray-500 font-medium mb-12">Practice real interview scenarios powered by AI. Improve communication, technical skills, and confidence.</p>
        
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Choose Your Interviewer:</h4>
        <div className="grid grid-cols-2 gap-4 mb-12">
          {agents.map((agent) => (
            <div 
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all ${selectedAgent === agent.id ? 'border-success ring-4 ring-success/10' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <div className="aspect-square bg-gray-200 relative">
                <img src={agent.poster} alt={agent.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/60 to-transparent">
                  <span className="text-[10px] font-black text-white uppercase">{agent.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {[
            { id: 'role', icon: <User className="w-5 h-5" />, text: "Choose Role & Experience", desc: "Tailor questions to your target job", action: () => document.getElementById('role-input')?.focus() },
            { id: 'voice', icon: <Mic className="w-5 h-5" />, text: "Smart Voice Interview", desc: "Real-time speech-to-text enabled", action: () => alert("Smart Voice is enabled for this session. You can speak your answers during the interview!") },
            { id: 'stats', icon: <BarChart3 className="w-5 h-5" />, text: "Performance Analytics", desc: "Detailed post-interview reports", action: () => alert("Detailed competency reports will be generated automatically after you complete all questions.") },
          ].map((item, i) => (
            <motion.div 
              key={i} 
              whileHover={{ x: 10 }}
              onClick={item.action}
              className="flex items-center gap-5 p-5 rounded-2xl bg-white border border-success/10 shadow-sm hover:shadow-md hover:border-success/30 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div>
                <span className="font-black text-sm block">{item.text}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.desc}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Right Column */}
      <div className="md:w-3/5 p-12 text-black text-left">
        <h3 className="text-2xl font-bold mb-8">Interview Setup</h3>
        
        <div className="space-y-6 mb-10">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              id="role-input"
              type="text" 
              value={role}

              onChange={(e) => setRole(e.target.value)}
              placeholder="Target Role (e.g. Frontend Developer)" 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 font-medium focus:ring-2 ring-success/20 outline-none" 
            />
          </div>
          
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Job Description or Experience level" 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 font-medium focus:ring-2 ring-success/20 outline-none" 
            />
          </div>

          <div className="relative">
            <select 
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-4 font-medium appearance-none focus:ring-2 ring-success/20 outline-none"
            >
              <option>Technical Interview</option>
              <option>HR Interview</option>
              <option>Full Mock Session</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="bg-success/[0.02] border border-success/10 rounded-2xl p-8 mb-10">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-bold">Resume Analysis</h4>
            {data?.atsScore !== undefined && (
              <div className="flex flex-col items-end">
                <span className={`text-xs font-black uppercase tracking-widest ${data.atsScore > 70 ? 'text-success' : 'text-warning'}`}>
                  ATS Score: {data.atsScore}/100
                </span>
                <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                  <div 
                    className={`h-full ${data.atsScore > 70 ? 'bg-success' : 'bg-warning'}`} 
                    style={{ width: `${data.atsScore}%` }} 
                  />
                </div>
              </div>
            )}
          </div>

          {data?.atsFeedback && (
            <div className="mb-6 p-3 bg-white/50 rounded-xl border border-gray-100">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">ATS Feedback:</span>
              <p className="text-sm font-medium text-gray-700 italic">"{data.atsFeedback}"</p>
            </div>
          )}
          
          <div className="mb-6">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-3">Projects:</span>
            <ul className="space-y-1">
              {projects.length > 0 ? projects.map((p, i) => (
                <li key={i} className="text-sm font-bold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  {p}
                </li>
              )) : <li className="text-xs text-gray-400">No projects detected</li>}
            </ul>
          </div>

          <div>
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-3">Skills:</span>
            <div className="flex flex-wrap gap-2">
              {skills.length > 0 ? skills.map((s, i) => (
                <span key={i} className="px-3 py-1 bg-success/10 text-success text-[10px] font-black rounded-full">
                  {s}
                </span>
              )) : <span className="text-xs text-gray-400">No skills detected</span>}
            </div>
          </div>
        </div>

        <Button 
          onClick={() => onStart({ role, description, sessionType, agent: agents.find(a => a.id === selectedAgent) })}
          className="w-full py-5 text-lg flex items-center justify-center gap-3"
        >
          <Play className="w-5 h-5 fill-current" />
          Start Interview
        </Button>

      </div>
    </Card>
  );
};


export default InterviewSetup;
