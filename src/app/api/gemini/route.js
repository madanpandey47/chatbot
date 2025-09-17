import { NextResponse } from "next/server";
import { generateAnswer } from "../../../lib/gemini";

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, history = [] } = body || {};
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }
    const result = await generateAnswer({ message, history });
    return NextResponse.json({ message: result.text });
  } catch (err) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}


