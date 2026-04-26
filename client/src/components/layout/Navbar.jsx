import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Sparkles } from 'lucide-react';
import { auth, googleProvider } from '../../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import FeaturesModal from '../ui/FeaturesModal';

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);

  const handleSignIn = async () => {
    try {
      if (user) {
        navigate('/dashboard');
      } else {
        await signInWithPopup(auth, googleProvider);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Auth Error:', error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white/70 backdrop-blur-xl border-b border-gray-100 z-[100] px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
              <Sparkles size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter">InterviewAI</span>
          </motion.div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-10">
            <Link to="/" className="text-sm font-bold text-gray-500 hover:text-primary">
              Home
            </Link>
            <Link to="/dashboard" className="text-sm font-bold text-gray-500 hover:text-primary">
              Dashboard
            </Link>
            <button
              onClick={() => setIsFeaturesOpen(true)}
              className="text-sm font-bold text-gray-500 hover:text-primary"
            >
              Features
            </button>
          </div>

          {/* User Section (NO SIGN IN BUTTON) */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">

                  {/* Avatar */}
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.displayName
                      ? user.displayName.charAt(0).toUpperCase()
                      : user.email?.charAt(0).toUpperCase()}
                  </div>

                  {/* Name */}
                  <span className="text-sm font-bold hidden sm:inline">
                    {user.displayName || 'User'}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </>
            )}
          </div>

        </div>
      </nav>

      <FeaturesModal
        isOpen={isFeaturesOpen}
        onClose={() => setIsFeaturesOpen(false)}
      />
    </>
  );
};

export default Navbar;