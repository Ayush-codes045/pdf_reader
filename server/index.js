// import dotenv from "dotenv";
// dotenv.config({ path: './server/.env' });
process.env.CLERK_PUBLISHABLE_KEY="pk_test_Z3VpZGluZy1yZWluZGVlci00Ni5jbGVyay5hY2NvdW50cy5kZXYk";
process.env.CLERK_SECRET_KEY="sk_test_pHBbwd7BN0J2J47uTZ5XNgd2zHKifbRqkoh3hc9veC";
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";
import { Queue } from "bullmq";
import { requireAuth } from "@clerk/express";



const app = express();
app.use(cors());

const client = new OpenAI({
  apiKey: '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', // 🔐 Replace with your actual OpenAI key
});

const queue = new Queue("file-upload-queue", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

// 👤 Per-user upload folder logic
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.auth().userId;
    const userDir = path.join("uploads", userId);
    fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage });

app.get("/", (req, res) => {
  res.send("✅ Server running");
});

// 👤 Secure file serving
app.get("/uploads/:userId/:filename", requireAuth(), (req, res) => {
  const { userId, filename } = req.params;
  const requesterId = req.auth().userId;

  if (userId !== requesterId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const filePath = path.join("uploads", userId, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.sendFile(path.resolve(filePath));
});

// 📄 Upload PDF
app.post("/upload/pdf", requireAuth(), upload.single("pdf"), async (req, res) => {
  const userId = req.auth().userId;

  await queue.add("file-ready", {
    filename: req.file.originalname,
    destination: req.file.destination,
    path: req.file.path,
    userId,
  });

  res.json({ message: "Uploaded successfully" });
});

// 💬 Chat endpoint
app.get("/chat", requireAuth(), async (req, res) => {
  const userId = req.auth().userId;
  const query = req.query.message;
  const collection = `langchainjs-testing-${userId}`;

  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey:'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', // 🔐 Again, insert your real key
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: "http://localhost:6333",
    collectionName: collection,
  });

  const retriever = vectorStore.asRetriever({
    searchType: "mmr",
    searchKwargs: {
      k: 3,
      lambdaMult: 0.5,
    },
  });

  const results = await retriever.invoke(query);

  const SYSTEM_PROMPT = `
You are a helpful AI assistant. Use only the context below to answer the user's question.

Context:
${JSON.stringify(results)}
`;

  const chat = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: query },
    ],
  });

  res.json({
    message: chat.choices[0].message.content,
    docs: results,
  });
});

app.listen(8000, () => {
  console.log("🚀 Server running at http://localhost:8000");
});
