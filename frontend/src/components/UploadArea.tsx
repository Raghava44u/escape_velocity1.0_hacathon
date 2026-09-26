import { useState, useRef } from 'react';
import { UploadCloud, File, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

interface Props {
  onUploadSuccess: (id: string) => void;
}

export default function UploadArea({ onUploadSuccess }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await axios.post('http://localhost:8000/api/v1/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUploadSuccess(res.data.document_id);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed');
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className={`relative group rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out p-12 text-center
          ${dragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-white/5'}
          ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input 
          ref={inputRef} 
          type="file" 
          className="hidden" 
          accept=".pdf,.png,.jpg,.jpeg" 
          onChange={handleChange}
        />
        
        <div className="flex flex-col items-center justify-center gap-4">
          {uploading ? (
             <Loader2 className="w-12 h-12 text-primary animate-spin" />
          ) : (
            <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="w-10 h-10" />
            </div>
          )}
          
          <div>
            <p className="text-xl font-semibold mb-2">
              {uploading ? 'Uploading Document...' : 'Drag & Drop Document'}
            </p>
            <p className="text-muted-foreground text-sm">
              Supports PDF, PNG, JPG up to 10MB
            </p>
          </div>
          
          {!uploading && (
            <button className="mt-4 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              Browse Files
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-center gap-3 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
