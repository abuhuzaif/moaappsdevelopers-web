# MOA Apps Developer's — Website

Portfolio homepage + KSA-Connect live listings, built with Next.js and
connected to the same Firebase project as the Flutter app.

## Setup (first time)

1. Install [Node.js](https://nodejs.org) (LTS version) if you don't have it.
2. Open this folder in a terminal and run:
   ```
   npm install
   ```
3. Copy `.env.local.example` to `.env.local`, and fill in your Firebase
   Web config (Firebase Console → Project settings → General → "Your apps"
   → Web app → click the </> icon if you don't have one yet).
4. Run locally to test:
   ```
   npm run dev
   ```
   Then open http://localhost:3000

## Deploying

Push this folder to GitHub, then import the repo in
[vercel.com](https://vercel.com). Add the same environment variables from
`.env.local` in Vercel's project settings (Settings → Environment
Variables) before deploying.
