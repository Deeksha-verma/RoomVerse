import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Upload, Check, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function UploadZone({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);
  const pollingRef = useRef(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

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
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      toast.error("Some files were not images and were ignored.");
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const pollStatus = (jobId, toastId) => {
    setIsProcessing(true);
    setProcessingStatus("Initializing KIRI Engine...");

    pollingRef.current = setInterval(async () => {
      try {
        const response = await axios.get(`http://localhost:3000/upload/status/${jobId}`);
        const { status, progress, modelUrl } = response.data;

        setUploadProgress(progress || 100);

        if (status === 'completed') {
          clearInterval(pollingRef.current);
          toast.success("3D Reconstruction Complete!", { id: toastId });

          if (onUploadComplete) {
            onUploadComplete({ modelUrl });
          }

          setProcessingStatus("Success!");
          setTimeout(() => {
            setIsUploading(false);
            setIsProcessing(false);
            setSelectedFiles([]);
            setPreviews([]);
          }, 2000);
        } else if (status === 'failed') {
          clearInterval(pollingRef.current);
          toast.error("Reconstruction failed on server.", { id: toastId });
          setIsUploading(false);
          setIsProcessing(false);
        } else {
          setProcessingStatus(`Processing: ${progress}%...`);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000); // Poll every 5 seconds
  };

  const startUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.warning("Please select some photos first.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const toastId = toast.loading("Uploading photos to server...");

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('photos', file);
    });

    try {
      const response = await axios.post('http://localhost:3000/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });

      const { jobId } = response.data;
      toast.loading("Images uploaded. AI Reconstruction started...", { id: toastId });

      // Start polling for KIRI status
      pollStatus(jobId, toastId);

    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      const errorMsg = error.response?.data?.message || error.response?.data || "Upload failed. Check your connection.";
      toast.error(errorMsg, { id: toastId });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4">
      <Card
        className={`relative border-2 border-dashed transition-all duration-300 ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
          } ${isUploading ? 'pointer-events-none opacity-60' : 'cursor-pointer hover:border-primary/50'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />

          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Upload Room Photos</h3>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Drag & drop for a 360° scan. KIRI Engine works best with 20+ photos.
          </p>
        </CardContent>
      </Card>

      <AnimatePresence>
        {previews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Selected Photos ({selectedFiles.length})
              </h4>
              {selectedFiles.length > 0 && !isUploading && (
                <Button variant="ghost" size="sm" onClick={() => { setPreviews([]); setSelectedFiles([]); }}>
                  Clear All
                </Button>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {previews.map((preview, index) => (
                <motion.div
                  key={preview}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative aspect-square rounded-lg overflow-hidden group"
                >
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  {!isUploading && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-4 bg-muted/30 p-6 rounded-2xl border border-border">
              {isUploading ? (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{isProcessing ? processingStatus : 'Uploading Photos'}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground animate-pulse">
                    {isProcessing
                      ? "KIRI Engine is solving geometry and depth maps..."
                      : "Sending high-res data to reconstruction pipeline..."}
                  </p>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full sm:w-auto self-center px-12 rounded-full font-bold text-lg shadow-lg hover:shadow-primary/20"
                  onClick={startUpload}
                >
                  Start 3D Reconstruction
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
