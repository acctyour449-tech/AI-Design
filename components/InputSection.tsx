
import React, { useState, useRef } from 'react';
import { ArrowRight, Wand2, Layout, Smartphone, Monitor, Briefcase, Paperclip, X, FileText, Minus, Plus, PenTool, Type, Lock, Unlock } from 'lucide-react';
import { Blankboard } from './Blankboard';
import { Color } from '../types';

interface InputSectionProps {
  onGenerate: (prompt: string, attachment?: { mimeType: string; data: string }, sketch?: string, reuseTheme?: boolean) => void;
  isGenerating: boolean;
  hasPreviousData: boolean;
  isThemeLocked: boolean;
  onToggleThemeLock: () => void;
  accentColor?: string;
}

type DesignType = 'web' | 'mobile' | 'presentation' | 'brand' | 'sketch';

const DESIGN_TYPES: { id: DesignType; label: string; icon: React.ElementType }[] = [
  { id: 'web', label: 'Web Design', icon: Layout },
  { id: 'mobile', label: 'Mobile App', icon: Smartphone },
  { id: 'presentation', label: 'Presentation', icon: Monitor },
  { id: 'brand', label: 'Brand Identity', icon: Briefcase },
  { id: 'sketch', label: 'Blankboard', icon: PenTool },
];

export const InputSection: React.FC<InputSectionProps> = ({ 
  onGenerate, 
  isGenerating, 
  hasPreviousData, 
  isThemeLocked, 
  onToggleThemeLock,
  accentColor 
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState<DesignType>('web');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sketchData, setSketchData] = useState<string>('');
  const [slideCount, setSlideCount] = useState(4);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        alert('Please upload a valid PDF file.');
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const incrementSlides = () => setSlideCount(prev => Math.min(prev + 1, 10));
  const decrementSlides = () => setSlideCount(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() || selectedFile || (selectedType === 'sketch' && sketchData)) {
      const typeLabel = DESIGN_TYPES.find(t => t.id === selectedType)?.label;
      let finalPrompt = `Type: ${typeLabel}. Context: ${prompt}`;
      
      if (selectedType === 'presentation') {
        finalPrompt += ` Generate exactly ${slideCount} distinct slides for this presentation.`;
      }

      if (selectedType === 'sketch') {
        finalPrompt += ` The attached sketch is the primary wireframe concept. Please interpret its structure.`;
      }
      
      let attachment = undefined;
      if (selectedFile) {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
        
        attachment = {
          mimeType: 'application/pdf',
          data: base64Data
        };
      }

      onGenerate(finalPrompt, attachment, selectedType === 'sketch' ? sketchData : undefined, isThemeLocked);
    }
  };

  const getPlaceholder = () => {
    if (selectedType === 'sketch') return "Optional notes about your sketch...";
    switch(selectedType) {
      case 'presentation': return "e.g., Pitch deck for a fintech startup...";
      case 'mobile': return "e.g., Fitness tracking app for runners...";
      case 'brand': return "e.g., Modern coffee shop visual identity...";
      default: return "e.g., A minimalist meditation app with calming nature tones...";
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 mb-16 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
          Visualize Your <span className="text-indigo-500">Next Idea</span>
        </h1>
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg text-slate-400">
            {selectedType === 'sketch' 
              ? "Draw your rough wireframe and let AI transform it into a professional design."
              : "Describe your project, upload a PDF, or sketch a wireframe."}
          </p>
          
          {hasPreviousData && (
            <button
              onClick={onToggleThemeLock}
              className={`mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                isThemeLocked 
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {isThemeLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              {isThemeLocked ? 'Theme Locked (Reusing colors & fonts)' : 'Lock Current Theme for next generation'}
              {isThemeLocked && accentColor && (
                <div className="w-2.5 h-2.5 rounded-full ml-1 border border-white/20" style={{ backgroundColor: accentColor }} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Design Type Selector */}
      <div className="flex flex-wrap justify-center gap-3 mb-8 items-center">
        {DESIGN_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {type.label}
            </button>
          );
        })}

        {/* Slide Counter for Presentation */}
        {selectedType === 'presentation' && (
          <div className="flex items-center gap-1 bg-slate-800/80 rounded-full px-2 py-1.5 border border-slate-700 animate-in fade-in slide-in-from-left-4 duration-300 ml-1">
            <span className="text-xs text-slate-400 px-1 font-medium">Slides</span>
            <button 
              type="button" 
              onClick={decrementSlides} 
              className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-sm font-mono w-4 text-center text-white font-bold">{slideCount}</span>
            <button 
              type="button" 
              onClick={incrementSlides} 
              className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {selectedType === 'sketch' ? (
          <Blankboard onCapture={setSketchData} isGenerating={isGenerating} />
        ) : (
          <div className="relative group">
            {/* File Preview */}
            {selectedFile && (
              <div className="absolute -top-12 left-0 flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700 px-3 py-1.5 rounded-lg text-sm text-slate-300 animate-in fade-in slide-in-from-bottom-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="max-w-[200px] truncate">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={removeFile}
                  className="ml-2 p-0.5 hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className={`absolute -inset-0.5 bg-gradient-to-r ${isThemeLocked ? 'from-indigo-600 to-indigo-400' : 'from-indigo-500 to-purple-600'} rounded-xl opacity-75 group-hover:opacity-100 transition duration-200 blur`}></div>
            <div className="relative flex items-center bg-slate-900 rounded-xl p-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Attach PDF brief"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
              />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={getPlaceholder()}
                className="flex-grow bg-transparent text-white placeholder-slate-500 px-4 py-3 focus:outline-none text-lg"
                disabled={isGenerating}
              />
            </div>
          </div>
        )}

        {/* Notes for sketch mode or general text input */}
        {selectedType === 'sketch' && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
             <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
               <Type className="w-3 h-3" />
               Additional Context (Optional)
             </div>
             <textarea
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder="Describe features, target audience, or branding preferences..."
               className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-600 resize-none h-20"
               disabled={isGenerating}
             />
          </div>
        )}

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            disabled={(!prompt.trim() && !selectedFile && !sketchData) || isGenerating}
            className={`group relative flex items-center gap-3 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 ${
              (!prompt.trim() && !selectedFile && !sketchData) || isGenerating
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)]'
            }`}
          >
            {isGenerating ? (
              <>
                <Wand2 className="w-6 h-6 animate-spin" />
                <span>Designing...</span>
              </>
            ) : (
              <>
                <span>{isThemeLocked ? 'Remix with Locked Theme' : 'Generate Complete Design'}</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const Plus = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
