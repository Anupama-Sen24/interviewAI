import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mic, BarChart3, Shield, Rocket, ArrowRight, Globe } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

const Home = () => {
  const navigate = useNavigate();

  const handleStart = async () => {
    if (auth.currentUser) {
      navigate('/dashboard');
    } else {
      try {
        await signInWithPopup(auth, googleProvider);
        navigate('/dashboard');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const avatars = [
    "https://randomuser.me/api/portraits/women/1.jpg",
    "https://randomuser.me/api/portraits/men/2.jpg",
    "https://randomuser.me/api/portraits/women/3.jpg",
    "https://randomuser.me/api/portraits/men/4.jpg",
  ];

  return (
    <div className="pt-20">

      {/* Hero Section */}
      <section className="relative py-24 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-primary/20">
              <Sparkles size={14} />
              Next-Gen AI Interviewing
            </div>

            <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8">
              Master Your <span className="text-primary italic">Career</span> with Sarah AI.
            </h1>

            <p className="text-xl text-text-muted font-medium mb-10 max-w-xl leading-relaxed">
              Experience the world's most advanced AI interview simulator. Get real-time feedback, detailed analytics, and the confidence to land your dream job.
            </p>

            <Button onClick={handleStart} className="!px-10 !py-5 text-lg shadow-2xl shadow-primary/30">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            {/* 🔥 AVATAR SECTION (FIXED) */}
            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">

                {avatars.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="user"
                    className="w-10 h-10 rounded-full border-2 border-white object-cover transition-transform duration-300 hover:scale-110"
                  />
                ))}

                {/* Extra users */}
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-xs font-bold border-2 border-white">
                  +10
                </div>

              </div>

              <p className="text-sm font-bold text-text-muted">
                Join <span className="text-gray-900 font-black">10,000+</span> students preparing daily
              </p>
            </div>

          </motion.div>

          {/* RIGHT SIDE IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary rounded-[3rem] blur-2xl opacity-20 animate-pulse" />

            <Card className="relative p-0 overflow-hidden border-none shadow-2xl rounded-[3rem]" hover={false}>
              <img
                src="/ai_interviewer_female.png"
                alt="AI Interviewer"
                className="w-full aspect-[4/5] object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

              <div className="absolute bottom-10 left-10 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                    Sarah AI is Online
                  </span>
                </div>

                <h3 className="text-3xl font-black">Ready to practice?</h3>
                <p className="text-white/60 font-medium italic">
                  "I'll help you perfect your responses."
                </p>
              </div>
            </Card>
          </motion.div>

        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-8">
        <div className="max-w-7xl mx-auto relative overflow-hidden bg-gray-900 rounded-[4rem] p-16 text-center">

          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <Globe size={800} className="text-white absolute -top-40 -left-40" />
          </div>

          <div className="relative z-10">
            <h2 className="text-5xl font-black text-white mb-8 tracking-tight">
              Stop Guessing. Start Succeeding.
            </h2>

            <p className="text-white/60 text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of professionals who used InterviewAI to land roles at Google, Meta, and Amazon.
            </p>

            <Button onClick={handleStart} className="!px-12 !py-6 text-xl shadow-2xl shadow-primary/50">
              Launch Dashboard Now
              <Rocket className="ml-2 w-6 h-6" />
            </Button>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;