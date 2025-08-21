import dotenv from "dotenv";
dotenv.config();
import { Worker } from 'bullmq';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

const worker = new Worker(
  'file-upload-queue',
  async (job) => {
    try {
      console.log('Job:', job.data);

      // If job.data is already an object, no need to parse
      const data = typeof job.data === 'string' ? JSON.parse(job.data) : job.data;

      // Load the PDF
      const loader = new PDFLoader(data.path);
      const docs = await loader.load();

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const splitDocs = await splitter.splitDocuments(docs);

      console.log('Split Doc 1:', splitDocs);

      // Each chunk of text (from a split document) is embedded separately

      const embeddings = new OpenAIEmbeddings({
        model: 'text-embedding-3-small',
        apiKey: process.env.OPENAI_API_KEY
      });

      // Use per-user collection name
      const userCollection = data.userId ? `langchainjs-testing-${data.userId}` : 'langchainjs-testing';

      const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
          url: 'http://localhost:6333',
          collectionName: userCollection,
        }
      );

      await vectorStore.addDocuments(splitDocs);
      console.log(`All docs are added to vector store for user ${data.userId}`);

    } catch (err) {
      console.error('Worker Error:', err);
    }
  },
  {
    concurrency: 100,
    connection: {
      host: 'localhost',
      port: '6379', 
    },
  }
);