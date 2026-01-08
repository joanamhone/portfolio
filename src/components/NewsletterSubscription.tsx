import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from './Toast';

const NewsletterSubscription: React.FC = () => {
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
      // Check if already subscribed
      const { data: existing } = await supabase
        .from('subscribers')
        .select('id, active')
        .eq('email', email.trim())
        .single();

      if (existing) {
        if (existing.active) {
          showToast('info', 'You are already subscribed!');
        } else {
          // Reactivate subscription
          await supabase
            .from('subscribers')
            .update({ active: true, name: name.trim() })
            .eq('id', existing.id);
          showToast('success', 'Welcome back! Subscription reactivated.');
        }
      } else {
        // New subscription
        const { error } = await supabase
          .from('subscribers')
          .insert({
            email: email.trim(),
            name: name.trim(),
            active: true
          });

        if (error) throw error;
        showToast('success', 'Successfully subscribed to newsletter!');
      }

      setEmail('');
      setName('');
    } catch (error) {
      console.error('Subscription error:', error);
      showToast('error', 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 max-w-md">
      <div className="flex items-center mb-4">
        <Mail className="text-accent mr-2" size={20} />
        <h3 className="text-white font-semibold">Subscribe to Newsletter</h3>
      </div>
      <p className="text-white/70 text-sm mb-4">
        Get the latest blog posts and updates delivered to your inbox.
      </p>
      
      <form onSubmit={handleSubscribe} className="space-y-3">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          disabled={loading}
        />
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <CheckCircle size={16} />
              <span>Subscribe</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default NewsletterSubscription;