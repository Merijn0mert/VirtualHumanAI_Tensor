import { NextResponse } from "next/server";
import { speakWithElevenLabs } from "@/app/AI/text_to_speech";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing or invalid text" }, { status: 400 });
    }

    const audioBuffer = await speakWithElevenLabs(text);

    if (!audioBuffer) {
      return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 });
    }

    // Return audio data with proper headers
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg", // or "audio/wav" / "audio/webm" based on output format
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
