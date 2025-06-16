import OpenAI from "openai";
import dotenv from "dotenv";
import * as XLSX from "xlsx";
import * as fs from "fs";
import path from "path";

dotenv.config();


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const excelPath = path.join(process.cwd(), "app", "data", "DE-STAP-Export-2025-May-23-1039.xlsx");

// Define type for Excel rows
type ExcelRow = {
  Category?: string;
  Link?: string;
  Description?: string;
  [key: string]: any; // For Column 24 or any extra columns
};

let rows: any[][] = [];
let dataRows: any[][] = [];

import { writeFileSync, readFileSync, existsSync } from "fs";

type EmbeddedRow = { row: any[]; embedding: number[] };

const rowsWithEmbeddings: EmbeddedRow[] = [];

// Utility: Compute cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

// Utility: Get OpenAI embedding
async function getEmbedding(text: string): Promise<number[]> {
  const result = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return result.data[0].embedding;
}

// Load Excel rows and precompute embeddings
function loadExcelData() {
  if (!existsSync(excelPath)) {
    console.error(`Excel file not found: ${excelPath}`);
    return;
  }
  const fileBuffer = readFileSync(excelPath);
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  dataRows = rows.slice(1); // remove header row
  console.log(`✅ Loaded ${dataRows.length} data rows`);
}

// Embedding generation & caching
const EMBEDDINGS_CACHE_PATH = "./embeddings-cache.json";

async function prepareEmbeddingsForRows() {
  if (existsSync(EMBEDDINGS_CACHE_PATH)) {
    const cached = JSON.parse(readFileSync(EMBEDDINGS_CACHE_PATH, "utf-8"));
    cached.forEach((item: any) =>
      rowsWithEmbeddings.push({ row: item.row, embedding: item.embedding })
    );
    console.log("✅ Loaded cached embeddings.");
    return;
  }

  console.log("⚙️ Generating embeddings for rows...");
  for (const row of dataRows) {
    const desc = (row[3] || "").toString().trim();
    if (!desc) continue;
    const embedding = await getEmbedding(desc);
    rowsWithEmbeddings.push({ row, embedding });
  }

  // Save to file
  writeFileSync(EMBEDDINGS_CACHE_PATH, JSON.stringify(rowsWithEmbeddings, null, 2));
  console.log("✅ Embeddings cached to disk.");
}

// Helper: Get cached embedding for a row
function getCachedEmbeddingForRow(row: any[]): number[] {
  const found = rowsWithEmbeddings.find((item) =>
    item.row === row
  );
  return found ? found.embedding : [];
}

// Your enhancedScore function, slightly improved with critical word multiplier
/*function enhancedScore(userPromptEmbedding: number[], promptWords: string[], row: any[]): number {
  const description = (row[3] || "").toLowerCase();
  const descriptionWords = new Set(description.split(/\W+/));

  // Critical words that should boost score more heavily
  const criticalWords = ["suicide", "jump", "bridge", "cutting", "self-harm", "kill", "depressed"];

  let keywordScore = 0;
  for (const word of promptWords) {
    if (descriptionWords.has(word)) {
      const boostWords = ["work", "bully", "suicide", "depressed", "stress"];
      keywordScore += boostWords.includes(word) ? 2 : 1;
    }
  }

  // Boost score more if critical words are present in prompt
  const criticalHit = promptWords.some((w) => criticalWords.includes(w));
  if (criticalHit) {
    keywordScore *= 5; // Increase this multiplier as you see fit
  }

  const rowEmbedding = getCachedEmbeddingForRow(row);
  const similarity = cosineSimilarity(userPromptEmbedding, rowEmbedding);

  // Weighted final score
  return similarity * 0.7 + keywordScore * 0.3;
}*/

// Setup on startup
loadExcelData();

await prepareEmbeddingsForRows();

// Category map from earlier
const categoryCodes = ["[c]", "[m]", "[g]", "[j]", "[k]", "[z]", "[d]"];
const categoryCodeToName: Record<string, string> = {};
const uniqueCategories = Array.from(new Set(dataRows.map(r => r[24]))).filter(c => !c.includes("|"));

categoryCodes.forEach((code, index) => {
  categoryCodeToName[code] = uniqueCategories[index] || "Unknown category";
});

// Main chat handler using semantic search + enhanced scoring
export async function chatHandler(prompt: string, history: any[] = []) {
  const articleOptions = rowsWithEmbeddings.map(({ row }) => ({
    title: row[1],
    description: row[3],
    category: row[24],
  }));

  const messages = [
    {
      role: "system",
      content: `
You are Janick, a warm, compassionate assistant.
Speak naturally and kindly, like a caring human. Ask thoughtful, empathetic questions to understand the user's needs.
You are here to recommend articles — not give advice yourself.
the users you'll be talking to are often low-literate, so try to stick to A2 level and keep anwers short so they won't get overwhelmed

You may recommend **ONE** article ONLY IF:
- The user clearly asks for help or information (e.g. "Can you help me?", "Do you have something I can read?")
- AND you're confident that one of the available articles **directly addresses their exact issue**

If you're not sure — ask more questions or offer supportive responses, but DO NOT guess or recommend the wrong article.

When recommending, include this special format exactly:
[article: "TITLE OF ARTICLE"]

ALWAYS Say this at the very end, the article should be last 
Never recommend more than one article at a time.
Never invent articles. Use ONLY the following list:

${articleOptions.map((a) => `- "${a.title}" (${a.category})`).join("\n")}

At the end of every message, ALWAYS include one of the following category codes:

if a user in the current message is talking about their health and fitness (think of topics like eating healthy, sleeping well, stay fit, dealing with illness, smoking, alcohol, drugs, gambling, sex and intemecy) return '[g]'
if a user in the current message is talking about their mental health (think of topics like less stress, coming up for yourself, dealing with setbacks, healthy brain, happy with yourself) return '[m]'
if a user in the current message is talking about their meaningful life (think of your own life, work, learning, getting your shit together, after your pension) return '[z]'
if a user in the current message is talking about their quality of life (think of staying in balance, enjoying, feeling safe) return '[k]'
if a user in the current message is talking about their contact with others (think of topics like staying in contact, elder care, difference between people, paricipating in the neighbourhood, volunteer work) return '[c]'
if a user in the current message is talking about caring about themselves (think of topics like handling money, deviding their time, raising kids, being able to live on their own, using computers) return '[j]'
if there are no possible boxes to fit the current message in, return '[d]'

Examples:
- "What do you usually have for breakfast? [g]"
- "Can I ask how long you've been feeling this way? [m]"
- "This guide might help you feel more in control: [article: "Regaining control over your finances"] [j]"
- "This article about gambling addictions could be helpful: [article: ] [g]"  
`,
    },
    ...history,
    { role: "user", content: prompt },
  ];

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
  });

  let rawMessage = result.choices[0].message?.content?.trim() || "I'm not sure how to respond. [d]";
  const categoryMatch = rawMessage.match(/\[(g|m|z|k|c|j|d)\]/i);
  const categoryCode = categoryMatch ? `[${categoryMatch[1].toLowerCase()}]` : "[d]";
  const removeColorCode = (text: string) => text.replace(/\[[gmzkcjd]\]/gi, "").trim();

  // 🔍 Article extraction
  let article = null;
  const articleMatch = rawMessage.match(/\[article:\s*"(.+?)"\]/i);
  if (articleMatch) {
    const articleTitle = articleMatch[1].toLowerCase();
    const found = rowsWithEmbeddings.find(({ row }) => (row[1] || "").toLowerCase() === articleTitle);
    if (found) {
      article = {
        title: found.row[1],
        link: found.row[6],
      };
    }
    rawMessage = rawMessage.replace(articleMatch[0], "").trim();
  }
  console.log(rawMessage)
  return {
    message: removeColorCode(rawMessage),
    colorCode: categoryCode,
    article,
  };
}
