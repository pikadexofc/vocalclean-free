export interface FileData {
  base64: string;
  mimeType: string;
}

export interface SessionFile {
  name: string;
  data: FileData;
}

export interface SessionData {
  files: SessionFile[];
  customPrompt: string;
}

export interface AppSettings {
  cleaningLevel: string;
  removeFillers: boolean;
  smartTranslation: boolean;
  targetLanguage: string;
  languageLock: boolean;
  speakerDetection: boolean;
  contextAwareness: boolean;
  intentDetection: boolean;
  processingMode: string;
  strictWordLimit: boolean;
  wordLimit: number;
  timingPrecision: string;
  readingSpeedOptimizer: boolean;
  lineBreakingLogic: boolean;
  dualOutput: boolean;
  defaultFormat: string;
  autoExport: boolean;
  animations: boolean;
  reducedMotion: boolean;
  enableBlur: boolean;
  simpleUI: boolean;
  focusMode: boolean;
  autoDeleteDays: number;
  lowQualityMode: boolean;
  autoDeleteAfterProcessing: boolean;
  secureProcessing: boolean;
  customApiKeys: string[];
}

export interface SubtitleSegment {
  time: string;
  text: string;
  translated_text?: string;
}

export interface LowConfidenceSegment {
  time: string;
  text: string;
  reason: string;
}

export interface ProcessedResult {
  fileName: string;
  originalFile?: FileData;
  auto_title: string;
  language: string;
  executive_summary: string;
  key_topics: string[];
  original_transcript: string;
  cleaned_transcript: string;
  translation?: string;
  confidence_score: number;
  low_confidence_segments?: LowConfidenceSegment[];
  subtitle_segments: SubtitleSegment[];
}
