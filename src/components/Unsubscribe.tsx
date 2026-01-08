import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { verifyUnsubscribeToken } from '../lib/jwt';

const Unsubscribe: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscriber, setSubscriber] = useState<any>(null);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setError('Invalid unsubscribe link');
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    if (!supabase || !token) {
      setError('Service unavailable');
      setLoading(false);
      return;
    }

    try {
      const tokenData = verifyUnsubscribeToken(token);
      
      if (!tokenData) {
        setError('Invalid or expired unsubscribe link');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('id', tokenData.subscriberId)
        .eq('email', tokenData.email)
        .single();

      if (error || !data) {
        setError('Subscriber not found');
      } else {
        setSubscriber(data);
      }
    } catch (err) {
      setError('Failed to verify unsubscribe link');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!supabase || !subscriber) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('subscribers')
        .update({ active: false })
        .eq('id', subscriber.id);

      if (error) throw error;
      setUnsubscribed(true);
    } catch (err) {
      setError('Failed to unsubscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center">
          {error ? (
            <>
              <XCircle size={64} className="mx-auto text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Error
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error}
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Go Home
              </button>
            </>
          ) : unsubscribed ? (
            <>
              <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Successfully Unsubscribed
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You have been removed from our newsletter. We're sorry to see you go!
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Return to Blog
              </button>
            </>
          ) : (
            <>
              <Mail size={64} className="mx-auto text-blue-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Unsubscribe from Newsletter
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Are you sure you want to unsubscribe?
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                Email: {subscriber?.email}
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleUnsubscribe}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Yes, Unsubscribe
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unsubscribe;