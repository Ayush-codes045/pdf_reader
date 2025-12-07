# Clerk Authentication Setup

## Issue
The application is showing errors because Clerk environment variables are missing.

## Solution

1. **Get your Clerk API keys:**
   - Go to https://dashboard.clerk.com/last-active?path=api-keys
   - Sign up or log in to your Clerk account
   - Create a new application or select an existing one
   - Copy your **Publishable Key** (starts with `pk_`) and **Secret Key** (starts with `sk_`)

2. **Create `.env.local` file in the `client` directory:**
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   ```

3. **Replace the placeholder value** with your actual Clerk publishable key

4. **Restart your Next.js dev server:**
   ```bash
   npm run dev
   ```

## Environment Variables Required

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key (public, safe to expose in client)

**Note:** The middleware has been simplified to only require the publishable key. If you need server-side route protection later, you can add `CLERK_SECRET_KEY` and update the middleware accordingly.

## Optional Environment Variables

If you have custom sign-in/sign-up pages, you can also add:
```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Note
The `.env.local` file is already in `.gitignore`, so your keys won't be committed to version control.

