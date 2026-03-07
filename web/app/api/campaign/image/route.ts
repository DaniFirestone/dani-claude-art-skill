import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { generateImage } from "@/lib/gemini";
import type { Model, GeminiSize } from "@/lib/gemini";

interface CampaignImageBody {
  imagePrompt: string;
  aspectRatio: string;
  size: GeminiSize;
  model: Model;
  aestheticPrefix?: string;
  platform: string;
}

async function saveImage(base64: string, filename: string): Promise<string> {
  const outputDir = path.join(process.cwd(), "public", "generated");
  await mkdir(outputDir, { recursive: true });
  const buffer = Buffer.from(base64, "base64");
  await writeFile(path.join(outputDir, filename), buffer);
  return `/generated/${filename}`;
}

export async function POST(request: NextRequest) {
  let body: CampaignImageBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { imagePrompt, aspectRatio, size, model, aestheticPrefix, platform } = body;
  if (!imagePrompt) return NextResponse.json({ error: "imagePrompt is required" }, { status: 400 });

  const finalPrompt = [aestheticPrefix, imagePrompt].filter(Boolean).join("\n\n");

  try {
    const result = await generateImage({
      model: model || "nano-banana-2",
      prompt: finalPrompt,
      size: size || "2K",
      aspectRatio: aspectRatio as any,
    });

    const filename = `campaign-${platform}-${Date.now()}.png`;
    const imageUrl = await saveImage(result.imageBase64, filename);

    return NextResponse.json({ imageUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image generation failed";
    console.error("[campaign/image]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
