import path from "path";

// Resolves to <repo>/skills/art regardless of how `next dev` is invoked,
// as long as the working directory is web/ (which Next.js ensures).
export const SKILL_ROOT = path.resolve(process.cwd(), "../skills/art");
