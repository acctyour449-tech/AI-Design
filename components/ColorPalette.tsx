
import React, { useState } from 'react';
import { Color } from '../types';
import { Copy, Check, Edit2, Save, X } from 'lucide-react';

interface ColorPaletteProps {
  colors: Color[];
  onUpdate?: (colors: Color[]) => void;
}

const ColorCard: React.FC<{ color: Color; onSave: (updated: Color) => void }> = ({ color, onSave }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempColor, setTempColor] = useState(color);

  const handleCopy = () => {
    if (isEditing) return;
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSave(tempColor);
    setIsEditing(false);
  };

  return (
    <div className="group relative flex flex-col gap-2">
      <div
        className="h-24 w-full rounded-xl shadow-lg transition-transform transform group-hover:scale-105 cursor-pointer relative overflow-hidden border border-slate-700/50"
        style={{ backgroundColor: color.hex }}
        onClick={handleCopy}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm">
          {copied ? <Check className="text-white w-6 h-6" /> : <Copy className="text-white w-6 h-6" />}
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          className="absolute top-2 right-2 p-1 bg-black/40 hover:bg-black/60 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {isEditing ? (
        <div className="p-3 bg-slate-800 rounded-xl border border-indigo-500/50 space-y-2 animate-in fade-in zoom-in-95">
          <input 
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-indigo-500"
            value={tempColor.name}
            onChange={e => setTempColor({...tempColor, name: e.target.value})}
            placeholder="Name"
          />
          <input 
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white outline-none focus:border-indigo-500"
            value={tempColor.hex}
            onChange={e => setTempColor({...tempColor, hex: e.target.value})}
            placeholder="#HEX"
          />
          <textarea 
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-300 outline-none focus:border-indigo-500 resize-none h-12"
            value={tempColor.usage}
            onChange={e => setTempColor({...tempColor, usage: e.target.value})}
            placeholder="Usage"
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-grow py-1 bg-indigo-600 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1">
              <Save className="w-3 h-3" /> Save
            </button>
            <button onClick={() => setIsEditing(false)} className="px-2 bg-slate-700 text-white rounded">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-0.5 px-1">
          <div className="flex justify-between items-baseline">
            <span className="font-semibold text-white truncate text-sm">{color.name}</span>
            <span className="text-[10px] font-mono text-slate-400 opacity-75">{color.hex}</span>
          </div>
          <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">{color.usage}</p>
        </div>
      )}
    </div>
  );
};

export const ColorPalette: React.FC<ColorPaletteProps> = ({ colors, onUpdate }) => {
  const handleUpdateColor = (index: number, updatedColor: Color) => {
    if (!onUpdate) return;
    const newColors = [...colors];
    newColors[index] = updatedColor;
    onUpdate(newColors);
  };

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
        Color Identity
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {colors.map((color, index) => (
          <ColorCard key={index} color={color} onSave={(updated) => handleUpdateColor(index, updated)} />
        ))}
      </div>
    </div>
  );
};
