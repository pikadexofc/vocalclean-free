import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { HomeView } from './components/HomeView';
import { ProcessingView } from './components/ProcessingView';
import { ResultsView } from './components/ResultsView';
import { SettingsView } from './components/SettingsView';
import { DEFAULT_SETTINGS } from './constants';
import { AppSettings, SessionData, ProcessedResult, SessionFile } from './types';
import { getHistory, HistoryItem, saveToHistory, deleteFromHistory, updateHistoryItem } from './utils/storage';

export default function App() {
  const [view, setView] = useState('home');
  const [activeTab, setActiveTab] = useState('summary');
  const [sessionData, setSessionData] = useState<SessionData>({ files: [], customPrompt: '' });
  const [processedResults, setProcessedResults] = useState<ProcessedResult[]>([]);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const loadHistory = async () => {
    const items = await getHistory();
    setHistory(items);
  };

  useEffect(() => {
    loadHistory();
  }, [view]); // Reload history when view changes back to home

  const handleUpload = (files: SessionFile[], customPrompt: string) => {
    setSessionData({ files, customPrompt });
    setView('processing');
  };

  const handleReset = () => {
    setView('home');
    setActiveTab('summary');
    setProcessedResults([]);
    setActiveResultIndex(0);
  };

  const handleRecentClick = (item: HistoryItem) => {
    if (item.status === 'failed') {
      // If failed, trigger retry
      handleRetry(item);
      return;
    }
    setProcessedResults([item]);
    setView('results');
  };

  const handleRetry = (item: HistoryItem) => {
    if (item.originalFile) {
      setSessionData({ 
        files: [{ name: item.fileName, data: item.originalFile }], 
        customPrompt: item.customPrompt || '' 
      });
      setView('processing');
    }
  };

  const handleDeleteHistory = async (id: string) => {
    await deleteFromHistory(id);
    await loadHistory();
    if (view === 'results') {
      handleReset();
    }
  };

  const handleUpdateHistory = async (id: string, updates: Partial<HistoryItem>) => {
    await updateHistoryItem(id, updates);
    await loadHistory();
  };

  return (
    <MotionConfig transition={settings.animations && !settings.reducedMotion ? undefined : { duration: 0 }}>
      <div className={`min-h-screen bg-[#030303] text-neutral-200 font-body flex justify-center overflow-hidden antialiased selection:bg-white/20 relative perspective-1000 ${!settings.enableBlur ? 'disable-blur' : ''} ${!settings.animations ? 'disable-animations' : ''} ${settings.simpleUI ? 'simple-ui' : ''} ${settings.reducedMotion ? 'reduced-motion' : ''}`}>
        {/* Texture & Tech Grid Layer */}
        <div className="absolute inset-0 z-0 bg-grid opacity-50 pointer-events-none" />
        
        {/* Deep Parallax Orbs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
           <div className="absolute top-[10%] left-[5%] w-[50vw] h-[50vw] max-w-2xl max-h-2xl bg-[#0044ff]/10 blur-[140px] rounded-full mix-blend-screen ambient-drift" />
           <div className="absolute bottom-[0%] right-[5%] w-[60vw] h-[60vw] max-w-3xl max-h-3xl bg-[#ff1100]/10 blur-[160px] rounded-full mix-blend-screen ambient-drift" style={{ animationDelay: '-5s' }} />
        </div>

        <div className={`w-full max-w-[428px] h-[100dvh] relative flex flex-col z-10 bg-black/40 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.8),inset_0_0_0_1px_rgba(255,255,255,0.05)] border-x border-white/[0.02] transform-gpu ${settings.simpleUI ? 'bg-black/90' : ''}`}>
          <AnimatePresence mode="wait">
            {view === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                <HomeView 
                  onUpload={handleUpload} 
                  onSettings={() => setView('settings')} 
                  onRecentClick={handleRecentClick} 
                  history={history}
                />
              </motion.div>
            )}
            {view === 'processing' && (
              <motion.div key="processing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="h-full">
                <ProcessingView 
                  sessionData={sessionData} 
                  settings={settings}
                  onComplete={(results) => {
                    setProcessedResults(results);
                    setView('results');
                  }} 
                  onCancel={handleReset}
                />
              </motion.div>
            )}
            {view === 'results' && (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full">
                <ResultsView 
                  onReset={handleReset} 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                  results={processedResults}
                  activeIndex={activeResultIndex}
                  setActiveIndex={setActiveResultIndex}
                  settings={settings}
                  setSettings={setSettings}
                  setView={setView}
                  onDelete={handleDeleteHistory}
                  onUpdate={handleUpdateHistory}
                />
              </motion.div>
            )}
            {view === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                <SettingsView settings={settings} setSettings={setSettings} onBack={() => setView('home')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}
