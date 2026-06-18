import { GoogleGenAI } from "@google/genai";
import { Message } from "@/hooks/useAiStore";

export const askGemini = async (apiKey: string, model: string, prompt: string, history: Message[]) => {
  const ai = new GoogleGenAI({ apiKey });
  
  // Format history for SDK
  const chat = ai.chats.create({
    model: model,
    history: history.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }))
  });

  const response = await chat.sendMessage({ message: prompt });
  return response.text;
};
