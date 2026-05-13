import React, { useState, useRef } from 'react';
import { Image as ImageIcon, X, Loader2, Upload } from 'lucide-react';
import { api } from '@/lib/api';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "Upload Image" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show instant preview (local)
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    // Upload to backend
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post<{ url: string }>('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const uploadedUrl = res.data.url;
      onChange(uploadedUrl);
      setPreview(uploadedUrl); // Update to cloud URL
    } catch (err: any) {
      console.error("Upload failed", err);
      alert("Failed to upload image. Please try again.");
      setPreview(value || null); // Revert on error
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-black uppercase tracking-widest text-primary/60 ml-1">
        {label}
      </label>
      
      <div className="relative group">
        {preview ? (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-white text-primary rounded-xl hover:scale-110 transition-all shadow-xl"
              >
                <Upload className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-3 bg-white text-red-500 rounded-xl hover:scale-110 transition-all shadow-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Uploading...</p>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-primary/40 group-hover:text-primary group-hover:scale-110 transition-all shadow-sm">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-500">Click to upload image</p>
              <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest">JPG, PNG or WebP</p>
            </div>
          </button>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
        />
      </div>
    </div>
  );
}
