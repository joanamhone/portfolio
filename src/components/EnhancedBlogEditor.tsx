import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Eye, Image, X, Plus } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface BlogImage {
  id: string;
  url: string;
  alt: string;
  position: 'top' | 'middle' | 'bottom' | 'inline' | 'cursor';
}

interface EnhancedBlogEditorProps {
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  images: BlogImage[];
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onExcerptChange: (excerpt: string) => void;
  onSlugChange: (slug: string) => void;
  onImagesChange: (images: BlogImage[]) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const EnhancedBlogEditor: React.FC<EnhancedBlogEditorProps> = ({
  title,
  content,
  excerpt,
  slug,
  images,
  onTitleChange,
  onContentChange,
  onExcerptChange,
  onSlugChange,
  onImagesChange,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');
  const [newImagePosition, setNewImagePosition] = useState<BlogImage['position']>('top');
  const quillRef = useRef<ReactQuill>(null);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (newTitle: string) => {
    onTitleChange(newTitle);
    if (!isEditing) {
      onSlugChange(generateSlug(newTitle));
    }
  };

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    
    const newImage: BlogImage = {
      id: Date.now().toString(),
      url: newImageUrl,
      alt: newImageAlt || 'Blog image',
      position: newImagePosition
    };
    
    onImagesChange([...images, newImage]);
    setNewImageUrl('');
    setNewImageAlt('');
    setNewImagePosition('top');
  };

  const removeImage = (id: string) => {
    onImagesChange(images.filter(img => img.id !== id));
  };

  const updateImagePosition = (id: string, position: BlogImage['position']) => {
    onImagesChange(images.map(img => 
      img.id === id ? { ...img, position } : img
    ));
  };

  const insertImageIntoContent = (imageUrl: string) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection();
      const index = range ? range.index : quill.getLength();
      quill.insertEmbed(index, 'image', imageUrl);
      quill.setSelection(index + 1);
    }
  };



  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
  };

  const getImagesByPosition = (position: BlogImage['position']) => {
    return images.filter(img => img.position === position);
  };

  const BlogPreview = () => (
    <div className="max-w-4xl mx-auto p-6">
      {/* Top Images */}
      {getImagesByPosition('top').map(img => (
        <img key={img.id} src={img.url} alt={img.alt} className="w-full h-64 object-cover rounded-lg mb-6" />
      ))}
      
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{title}</h1>
      
      {excerpt && (
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 italic">{excerpt}</p>
      )}
      
      {/* Middle Images */}
      {getImagesByPosition('middle').map(img => (
        <img key={img.id} src={img.url} alt={img.alt} className="w-full h-64 object-cover rounded-lg my-6" />
      ))}
      
      <div 
        className="prose prose-lg max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}
      />
      
      {/* Bottom Images */}
      {getImagesByPosition('bottom').map(img => (
        <img key={img.id} src={img.url} alt={img.alt} className="w-full h-64 object-cover rounded-lg mt-6" />
      ))}
    </div>
  );

  if (showPreview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Preview</h3>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Save as Draft
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <BlogPreview />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {isEditing ? 'Edit Post' : 'Create New Post'}
        </h3>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Eye size={16} />
            <span>Preview</span>
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter post title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL Slug
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">/blog/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="url-slug"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Auto-generated from title. Edit if needed.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content
            </label>
            <div className="bg-white rounded-md" style={{ minHeight: '500px' }}>
              <style>
                {`
                  .ql-editor {
                    color: #000 !important;
                    font-size: 14px;
                    line-height: 1.6;
                  }
                  .ql-editor p, .ql-editor h1, .ql-editor h2, .ql-editor h3 {
                    color: #000 !important;
                  }
                `}
              </style>
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={onContentChange}
                modules={modules}
                style={{ minHeight: '450px' }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => onExcerptChange(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Brief description..."
            />
          </div>

          {/* Image Management */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Images
            </label>
            
            {/* Add New Image */}
            <div className="space-y-3 p-4 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Image URL"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <input
                type="text"
                value={newImageAlt}
                onChange={(e) => setNewImageAlt(e.target.value)}
                placeholder="Alt text (optional)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <select
                value={newImagePosition}
                onChange={(e) => setNewImagePosition(e.target.value as BlogImage['position'])}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="top">Top of post</option>
                <option value="middle">Middle of post</option>
                <option value="bottom">Bottom of post</option>
                <option value="inline">Insert in content</option>
                <option value="cursor">Insert at cursor</option>
              </select>
              <button
                onClick={addImage}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                <Plus size={16} />
                <span>Add Image</span>
              </button>
            </div>

            {/* Existing Images */}
            {images.length > 0 && (
              <div className="space-y-3 mt-4">
                {images.map((img) => (
                  <div key={img.id} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md">
                    <img src={img.url} alt={img.alt} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {img.alt}
                      </p>
                      <select
                        value={img.position}
                        onChange={(e) => updateImagePosition(img.id, e.target.value as BlogImage['position'])}
                        className="mt-1 text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="top">Top</option>
                        <option value="middle">Middle</option>
                        <option value="bottom">Bottom</option>
                        <option value="inline">Inline</option>
                        <option value="cursor">Cursor</option>
                      </select>
                    </div>
                    {(img.position === 'inline' || img.position === 'cursor') && (
                      <button
                        onClick={() => insertImageIntoContent(img.url)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Insert
                      </button>
                    )}
                    <button
                      onClick={() => removeImage(img.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBlogEditor;