import { GoogleGenAI } from "@google/genai";
import { RESPONSE_SCHEMA } from "../constants";
import { AppSettings, FileData } from "../types";

export const callGeminiAPI = async (fileData: FileData, customPrompt: string, settings: AppSettings) => {
  const keysToTry = [...(settings.customApiKeys || [])];
  if (process.env.GEMINI_API_KEY) {
    keysToTry.push(process.env.GEMINI_API_KEY);
  }

  if (keysToTry.length === 0) {
    throw new Error("API_KEY_ERROR");
  }

  const cleanMimeType = fileData.mimeType.split(';')[0];
  const modelName = "gemini-flash-latest"; // Strictly use Gemini 2 Flash

  const systemInstruction = `
    Act as a high-efficiency, context-aware AI transcription and translation engine.

    Your goal is to produce highly accurate, natural, and structured outputs from audio while minimizing errors, redundancy, and cost.

    CORE WORKFLOW:
    1. Perform one full transcription pass:
       - Detect original language
       - Generate timestamps
       - Preserve full context

    2. Identify low-confidence segments:
       - Reprocess ONLY those segments (max 2 retries)
       - Merge intelligently using context, not literal matching

    3. Generate TWO transcript layers:
       - ORIGINAL:
         Preserve natural speech but remove obvious fillers (um, uh, stutters) ONLY if they do not affect meaning
       - CLEANED:
         Improve grammar, clarity, and flow while preserving tone and intent

    4. TRANSLATION (CRITICAL LOGIC):
       - Translate ONLY if enabled
       - Do NOT translate word-by-word
       - Always interpret full sentence meaning before translating
       - Preserve tone, emotion, and cultural context
       - Avoid unnatural phrasing
       - If ambiguity exists, resolve using surrounding context

    5. DUAL-LANGUAGE SUBTITLES (STRICT):
       - Original text must ALWAYS remain primary
       - Translated text must be semantically aligned, not literal
       - Each segment must:
         - Represent a complete thought
         - Be readable and natural
       - Never force translation if it reduces clarity

    6. SUBTITLE GENERATION:
       - Respect HARD word limit: ${settings.wordLimit}
       - Maintain timing accuracy
       - Ensure mobile readability
       - Format strictly as ${settings.defaultFormat.toUpperCase()}

    STRICT RULES:
    - No hallucination
    - No word-by-word translation errors
    - No context loss
    - No formatting deviation
    - Always return valid structured JSON
  `;

  const userContext = `
    USER SETTINGS:
    - Target Language: ${settings.targetLanguage}
    - Dual Language Output: ${settings.dualOutput ? "ON" : "OFF"}
    - Combined Subtitles: ${settings.lineBreakingLogic ? "ON" : "OFF"}
    - Cleaning Level: ${settings.cleaningLevel}
    - Context Awareness: ${settings.contextAwareness ? "ON" : "OFF"}
    - Custom Intent: ${customPrompt || "None"}

    PRIORITY ORDER:
    1. System rules (non-negotiable)
    2. User settings (constraints)
    3. Custom prompt (intent layer, must not break structure)
  `;

  let lastError = null;
  for (const apiKey of keysToTry) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      // PASS 1: Full Pass & Confidence Check
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            parts: [
              { inlineData: { data: fileData.base64, mimeType: cleanMimeType } },
              { text: `${systemInstruction}\n\n${userContext}\n\nProcess the audio using the above logic. Think context-first, not word-first. Return precise, structured JSON output.` }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA
        }
      });

      if (!response.text) throw new Error("No response from AI engine.");
      let result = JSON.parse(response.text);

      // PASS 2: Intelligent Reprocessing (if confidence is low)
      if (result.confidence_score < 0.85 && result.low_confidence_segments?.length > 0 && settings.processingMode !== 'fast') {
        const segmentsToFix = JSON.stringify(result.low_confidence_segments);
        const retryPrompt = `
          The following segments had low confidence in the first pass:
          ${segmentsToFix}
          
          Please re-analyze these specific segments from the audio with maximum focus. 
          Intelligently merge the corrected versions back into the original and cleaned transcripts.
          Update the subtitle segments accordingly.
          Return the FINAL corrected JSON object.
        `;

        const retryResponse = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              parts: [
                { inlineData: { data: fileData.base64, mimeType: cleanMimeType } },
                { text: `${systemInstruction}\n\n${userContext}\n\n${retryPrompt}` }
              ]
            }
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA
          }
        });

        if (retryResponse.text) {
          try {
            result = JSON.parse(retryResponse.text);
          } catch (e) {
            console.warn("Failed to parse retry response, using original result.");
          }
        }
      }

      // PASS 3: Self-Correction Loop (Critique & Refine)
      // Run for 'deep' mode always, or 'balanced' if confidence is still not perfect
      if (settings.processingMode === 'deep' || (settings.processingMode === 'balanced' && result.confidence_score < 0.95)) {
        const critiquePrompt = `
          CRITIQUE & REFINE:
          Please review your own generated output below for any:
          - Hallucinations or context mismatches
          - Unnatural translations or phrasing
          - Subtitle timing or word limit violations
          - Formatting errors
          
          Current Output: ${JSON.stringify(result)}
          
          If any issues are found, provide the CORRECTED and FINAL version of the JSON object. 
          If it is already perfect, return the same JSON.
          Think context-first, not word-first.
        `;

        const critiqueResponse = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              parts: [
                { inlineData: { data: fileData.base64, mimeType: cleanMimeType } },
                { text: `${systemInstruction}\n\n${userContext}\n\n${critiquePrompt}` }
              ]
            }
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA
          }
        });

        if (critiqueResponse.text) {
          try {
            result = JSON.parse(critiqueResponse.text);
          } catch (e) {
            console.warn("Failed to parse critique response, using previous result.");
          }
        }
      }

      return result;
    } catch (err) {
      console.error(`API Key failed: ${apiKey.substring(0, 5)}...`, err);
      lastError = err;
      continue; // Try next key
    }
  }

  throw lastError || new Error("API_KEY_ERROR");
};
