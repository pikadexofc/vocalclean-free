import React, { useEffect } from 'react';
import { 
  Mic,
  AlertCircle
} from 'lucide-react';
import { motion } from "motion/react";
import { SpatialCard } from './ui/SpatialCard';
import { PROCESSING_STEPS } from '../constants';
import { SessionData, AppSettings, ProcessedResult } from '../types';
import { useTranscription } from '../hooks/useTranscription';

interface ProcessingViewProps {
  sessionData: SessionData;
  settings: AppSettings;
  onComplete: (results: ProcessedResult[]) => void;
  onCancel: () => void;
}

export function ProcessingView({ sessionData, settings, onComplete, onCancel }: ProcessingViewProps) {
  const {
    currentFileIndex,
    step,
    error,
    processBatch
  } = useTranscription();

  useEffect(() => {
    processBatch(sessionData, settings, onComplete);
  }, [sessionData, settings, onComplete, processBatch]);

  const totalFiles = sessionData.files.length;
  const overallProgress = ((currentFileIndex) / totalFiles) * 100 + ((step + 1) / PROCESSING_STEPS.length) * (100 / totalFiles);

  return (
    <div className="flex flex-col h-full items-center justify-center p-6 stagger-1 relative z-10">
      <SpatialCard className="w-full max-w-sm text-center shadow-[0_30px_60px_-15px_rgba(0,0,0,1)]" padding="p-8">
        {error ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-5 border border-red-500/20">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-display font-semibold text-white mb-1.5">
              {error === 'API_KEY_ERROR' ? 'API Key Required' : 'Batch Failed'}
            </h3>
            
            {error === 'API_KEY_ERROR' ? (
              <div className="text-left space-y-3 mb-6">
                <p className="text-[12px] text-neutral-400 font-body leading-relaxed">
                  All provided API keys failed or no keys were found. To continue, please get a free API key from Google AI Studio.
                </p>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">1</div>
                    <p className="text-[11px] text-neutral-300 font-body">Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google AI Studio</a></p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">2</div>
                    <p className="text-[11px] text-neutral-300 font-body">Click "Create API key" and copy it.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">3</div>
                    <p className="text-[11px] text-neutral-300 font-body">Go to Settings &gt; API Configuration and paste it.</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-neutral-400 mb-6 font-body">{error}</p>
            )}

            <button onClick={onCancel} className="w-full btn-tactile py-3 rounded-xl font-display font-semibold text-white">
              Go Back
            </button>
          </div>
        ) : (
          <>
            <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center perspective-500">
              <div className="absolute inset-0 border border-blue-500/30 rounded-full [animation:pulse-ring_3s_infinite]" />
              <div className="absolute inset-4 bg-gradient-to-br from-[#222] to-[#000] rounded-full flex items-center justify-center shadow-[inset_0_4px_10px_rgba(255,255,255,0.1),0_10px_25px_rgba(0,0,0,0.8)] border border-white/5 z-10">
                <Mic className="w-8 h-8 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" strokeWidth={1.5} />
              </div>
            </div>

            <h3 className="text-xl font-display font-medium text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 mb-1 tracking-tight">
              Batch Processing
            </h3>
            
            <p className="text-[11px] font-display font-medium text-blue-500/80 uppercase tracking-widest mb-3">
              File {currentFileIndex + 1} of {totalFiles}
            </p>

            <div className="h-10 mb-6 flex flex-col justify-center">
              <p className="text-[13px] font-body text-neutral-200 mb-0.5 line-clamp-1 font-medium">
                {sessionData.files[currentFileIndex]?.name}
              </p>
              <p className="text-[11px] font-body text-neutral-500 font-light">
                {PROCESSING_STEPS[step]}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[9px] font-display font-medium text-neutral-600 uppercase tracking-widest mb-1.5">
                  <span>Current File</span>
                  <span>{Math.round(((step + 1) / PROCESSING_STEPS.length) * 100)}%</span>
                </div>
                <div className="w-full h-1 glass-recessed rounded-full overflow-hidden relative">
                  <motion.div 
                    className="absolute top-0 bottom-0 left-0 bg-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((step + 1) / PROCESSING_STEPS.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[9px] font-display font-semibold text-neutral-500 uppercase tracking-widest mb-1.5">
                  <span>Overall Batch</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <div className="w-full h-2 glass-recessed rounded-full overflow-hidden relative">
                  <motion.div 
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </SpatialCard>
    </div>
  );
}
