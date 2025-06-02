import { ElevenLabsClient, play } from "@elevenlabs/elevenlabs-js";
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

    await play(audio);
}
  catch(err){
  console.error(`AAAAAAAAAH I JUST SHIT MYSELF AND GOT ${err} PLEASE SOMEONE SAVE ME`)
  }
}
