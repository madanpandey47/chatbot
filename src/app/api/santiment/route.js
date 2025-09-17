import { NextResponse } from "next/server";
import { fetchSantimentInsights } from "@/lib/santiment";

const RATE_LIMIT_WINDOW_MS = 10_000;
const RATE_LIMIT_MAX = 8;
const rateMap = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip) || { count: 0, ts: now };
  if (now - entry.ts > RATE_LIMIT_WINDOW_MS) {
    entry.count = 0; entry.ts = now;
  }
  entry.count += 1;
  rateMap.set(ip, entry);
  return entry.count > RATE_LIMIT_MAX;
}

export async function GET(req) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Rate limit" }, { status: 429 });
  }
  const { searchParams } = new URL(req.url);
  const asset = searchParams.get("asset") || "BTC";
  const timeframe = searchParams.get("timeframe") || "24h";
  try {
    const data = await fetchSantimentInsights({ asset, timeframe });
    return NextResponse.json(data, { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=30" } });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


