import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadZone({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFiles(files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
  };

  const uploadFiles = async (files) => {
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }

    try {
      const response = await axios.post('http://localhost:3000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      // Simulate processing time
      setTimeout(() => {
        setIsUploading(false);
        if (onUploadComplete && response.data.data) {
          onUploadComplete(response.data.data);
        }
      }, 500);

    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      alert('Upload failed. Please try again.');
    }
  };

  return (
    <div className="upload-container">
      <motion.div
        className={`upload-box ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden-input"
          ref={fileInputRef}
          onChange={handleFileSelect}
        />

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="upload-content"
            >
              <Loader2 className="spinner-icon" />
              <div className="progress-bar-container">
                <motion.div
                  className="progress-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p>
                {uploadProgress < 100 ? 'Uploading images...' : 'Generating 3D model on server...'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="upload-content"
            >
              <div className="icon-circle">
                <Upload className="upload-icon" />
              </div>
              <h3>Upload Room Photos</h3>
              <p>Drag & drop photos here, or click to select files from your computer.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isUploading && uploadProgress === 100 && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="processing-popup glass-panel"
          >
            <Loader2 className="spinner-icon-small" />
            <div>
              <h4>Generating 3D Model</h4>
              <p>Please wait, this may take a moment...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
