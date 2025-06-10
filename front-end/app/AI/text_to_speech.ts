import { ElevenLabsClient, play } from "@elevenlabs/elevenlabs-js";
import { Readable } from "stream";
import dotenv from "dotenv";
dotenv.config();

export const speakWithElevenLabs = async (text: string) => {
  const apiKey = process.env.ELEVENLABS_API_KEY || ""; // Or use private var on backend
  const voiceId = "JBFqnCBsd6RMkjVDRZzb"; // Adjust as needed

  if (!apiKey) {
    console.error("ElevenLabs API key is missing.");
    return;
  }
const elevenlabs = new ElevenLabsClient({
    apiKey: apiKey,
});
  try {
    const audio = await elevenlabs.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
    text: text,
    modelId: "eleven_multilingual_v2",
});
const readableAudio = Readable.from(audio);
const audioBuffer = await streamToBuffer(readableAudio);
return audioBuffer;
}
  catch(err){
  console.error(`AAAAAAAAAH I JUST SHIT MYSELF AND GOT ${err} PLEASE SOMEONE SAVE ME`)
  return null;
  }
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}