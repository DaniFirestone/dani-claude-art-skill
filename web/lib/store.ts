"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Model, AspectRatio, GeminiSize, ThinkingLevel } from "./gemini";

export interface FormValues {
  prompt: string;
  model: Model;
  size: GeminiSize;
  aspectRatio: AspectRatio;
  thinking: ThinkingLevel;
  grounded: boolean;
  transparent: boolean;
  variations: number;
  referenceImageDataUrl: string | null;
  referenceImageName: string | null;
}

export interface GenerationResult {
  imageUrls: string[];
  groundingSources?: { title: string; uri: string }[];
  textResponse?: string;
  finalPrompt: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  imageUrl: string;
  prompt: string;
  model: Model;
  size: GeminiSize;
  aspectRatio: AspectRatio;
}

interface ArtStudioState {
  selectedWorkflowId: string | null;
  setSelectedWorkflowId: (id: string | null) => void;

  // Workflow sub-type (e.g. "Sequence diagram" within Flow & Sequence)
  selectedWorkflowType: string | null;
  setSelectedWorkflowType: (type: string | null) => void;

  selectedAestheticId: string;
  setSelectedAestheticId: (id: string) => void;
  aestheticPrefix: string;
  setAestheticPrefix: (prefix: string) => void;

  formValues: FormValues;
  setFormValues: (values: Partial<FormValues>) => void;

  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  generationResult: GenerationResult | null;
  setGenerationResult: (r: GenerationResult | null) => void;
  error: string | null;
  setError: (e: string | null) => void;

  history: HistoryEntry[];
  addToHistory: (entry: HistoryEntry) => void;
  clearHistory: () => void;
}

const DEFAULT_FORM: FormValues = {
  prompt: "",
  model: "nano-banana-2",
  size: "2K",
  aspectRatio: "16:9",
  thinking: "minimal",
  grounded: false,
  transparent: false,
  variations: 1,
  referenceImageDataUrl: null,
  referenceImageName: null,
};

export const useArtStudioStore = create<ArtStudioState>()(
  persist(
    (set) => ({
      selectedWorkflowId: null,
      setSelectedWorkflowId: (id) => set({ selectedWorkflowId: id }),

      selectedWorkflowType: null,
      setSelectedWorkflowType: (type) => set({ selectedWorkflowType: type }),

      selectedAestheticId: "default",
      setSelectedAestheticId: (id) => set({ selectedAestheticId: id }),
      aestheticPrefix: "",
      setAestheticPrefix: (prefix) => set({ aestheticPrefix: prefix }),

      formValues: DEFAULT_FORM,
      setFormValues: (values) =>
        set((state) => ({ formValues: { ...state.formValues, ...values } })),

      isGenerating: false,
      setIsGenerating: (v) => set({ isGenerating: v }),
      generationResult: null,
      setGenerationResult: (r) => set({ generationResult: r }),
      error: null,
      setError: (e) => set({ error: e }),

      history: [],
      addToHistory: (entry) =>
        set((state) => ({
          history: [entry, ...state.history].slice(0, 20),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "art-studio-storage",
      partialize: (state) => ({
        history: state.history,
        selectedAestheticId: state.selectedAestheticId,
        selectedWorkflowId: state.selectedWorkflowId,
      }),
    }
  )
);

// --- Campaign / Marketing Store ---

export type Tone = "professional" | "witty" | "urgent" | "inspirational";

export interface PlatformContent {
  platform: string;
  text: string;
  imagePrompt: string;
  aspectRatio: string;
  imageUrl: string | null;
  imageStatus: "idle" | "generating" | "done" | "error";
}

export interface Campaign {
  id: string;
  title: string;
  idea: string;
  businessContext: string;
  tone: Tone;
  aestheticId: string;
  model: Model;
  size: GeminiSize;
  platforms: Record<string, PlatformContent>;
  createdAt: number;
  updatedAt: number;
  status: "draft" | "generating" | "complete";
}

interface MarketingState {
  campaigns: Campaign[];
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;

  activeCampaignId: string | null;
  setActiveCampaignId: (id: string | null) => void;
}

export const useMarketingStore = create<MarketingState>()(
  persist(
    (set) => ({
      campaigns: [],
      addCampaign: (campaign) =>
        set((state) => ({ campaigns: [campaign, ...state.campaigns] })),
      updateCampaign: (id, updates) =>
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
          ),
        })),
      deleteCampaign: (id) =>
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
        })),

      activeCampaignId: null,
      setActiveCampaignId: (id) => set({ activeCampaignId: id }),
    }),
    {
      name: "marketing-engine-storage",
      partialize: (state) => ({
        campaigns: state.campaigns,
      }),
    }
  )
);
