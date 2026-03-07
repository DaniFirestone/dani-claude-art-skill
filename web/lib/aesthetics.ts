import { readFile, readdir } from "fs/promises";
import path from "path";
import { SKILL_ROOT } from "./paths";

export interface Aesthetic {
  id: string;
  name: string;
  prefix: string;
  description: string;
}

function formatName(filename: string): string {
  return filename
    .replace(/\.md$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractPrefix(content: string): string {
  // Match the code block under "## Base Prompt Prefix"
  const match = content.match(/##\s+Base Prompt Prefix[^\n]*\n[\s\S]*?```\n([\s\S]*?)```/);
  return match ? match[1].trim() : "";
}

function extractDescription(content: string): string {
  // Try to extract the blockquote under "## Core Concept"
  const blockquote = content.match(/##\s+Core Concept[\s\S]*?>\s*\*?"([^"*\n]+)"/);
  if (blockquote) return blockquote[1].trim();

  // Fall back to first non-heading, non-empty paragraph
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("**") && !trimmed.startsWith("!")) {
      return trimmed.slice(0, 120);
    }
  }
  return "";
}

async function loadAesthetic(filePath: string, id: string): Promise<Aesthetic | null> {
  try {
    const content = await readFile(filePath, "utf-8");
    const prefix = extractPrefix(content);
    if (!prefix) return null; // Skip files without a valid prefix
    return {
      id,
      name: formatName(path.basename(filePath)),
      prefix,
      description: extractDescription(content),
    };
  } catch {
    return null;
  }
}

export async function getAesthetics(): Promise<Aesthetic[]> {
  const aesthetics: Aesthetic[] = [];

  // Default aesthetic
  const defaultPath = path.join(SKILL_ROOT, "aesthetic.md");
  const defaultAesthetic = await loadAesthetic(defaultPath, "default");
  if (defaultAesthetic) {
    defaultAesthetic.name = "Default";
    aesthetics.push(defaultAesthetic);
  }

  // Custom aesthetics in aesthetics/ subdirectory
  const aestheticsDir = path.join(SKILL_ROOT, "aesthetics");
  try {
    const files = await readdir(aestheticsDir);
    for (const file of files.filter((f) => f.endsWith(".md"))) {
      const id = file.replace(/\.md$/, "");
      const aesthetic = await loadAesthetic(path.join(aestheticsDir, file), id);
      if (aesthetic) aesthetics.push(aesthetic);
    }
  } catch {
    // aesthetics/ directory may not exist — that's fine
  }

  return aesthetics;
}
