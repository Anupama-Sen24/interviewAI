import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import api from './utils/api';

import { setQuestions, setExtractedData, setEvaluation, setSetupData } from './redux/slices/interviewSlice';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './components/InterviewSetup';
import MockInterview from './components/MockInterview';
import PerformanceReport from './components/PerformanceReport';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MeshBackground from './components/ui/MeshBackground';

function App() {
  const [user, setUser] = React.useState(null);
  const dispatch = useDispatch();
  const { questions, setupData, evaluation } = useSelector((state) => state.interview);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleInterviewComplete = async (answers, navigate) => {
    try {
      const response = await api.post('/interview/evaluate-answers', { 
        answers,
        setupData
      });
      const evalData = response.data.evaluation;
      dispatch(setEvaluation(evalData));
      navigate('/report');
    } catch (error) {
      console.error('Evaluation failed:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  const handleAnalysisComplete = (data) => {
    dispatch(setQuestions(data.questions));
    dispatch(setExtractedData(data.extractedData));
  };

  return (
    <Router>
      <div className="min-h-screen relative text-text overflow-x-hidden flex flex-col">
        <MeshBackground />
        <Navbar user={user} />

        <main className="flex-grow relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard onAnalysisComplete={handleAnalysisComplete} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/setup" 
              element={<SetupWrapper />} 
            />
            <Route 
              path="/interview" 
              element={<InterviewWrapper onComplete={handleInterviewComplete} />} 
            />
            <Route 
              path="/report" 
              element={<ReportWrapper />} 
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

// Wrappers for cleaner routing
const SetupWrapper = () => {
  const { questions } = useSelector((state) => state.interview);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!questions) return <Navigate to="/dashboard" />;

  return (
    <div className="pt-32 pb-20">
      <InterviewSetup 
        data={useSelector(state => state.interview.extractedData)} 
        onStart={(data) => {
          dispatch(setSetupData(data));
          navigate('/interview');
        }} 
      />
    </div>
  );
};

const InterviewWrapper = ({ onComplete }) => {
  const { questions, setupData } = useSelector((state) => state.interview);
  const navigate = useNavigate();

  if (!questions) return <Navigate to="/dashboard" />;

  return (
    <div className="pt-32 pb-20">
      <MockInterview 
        questions={questions} 
        setupData={setupData} 
        onComplete={(answers) => onComplete(answers, navigate)} 
      />
    </div>
  );
};

const ReportWrapper = () => {
  const { evaluation } = useSelector((state) => state.interview);
  if (!evaluation) return <Navigate to="/dashboard" />;
  
  return (
    <div className="pt-32 pb-20">
      <PerformanceReport report={evaluation} />
    </div>
  );
};

export default App;
