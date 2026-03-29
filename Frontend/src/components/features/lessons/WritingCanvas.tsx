import React, { useRef, useState, useEffect } from "react";
import { Eraser, Check } from "lucide-react";
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
        ctx.strokeStyle = "#1f2937"; // text-gray-800
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
    <div className="w-full flex flex-col items-center gap-4 animate-in fade-in duration-500">
      <div className="relative border-4 border-gray-200 rounded-3xl bg-white shadow-inner overflow-hidden flex items-center justify-center dark:border-gray-700">
         {/* Background Guide / Expected Text Hint (Optional) */}
         {expectedText && (
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                <span className="text-[150px] font-black">{expectedText}</span>
            </div>
         )}
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
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
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-20">
            <div className="h-16 w-16 bg-success rounded-full flex items-center justify-center animate-bounce shadow-xl">
               <Check className="h-8 w-8 text-white" />
            </div>
          </div>
        )}
      </div>

      {!isCorrect && (
          <div className="flex gap-4">
            <Button onClick={clearCanvas} variant="outline" className="rounded-full shadow-sm" aria-label="Clear Canvas">
                <Eraser className="w-5 h-5 mr-2" /> Clear
            </Button>
            <Button onClick={submitDrawing} disabled={!hasDrawn} className="rounded-full shadow-md bg-secondary hover:bg-secondary/90">
                <Check className="w-5 h-5 mr-2" /> Submit Drawing
            </Button>
          </div>
      )}
    </div>
  );
}
