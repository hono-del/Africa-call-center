import { NextResponse } from "next/server";
import { searchManual } from "@/lib/manualSearch";

export async function POST(req: Request) {
  const { query } = await req.json().catch(() => ({ query: "" }));
  if (!query || typeof query !== "string") {
    return NextResponse.json({ results: [] });
  }
  const results = searchManual(query, 5).map((h) => ({
    id: h.id,
    section: h.section,
    page: h.page,
    score: h.score,
    // Keep the snippet short for the UI
    snippet: h.text.length > 260 ? h.text.slice(0, 260) + "…" : h.text
  }));
  return NextResponse.json({ results });
}
