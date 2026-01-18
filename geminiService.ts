
import { GoogleGenAI } from "@google/genai";

/**
 * Fetches a response from Gemini AI for customer support.
 * Complies with @google/genai SDK latest guidelines.
 */
export const getAIAssistantResponse = async (prompt: string) => {
  // Initialize GoogleGenAI with the API key from environment variables.
  // We initialize inside the function to ensure we always use the latest environment state.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful customer support assistant for 'Digital Empire', a digital investment and package management platform. Answer in Bengali only. Be royal and professional.",
      }
    });

    // The .text property is used to extract the string output from GenerateContentResponse.
    // It is a property, not a method call.
    return response.text || "দুঃখিত, আমি আপনার অনুরোধটি বুঝতে পারছি না।";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "সার্ভারে ত্রুটি হয়েছে, অনুগ্রহ করে পরে চেষ্টা করুন।";
  }
};
