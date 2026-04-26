import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, History, LogOut, Trash2, Calendar,
  Award, Sparkles, Layout, ChevronRight
} from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900 pt-24">

      <div className="max-w-7xl mx-auto py-12 px-8">
        <div className="grid lg:grid-cols-12 gap-10">

          {/* LEFT SECTION */}
          <div className="lg:col-span-8 space-y-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black tracking-tight dark:text-white">
                  Welcome back!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Start a new AI-powered interview simulation.
                </p>
              </div>

              <Button
                onClick={() =>
                  window.scrollTo({ top: 500, behavior: 'smooth' })
                }
                className="!px-8 shadow-xl shadow-primary/20"
              >
                <Plus size={20} />
                Start New Session
              </Button>
            </div>

            {/* Resume Upload */}
            <div className="relative group">
              <ResumeUpload onAnalysisComplete={handleComplete} />
            </div>

            {/* Stats */}
            {history.length > 0 && (
              <div className="grid sm:grid-cols-3 gap-6 mt-12">

                <Card className="p-8 bg-white dark:bg-gray-800 shadow-xl">
                  <div className="mb-4 text-green-500">
                    <Award size={24} />
                  </div>
                  <h4 className="text-3xl font-black dark:text-white">
                    {history[0].evaluation?.overallScore || '0.0'}
                  </h4>
                  <p className="text-xs text-gray-500">Latest Score</p>
                </Card>

                <Card className="p-8 bg-white dark:bg-gray-800 shadow-xl">
                  <div className="mb-4 text-blue-500">
                    <History size={24} />
                  </div>
                  <h4 className="text-3xl font-black dark:text-white">
                    {history.length}
                  </h4>
                  <p className="text-xs text-gray-500">Total Sessions</p>
                </Card>

                <Card className="p-8 bg-white dark:bg-gray-800 shadow-xl">
                  <div className="mb-4 text-purple-500">
                    <Layout size={24} />
                  </div>
                  <h4 className="text-3xl font-black dark:text-white">
                    Top 5%
                  </h4>
                  <p className="text-xs text-gray-500">Global Rank</p>
                </Card>

              </div>
            )}
          </div>

          {/* RIGHT SECTION */}
          <div className="lg:col-span-4">
            <Card className="p-8 bg-white dark:bg-gray-800 shadow-2xl h-full">

              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black flex items-center gap-2 dark:text-white">
                  <History size={20} />
                  Recent Activity
                </h3>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Sparkles size={40} />
                  </motion.div>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  No sessions yet
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">

                  {history.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => handleSelectHistory(item)}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-gray-600 transition"
                    >
                      <p className="text-xs text-gray-500">
                        {new Date(item.date).toDateString()}
                      </p>

                      <h4 className="font-bold dark:text-white">
                        Mock Interview
                      </h4>

                      <div className="flex justify-between mt-2 text-xs">
                        <span>
                          Score: {item.evaluation?.overallScore || 'N/A'}
                        </span>

                        <button
                          onClick={(e) => handleDelete(item._id, e)}
                          className="text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                </div>
              )}

            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;