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
  const messages = [
    {
      role: "system",
      content: `
You are a helpful, compassionate assistant named Vita. 
You talk like a human, ask empathetic follow-up questions, and recommend useful articles only when you're sure they help.

At the end of every message, include one of the following category codes to indicate what the user is talking about:

- [g] health & fitness (eating healthy, sleep, fitness, illness, addiction, sex, etc.)
- [m] mental health (stress, setbacks, happiness, brain health, self-esteem)
- [z] meaningful life (career, learning, motivation, planning, post-retirement)
- [k] quality of life (balance, joy, safety)
- [c] contact with others (relationships, care, diversity, community)
- [j] self-reliance (money, time, parenting, independence, tech)
- [d] unclear or general

Examples:
- "That sounds like a tough situation. Can you tell me more? [m]"
- "Here's something that might help you feel better at work: [z]"

NEVER explain the categories — just include the correct one at the end of your message.
Only suggest an article if you're sure it's helpful in that moment.
`,
    },
    ...history,
    { role: "user", content: prompt },
  ];

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
  });

  const rawMessage = result.choices[0].message?.content?.trim() || "I'm not sure how to respond. [d]";

  // Extract category code like [g], [m], etc.
  const categoryMatch = rawMessage.match(/\[(g|m|z|k|c|j|d)\]/i);
  const categoryCode = categoryMatch ? `[${categoryMatch[1].toLowerCase()}]` : "[d]";
  const categoryName = categoryCodeToName[categoryCode] ?? "Unknown";

  // Should we suggest an article? You can customize this:
  const shouldSuggestArticle = /article|this might help|could help|check this/i.test(rawMessage);

  let article = null;
  const removeColorCode = (text: string) => text.replace(/\[[gmzkcjd]\]/gi, "").trim();

  if (shouldSuggestArticle) {
    const queryEmbedding = await getEmbedding(prompt);
    let bestRow: any[] | null = null;
    let bestSimilarity = -Infinity;

    for (const { row, embedding } of rowsWithEmbeddings) {
      if (row[24] !== categoryName) continue;

      const similarity = cosineSimilarity(queryEmbedding, embedding);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestRow = row;
      }
    }

    if (bestRow) {
      article = {
        title: bestRow[1] || "Untitled",
        link: bestRow[6] || "No link",
      };
    }
  }

  return {
    message: removeColorCode(rawMessage),
    colorCode: categoryCode,
    article,

  };
}
