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

/*function loadLinksFromExcel(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Excel file not found: ${filePath}`);
    return {};
  }
  console.log("Excel path:", filePath);
  console.log("File exists?", fs.existsSync(filePath));

  const fileBuffer = fs.readFileSync(filePath);

// Parse buffer to workbook
  const workbook = XLSX.read(fileBuffer, {type: 'buffer'});

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

// Now you can process the sheet data
  const data = XLSX.utils.sheet_to_json(sheet);
  const rows = XLSX.utils.sheet_to_json(sheet, {header: 1}) as (string | number | undefined)[][];
  const categoryColumn = rows.map(row => row[24])
  const uniqueCategories = Array.from(new Set(categoryColumn)).filter(cat => !cat.includes('|'))
  const categoryLinks: Record<string, { Link: string; Description: string }[]> = {};
  const links = rows.map(row => row[6])

  const categoryCodeMap: Record<string, string> = {
      "Gezond en fit": "[g]",
      "mentaal sterk": "[m]",
      "Zinvol leven": "[z]",
      "Positieve gezondheid": "[k]",
      "Contact met andere": "[c]",
      "Voor jezelf zorgen": "[j]",
    };


  // Extract rows where column 24 === "Gezond en fit"
  const targetCategory = "Gezond en fit";
  const zooi = "[g]";
  rows.forEach((row) => {
    if (row[24] === categoryCodeMap[zooi]) {
      console.log('first row ', row[24],': ', row[1]); // First column
    }
  });*/


  /*for (const row of data) {
// column Y (zero-based index 24)
    const link = rows.map(row => row[6]);    // adjust index if 'Link' is in another column
    const description = rows.map(row => row[3]);  // adjust index for 'Description'

    //const data = XLSX.utils.sheet_to_json<ExcelRow>(sheet);
    const categorizedLinks: Record<string, { Link: string; Description: string; Column24?: any }[]> = {};

    for (const column of data) {
      const category = column.Category; // e.g., '[g]', '[m]', etc.
      if (!category) continue;

      const col24 = column["Column 24 Header"] || column[Object.keys(column)[23]]; // Tries name first, then 24th field
      if (!categorizedLinks[category]) categorizedLinks[category] = [];

      categorizedLinks[category].push({
        Link: column.Link ?? "No link",
        Description: column.Description ?? "No description",
        Column24: col24,
      });
    }
    return categorizedLinks;
  }*/
//}

// Load once at startup
  //const categorizedLinks = loadLinksFromExcel(excelPath);

 /* export async function chatHandler(prompt: string, history: any[] = []) {
    const messages = [
      {
        role: "system",
        content: `
        you have to return the following and the following only,
        if a user in the current message is talking about their health and fitness ... return '[g]'
        if a user in the current message is talking about their mental health ... return '[m]'
        if a user in the current message is talking about their meaningful life ... return '[z]'
        if a user in the current message is talking about their quality of life ... return '[k]'
        if a user in the current message is talking about their contact with others ... return '[c]'
        if a user in the current message is talking about caring about themselves ... return '[j]'
      `,
      },
      ...history,
      {role: "user", content: prompt},
    ];

    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    const category = chat.choices[0].message?.content?.trim();
    console.log("Detected category:", category);

    return category ?? "uhhh";
  }*/
// Somewhere global or imported:
// Add near your imports
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
function enhancedScore(userPromptEmbedding: number[], promptWords: string[], row: any[]): number {
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
}

// Setup on startup
loadExcelData();

await prepareEmbeddingsForRows();

// Category map from earlier
const categoryCodes = ["[c]", "[m]", "[g]", "[j]", "[k]", "[z]"];
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
        you have to return the following and the following only,
        if a user in the current message is talking about their health and fitness (think of topics like eating healthy, sleeping well, stay fit, dealing with illness, smoking, alcohol, drugs, gambling, sex and intimacy) return '[g]'
        if a user in the current message is talking about their mental health (think of topics like less stress, coming up for yourself, dealing with setbacks, healthy brain, happy with yourself) return '[m]'
        if a user in the current message is talking about their meaningful life (think of your own life, work, learning, getting your shit together, after your pension) return '[z]'
        if a user in the current message is talking about their quality of life (think of staying in balance, enjoying, feeling safe) return '[k]'
        if a user in the current message is talking about their contact with others (think of topics like staying in contact, elder care, difference between people, participating in the neighbourhood, volunteer work) return '[c]'
        if a user in the current message is talking about caring about themselves (think of topics like handling money, dividing their time, raising kids, being able to live on their own, using computers) return '[j]'
      `,
    },
    ...history,
    { role: "user", content: prompt },
  ];
  const promptWords = prompt.toLowerCase().split(/\W+/).filter(w => w.length > 2);

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
  });

  const validCategories = ["[g]", "[m]", "[z]", "[k]", "[c]", "[j]"];
  const criticalWords = ["suicide", "jump", "bridge", "cutting", "self-harm", "kill", "depressed", "die"];
  const categoryCode = result.choices[0].message?.content?.trim();
  const hasCriticalWord = promptWords.some(word => criticalWords.includes(word));

  if (!categoryCode || !validCategories.includes(categoryCode)) {
    if (hasCriticalWord) {
      const empathicPrompt = `
            You are a compassionate assistant. The user might be feeling suicidal or in crisis.
            Please respond with empathy, encouragement, and recommend calling the suicide prevention hotline (113).
            Make sure the tone is gentle and supportive.
            Here is the user message:
            "${prompt}"
          `;

          const empathicResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "You are a compassionate and empathetic assistant." },
              { role: "user", content: empathicPrompt },
            ],
          });

          return empathicResponse.choices[0].message?.content ?? "I'm here to help. Please consider calling the suicide prevention hotline at 113.";
    } else {
      return `😕 Sorry, I couldn't understand what you’re asking. Can you rephrase it?`;
    }
  }



  const categoryName = categoryCodeToName[categoryCode];
  const queryEmbedding = await getEmbedding(prompt);



  let bestRow: any[] | null = null;
  let bestScore = -Infinity;

  for (const { row, embedding } of rowsWithEmbeddings) {
    if (row[24] !== categoryName) continue;

    const score = enhancedScore(queryEmbedding, promptWords, row);
    if (score > bestScore) {
      bestScore = score;
      bestRow = row;
    }
  }

  if (!bestRow) {
    return `No results found in category "${categoryName}".`;
  }

  const title = bestRow[1] || "Untitled";
  const link = bestRow[6] || "No link";

  return `📌 **${title}**\n🔗 ${link}`;
}
