import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { PLATFORMS } from "@/lib/platforms";

interface CampaignGenerateBody {
  idea: string;
  businessContext?: string;
  tone: string;
  aestheticContext?: string;
}

const platformGuidelines = PLATFORMS.map(
  (p) => `- ${p.label}: ${p.guidelines} Optimal aspect ratio: ${p.defaultAspectRatio}.`
).join("\n");

const SYSTEM_INSTRUCTION = `You are an expert social media strategist.
Your task is to take a user's idea and tone, and generate tailored content for four platforms: ${PLATFORMS.map((p) => p.label).join(", ")}.
For each platform, provide:
1. The post text (optimized for the platform's style).
2. A highly descriptive image generation prompt that would work well for that platform's content.
3. The optimal aspect ratio for that platform from the allowed list: 1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9.

Platform Guidelines:
${platformGuidelines}

Return the result as a JSON object with keys: ${PLATFORMS.map((p) => p.id).join(", ")}. Each value should have: platform, text, imagePrompt, aspectRatio.`;

function buildSchema() {
  const platformObject = {
    type: Type.OBJECT as const,
    properties: {
      platform: { type: Type.STRING as const },
      text: { type: Type.STRING as const },
      imagePrompt: { type: Type.STRING as const },
      aspectRatio: { type: Type.STRING as const },
    },
    required: ["platform", "text", "imagePrompt", "aspectRatio"] as const,
  };

  return {
    type: Type.OBJECT as const,
    properties: Object.fromEntries(PLATFORMS.map((p) => [p.id, platformObject])),
    required: PLATFORMS.map((p) => p.id),
  };
}

export async function POST(request: NextRequest) {
  let body: CampaignGenerateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { idea, businessContext, tone, aestheticContext } = body;
  if (!idea) return NextResponse.json({ error: "idea is required" }, { status: 400 });

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GOOGLE_API_KEY not set" }, { status: 500 });

  const ai = new GoogleGenAI({ apiKey });

  let userContent = `Idea: ${idea}\nTone: ${tone}`;
  if (businessContext) userContent += `\nBusiness Context: ${businessContext}`;
  if (aestheticContext) userContent += `\nVisual Style Context: ${aestheticContext}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      contents: userContent,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: buildSchema(),
      },
    });

    const result = JSON.parse(response.text || "{}");
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Campaign generation failed";
    console.error("[campaign/generate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
