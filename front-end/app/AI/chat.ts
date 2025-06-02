import OpenAI  from "openai";
import dotenv from "dotenv";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});

export async function chatHandler(prompt: string, history: any[] = []) {
  const messages = [
    {
      role: "system",
      content:
        "Help gebruikers op een vriendelijke en empathische manier. Stel vragen om hen beter te begrijpen, zoals hun leeftijd, hoe ze zich voelen, en wat ze zoeken. Antwoord standaard in het Nederlands, tenzij de gebruiker in een andere taal met je praat. Als je in een andere taal wordt aangesproken, reageer in die taal.",
    },
    ...history,
    { role: "user", content: prompt },
  ];

  const chat = await openai.chat.completions.create({
    model: "gpt-4o-mini", // or "gpt-4o-mini" if supported
    messages,
  });
  console.log(chat.choices[0].message?.content ?? "Geen antwoord ontvangen.")
  return chat.choices[0].message?.content ?? "Geen antwoord ontvangen.";
}