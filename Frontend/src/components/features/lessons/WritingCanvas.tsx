import React, { useRef, useState, useEffect } from "react";
import { Eraser, Check, Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface WritingCanvasProps {
  onResult: (passed: boolean) => void;
  expectedText?: string;
  isCorrect?: boolean;
}

export function WritingCanvas({ onResult, expectedText, isCorrect }: WritingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#1f2937"; // text-slate-800
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setHasDrawn(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get coordinates relative to canvas
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  const submitDrawing = () => {
    // Basic implementation: if they drew something, we accept it.
    // Real implementation would pass canvas dataUrl to backend vision API.
    if (hasDrawn) {
        onResult(true);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-8 animate-in fade-in duration-500">
      <div className="relative border-[12px] border-slate-100 rounded-[3rem] bg-white shadow-2xl overflow-hidden flex items-center justify-center ring-4 ring-slate-50">
         {/* Whiteboard Label */}
         <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 pointer-events-none select-none">
            Whiteboard Canvas
         </div>

         {/* Background Guide / Expected Text Hint */}
         {expectedText && (
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                <span className="text-[180px] font-black text-primary">{expectedText}</span>
            </div>
         )}
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="touch-none cursor-crosshair relative z-10"
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onMouseMove={draw}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
        />
        {isCorrect && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20 backdrop-blur-sm">
            <div className="h-24 w-24 bg-emerald-500 rounded-full flex items-center justify-center animate-bounce shadow-2xl border-4 border-white">
               <Check className="h-12 w-12 text-white" />
            </div>
          </div>
        )}
      </div>

      {!isCorrect && (
          <div className="flex gap-6">
            <Button onClick={clearCanvas} variant="outline" size="xl" className="rounded-2xl shadow-sm border-2 border-slate-100 font-black uppercase tracking-widest text-[10px] h-16 w-32" aria-label="Clear Canvas">
                <Eraser className="w-5 h-5 mr-3" /> Clear
            </Button>
            <Button onClick={submitDrawing} disabled={!hasDrawn} size="xl" className="rounded-2xl shadow-xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-[10px] h-16 w-60">
                <Paintbrush className="w-5 h-5 mr-3" /> Analyze Drawing
            </Button>
          </div>
      )}
    </div>
  );
}



