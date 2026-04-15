
import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { ColorPalette } from './components/ColorPalette';
import { TypographyCard } from './components/TypographyCard';
import { LayoutAdvice } from './components/LayoutAdvice';
import { GeneratedVisual } from './components/GeneratedVisual';
import { generateDesignSystem, generateConceptImages } from './services/geminiService';
import { DesignState, DesignSystem } from './types';
import { Layers, AlertCircle, RefreshCw, Lock, Unlock, Save } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<DesignState>({
    isLoading: false,
    error: null,
    data: null,
    generatedImageUrls: [],
  });
  const [isThemeLocked, setIsThemeLocked] = useState(false);
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);
  const inputSectionRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (prompt: string, attachment?: { mimeType: string; data: string }, sketch?: string, reuseTheme?: boolean) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, generatedImageUrls: [] }));
    setHasUnsavedEdits(false);

    try {
      const baseTheme = (reuseTheme && state.data) ? {
        colors: state.data.colors,
        typography: state.data.typography
      } : undefined;

      const designData = await generateDesignSystem(prompt, attachment, sketch, baseTheme);
      
      setState(prev => ({ ...prev, data: designData }));

      try {
         const imageUrls = await generateConceptImages(designData.visualConcepts);
         setState(prev => ({ ...prev, isLoading: false, generatedImageUrls: imageUrls }));
      } catch (imgError: any) {
         console.error("Image generation partial failure:", imgError);
         let imgErrorMessage = "The design system was created successfully, but images could not be rendered.";
         
         if (imgError.message?.includes("SAFETY")) {
           imgErrorMessage = "Design created, but images were blocked by safety filters.";
         } else if (imgError.message?.includes("429")) {
           imgErrorMessage = "Design created, but image generation is currently rate-limited. Try again in a minute.";
         }

         setState(prev => ({ ...prev, isLoading: false, error: imgErrorMessage }));
      }

    } catch (error: any) {
      console.error("Critical Generation Error:", error);
      let errorMessage = "We encountered an error generating your design. Please try again.";
      
      if (error.message?.includes("429")) {
        errorMessage = "Too many requests. Please wait a few seconds before trying again.";
      } else if (error.message?.includes("SAFETY")) {
        errorMessage = "Your request was flagged by our safety filters. Please try rephrasing your prompt.";
      } else if (error.message?.includes("API key")) {
        errorMessage = "Invalid API configuration. Please check your credentials.";
      } else if (!navigator.onLine) {
        errorMessage = "Network error. Please check your internet connection.";
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
    }
  };

  const updateDesignData = (newData: Partial<DesignSystem>) => {
    if (!state.data) return;
    setState(prev => ({
      ...prev,
      data: prev.data ? { ...prev.data, ...newData } : null
    }));
    setHasUnsavedEdits(true);
  };

  const updateImageUrl = (index: number, newUrl: string) => {
    const newUrls = [...state.generatedImageUrls];
    newUrls[index] = newUrl;
    setState(prev => ({ ...prev, generatedImageUrls: newUrls }));
    setHasUnsavedEdits(true);
  };

  const handleRemixClick = () => {
    setIsThemeLocked(true);
    inputSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div ref={inputSectionRef}>
          <InputSection 
            onGenerate={handleGenerate} 
            isGenerating={state.isLoading} 
            hasPreviousData={!!state.data}
            isThemeLocked={isThemeLocked}
            onToggleThemeLock={() => setIsThemeLocked(!isThemeLocked)}
            accentColor={state.data?.colors[0]?.hex}
          />
        </div>

        {state.error && (
          <div className="max-w-3xl mx-auto mb-8 p-5 bg-red-950/30 border border-red-800/50 rounded-2xl flex items-start gap-4 text-red-200 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
               <h3 className="font-bold text-red-400 mb-1">Generation Issue</h3>
               <p className="text-sm opacity-90 leading-relaxed">{state.error}</p>
               {state.data && (
                 <p className="text-xs mt-3 text-slate-400 italic">Review the layout, colors, and typography below.</p>
               )}
            </div>
            <button 
              onClick={() => setState(s => ({ ...s, error: null }))}
              className="text-red-400 hover:text-white transition-colors p-1"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}

        {state.data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{state.data.themeName}</h2>
                  {isThemeLocked && (
                    <div className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Identity Locked
                    </div>
                  )}
                  {hasUnsavedEdits && (
                    <div className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Save className="w-2.5 h-2.5" /> Edits Saved
                    </div>
                  )}
                </div>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto md:mx-0 italic">"{state.data.vibeDescription}"</p>
              </div>
              
              <button
                onClick={handleRemixClick}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                <RefreshCw className="w-4 h-4" />
                Lock & Remix Theme
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 min-h-[400px]">
                 <GeneratedVisual 
                   imageUrls={state.generatedImageUrls} 
                   isLoading={state.isLoading && state.generatedImageUrls.length === 0}
                   concepts={state.data.visualConcepts}
                   onUpdateImage={updateImageUrl}
                 />
              </div>
              <div className="lg:col-span-1">
                <LayoutAdvice 
                  tips={state.data.layoutTips} 
                  onUpdate={(tips) => updateDesignData({ layoutTips: tips })} 
                />
              </div>
            </div>

            <ColorPalette 
              colors={state.data.colors} 
              onUpdate={(colors) => updateDesignData({ colors })} 
            />
            <TypographyCard 
              typography={state.data.typography} 
              onUpdate={(typography) => updateDesignData({ typography })} 
            />
          </div>
        )}
        
        {!state.data && !state.isLoading && (
           <div className="mt-20 flex flex-col items-center justify-center text-slate-700">
              <Layers className="w-24 h-24 mb-4 opacity-10" />
              <p className="text-lg font-medium tracking-tight">Visualize your vision with interactive AI concepts.</p>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;
