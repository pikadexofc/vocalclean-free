import { Type } from "@google/genai";
import { AppSettings } from "../types";

export const DEFAULT_SETTINGS: AppSettings = {
  // AI Processing
  cleaningLevel: 'light',
  removeFillers: true,
  smartTranslation: true,
  targetLanguage: 'English',
  languageLock: true,
  speakerDetection: false,
  contextAwareness: true,
  intentDetection: true,
  processingMode: 'fast', // fast, balanced, deep
  
  // Subtitle Engine
  strictWordLimit: true,
  wordLimit: 2,
  timingPrecision: 'ultra',
  readingSpeedOptimizer: true,
  lineBreakingLogic: true,
  dualOutput: false,
  
  // Export Control
  defaultFormat: 'srt',
  autoExport: false,
  
  // Experience & UI
  animations: true,
  reducedMotion: false,
  enableBlur: true,
  simpleUI: false,
  focusMode: false,
  
  // Storage & Performance
  autoDeleteDays: 7,
  lowQualityMode: false,
  
  // Privacy & Security
  autoDeleteAfterProcessing: false,
  secureProcessing: true,
  customApiKeys: [],
};

export const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    auto_title: { type: Type.STRING, description: "A descriptive title for the audio content (3-10 words)" },
    language: { type: Type.STRING },
    executive_summary: { type: Type.STRING },
    key_topics: { type: Type.ARRAY, items: { type: Type.STRING } },
    original_transcript: { type: Type.STRING, description: "Exactly as spoken, with only obvious filler words or mistakes removed" },
    cleaned_transcript: { type: Type.STRING, description: "Medium level of cleaning applied, fixing grammar and preserving tone" },
    translation: { type: Type.STRING, description: "Translated text if enabled" },
    confidence_score: { type: Type.NUMBER, description: "Overall confidence (0-1)" },
    low_confidence_segments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING, description: "Timestamp in format HH:MM:SS,mmm" },
          text: { type: Type.STRING },
          reason: { type: Type.STRING }
        }
      }
    },
    subtitle_segments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING, description: "Timestamp in format HH:MM:SS,mmm" },
          text: { type: Type.STRING },
          translated_text: { type: Type.STRING }
        }
      }
    }
  },
  required: ["auto_title", "language", "executive_summary", "key_topics", "original_transcript", "cleaned_transcript", "subtitle_segments", "confidence_score"]
};

export const PROCESSING_STEPS = [
  "Analyzing audio structure...",
  "Initial transcription pass...",
  "Confidence verification...",
  "Deep cleaning & grammar check...",
  "Self-correction & refinement...",
  "Finalizing high-efficiency output..."
];
