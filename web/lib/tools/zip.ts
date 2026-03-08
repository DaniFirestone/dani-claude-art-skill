import { zipSync, strToU8 } from "fflate";
import { downloadBlob } from "./download";

export interface ZipEntry {
  name: string;
  data: Uint8Array;
}

export function downloadZip(entries: ZipEntry[], filename: string) {
  const files: Record<string, Uint8Array> = {};
  for (const entry of entries) {
    files[entry.name] = entry.data;
  }
  const zipped = zipSync(files);
  const blob = new Blob([new Uint8Array(zipped)], { type: "application/zip" });
  downloadBlob(blob, filename);
}
