import { NextResponse } from "next/server";
import { speakWithElevenLabs } from "@/app/AI/text_to_speech";

export async function POST(text:string) {
  try {

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    await speakWithElevenLabs(text);

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
