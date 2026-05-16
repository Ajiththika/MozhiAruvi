import React, { useState, useRef } from 'react';
import { Video as VideoIcon, X, Loader2, Upload } from 'lucide-react';
import { api } from '@/lib/api';

interface VideoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export function VideoUpload({ value, onChange, label = "Upload Video" }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      alert("Video file size must be less than 20MB.");
      return;
    }

    // Show instant preview (local)
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    // Upload to backend
    setUploading(true);
    const formData = new FormData();
    formData.append('video', file);

    try {
      const res = await api.post<{ success: boolean; url: string; message?: string }>('/upload/video', formData);
      
      if (!res.data.success) {
        throw new Error(res.data.message || 'Upload failed');
      }

      const uploadedUrl = res.data.url;
      onChange(uploadedUrl);
      setPreview(uploadedUrl); // Update to cloud URL
    } catch (err: any) {
      console.error("Upload failed", err);
      alert("Failed to upload video. Please try again.");
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
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-slate-100 bg-black">
            <video 
              src={preview} 
              controls
              className="w-full h-full object-contain"
            />
            
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white text-primary rounded-xl hover:scale-110 transition-all shadow-xl"
                title="Replace Video"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-white text-red-500 rounded-xl hover:scale-110 transition-all shadow-xl"
                title="Remove Video"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploading && (
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-10">
                 <Loader2 className="w-8 h-8 animate-spin text-white" />
                 <p className="text-[10px] font-black text-white uppercase tracking-widest">Uploading...</p>
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
              <VideoIcon className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-500">Click to upload video</p>
              <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest">MP4 or WebM (Max 20MB)</p>
            </div>
          </button>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/mp4,video/webm"
          className="hidden"
        />
      </div>
    </div>
  );
}
