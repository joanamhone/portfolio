import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Mail } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string) => void;
}

const AdminLogin: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    
    setLoading(true);
    await onLogin(email.trim(), password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
            <Lock size={24} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Admin Access</h1>
          <p className="text-white/70 mt-2">Enter password to access admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email"
              className="w-full pl-10 pr-4 py-3 bg-secondary border border-white/20 rounded-lg input-focus"
              required
            />
          </div>
          
          <div className="relative">
            <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-12 py-3 bg-secondary border border-white/20 rounded-lg input-focus"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Access Admin Panel'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;