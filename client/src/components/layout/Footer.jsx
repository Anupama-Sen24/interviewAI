import React from 'react';
import { Sparkles, Globe, Heart } from 'lucide-react';



const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-24 pb-12 px-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-16 space-y-6">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-transform">
              <Sparkles size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-gray-900">InterviewAI</span>
          </div>
          <p className="text-sm text-text-muted font-medium leading-relaxed max-w-lg">
            Empowering the next generation of professionals with cutting-edge AI interview simulations. Practice, improve, and succeed.
          </p>
          <div className="flex gap-4 justify-center">
            {[Globe, Sparkles].map((Icon, i) => (
              <a key={i} href="#" className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-all">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-gray-100 gap-6">
          <p className="text-sm text-text-muted font-bold">
            &copy; {new Date().getFullYear()} InterviewAI Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-text-muted font-bold">
            Made with <Heart size={14} className="text-error fill-current" /> by the InterviewAI Team
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
