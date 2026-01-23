
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const FALLBACK_QUOTES = [
  "Fall seven times, stand up eight.",
  "Commit or eat it.",
  "Skate and destroy.",
  "Pain is temporary, glory is forever.",
  "Just go skate.",
  "Focus on the trick, not the fear.",
  "Progression is an obsession.",
  "The pavement decides.",
  "Speed checks fear."
];

/**
 * Uses Gemini 2.5 Flash with Google Maps grounding to find skate spots.
 */
export const getSpotRecommendations = async (lat: number, lng: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find skateboard and longboard spots near coordinates ${lat}, ${lng} in India. Focus on known public plazas, skateparks, and downhill-friendly hills. Return a helpful description.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const text = response.text || "Searching for spots...";
    
    return { text, chunks };
  } catch (error) {
    return { text: "AI spotting is currently offline. Relying on local data.", chunks: [] };
  }
};

/**
 * Fetches a motivational quote specifically for skateboarders using Gemini 3 Flash.
 */
export const getMotivationalQuote = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await Promise.race([
        ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "Give me a single, short, powerful motivational quote for a skateboarder or downhill longboarder in 10 words or less. No hashtags, no quotes.",
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
    ]) as GenerateContentResponse;

    return response.text?.trim() || "Stay stoked, keep pushing.";
  } catch (error) {
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  }
};

/**
 * Searches for places in India using Google Maps grounding.
 */
export const searchPlaces = async (query: string) => {
  if (!query || query.length < 3) return [];
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `List 5 specific locations or street addresses in India matching "${query}" relevant for skateboarding. Return as a clean list.`,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const results = chunks
      .filter(chunk => chunk.maps)
      .map(chunk => ({
        title: chunk.maps?.title || "Unknown Place",
        uri: chunk.maps?.uri || ""
      }));

    if (results.length > 0) return results;

    const text = response.text || "";
    return text.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => ({ title: line.replace(/^\d+\.\s*/, '').trim(), uri: '' }));
      
  } catch (error) {
    return [];
  }
};

/**
 * Suggests skills to learn using Structured JSON output.
 */
export const suggestSkills = async (currentLevel: string, discipline: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As an expert skate coach, suggest 3 ${discipline} skills to learn next for someone at ${currentLevel} level.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              tutorialSearch: { type: Type.STRING }
            },
            required: ["name", "description"]
          }
        }
      }
    });
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as any[];
  } catch (error) {
    return [];
  }
};

/**
 * Generates a cinematic, high-quality cover image using Gemini 2.5 Flash Image.
 */
export const generateStateCover = async (stateName: string, landmark: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `Realistic, minimal photography of a skate spot in ${stateName}, featuring ${landmark}. Cinematic lighting, portrait orientation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "9:16" } }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Fixed function name typo: askAICo coach -> askAICoach
/**
 * Handles complex coaching queries using Thinking Mode with Gemini 3 Pro.
 * Optimized for complex technique analysis and strategic spot navigation.
 */
export const askAICoach = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are 'Coach PUSH', an expert AI skate coach in India. 
      You have deep knowledge of skate physics, Indian spot architecture, and the mental game of extreme sports.
      Provide detailed, reasoned, and encouraging feedback.
      
      User Query: ${query}`,
      config: {
        thinkingConfig: {
          thinkingBudget: 32768
        }
      }
    });
    
    return response.text || "I'm buffering on that trick. Try again!";
  } catch (error) {
    console.error("AI Coach thinking failed:", error);
    return "The skate network is busy processing a heavy line. Keep pushing and try later!";
  }
};
