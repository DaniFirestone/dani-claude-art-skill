import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { generateImage } from "@/lib/gemini";
import type { Model, AspectRatio, GeminiSize, ThinkingLevel } from "@/lib/gemini";

interface GenerateRequestBody {
  model: Model;
  prompt: string;
  aestheticPrefix?: string;
  size: GeminiSize;
  aspectRatio: AspectRatio;
  thinking?: ThinkingLevel;
  grounded?: boolean;
  transparent?: boolean;
  referenceImageDataUrl?: string;
  variations?: number;
}

interface GenerateResponseItem {
  imageUrl: string;
  groundingSources?: { title: string; uri: string }[];
  textResponse?: string;
}

async function saveImage(base64: string, filename: string): Promise<string> {
  const outputDir = path.join(process.cwd(), "public", "generated");
  await mkdir(outputDir, { recursive: true });
  const buffer = Buffer.from(base64, "base64");
  await writeFile(path.join(outputDir, filename), buffer);
  return `/generated/${filename}`;
}

function parseReferenceImage(dataUrl: string): { data: string; mimeType: string } | null {
  // dataUrl format: data:<mimeType>;base64,<data>
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

export async function POST(request: NextRequest) {
  let body: GenerateRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    model,
    prompt,
    aestheticPrefix,
    size,
    aspectRatio,
    thinking,
    grounded,
    transparent,
    referenceImageDataUrl,
    variations = 1,
  } = body;

  if (!prompt) return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  if (!model) return NextResponse.json({ error: "model is required" }, { status: 400 });

  // Assemble final prompt: aesthetic prefix + user prompt
  const finalPrompt = [aestheticPrefix, prompt].filter(Boolean).join("\n\n");

  // Parse reference image if provided
  const refImage = referenceImageDataUrl ? parseReferenceImage(referenceImageDataUrl) : null;

  const timestamp = Date.now();
  const count = Math.min(Math.max(1, variations), 4);

  try {
    const generateOne = async (index: number): Promise<GenerateResponseItem> => {
      const result = await generateImage({
        model,
        prompt: finalPrompt,
        size,
        aspectRatio,
        thinking: model === "nano-banana-2" ? thinking : undefined,
        grounded: model === "nano-banana-2" ? grounded : undefined,
        transparent,
        referenceImageBase64: refImage?.data,
        referenceImageMimeType: refImage?.mimeType,
      });

      const suffix = count > 1 ? `-v${index + 1}` : "";
      const filename = `${timestamp}${suffix}.png`;
      const imageUrl = await saveImage(result.imageBase64, filename);

      return {
        imageUrl,
        groundingSources: result.groundingSources,
        textResponse: result.textResponse,
      };
    };

    // Generate all variations in parallel
    const results = await Promise.all(
      Array.from({ length: count }, (_, i) => generateOne(i))
    );

    return NextResponse.json({
      results,
      finalPrompt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown generation error";
    console.error("[generate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
