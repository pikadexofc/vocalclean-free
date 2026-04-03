import React, { useState, useRef } from 'react';
import { 
  Settings, 
  ChevronRight, 
  Play,
  Activity,
  MessageSquare,
  ArrowRight,
  Plus,
  Coffee,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { SpatialCard } from './ui/SpatialCard';
import { SessionFile } from '../types';
import { HistoryItem } from '../utils/storage';

interface HomeViewProps {
  onUpload: (files: SessionFile[], customPrompt: string) => void;
  onSettings: () => void;
  onRecentClick: (item: HistoryItem) => void;
  history: HistoryItem[];
}

export function HomeView({ onUpload, onSettings, onRecentClick, history }: HomeViewProps) {
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerUpload = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      
      // Check file sizes
      const MAX_SIZE = 25 * 1024 * 1024; // 25MB
      const oversizedFiles = fileList.filter(f => f.size > MAX_SIZE);
      if (oversizedFiles.length > 0) {
        alert(`Some files are too large (>25MB): ${oversizedFiles.map(f => f.name).join(', ')}. Please use smaller files for optimal processing.`);
        return;
      }

      const processedFiles = await Promise.all(fileList.map(file => {
        return new Promise<SessionFile>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve({ name: file.name, data: { base64, mimeType: file.type } });
          };
          reader.readAsDataURL(file);
        });
      }));
      onUpload(processedFiles, customPrompt);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return 'Today';
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full p-4 relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="audio/*,video/*"
        multiple
      />

      <header className="flex justify-between items-center mb-4 pt-2 stagger-1">
        <div>
          <h1 className="text-xl font-display font-semibold tracking-tight text-white flex items-center gap-2.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            VocalClean
            <div className="relative">
              <span className="relative z-10 px-2 py-0.5 rounded border border-white/20 text-[8px] tracking-widest text-white uppercase font-accent font-medium glass-panel-3d shadow-lg bg-gradient-to-r from-blue-600/40 to-purple-600/40">Pro</span>
            </div>
          </h1>
        </div>
        <button onClick={onSettings} className="w-9 h-9 rounded-full btn-tactile flex items-center justify-center group relative overflow-hidden cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Settings className="w-4.5 h-4.5 text-neutral-300 group-hover:rotate-45 group-hover:text-white transition-all duration-500 ease-out relative z-10" strokeWidth={1.5} />
        </button>
      </header>

      <div className="stagger-2">
        <SpatialCard className="mb-4" padding="p-4">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_8px_16px_rgba(0,0,0,0.6)] border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/5" />
                <Activity className="w-5 h-5 text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)] relative z-10" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-white font-display font-semibold text-base drop-shadow-md">System Status</h2>
                <p className="text-[12px] font-accent text-neutral-400 font-light mt-0.5">Gemini 2 Flash • Online</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-end justify-between relative z-10">
            <div>
              <p className="text-[12px] font-accent text-neutral-500 font-light mb-0.5 drop-shadow-sm">Processed Audio</p>
              <h3 className="text-5xl font-display font-semibold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                {history.filter(h => h.status === 'completed').length}<span className="text-3xl text-neutral-500 font-medium ml-0.5"> files</span>
              </h3>
            </div>
            <div className="relative overflow-hidden border border-green-500/30 bg-gradient-to-b from-green-500/10 to-green-900/30 text-green-400/90 text-[10px] px-3 py-1 rounded-full font-accent font-medium tracking-wide shadow-[0_4px_12px_rgba(0,255,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.1)]">
              Ready
            </div>
          </div>
        </SpatialCard>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 no-scrollbar stagger-3 relative">
        <h3 className="text-[11px] font-accent font-medium tracking-widest text-neutral-500 uppercase mb-3 px-2 drop-shadow-sm">Recent Activity</h3>
        <div className="space-y-2 px-1 pb-1">
          {history.length === 0 ? (
            <div className="p-6 text-center glass-recessed rounded-2xl border border-white/5">
              <p className="text-neutral-600 font-body text-xs">No recent activity yet.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id} 
                onClick={() => onRecentClick(item)}
                className={`group p-3 rounded-[1.15rem] btn-tactile flex items-center justify-between cursor-pointer ${item.status === 'failed' ? 'border-red-500/20 bg-red-500/5' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_4px_8px_rgba(0,0,0,0.4)] group-active:scale-95 duration-200 ${item.status === 'failed' ? 'bg-red-500/20 border border-red-500/30' : 'bg-gradient-to-b from-white/10 to-white/5 border border-white/10'}`}>
                    {item.status === 'failed' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-red-400" strokeWidth={2} />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-white/80 ml-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" strokeWidth={2} fill="currentColor" />
                    )}
                  </div>
                  <div>
                    <p className={`text-[14px] font-display font-medium mb-0.5 line-clamp-1 transition-colors ${item.status === 'failed' ? 'text-red-300' : 'text-neutral-300 group-hover:text-white'}`}>{item.auto_title || item.fileName}</p>
                    <div className="flex items-center gap-2 text-[11px] font-accent text-neutral-500 font-light">
                      <span>{formatDate(item.timestamp)}</span>
                      <span className="w-1 h-1 rounded-full bg-neutral-700 shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]" />
                      <span>{item.status === 'failed' ? 'Failed' : 'Completed'}</span>
                    </div>
                  </div>
                </div>
                {item.status === 'failed' ? (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRecentClick(item);
                    }}
                    className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                    title="Retry"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-red-400" strokeWidth={2} />
                  </button>
                ) : (
                  <ChevronRight className="w-4 h-4 text-neutral-700 group-hover:text-neutral-400 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pt-16 z-20 pointer-events-none">
        <div className="flex flex-col gap-3 w-full pointer-events-auto">
          <div className="spatial-pill group h-14" onClick={triggerUpload}>
            <div className="spatial-pill-inner">
              <span className="spatial-pill-text font-semibold text-[14px]">Upload Audio File</span>
            </div>
            <div className="spatial-pill-knob w-10 h-10">
              <ArrowRight size={18} className="text-white/30 group-hover:text-white/80 transition-colors" />
            </div>
          </div>

          <button className="prompt-button font-semibold py-3 text-[13px]" onClick={() => setShowPromptModal(true)}>
            <MessageSquare size={18} className="text-neutral-500 group-hover:text-neutral-300" />
            Custom AI Prompt
          </button>
        </div>
      </div>

      {showPromptModal && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end pointer-events-auto">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPromptModal(false)}
          />
          <div className="relative bg-[#0a0a0a] rounded-t-[2.5rem] border-t border-white/10 p-6 pt-4 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] pb-10">
             <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6" />
             <h3 className="text-xl font-display font-semibold text-white mb-2 drop-shadow-md">Custom Instructions</h3>
             <p className="text-[13px] font-body text-neutral-500 mb-6 leading-relaxed font-light">
               Guide the AI on how to handle your audio (e.g., specific terminology, translation).
             </p>
             <textarea 
               value={customPrompt}
               onChange={(e) => setCustomPrompt(e.target.value)}
               placeholder="e.g., Translate to French, keep medical terms as is..."
               className="w-full h-32 glass-recessed text-neutral-200 font-body text-[14px] p-4 rounded-2xl outline-none focus:border-white/10 transition-colors resize-none placeholder:text-neutral-700 mb-6 shadow-inner"
             />
             <div className="flex gap-3">
               <button 
                 onClick={() => setShowPromptModal(false)}
                 className="flex-1 py-4 rounded-xl btn-tactile text-neutral-500 font-display font-medium hover:text-neutral-200"
               >
                 Cancel
               </button>
               <button 
                 onClick={() => setShowPromptModal(false)}
                 className="flex-1 py-4 rounded-xl bg-white/90 text-black font-display font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1),inset_0_-2px_5px_rgba(0,0,0,0.1)] active:scale-[0.98] transition-transform"
               >
                 Save
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
