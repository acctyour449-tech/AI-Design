
import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Maximize2, Layers, X, ChevronLeft, ChevronRight, ZoomIn, Download, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { VisualConcept } from '../types';
import { editConceptImage } from '../services/geminiService';

interface GeneratedVisualProps {
  imageUrls: string[];
  isLoading: boolean;
  concepts: VisualConcept[];
  onUpdateImage?: (index: number, newUrl: string) => void;
}

export const GeneratedVisual: React.FC<GeneratedVisualProps> = ({ imageUrls, isLoading, concepts, onUpdateImage }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const displayCount = Math.max(concepts?.length || 1, imageUrls.length || 1);

  useEffect(() => setIsZoomed(false), [selectedIndex]);

  const navigate = (direction: number) => {
    if (selectedIndex === null) return;
    let newIndex = (selectedIndex + direction + imageUrls.length) % imageUrls.length;
    setSelectedIndex(newIndex);
  };

  const handleDownload = (url: string, title: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-concept.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAIEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex === null || !editPrompt.trim() || !imageUrls[editingIndex]) return;

    setIsEditing(true);
    try {
      const newUrl = await editConceptImage(imageUrls[editingIndex], editPrompt);
      if (newUrl && onUpdateImage) {
        onUpdateImage(editingIndex, newUrl);
        setEditingIndex(null);
        setEditPrompt('');
      }
    } catch (error) {
      console.error("AI Edit failed:", error);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <>
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-1 backdrop-blur-sm overflow-hidden h-full flex flex-col">
        <div className={`grid gap-1 h-full ${
          displayCount === 1 ? 'grid-cols-1' : displayCount === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {Array.from({ length: displayCount }).map((_, index) => {
            const url = imageUrls[index];
            const concept = concepts?.[index];
            
            return (
              <div 
                key={index} 
                className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-800 group"
              >
                {isLoading && !url ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-[10px] uppercase tracking-widest font-bold">Rendering...</p>
                  </div>
                ) : url ? (
                  <>
                    <img src={url} alt={concept?.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <h4 className="text-white font-bold text-sm truncate mb-1">{concept?.title}</h4>
                      <p className="text-white/60 text-[10px] line-clamp-1 mb-3">{concept?.description}</p>
                      
                      <div className="flex gap-2">
                         <button onClick={() => setSelectedIndex(index)} className="flex-grow py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5">
                           <Maximize2 className="w-3 h-3" /> View
                         </button>
                         <button 
                            onClick={() => setEditingIndex(index)} 
                            className="flex-grow py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                          >
                           <Wand2 className="w-3 h-3" /> Edit AI
                         </button>
                         <button 
                            onClick={(e) => { e.stopPropagation(); handleDownload(url, concept?.title || 'design'); }} 
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                          >
                           <Download className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-700">
                    <ImageIcon className="w-8 h-8 opacity-20" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {imageUrls.length > 0 && (
          <div className="px-4 py-2 flex justify-between items-center bg-slate-900/30 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
             <div className="flex items-center gap-2 text-indigo-400">
               <Sparkles className="w-3 h-3" /> {imageUrls.length} AI Mockups
             </div>
             <span>Gemini 2.5 Flash</span>
          </div>
        )}
      </div>

      {/* Edit Modal Overlay */}
      {editingIndex !== null && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl">
             <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-xs">
                  <Wand2 className="w-4 h-4" /> Edit Mockup with AI
                </div>
                <button onClick={() => setEditingIndex(null)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
             </div>
             
             <div className="aspect-video w-full rounded-lg overflow-hidden mb-6 bg-slate-800 border border-slate-700">
                <img src={imageUrls[editingIndex]} className="w-full h-full object-cover opacity-50" alt="Editing source" />
             </div>

             <form onSubmit={handleAIEdit} className="space-y-4">
                <p className="text-xs text-slate-400">Describe the changes you want to make to this specific concept:</p>
                <input 
                  autoFocus
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="e.g., Change theme to dark mode, use rounded corners, add a login form..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  disabled={isEditing}
                />
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setEditingIndex(null)}
                    className="flex-grow py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all"
                    disabled={isEditing}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!editPrompt.trim() || isEditing}
                    className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {isEditing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Sparkles className="w-4 h-4" /> Apply AI Edits</>}
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {selectedIndex !== null && imageUrls[selectedIndex] && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300">
          <div className="absolute top-4 right-4 flex gap-3">
            <button 
              onClick={() => handleDownload(imageUrls[selectedIndex!], concepts[selectedIndex!]?.title || 'design')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-bold flex items-center gap-2"
            >
              <Download className="w-3 h-3" />
              Download Slide
            </button>
            <button onClick={() => setSelectedIndex(null)} className="p-2 text-white/50 hover:text-white"><X className="w-8 h-8" /></button>
          </div>
          {imageUrls.length > 1 && (
            <>
              <button onClick={() => navigate(-1)} className="absolute left-4 p-4 text-white/30 hover:text-white"><ChevronLeft className="w-10 h-10" /></button>
              <button onClick={() => navigate(1)} className="absolute right-4 p-4 text-white/30 hover:text-white"><ChevronRight className="w-10 h-10" /></button>
            </>
          )}
          <div className={`relative ${isZoomed ? 'overflow-auto cursor-zoom-out' : 'p-12 cursor-zoom-in'}`} onClick={() => setIsZoomed(!isZoomed)}>
             <img src={imageUrls[selectedIndex]} alt="Expanded" className={`${isZoomed ? 'max-w-none' : 'max-h-[80vh] max-w-full rounded-2xl shadow-2xl'}`} />
             {!isZoomed && (
               <div className="mt-6 text-center max-w-xl mx-auto">
                 <h3 className="text-xl font-bold text-white mb-1">{concepts[selectedIndex].title}</h3>
                 <p className="text-slate-400 text-sm">{concepts[selectedIndex].description}</p>
               </div>
             )}
          </div>
        </div>
      )}
    </>
  );
};
