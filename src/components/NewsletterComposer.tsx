import React, { useState } from 'react';
import { Send, Eye, Save, Mail, Users } from 'lucide-react';
import { supabase, Subscriber } from '../lib/supabase';
import { useToast } from './Toast';
import { createUnsubscribeToken } from '../lib/jwt';

interface NewsletterComposerProps {
  subscribers: Subscriber[];
}

const NewsletterComposer: React.FC<NewsletterComposerProps> = ({ subscribers }) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<any[]>([]);
  const { showToast } = useToast();

  const activeSubscribers = subscribers.filter(sub => sub.active);

  const saveDraft = () => {
    if (!subject.trim() && !content.trim()) {
      showToast('error', 'Nothing to save');
      return;
    }

    const draft = {
      id: Date.now(),
      subject: subject || 'Untitled Newsletter',
      content,
      savedAt: new Date().toISOString()
    };

    const drafts = JSON.parse(localStorage.getItem('newsletter_drafts') || '[]');
    drafts.unshift(draft);
    localStorage.setItem('newsletter_drafts', JSON.stringify(drafts.slice(0, 10))); // Keep only 10 drafts
    setSavedDrafts(drafts);
    showToast('success', 'Draft saved');
  };

  const loadDraft = (draft: any) => {
    setSubject(draft.subject);
    setContent(draft.content);
    showToast('success', 'Draft loaded');
  };

  const sendNewsletter = async () => {
    if (!subject.trim() || !content.trim()) {
      showToast('error', 'Please fill in subject and content');
      return;
    }

    if (activeSubscribers.length === 0) {
      showToast('error', 'No active subscribers to send to');
      return;
    }

    setSending(true);
    console.log('🚀 Starting newsletter send...');
    console.log('📧 Subject:', subject);
    console.log('👥 Recipients:', activeSubscribers.length);
    console.log('📝 Content preview:', content.substring(0, 100) + '...');
    
    try {
      // Generate secure unsubscribe tokens for each subscriber
      const emailsWithTokens = activeSubscribers.map(subscriber => ({
        ...subscriber,
        unsubscribeToken: createUnsubscribeToken(subscriber.id, subscriber.email)
      }));
      
      console.log('🔐 Generated tokens for subscribers:', emailsWithTokens.length);
      console.log('📤 Sending actual emails...');
      
      // Call Vercel API route
      const response = await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: subject,
          content: content,
          subscribers: emailsWithTokens.map(sub => ({
            email: sub.email,
            name: sub.name,
            unsubscribeUrl: `${window.location.origin}/unsubscribe/${sub.unsubscribeToken}`
          }))
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      console.log('✅ Newsletter sent successfully!');
      console.log('📊 Response:', data);
      console.log('📈 Sent to:', data?.sent || activeSubscribers.length, 'subscribers');
      
      showToast('success', `Newsletter sent to ${activeSubscribers.length} subscribers`);
      setSubject('');
      setContent('');
      setPreviewMode(false);
    } catch (error) {
      console.error('❌ Newsletter send failed:', error);
      showToast('error', 'Failed to send newsletter: ' + (error as Error).message);
    } finally {
      setSending(false);
      console.log('🏁 Newsletter send process completed');
    }
  };

  React.useEffect(() => {
    const drafts = JSON.parse(localStorage.getItem('newsletter_drafts') || '[]');
    setSavedDrafts(drafts);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Newsletter Composer</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and send newsletters to {activeSubscribers.length} active subscribers
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={saveDraft}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Save size={16} />
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            <Eye size={16} />
            <span>{previewMode ? 'Edit' : 'Preview'}</span>
          </button>
          <button
            onClick={sendNewsletter}
            disabled={sending || !subject.trim() || !content.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md text-sm font-medium transition-colors"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send size={16} />
            )}
            <span>{sending ? 'Sending...' : 'Send Newsletter'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-4">
          {!previewMode ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter newsletter subject..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Newsletter Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Write your newsletter content here..."
                />
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {subject || 'Newsletter Subject'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  From: Your Blog • To: {activeSubscribers.length} subscribers
                </p>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                {content ? (
                  <div className="whitespace-pre-wrap text-gray-900 dark:text-white">
                    {content}
                    <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                      <p>You're receiving this because you subscribed to our newsletter.</p>
                      <p>Don't want these emails? <a href={`${window.location.origin}/unsubscribe/[secure-token]`} className="text-blue-600 hover:underline">Unsubscribe here</a></p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    Newsletter content will appear here...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Audience</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users size={16} className="text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Subscribers</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {activeSubscribers.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail size={16} className="text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Will Receive</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {activeSubscribers.length}
                </span>
              </div>
            </div>
          </div>

          {/* Saved Drafts */}
          {savedDrafts.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Drafts</h3>
              <div className="space-y-2">
                {savedDrafts.slice(0, 5).map((draft) => (
                  <button
                    key={draft.id}
                    onClick={() => loadDraft(draft)}
                    className="w-full text-left p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {draft.subject}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(draft.savedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
              Newsletter Tips
            </h3>
            <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Keep subject lines under 50 characters</li>
              <li>• Include a clear call-to-action</li>
              <li>• Preview before sending</li>
              <li>• Save drafts frequently</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterComposer;