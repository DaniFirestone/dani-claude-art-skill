export interface ColorValue {
  hex: string;
  rgb: [number, number, number];
  hsl: [number, number, number];
}

export interface ImageFile {
  name: string;
  data: Blob;
  width: number;
  height: number;
  type: string;
}

export interface ExportOptions {
  format: "png" | "jpeg" | "webp" | "svg";
  quality?: number;
  filename?: string;
}

export type ToolCategory =
  | "content"
  | "design"
  | "utility";
