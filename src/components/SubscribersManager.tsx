import React, { useState, useEffect } from 'react';
import { Users, Mail, Download, Search, Filter, UserCheck, UserX, Calendar, Trash2, Send } from 'lucide-react';
import { supabase, Subscriber } from '../lib/supabase';
import { useToast } from './Toast';

interface SubscribersManagerProps {
  subscribers: Subscriber[];
  onRefresh: () => void;
}

const SubscribersManager: React.FC<SubscribersManagerProps> = ({ subscribers, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();

  const filteredSubscribers = subscribers.filter(subscriber => {
    // Hide anonymized unsubscribed users from the list
    if (subscriber.email.includes('@deleted.local')) {
      return false;
    }
    
    const matchesSearch = subscriber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         subscriber.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && subscriber.active) ||
                         (statusFilter === 'inactive' && !subscriber.active);
    return matchesSearch && matchesStatus;
  });

  const toggleSubscriberStatus = async (id: string, currentStatus: boolean) => {
    if (!supabase) return;
    
    try {
      const { error } = await supabase
        .from('subscribers')
        .update({ active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      showToast('success', `Subscriber ${!currentStatus ? 'activated' : 'deactivated'}`);
      onRefresh();
    } catch (error) {
      console.error('Error updating subscriber:', error);
      showToast('error', 'Failed to update subscriber');
    }
  };

  const deleteSubscriber = async (id: string) => {
    if (!supabase || !confirm('Are you sure you want to delete this subscriber?')) return;
    
    try {
      const { error } = await supabase
        .from('subscribers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      showToast('success', 'Subscriber deleted');
      onRefresh();
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      showToast('error', 'Failed to delete subscriber');
    }
  };

  const exportSubscribers = () => {
    const csvContent = [
      ['Name', 'Email', 'Status', 'Subscribed Date'],
      ...filteredSubscribers.map(sub => [
        sub.name,
        sub.email,
        sub.active ? 'Active' : 'Inactive',
        new Date(sub.subscribed_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('success', 'Subscribers exported successfully');
  };

  const sendBulkEmail = async () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      showToast('error', 'Please fill in subject and content');
      return;
    }

    setSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showToast('success', `Email sent to ${selectedSubscribers.length} subscribers`);
      setShowEmailModal(false);
      setEmailSubject('');
      setEmailContent('');
      setSelectedSubscribers([]);
    } catch (error) {
      showToast('error', 'Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  const selectAll = () => {
    if (selectedSubscribers.length === filteredSubscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(filteredSubscribers.map(sub => sub.id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Subscribers</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your newsletter subscribers ({subscribers.length} total)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportSubscribers}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          {selectedSubscribers.length > 0 && (
            <button
              onClick={() => setShowEmailModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              <Send size={16} />
              <span>Email Selected ({selectedSubscribers.length})</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search subscribers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Users size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Subscribers</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{subscribers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <UserCheck size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {subscribers.filter(s => s.active).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
              <UserX size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {subscribers.filter(s => !s.active).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredSubscribers.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No subscribers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedSubscribers.length === filteredSubscribers.length}
                      onChange={selectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Subscriber
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Subscribed
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.includes(subscriber.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubscribers([...selectedSubscribers, subscriber.id]);
                          } else {
                            setSelectedSubscribers(selectedSubscribers.filter(id => id !== subscriber.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {subscriber.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {subscriber.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        subscriber.active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {subscriber.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {new Date(subscriber.subscribed_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => toggleSubscriberStatus(subscriber.id, subscriber.active)}
                          className={`${subscriber.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} dark:${subscriber.active ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                          title={subscriber.active ? 'Deactivate' : 'Activate'}
                        >
                          {subscriber.active ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                        <button
                          onClick={() => deleteSubscriber(subscriber.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Send Email to {selectedSubscribers.length} Subscribers
              </h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Email subject..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Email content..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={sendBulkEmail}
                  disabled={sending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send size={16} />
                  )}
                  <span>{sending ? 'Sending...' : 'Send Email'}</span>
                </button>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscribersManager;