import { GoogleGenAI } from "@google/genai";

export type Model = "nano-banana-2" | "nano-banana-pro";
export type AspectRatio =
  | "1:1" | "1:4" | "1:8" | "2:3" | "3:2" | "3:4"
  | "4:1" | "4:3" | "4:5" | "5:4" | "8:1" | "9:16"
  | "16:9" | "21:9";
export type GeminiSize = "512px" | "1K" | "2K" | "4K";
export type ThinkingLevel = "minimal" | "high";

export interface GenerateParams {
  model: Model;
  prompt: string;
  size: GeminiSize;
  aspectRatio: AspectRatio;
  thinking?: ThinkingLevel;
  grounded?: boolean;
  transparent?: boolean;
  referenceImageBase64?: string;
  referenceImageMimeType?: string;
}

export interface GenerateResult {
  imageBase64: string;
  groundingSources?: { title: string; uri: string }[];
  textResponse?: string;
}

const MODEL_IDS: Record<Model, string> = {
  "nano-banana-2": "gemini-3.1-flash-image-preview",
  "nano-banana-pro": "gemini-3-pro-image-preview",
};

function getClient(): GoogleGenAI {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY is not set. Add it to web/.env.local");
  return new GoogleGenAI({ apiKey });
}

type Part = { text?: string; inlineData?: { mimeType: string; data: string } };

function buildParts(params: GenerateParams): Part[] {
  const parts: Part[] = [];
  if (params.referenceImageBase64 && params.referenceImageMimeType) {
    parts.push({ inlineData: { mimeType: params.referenceImageMimeType, data: params.referenceImageBase64 } });
  }
  let prompt = params.prompt;
  if (params.transparent) {
    prompt = "CRITICAL: Transparent background (PNG with alpha channel) — NO background color, pure transparency. Object floating in transparent space. " + prompt;
  }
  parts.push({ text: prompt });
  return parts;
}

export async function generateImage(params: GenerateParams): Promise<GenerateResult> {
  const ai = getClient();
  const modelId = MODEL_IDS[params.model];
  const parts = buildParts(params);

  if (params.model === "nano-banana-2") {
    return generateWithNB2(ai, modelId, parts, params);
  } else {
    return generateWithNBPro(ai, modelId, parts, params);
  }
}

async function generateWithNB2(
  ai: GoogleGenAI,
  modelId: string,
  parts: Part[],
  params: GenerateParams
): Promise<GenerateResult> {
  const config: Record<string, unknown> = {
    responseModalities: ["TEXT", "IMAGE"],
    imageConfig: { aspectRatio: params.aspectRatio, imageSize: params.size },
  };
  if (params.thinking) {
    config.thinkingConfig = { thinkingLevel: params.thinking };
  }
  if (params.grounded) {
    config.tools = [{ googleSearch: {} }];
  }

  const response = await ai.models.generateContent({
    model: modelId,
    contents: [{ parts }],
    config,
  });

  return extractResult(response, true);
}

async function generateWithNBPro(
  ai: GoogleGenAI,
  modelId: string,
  parts: Part[],
  params: GenerateParams
): Promise<GenerateResult> {
  const response = await ai.models.generateContent({
    model: modelId,
    contents: [{ parts }],
    config: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: { aspectRatio: params.aspectRatio, imageSize: params.size },
    },
  });

  return extractResult(response, false);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractResult(response: any, includeGrounding: boolean): GenerateResult {
  const candidate = response.candidates?.[0];
  if (!candidate?.content?.parts) {
    const reason = candidate?.finishReason ?? "unknown";
    throw new Error(`Gemini returned no content (finish reason: ${reason}). Try simplifying the prompt.`);
  }

  let imageBase64 = "";
  let textResponse = "";

  for (const part of candidate.content.parts) {
    if (part.inlineData?.data) imageBase64 = part.inlineData.data;
    else if (part.text) textResponse = part.text;
  }

  if (!imageBase64) throw new Error("No image data returned from Gemini API.");

  const result: GenerateResult = { imageBase64 };
  if (textResponse) result.textResponse = textResponse;

  if (includeGrounding && candidate.groundingMetadata) {
    const gm = candidate.groundingMetadata;
    const sources: { title: string; uri: string }[] = [];
    for (const chunk of gm.groundingChunks ?? []) {
      if (chunk.web) sources.push({ title: chunk.web.title ?? "Source", uri: chunk.web.uri });
    }
    if (sources.length > 0) result.groundingSources = sources;
  }

  return result;
}
