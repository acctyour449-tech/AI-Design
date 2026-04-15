
import React, { useRef, useState, useEffect } from 'react';
import { Trash2, Eraser, PenTool, Undo2, Redo2, Circle, Square, Minus } from 'lucide-react';

interface BlankboardProps {
  onCapture: (dataUrl: string) => void;
  isGenerating: boolean;
}

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
  isEraser: boolean;
}

export const Blankboard: React.FC<BlankboardProps> = ({ onCapture, isGenerating }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#6366f1'); // Indigo 500
  const [width, setWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on container
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 400; // Fixed height for consistency
        redraw();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const redraw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    [...history].forEach(stroke => {
      ctx.beginPath();
      ctx.strokeStyle = stroke.isEraser ? '#0f172a' : stroke.color;
      ctx.lineWidth = stroke.width;
      stroke.points.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });
  };

  useEffect(() => {
    redraw();
    // Export whenever history changes to keep the parent updated
    if (history.length > 0) {
      onCapture(canvasRef.current!.toDataURL('image/jpeg', 0.8));
    } else {
      onCapture('');
    }
  }, [history]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isGenerating) return;
    setIsDrawing(true);
    const coords = getCoordinates(e);
    setCurrentStroke([coords]);
    setRedoStack([]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isGenerating) return;
    const coords = getCoordinates(e);
    const newPoints = [...currentStroke, coords];
    setCurrentStroke(newPoints);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.strokeStyle = isEraser ? '#0f172a' : color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(currentStroke[currentStroke.length - 1].x, currentStroke[currentStroke.length - 1].y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke.length > 0) {
      setHistory([...history, { points: currentStroke, color, width, isEraser }]);
    }
    setCurrentStroke([]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setRedoStack([last, ...redoStack]);
    setHistory(history.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory([...history, next]);
    setRedoStack(redoStack.slice(1));
  };

  const clear = () => {
    setHistory([]);
    setRedoStack([]);
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-t-xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEraser(false)}
            className={`p-2 rounded-lg transition-colors ${!isEraser ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <PenTool className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setIsEraser(true)}
            className={`p-2 rounded-lg transition-colors ${isEraser ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Eraser className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-slate-800 mx-1"></div>
          <div className="flex items-center gap-1.5">
            {['#6366f1', '#ec4899', '#10b981', '#ffffff'].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => { setColor(c); setIsEraser(false); }}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c && !isEraser ? 'border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg px-2 py-1">
             <span className="text-[10px] text-slate-500 font-bold uppercase mr-1">Size</span>
             <button type="button" onClick={() => setWidth(Math.max(1, width - 1))} className="p-1 text-slate-400 hover:text-white"><Minus className="w-3 h-3" /></button>
             <span className="text-xs font-mono w-4 text-center">{width}</span>
             <button type="button" onClick={() => setWidth(Math.min(10, width + 1))} className="p-1 text-slate-400 hover:text-white"><Plus className="w-3 h-3" /></button>
          </div>
          <div className="h-6 w-px bg-slate-800 mx-1"></div>
          <button type="button" onClick={undo} disabled={history.length === 0} className="p-2 text-slate-400 hover:text-white disabled:opacity-30"><Undo2 className="w-4 h-4" /></button>
          <button type="button" onClick={redo} disabled={redoStack.length === 0} className="p-2 text-slate-400 hover:text-white disabled:opacity-30"><Redo2 className="w-4 h-4" /></button>
          <button type="button" onClick={clear} className="p-2 text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative bg-slate-950 border-x border-b border-slate-800 rounded-b-xl overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full touch-none"
        />
        {history.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-600">
             <PenTool className="w-12 h-12 mb-2 opacity-10" />
             <p className="text-sm">Sketch your concept here (wireframes, notes, layout)</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Plus = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
