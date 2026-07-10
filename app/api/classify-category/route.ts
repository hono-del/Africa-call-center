import { NextResponse } from "next/server";
import { classifyCategory, isValidCategoryKey } from "@/lib/classifyCategory";

export async function POST(req: Request) {
  const { query } = await req.json().catch(() => ({ query: "" }));
  if (!query || typeof query !== "string") {
    return NextResponse.json({ result: null });
  }

  const result = classifyCategory(query);

  if (!result || !isValidCategoryKey(result.categoryKey)) {
    return NextResponse.json({ result: null });
  }

  return NextResponse.json({ result });
}
