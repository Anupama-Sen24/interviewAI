import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mic, BarChart3, Shield, Rocket, ArrowRight, Play, CheckCircle, Globe } from 'lucide-react';
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

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-24 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
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
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleStart} className="!px-10 !py-5 text-lg shadow-2xl shadow-primary/30">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            
            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm hover:scale-110 hover:z-10 transition-transform cursor-pointer">
                    <img src={`/user_avatar_${i}.png`} alt={`Student ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-text-muted">
                Join <span className="text-gray-900 font-black">10,000+</span> students preparing daily
              </p>
            </div>
          </motion.div>

          {/* Hero Image/Card */}
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
                  <div className="w-2 h-2 bg-success rounded-full animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Sarah AI is Online</span>
                </div>
                <h3 className="text-3xl font-black">Ready to practice?</h3>
                <p className="text-white/60 font-medium italic">"I'll help you perfect your responses."</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: 'Interviews Hosted', val: '50k+' },
            { label: 'Success Rate', val: '94%' },
            { label: 'Expert Models', val: '12' },
            { label: 'Global Rank', val: '#1' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <h4 className="text-4xl font-black text-gray-900 mb-1">{stat.val}</h4>
              <p className="text-xs font-black text-text-muted uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-8">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl font-black tracking-tight mb-6"
          >
            Engineered for Excellence
          </motion.h2>
          <p className="text-xl text-text-muted font-medium max-w-2xl mx-auto">Our platform combines behavioral psychology with cutting-edge AI to simulate the world's toughest interview rooms.</p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          {[
            { icon: <Mic className="text-primary" />, title: "Smart Voice Analysis", desc: "Speak naturally. Our AI analyzes your tone, clarity, and keyword usage in real-time." },
            { icon: <BarChart3 className="text-secondary" />, title: "Detailed Analytics", desc: "Get a comprehensive breakdown of your confidence, communication, and correctness." },
            { icon: <Shield className="text-accent" />, title: "Persona-Based Mocks", desc: "Practice with different interviewer personalities, from friendly HRs to tough tech leads." },
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card 
                className="p-10 border-none bg-white shadow-xl hover:shadow-2xl transition-all group cursor-pointer" 
                hover={true}
                onClick={() => navigate('/dashboard')}
              >
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {React.cloneElement(feat.icon, { size: 32 })}
                </div>
                <h3 className="text-2xl font-black mb-4">{feat.title}</h3>
                <p className="text-text-muted font-medium leading-relaxed mb-6">{feat.desc}</p>
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                  Try it now <ArrowRight size={14} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-24 px-8">
        <div className="max-w-7xl mx-auto relative overflow-hidden bg-gray-900 rounded-[4rem] p-16 text-center">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <Globe size={800} className="text-white absolute -top-40 -left-40" />
          </div>
          <div className="relative z-10">
            <h2 className="text-5xl font-black text-white mb-8 tracking-tight">Stop Guessing. Start Succeeding.</h2>
            <p className="text-white/60 text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of professionals who used InterviewAI to land roles at Google, Meta, and Amazon. Your dream career is one session away.
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
