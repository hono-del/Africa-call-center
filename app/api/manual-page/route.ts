import { NextResponse } from "next/server";
import PAGES from "@/data/manualPages.json";

const TOTAL = 468;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const p = Math.max(1, Math.min(TOTAL, Number(url.searchParams.get("p") ?? 1)));
  const text = (PAGES as Record<string, string>)[String(p)] ?? "";
  return NextResponse.json({ page: p, total: TOTAL, text });
}
