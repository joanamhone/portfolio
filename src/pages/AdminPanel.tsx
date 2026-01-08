import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AdminLogin from '../components/AdminLogin';
import AdminContent from '../components/AdminContent';
import { useToast } from '../components/Toast';

const AdminPanel: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    if (!supabase) {
      showToast('error', 'Service unavailable');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      showToast('success', 'Logged in successfully');
    } catch (error: any) {
      showToast('error', error.message || 'Login failed');
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    
    await supabase.auth.signOut();
    showToast('success', 'Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminContent onLogout={handleLogout} />;
};

export default AdminPanel;