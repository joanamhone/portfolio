import React, { useState } from 'react';
import { MessageCircle, Check, X, Trash2, Search, Filter, Calendar, User } from 'lucide-react';
import { supabase, Comment } from '../lib/supabase';
import { useToast } from './Toast';

interface CommentsManagerProps {
  comments: Comment[];
  onRefresh: () => void;
}

const CommentsManager: React.FC<CommentsManagerProps> = ({ comments, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const { showToast } = useToast();

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comment.author_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comment.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'approved' && comment.approved) ||
                         (statusFilter === 'pending' && !comment.approved);
    return matchesSearch && matchesStatus;
  });

  const approveComment = async (id: string) => {
    if (!supabase) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .update({ approved: true })
        .eq('id', id);
      
      if (error) throw error;
      showToast('success', 'Comment approved');
      onRefresh();
    } catch (error) {
      console.error('Error approving comment:', error);
      showToast('error', 'Failed to approve comment');
    }
  };

  const rejectComment = async (id: string) => {
    if (!supabase) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .update({ approved: false })
        .eq('id', id);
      
      if (error) throw error;
      showToast('success', 'Comment rejected');
      onRefresh();
    } catch (error) {
      console.error('Error rejecting comment:', error);
      showToast('error', 'Failed to reject comment');
    }
  };

  const deleteComment = async (id: string) => {
    if (!supabase || !confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      showToast('success', 'Comment deleted');
      onRefresh();
    } catch (error) {
      console.error('Error deleting comment:', error);
      showToast('error', 'Failed to delete comment');
    }
  };

  const pendingCount = comments.filter(c => !c.approved).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Comments</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage blog comments ({comments.length} total, {pendingCount} pending)
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search comments..."
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
            <option value="all">All Comments</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <MessageCircle size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Comments</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{comments.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
              <MessageCircle size={20} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <Check size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {comments.filter(c => c.approved).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredComments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No comments found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredComments.map((comment) => (
              <div key={comment.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center">
                        <User size={16} className="text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {comment.author_name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {comment.author_email}
                      </span>
                      <div className="flex items-center">
                        <Calendar size={14} className="text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        comment.approved
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {comment.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!comment.approved && (
                      <button
                        onClick={() => approveComment(comment.id)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Approve"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    {comment.approved && (
                      <button
                        onClick={() => rejectComment(comment.id)}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                        title="Reject"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsManager;