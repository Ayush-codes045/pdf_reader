# PDF Reader AI

This project is a full-stack web application that allows users to upload PDF documents and interact with them through an AI-powered chat interface. It leverages Large Language Models (LLMs) to understand document content, enabling users to ask questions and receive context-aware, referenced answers.

The system is built with a distributed architecture, using a background worker queue to process and embed PDF documents asynchronously, ensuring a responsive user experience even with large files.

## Features

- **Secure User Authentication**: Employs Clerk for robust user sign-up, sign-in, and session management.
- **Per-User Document Isolation**: Each user's documents are stored and processed in isolated environments, ensuring data privacy and security.
- **Asynchronous PDF Processing**: Utilizes a BullMQ and Redis-based queue to handle PDF parsing, chunking, and embedding in the background, preventing UI blocking.
- **Conversational AI Chat**: Interact with your documents by asking questions in natural language.
- **Semantic Search**: Powered by OpenAI embeddings and a Qdrant vector database to find the most relevant information within your documents.
- **Source-Cited Answers**: AI-generated responses include direct references to the source page numbers and content snippets from the original PDF.

## Technology Stack

The project is a monorepo containing a `client` and a `server` application.

| Area                    | Technology                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Frontend**            | [Next.js](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)           |
| **Backend**             | [Node.js](https://nodejs.org/), [Express](https://expressjs.com/)                                             |
| **Authentication**      | [Clerk](https://clerk.com/)                                                                                 |
| **AI / LLM**            | [OpenAI](https://openai.com/) (GPT-4.1, text-embedding-3-small), [LangChain.js](https://js.langchain.com/) |
| **Vector Database**     | [Qdrant](https://qdrant.tech/)                                                                              |
| **Background Jobs**     | [BullMQ](https://bullmq.io/)                                                                                |
| **Queue & Cache**       | [Valkey](https://valkey.io/) (Redis-compatible)                                                             |
| **Containerization**    | [Docker](https://www.docker.com/)                                                                           |
| **File Uploads**        | [Multer](https://github.com/expressjs/multer)                                                               |

## System Architecture

The application is composed of several key services that work together:

1.  **Next.js Client**: The user-facing web application where users sign in, upload PDFs, and interact with the chat interface.
2.  **Express Server**: The backend API that handles authentication middleware, file uploads, and chat requests.
3.  **Valkey (Redis)**: Manages the message queue for background jobs.
4.  **BullMQ Worker**: A dedicated Node.js process that listens for `file-upload-queue` jobs. It processes PDFs by loading, chunking, and creating vector embeddings.
5.  **Qdrant**: A vector database that stores the embeddings for efficient semantic search.
6.  **OpenAI API**: Used for generating text embeddings and powering the conversational chat responses.

### Data Flow for PDF Processing
- A user uploads a PDF.
- The **Express server** receives the file, saves it to a user-specific directory, and adds a processing job to the **Valkey** queue.
- The **BullMQ worker** picks up the job, parses the PDF, splits it into text chunks, and generates vector embeddings using the **OpenAI API**.
- The worker stores these embeddings in a user-specific collection within **Qdrant**.

### Data Flow for Chat Interaction
- The user sends a message through the **Next.js client**.
- The request is sent to the **Express server**.
- The server creates an embedding for the user's query and searches **Qdrant** for the most relevant document chunks.
- The retrieved chunks and the user's query are sent to the **OpenAI API** as context.
- The AI's response, along with source citations, is streamed back to the client.

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or later)
- [Docker](https://www.docker.com/get-started/)
- An [OpenAI API Key](https://platform.openai.com/api-keys)
- A [Clerk](https://clerk.com/) account and application credentials

### 1. Clone the Repository

```bash
git clone https://github.com/Ayush-codes045/pdf_reader.git
cd pdf_reader
```

### 2. Configure Environment Variables

**Backend Server:**

Navigate to the `server` directory and create a `.env` file. Add the following environment variables:

```ini
# server/.env

# OpenAI API Key
OPENAI_API_KEY="sk-..."

# Clerk Secret Key
CLERK_SECRET_KEY="sk_..."
```

**Frontend Client:**

Navigate to the `client` directory and create a `.env.local` file. Add your Clerk Publishable Key:

```ini
# client/.env.local

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
```

### 3. Start Infrastructure Services

Start the Qdrant and Valkey (Redis) services using Docker Compose.

```bash
docker-compose up -d
```

This will run the vector database on `http://localhost:6333` and the queue service on `localhost:6379`.

### 4. Install Dependencies

Install the necessary Node.js packages for both the client and server.

```bash
# In the /server directory
npm install

# In the /client directory
npm install
```

### 5. Run the Applications

You will need three separate terminal windows to run all parts of the application.

**Terminal 1: Start the Backend Server**
```bash
# Navigate to the /server directory
npm run dev
# Server will be running on http://localhost:8000
```

**Terminal 2: Start the Background Worker**
```bash
# Navigate to the /server directory
npm run dev:worker
# Worker will connect to the queue and start listening for jobs
```

**Terminal 3: Start the Frontend Client**
```bash
# Navigate to the /client directory
npm run dev
# Client will be running on http://localhost:3000
```

### 6. Usage

1. Open your browser and navigate to `http://localhost:3000`.
2. Sign up or sign in using the Clerk authentication interface.
3. On the left panel, click to upload a PDF file.
4. Once the file is uploaded, the worker will begin processing it in the background. This may take a few moments depending on the file size.
5. Once processed, you can start asking questions about the document content in the chat panel on the right.
