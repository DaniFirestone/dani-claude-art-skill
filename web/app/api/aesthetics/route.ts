import { NextResponse } from "next/server";
import { getAesthetics } from "@/lib/aesthetics";

export async function GET() {
  try {
    const aesthetics = await getAesthetics();
    return NextResponse.json(aesthetics);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
