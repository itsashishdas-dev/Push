
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

export const getSpotRecommendations = async (lat: number, lng: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find skateboard and longboard spots near coordinates ${lat}, ${lng} in India. Focus on known public plazas, skateparks, and downhill-friendly hills.`,
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
    // console.error("AI Error:", error); // Suppressed for production cleanliness
    return { text: "AI spotting is currently unavailable. Showing offline recommendations.", chunks: [] };
  }
};

/**
 * Fetches a motivational quote specifically for skateboarders and longboarders.
 */
export const getMotivationalQuote = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    // Race the API call against a 3-second timeout to ensure app responsiveness
    const response = await Promise.race([
        ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "Give me a single, short, powerful motivational quote for a skateboarder or downhill longboarder in 10 words or less. No hashtags, no quotes around it.",
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Quote Timeout")), 3000))
    ]) as GenerateContentResponse;

    return response.text?.trim() || "Stay stoked, keep pushing.";
  } catch (error) {
    // Return a random fallback quote if quota is exceeded or times out
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  }
};

/**
 * Searches for places in India using Google Maps grounding via Gemini.
 * Returns a list of place names and addresses.
 */
export const searchPlaces = async (query: string) => {
  if (!query || query.length < 3) return [];
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `List 5 specific locations or street addresses in India matching "${query}" that would be relevant for skateboarding or longboarding spots. Return as a clean list of place names with their area and city.`,
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
    // Return empty list on error to prevent UI breakage
    return [];
  }
};

export const suggestSkills = async (currentLevel: string, discipline: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As an expert skate coach, suggest 3 ${discipline} skills to learn next for someone at ${currentLevel} level. Format as JSON list.`,
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
            }
          }
        }
      }
    });
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as any[];
  } catch (error) {
    // console.error("AI Error:", error);
    return [];
  }
};

/**
 * Generates a cinematic, high-quality cover image for a state card.
 */
export const generateStateCover = async (stateName: string, landmark: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `Create a clean, modern spot card background image for a skateboarding & downhill skating app.
State: ${stateName}
Iconic Place / Visual Identity: ${landmark}

Visual Style
• Cinematic, minimal, premium look
• Slightly moody lighting with natural colors
• No clutter, no crowds, no text, no logos
• Soft depth of field so UI text remains readable
• Feels adventurous, free, and youth-oriented

Composition
• Portrait orientation (9:16)
• Landmark placed slightly off-center
• Empty foreground or sky/road/water area for UI overlay
• Subtle motion or wind if applicable

Render in high resolution, realistic photography style.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16",
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Failed:", error);
    return null;
  }
};

/**
 * Handles complex coaching queries using Thinking Mode.
 */
export const askAICoach = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are 'Coach PUSH', an expert AI skateboarding and downhill longboarding coach for the PUSH app in India. 
      Your goal is to help skaters progress safely, find spots, and understand technique.
      
      User Query: ${query}
      
      Provide a highly detailed, thoughtful, and encouraging response. 
      If the user asks about a trick, break it down step-by-step.
      If the user asks about gear, explain the nuances.
      If the user asks about mental blocks, be supportive.
      
      Keep the tone stoked but professional.`,
      config: {
        thinkingConfig: {
          thinkingBudget: 32768
        }
      }
    });
    
    return response.text || "I couldn't quite land that thought. Try asking again!";
  } catch (error) {
    console.error("AI Coach Error:", error);
    return "I'm having trouble connecting to the skate network right now. Please try again later.";
  }
};
