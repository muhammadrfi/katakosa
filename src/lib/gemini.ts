import { GoogleGenAI } from "@google/genai";
import { Message } from "@/hooks/useAiStore";

export interface GeminiModel {
  id: string;
  displayName: string;
  description?: string;
}

// Prioritas tampil paling atas (stable models)
const PRIORITY_PREFIXES = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

const getModelPriority = (id: string): number => {
  const idx = PRIORITY_PREFIXES.findIndex(p => id.startsWith(p));
  return idx === -1 ? 999 : idx;
};

/** Ambil SEMUA model dari API Key — handle pagination, tampilkan semuanya */
export const fetchGeminiModels = async (apiKey: string): Promise<GeminiModel[]> => {
  const all: GeminiModel[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({ key: apiKey, pageSize: '100' });
    if (pageToken) params.set('pageToken', pageToken);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?${params}`
    );

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: { message?: string } };
      throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
    }

    const data = await res.json() as {
      models?: {
        name: string;
        displayName: string;
        description?: string;
        supportedGenerationMethods?: string[];
      }[];
      nextPageToken?: string;
    };

    for (const m of data.models ?? []) {
      if (!m.supportedGenerationMethods?.includes('generateContent')) continue;
      const id = m.name.replace('models/', '');
      all.push({
        id,
        displayName: m.displayName || id,
        description: m.description,
      });
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  // Stable models dulu, sisanya alphabetical
  return all.sort((a, b) => {
    const pa = getModelPriority(a.id);
    const pb = getModelPriority(b.id);
    if (pa !== pb) return pa - pb;
    return a.displayName.localeCompare(b.displayName);
  });
};

export const askGemini = async (
  apiKey: string,
  model: string,
  prompt: string,
  history: Message[]
) => {
  const ai = new GoogleGenAI({ apiKey });
  const chat = ai.chats.create({
    model,
    history: history.slice(-10).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
  });
  const response = await chat.sendMessage({ message: prompt });
  const text = response.text;
  if (!text) throw new Error('Model tidak mengembalikan respons teks. Coba lagi atau ganti model.');
  return text;
};
