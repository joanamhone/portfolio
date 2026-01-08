import React, { useState, useEffect } from 'react';
import { X, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from './Toast';

interface SubscriptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionPopup: React.FC<SubscriptionPopupProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !name.trim()) {
      showToast('error', 'Please fill in all fields');
      return;
    }

    if (!supabase) {
      showToast('error', 'Service unavailable');
      return;
    }

    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from('subscribers')
        .select('id, active')
        .eq('email', email.trim())
        .single();

      if (existing) {
        if (existing.active) {
          showToast('info', 'You are already subscribed!');
        } else {
          await supabase
            .from('subscribers')
            .update({ active: true, name: name.trim() })
            .eq('id', existing.id);
          showToast('success', 'Welcome back! Subscription reactivated.');
        }
      } else {
        const { error } = await supabase
          .from('subscribers')
          .insert({
            email: email.trim(),
            name: name.trim(),
            active: true
          });

        if (error) throw error;
        showToast('success', 'Successfully subscribed!');
      }

      // Mark as subscribed in localStorage to prevent future popups
      localStorage.setItem('newsletter_subscribed', 'true');
      onClose();
    } catch (error) {
      console.error('Subscription error:', error);
      showToast('error', 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Mark as dismissed for this session
    sessionStorage.setItem('popup_dismissed', 'true');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Mail className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Stay Updated!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Get the latest insights on cybersecurity and software development delivered to your inbox.
          </p>
        </div>

        <form onSubmit={handleSubscribe} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <CheckCircle size={18} />
                <span>Subscribe Now</span>
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          No spam, unsubscribe at any time.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPopup;