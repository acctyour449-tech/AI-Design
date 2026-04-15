
import React, { useState } from 'react';
import { TypographySuggestion } from '../types';
import { Type as TypeIcon, ExternalLink, Edit2, Save, X } from 'lucide-react';

interface TypographyCardProps {
  typography: TypographySuggestion[];
  onUpdate?: (typography: TypographySuggestion[]) => void;
}

const FontRow: React.FC<{ font: TypographySuggestion; onSave: (updated: TypographySuggestion) => void }> = ({ font, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempFont, setTempFont] = useState(font);
  const googleFontsUrl = `https://fonts.google.com/specimen/${font.family.replace(/\s+/g, '+')}`;

  const handleSave = () => {
    onSave(tempFont);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-4 rounded-xl bg-slate-800 border border-indigo-500/50 space-y-3 animate-in fade-in zoom-in-95">
        <div className="grid grid-cols-2 gap-3">
           <div className="space-y-1">
             <label className="text-[10px] text-slate-500 uppercase font-bold">Family</label>
             <input 
               className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
               value={tempFont.family}
               onChange={e => setTempFont({...tempFont, family: e.target.value})}
             />
           </div>
           <div className="space-y-1">
             <label className="text-[10px] text-slate-500 uppercase font-bold">Usage</label>
             <select 
               className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
               value={tempFont.usage}
               onChange={e => setTempFont({...tempFont, usage: e.target.value as any})}
             >
               <option>Heading</option>
               <option>Body</option>
               <option>Accent</option>
             </select>
           </div>
        </div>
        <div className="space-y-1">
           <label className="text-[10px] text-slate-500 uppercase font-bold">Description</label>
           <textarea 
             className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500 resize-none h-16"
             value={tempFont.description}
             onChange={e => setTempFont({...tempFont, description: e.target.value})}
           />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} className="flex-grow py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5">
            <Save className="w-3.5 h-3.5" /> Apply Changes
          </button>
          <button onClick={() => setIsEditing(false)} className="px-3 bg-slate-700 text-white rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/30 transition-all relative">
      <div className="flex justify-between items-start mb-2">
        <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-900/50 text-indigo-300 border border-indigo-500/20">
          {font.usage}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500 font-bold uppercase">{font.type}</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsEditing(true)}
              className="text-slate-500 hover:text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <a 
              href={googleFontsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-indigo-400 p-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
      <div className="mb-2">
        <p className="text-xl text-white font-medium" style={{ fontFamily: font.type === 'Serif' ? 'serif' : font.type === 'Monospace' ? 'monospace' : 'sans-serif' }}>
          {font.family}
        </p>
        <p className="text-2xl text-white/90 truncate py-1" style={{ fontFamily: font.type === 'Serif' ? 'serif' : font.type === 'Monospace' ? 'monospace' : 'sans-serif' }}>
          The quick brown fox
        </p>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed italic">"{font.description}"</p>
    </div>
  );
};

export const TypographyCard: React.FC<TypographyCardProps> = ({ typography, onUpdate }) => {
  const handleUpdateFont = (index: number, updatedFont: TypographySuggestion) => {
    if (!onUpdate) return;
    const newTypography = [...typography];
    newTypography[index] = updatedFont;
    onUpdate(newTypography);
  };

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <div className="w-2 h-6 bg-pink-500 rounded-full"></div>
        Typography
        <TypeIcon className="w-4 h-4 text-slate-500 ml-auto" />
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {typography.map((font, index) => (
          <FontRow key={index} font={font} onSave={(updated) => handleUpdateFont(index, updated)} />
        ))}
      </div>
    </div>
  );
};
