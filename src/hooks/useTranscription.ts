import { useState, useCallback } from 'react';
import { callGeminiAPI } from '../core/gemini';
import { PROCESSING_STEPS } from '../constants';
import { SessionData, AppSettings, ProcessedResult } from '../types';
import { saveToHistory } from '../utils/storage';

export function useTranscription() {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ProcessedResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processBatch = useCallback(async (sessionData: SessionData, settings: AppSettings, onComplete: (results: ProcessedResult[]) => void) => {
    setIsProcessing(true);
    setError(null);
    const batchResults: ProcessedResult[] = [];
    
    try {
      for (let i = 0; i < sessionData.files.length; i++) {
        setCurrentFileIndex(i);
        setStep(0);
        
        const file = sessionData.files[i];
        
        const stepInterval = setInterval(() => {
          setStep(prev => {
            if (prev < PROCESSING_STEPS.length - 2) return prev + 1;
            return prev;
          });
        }, 2000);

        try {
          const data = await callGeminiAPI(file.data, sessionData.customPrompt, settings);
          clearInterval(stepInterval);
          
          const resultWithMeta: ProcessedResult = { ...data, fileName: file.name, originalFile: file.data };
          batchResults.push(resultWithMeta);
          setResults([...batchResults]);
          setStep(PROCESSING_STEPS.length - 1);

          // Save to history
          await saveToHistory({
            ...resultWithMeta,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            status: 'completed',
            customPrompt: sessionData.customPrompt
          });
          
          if (i < sessionData.files.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (err: any) {
          clearInterval(stepInterval);
          
          // Save failed attempt to history
          await saveToHistory({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            status: 'failed',
            error: err.message,
            fileName: file.name,
            originalFile: file.data,
            customPrompt: sessionData.customPrompt,
            auto_title: file.name,
            language: 'Unknown',
            executive_summary: '',
            key_topics: [],
            original_transcript: '',
            cleaned_transcript: '',
            confidence_score: 0,
            subtitle_segments: []
          });

          throw err;
        }
      }
      
      setTimeout(() => onComplete(batchResults), 1000);
    } catch (err: any) {
      setError(err.message || "An error occurred during processing");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    currentFileIndex,
    step,
    error,
    results,
    isProcessing,
    processBatch
  };
}
