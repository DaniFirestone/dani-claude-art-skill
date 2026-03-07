import type { Model } from "./gemini";

export const COST_PER_IMAGE: Record<Model, number> = {
  "nano-banana-2": 0.067,
  "nano-banana-pro": 0.134,
};

export function estimateCost(model: Model, variations: number): number {
  return COST_PER_IMAGE[model] * variations;
}

export function formatCost(usd: number): string {
  return usd < 0.01 ? "<$0.01" : `~$${usd.toFixed(2)}`;
}
