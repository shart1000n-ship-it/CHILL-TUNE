import React, { useState, useRef } from 'react';

interface MediaUploadProps {
  onUpload: (file: File, type: 'photo' | 'video', caption?: string) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
  className?: string;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ 
  onUpload, 
  onCancel, 
  isOpen, 
  className = '' 
}) => {
  const [uploadType, setUploadType] = useState<'photo' | 'video'>('photo');
  const [uploadCaption, setUploadCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await onUpload(file, uploadType, uploadCaption);
      setUploadCaption('');
      setUploadType('photo');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      const type = file.type.startsWith('image/') ? 'photo' : 'video';
      
      setIsUploading(true);
      try {
        await onUpload(file, type, uploadCaption);
        setUploadCaption('');
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFileSelect = () => {
    if (uploadType === 'photo') {
      fileInputRef.current?.click();
    } else {
      videoInputRef.current?.click();
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
      <div className="card max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold text-white mb-6">📸 Upload Media</h3>
        
        <div className="space-y-4">
          {/* Upload Type Selection */}
          <div className="flex space-x-2">
            <button
              onClick={() => setUploadType('photo')}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                uploadType === 'photo'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              📸 Photo
            </button>
            <button
              onClick={() => setUploadType('video')}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                uploadType === 'video'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              🎥 Video
            </button>
          </div>

          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-purple-400 bg-purple-500/20' 
                : 'border-white/20 hover:border-white/40'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-4xl mb-4">
              {uploadType === 'photo' ? '📸' : '🎥'}
            </div>
            <p className="text-white/80 mb-2">
              Drag & drop your {uploadType === 'photo' ? 'photo' : 'video'} here
            </p>
            <p className="text-white/60 text-sm">or</p>
            <button
              onClick={handleFileSelect}
              className="btn-primary mt-3"
              disabled={isUploading}
            >
              Browse Files
            </button>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Caption Input */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Caption (optional)
            </label>
            <textarea
              value={uploadCaption}
              onChange={(e) => setUploadCaption(e.target.value)}
              placeholder="Add a caption..."
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 btn-secondary"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              onClick={handleFileSelect}
              className="flex-1 btn-primary"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
              <p className="text-white/60 text-sm">Uploading your {uploadType}...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaUpload;
