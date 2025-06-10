import OpenAI  from "openai";
import dotenv from "dotenv";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});

export async function chatHandler(prompt: string, history: any[] = []) {
  const messages = [
    {
      role: "system",
      content: `
        you have to return the following and the following only,
        if a user in the current message is talking about their health and fitness (think of topics like eating healthy, sleeping well, stay fit, dealing with illness, smoking, alcohol, drugs, gambling, sex and intemecy) return '[g]'
        if a user in the current message is talking about their mental health (think of topics like less stress, coming up for yourself, dealing with setbacks, healthy brain, happy with yourself) return '[m]'
        if a user in the current message is talking about their meaningful life (think of your own life, work, learning, getting your shit together, after your pension) return '[z]'
        if a user in the current message is talking about their quality of life (think of staying in balance, enjoying, feeling safe) return '[k]'
        if a user in the current message is talking about their contact with others (think of topics like staying in contact, elder care, difference between people, paricipating in the neighbourhood, volunteer work) return '[c]'
        if a user in the current message is talking about caring about themselves (think of topics like handling money, deviding their time, raising kids, being able to live on their own, using computers) return '[j]'
      `
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