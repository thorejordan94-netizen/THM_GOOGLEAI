import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { JOB_PROFILES_TEXT } from "../constants";
import { AnalysisResponseSchema } from "../types";

let client: GoogleGenAI | null = null;
let currentModel: string = "gemini-3-flash-preview";

export const initializeGemini = (apiKey: string, modelName: string = "gemini-3-flash-preview") => {
  client = new GoogleGenAI({ apiKey });
  currentModel = modelName;
};

const getClient = () => {
  if (!client) throw new Error("API Key not set");
  return client;
};

// Timeout wrapper to prevent hanging requests
const timeoutPromise = <T>(ms: number, promise: Promise<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout after ${ms}ms`));
    }, ms);
    promise.then(
      (res) => { clearTimeout(timer); resolve(res); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryWithBackoff<T>(operation: () => Promise<T>, retries = 5, baseDelay = 5000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      const errRoot = error?.error || error;
      const msg = (errRoot?.message || JSON.stringify(errRoot)).toLowerCase();
      const status = errRoot?.code || errRoot?.status;

      // Retry on:
      // 429 (Too Many Requests / Quota)
      // 500, 503, 504 (Server Errors)
      // "Timeout" (Client side timeout)
      const isRetryable = 
        status === 429 || status === 503 || status === 500 || status === 504 ||
        status === 'RESOURCE_EXHAUSTED' || status === 'UNAVAILABLE' ||
        msg.includes('429') || msg.includes('quota') || msg.includes('exhausted') ||
        msg.includes('timeout') || msg.includes('overloaded') || msg.includes('internal');

      if (isRetryable && i < retries - 1) {
        // Exponential backoff with jitter: base * 2^i + jitter
        // Start slower: 5s, 10s, 20s... to really give the quota time to reset
        const jitter = Math.random() * 2000;
        const waitTime = (baseDelay * Math.pow(2, i)) + jitter; 
        console.warn(`Gemini API Error (${status || 'Unknown'}). Retrying in ${Math.round(waitTime)}ms... (Attempt ${i + 1}/${retries})`);
        await delay(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

export const analyzeRoom = async (roomName: string): Promise<AnalysisResponseSchema> => {
  const ai = getClient();
  
  const prompt = `
    Analysiere den TryHackMe Raum namens "${roomName}".
    
    Schritt 1: Nutze die Google Suche, um detaillierte Informationen über diesen spezifischen TryHackMe-Raum zu finden. Suche nach Beschreibung, Schwierigkeitsgrad, genutzten Tools, Betriebssystemen, Themen und der geschätzten Zeitdauer.
    
    Schritt 2: Vergleiche die Raumdetails mit den folgenden 5 Job-Profilen:
    ${JOB_PROFILES_TEXT}
    
    Schritt 3: Bestimme für JEDES Job-Profil einen Relevanz-Score (0-5), wobei 0 irrelevant und 5 essentiell ist. Gib eine kurze Begründung auf Deutsch basierend auf Tools/Skills.
    
    Schritt 4: Gib das Ergebnis als valides JSON-Objekt zurück.
    
    STRUKTUR (Exakt übernehmen):
    {
      "metadata": {
        "summary": "Konkrete, technische Zusammenfassung (max 12 Wörter). Nenne explizit Technologien/Angriffe (z.B. 'Exploitation von AD CS via PetitPotam').",
        "description": "Eine detaillierte Beschreibung des Raum-Inhalts auf Deutsch. Sei konkret: Welche CVEs? Welche Tools? Welches Ziel?",
        "difficulty": "Easy, Medium, Hard, oder Insane",
        "tags": ["Tag1", "Tag2"], 
        "tools": ["Tool1", "Tool2"],
        "mainCategory": "z.B. Web Hacking",
        "environment": "Linux, Windows, Android oder Hybrid",
        "type": "Challenge oder Walkthrough",
        "keyTakeaways": "Was der Nutzer praktisch lernt (auf Deutsch).",
        "timeEstimate": "Max 3 Wörter (z.B. '2 Std.')."
      },
      "analysis": {
        "windowsClient": { "score": 0, "reason": "Begründung..." },
        "windowsServer": { "score": 0, "reason": "Begründung..." },
        "network": { "score": 0, "reason": "Begründung..." },
        "dba": { "score": 0, "reason": "Begründung..." },
        "linux": { "score": 0, "reason": "Begründung..." }
      }
    }

    WICHTIGE REGELN:
    1. Tags & Tools: Maximal 2 Wörter pro Item. Nutze Abkürzungen wenn möglich (AD, LFI, XSS).
    2. Time Estimate: Maximal 3 Wörter.
    3. Type: Unterscheide zwischen 'Challenge' (CTF, Flaggen finden) und 'Walkthrough' (Geführtes Lernen, Tasks).
    4. FALLBACK: Falls keine spezifischen Infos gefunden werden, erstelle eine "Best-Guess" Analyse basierend auf dem Raumnamen oder gib 'Unbekannt' zurück. Gib NIEMALS eine Text-Entschuldigung zurück. Das Ergebnis MUSS valides JSON sein.
    5. OUTPUT FORMAT: Gib NUR das JSON zurück. KEIN Markdown (kein \`\`\`json), kein Einleitungstext. Beginne direkt mit der geschweiften Klammer {.
  `;

  // Define the API operation to be retried
  const performApiCall = async () => {
      // Increased timeout to 90s to handle slow Google Search responses + Queueing
      const response = await timeoutPromise(90000, ai.models.generateContent({
        model: currentModel, 
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      })) as GenerateContentResponse;

      if (!response.text) throw new Error("Keine Antwort von der KI");
      return response.text;
  };

  try {
    // Execute the API call with robust backoff
    let text = await retryWithBackoff(performApiCall);
    
    // 1. Clean Markdown code blocks
    text = text.replace(/```json/g, '').replace(/```/g, '');

    // 2. Find outermost brackets
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');

    if (start === -1 || end === -1 || start > end) {
        console.error("Invalid Response Text:", text);
        throw new Error("Antwort enthält kein valides JSON (Klammern fehlen).");
    }

    // 3. Extract JSON string
    const jsonString = text.substring(start, end + 1);

    let data: AnalysisResponseSchema;
    try {
        data = JSON.parse(jsonString) as AnalysisResponseSchema;
    } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "\nExtracted String:", jsonString);
        throw new Error("JSON Parsing fehlgeschlagen.");
    }

    // Post-Processing Sanitization
    const sanitizeList = (list: string[]) => {
        if (!Array.isArray(list)) return [];
        return list.map(item => {
            const trimmed = item.trim();
            const words = trimmed.split(/\s+/);
            if (words.length > 2) {
                // Heuristic: Initials or truncate
                const initials = words.map(w => w[0].toUpperCase()).join('');
                if (initials.length >= 2 && initials.length <= 5) return initials;
                return words.slice(0, 2).join(' ');
            }
            return trimmed;
        });
    };

    if (data.metadata) {
        if (data.metadata.tags) data.metadata.tags = sanitizeList(data.metadata.tags);
        if (data.metadata.tools) data.metadata.tools = sanitizeList(data.metadata.tools);
        if (data.metadata.timeEstimate && data.metadata.timeEstimate.length > 15) {
            data.metadata.timeEstimate = data.metadata.timeEstimate.substring(0, 15) + '...';
        }
        // Normalize type
        const typeLower = (data.metadata.type || '').toLowerCase();
        if (typeLower.includes('ctf') || typeLower.includes('challenge')) data.metadata.type = 'Challenge';
        else data.metadata.type = 'Walkthrough';
    }

    return data;

  } catch (error) {
    console.error("Gemini Analyse Fehler:", error);
    throw error;
  }
};