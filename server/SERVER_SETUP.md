# Server Environment Setup

## Required Environment Variables

The server needs the following environment variables in a `.env` file:

### 1. Clerk Authentication Keys
```env
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

**Note:** For the server, use `CLERK_PUBLISHABLE_KEY` (without `NEXT_PUBLIC_` prefix) and `CLERK_SECRET_KEY`.

### 2. OpenAI API Key
```env
OPENAI_API_KEY=sk-your_openai_api_key_here
```

## Setup Steps

1. **Get your Clerk keys:**
   - Go to https://dashboard.clerk.com/last-active?path=api-keys
   - Copy your **Publishable Key** (starts with `pk_`) and **Secret Key** (starts with `sk_`)

2. **Get your OpenAI API key:**
   - Go to https://platform.openai.com/api-keys
   - Create a new API key if you don't have one

3. **Create `.env` file in the `server` directory:**
   ```env
   CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   CLERK_SECRET_KEY=sk_test_your_actual_key_here
   OPENAI_API_KEY=sk-your_actual_openai_key_here
   ```

4. **Restart your server:**
   ```bash
   npm run dev
   ```

## Important Notes

- The `.env` file should be in the `server` directory (same level as `index.js`)
- The `.env` file is typically in `.gitignore` to keep your keys secure
- Use the same Clerk keys for both client and server (they're from the same Clerk application)

