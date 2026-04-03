# VocalClean 🎙️✨

VocalClean is an AI-powered audio transcription and cleaning tool designed for content creators, researchers, and professionals. It transforms raw audio into polished text and subtitles using the high-efficiency Gemini 2 Flash model.

## 🚀 What VocalClean Does

VocalClean isn't just a transcription tool; it's content production infrastructure. It performs a multi-pass analysis to ensure maximum accuracy while maintaining a cost-optimized pipeline.

- **Dual Transcript System**: Get both a raw "Original" transcript and a polished "Cleaned" version with fixed grammar and removed fillers.
- **Smart Subtitle Engine**: Automatically generates SRT/VTT subtitles with strict word limits and reading speed optimization.
- **Intelligent Reprocessing**: Automatically re-analyzes low-confidence segments for superior accuracy.
- **Context-Aware Cleaning**: Adjusts its cleaning aggression based on your specific needs (Formal, Casual, Persuasive).

## ✨ Key Features

- **Gemini 2 Flash Integration**: Optimized for speed, accuracy, and low API cost.
- **Batch Processing**: Upload and process multiple files simultaneously.
- **Custom AI Prompts**: Guide the AI with specific instructions or terminology.
- **Translation**: Built-in support for multiple target languages.
- **3D Glassmorphism UI**: A stunning, immersive interface designed for focus.
- **Privacy First**: Secure processing with options for auto-deletion and custom API key rotation.

## 🛠️ Setup & Installation

### 1. Get an API Key
VocalClean requires a Google Gemini API key.
- Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
- Create a free API key.
- Add it to the app via the **Control Center** (Settings).

### 2. Run Instructions
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🧠 How It Works

1. **Upload**: User uploads audio/video files (max 25MB recommended).
2. **Analysis**: Gemini 2 Flash performs a full pass to transcribe and detect language.
3. **Verification**: The system identifies low-confidence segments.
4. **Refinement**: If needed, a second "Deep" pass corrects unclear parts.
5. **Production**: Final transcripts and subtitles are generated and ready for export.

---

Built with ❤️ for creators everywhere.
