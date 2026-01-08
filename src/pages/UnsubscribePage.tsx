import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { verifyUnsubscribeToken } from '../lib/jwt';

const UnsubscribePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const handleUnsubscribe = async () => {
      if (!token) {
        setStatus('invalid');
        return;
      }

      try {
        // Decode the token in case it's URL encoded
        const decodedToken = decodeURIComponent(token);
        
        // Verify the JWT token
        const decoded = verifyUnsubscribeToken(decodedToken);
        if (!decoded || !decoded.email) {
          setStatus('invalid');
          return;
        }

        setEmail(decoded.email);

        // Update subscriber status in database - anonymize the data
        if (supabase) {
          const { error } = await supabase
            .from('subscribers')
            .update({ 
              active: false,
              email: `unsubscribed_${Date.now()}@deleted.local`,
              name: 'Unsubscribed User'
            })
            .eq('id', decoded.subscriberId)
            .eq('email', decoded.email);

          if (error) {
            console.error('Unsubscribe error:', error);
            setStatus('error');
          } else {
            setStatus('success');
          }
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        setStatus('invalid');
      }
    };

    handleUnsubscribe();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white mb-2">Processing...</h2>
            <p className="text-gray-400">Please wait while we unsubscribe you.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Successfully Unsubscribed</h2>
            <p className="text-gray-400 mb-4">
              {email} has been removed from our newsletter.
            </p>
            <p className="text-sm text-gray-500">
              You will no longer receive emails from us. We're sorry to see you go!
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Unsubscribe Failed</h2>
            <p className="text-gray-400 mb-4">
              We encountered an error while processing your request.
            </p>
            <p className="text-sm text-gray-500">
              Please try again later or contact support.
            </p>
          </>
        )}

        {status === 'invalid' && (
          <>
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Invalid Link</h2>
            <p className="text-gray-400 mb-4">
              This unsubscribe link is invalid or has expired.
            </p>
            <p className="text-sm text-gray-500">
              Please use the unsubscribe link from a recent email.
            </p>
          </>
        )}

        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            Return to Blog
          </a>
        </div>
      </div>
    </div>
  );
};

export default UnsubscribePage;