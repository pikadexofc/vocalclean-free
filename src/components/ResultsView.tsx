import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Play,
  Copy,
  Download,
  ChevronLeft,
  Globe,
  DownloadCloud,
  Zap,
  FileDown,
  History,
  Volume2,
  Pause,
  Wand2,
  Tag,
  AlertCircle,
  EyeOff,
  Trash2,
  Save
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { motion } from "motion/react";
import { formatTime, parseSRTTime, getSmartName, generateSRT } from '../utils';
import { AppSettings, ProcessedResult } from '../types';
import { HistoryItem } from '../utils/storage';

interface ResultsViewProps {
  onReset: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  results: ProcessedResult[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  setView: (view: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<HistoryItem>) => void;
}

export function ResultsView({ 
  onReset, 
  activeTab, 
  setActiveTab, 
  results, 
  activeIndex, 
  setActiveIndex, 
  settings, 
  setSettings, 
  setView,
  onDelete,
  onUpdate
}: ResultsViewProps) {
  const [editingTranscript, setEditingTranscript] = useState<string | null>(null);
  const [editTone, setEditTone] = useState('formal');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const data = results[activeIndex] as HistoryItem;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    }
    setEditingTranscript(null);
  }, [activeIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const seekTime = (parseFloat(e.target.value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      setProgress(parseFloat(e.target.value));
    }
  };
  
  const tabs = [
    { id: 'summary', label: 'SUMMARY' },
    { id: 'original', label: 'ORIGINAL' },
    { id: 'cleaned', label: 'CLEANED' },
    ...(data.translation ? [{ id: 'translated', label: 'TRANSLATED' }] : []),
    { id: 'srt', label: 'SRT' }
  ];

  const handleCopy = () => {
    let textToCopy = '';
    if (activeTab === 'summary') {
      textToCopy = `Summary:\n${data.executive_summary}\n\nLanguage: ${data.language}\nConfidence: ${(data.confidence_score * 100).toFixed(1)}%`;
    } else if (activeTab === 'original') {
      textToCopy = data.original_transcript;
    } else if (activeTab === 'cleaned') {
      textToCopy = editingTranscript || data.cleaned_transcript;
    } else if (activeTab === 'translated') {
      textToCopy = data.translation || '';
    } else if (activeTab === 'srt') {
      textToCopy = generateSRT(data.subtitle_segments);
    }
    
    navigator.clipboard.writeText(textToCopy);
  };

  const handleDownload = () => {
    let content = '';
    let filename = 'vocalclean_export.txt';
    const smartName = getSmartName(data.auto_title, data.fileName);
    
    if (activeTab === 'srt') {
      content = generateSRT(data.subtitle_segments);
      filename = `${smartName}_subtitles.srt`;
    } else if (activeTab === 'translated') {
      content = data.translation || '';
      filename = `${smartName}_translated.txt`;
    } else if (activeTab === 'original') {
      content = data.original_transcript;
      filename = `${smartName}_original.txt`;
    } else {
      content = editingTranscript || data.cleaned_transcript;
      filename = `${smartName}_cleaned.txt`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    results.forEach((res, idx) => {
      setTimeout(() => {
        const content = res.cleaned_transcript;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${res.fileName.split('.')[0]}_cleaned.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }, idx * 500);
    });
  };

  const handleAISmartEdit = async () => {
    const apiKey = settings.customApiKeys[0] || process.env.GEMINI_API_KEY;
    if (!apiKey) return;

    const ai = new GoogleGenAI({ apiKey });
    
    const currentText = editingTranscript || data.cleaned_transcript;
    setEditingTranscript("AI is processing your request...");
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: `Rewrite the following transcript in a ${editTone} tone, keeping it concise and professional. Original text: ${currentText.substring(0, 2000)}`,
      });
      setEditingTranscript(response.text || currentText);
    } catch (err) {
      setEditingTranscript(currentText);
    }
  };

  const handleSave = async () => {
    if (!data.id || editingTranscript === null) return;
    setIsSaving(true);
    try {
      await onUpdate(data.id, { cleaned_transcript: editingTranscript });
      setEditingTranscript(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (data.id && window.confirm('Are you sure you want to delete this result?')) {
      onDelete(data.id);
    }
  };

  return (
    <div className={`flex flex-col h-full relative z-10 bg-[#030303] ${settings.focusMode ? 'focus-mode' : ''}`}>
      {settings.focusMode && (
        <button 
          onClick={() => setSettings((prev: any) => ({ ...prev, focusMode: false }))}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center z-[100] hover:bg-white/20 transition-all shadow-2xl group"
          title="Exit Focus Mode"
        >
          <EyeOff className="w-5 h-5 text-neutral-400 group-hover:text-white" />
        </button>
      )}
      <header className={`px-4 pt-8 pb-3 flex items-center justify-between z-20 sticky top-0 bg-[#030303]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-500 ${settings.focusMode ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'}`}>
        <button onClick={onReset} className="w-8 h-8 rounded-full glass-recessed flex items-center justify-center group">
          <ChevronLeft className="w-4 h-4 text-neutral-500 group-hover:text-neutral-200 transition-colors" strokeWidth={2} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-[13px] font-display font-semibold text-white tracking-tight line-clamp-1 max-w-[180px]">
            {data.auto_title || data.fileName}
          </h2>
          <span className="text-[9px] font-body text-blue-500/70 font-medium">{activeIndex + 1} of {results.length} Files</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={handleDelete} className="w-8 h-8 rounded-full glass-recessed flex items-center justify-center group" title="Delete">
            <Trash2 className="w-4 h-4 text-red-500/50 group-hover:text-red-500 transition-colors" strokeWidth={2} />
          </button>
          <button onClick={() => setView('settings')} className="w-8 h-8 rounded-full glass-recessed flex items-center justify-center group" title="Settings">
            <Settings className="w-4 h-4 text-neutral-500 group-hover:text-neutral-200 transition-colors" strokeWidth={2} />
          </button>
          <button onClick={handleDownloadAll} className="w-8 h-8 rounded-full glass-recessed flex items-center justify-center group" title="Download All">
            <DownloadCloud className="w-4 h-4 text-neutral-500 group-hover:text-neutral-200 transition-colors" strokeWidth={2} />
          </button>
        </div>
      </header>

      <div className="px-4 flex flex-col flex-1 pb-4 relative z-20 overflow-y-auto custom-scrollbar pt-3">
        {/* File Selector for Batch */}
        {results.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
            {results.map((res, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveIndex(idx);
                  setEditingTranscript(null);
                }}
                className={`shrink-0 px-4 py-2 rounded-xl text-[12px] font-display font-medium transition-all border ${
                  activeIndex === idx 
                    ? 'bg-white text-black border-white shadow-[0_4px_12px_rgba(255,255,255,0.2)]' 
                    : 'bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10'
                }`}
              >
                {res.auto_title || res.fileName}
              </button>
            ))}
          </div>
        )}


        <div className={`flex p-[4px] bg-[#0a0a0a] border border-white/5 rounded-full mb-4 relative transition-all duration-500 ${settings.focusMode ? 'opacity-0 scale-95 pointer-events-none h-0 mb-0 overflow-hidden' : 'opacity-100 scale-100'}`}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-[9px] uppercase tracking-[0.1em] font-display font-bold rounded-full transition-all duration-400 z-10 relative ${activeTab === tab.id ? 'text-white' : 'text-neutral-500 hover:text-white/70'}`}
            >
              {tab.label}
            </button>
          ))}
          <motion.div 
            className="absolute top-[4px] bottom-[4px] bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-full z-0 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            layoutId="tab-indicator"
            style={{ width: `calc((100% - 8px) / ${tabs.length})` }}
            animate={{ 
              left: `calc(4px + ((100% - 8px) / ${tabs.length}) * ${tabs.findIndex(t => t.id === activeTab)})`,
            }}
          />
        </div>

        {/* Raw Audio Player Section */}
        {data.originalFile && !settings.focusMode && (
          <div className="mb-4 p-3 glass-panel-3d rounded-2xl flex items-center gap-3 border border-white/5 shadow-lg group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <button 
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all active:scale-90 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] relative z-10"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" fill="currentColor" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
              )}
            </button>
            <div className="flex-1 relative z-10">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-accent font-bold text-blue-500/80 uppercase tracking-widest truncate max-w-[140px]">{data.fileName}</span>
                <span className="text-[9px] font-mono text-neutral-500">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative group/seek">
                <motion.div 
                  className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 z-0"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.1 }}
                />
                <input 
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={progress}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
              </div>
            </div>
            <audio 
              ref={audioRef}
              src={`data:${data.originalFile.mimeType};base64,${data.originalFile.base64}`} 
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleAudioEnded}
              onLoadedMetadata={handleTimeUpdate}
              className="hidden"
            />
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center relative z-10">
              <Volume2 className="w-3.5 h-3.5 text-neutral-500" />
            </div>
          </div>
        )}

        <div className={`flex-1 flex flex-col glass-recessed rounded-[2rem] overflow-hidden relative bg-[#080808]/80 transition-all duration-500 ${settings.focusMode ? 'rounded-none border-none' : ''}`}>
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            <div className="mb-3 pb-3 border-b border-white/5">
              <h3 className="text-neutral-200 font-display font-semibold text-base line-clamp-1">{data.fileName}</h3>
              <p className="text-neutral-600 text-[11px] font-body font-light">Detected: {data.language}</p>
            </div>
            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-display font-medium tracking-widest text-neutral-600 uppercase mb-2 flex items-center gap-2">
                    <FileDown className="w-3 h-3" /> Executive Summary
                  </h4>
                  <div className="markdown-body font-body text-[14px] leading-relaxed text-neutral-300 font-light bg-white/[0.01] p-3.5 rounded-xl border border-white/5">
                    <Markdown>{data.executive_summary}</Markdown>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 glass-panel-3d rounded-xl border border-white/5">
                    <p className="text-[9px] font-display font-bold text-neutral-500 uppercase tracking-widest mb-0.5">Confidence</p>
                    <p className="text-xl font-display font-bold text-white">{(data.confidence_score * 100).toFixed(1)}%</p>
                  </div>
                  <div className="p-3 glass-panel-3d rounded-xl border border-white/5">
                    <p className="text-[9px] font-display font-bold text-neutral-500 uppercase tracking-widest mb-0.5">Language</p>
                    <p className="text-xl font-display font-bold text-white uppercase">{data.language}</p>
                  </div>
                </div>
                {data.low_confidence_segments && data.low_confidence_segments.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-display font-medium tracking-widest text-red-500/70 uppercase mb-4 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5" /> Unclear Segments Detected
                    </h4>
                    <div className="space-y-2">
                      {data.low_confidence_segments.map((seg: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 flex justify-between items-center gap-4">
                          <span className="text-[10px] font-mono text-red-400/60 shrink-0">{seg.time}</span>
                          <p className="text-[12px] text-neutral-400 line-clamp-1 flex-1 italic">"{seg.text}"</p>
                          <span className="text-[10px] font-accent text-red-500/40 uppercase tracking-tighter shrink-0">{seg.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Topics Badge Section */}
                <div className="pt-4 border-t border-white/5">
                  <h4 className="text-[11px] font-display font-medium tracking-widest text-neutral-600 uppercase mb-3 flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" /> Conversation Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.key_topics?.map((topic: string, i: number) => (
                      <div key={i} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-accent font-medium text-neutral-400 flex items-center gap-1.5 hover:bg-white/10 transition-colors">
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'original' && (
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 text-neutral-500 mb-4 pb-2 border-b border-white/5">
                  <History className="w-4 h-4" />
                  <span className="text-[12px] font-display font-bold tracking-widest uppercase">Raw Transcription</span>
                </div>
                <textarea 
                  value={data.original_transcript}
                  readOnly
                  className="w-full flex-1 bg-transparent text-neutral-400 font-body text-[14px] leading-relaxed resize-none outline-none custom-scrollbar min-h-[400px]"
                />
              </div>
            )}

            {activeTab === 'cleaned' && (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2 text-purple-500">
                    <Wand2 className="w-4 h-4" />
                    <span className="text-[12px] font-display font-bold tracking-widest uppercase">Smart Editor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingTranscript !== null && (
                      <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="p-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors group mr-2"
                        title="Save Changes"
                      >
                        <Save className={`w-3 h-3 text-green-500 ${isSaving ? 'animate-pulse' : ''}`} />
                      </button>
                    )}
                    <select 
                      value={editTone}
                      onChange={(e) => setEditTone(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] outline-none text-neutral-400 font-display"
                    >
                      <option value="formal">Formal</option>
                      <option value="casual">Casual</option>
                      <option value="persuasive">Persuasive</option>
                    </select>
                    <button 
                      onClick={handleAISmartEdit}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors group"
                      title="AI Rewrite"
                    >
                      <Zap className="w-3 h-3 text-yellow-500 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
                
                <textarea 
                  value={editingTranscript !== null ? editingTranscript : data.cleaned_transcript}
                  onChange={(e) => setEditingTranscript(e.target.value)}
                  className="w-full flex-1 bg-transparent text-neutral-300 font-body text-[15px] leading-relaxed resize-none outline-none custom-scrollbar min-h-[400px]"
                  placeholder="Start editing..."
                />
              </div>
            )}

            {activeTab === 'translated' && (
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 text-blue-500 mb-4 pb-2 border-b border-white/5">
                  <Globe className="w-4 h-4" />
                  <span className="text-[12px] font-display font-bold tracking-widest uppercase">Translation</span>
                </div>
                <textarea 
                  value={data.translation}
                  readOnly
                  className="w-full flex-1 bg-transparent text-neutral-300 font-body text-[15px] leading-relaxed resize-none outline-none custom-scrollbar min-h-[400px]"
                />
              </div>
            )}

            {activeTab === 'srt' && (
              <div className="flex flex-col gap-1.5">
                {data.subtitle_segments.map((sub: any, i: number) => {
                  const startTime = parseSRTTime(sub.time);
                  const nextTime = i < data.subtitle_segments.length - 1 ? parseSRTTime(data.subtitle_segments[i+1].time) : duration || 999999;
                  const isActive = currentTime >= startTime && currentTime < nextTime;

                  return (
                    <div 
                      key={i} 
                      className={`flex items-start gap-6 py-2.5 border-b border-white/[0.03] last:border-0 rounded-xl px-2.5 transition-all duration-300 ${isActive ? 'bg-blue-500/10 border-blue-500/20 shadow-[0_0_25px_rgba(59,130,246,0.1)]' : 'hover:bg-white/[0.01]'}`}
                    >
                      <span className={`font-display font-medium text-[10px] tracking-widest mt-0.5 shrink-0 w-24 transition-colors ${isActive ? 'text-blue-400' : 'text-neutral-500'}`}>
                        {sub.time}
                      </span>
                      <div className="flex flex-col gap-0.5 flex-1">
                        <p className={`font-display font-medium text-[14px] leading-snug tracking-tight transition-colors duration-300 ${isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]' : 'text-neutral-200'}`}>
                          {sub.text}
                        </p>
                        {sub.translated_text && (
                          <p className={`font-display font-medium text-[12px] leading-snug tracking-tight italic transition-colors duration-300 ${isActive ? 'text-blue-500/60' : 'text-neutral-500'}`}>
                            {sub.translated_text}
                          </p>
                        )}
                      </div>
                      {isActive && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] mt-2"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-white/[0.05] bg-[#050505]/95 backdrop-blur-xl flex gap-2">
            <button onClick={handleCopy} className="flex-1 btn-tactile py-3 rounded-[1rem] text-[13px] font-body font-medium flex justify-center items-center gap-2 text-white/90">
              <Copy className="w-3.5 h-3.5" />
              Copy
            </button>
            <button onClick={handleDownload} className="flex-1 btn-primary-3d py-3 rounded-[1rem] text-[13px] font-body font-semibold flex justify-center items-center gap-2 text-black">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
