import { NextResponse } from "next/server";
import { chatHandler } from "@/app/AI/chat";

export async function POST(req: Request) {
  try {
    const { prompt, history } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // Call your AI handler with prompt and history
    const reply = await chatHandler(prompt, history);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
