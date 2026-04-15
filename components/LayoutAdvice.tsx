
import React, { useState } from 'react';
import { LayoutTip } from '../types';
import { LayoutTemplate, Lightbulb, Edit2, Save, X } from 'lucide-react';

interface LayoutAdviceProps {
  tips: LayoutTip[];
  onUpdate?: (tips: LayoutTip[]) => void;
}

const TipItem: React.FC<{ tip: LayoutTip; onSave: (updated: LayoutTip) => void }> = ({ tip, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTip, setTempTip] = useState(tip);

  const handleSave = () => {
    onSave(tempTip);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-4 rounded-xl bg-slate-800 border border-indigo-500/50 space-y-3 animate-in fade-in zoom-in-95">
        <input 
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm font-bold text-white outline-none focus:border-indigo-500"
          value={tempTip.title}
          onChange={e => setTempTip({...tempTip, title: e.target.value})}
        />
        <textarea 
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500 resize-none h-20"
          value={tempTip.description}
          onChange={e => setTempTip({...tempTip, description: e.target.value})}
        />
        <div className="flex gap-2">
          <button onClick={handleSave} className="flex-grow py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Save className="w-3.5 h-3.5" /> Save Changes
          </button>
          <button onClick={() => setIsEditing(false)} className="px-3 bg-slate-700 text-white rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors relative">
      <div className="mt-1 flex-shrink-0">
         <div className="w-6 h-6 rounded-full bg-emerald-900/30 flex items-center justify-center">
           <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
         </div>
      </div>
      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-bold text-white">{tip.title}</h4>
          <button 
            onClick={() => setIsEditing(true)}
            className="p-1 text-slate-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit2 className="w-3 h-3" />
          </button>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">{tip.description}</p>
      </div>
    </div>
  );
};

export const LayoutAdvice: React.FC<LayoutAdviceProps> = ({ tips, onUpdate }) => {
  const handleUpdateTip = (index: number, updatedTip: LayoutTip) => {
    if (!onUpdate) return;
    const newTips = [...tips];
    newTips[index] = updatedTip;
    onUpdate(newTips);
  };

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 backdrop-blur-sm h-full">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
        UX Strategy
        <LayoutTemplate className="w-4 h-4 text-slate-500 ml-auto" />
      </h3>
      <div className="space-y-4">
        {tips.map((tip, index) => (
          <TipItem key={index} tip={tip} onSave={(updated) => handleUpdateTip(index, updated)} />
        ))}
      </div>
    </div>
  );
};
