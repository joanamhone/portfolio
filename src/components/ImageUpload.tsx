import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (url: string) => void;
  currentImage?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, currentImage, className = '' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    
    try {
      // Convert to base64 for demo purposes
      // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageSelect(result);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
      setUploading(false);
    }
  };

  const removeImage = () => {
    onImageSelect('');
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Featured Image
      </label>
      
      {currentImage ? (
        <div className="relative">
          <img
            src={currentImage}
            alt="Featured"
            className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          
          <div className="space-y-2">
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            ) : (
              <ImageIcon size={32} className="mx-auto text-gray-400" />
            )}
            
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {uploading ? 'Uploading...' : 'Drop an image here, or click to select'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-2">
        <input
          type="url"
          placeholder="Or paste image URL"
          onChange={(e) => onImageSelect(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

export default ImageUpload;