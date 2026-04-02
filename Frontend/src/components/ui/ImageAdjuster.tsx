"use client";

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';
import Button from './Button';
import { X, ZoomIn, ZoomOut, Check, SlidersHorizontal, Trash2 } from 'lucide-react';

interface ImageAdjusterProps {
  image: string;
  aspect?: number;
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export default function ImageAdjuster({ image, aspect = 1, onConfirm, onCancel }: ImageAdjusterProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    try {
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
      onConfirm(croppedBlob);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <SlidersHorizontal size={20} />
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Adjust Identity Photo</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop and position your image perfectly</p>
             </div>
          </div>
          <button onClick={onCancel} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Adjuster Area */}
        <div className="relative flex-1 bg-slate-50 border-b border-slate-100">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            classes={{
                containerClassName: 'bg-slate-50',
                mediaClassName: 'shadow-2xl rounded-lg',
                cropAreaClassName: 'shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] rounded-2xl border-4 border-white'
            }}
          />
        </div>

        {/* Footer / Controls */}
        <div className="p-8 space-y-8 bg-white">
          <div className="flex flex-col sm:flex-row items-center gap-8 justify-between">
            <div className="w-full flex-1 space-y-4">
               <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Precision Zoom</p>
                  <span className="text-xs font-black text-primary bg-primary/5 px-2 py-1 rounded-lg">{(zoom * 100).toFixed(0)}%</span>
               </div>
               <div className="flex items-center gap-4">
                  <ZoomOut size={16} className="text-slate-400" />
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e: any) => setZoom(e.target.value)}
                    className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <ZoomIn size={16} className="text-slate-400" />
               </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
               <button 
                  onClick={onCancel} 
                  className="flex-1 sm:flex-none px-8 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
               >
                  <Trash2 size={14} /> Discard
               </button>
               <Button 
                onClick={handleConfirm} 
                variant="primary" 
                size="xl" 
                className="flex-1 sm:flex-none rounded-2xl px-12 shadow-xl shadow-primary/20"
               >
                  <Check size={18} className="mr-2" /> Finalize Adjustment
               </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}



