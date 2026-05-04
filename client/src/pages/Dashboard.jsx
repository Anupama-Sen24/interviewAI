import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, History, LogOut, Trash2, Calendar, Award, User, Sparkles, Layout, ChevronRight, Play } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import api from '../utils/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ResumeUpload from '../components/ResumeUpload';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ onAnalysisComplete }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/interview/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleSelectHistory = (interview) => {
    onAnalysisComplete({
      questions: interview.questions,
      evaluation: interview.evaluation
    });
    navigate('/report');
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this session?")) {
      try {
        await api.delete(`/interview/${id}`);
        setHistory(history.filter(item => item._id !== id));
      } catch (err) {
        alert("Failed to delete interview");
      }
    }
  };

  const handleComplete = (data) => {
    onAnalysisComplete(data);
    navigate('/setup');
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
              <Sparkles size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter">InterviewAI</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">
                {auth.currentUser?.email?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-bold hidden sm:inline">{auth.currentUser?.displayName || 'Candidate'}</span>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-error/5 text-error rounded-xl transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-12 px-8">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Main Actions */}
          <div className="lg:col-span-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black tracking-tight">Welcome back!</h1>
                <p className="text-text-muted mt-2 font-medium">Start a new AI-powered interview simulation.</p>
              </div>
              <Button onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })} className="!px-8 shadow-xl shadow-primary/20">
                <Plus size={20} />
                Start New Session
              </Button>
            </div>

            {/* Resume Upload Section */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200" />
              <ResumeUpload onAnalysisComplete={handleComplete} />
            </div>

            {/* Performance Analytics Snapshot */}
            {history.length > 0 && (
              <div className="grid sm:grid-cols-3 gap-6 mt-12">
                <Card className="p-8 bg-white border-none shadow-xl" hover={true}>
                  <div className="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center text-success mb-4">
                    <Award size={24} />
                  </div>
                  <h4 className="text-3xl font-black">{history[0].evaluation?.overallScore || '0.0'}</h4>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Latest Score</p>
                </Card>
                <Card className="p-8 bg-white border-none shadow-xl" hover={true}>
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                    <History size={24} />
                  </div>
                  <h4 className="text-3xl font-black">{history.length}</h4>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Total Sessions</p>
                </Card>
                <Card className="p-8 bg-white border-none shadow-xl" hover={true}>
                  <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-4">
                    <Layout size={24} />
                  </div>
                  <h4 className="text-3xl font-black">Top 5%</h4>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Global Rank</p>
                </Card>
              </div>
            )}
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-4">
            <Card className="p-8 h-full bg-white border-none shadow-2xl flex flex-col" hover={false}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <History className="text-primary" size={20} />
                  Recent Activity
                </h3>
                {history.length > 0 && <span className="px-3 py-1 bg-gray-50 rounded-full text-[10px] font-black">{history.length} ITEMS</span>}
              </div>

              {loading ? (
                <div className="flex-grow flex items-center justify-center py-20">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-primary">
                    <Sparkles size={40} />
                  </motion.div>
                </div>
              ) : history.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center py-20 space-y-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                    <Calendar size={32} />
                  </div>
                  <p className="text-sm font-bold text-text-muted">No sessions yet.<br/>Upload your resume to begin!</p>
                </div>
              ) : (
                <div className="space-y-4 flex-grow overflow-y-auto pr-2 max-h-[700px] scrollbar-thin">
                  {history.map((item, idx) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => handleSelectHistory(item)}
                      className="group p-5 bg-gray-50/50 hover:bg-white rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-xl transition-all cursor-pointer relative"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => handleDelete(item._id, e)} className="p-1.5 hover:bg-error/10 text-error rounded-lg transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors flex items-center gap-2">
                        Mock Interview Session
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </h4>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1 text-[10px] font-black text-success uppercase">
                          <Award size={12} />
                          SCORE: {item.evaluation?.overallScore || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase">
                          <Plus size={12} />
                          {item.questions?.length || 0} QS
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                  <h5 className="text-xs font-black text-primary uppercase tracking-widest mb-1">AI Pro Tip</h5>
                  <p className="text-[11px] font-bold text-gray-600 leading-relaxed italic">"Consistent practice with our AI improves confidence scores by up to 40%."</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
