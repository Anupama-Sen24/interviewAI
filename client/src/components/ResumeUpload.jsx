import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../utils/api';
import Button from './ui/Button';
import Card from './ui/Card';

const ResumeUpload = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await api.post('/interview/analyze-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onAnalysisComplete(response.data);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      className="max-w-2xl mx-auto mt-12 p-10 text-center relative overflow-hidden border-none shadow-xl"
      hover={false}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
      
      <div className="mb-8">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Upload className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-3xl font-bold mb-2">Upload Your Profile</h3>
        <p className="text-text-muted font-medium">Supported format: PDF (Max 5MB)</p>
      </div>
      
      <div className="space-y-6">
        <label className="block group cursor-pointer">
          <div className="border-2 border-dashed border-gray-200 group-hover:border-primary/50 transition-all rounded-2xl p-10 bg-gray-50/50">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-3 text-success">
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-bold">{file.name}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-8 h-8 text-text-muted group-hover:text-primary transition-colors" />
                <span className="text-sm font-semibold text-text-muted">Click to select or drag and drop</span>
              </div>
            )}
          </div>
        </label>
        
        <Button 
          onClick={handleUpload}
          disabled={loading || !file}
          className={`w-full py-4 text-lg font-bold ${loading ? 'opacity-70' : ''}`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing with Neural AI...
            </>
          ) : (
            'Generate Interview Roadmap'
          )}
        </Button>
      </div>
    </Card>
  );
};

export default ResumeUpload;

