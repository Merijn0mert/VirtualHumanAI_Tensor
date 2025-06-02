import formidable from "formidable";
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";

import OpenAI  from "openai";
import dotenv from "dotenv";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});

export async function speechHandler(req: NextApiRequest, res: NextApiResponse) {


  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "File parsing error." });

    const file = Array.isArray(files.audio) ? files.audio[0] : files.audio;
    if (!file || !file.filepath) {
      return res.status(400).json({ error: "No audio file received." });
    }
    const audioStream = fs.createReadStream(file.filepath);

    try {
      const transcript = await openai.audio.transcriptions.create({
        file: audioStream,
        model: "whisper-1",
      });
      res.status(200).json({ text: transcript.text });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Transcription failed." });
    }
  });
}
