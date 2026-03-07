import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";

export interface SocialContent {
  platform: string;
  text: string;
  imagePrompt: string;
  aspectRatio: "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";
}

export interface GenerationResult {
  linkedin: SocialContent;
  threads: SocialContent;
  instagram: SocialContent;
  pinterest: SocialContent;
}

const SYSTEM_INSTRUCTION = `You are an expert social media strategist. 
Your task is to take a user's idea and tone, and generate tailored content for four platforms: LinkedIn, Threads, Instagram, and Pinterest.
For each platform, provide:
1. The post text (optimized for the platform's style).
2. A highly descriptive image generation prompt that would work well for that platform's content.
3. The optimal aspect ratio for that platform from the allowed list: 1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9.

Platform Guidelines:
- LinkedIn: Professional, long-form, value-driven, includes 3-5 relevant hashtags.
- Threads: Conversational, punchy, short, engaging, often starts a discussion.
- Instagram: Visual-focused, catchy caption, heavy on emojis and hashtags (10-15).
- Pinterest: Inspirational, instructional, or aesthetic. Focus on "how-to" or "ideas".

Return the result as a JSON object matching the GenerationResult interface.`;

export async function generateSocialContent(idea: string, tone: string): Promise<GenerationResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Idea: ${idea}\nTone: ${tone}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          linkedin: {
            type: Type.OBJECT,
            properties: {
              platform: { type: Type.STRING },
              text: { type: Type.STRING },
              imagePrompt: { type: Type.STRING },
              aspectRatio: { type: Type.STRING },
            },
            required: ["platform", "text", "imagePrompt", "aspectRatio"],
          },
          threads: {
            type: Type.OBJECT,
            properties: {
              platform: { type: Type.STRING },
              text: { type: Type.STRING },
              imagePrompt: { type: Type.STRING },
              aspectRatio: { type: Type.STRING },
            },
            required: ["platform", "text", "imagePrompt", "aspectRatio"],
          },
          instagram: {
            type: Type.OBJECT,
            properties: {
              platform: { type: Type.STRING },
              text: { type: Type.STRING },
              imagePrompt: { type: Type.STRING },
              aspectRatio: { type: Type.STRING },
            },
            required: ["platform", "text", "imagePrompt", "aspectRatio"],
          },
          pinterest: {
            type: Type.OBJECT,
            properties: {
              platform: { type: Type.STRING },
              text: { type: Type.STRING },
              imagePrompt: { type: Type.STRING },
              aspectRatio: { type: Type.STRING },
            },
            required: ["platform", "text", "imagePrompt", "aspectRatio"],
          },
        },
        required: ["linkedin", "threads", "instagram", "pinterest"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generatePlatformImage(prompt: string, aspectRatio: string, size: "1K" | "2K" | "4K"): Promise<string> {
  // Use the selected API key from the dialog if available, otherwise fallback to GEMINI_API_KEY
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: size,
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}
