import { OpenAI } from "openai";
import type { NextApiRequest, NextApiResponse } from "next";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Missing text." });

  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Speech generation failed." });
  }
}
